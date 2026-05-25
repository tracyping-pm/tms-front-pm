import {
  IAdditionalChargeConfirmParams,
  IAdditionalChargeRecordResponse,
  IExceptionListData,
  IPartialPaymentRecordResponse,
  IWaybillBaseInfoData,
  IWaybillBillingBasicData,
  IWaybillBillingData,
  IWaybillLinkStatementData,
} from '@/api/types/waybill';
import {
  additionalChargeConfirm,
  additionalChargeRecord,
  getBasicDetail,
  getWaybillBilling,
  getWaybillException,
  partialPaymentRecord,
  waybillBillingStatement,
} from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import {
  BillingStatusEnumColor,
  BillingStatusText,
  CountryCurrencyEnumText,
  WaybillFinancialStatusEnum,
  WaybillStatusEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { OPS_TYPE, StateContext } from '@/pages/waybill/WaybillDetail/store';
import DetailCard from '@/pages/waybill/components/DetailCard';
import WaybillBillingModal from '@/pages/waybill/components/WaybillBillingModal';
import { formatAmountPercentage } from '@/utils/utils';
import { Access, useAccess, useModel, useParams } from '@umijs/max';
import { App, Badge, Col, Divider, Row } from 'antd';
import cls from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import WaybillAdditionalChargeModal from '../WaybillAdditionalChargeModal';
import WaybillBillingTruckModal from '../WaybillBillingTruckModal';
import WaybillExceptionModal from '../WaybillExceptionModal';
import WaybillLinkStatementModal from '../WaybillLinkStatementModal';
import WaybillPartialPaymentModal from '../WaybillPartialPaymentModal';
import styles from './styles.less';

export default function DetailBillingCard(props: {
  isStandardWaybill: boolean;
}) {
  const { isStandardWaybill } = props;
  const access = useAccess();
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const {
    waybillBasicInfo,
    refreshBilling,
  }: { waybillBasicInfo: IWaybillBaseInfoData; refreshBilling: boolean } =
    state;
  const { id: waybillId } = useParams();
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const [loading, setLoading] = useState<boolean>(true);
  const [showAmount, setShowAmount] = useState<boolean>(false);

  const [editExceptionLoading, setEditExceptionLoading] =
    useState<boolean>(false);
  const [exceptionData, setExceptionData] = useState<IExceptionListData>(
    {} as IExceptionListData,
  );
  const [showException, setShowException] = useState<boolean>(false);
  const [amountLoading, setAmountLoading] = useState<boolean>(false);
  const [amountDetail, setAmountDetail] = useState<IWaybillBillingBasicData>(
    {} as IWaybillBillingBasicData,
  );
  // partial payment
  const [partialPaymentLoading, setPartialPaymentLoading] =
    useState<boolean>(false);
  const [partialPaymentInfo, setPartialPaymentInfo] =
    useState<IPartialPaymentRecordResponse>();
  const [openPartialPayment, setOpenPartialPayment] = useState<boolean>(false);
  // additional charge
  const [additionalChargeLoading, setAdditionalChargeLoading] =
    useState<boolean>(false);
  const [additionalChargeData, setAdditionalChargeData] =
    useState<IAdditionalChargeRecordResponse>(
      {} as IAdditionalChargeRecordResponse,
    );
  const [openAdditionalCharge, setOpenAdditionalCharge] =
    useState<boolean>(false);
  const [additionalChargeConfirmLoading, setAdditionalChargeConfirmLoading] =
    useState<boolean>(false);
  // claim
  // const [showClaim, setShowClaim] = useState<boolean>(false);
  // const [claimLoading, setClaimLoading] = useState<boolean>(false);
  // const [claimDetail, setClaimDetail] = useState<IWaybillBillingClaimData>(
  //   {} as IWaybillBillingClaimData,
  // );
  // statement
  const [showStatement, setShowStatement] = useState<boolean>(false);
  const [statementLoading, setStatementLoading] = useState<boolean>(false);
  const [statementList, setStatementList] = useState<
    IWaybillLinkStatementData[]
  >([]);

  const [billingTruckType, setBillingTruckType] = useState<string>('');
  const [detail, setDetail] = useState<IWaybillBillingData>(
    {} as IWaybillBillingData,
  );

  const TAG_INFO = [
    {
      color: BillingStatusEnumColor.pending,
      text: BillingStatusText.pending,
      des: ' Amount not yet confirmed.',
    },
    {
      color: BillingStatusEnumColor.onHold,
      text: BillingStatusText.onHold,
      des: ' Expense items that require confirmation from the customer or  vendor.',
    },
    {
      color: BillingStatusEnumColor.verified,
      text: BillingStatusText.verified,
      des: 'Amount confirmed by the Pricing department.',
    },
    {
      color: BillingStatusEnumColor.underPaymentPrep,
      text: BillingStatusText.underPaymentPrep,
      des: ' The status of the linked statement is under payment preparation',
    },
    {
      color: BillingStatusEnumColor.underBillingPrep,
      text: BillingStatusText.underBillingPrep,
      des: ' The status of the linked statement is under billing preparation',
    },
    {
      color: BillingStatusEnumColor.awaitCustomerConfirm,
      text: BillingStatusText.awaitCustomerConfirm,
      des: ' The status of the linked statement is Await Customer Confirm',
    },
    {
      color: BillingStatusEnumColor.awaitVendorConfirm,
      text: BillingStatusText.awaitVendorConfirm,
      des: ' The status of the linked statement is Awaiting Vendor Confirmation',
    },
    {
      color: BillingStatusEnumColor.awaitReBill,
      text: BillingStatusText.awaitReBill,
      des: ' The status of the linked statement is await re-bill',
    },
    {
      color: BillingStatusEnumColor.collected,
      text: BillingStatusText.collected,
      des: ' The status of the linked statement is Collected',
    },
    {
      color: BillingStatusEnumColor.unCollected,
      text: BillingStatusText.unCollected,
      des: ' The status of the linked statement is Pending Collection/Partially Collected/Over Collected/Fully Collected',
    },
    {
      color: BillingStatusEnumColor.paid,
      text: BillingStatusText.paid,
      des: ' The status of the linked statement is Paid',
    },
    {
      color: BillingStatusEnumColor.unPaid,
      text: BillingStatusText.unPaid,
      des: ' The status of the linked statement is Pending Payment/Partially paid/Fully paid',
    },

    {
      color: BillingStatusEnumColor.writeOff,
      text: BillingStatusText.writeOff,
      des: ' The status of the linked statement is Write Off',
    },
  ];

  const getDetail = async () => {
    setLoading(true);
    const res = await getWaybillBilling({ id: Number(waybillId) });
    setLoading(false);
    if (res.code === 200) {
      setDetail(res.data || {});
      dispatch({
        type: OPS_TYPE.BILLING_INFO,
        payload: {
          data: res.data || {},
        },
      });
    }
  };

  useEffect(() => {
    getDetail();
  }, [refreshBilling]);

  const getBasicAmount = async () => {
    setAmountLoading(true);
    const res = await getBasicDetail(Number(waybillId));
    setAmountLoading(false);
    if (res.code === 200) {
      setAmountDetail(res.data);
      setShowAmount(true);
    }
  };

  const getExceptionList = async () => {
    setEditExceptionLoading(true);
    const res = await getWaybillException({
      id: Number(waybillId),
    });
    setEditExceptionLoading(false);
    if (res.code === 200) {
      setExceptionData(res.data);
      setShowException(true);
    }
  };

  const doPartialPayment = useCallback(async () => {
    setPartialPaymentLoading(true);
    const { id } = waybillBasicInfo;
    const res = await partialPaymentRecord({ id });
    setPartialPaymentLoading(false);
    if (res.code === 200) {
      setPartialPaymentInfo(res.data ?? {});
      setOpenPartialPayment(true);
    }
  }, [waybillBasicInfo.id]);

  const doAdditionalCharge = useCallback(async () => {
    setAdditionalChargeLoading(true);
    const { id } = waybillBasicInfo;
    const res = await additionalChargeRecord({ id });
    setAdditionalChargeLoading(false);
    if (res.code === 200) {
      setAdditionalChargeData(res.data ?? []);
      setOpenAdditionalCharge(true);
    }
  }, [waybillBasicInfo.id]);

  // const doClaim = useCallback(async () => {
  //   setClaimLoading(true);
  //   const { id } = waybillBasicInfo;
  //   const res = await waybillBillingClaim(id);
  //   setClaimLoading(false);
  //   if (res.code === 200) {
  //     setClaimDetail(res.data ?? {});
  //     setShowClaim(true);
  //   }
  // }, [waybillBasicInfo.id]);

  const doStatement = useCallback(async () => {
    setStatementLoading(true);
    const { id } = waybillBasicInfo;
    const res = await waybillBillingStatement({
      id,
    }).finally(() => {
      setStatementLoading(false);
    });
    if (res.code === 200) {
      setStatementList(res?.data ?? []);
      setShowStatement(true);
    }
  }, [waybillBasicInfo.id]);

  const onAdditionalChargeConfirm = async (
    data: IAdditionalChargeConfirmParams,
  ) => {
    setAdditionalChargeConfirmLoading(true);

    const res = await additionalChargeConfirm(data);
    setAdditionalChargeConfirmLoading(false);
    if (res.code === 200) {
      setOpenAdditionalCharge(false);
      getDetail();
      message.success('Edit Additional Charge successfully!');
    }
  };

  const computeCount = (count: number) => {
    if (isStandardWaybill) {
      if (access[PermissionEnum.STANDARD_WAYBILL_VIEW_AMOUNT]) {
        return `${CountryCurrencyEnumText?.[countryId as number]} ${formatAmountPercentage(count)}`;
      } else {
        return '**';
      }
    } else {
      if (access[PermissionEnum.TEMPORARY_WAYBILL_VIEW_AMOUNT]) {
        return `${CountryCurrencyEnumText?.[countryId as number]} ${formatAmountPercentage(count)}`;
      } else {
        return '**';
      }
    }
  };

  const showEditBtn = useMemo(() => {
    if (waybillBasicInfo.financialStatus && waybillBasicInfo?.status) {
      if (
        (waybillBasicInfo.financialStatus ===
          WaybillFinancialStatusEnum.NOT_STARTED &&
          [
            WaybillStatusEnum.PLANNING,
            WaybillStatusEnum.PENDING,
            WaybillStatusEnum.IN_TRANSIT,
          ].includes(waybillBasicInfo?.status)) ||
        ![
          WaybillFinancialStatusEnum.AWAITING_SETTLEMENT,
          WaybillFinancialStatusEnum.CLOSED,
          WaybillFinancialStatusEnum.SETTLED,
        ].includes(waybillBasicInfo?.financialStatus)
      ) {
        return true;
      }
      return false;
    }
    return false;
  }, [waybillBasicInfo.financialStatus, waybillBasicInfo?.status]);

  return (
    <>
      <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.BILLING}>
        <DetailCard
          title="Billing"
          tagInfo={
            <div className={styles.tagInfo}>
              The status definitions for each settlement item are as follows:
              {TAG_INFO.map((item, index) => {
                return (
                  <div key={index} className={styles.tagInfo_item}>
                    <Badge
                      color={item.color}
                      text={item.text}
                      style={{ fontWeight: 'bold', color: '#fff' }}
                    />
                    {item.des}
                  </div>
                );
              })}
            </div>
          }
          editCallback={() => {
            if (waybillBasicInfo.hasLinkedStatement) {
              message.error(
                'The settlement item is associated with a statement .Editing the billing truck type is not allowed.',
                3,
              );
              return;
            }
            setBillingTruckType('Customer');
          }}
          showEditBtn={
            showEditBtn &&
            (isStandardWaybill
              ? access[PermissionEnum.STANDARD_WAYBILL_TRUCK_TYPE]
              : access[PermissionEnum.TEMPORARY_WAYBILL_TRUCK_TYPE])
          }
          extraBtn={
            <div className={styles.extraBtn}>
              {![
                WaybillFinancialStatusEnum.NOT_STARTED,
                WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
              ].includes(waybillBasicInfo?.financialStatus) ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_LINKED_STATEMENT]
                      : access[
                          PermissionEnum.TEMPORARY_WAYBILL_LINKED_STATEMENT
                        ]
                  }
                >
                  <CustomStatusButton
                    className={styles.extraBtnItem}
                    onClick={doStatement}
                    loading={statementLoading}
                  >
                    Linked Statement
                  </CustomStatusButton>
                </Access>
              ) : null}
              {showEditBtn && (
                <div className={styles.extraBtn}>
                  <Divider type="vertical" />
                  <Access
                    accessible={
                      isStandardWaybill
                        ? access[PermissionEnum.STANDARD_WAYBILL_BILLING_EDIT]
                        : access[PermissionEnum.TEMPORARY_WAYBILL_BILLING_EDIT]
                    }
                  >
                    <CustomStatusButton
                      className={styles.extraBtnItem}
                      onClick={getBasicAmount}
                      loading={amountLoading}
                    >
                      Edit Basic Amount
                    </CustomStatusButton>
                    <Divider type="vertical" />
                  </Access>
                  {/* <Divider type="vertical" /> */}
                  <Access
                    accessible={
                      isStandardWaybill
                        ? access[PermissionEnum.STANDARD_WAYBILL_ADDITIONAL]
                        : access[PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL]
                    }
                  >
                    <CustomStatusButton
                      className={styles.extraBtnItem}
                      onClick={doAdditionalCharge}
                      loading={additionalChargeLoading}
                    >
                      Edit Additional Charge
                    </CustomStatusButton>
                    <Divider type="vertical" />
                  </Access>

                  <Access
                    accessible={
                      isStandardWaybill
                        ? access[PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE]
                        : access[PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE]
                    }
                  >
                    <CustomStatusButton
                      className={styles.extraBtnItem}
                      onClick={getExceptionList}
                      loading={editExceptionLoading}
                    >
                      Edit Exception Fee
                    </CustomStatusButton>
                    <Divider type="vertical" />
                  </Access>

                  {/* <Access
                    accessible={
                      isStandardWaybill
                        ? access[PermissionEnum.STANDARD_WAYBILL_CLAIM]
                        : access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM]
                    }
                  >
                    <CustomStatusButton
                      className={styles.extraBtnItem}
                      onClick={doClaim}
                      loading={claimLoading}
                    >
                      Edit Claim
                    </CustomStatusButton>
                  </Access> */}
                  {/* <Divider type="vertical" /> */}
                  <Access
                    accessible={
                      isStandardWaybill
                        ? access[
                            PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT
                          ]
                        : access[
                            PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT
                          ]
                    }
                  >
                    <CustomStatusButton
                      className={styles.extraBtnItem}
                      onClick={doPartialPayment}
                      loading={partialPaymentLoading}
                    >
                      Partial Payment
                    </CustomStatusButton>
                  </Access>
                  <Divider type="vertical" />
                </div>
              )}
            </div>
          }
          loading={loading}
          child={
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                marginTop: '12px',
                border: '1px solid #d9d9d9',
              }}
            >
              <div className={styles.box}>
                {/* customer */}
                <div className={styles.board}>
                  <div className={styles.board_header}>
                    <div className={styles.board_header_bold}>
                      Contract Revenue
                    </div>
                    <div className={styles.board_header_bold}>
                      {computeCount(detail.waybillReceivableAmount)}
                    </div>
                  </div>
                  <Row className={styles.board_title}>
                    <Col span={12} className={styles.board_item_name_bold}>
                      Customer Billing Truck Type
                    </Col>
                    <Col
                      span={12}
                      className={cls(styles.board_item_name_bold, 'ellipsis')}
                      style={{ textAlign: 'right' }}
                      title={
                        detail.customerTruckTypeActualOrRequired
                          ? `Actual Use Of Truck Type ${detail?.actualTruckType ? `(${detail?.actualTruckType})` : '-'}`
                          : `Customer Required Truck Type ${detail?.requiredTruckType ? `(${detail?.requiredTruckType})` : '-'}`
                      }
                    >
                      {detail.customerTruckTypeActualOrRequired
                        ? `Actual Use Of Truck Type: ${detail?.actualTruckType ? `(${detail?.actualTruckType})` : '-'}`
                        : `Customer Required Truck Type: ${detail?.requiredTruckType ? `(${detail?.requiredTruckType})` : '-'}`}
                    </Col>
                  </Row>
                  <Row className={styles.board_title}>
                    <Col span={8} className={styles.board_item_name_bold}>
                      Basic Amount Receivable
                    </Col>
                    <Col span={8} className={styles.board_item_status}>
                      <Badge
                        color={
                          BillingStatusEnumColor[
                            detail?.basicAmountReceivableStatus
                          ]
                        }
                        text={
                          BillingStatusText[detail?.basicAmountReceivableStatus]
                        }
                        style={{ fontWeight: 'bold' }}
                      />
                    </Col>
                    <Col span={8} className={styles.board_item_num_bold}>
                      {computeCount(detail.basicAmountReceivable)}
                    </Col>
                  </Row>
                  <div className={styles.board_item}>
                    <Row
                      className={`${styles.board_item_line} ${detail.additionalChargeCustomerList?.length ? styles.board_item_border : ''}`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Customer Additional Charge
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              detail?.additionalAmountReceivableStatus
                            ]
                          }
                          text={
                            BillingStatusText[
                              detail.additionalAmountReceivableStatus
                            ]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.additionalAmountReceivable)}
                      </Col>
                    </Row>
                    {detail.additionalChargeCustomerList?.map((a) => (
                      <Row className={styles.board_item_line} key={a.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {a.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(a.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div>
                  <div className={styles.board_item}>
                    <Row
                      className={`${styles.board_item_line} ${detail.exceptionFeeCustomerList?.length ? styles.board_item_border : ''}`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Customer Exception Fee
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              detail?.exceptionFeeReceivableStatus
                            ]
                          }
                          text={
                            BillingStatusText[
                              detail.exceptionFeeReceivableStatus
                            ]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.exceptionFeeReceivable)}
                      </Col>
                    </Row>

                    {detail.exceptionFeeCustomerList?.map((e) => (
                      <Row className={styles.board_item_line} key={e.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {e.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(e.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
                {/* vendor */}
                <div
                  className={styles.board}
                  style={{ borderLeft: '1px solid #d9d9d9' }}
                >
                  <div className={styles.board_header}>
                    <div className={styles.board_header_bold}>
                      Contract Cost
                    </div>
                    <div className={styles.board_header_bold}>
                      {computeCount(detail.waybillPayableAmount)}
                    </div>
                  </div>
                  <Row className={styles.board_title}>
                    <Col span={12} className={styles.board_item_name_bold}>
                      Vendor Billing Truck Type
                    </Col>
                    <Col
                      span={12}
                      className={cls(styles.board_item_name_bold, 'ellipsis')}
                      style={{ textAlign: 'right' }}
                      title={
                        detail?.vendorTruckTypeActualOrRequired
                          ? `Actual Use Of Truck Type: ${detail?.actualTruckType ? `(${detail?.actualTruckType})` : '-'}`
                          : `Customer Required Truck Type: ${detail?.requiredTruckType ? `(${detail?.requiredTruckType})` : '-'}`
                      }
                    >
                      {detail?.vendorTruckTypeActualOrRequired
                        ? `Actual Use Of Truck Type: ${detail?.actualTruckType ? `(${detail?.actualTruckType})` : '-'}`
                        : `Customer Required Truck Type: ${detail?.requiredTruckType ? `(${detail?.requiredTruckType})` : '-'}`}
                    </Col>
                  </Row>
                  <Row className={styles.board_title}>
                    <Col span={8} className={styles.board_item_name_bold}>
                      Paid In advance
                    </Col>
                    <Col span={8} className={styles.board_item_status}>
                      <Badge
                        color={
                          BillingStatusEnumColor[detail?.paidInAdvanceStatus]
                        }
                        text={BillingStatusText[detail.paidInAdvanceStatus]}
                        style={{ fontWeight: 'bold' }}
                      />
                    </Col>
                    <Col span={8} className={styles.board_item_num_bold}>
                      {computeCount(detail.paidInAdvance)}
                    </Col>
                  </Row>
                  <Row className={styles.board_title}>
                    <Col span={8} className={styles.board_item_name_bold}>
                      Basic Amount Payable (Remaining)
                    </Col>
                    <Col span={8} className={styles.board_item_status}>
                      <Badge
                        color={
                          BillingStatusEnumColor[
                            detail?.basicAmountPayableRemainingStatus
                          ]
                        }
                        text={
                          BillingStatusText[
                            detail.basicAmountPayableRemainingStatus
                          ]
                        }
                        style={{ fontWeight: 'bold' }}
                      />
                    </Col>
                    <Col span={8} className={styles.board_item_num_bold}>
                      {computeCount(detail.basicAmountPayableRemaining)}
                    </Col>
                  </Row>
                  <div className={styles.board_item}>
                    <Row
                      className={`${styles.board_item_line} ${detail.additionalChargeVendorList?.length ? styles.board_item_border : ''}`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Vendor Additional Charge
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              detail?.additionalAmountPayableStatus
                            ]
                          }
                          text={
                            BillingStatusText[
                              detail.additionalAmountPayableStatus
                            ]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.additionalAmountPayable)}
                      </Col>
                    </Row>

                    {detail.additionalChargeVendorList?.map((a) => (
                      <Row className={styles.board_item_line} key={a.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {a.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(a.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div>
                  <div className={styles.board_item}>
                    <Row
                      className={`${styles.board_item_line} ${detail.exceptionFeeVendorList?.length ? styles.board_item_border : ''}`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Vendor Exception Fee
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              detail?.exceptionFeePayableStatus
                            ]
                          }
                          text={
                            BillingStatusText[detail.exceptionFeePayableStatus]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.exceptionFeePayable)}
                      </Col>
                    </Row>

                    {detail.exceptionFeeVendorList?.map((e) => (
                      <Row className={styles.board_item_line} key={e.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {e.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(e.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div>

                  {/* <div className={styles.board_item}>
                    <Row
                      className={`${styles.board_item_line} ${detail.claimVendorList?.length ? styles.board_item_border : ''}`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Vendor Claim
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[detail?.claimPayableStatus]
                          }
                          text={BillingStatusText[detail.claimPayableStatus]}
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.claimPayable)}
                      </Col>
                    </Row>

                    {detail.claimVendorList?.map((c) => (
                      <Row className={styles.board_item_line} key={c.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {c.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(c.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div> */}
                </div>
              </div>

              <div className={styles.footer}>
                <span className={styles.footer_text}>Gross Profit</span>
                <span className={styles.footer_text}>
                  <span
                    style={{
                      color: detail.grossProfit <= 0 ? '#FF4D4F' : '#000000D9',
                    }}
                  >
                    {computeCount(detail.grossProfit)}
                  </span>
                </span>
              </div>

              <div className={styles.footer}>
                <span className={styles.footer_text}>Gross Margin</span>
                <span
                  className={styles.footer_text}
                  style={{
                    color: detail.grossMargin <= 0 ? '#FF4D4F' : '#000000D9',
                  }}
                >{`${isStandardWaybill ? (access[PermissionEnum.STANDARD_WAYBILL_VIEW_AMOUNT] ? formatAmountPercentage(detail.grossMargin) : '**') : access[PermissionEnum.TEMPORARY_WAYBILL_VIEW_AMOUNT] ? formatAmountPercentage(detail.grossMargin) : '**'}%`}</span>
              </div>
            </div>
          }
        />
      </div>
      {showAmount ? (
        <WaybillBillingModal
          dispatchType={waybillBasicInfo.dispatchType}
          waybillId={Number(waybillId)}
          defaultData={detail}
          amountDetail={amountDetail}
          hideModal={() => setShowAmount(false)}
          refresh={() => getDetail()}
        />
      ) : null}
      {!!billingTruckType ? (
        <WaybillBillingTruckModal
          detail={detail}
          hideModal={() => setBillingTruckType('')}
          refresh={() => getDetail()}
        />
      ) : null}
      {!!showStatement ? (
        <WaybillLinkStatementModal
          list={statementList}
          hideModal={() => setShowStatement(false)}
        />
      ) : null}
      {showException ? (
        <WaybillExceptionModal
          isStandardWaybill={isStandardWaybill}
          exceptionData={exceptionData}
          hideModal={() => setShowException(false)}
          refresh={() => getDetail()}
        />
      ) : null}
      {openPartialPayment ? (
        <WaybillPartialPaymentModal
          isStandardWaybill={isStandardWaybill}
          waybillStatus={waybillBasicInfo?.status}
          financialStatus={waybillBasicInfo?.financialStatus}
          open={openPartialPayment}
          record={partialPaymentInfo!}
          onCusTomerCancel={() => setOpenPartialPayment(false)}
          refresh={() => {
            getDetail();
          }}
        />
      ) : null}
      {openAdditionalCharge ? (
        <WaybillAdditionalChargeModal
          isStandardWaybill={isStandardWaybill}
          waybillStatus={waybillBasicInfo?.status}
          financialStatus={waybillBasicInfo?.financialStatus}
          open={openAdditionalCharge}
          data={additionalChargeData}
          onConfirm={onAdditionalChargeConfirm}
          modalProps={{
            onCancel: () => setOpenAdditionalCharge(false),
          }}
          submitter={{
            submitButtonProps: {
              loading: additionalChargeConfirmLoading,
            },
          }}
          refresh={() => {
            getDetail();
          }}
        />
      ) : null}
      {/* {showClaim ? (
        <WaybillClaimModal
          isStandardWaybill={isStandardWaybill}
          waybillStatus={waybillBasicInfo?.status}
          open={showClaim}
          detail={claimDetail}
          financialStatus={waybillBasicInfo?.financialStatus}
          cancel={() => setShowClaim(false)}
          refresh={() => {
            getDetail();
          }}
        />
      ) : null} */}
    </>
  );
}
