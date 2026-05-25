import { statementReceiptOrPaymentCreate } from '@/api/billing';
import {
  IStatementReceiptNumberItem,
  IStatementReceiptOrPaymentCreateParams,
} from '@/api/types/billing';
import { ICommonMaterial } from '@/api/types/common';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { CountryCurrencyEnumText, UploadPathTypeEnum } from '@/enums';
import { getNumberRangeList } from '@/utils/utils';
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useModel, useParams } from '@umijs/max';
import {
  App,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { memo, useCallback, useContext, useState } from 'react';
import { EVENT_BILLING_STATEMENT_DETAIL_RELOAD } from '../event';

export default memo(function EnterPaymentModal({
  materialList = [],
  unCollectedAmount = 0,
  onCancel,
  onRefresh,
}: {
  materialList: ICommonMaterial[];
  unCollectedAmount: number;
  onCancel: () => void;
  onRefresh: () => void;
}) {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const { publish } = useContext(PubSubContext);
  const { id: customerStatementId } = useParams();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);

  const buildReceiptNumberList = (
    receiptNumberList: IStatementReceiptNumberItem[],
  ) => {
    const list = receiptNumberList.map((item: IStatementReceiptNumberItem) => {
      if (item.voucherDate || item.voucherNumber) {
        return {
          voucherNumber: item?.voucherNumber,
          voucherDate: item?.voucherDate
            ? dayjs(item.voucherDate).format('YYYY-MM-DD')
            : undefined,
        };
      } else {
        return undefined;
      }
    });
    const result = list.filter((item) => item !== undefined);

    if (result?.length > 0) {
      return result;
    } else {
      return undefined;
    }
  };

  const submit = async (params: any) => {
    const controller = new AbortController();
    const signal = controller.signal;

    const payload: IStatementReceiptOrPaymentCreateParams = {
      statementId: Number(customerStatementId),
      receiptTime: dayjs(params.paymentTime).format('YYYY-MM-DD HH:mm:ss'),
      receiptAmount:
        params.paymentSymbol === 'POSITIVE'
          ? params.paymentAmount
          : params.paymentAmount * -1,
      receiptNumberList: buildReceiptNumberList(params.receiptNumberList),
      materialIds: params.materialIds,
    };

    setLoading(true);
    const res = await statementReceiptOrPaymentCreate({
      data: payload,
      signal,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      message.success('Enter Payment Successfully');
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      onCancel();
      onRefresh();
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Modal
        title={'Add Payment'}
        open={true}
        okText="Ok"
        okButtonProps={{
          htmlType: 'submit',
          loading: loading,
          onClick: () => form.submit(),
        }}
        onCancel={onCancel}
        maskClosable={false}
        width={600}
      >
        <div style={{ fontSize: 14, lineHeight: '22px' }}>
          Please enter the payment amount and credentials
        </div>
        <Form
          name="Enter-Payment"
          form={form}
          layout="vertical"
          autoComplete="off"
          style={{ marginTop: '12px' }}
          initialValues={{
            paymentTime: dayjs(),
            paymentSymbol: 'POSITIVE',
          }}
          onFinish={submit}
        >
          <Form.Item
            name="paymentTime"
            style={{ fontSize: '14px' }}
            label="Payment Time"
            rules={[{ required: true, message: 'Please enter Payment Time' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%', fontSize: '14px' }}
              disabledDate={(currentDate) => {
                return currentDate?.isAfter(dayjs(), 'day');
              }}
              // defaultValue={dayjs()}
              disabledTime={(currentDate: any) => {
                const initTime = dayjs();
                const h = initTime?.hour?.();
                const m = initTime?.minute?.();
                const s = initTime?.second?.();

                const b = currentDate?.isBefore(dayjs(), 'day');

                if (b) {
                  return {
                    disabledHours: () => [],
                    disabledMinutes: () => [],
                    disabledSeconds: () => [],
                  };
                } else {
                  const curH = currentDate?.hour();
                  const curM = currentDate?.minute();

                  if (curH < h || curM < m) {
                    return {
                      disabledHours: () =>
                        getNumberRangeList(0, 24).splice(h + 1, 24),
                      disabledMinutes: () => [],
                      disabledSeconds: () => [],
                    };
                  }

                  return {
                    disabledHours: () =>
                      getNumberRangeList(0, 24).splice(h + 1, 24),
                    disabledMinutes: () =>
                      getNumberRangeList(0, 60).splice(m + 1, 60),
                    disabledSeconds: () =>
                      getNumberRangeList(0, 60).splice(s, 60),
                  };
                }
              }}
            />
          </Form.Item>
          <Form.Item label="Payment Amount" style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Item
                name="paymentSymbol"
                style={{
                  fontSize: '14px',
                  marginBottom: 0,
                }}
              >
                <Select
                  style={{ width: '54px' }}
                  onChange={() => {}}
                  options={[
                    { value: 'NEGATIVE', label: '-' },
                    { value: 'POSITIVE', label: '+' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="paymentAmount"
                style={{
                  fontSize: '14px',
                  marginBottom: 0,
                  flex: 1,
                }}
                rules={[
                  { required: true, message: 'Please enter Payment Amount' },
                  {
                    validator: (rule, value) => {
                      if (Number(value) > 99999999.99) {
                        return Promise.reject(
                          'Payment Amount must be less 99999999.99',
                        );
                      } else if (
                        (form.getFieldValue('paymentSymbol') === 'POSITIVE'
                          ? Number(value)
                          : Number(value) * -1) > unCollectedAmount
                      ) {
                        return Promise.reject(
                          "The total payment  can't exceed the total amount payable",
                        );
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <InputNumber
                  prefix={CountryCurrencyEnumText[countryId as any]}
                  style={{ width: '100%' }}
                  placeholder="Please enter Payment Amount"
                  precision={2}
                  controls={false}
                  formatter={(value) =>
                    `${value}`
                      .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.List
            name="receiptNumberList"
            initialValue={['']}
            rules={[
              {
                validator: async (_, receiptNumberList) => {
                  if (!receiptNumberList || receiptNumberList.length < 1) {
                    return Promise.reject(
                      new Error('At least 1 voucherNumber'),
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
                    <Flex key={field.key} gap={8}>
                      <div style={{ flex: 'auto' }}>
                        <Row gutter={8} style={{ width: '100%' }}>
                          <Col span={12}>
                            <Form.Item
                              {...field}
                              label="Payment Voucher Number"
                              name={[field.name, 'voucherNumber']}
                              key={field.key + 'voucherNumber'}
                              rules={[
                                // {
                                //   required: true,
                                //   message: 'Please enter Voucher Number',
                                // },
                                {
                                  max: MAX_LENGTH.NAME,
                                  message: `Voucher Number cannot exceed ${MAX_LENGTH.NAME} characters`,
                                },
                              ]}
                            >
                              <Input
                                placeholder={`Please enter Voucher Number`}
                                allowClear
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...field}
                              label="Payment Voucher Date"
                              name={[field.name, 'voucherDate']}
                              key={field.key + 'voucherDate'}
                              // rules={[
                              //   {
                              //     required: true,
                              //     message: 'Please enter Voucher Date',
                              //   },
                              // ]}
                            >
                              <DatePicker
                                placeholder="Please select Voucher Date"
                                format={'YYYY-MM-DD'}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <Space size={4}>
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
                      </Space>
                    </Flex>
                  );
                })}
                <div style={{ color: '#ff4d4f' }}>{errors}</div>
              </div>
            )}
          </Form.List>

          <Form.Item
            name="materialIds"
            label={
              <>
                <span>Receipt</span>
                <Tooltip
                  title={
                    'Please upload the proof of payment we made to  the vendor (e.g., checks, transfer records, screenshots showing an increase in our bank account balance, etc.).'
                  }
                  placement="top"
                >
                  <span style={{ margin: '0 2px' }}>
                    <InfoCircleOutlined />
                  </span>
                </Tooltip>
              </>
            }
            rules={[{ required: true, message: 'Please upload Receipt' }]}
          >
            <DraggerUpload
              showModeBar={false}
              materialList={materialList}
              scrollHeight={150}
              dto={{
                entityId: customerStatementId,
                pathType: UploadPathTypeEnum.STATEMENT_RECEIPT,
              }}
              getUploadingSize={getUploadingSize}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
