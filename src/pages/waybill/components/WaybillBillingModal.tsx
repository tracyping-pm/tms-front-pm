import {
  IBillingParams,
  IWaybillBillingBasicData,
  IWaybillBillingData,
} from '@/api/types/waybill';
import { editBilling, editStandardBilling } from '@/api/waybill';
import {
  BillingStatusEnumColor,
  BillingStatusText,
  CountryCurrencyEnumText,
  WaybillDispatchTypeEnum,
} from '@/enums';
import styles from '@/pages/waybill/components/common.less';
import { formatAmountPercentage } from '@/utils/utils';
import { LeftOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { App, Badge, Button, Col, Form, InputNumber, Modal, Row } from 'antd';
import { memo, useRef, useState } from 'react';

export default memo(function WaybillBillingModal(props: {
  defaultData: IWaybillBillingData;
  waybillId: number;
  dispatchType: WaybillDispatchTypeEnum;
  amountDetail: IWaybillBillingBasicData;
  hideModal: () => void;
  refresh: () => void;
}) {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const {
    defaultData,
    waybillId,
    dispatchType,
    amountDetail,
    hideModal,
    refresh,
  } = props;
  const [pending, setPending] = useState<boolean>(false);
  const canEditAmountRef = useRef<boolean>(true);

  const submit = async (params: IBillingParams) => {
    const basicAmountReceivable = `${params.receivable}`
      .replace(/,/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '')
      .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    const basicAmountPayable = `${params.payable}`
      .replace(/,/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '')
      .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    setPending(true);
    const payload: IBillingParams = {
      id: defaultData.id,
      waybillId: waybillId,
      basicAmountReceivable: Number(basicAmountReceivable) || 0,
      basicAmountPayable: Number(basicAmountPayable) || 0,
      customerCanUpdate: amountDetail.customerCanUpdate,
      vendorCanUpdate: amountDetail.vendorCanUpdate,
    };
    let res;
    if (dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH) {
      res = await editStandardBilling({
        ...payload,
        canEditAmount: canEditAmountRef.current,
      });
    } else {
      res = await editBilling(payload);
    }
    setPending(false);
    if (res.code === 200) {
      message.success('Edit successfully!');
      if (res.data?.code === 1) {
        modal.warning({
          title: 'Warning',
          content: res.data.msg,
          okText: 'Confirm',
          cancelButtonProps: {
            style: { display: 'none' },
          },
        });
      }
      hideModal();
      refresh();
    }
  };

  return (
    <Modal
      width={950}
      title={'Edit Basic amount'}
      open={true}
      onCancel={hideModal}
      footer={
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'end',
          }}
        >
          {dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH ? (
            <Button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '102px',
                padding: 0,
              }}
              onClick={() => {
                canEditAmountRef.current = false;
                form?.submit?.();
              }}
            >
              <LeftOutlined />
              Fallback
            </Button>
          ) : null}
          <Button onClick={hideModal}>Cancel</Button>
          <Button
            type="primary"
            loading={pending}
            onClick={() => form?.submit?.()}
          >
            Confirm
          </Button>
        </div>
      }
      maskClosable={false}
    >
      <Form
        name="basic-amount"
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{ marginTop: '12px' }}
        initialValues={{
          receivable: amountDetail?.basicAmountReceivable ?? undefined,
          payable: amountDetail?.basicAmountPayable ?? undefined,
        }}
        onFinish={submit}
      >
        <div className={styles.basicAmount}>
          <Row>
            <Col span={12}>
              <div className={styles.basicAmount_left}>
                <div
                  className={styles.basicAmount_title}
                  style={{ paddingRight: '24px' }}
                >
                  Customer Basic Amount:
                  <Badge
                    color={
                      BillingStatusEnumColor[
                        amountDetail.basicAmountReceivableStatus
                      ]
                    }
                    text={
                      BillingStatusText[
                        amountDetail.basicAmountReceivableStatus
                      ]
                    }
                    style={{ fontWeight: 'bold' }}
                  />
                </div>
                <div>
                  <div
                    className={styles.basicAmount_form}
                    style={{ paddingRight: '24px' }}
                  >
                    <div className={styles.basicAmount_form_label}>
                      Basic Amount Receivable:
                    </div>
                    <Form.Item
                      name="receivable"
                      label={null}
                      style={{ fontSize: '14px' }}
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the number',
                        },
                        {
                          validator: (rule, value) => {
                            if (Number(value) > 99999999.99) {
                              return Promise.reject(
                                'Number must be less 99999999.99',
                              );
                            } else if (Number(value) < 0) {
                              return Promise.reject(
                                'Number must be greater than 0',
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
                        style={{ width: '210px' }}
                        disabled={!amountDetail.customerCanUpdate}
                        placeholder="Please enter the number"
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
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.basicAmount_right}>
                <div className={styles.basicAmount_title}>
                  Vendor Basic Amount:
                  {amountDetail.vendorCanUpdate ? (
                    <Badge
                      color={
                        BillingStatusEnumColor[
                          amountDetail.basicAmountPayableRemainingStatus
                        ]
                      }
                      text={
                        BillingStatusText[
                          amountDetail.basicAmountPayableRemainingStatus
                        ]
                      }
                      style={{ fontWeight: 'bold' }}
                    />
                  ) : null}
                </div>
                {/* Paid in Advance */}
                {!amountDetail.vendorCanUpdate ? (
                  <div style={{ marginBottom: '24px' }}>
                    <div className={styles.basicAmount_form}>
                      <div className={styles.basicAmount_form_label}>
                        Paid in Advance
                      </div>
                      <div className={styles.basicAmount_form_show}>
                        {!amountDetail.vendorCanUpdate ? (
                          <Badge
                            color={
                              BillingStatusEnumColor[
                                amountDetail.paidInAdvanceStatus
                              ]
                            }
                            text={
                              BillingStatusText[
                                amountDetail.paidInAdvanceStatus
                              ]
                            }
                            style={{ fontWeight: 'bold' }}
                          />
                        ) : null}
                        <div>
                          {`${CountryCurrencyEnumText[countryId as any]} ${formatAmountPercentage(amountDetail?.paidInAdvance)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div>
                  <div className={styles.basicAmount_form}>
                    <div className={styles.basicAmount_form_label}>
                      Basic Amount Payable
                    </div>
                    <div
                      className={
                        amountDetail.vendorCanUpdate
                          ? styles.basicAmount_form_input
                          : styles.basicAmount_form_show
                      }
                    >
                      {!amountDetail.vendorCanUpdate ? (
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              amountDetail.basicAmountPayableRemainingStatus
                            ]
                          }
                          text={
                            BillingStatusText[
                              amountDetail.basicAmountPayableRemainingStatus
                            ]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      ) : null}
                      {amountDetail.vendorCanUpdate ? (
                        <Form.Item
                          name="payable"
                          label={null}
                          style={{ fontSize: '14px' }}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter the number',
                            },
                            {
                              validator: (rule, value) => {
                                if (Number(value) > 99999999.99) {
                                  return Promise.reject(
                                    'Number must be less 99999999.99',
                                  );
                                } else if (Number(value) < 0) {
                                  return Promise.reject(
                                    'Number must be greater than 0',
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
                            style={{
                              width: '210px',
                            }}
                            disabled={!amountDetail.vendorCanUpdate}
                            placeholder="Please enter the number"
                            precision={2}
                            controls={false}
                            formatter={(value) =>
                              `${value}`
                                .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                          />
                        </Form.Item>
                      ) : (
                        <div>{`${CountryCurrencyEnumText[countryId as any]} ${formatAmountPercentage(amountDetail?.basicAmountPayable)}`}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
});
