import {
  IAdditionalChargeRecordItem,
  IAdditionalChargeRecordResponse,
} from '@/api/types/waybill';
import { getWaybillAdditionalOptions } from '@/api/waybill';
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
import { Badge, Col, Row } from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './common.less';
type IWaybillAdditionalChargeModal = ModalFormProps & {
  open: boolean;
  isStandardWaybill: boolean;
  waybillStatus: string;
  financialStatus: WaybillFinancialStatusEnum;
  data: IAdditionalChargeRecordResponse;
  onConfirm?: (data: any) => void;
  refresh?: () => void;
};
enum SYMBOL_ENUM {
  POSITIVE = '1',
  NEGATIVE = '-1',
}

const WaybillAdditionalChargeModal: FC<IWaybillAdditionalChargeModal> = ({
  width = 1100,
  open,
  isStandardWaybill,
  waybillStatus,
  financialStatus,
  data,
  modalProps,
  onConfirm,
  ...restProps
}) => {
  const access = useAccess();

  const { id: waybillId } = useParams();

  const { initialState } = useModel('@@initialState');

  const countryId = initialState?.currentUser?.countryId;

  const formRef = useRef<ProFormInstance>();
  const [customers, setCustomers] = useState<IAdditionalChargeRecordItem[]>([]);
  const [vendors, setVendors] = useState<IAdditionalChargeRecordItem[]>([]);

  const [objectOptions, setObjectOptions] = useState<any>({});
  // const [customerOptions, setCustomerOptions] = useState<any>({});
  const getItemOptions = async () => {
    // if (
    //   isStandardWaybill
    //     ? !access[PermissionEnum.STANDARD_WAYBILL_CLAIM_OBJECT_EDIT]
    //     : !access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT]
    // ) {
    //   return;
    // }
    const res = await getWaybillAdditionalOptions();
    if (res.code === 200) {
      let items: any = {};

      res.data?.forEach((item) => {
        items[item] = item;
      });

      setObjectOptions(items);
    }
  };

  const customerStatusOptions = useMemo(() => {
    return {
      pending: 'Pending',
      onHold: 'On Hold',
      verified: 'Verified',
    };
  }, [data.additionalAmountReceivableStatus]);

  const vendorStatusOptions = useMemo(() => {
    return {
      pending: 'Pending',
      onHold: 'On Hold',
      verified: 'Verified',
    };
  }, [data.additionalAmountPayableStatus]);

  const symbolOptions = useMemo(() => {
    return {
      [SYMBOL_ENUM.POSITIVE]: '+',
      [SYMBOL_ENUM.NEGATIVE]: '-',
    };
  }, []);

  const accessValue = useMemo(() => {
    const bol = isStandardWaybill
      ? access[PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_OBJECT_EDIT]
      : access[PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_OBJECT_EDIT];
    return bol;
  }, [waybillStatus, isStandardWaybill]);

  const readonlyBol = useMemo(() => {
    const bol = isStandardWaybill
      ? !access[PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_OBJECT_EDIT]
      : !access[PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_OBJECT_EDIT];

    return bol;
  }, [waybillStatus, isStandardWaybill, financialStatus]);

  const handleOk = async (params: any) => {
    const customerChargeList = customers.map((item) => ({
      item: item.item,
      amount:
        item?.symbol === SYMBOL_ENUM.POSITIVE
          ? item.amount
          : Number(item.amount) * -1,
      // source: item.source ? item.source : undefined,
    }));
    const vendorChargeList = vendors.map((item) => ({
      item: item.item,
      amount:
        item?.symbol === SYMBOL_ENUM.POSITIVE
          ? item.amount
          : Number(item.amount) * -1,
      // source: item.source ? item.source : undefined,
    }));
    onConfirm?.({
      waybillId,
      customerChargeList,
      vendorChargeList,
      additionalAmountReceivableStatus: params.customerStatus,
      additionalAmountPayableStatus: params.vendorStatus,
      customerCanUpdate: data.customerCanUpdate,
      vendorCanUpdate: data.vendorCanUpdate,
    });
  };

  const addItem = (index: number, type: 'customer' | 'vendor') => {
    if (type === 'customer') {
      const newCustomers = [...customers];
      let uuid = uuidv4();
      newCustomers.splice(index, 0, {
        id: uuid,
        item: '',
        amount: undefined,
        symbol: SYMBOL_ENUM.POSITIVE,
        objectType: 'Customer',
        // source: undefined,
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
        objectType: 'Vendor',
        // source: undefined,
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

  useEffect(() => {
    getItemOptions();
    const addLf = data.customerChargeList;
    const addRt = data.vendorChargeList;
    formRef?.current?.setFieldValue(
      'customerStatus',
      data?.additionalAmountReceivableStatus ?? undefined,
    );
    formRef?.current?.setFieldValue(
      'vendorStatus',
      data?.additionalAmountPayableStatus ?? undefined,
    );
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
        data.customerCanUpdate &&
        (isStandardWaybill
          ? access[PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_OBJECT_EDIT]
          : access[PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_OBJECT_EDIT])
      ) {
        const uuid = uuidv4();
        formRef?.current?.setFieldValue('customerClaim' + uuid, '');
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
            objectType: 'Customer',
            // source: undefined,
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
        data.vendorCanUpdate &&
        (isStandardWaybill
          ? access[PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_OBJECT_EDIT]
          : access[PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_OBJECT_EDIT])
      ) {
        console.log(1111111, data);
        const uuid = uuidv4();
        formRef?.current?.setFieldValue('vendorClaim' + uuid, '');
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
            objectType: 'Vendor',
            // source: undefined,
          },
        ]);
      }
    }
  }, [open, data]);

  return (
    <>
      <ModalForm
        name="additional-charge"
        title={'Edit Additional Charge'}
        open={open}
        width={width}
        formRef={formRef}
        modalProps={{
          ...modalProps,
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
                  Customer Additional Charge:
                  {!data.customerCanUpdate ||
                  !Object.keys(customerStatusOptions).length ||
                  (isStandardWaybill
                    ? !access[
                        PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_STATUS_EDIT
                      ]
                    : !access[
                        PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_STATUS_EDIT
                      ]) ? (
                    <Badge
                      color={
                        BillingStatusEnumColor[
                          data.additionalAmountReceivableStatus
                        ]
                      }
                      text={
                        BillingStatusText[data.additionalAmountReceivableStatus]
                      }
                    />
                  ) : (
                    <ProFormSelect
                      name={'customerStatus'}
                      style={{ width: '130px' }}
                      label={null}
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
                    <div className={styles.additional_table_label}>Object</div>
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
                            showSearch
                            rules={[
                              {
                                required: true,
                                message: 'Please select Name',
                              },
                            ]}
                            fieldProps={{
                              disabled: readonlyBol || !data.customerCanUpdate,
                              style: {
                                width: '167px',
                                fontSize: '14px',
                              },
                            }}
                            disabled={readonlyBol || !data.customerCanUpdate}
                            onChange={(e) => {
                              const newCustomers = [...customers];
                              newCustomers.splice(i, 1, {
                                ...c,
                                item: e as any,
                              });
                              setCustomers(newCustomers);
                            }}
                            valueEnum={objectOptions}
                          />
                          {/* <Form.Item
                            name={'customerClaim' + c.id}
                            label={false}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter Name',
                              },
                              {
                                max: MAX_LENGTH.NAME,
                                message: `Name cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
                              },
                            ]}
                          >
                            <CustomFormInput
                              placeholder="Please enter Name"
                              value={c.item}
                              disabled={readonlyBol || !data.customerCanUpdate}
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
                          </Form.Item> */}
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
                              disabled: readonlyBol || !data.customerCanUpdate,
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
                              disabled: readonlyBol || !data.customerCanUpdate,
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
                          {accessValue && data.customerCanUpdate ? (
                            <DeleteOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => deleteItem(i, 'customer')}
                            />
                          ) : null}
                          {i === customers.length - 1 &&
                          accessValue &&
                          data.customerCanUpdate ? (
                            <PlusCircleOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => addItem(i + 1, 'customer')}
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {customers.length === 0 && accessValue ? (
                      <div className={styles.additional_option}>
                        {data.customerCanUpdate ? (
                          <PlusCircleOutlined
                            style={{ color: '#009688', fontSize: '23px' }}
                            onClick={() => addItem(0, 'customer')}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.additional_right}>
                <div className={styles.additional_title}>
                  Vendor Additional Charge:
                  {!data.vendorCanUpdate ||
                  !Object.keys(vendorStatusOptions).length ||
                  (isStandardWaybill
                    ? !access[
                        PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_STATUS_EDIT
                      ]
                    : !access[
                        PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_STATUS_EDIT
                      ]) ? (
                    <Badge
                      color={
                        BillingStatusEnumColor[
                          data.additionalAmountPayableStatus
                        ]
                      }
                      text={
                        BillingStatusText[data.additionalAmountPayableStatus]
                      }
                    />
                  ) : (
                    <ProFormSelect
                      name={'vendorStatus'}
                      style={{ width: '130px' }}
                      label={null}
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
                      valueEnum={vendorStatusOptions}
                    />
                  )}
                </div>
                {vendors.length ? (
                  <div className={styles.additional_table}>
                    <div className={styles.additional_table_label}>Object</div>
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
                            showSearch
                            rules={[
                              {
                                required: true,
                                message: 'Please select Name',
                              },
                            ]}
                            fieldProps={{
                              disabled: readonlyBol || !data.vendorCanUpdate,
                              style: {
                                width: '167px',
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
                            valueEnum={objectOptions}
                          />
                          {/* <Form.Item
                            name={'vendorClaim' + c.id}
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
                              disabled={readonlyBol || !data.vendorCanUpdate}
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
                          </Form.Item> */}
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
                              disabled: readonlyBol || !data.vendorCanUpdate,
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
                              disabled: readonlyBol || !data.vendorCanUpdate,
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
                          {accessValue && data.vendorCanUpdate ? (
                            <DeleteOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => deleteItem(i, 'vendor')}
                            />
                          ) : null}
                          {i === vendors.length - 1 &&
                          accessValue &&
                          data.vendorCanUpdate ? (
                            <PlusCircleOutlined
                              style={{ color: '#009688', fontSize: '23px' }}
                              onClick={() => addItem(i + 1, 'vendor')}
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {vendors.length === 0 && accessValue ? (
                      <div className={styles.additional_option}>
                        {data.vendorCanUpdate ? (
                          <PlusCircleOutlined
                            style={{ color: '#009688', fontSize: '23px' }}
                            onClick={() => addItem(0, 'vendor')}
                          />
                        ) : null}
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

export default WaybillAdditionalChargeModal;
