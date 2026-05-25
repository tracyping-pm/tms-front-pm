import { IExceptionListData, IExceptionListItem } from '@/api/types/waybill';
import { submitWaybillException } from '@/api/waybill';
import CustomFormInput from '@/components/CustomFormInput';
import { MAX_LENGTH } from '@/constants';
import {
  BillingAmountStatusEnumColor,
  BillingStatusEnumColor,
  BillingStatusText,
  CountryCurrencyEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useAccess, useModel, useParams } from '@umijs/max';
import { App, Badge, Col, Form, Row } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './common.less';

type IWaybillModal = ModalFormProps & {
  isStandardWaybill: boolean;
  exceptionData: IExceptionListData;
  hideModal: () => void;
  refresh: () => void;
};
enum SYMBOL_ENUM {
  POSITIVE = '1',
  NEGATIVE = '-1',
}

const WaybillException = ({
  width = 1100,
  isStandardWaybill,
  exceptionData,
  hideModal,
  refresh,
  modalProps,
  ...restProps
}: IWaybillModal) => {
  const access = useAccess();
  const { message } = App.useApp();
  const { id: waybillId } = useParams();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const formRef = useRef<ProFormInstance>();
  const [customers, setCustomers] = useState<IExceptionListItem[]>([]);
  const [vendors, setVendors] = useState<IExceptionListItem[]>([]);

  const customerStatusOptions = useMemo(() => {
    return {
      pending: 'Pending',
      onHold: 'On Hold',
      verified: 'Verified',
    };
  }, [exceptionData.exceptionFeeReceivableStatus]);

  const vendorStatusOptions = useMemo(() => {
    return {
      pending: 'Pending',
      onHold: 'On Hold',
      verified: 'Verified',
    };
  }, [exceptionData.exceptionFeePayableStatus]);

  const symbolOptions = useMemo(() => {
    return {
      [SYMBOL_ENUM.POSITIVE]: '+',
      [SYMBOL_ENUM.NEGATIVE]: '-',
    };
  }, []);

  const addItem = (index: number, type: 'customer' | 'vendor') => {
    if (type === 'customer') {
      const newCustomers = [...customers];
      let uuid = uuidv4();
      newCustomers.splice(index, 0, {
        id: uuid,
        item: '',
        amount: undefined,
        symbol: SYMBOL_ENUM.POSITIVE,
        // source: '',
      });
      formRef?.current?.setFieldValue(
        'customerSymbol' + uuid,
        SYMBOL_ENUM.POSITIVE,
      );
      setCustomers(newCustomers);
    } else {
      const newVendors = [...vendors];
      let uuid = uuidv4();
      newVendors.splice(index, 0, {
        id: uuid,
        item: '',
        amount: undefined,
        symbol: SYMBOL_ENUM.POSITIVE,
        // source: '',
      });
      formRef?.current?.setFieldValue(
        'vendorSymbol' + uuid,
        SYMBOL_ENUM.POSITIVE,
      );
      setVendors(newVendors);
    }
  };

  const deleteItem = (index: number, type: 'customer' | 'vendor') => {
    if (type === 'customer') {
      const newCustomers = [...customers];
      newCustomers.splice(index, 1);
      setCustomers(newCustomers);
    } else {
      const newVendors = [...vendors];
      newVendors.splice(index, 1);
      setVendors(newVendors);
    }
  };

  const submit = async (params: any) => {
    const res = await submitWaybillException({
      waybillId: Number(waybillId),
      customerExceptionFeeList: customers.map((c) => ({
        amount:
          c?.symbol === SYMBOL_ENUM.POSITIVE ? c.amount : Number(c.amount) * -1,
        item: c.item,
        // source: c?.source ? c.source : undefined,
      })),
      vendorExceptionFeeList: vendors.map((v) => ({
        amount:
          v?.symbol === SYMBOL_ENUM.POSITIVE ? v.amount : Number(v.amount) * -1,
        item: v.item,
        // source: v?.source ? v.source : undefined,
      })),
      exceptionFeeReceivableStatus: params?.customerStatus,
      exceptionFeePayableStatus: params?.vendorStatus,
      customerCanUpdate: exceptionData.customerCanUpdate,
      vendorCanUpdate: exceptionData.vendorCanUpdate,
    });
    if (res.code === 200) {
      message.success('Edit Exception Fee successfully!');
      hideModal?.();
      refresh?.();
    }
  };

  useEffect(() => {
    if (exceptionData.waybillId) {
      formRef?.current?.setFieldValue(
        'customerStatus',
        exceptionData?.exceptionFeeReceivableStatus,
      );
      formRef?.current?.setFieldValue(
        'vendorStatus',
        exceptionData?.exceptionFeePayableStatus,
      );
      if (exceptionData.customerExceptionFeeList.length) {
        const newCustomers = exceptionData.customerExceptionFeeList?.map(
          (c) => {
            formRef?.current?.setFieldValue('customerName' + c.id, c.item);
            formRef?.current?.setFieldValue(
              'customerAmount' + c.id,
              !!c.amount ? Math.abs(c.amount) : 0,
            );
            formRef?.current?.setFieldValue(
              'customerSymbol' + c.id,
              c?.amount === undefined || Number(c?.amount) >= 0
                ? SYMBOL_ENUM.POSITIVE
                : SYMBOL_ENUM.NEGATIVE,
            );
            return {
              ...c,
              symbol:
                c?.amount === undefined || Number(c?.amount) >= 0
                  ? SYMBOL_ENUM.POSITIVE
                  : SYMBOL_ENUM.NEGATIVE,
              amount: !!c.amount ? Math.abs(c.amount) : 0,
            };
          },
        );
        setCustomers(newCustomers);
      } else {
        if (
          exceptionData.customerCanUpdate &&
          (isStandardWaybill
            ? access[PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT]
            : access[
                PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
              ])
        ) {
          const uuid = uuidv4();
          formRef?.current?.setFieldValue('customerName' + uuid, '');
          formRef?.current?.setFieldValue(
            'customerSymbol' + uuid,
            SYMBOL_ENUM.POSITIVE,
          );
          setCustomers([
            {
              id: uuid,
              item: '',
              amount: undefined,
              symbol: SYMBOL_ENUM.POSITIVE,
              // source: '',
            },
          ]);
        }
      }
      if (exceptionData.vendorExceptionFeeList.length) {
        const newVendors = exceptionData.vendorExceptionFeeList?.map((v) => {
          formRef?.current?.setFieldValue('vendorName' + v.id, v.item);
          formRef?.current?.setFieldValue(
            'vendorAmount' + v.id,
            !!v.amount ? Math.abs(v.amount) : 0,
          );
          formRef?.current?.setFieldValue(
            'vendorSymbol' + v.id,
            v?.amount === undefined || Number(v?.amount) >= 0
              ? SYMBOL_ENUM.POSITIVE
              : SYMBOL_ENUM.NEGATIVE,
          );
          return {
            ...v,
            symbol:
              v?.amount === undefined || Number(v?.amount) >= 0
                ? SYMBOL_ENUM.POSITIVE
                : SYMBOL_ENUM.NEGATIVE,
            amount: !!v.amount ? Math.abs(v.amount) : 0,
          };
        });
        setVendors(newVendors);
      } else {
        if (
          exceptionData.vendorCanUpdate &&
          (isStandardWaybill
            ? access[PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT]
            : access[
                PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
              ])
        ) {
          const uuid = uuidv4();
          formRef?.current?.setFieldValue('vendorName' + uuid, '');
          formRef?.current?.setFieldValue(
            'vendorSymbol' + uuid,
            SYMBOL_ENUM.POSITIVE,
          );
          setVendors([
            {
              id: uuid,
              item: '',
              amount: undefined,
              symbol: SYMBOL_ENUM.POSITIVE,
              // source: '',
            },
          ]);
        }
      }
    }
  }, [exceptionData]);

  return (
    <>
      <ModalForm
        name="waybill-exception"
        open={true}
        title={'Edit Exception Fee'}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          styles: {
            footer: {
              marginTop: '24px',
            },
          },
        }}
        onFinish={submit}
        {...restProps}
      >
        <div className={styles.exception}>
          <Row>
            <Col
              span={12}
              style={{
                paddingRight: '24px',
                borderRight: '1px solid #0000000f',
              }}
            >
              <div className={styles.exception_left}>
                <div className={styles.exception_title}>
                  Customer Exception Fee:
                  {!exceptionData.customerCanUpdate ||
                  !Object.keys(customerStatusOptions).length ||
                  (isStandardWaybill
                    ? !access[
                        PermissionEnum
                          .STANDARD_WAYBILL_EXCEPTION_FEE_STATUS_EDIT
                      ]
                    : !access[
                        PermissionEnum
                          .TEMPORARY_WAYBILL_EXCEPTION_FEE_STATUS_EDIT
                      ]) ? (
                    <Badge
                      color={
                        BillingStatusEnumColor[
                          exceptionData.exceptionFeeReceivableStatus
                        ]
                      }
                      text={
                        BillingStatusText[
                          exceptionData.exceptionFeeReceivableStatus
                        ]
                      }
                    />
                  ) : (
                    <ProFormSelect
                      name={'customerStatus'}
                      style={{ width: '130px' }}
                      label={null}
                      placeholder={'On Hold'}
                      fieldProps={{
                        optionRender: (option) => {
                          return (
                            <Badge
                              color={
                                //@ts-ignore
                                BillingAmountStatusEnumColor[option.label]
                              }
                              text={option.label}
                            />
                          );
                        },
                        labelRender: (option) => {
                          return (
                            <Badge
                              color={
                                //@ts-ignore
                                BillingAmountStatusEnumColor[option.label]
                              }
                              text={option.label}
                            />
                          );
                        },
                      }}
                      valueEnum={customerStatusOptions}
                    />
                  )}
                </div>
                <div className={styles.exception_table}>
                  <div className={styles.additional_table_label}>Object</div>
                  <div className={styles.additional_table_label}>Amount</div>
                  <div className={styles.additional_table_operate}>Operate</div>
                </div>
                <div className={styles.exception_list}>
                  {customers.map((c, i) => (
                    <div
                      key={c.id}
                      className={styles.exception_item}
                      style={{
                        borderBottom: '1px solid #F0F0F0',
                      }}
                    >
                      <div
                        className={styles.exception_item_label}
                        style={{ borderRight: '1px solid #F0F0F0' }}
                      >
                        <Form.Item
                          name={'customerName' + c.id}
                          label={false}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter Name',
                            },
                            {
                              max: MAX_LENGTH.NAME,
                              message: `Name cannot exceed ${MAX_LENGTH.NAME} characters`,
                            },
                          ]}
                        >
                          <CustomFormInput
                            placeholder="Please enter Name"
                            value={c.item}
                            disabled={
                              !exceptionData.customerCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ])
                            }
                            style={{
                              width: '167px',
                              fontSize: '14px',
                            }}
                            onChange={(e) => {
                              const newCustomers = [...customers];
                              newCustomers.splice(i, 1, {
                                ...c,
                                item: e,
                              });
                              setCustomers(newCustomers);
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div
                        className={styles.exception_item_label}
                        style={{ borderRight: '1px solid #F0F0F0' }}
                      >
                        <ProFormSelect
                          name={'customerSymbol' + c.id}
                          label={null}
                          rules={[
                            {
                              required: true,
                              message: 'Please select',
                            },
                          ]}
                          fieldProps={{
                            disabled:
                              !exceptionData.customerCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]),
                            style: {
                              width: '50px',
                              fontSize: '14px',
                            },
                            onChange: (n) => {
                              const newCustomers = [...customers];
                              newCustomers.splice(i, 1, {
                                ...c,
                                symbol: n as SYMBOL_ENUM,
                              });
                              setCustomers(newCustomers);
                            },
                          }}
                          valueEnum={symbolOptions}
                        />
                        <ProFormDigit
                          name={'customerAmount' + c.id}
                          label={false}
                          rules={[
                            {
                              required: true,
                              message: 'Please fill in the fee',
                            },
                          ]}
                          fieldProps={{
                            value: c.amount,
                            disabled:
                              !exceptionData.customerCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]),
                            style: { width: '108px', fontSize: '14px' },
                            controls: false,
                            precision: 2,
                            prefix: CountryCurrencyEnumText[countryId as any],
                            max: 999999.99,
                            min: -999999.99,
                            onChange: (n) => {
                              const newCustomers = [...customers];
                              newCustomers.splice(i, 1, {
                                ...c,
                                amount: n as number,
                              });
                              setCustomers(newCustomers);
                            },
                          }}
                        />
                      </div>
                      <div className={styles.exception_option}>
                        {exceptionData.customerCanUpdate &&
                        (isStandardWaybill
                          ? access[
                              PermissionEnum
                                .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]
                          : access[
                              PermissionEnum
                                .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]) ? (
                          <DeleteOutlined
                            style={{ color: '#009688', fontSize: '23px' }}
                            onClick={() => deleteItem(i, 'customer')}
                          />
                        ) : null}
                        {i === customers.length - 1 &&
                        exceptionData.customerCanUpdate &&
                        (isStandardWaybill
                          ? access[
                              PermissionEnum
                                .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]
                          : access[
                              PermissionEnum
                                .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]) ? (
                          <PlusCircleOutlined
                            style={{ color: '#009688', fontSize: '23px' }}
                            onClick={() => addItem(i + 1, 'customer')}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 ? (
                    <div className={styles.exception_option}>
                      {exceptionData.customerCanUpdate &&
                      (isStandardWaybill
                        ? access[
                            PermissionEnum
                              .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                          ]
                        : access[
                            PermissionEnum
                              .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                          ]) ? (
                        <PlusCircleOutlined
                          style={{ color: '#009688', fontSize: '23px' }}
                          onClick={() => addItem(0, 'customer')}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </Col>
            <div></div>
            <Col span={12}>
              <div className={styles.exception_right}>
                <div className={styles.exception_title}>
                  Vendor Exception Fee:
                  {!exceptionData.vendorCanUpdate ||
                  !Object.keys(vendorStatusOptions).length ||
                  (isStandardWaybill
                    ? !access[
                        PermissionEnum
                          .STANDARD_WAYBILL_EXCEPTION_FEE_STATUS_EDIT
                      ]
                    : !access[
                        PermissionEnum
                          .TEMPORARY_WAYBILL_EXCEPTION_FEE_STATUS_EDIT
                      ]) ? (
                    <Badge
                      color={
                        BillingStatusEnumColor[
                          exceptionData.exceptionFeePayableStatus
                        ]
                      }
                      text={
                        BillingStatusText[
                          exceptionData.exceptionFeePayableStatus
                        ]
                      }
                    />
                  ) : (
                    <ProFormSelect
                      name={'vendorStatus'}
                      style={{ width: '130px' }}
                      label={null}
                      placeholder={'On Hold'}
                      fieldProps={{
                        // disabled:
                        //   !exceptionData.vendorCanUpdate ||
                        //   !Object.keys(vendorStatusOptions).length,
                        optionRender: (option) => {
                          return (
                            <Badge
                              color={
                                //@ts-ignore
                                BillingAmountStatusEnumColor[option.label]
                              }
                              text={option.label}
                            />
                          );
                        },
                        labelRender: (option) => {
                          return (
                            <Badge
                              color={
                                //@ts-ignore
                                BillingAmountStatusEnumColor[option.label]
                              }
                              text={option.label}
                            />
                          );
                        },
                      }}
                      valueEnum={vendorStatusOptions}
                    />
                  )}
                </div>
                <div className={styles.exception_table}>
                  <div className={styles.additional_table_label}>Object</div>
                  <div className={styles.additional_table_label}>Amount</div>
                  <div className={styles.additional_table_operate}>Operate</div>
                </div>
                <div className={styles.exception_list}>
                  {vendors.map((c, i) => (
                    <div
                      key={c.id}
                      className={styles.exception_item}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div
                        className={styles.exception_item_label}
                        style={{ borderRight: '1px solid #F0F0F0' }}
                      >
                        <Form.Item
                          name={'vendorName' + c.id}
                          label={false}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter Name',
                            },
                            {
                              max: MAX_LENGTH.NAME,
                              message: `Name cannot exceed ${MAX_LENGTH.NAME} characters`,
                            },
                          ]}
                        >
                          <CustomFormInput
                            placeholder="Please enter Name"
                            value={c.item}
                            disabled={
                              !exceptionData.vendorCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ])
                            }
                            style={{
                              width: '167px',
                              fontSize: '14px',
                            }}
                            onChange={(e) => {
                              const newVendors = [...vendors];
                              newVendors.splice(i, 1, {
                                ...c,
                                item: e,
                              });
                              setVendors(newVendors);
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div
                        className={styles.exception_item_label}
                        style={{ borderRight: '1px solid #F0F0F0' }}
                      >
                        <ProFormSelect
                          name={'vendorSymbol' + c.id}
                          label={null}
                          rules={[
                            {
                              required: true,
                              message: 'Please select',
                            },
                          ]}
                          fieldProps={{
                            disabled:
                              !exceptionData.vendorCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]),
                            style: { width: '50px', fontSize: '14px' },
                            onChange: (n) => {
                              const newVendors = [...vendors];
                              newVendors.splice(i, 1, {
                                ...c,
                                symbol: n as SYMBOL_ENUM,
                              });
                              setVendors(newVendors);
                            },
                          }}
                          valueEnum={symbolOptions}
                        />
                        <ProFormDigit
                          name={'vendorAmount' + c.id}
                          label={false}
                          rules={[
                            {
                              required: true,
                              message: 'Please fill in the fee',
                            },
                          ]}
                          fieldProps={{
                            value: c.amount,
                            disabled:
                              !exceptionData.vendorCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                                  ]),
                            style: { width: '108px', fontSize: '14px' },
                            controls: false,
                            precision: 2,
                            prefix: CountryCurrencyEnumText[countryId as any],
                            max: 999999.99,
                            min: -999999.99,
                            onChange: (n) => {
                              const newVendors = [...vendors];
                              newVendors.splice(i, 1, {
                                ...c,
                                amount: n as number,
                              });
                              setVendors(newVendors);
                            },
                          }}
                        />
                      </div>
                      <div className={styles.exception_option}>
                        {exceptionData.vendorCanUpdate &&
                        (isStandardWaybill
                          ? access[
                              PermissionEnum
                                .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]
                          : access[
                              PermissionEnum
                                .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]) ? (
                          <DeleteOutlined
                            style={{ color: '#009688', fontSize: '23px' }}
                            onClick={() => deleteItem(i, 'vendor')}
                          />
                        ) : null}
                        {i === vendors.length - 1 &&
                        exceptionData.vendorCanUpdate &&
                        (isStandardWaybill
                          ? access[
                              PermissionEnum
                                .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]
                          : access[
                              PermissionEnum
                                .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                            ]) ? (
                          <PlusCircleOutlined
                            style={{ color: '#009688', fontSize: '23px' }}
                            onClick={() => addItem(i + 1, 'vendor')}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {vendors.length === 0 ? (
                    <div className={styles.exception_option}>
                      {exceptionData.vendorCanUpdate &&
                      (isStandardWaybill
                        ? access[
                            PermissionEnum
                              .STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                          ]
                        : access[
                            PermissionEnum
                              .TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT
                          ]) ? (
                        <PlusCircleOutlined
                          style={{ color: '#009688', fontSize: '23px' }}
                          onClick={() => addItem(0, 'vendor')}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </ModalForm>
    </>
  );
};

export default WaybillException;
