import {
  IWaybillBillingClaimData,
  IWaybillBillingClaimDataItem,
} from '@/api/types/waybill';
import {
  editWaybillBillingClaim,
  getWaybillBillingClaimOptions,
} from '@/api/waybill';
import { MAX_LENGTH } from '@/constants';
import {
  BillingAmountStatusEnumColor,
  BillingStatusEnumColor,
  BillingStatusText,
  CountryCurrencyEnumText,
  WaybillFinancialStatusEnum,
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
import { App, Badge, Col, Row } from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './common.less';
type IWaybillAdditionalChargeModal = ModalFormProps & {
  open: boolean;
  isStandardWaybill: boolean;
  waybillStatus?: string;
  financialStatus?: WaybillFinancialStatusEnum;
  detail: IWaybillBillingClaimData;
  refresh: () => void;
  cancel: () => void;
};
enum SYMBOL_ENUM {
  POSITIVE = '1',
  NEGATIVE = '-1',
}

const WaybillClaimModal: FC<IWaybillAdditionalChargeModal> = ({
  width = 1200,
  open,
  isStandardWaybill,
  detail,
  refresh,
  cancel,
  ...restProps
}) => {
  const access = useAccess();
  const { message } = App.useApp();
  const { id: waybillId } = useParams();

  const { initialState } = useModel('@@initialState');

  const countryId = initialState?.currentUser?.countryId;

  const formRef = useRef<ProFormInstance>();
  const [customers, setCustomers] = useState<IWaybillBillingClaimDataItem[]>(
    [],
  );
  const [vendors, setVendors] = useState<IWaybillBillingClaimDataItem[]>([]);
  const [vendorOptions, setVendorOptions] = useState<any>({});
  const [customerOptions, setCustomerOptions] = useState<any>({});

  const getItemOptions = async () => {
    if (
      isStandardWaybill
        ? !access[PermissionEnum.STANDARD_WAYBILL_CLAIM_OBJECT_EDIT]
        : !access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT]
    ) {
      return;
    }
    const res = await getWaybillBillingClaimOptions();
    if (res.code === 200) {
      let customerItems: any = {};
      let vendorItems: any = {};
      res.data?.customerClaimItemList?.forEach((item) => {
        customerItems[item] = item;
      });
      res.data?.vendorClaimItemList?.forEach((item) => {
        vendorItems[item] = item;
      });
      setVendorOptions(vendorItems);
      setCustomerOptions(customerItems);
    }
  };

  const customerStatusOptions = useMemo(() => {
    return {
      pending: 'Pending',
      onHold: 'On Hold',
      verified: 'Verified',
    };
  }, [detail.claimReceivableStatus]);

  const vendorStatusOptions = useMemo(() => {
    return {
      pending: 'Pending',
      onHold: 'On Hold',
      verified: 'Verified',
    };
  }, [detail.claimPayableStatus]);

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
        symbol: SYMBOL_ENUM.NEGATIVE,
      });
      formRef?.current?.setFieldValue(
        'customerSymbol' + uuid,
        SYMBOL_ENUM.NEGATIVE,
      );
      setCustomers(newCustomers);
    } else {
      const newVendors = [...vendors];
      let uuid = uuidv4();
      newVendors.splice(index, 0, {
        id: uuid,
        item: '',
        amount: undefined,
        symbol: SYMBOL_ENUM.NEGATIVE,
      });
      formRef?.current?.setFieldValue(
        'vendorSymbol' + uuid,
        SYMBOL_ENUM.NEGATIVE,
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

  const handleOk = async (params: any) => {
    const res = await editWaybillBillingClaim({
      waybillId: Number(waybillId),
      customerClaimList: customers.map((c: any) => ({
        item: c.item,
        amount:
          c?.symbol === SYMBOL_ENUM.POSITIVE
            ? c.amount?.toFixed(2)
            : (c.amount * -1)?.toFixed(2),
      })),
      vendorClaimList: vendors.map((v: any) => ({
        item: v.item,
        amount:
          v?.symbol === SYMBOL_ENUM.POSITIVE
            ? v.amount?.toFixed(2)
            : (v.amount * -1)?.toFixed(2),
      })),
      claimReceivableStatus: params?.customerStatus,
      claimPayableStatus: params?.vendorStatus,
      customerCanUpdate: detail.customerCanUpdate,
      vendorCanUpdate: detail.vendorCanUpdate,
    });
    if (res.code === 200) {
      refresh?.();
      message.success('Edit Claim successfully!');
      cancel();
    }
  };

  useEffect(() => {
    getItemOptions();
    const addLf = detail?.customerClaimList ?? [];
    const addRt = detail.vendorClaimList ?? [];
    formRef?.current?.setFieldValue(
      'customerStatus',
      detail?.claimReceivableStatus,
    );
    formRef?.current?.setFieldValue('vendorStatus', detail?.claimPayableStatus);
    if (addLf.length) {
      const newCustomers = addLf?.map((c) => {
        formRef?.current?.setFieldValue('customerClaim' + c.id, c.item);
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
      });
      setCustomers(newCustomers);
    } else {
      if (
        detail.customerCanUpdate &&
        (isStandardWaybill
          ? access[PermissionEnum.STANDARD_WAYBILL_CLAIM_OBJECT_EDIT]
          : access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT])
      ) {
        const uuid = uuidv4();
        formRef?.current?.setFieldValue('customerClaim' + uuid, '');
        formRef?.current?.setFieldValue(
          'customerSymbol' + uuid,
          SYMBOL_ENUM.NEGATIVE,
        );
        setCustomers([
          {
            id: uuid,
            item: '',
            amount: undefined,
            symbol: SYMBOL_ENUM.NEGATIVE,
          },
        ]);
      }
    }
    if (addRt.length) {
      const newVendors = addRt?.map((v) => {
        formRef?.current?.setFieldValue('vendorClaim' + v.id, v.item);
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
        detail.vendorCanUpdate &&
        (isStandardWaybill
          ? access[PermissionEnum.STANDARD_WAYBILL_CLAIM_OBJECT_EDIT]
          : access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT])
      ) {
        const uuid = uuidv4();
        formRef?.current?.setFieldValue('vendorClaim' + uuid, '');
        formRef?.current?.setFieldValue(
          'vendorSymbol' + uuid,
          SYMBOL_ENUM.NEGATIVE,
        );
        setVendors([
          {
            id: uuid,
            item: '',
            amount: undefined,
            symbol: SYMBOL_ENUM.NEGATIVE,
          },
        ]);
      }
    }
  }, [open, detail]);

  return (
    <>
      <ModalForm
        name="billing-claim"
        title={'Edit Claim'}
        open={open}
        width={width}
        formRef={formRef}
        modalProps={{
          onCancel: cancel,
          okText: 'Confirm',
          forceRender: false,
          destroyOnClose: true,
          maskClosable: false,
          styles: {
            footer: {
              marginTop: '24px',
            },
          },
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <div className={styles.additional}>
          <Row>
            <Col
              span={12}
              style={{
                paddingRight: '24px',
                borderRight: '1px solid #0000000f',
              }}
            >
              <div className={styles.additional_left}>
                <div className={styles.additional_title}>
                  Customer Claim:
                  {!detail.customerCanUpdate ||
                  !Object.keys(customerStatusOptions).length ||
                  (isStandardWaybill
                    ? !access[PermissionEnum.STANDARD_WAYBILL_CLAIM_STATUS_EDIT]
                    : !access[
                        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_STATUS_EDIT
                      ]) ? (
                    <Badge
                      color={
                        BillingStatusEnumColor[detail.claimReceivableStatus]
                      }
                      text={BillingStatusText[detail.claimReceivableStatus]}
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
                {customers.length ? (
                  <div className={styles.additional_table}>
                    <div className={styles.additional_table_claim_label}>
                      Object
                    </div>
                    <div className={styles.additional_table_label}>Amount</div>
                    <div className={styles.additional_table_operate}>
                      Operate
                    </div>
                  </div>
                ) : null}
                {customers.length ? (
                  <div className={styles.additional_list}>
                    {customers.map((c, i) => (
                      <div
                        key={c.id}
                        className={styles.additional_item}
                        style={{
                          borderBottom: '1px solid #F0F0F0',
                        }}
                      >
                        <div
                          className={styles.additional_item_label}
                          style={{ borderRight: '1px solid #F0F0F0' }}
                        >
                          <ProFormSelect
                            name={'customerClaim' + c.id}
                            label={false}
                            placeholder="Please select Name"
                            rules={[
                              {
                                required: true,
                                message: 'Please select Name',
                              },
                              {
                                max: MAX_LENGTH.NAME,
                                message: `Name cannot exceed ${MAX_LENGTH.NAME} characters`,
                              },
                            ]}
                            disabled={
                              !detail.customerCanUpdate ||
                              (isStandardWaybill
                                ? !access[
                                    PermissionEnum
                                      .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                                  ]
                                : !access[
                                    PermissionEnum
                                      .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
                                  ])
                            }
                            fieldProps={{
                              style: {
                                width: '220px',
                                fontSize: '14px',
                              },
                            }}
                            onChange={(e) => {
                              const newCustomers = [...customers];
                              newCustomers.splice(i, 1, {
                                ...c,
                                item: e as any,
                              });
                              setCustomers(newCustomers);
                            }}
                            valueEnum={customerOptions}
                          />
                        </div>
                        <div
                          className={styles.additional_item_label}
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
                                !detail.customerCanUpdate ||
                                (isStandardWaybill
                                  ? !access[
                                      PermissionEnum
                                        .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                                    ]
                                  : !access[
                                      PermissionEnum
                                        .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
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
                                !detail.customerCanUpdate ||
                                (isStandardWaybill
                                  ? !access[
                                      PermissionEnum
                                        .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                                    ]
                                  : !access[
                                      PermissionEnum
                                        .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
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
                        <div className={styles.additional_option}>
                          {detail.customerCanUpdate &&
                          (isStandardWaybill
                            ? access[
                                PermissionEnum
                                  .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                              ]
                            : access[
                                PermissionEnum
                                  .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
                              ]) ? (
                            <DeleteOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => deleteItem(i, 'customer')}
                            />
                          ) : null}
                          {i === customers.length - 1 &&
                          detail.customerCanUpdate &&
                          (isStandardWaybill
                            ? access[
                                PermissionEnum
                                  .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                              ]
                            : access[
                                PermissionEnum
                                  .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
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
                      <div className={styles.additional_item}>
                        <div className={styles.additional_option}>
                          {detail.customerCanUpdate &&
                          (isStandardWaybill
                            ? access[
                                PermissionEnum
                                  .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                              ]
                            : access[
                                PermissionEnum
                                  .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
                              ]) ? (
                            <PlusCircleOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => addItem(0, 'customer')}
                            />
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.additional_right}>
                <div className={styles.additional_title}>
                  Vendor Claim:
                  {!detail.vendorCanUpdate ||
                  !Object.keys(vendorStatusOptions).length ||
                  (isStandardWaybill
                    ? !access[PermissionEnum.STANDARD_WAYBILL_CLAIM_STATUS_EDIT]
                    : !access[
                        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_STATUS_EDIT
                      ]) ? (
                    <Badge
                      color={BillingStatusEnumColor[detail.claimPayableStatus]}
                      text={BillingStatusText[detail.claimPayableStatus]}
                    />
                  ) : (
                    <ProFormSelect
                      name={'vendorStatus'}
                      style={{ width: '130px' }}
                      label={null}
                      placeholder={'On Hold'}
                      fieldProps={{
                        optionRender: (option) => {
                          return (
                            <Badge
                              color={
                                // @ts-ignore
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
                {vendors.length ? (
                  <div className={styles.additional_table}>
                    <div className={styles.additional_table_claim_label}>
                      Object
                    </div>
                    <div className={styles.additional_table_label}>Amount</div>
                    <div className={styles.additional_table_operate}>
                      Operate
                    </div>
                  </div>
                ) : null}
                {vendors.length ? (
                  <div className={styles.additional_list}>
                    {vendors.map((c, i) => (
                      <div
                        key={c.id}
                        className={styles.additional_item}
                        style={{
                          borderBottom: '1px solid #F0F0F0',
                        }}
                      >
                        <div
                          className={styles.additional_item_label}
                          style={{ borderRight: '1px solid #F0F0F0' }}
                        >
                          <ProFormSelect
                            name={'vendorClaim' + c.id}
                            placeholder="Please select Name"
                            label={false}
                            rules={[
                              {
                                required: true,
                                message: 'Please select Name',
                              },
                              {
                                max: MAX_LENGTH.NAME,
                                message: `Name cannot exceed ${MAX_LENGTH.NAME} characters`,
                              },
                            ]}
                            fieldProps={{
                              disabled:
                                !detail.vendorCanUpdate ||
                                (isStandardWaybill
                                  ? !access[
                                      PermissionEnum
                                        .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                                    ]
                                  : !access[
                                      PermissionEnum
                                        .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
                                    ]),
                              style: {
                                width: '220px',
                                fontSize: '14px',
                              },
                              onChange: (e) => {
                                const newVendors = [...vendors];
                                newVendors.splice(i, 1, {
                                  ...c,
                                  item: e as any,
                                });
                                setVendors(newVendors);
                              },
                            }}
                            valueEnum={vendorOptions}
                          />
                        </div>
                        <div
                          className={styles.additional_item_label}
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
                                !detail.vendorCanUpdate ||
                                (isStandardWaybill
                                  ? !access[
                                      PermissionEnum
                                        .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                                    ]
                                  : !access[
                                      PermissionEnum
                                        .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
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
                                !detail.vendorCanUpdate ||
                                (isStandardWaybill
                                  ? !access[
                                      PermissionEnum
                                        .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                                    ]
                                  : !access[
                                      PermissionEnum
                                        .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
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
                        <div className={styles.additional_option}>
                          {detail.vendorCanUpdate &&
                          (isStandardWaybill
                            ? access[
                                PermissionEnum
                                  .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                              ]
                            : access[
                                PermissionEnum
                                  .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
                              ]) ? (
                            <DeleteOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => deleteItem(i, 'vendor')}
                            />
                          ) : null}
                          {i === vendors.length - 1 &&
                          detail.vendorCanUpdate &&
                          (isStandardWaybill
                            ? access[
                                PermissionEnum
                                  .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                              ]
                            : access[
                                PermissionEnum
                                  .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
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
                      <div className={styles.additional_item}>
                        <div className={styles.additional_option}>
                          {detail.vendorCanUpdate &&
                          (isStandardWaybill
                            ? access[
                                PermissionEnum
                                  .STANDARD_WAYBILL_CLAIM_OBJECT_EDIT
                              ]
                            : access[
                                PermissionEnum
                                  .TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT
                              ]) ? (
                            <PlusCircleOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => addItem(0, 'vendor')}
                            />
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Col>
          </Row>
        </div>
      </ModalForm>
    </>
  );
};

export default WaybillClaimModal;
