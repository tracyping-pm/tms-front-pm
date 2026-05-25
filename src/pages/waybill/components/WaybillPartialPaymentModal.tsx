import { IPartialPaymentRecordResponse } from '@/api/types/waybill';
import { partialPaymentEditRecord } from '@/api/waybill';
import { CountryCurrencyEnumText, WaybillFinancialStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount } from '@/utils/utils';
import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { Tooltip, message } from 'antd';
import { debounce, default as lodash } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './common.less';
type IWaybillPartialPaymentModal = ModalFormProps & {
  open: boolean;
  isStandardWaybill: boolean;
  waybillStatus: string;
  financialStatus: WaybillFinancialStatusEnum;
  record: IPartialPaymentRecordResponse;
  refresh?: () => void;
  onCusTomerCancel?: () => void;
};

const WaybillPartialPaymentModal: FC<IWaybillPartialPaymentModal> = ({
  width = 480,
  open,
  isStandardWaybill,
  waybillStatus,
  financialStatus,
  record,
  modalProps,
  refresh,
  onCusTomerCancel,
  ...restProps
}) => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const formRef = useRef<ProFormInstance>();
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [tooltipError, setTooltipError] = useState<boolean>(false);
  const [initData, setInitData] =
    useState<Partial<IPartialPaymentRecordResponse>>(record);

  const init = useCallback(
    async (values: IPartialPaymentRecordResponse) => {
      formRef.current?.setFieldsValue({
        ...values,
      });
    },
    [record],
  );
  const allWaybill = record.basicAmountPayable;
  const reset = useCallback(() => {
    formRef.current?.resetFields();
  }, []);

  const handleOk = async (values: any) => {
    const { id, waybillId, basicAmountPayable } = record;
    const {
      percentageOfHandlingFee,
      percentageOfPaidInAdvance,
      percentageOfRegularPayments,
      handlingFee,
      paidInAdvance,
      regularPayments,
    } = values;
    if (
      typeof percentageOfHandlingFee === 'undefined' ||
      typeof percentageOfPaidInAdvance === 'undefined'
    ) {
      return;
    }
    if (confirmStatus) {
      return;
    }

    const payload = {
      percentageOfHandlingFee: Number(percentageOfHandlingFee.toFixed(2)),
      percentageOfPaidInAdvance: Number(percentageOfPaidInAdvance.toFixed(2)),
      percentageOfRegularPayments: Number(
        percentageOfRegularPayments.toFixed(2),
      ),
      handlingFee: Number(handlingFee.toFixed(2)),
      paidInAdvance: Number(paidInAdvance.toFixed(2)),
      regularPayments: Number(regularPayments.toFixed(2)),
      id,
      waybillId,
      basicAmountPayable: Number(basicAmountPayable.toFixed(2)),
      canUpdate: record.canUpdate,
    };
    const res = await partialPaymentEditRecord(payload);
    if (res.code === 200) {
      setInitData(payload);
      message.success('Partial Payment Successfully!');
      onCusTomerCancel?.();
      refresh?.();
    }
  };

  const formPercentageDateHandle = (
    percentType: keyof typeof initData,
    amountType: keyof typeof initData,
  ) => {
    const values = formRef.current?.getFieldsValue();
    const {
      handlingFee,
      paidInAdvance,
      percentageOfHandlingFee,
      percentageOfPaidInAdvance,
    } = values;
    console.log(
      'formPercentageDateHandle',
      paidInAdvance,
      percentageOfPaidInAdvance,
      percentType,
      amountType,
    );

    if (
      lodash.isUndefined(values[percentType]) ||
      lodash.isNull(values[percentType])
    ) {
      return;
    }

    if (percentageOfHandlingFee + percentageOfPaidInAdvance > 100) {
      message.error('Out of range');
      // 之和超过一百percentage初始化为初值

      const amount = amountType === 'handlingFee' ? paidInAdvance : handlingFee;
      const percentage =
        percentType === 'percentageOfHandlingFee'
          ? percentageOfPaidInAdvance
          : percentageOfHandlingFee;
      const amountPayments = Number(
        //@ts-ignore
        (allWaybill - amount - initData[amountType]).toFixed(2),
      );
      //@ts-ignore
      const percentagePayments = Number(
        //@ts-ignore
        (100 - percentage - initData[percentType]).toFixed(2),
      );
      formRef.current?.setFieldsValue({
        [percentType]: initData[percentType],
        [amountType]: initData[amountType],
        regularPayments: amountPayments,
        percentageOfRegularPayments: percentagePayments,
      });

      setConfirmStatus(true);
      return;
    }

    setConfirmStatus(false);
    // 计算对应amount
    const amountAdvance = Number(
      (allWaybill * (percentageOfPaidInAdvance / 100)).toFixed(2),
    );
    const amountFee = Number(
      (allWaybill * (percentageOfHandlingFee / 100)).toFixed(2),
    );
    const amountPayments = Number(
      (allWaybill - amountAdvance - amountFee).toFixed(2),
    );

    formRef.current?.setFieldsValue({
      percentageOfRegularPayments: Number(
        (100 - percentageOfHandlingFee - percentageOfPaidInAdvance).toFixed(2),
      ),

      paidInAdvance: amountAdvance,
      handlingFee: amountFee,
      regularPayments: amountPayments,
    });
  };

  const formAmountDateHandle = (
    amountType: keyof typeof initData,
    percentageType: keyof typeof initData,
  ) => {
    const values = formRef.current?.getFieldsValue();

    const {
      handlingFee,
      paidInAdvance,
      percentageOfHandlingFee,
      percentageOfPaidInAdvance,
    } = values;

    if (
      lodash.isUndefined(values[amountType]) ||
      lodash.isNull(values[amountType])
    ) {
      return;
    }

    if (handlingFee + paidInAdvance > allWaybill) {
      message.error('Out of range');
      const amount = amountType === 'handlingFee' ? paidInAdvance : handlingFee;
      const percentage =
        percentageType === 'percentageOfHandlingFee'
          ? percentageOfPaidInAdvance
          : percentageOfHandlingFee;
      const amountPayments = Number(
        //@ts-ignore
        (allWaybill - amount - initData[amountType]).toFixed(2),
      );
      const percentagePayments = Number(
        //@ts-ignore
        (100 - percentage - initData[percentageType]).toFixed(2),
      );
      formRef.current?.setFieldsValue({
        [amountType]: initData[amountType],
        [percentageType]: initData[percentageType],
        regularPayments: amountPayments,
        percentageOfRegularPayments: percentagePayments,
      });

      setConfirmStatus(true);
      return;
    }

    setConfirmStatus(false);
    // 计算对应amount
    const percentageAdvance = Number(
      ((paidInAdvance / allWaybill) * 100).toFixed(2),
    );
    const percentageFee = Number(((handlingFee / allWaybill) * 100).toFixed(2));
    const percentagePayments = Number(
      (100 - percentageAdvance - percentageFee).toFixed(2),
    );

    formRef.current?.setFieldsValue({
      regularPayments: Number(
        (allWaybill - handlingFee - paidInAdvance).toFixed(2),
      ),

      percentageOfPaidInAdvance: percentageAdvance,
      percentageOfHandlingFee: percentageFee,
      percentageOfRegularPayments: percentagePayments,
    });
    if (percentageAdvance > 50) {
      setTooltipError(true);
    } else {
      setTooltipError(false);
    }
  };

  const readonlyBol = useMemo(() => {
    const bol = isStandardWaybill
      ? !access[PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_EDIT]
      : !access[PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_EDIT];

    return bol;
  }, [waybillStatus, isStandardWaybill, financialStatus]);

  useEffect(() => {
    if (open) {
      init(record);
    } else {
      reset();
    }
  }, [open, record]);

  return (
    <>
      <ModalForm
        name="waybill-partial-payment"
        className={styles.paymentModelText}
        title={'Partial Payment'}
        open={open}
        width={width}
        layout="horizontal"
        labelAlign="left"
        // @ts-ignore
        formRef={formRef}
        onFinish={handleOk}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => {
            onCusTomerCancel?.();
          },
        }}
        {...restProps}
      >
        <div className={styles.payItemHeader}>
          <div className={styles.payItemHeaderItem}>Object</div>
          <div className={styles.payItemHeaderItem}>Percentage</div>
          <div>Amount</div>
        </div>
        <div className={styles.payList}>
          <div className={styles.payItem}>
            <div>Paid in advance</div>
            <div>
              {/* <Form.Item
                name={'percentageOfPaidInAdvance'}
                help={false}
                rules={[
                  {
                    required: true,
                    message: 'Please enter',
                  },
                  {
                    type: 'number',
                    max: 50,
                    min: 0,
                    message: `The advance payment  can't exceed 50% of basic amount`,
                  },
                ]}
              >
                <WithErrorTip>
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled={!record.canUpdate}
                    controls={false}
                    precision={2}
                    suffix="%"
                    min={0}
                    onChange={debounce(() => {
                      formPercentageDateHandle(
                        'percentageOfPaidInAdvance',
                        'paidInAdvance',
                      );
                    }, 200)}
                  />
                </WithErrorTip>
              </Form.Item> */}

              <Tooltip
                title="The advance payment  can't exceed 50% of basic amount"
                color="#F5222D"
                open={tooltipError}
              >
                <ProFormDigit
                  name="percentageOfPaidInAdvance"
                  disabled={readonlyBol}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter',
                    },
                    {
                      type: 'number',
                      max: 100,
                      min: 0,
                      message: `Out of range`,
                    },
                  ]}
                  fieldProps={{
                    disabled: !record.canUpdate,
                    controls: false,
                    precision: 2,
                    suffix: '%',
                    min: 0,
                    onBlur: () => {
                      const values = formRef.current?.getFieldsValue();
                      if (values?.percentageOfPaidInAdvance > 50) {
                        setTooltipError(true);
                      } else {
                        setTooltipError(false);
                      }
                    },
                    onChange: debounce(() => {
                      formPercentageDateHandle(
                        'percentageOfPaidInAdvance',
                        'paidInAdvance',
                      );
                    }, 200),
                  }}
                />
              </Tooltip>
            </div>
            <div>
              <ProFormDigit
                name="paidInAdvance"
                rules={[
                  {
                    required: true,
                    message: 'Please enter',
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: `Out of range`,
                  },
                ]}
                disabled={readonlyBol}
                fieldProps={{
                  disabled: !record.canUpdate,
                  controls: false,
                  prefix: CountryCurrencyEnumText[countryId as any],
                  precision: 2,
                  formatter: (v: any) => formatAmount(v),
                  onChange: debounce(() => {
                    formAmountDateHandle(
                      'paidInAdvance',
                      'percentageOfPaidInAdvance',
                    );
                  }, 200),
                }}
              />
            </div>
          </div>
          <div className={styles.payItem}>
            <div>handling fee</div>
            <div>
              <ProFormDigit
                name="percentageOfHandlingFee"
                disabled={readonlyBol}
                rules={[
                  {
                    required: true,
                    message: 'Please enter',
                  },
                  {
                    type: 'number',
                    max: 100,
                    message: `Out of range`,
                  },
                ]}
                fieldProps={{
                  disabled: !record.canUpdate,
                  controls: false,
                  precision: 2,
                  suffix: '%',
                  min: 0,
                  onChange: debounce(() => {
                    formPercentageDateHandle(
                      'percentageOfHandlingFee',
                      'handlingFee',
                    );
                  }, 200),
                }}
              />
            </div>
            <div>
              <ProFormDigit
                name="handlingFee"
                disabled={readonlyBol}
                rules={[
                  {
                    required: true,
                    message: 'Please enter',
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: `Out of range`,
                  },
                ]}
                fieldProps={{
                  disabled: !record.canUpdate,
                  controls: false,
                  formatter: (v: any) => formatAmount(v),
                  prefix: CountryCurrencyEnumText[countryId as any],
                  precision: 2,
                  min: 0,
                  onChange: debounce(() => {
                    formAmountDateHandle(
                      'handlingFee',
                      'percentageOfHandlingFee',
                    );
                  }, 200),
                }}
              />
            </div>
          </div>
          <div className={styles.payItem} style={{ borderBottom: 'none' }}>
            <div>Regular Payments</div>
            <div>
              <ProFormDigit
                disabled
                name="percentageOfRegularPayments"
                fieldProps={{
                  suffix: '%',
                  precision: 2,
                }}
              />
            </div>
            <div>
              <ProFormDigit
                disabled
                name="regularPayments"
                fieldProps={{
                  formatter: (v: any) => formatAmount(v),
                  prefix: CountryCurrencyEnumText[countryId as any],
                  precision: 2,
                }}
              />
            </div>
          </div>
        </div>
      </ModalForm>
    </>
  );
};

export default WaybillPartialPaymentModal;
