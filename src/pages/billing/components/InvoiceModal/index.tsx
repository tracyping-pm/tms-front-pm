import { statementInvoiceCreate, statementInvoiceEdit } from '@/api/billing';
import { IStatementInvoiceParam } from '@/api/types/billing';
import { ICommonMaterial } from '@/api/types/common';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { extractJson, getPartByUri } from '@/components/CustomUpload/genAI';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { UploadPathTypeEnum } from '@/enums';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { GoogleGenAI, PartUnion } from '@google/genai';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  App,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  ModalProps,
  Row,
  Space,
  Tag,
} from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { isArray, uniq } from 'lodash';
import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_INVOICE_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_RELOAD,
  EVENT_INVOICE_LIST_RELOAD,
} from '../event';
import { IStatementMaterialListItem } from '../FileMaterialList/ListItem';
import styles from './index.less';
import { PROMPT_INVOICE_OCR } from './prompt';

// const VATOptions = [
//   { label: `${EnumVAT.ZERO}%`, value: EnumVAT.ZERO },
//   { label: `${EnumVAT.SEVEN}%`, value: EnumVAT.SEVEN },
//   { label: `${EnumVAT.EXEMPT}`, value: EnumVAT.EXEMPT },
// ];

// const WHTOptions = [
//   { label: `${EnumWHT.ZERO}%`, value: EnumWHT.ZERO },
//   { label: `${EnumWHT.ONE}%`, value: EnumWHT.ONE },
//   { label: `${EnumWHT.THREE}%`, value: EnumWHT.THREE },
// ];

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface IState {
  isEdit: boolean;
  uploading: boolean;
  aiGenning: boolean;
  submitting: boolean;
  okBtnText: string;
}

const initialState: IState = {
  isEdit: false,
  uploading: false,
  aiGenning: false,
  submitting: false,
  okBtnText: 'Ok',
};

export interface IInvoiceModal extends ModalProps {
  defaultData?: IStatementMaterialListItem;
  materialList?: ICommonMaterial[];
  onCancel: () => void;
}

const InvoiceModal: FC<IInvoiceModal> = ({
  open,
  defaultData,
  materialList = [],
  onCancel,
  ...restProps
}) => {
  const { message } = App.useApp();
  // const { initialState: userInfo } = useModel('@@initialState');
  // const countryId = userInfo?.currentUser?.countryId;
  // const isTH = countryId === CountryMapEnum.Thailand;
  const { id: statementId } = useParams();
  const { publish } = useContext(PubSubContext);
  const [form] = Form.useForm();
  const [state, setState] = useSetState<IState>(initialState);
  const usedFileListRef = useRef<number[]>([]);

  const doOCR = useCallback(async (contentPart: PartUnion[]) => {
    contentPart.unshift(PROMPT_INVOICE_OCR);
    setState({ aiGenning: true, okBtnText: 'Waiting OCR Genning...' });
    const result = await ai.models
      .generateContent({
        // 此模型每分钟免费配额5次，已知可用模型中最大，先用这个
        // https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas?hl=zh-cn&inv=1&invt=AbtjiA&project=cd-development-center&pageState=(%22allQuotasTable%22:(%22s%22:%5B(%22i%22:%22displayDimensions%22,%22s%22:%220%22),(%22i%22:%22effectiveLimit%22,%22s%22:%220%22),(%22i%22:%22currentUsage%22,%22s%22:%220%22),(%22i%22:%22currentPercent%22,%22s%22:%220%22),(%22i%22:%22displayName%22,%22s%22:%220%22)%5D,%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22equest%2520limit%2520per%2520model%2520per%2520minute%2520for%2520a%2520project%2520in%2520the%2520free%2520tier_5C_22_22%257D%255D%22,%22p%22:0))
        model: 'gemini-2.5-flash',
        // @ts-ignore
        contents: contentPart,
        config: {
          temperature: 2,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseModalities: [],
          responseMimeType: 'text/plain',
        },
      })
      .finally(() => {
        setState({ aiGenning: false, okBtnText: 'Ok' });
      });

    const text = result.text ?? '{}';
    const cleanJson = extractJson(text);
    console.log({ cleanJson });
    if (isArray(cleanJson)) {
      if (cleanJson.length > 0) {
        const oldInvoiceNumberList =
          form.getFieldValue('invoiceNumberList') ?? [];
        const hasValueOldInvoiceNumberList =
          oldInvoiceNumberList.filter(Boolean);
        const newInvoiceNumberList = cleanJson.map(
          (item) => item.invoiceNumber,
        );
        const allInvoices = [
          ...hasValueOldInvoiceNumberList,
          ...newInvoiceNumberList,
        ];
        // 去重

        const uniqList = uniq(allInvoices).map((item) => {
          if (item?.invoiceNumber) {
            return item;
          }
          return {
            invoiceNumber: item,
            invoiceDate: undefined,
            statementInvoiceNumberId: undefined,
          };
        });
        console.log(uniqList);
        form.setFieldsValue({
          invoiceNumberList: uniqList,
        });
      } else {
        // do nothing
      }
    }
  }, []);

  const onMaterialsChange = useCallback(
    async (_fileMaterialIdList: number[], _materialList: ICommonMaterial[]) => {
      const allSettled: Array<Promise<any>> = [];
      const contentPart: PartUnion[] = [];

      _materialList?.forEach((material) => {
        if (!usedFileListRef.current.includes(material.fileMaterialId)) {
          usedFileListRef.current.push(material.fileMaterialId);
          if (material.file_2) {
            allSettled.push(
              getPartByUri(material.file_2.uri!, material.file_2.mimeType!),
            );
          }
        }
      });

      setState({ aiGenning: true });
      Promise.allSettled(allSettled)
        .then((values) => {
          values?.forEach((value) => {
            if (value.status === 'fulfilled') {
              contentPart.push(value.value);
            }
          });
        })
        .finally(() => {
          setState({ aiGenning: false });
          if (contentPart.length > 0) {
            doOCR(contentPart);
          }
        });
    },
    [usedFileListRef],
  );

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setState({ uploading: true, okBtnText: 'Waiting All File Uploading...' });
    } else {
      setState({ uploading: false, okBtnText: 'Ok' });
    }
  }, []);

  const validateDuplicate = useCallback((invoiceNumberList: string[]) => {
    let hasDuplicate = false;
    if (invoiceNumberList.length > 0) {
      const duplicateMap = new Map();
      invoiceNumberList.forEach((invoiceNumber: string, index: number) => {
        if (duplicateMap.has(invoiceNumber)) {
          const list = duplicateMap.get(invoiceNumber);
          list.push(index);
        } else {
          duplicateMap.set(invoiceNumber, [index]);
        }
      });
      for (const [, value] of duplicateMap) {
        if (value.length > 1) {
          hasDuplicate = true;

          value.forEach((index: number) => {
            const name = ['invoiceNumberList', index, 'label'];
            form?.setFields([
              {
                name,
                errors: ['Duplicate invoice number'],
              },
            ]);
          });
        }
      }
    }

    return hasDuplicate;
  }, []);

  const onOk = useCallback(async () => {
    await form.validateFields();
    const formValues = form.getFieldsValue();
    const { invoiceNumberList = [], materialIds = [] } = formValues;
    const numberList = invoiceNumberList?.map(
      (item: { invoiceNumber: string; invoiceDate: string }) => {
        return item.invoiceNumber;
      },
    );
    const hasDuplicate = validateDuplicate(numberList);
    if (hasDuplicate) {
      return;
    }
    setState({ submitting: true });

    const payloadInvoiceNumberList = invoiceNumberList?.map(
      (item: {
        invoiceNumber: string;
        invoiceDate: string;
        statementInvoiceNumberId: number;
      }) => {
        return {
          statementInvoiceNumberId: item?.statementInvoiceNumberId,
          invoiceNumber: item.invoiceNumber,
          invoiceDate: dayjs(item.invoiceDate).format('YYYY-MM-DD'),
        };
      },
    );

    const payload: IStatementInvoiceParam = state.isEdit
      ? {
          statementInvoiceId: defaultData?.id,
          materialIds,
          invoiceNumberList: payloadInvoiceNumberList,
          // vat,
          // wht,
        }
      : {
          statementId: +statementId!,
          materialIds,
          invoiceNumberList: payloadInvoiceNumberList,
          // vat,
          // wht,
        };

    // console.log(payload, 'payload');

    const apiMethod = state.isEdit
      ? statementInvoiceEdit
      : statementInvoiceCreate;

    const res = await apiMethod(payload).finally(() => {
      setState({ submitting: false });
    });
    if (res?.code === 200) {
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      publish(EVENT_INVOICE_LIST_RELOAD);
      publish(EVENT_BILLING_STATEMENT_WAYBILL_INVOICE_RELOAD);
      publish(EVENT_BILLING_STATEMENT_WAYBILL_RELOAD);
      message.success(`${state.isEdit ? 'Edit' : 'Add'} Invoice successfully!`);
      onCancel();
    }
  }, [state, defaultData]);

  useEffect(() => {
    if (open) {
      const materialIds = defaultData?.materialVoList.map(
        (material) => material.fileMaterialId,
      );
      const invoiceNumberList = defaultData?.invoiceNumberList?.map(
        (item: any) => {
          return {
            ...item,
            invoiceDate: item.invoiceDate ? dayjs(item.invoiceDate) : undefined,
          };
        },
      );
      form.setFieldsValue({ materialIds, invoiceNumberList });
      if (defaultData?.id) {
        setState({ isEdit: true });
        // form.setFieldsValue({
        //   vat: defaultData?.vat,
        //   wht: defaultData?.wht,
        // });
      } else {
        setState({ isEdit: false });
      }
    } else {
      form.resetFields();
    }
  }, [open]);

  return (
    <>
      <div className={cls('invoice-modal', styles.invoiceModal)}>
        <Modal
          {...restProps}
          open={open}
          title={state.isEdit ? 'Edit Invoice' : 'Add Invoice'}
          destroyOnClose
          maskClosable={false}
          width={562}
          onOk={onOk}
          onCancel={onCancel}
          confirmLoading={
            state.uploading || state.aiGenning || state.submitting
          }
          okText={state.okBtnText}
        >
          <Form name="invoice-form" form={form} layout="vertical">
            <Form.Item
              name="materialIds"
              label="Invoice Proof"
              rules={[
                { required: true, message: 'Please upload Invoice Proof' },
              ]}
            >
              <DraggerUpload
                withGenAI={true}
                showModeBar={true}
                materialList={materialList}
                scrollHeight={150}
                dto={{
                  entityId: statementId,
                  pathType: UploadPathTypeEnum.STATEMENT_INVOICE,
                }}
                getUploadingSize={getUploadingSize}
                onChange={onMaterialsChange}
              />
            </Form.Item>

            <>
              <Form.List
                name="invoiceNumberList"
                initialValue={['']}
                rules={[
                  {
                    validator: async (_, invoiceNumberList) => {
                      if (!invoiceNumberList || invoiceNumberList.length < 1) {
                        return Promise.reject(
                          new Error('At least 1 invoiceNumber'),
                        );
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {fields.map((field) => {
                      return (
                        <div
                          className={cls(
                            'invoice-ocr-item',
                            styles.invoiceOcrItem,
                          )}
                          key={field.key}
                        >
                          <Row gutter={8} style={{ width: '100%' }}>
                            <Col span={12}>
                              <Form.Item
                                {...field}
                                label={
                                  <Space size={8}>
                                    Invoice Number
                                    <Tag
                                      style={{
                                        color: 'var(--primary-color)',
                                        borderColor: '#5BBDA9',
                                        backgroundColor: '#EEF6F4',
                                      }}
                                    >
                                      AI OCR
                                    </Tag>
                                  </Space>
                                }
                                name={[field.name, 'invoiceNumber']}
                                key={field.key + 'invoiceNumber'}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter Invoice Number',
                                  },
                                  {
                                    max: MAX_LENGTH.NAME,
                                    message: `Invoice Number cannot exceed ${MAX_LENGTH.NAME} characters`,
                                  },
                                  {
                                    pattern: /^[A-Za-z0-9]+$/,
                                    message:
                                      'Only one invoice number can be entered at a time. Only numbers and letters are supported. Special characters are not allowed.',
                                  },
                                ]}
                              >
                                <Input
                                  placeholder={`Please enter Invoice Number`}
                                  allowClear
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...field}
                                label="Invoice Date"
                                name={[field.name, 'invoiceDate']}
                                key={field.key + 'invoiceDate'}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter Invoice Date',
                                  },
                                ]}
                              >
                                <DatePicker
                                  placeholder="Please select Invoice Date"
                                  format={'YYYY-MM-DD'}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <div className="btn-group">
                            {fields.length > 1 ? (
                              <Button
                                color="danger"
                                variant="text"
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(field.name)}
                              />
                            ) : null}

                            <Button
                              color="default"
                              variant="text"
                              icon={<PlusCircleOutlined />}
                              onClick={() => add()}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className={styles.fakeErrors}>{errors}</div>
                  </div>
                )}
              </Form.List>
            </>

            {/* {isTH ? (
              <>
                <Form.Item
                  name={'vat'}
                  label="VAT Rate for Invoice"
                  rules={[{ required: true, message: 'Please select VAT' }]}
                >
                  <Select placeholder="VAT" options={VATOptions} />
                </Form.Item>

                <Form.Item
                  name={'wht'}
                  label="WHT Rate for Invoice"
                  rules={[{ required: true, message: 'Please select WHT' }]}
                >
                  <Select placeholder="WHT" options={WHTOptions} />
                </Form.Item>
              </>
            ) : null} */}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default InvoiceModal;
