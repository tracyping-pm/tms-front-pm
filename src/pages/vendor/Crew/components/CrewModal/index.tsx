import { checkUnderReview } from '@/api/application';
import {
  crewAdd,
  crewCheckDuplicate,
  crewDefaultCategory,
  crewUpdate,
} from '@/api/crew';
import { getCountryPhone } from '@/api/customer';
import { ICrewDefaultCategory, ICrewDetail } from '@/api/types/crew';
import { IPhoneSelectOptionsItem } from '@/api/types/customer';
import { IDocumentListItem, IDriverListItem } from '@/api/types/truck';
import { IVendorDetail } from '@/api/types/vendor';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  CREW_TYPE,
  DEFAULT_COUNTRY_PHONE_CODE,
  MAX_LENGTH,
} from '@/constants';
import { PROMPT_ID_OCR, PROMPT_LICENSE_OCR } from '@/constants/prompt';
import { ApplicationTypeEnum, UploadPathTypeEnum } from '@/enums';
import { formatString } from '@/utils/format';
import { ProFormText } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  App,
  Checkbox,
  Col,
  Divider,
  Form,
  Modal,
  ModalProps,
  Row,
  Select,
  Spin,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import AccreditationUpload from '../../../components/AccreditationUpload';
import {
  accreditationValidator,
  FILE_CATEGORY_WITH_GEN_AI,
} from '../../../components/AccreditationUpload/constants';
import OcrFormInput from '../OcrFormInput';

import CrewCreateCheckModal from './CrewCreateCheckModal';

type ICrewModal = ModalProps & {
  vendorId?: number;
  record?: ICrewDetail;
  vendorDetail?: IDriverListItem | IVendorDetail;
  hideModal: () => void;
  refresh: () => void;
};

const CrewModal = ({
  vendorId,
  width = 1094,
  record,
  hideModal,
  refresh,
}: ICrewModal) => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');

  const [form] = Form.useForm();
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const countryOcrFieldObj = FILE_CATEGORY_WITH_GEN_AI[countryId];
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [categoryList, setCategoryList] = useState<ICrewDefaultCategory[]>([]);
  const [codeOption, setCodeOption] = useState<any>(null);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [idNumberDuplicate, setIdNumberDuplicate] = useState<boolean>(false);
  const [createCheckModalOpen, setCreateCheckModalOpen] =
    useState<boolean>(false);
  const [createCheckModalLoading, setCreateCheckModalLoading] =
    useState<boolean>(false);
  const [checkRecord, setCheckRecord] = useState<{
    id: number;
    number: string;
  }>();

  const [ocrResultObj, setOcrResultObj] = useSetState<{
    idNumber: string;
    licenseNumber: string;
  }>({
    idNumber: '',
    licenseNumber: '',
  });
  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      if (record?.phoneCodeId) {
        const findOption = res.data?.find(
          (item) => item.value === record.phoneCodeId,
        );
        form?.setFieldValue('areaCode', findOption?.value);
        setCodeOption(findOption);
      } else {
        form?.setFieldValue(
          'areaCode',
          DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
        );
        setCodeOption(DEFAULT_COUNTRY_PHONE_CODE[countryId]);
      }
    }
  };

  const submit = async () => {
    const params = form?.getFieldsValue();
    let res;
    setCreateCheckModalLoading(true);

    if (record?.id) {
      const payload = {
        id: record.id,
        name: formatString(params.crewName),
        driverFlag: params.type?.includes(CREW_TYPE.DRIVER) as boolean,
        helperFlag: params.type?.includes(CREW_TYPE.HELPER) as boolean,
        idNumber: params.idNumber,
        phoneCode: codeOption.show,
        phoneCodeId: params.areaCode,
        phoneNum: params.contactPhoneNum as string,
        licenseNumber: params.licenseNumber as string,
      };

      res = await crewUpdate(payload);
    } else {
      const list = categoryList.map((item) => {
        const obj = params[item.id];
        return {
          fileCategory: item.fileCategory,
          validDateStart: obj?.validDateStart,
          validDateEnd: obj?.validDateEnd,
          validIndefinitely: obj?.validIndefinitely,
          materialIdList: obj?.materialIdList,
        };
      });
      const payload = {
        name: formatString(params.crewName),
        driverFlag: params.type?.includes(CREW_TYPE.DRIVER) as boolean,
        helperFlag: params.type?.includes(CREW_TYPE.HELPER) as boolean,
        idNumber: params.idNumber as string,
        phoneCode: codeOption.show,
        phoneCodeId: params.areaCode,
        phoneNum: params.contactPhoneNum as string,
        licenseNumber: params.licenseNumber as string,
        documentList: list as IDocumentListItem[],
        vendorId: vendorId,
      };
      res = await crewAdd(payload);
      setSubmitLoading(false);
    }
    setSubmitLoading(false);
    setCreateCheckModalLoading(false);
    if (res.code === 200) {
      message.success(`${record?.id ? 'Edit' : 'Add'} successfully`);
      setCreateCheckModalOpen(false);
      refresh();
      hideModal();
    }
  };

  const getDefaultCategory = async (v: boolean) => {
    setCategoryLoading(true);
    const res = await crewDefaultCategory(v);
    setCategoryLoading(false);
    if (res.code === 200) {
      setCategoryList(res.data);
    }
  };

  const onCheckboxChange = (v: CREW_TYPE[]) => {
    if (record?.id) return;
    getDefaultCategory(v.includes(CREW_TYPE.DRIVER));
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setSubmitLoading(true);
    } else {
      setSubmitLoading(false);
    }
  }, []);

  const checkIdNumber = async (value: string) => {
    if (!value) return;
    const payload = {
      id: record?.id,
      idNumber: value,
    };

    const nameFieldError = await form?.getFieldError?.('idNumber');
    if (nameFieldError?.length) {
      return;
    }
    const res = await crewCheckDuplicate(payload);
    if (res?.code === 200) {
      setIdNumberDuplicate(res.data);
      form?.setFields([
        {
          name: 'idNumber',
          errors: res.data ? ['Existed Crew'] : [],
        },
      ]);
    }
  };

  const onFinish = async () => {
    const FieldError = await form?.getFieldsError?.();
    const hasError = FieldError?.some((item) => item.errors?.length);
    if (hasError) {
      return;
    }

    const params = form?.getFieldsValue();
    setSubmitLoading(true);
    const res = await checkUnderReview({
      type: ApplicationTypeEnum.CREW,
      bizIdentifier: formatString(params.idNumber),
    });

    if (res.data) {
      setSubmitLoading(false);
      setCheckRecord(res.data);
      setCreateCheckModalOpen(true);
    } else {
      await submit();
    }
  };
  useEffect(() => {
    getCityCode();
  }, []);

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        crewName: record.name,
        type: [
          record.driverFlag ? CREW_TYPE.DRIVER : '',
          record.helperFlag ? CREW_TYPE.HELPER : '',
        ],
        idNumber: record.idNumber,
        areaCode: record.phoneCode,
        contactPhoneNum: record.phoneNum,
        licenseNumber: record.licenseNumber,
      });
    }
  }, [record]);

  const prefixSelector = (
    <Form.Item name="areaCode" noStyle>
      <Select
        style={{ width: 92, textAlign: 'left' }}
        options={codeList}
        optionLabelProp="show"
        popupMatchSelectWidth={false}
        onChange={(value, option) => setCodeOption(option)}
      ></Select>
    </Form.Item>
  );

  return (
    <>
      <Modal
        open={true}
        title={`${record?.id ? 'Edit' : 'Create'} Crew`}
        width={width}
        maskClosable={false}
        forceRender={true}
        onOk={() => {
          form.submit();
        }}
        onCancel={hideModal}
        okButtonProps={{
          loading: submitLoading,
        }}
      >
        <Form
          name="crew-modal"
          form={form}
          layout="horizontal"
          autoComplete="off"
          style={{ marginTop: '12px' }}
          onFinish={onFinish}
          // layout="horizontal"
        >
          <Spin spinning={categoryLoading}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Type"
                  name="type"
                  rules={[
                    {
                      required: true,
                      message: 'Please select Type',
                    },
                  ]}
                >
                  <Checkbox.Group onChange={onCheckboxChange}>
                    <Checkbox value={CREW_TYPE.DRIVER}>
                      {CREW_TYPE.DRIVER}
                    </Checkbox>
                    <Checkbox value={CREW_TYPE.HELPER}>
                      {CREW_TYPE.HELPER}
                    </Checkbox>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
            <Divider plain>Basic Information</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ProFormText
                  name="crewName"
                  label="Crew Name"
                  placeholder="Crew Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter Crew Name',
                    },
                    {
                      whitespace: true,
                      message: 'Cannot only contain spaces',
                    },
                    {
                      max: MAX_LENGTH.LONG_NAME,
                      message: `Crew Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                    },
                  ]}
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  name="contactPhoneNum"
                  label="Contact"
                  placeholder="Contact"
                  fieldProps={{
                    addonBefore: prefixSelector,
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter contact',
                    },
                    {
                      max: MAX_LENGTH.PASSWORD,
                      message: `Contact cannot exceed ${MAX_LENGTH.PASSWORD} characters`,
                    },
                    {
                      validator: (rule, value) => {
                        const areaCode = form?.getFieldValue('areaCode');
                        if (areaCode !== 167 && areaCode !== 214) {
                          return Promise.resolve();
                        }
                        const findOption = codeList?.find(
                          (item) => item.value === areaCode,
                        );
                        const phoneNumber = findOption?.show + value;
                        const mobileReg =
                          COUNTRY_PHONE_REGULAR_EXPRESSION[countryId].mobile;
                        const phoneReg =
                          COUNTRY_PHONE_REGULAR_EXPRESSION[countryId].phone;
                        if (
                          mobileReg.test(phoneNumber) ||
                          phoneReg.test(phoneNumber)
                        ) {
                          return Promise.resolve();
                        } else {
                          return Promise.reject(
                            'Please enter the correct phone number',
                          );
                        }
                      },
                    },
                  ]}
                />
              </Col>
            </Row>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="ID Number:"
                  name="idNumber"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter ID Number:',
                    },
                    {
                      max: MAX_LENGTH.NAME,
                      message: `ID Number cannot exceed ${MAX_LENGTH.NAME} characters`,
                    },
                    {
                      validator: () => {
                        if (idNumberDuplicate) {
                          return Promise.reject(new Error('Existed Crew'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  labelAlign="left"
                  labelCol={{ span: 6 }}
                >
                  <OcrFormInput
                    fieldProps={{ placeholder: 'ID Number' }}
                    ocrResult={ocrResultObj.idNumber}
                    onBlur={(v) => {
                      checkIdNumber(v);
                    }}
                    onChange={() => {
                      setIdNumberDuplicate(false);
                    }}
                    showTag={!record?.id}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="License Number:"
                  name="licenseNumber"
                  rules={[
                    {
                      required: form
                        .getFieldValue('type')
                        ?.includes(CREW_TYPE.DRIVER),
                      message: 'Please enter License Number',
                    },
                    {
                      max: MAX_LENGTH.NAME,
                      message: `License Number cannot exceed ${MAX_LENGTH.NAME} characters`,
                    },
                  ]}
                  layout="horizontal"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                >
                  <OcrFormInput
                    fieldProps={{ placeholder: 'License' }}
                    ocrResult={ocrResultObj.licenseNumber}
                    showTag={!record?.id}
                  />
                </Form.Item>
              </Col>
            </Row>
            {!record?.id && categoryList.length > 0 ? (
              <>
                <Divider plain>Accreditation</Divider>
                <p>At this step, you can skip the required fields for now.</p>
                <Row gutter={24}>
                  {categoryList.length > 0
                    ? categoryList.map((category) => {
                        const fieldKey: 'idNumber' | 'licenseNumber' =
                          countryOcrFieldObj[category.id];
                        const withGenAI = !!fieldKey;
                        const prompt =
                          fieldKey === 'idNumber'
                            ? PROMPT_ID_OCR
                            : PROMPT_LICENSE_OCR;

                        return (
                          <Col span={12} key={category.id}>
                            <Form.Item
                              label=""
                              name={category.id}
                              rules={[
                                {
                                  validator(_rule, value) {
                                    //@ts-ignore
                                    return accreditationValidator(value);
                                  },
                                },
                              ]}
                            >
                              <AccreditationUpload
                                withGenAI={withGenAI}
                                totalMaxUploadCount={withGenAI ? 1 : Infinity}
                                prompt={prompt}
                                label={category.fileCategory}
                                fileCategory={category.fileCategory}
                                required={category.required}
                                getUploadingSize={getUploadingSize}
                                materialList={[]}
                                dto={{
                                  customParamMap: {
                                    fileCategory: category.fileCategory,
                                  },
                                  pathType: UploadPathTypeEnum.CREW,
                                }}
                                onGenAIChange={(ocrResult: string) => {
                                  // @ts-ignore
                                  setOcrResultObj({ [fieldKey]: ocrResult });
                                }}
                              />
                            </Form.Item>
                          </Col>
                        );
                      })
                    : null}
                </Row>
              </>
            ) : null}
          </Spin>
        </Form>
      </Modal>
      {createCheckModalOpen ? (
        <CrewCreateCheckModal
          record={checkRecord!}
          loading={createCheckModalLoading}
          onSaveTruck={() => {
            submit();
          }}
          hideModal={() => {
            setCreateCheckModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

export default CrewModal;
