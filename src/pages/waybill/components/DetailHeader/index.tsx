import { IImageState, ISourceImage } from '@/api/types/common';
import { IWaybillRejectParams } from '@/api/types/waybill';
import {
  checkShippingRecord,
  checkSubmit,
  getWaybillLog,
  toStart,
  toSubmit,
  waybillCancelCheck,
  waybillConfirmDelivery,
  waybillConfirmPodReceipt,
  waybillConfirmPrice,
  waybillConfirmVerification,
  waybillReject,
} from '@/api/waybill';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import OperationLogModal, {
  IOperationLogModalState,
  initialOperationLogModalState,
} from '@/components/OperationLogModal';
import { LAYOUT_HEADER_HEIGHT, PATHS, initialImageState } from '@/constants';
import {
  WaybillFinancialStatusEnum,
  WaybillReasonEnum,
  WaybillStatusEnum,
  WaybillStatusEnumIcon,
} from '@/enums';
import { EnumClaimTicketType } from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import ConfirmWaybillModal from '@/pages/waybill/components/DetailHeader/ConfirmWaybillModal';
import { WaybillTruckIcon } from '@/pages/waybill/components/DetailHeader/WaybillTruckIcon';
import styles from '@/pages/waybill/components/DetailHeader/styles.less';
import WaybillReasonModal from '@/pages/waybill/components/WaybillReasonModal';
import { openNewTag } from '@/utils/utils';
import {
  CloseCircleOutlined,
  ExclamationCircleFilled,
  LineChartOutlined,
} from '@ant-design/icons';
import { Access, useAccess, useModel, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Affix, App, Button } from 'antd';
import { memo, useCallback, useContext, useState } from 'react';
import { ReactComponent as IconFinancialStatus } from '../../../../../public/svg/waybill_financial_status.svg';
import { ReactComponent as IconFinancialStatusNotStarted } from '../../../../../public/svg/waybill_financial_status_notStarted.svg';
import { ReactComponent as IconFinancialStatusSettled } from '../../../../../public/svg/waybill_financial_status_settled.svg';
import { OPS_TYPE, StateContext } from '../../WaybillDetail/store';
import WaybillRejectModal from '../WaybillRejectModal';
import ConfirmRouteModal from './ConfirmRouteModal';

export default memo(function DetailHeader(props: {
  isStandardWaybill: boolean;
}) {
  const access = useAccess();

  const { message, modal } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const countryId = (initialState?.currentUser?.countryId as number) ?? 1;
  const [showReject, setShowReject] = useState<boolean>(false);
  const [rejectConfirmLoading, setRejectConfirmLoading] =
    useState<boolean>(false);

  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const { id: waybillId } = useParams();
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const {
    waybillBasicInfo,
    billingInfo,
    refreshBilling,
    refreshBasicInfo,
    showRecord,
  } = state;
  const { isStandardWaybill } = props;

  const [showBillingModal, setShowBillingModal] = useState<boolean>(false);

  const [showReason, setShowReason] = useState<WaybillReasonEnum>(
    WaybillReasonEnum.NULL,
  );
  const [confirmRouteModalState, setConfirmRouteModalState] = useSetState({
    loading: false,
    open: false,
    mapJsonStr: '',
  });

  const [submitPending, setSubmitPending] = useState<boolean>(false);
  const [startPending, setStartPending] = useState<boolean>(false);
  const [podPending, setPodPending] = useState<boolean>(false);
  const [confirmVerificationLoading, setConfirmVerificationLoading] =
    useState<boolean>(false);
  const [confirmPriceLoading, setConfirmPriceLoading] =
    useState<boolean>(false);
  const [confirmPodReceiptLoading, setConfirmPodReceiptLoading] =
    useState<boolean>(false);
  const [showCancelLoading, setShowCancelLoading] = useState<boolean>(false);
  const [rejectTitle, setRejectTitle] = useState<string>('');

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await getWaybillLog({ id: Number(waybillId) });
    setOperationLogModalState({ loading: false });

    if (res.code === 200) {
      const list =
        res.data?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          description: item.description,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, [waybillId]);

  // const doConfirmRoute = async () => {
  //   setConfirmRouteModalState({ loading: true });
  //   const res = await waybillMapJsonStr({ id: Number(waybillId) });
  //   setConfirmRouteModalState({ loading: false });
  //   if (res.code === 200) {
  //     setConfirmRouteModalState({
  //       open: true,
  //       mapJsonStr: res.data,
  //     });
  //   }
  // };

  const updateBasicInfo = () => {
    // 更新basicInfo
    dispatch({
      type: OPS_TYPE.REFRESH_BASIC_INFO,
      payload: {
        data: !refreshBasicInfo,
      },
    });
  };

  const updateBilling = () => {
    // 更新basicInfo
    dispatch({
      type: OPS_TYPE.REFRESH_BILLING,
      payload: {
        data: !refreshBilling,
      },
    });
  };

  // submit
  const waybillSubmit = async () => {
    setSubmitPending(true);
    const check = await checkSubmit({ id: Number(waybillId) });
    let res;
    if (check.code === 200) {
      switch (check.data) {
        case 0:
          modal.confirm({
            title: 'Submit Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Confirm submitting the waybill.',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
              res = await toSubmit({ id: Number(waybillId) });
              setSubmitPending(false);
              if (res.code === 200) {
                if (res.data?.code === 1) {
                  modal.warning({
                    title: 'Warning',
                    content: res.data.msg,
                    okText: 'Confirm',
                    cancelButtonProps: {
                      style: { display: 'none' },
                    },
                  });
                  updateBasicInfo();
                  updateBilling();
                } else {
                  message.success('Submit successfully!');
                  updateBasicInfo();
                  updateBilling();
                }
              }
            },
            onCancel() {
              setSubmitPending(false);
            },
          });
          break;
        case 1:
          modal.confirm({
            title: 'Submit Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Please complete the route information of the waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
          setSubmitPending(false);
          break;
        case 2:
          modal.confirm({
            title: 'Submit Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Please complete the carrier information of the waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
          setSubmitPending(false);
          break;
        case 3:
          modal.confirm({
            title: 'Submit Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Please complete the billing information of the waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
          setSubmitPending(false);
          break;
        case 4:
          modal.confirm({
            title: 'Submit Confirm',
            icon: <ExclamationCircleFilled />,
            content:
              'Route does not have a specific address, you can choose a route through Plan Route',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
          setSubmitPending(false);
          break;
        case 5:
          modal.confirm({
            title: 'Submit Confirm',
            icon: <ExclamationCircleFilled />,
            content:
              'Route does not have a specific address, you can choose a route through Plan Route',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
            onOk: async () => {
              res = await toSubmit({ id: Number(waybillId) });
              setSubmitPending(false);
              if (res.code === 200) {
                if (res.data?.code === 1) {
                  modal.warning({
                    title: 'Warning',
                    content: res.data.msg,
                    okText: 'Confirm',
                    cancelButtonProps: {
                      style: { display: 'none' },
                    },
                  });
                  updateBasicInfo();
                  updateBilling();
                } else {
                  message.success('Submit successfully!');
                  updateBasicInfo();
                  updateBilling();
                }
              }
            },
          });
          setSubmitPending(false);
          break;
      }
    } else {
      setSubmitPending(false);
    }
  };

  // start
  const waybillStart = async () => {
    modal.confirm({
      title: 'Start Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to Start this waybill',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setStartPending(true);
        const res = await toStart({ id: Number(waybillId) });
        setStartPending(false);
        if (res.code === 200) {
          if (res.code === 200) {
            if (res.data?.code === 1) {
              modal.warning({
                title: 'Warning',
                content: res.data.msg,
                okText: 'Confirm',
                cancelButtonProps: {
                  style: { display: 'none' },
                },
              });
              updateBilling();
              updateBasicInfo();
            } else {
              message.success('Start successfully!');
              updateBasicInfo();
              updateBilling();
            }
          }
        }
      },
    });
  };

  const confirmDelivery = async () => {
    setPodPending(true);
    const check = await checkShippingRecord({
      waybillId: Number(waybillId),
      projectId: waybillBasicInfo?.projectId,
    });
    setPodPending(false);
    if (check.code === 200) {
      switch (check.data) {
        case 0:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Confirm that the goods have been delivered',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
              const res = await waybillConfirmDelivery({
                waybillId: Number(waybillId),
                countryId: countryId,
                projectId: waybillBasicInfo?.projectId,
              });
              if (res.code === 200) {
                if (res.data?.code === 1) {
                  modal.warning({
                    title: 'Warning',
                    content: res.data.msg,
                    okText: 'Confirm',
                    cancelButtonProps: {
                      style: { display: 'none' },
                    },
                  });
                  updateBilling();
                  updateBasicInfo();
                } else {
                  message.success('Confirm delivery successfully!');
                  updateBilling();
                  updateBasicInfo();
                }
              }
            },
          });
          break;
        case 1:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content:
              'Lack of Arrival at Origin action records, unable to confirm waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          break;
        case 2:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content:
              'Lack of Loading Completion action records, unable to confirm waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          break;
        case 3:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content:
              'Lack of Arrival at Destination action record, unable to confirm waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          break;
        case 4:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content:
              'Lack of Unloading Completion action record, unable to confirm waybill',
            okText: 'Confirm',
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          break;
        case 5:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Please upload the POD document first',
            okText: 'Confirm',
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          break;
        case 6:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'Error, Please upload the necessary POD',
            okText: 'Confirm',
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          break;
      }
    }
  };
  // Confirm Verification
  const doConfirmVerification = async () => {
    setConfirmVerificationLoading(true);
    const { id } = waybillBasicInfo;
    const res = await waybillConfirmVerification({ id });
    setConfirmVerificationLoading(false);
    if (res.code === 200) {
      message.success(`Confirm Verification successfully`);
      updateBilling();
      updateBasicInfo();
    }
  };
  // Confirm Price
  const doConfirmPrice = async () => {
    setConfirmPriceLoading(true);
    const { id } = waybillBasicInfo;
    const res = await waybillConfirmPrice({ id });
    setConfirmPriceLoading(false);
    if (res.code === 200) {
      if (res.data?.code === 1) {
        message.success(`${res.data?.msg}`);
      } else {
        message.success(`Confirm Price successfully`);
      }
      updateBilling();
      updateBasicInfo();
    }
  };
  // Confirm POD Receipt
  const doConfirmPODReceipt = async () => {
    setConfirmPodReceiptLoading(true);
    const { id } = waybillBasicInfo;
    const res = await waybillConfirmPodReceipt({ id });
    setConfirmPodReceiptLoading(false);
    if (res.code === 200) {
      message.success(`Confirm POD Receipt successfully`);
      updateBilling();
      updateBasicInfo();
    }
  };

  // Reject
  const onRejectConfirm = async (data: IWaybillRejectParams) => {
    setRejectConfirmLoading(true);
    const { id } = waybillBasicInfo;
    const params: IWaybillRejectParams = {
      ...data,
      id,
    };
    const res = await waybillReject(params);
    setRejectConfirmLoading(false);
    if (res.code === 200) {
      message.success(`${rejectTitle} successfully`);
      setShowReject(false);
      updateBilling();
      updateBasicInfo();
    }
  };
  // Cancel
  const onCancelCheck = async () => {
    setShowCancelLoading(true);
    const res = await waybillCancelCheck({ id: waybillBasicInfo.id }).finally(
      () => {
        setShowCancelLoading(false);
      },
    );
    if (res.code === 200) {
      if (res.data?.code === 0) {
        setShowReason(WaybillReasonEnum.CANCEL);
      } else if (res.data?.code === 1) {
        modal.confirm({
          title: 'Cancel Waybill',
          content: 'There is an associated Ticket ,  Confirm cancellation?',
          okText: 'Yes, Cancel waybill ',
          cancelText: 'No, Close',
          onOk: () => {
            setShowReason(WaybillReasonEnum.CANCEL);
          },
        });
      } else if (res.data?.code === 2) {
        message.error({
          content: (
            <div
              style={{
                width: 595,
                wordBreak: 'break-word',
                textAlign: 'left',
              }}
            >
              This waybill is linked to Ticket
              {res.data?.customParam?.ticketList?.map(
                (item: {
                  id: number;
                  ticketNumber: string;
                  ticketType: EnumClaimTicketType;
                }) => {
                  return (
                    <a
                      key={item.id}
                      onClick={() => {
                        openNewTag(
                          item.ticketType === EnumClaimTicketType.CLAIM
                            ? `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${item?.id}`
                            : `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${item?.id}`,
                        );
                      }}
                    >
                      {' '}
                      {item?.ticketNumber},{' '}
                    </a>
                  );
                },
              )}
              the Ticket association needs to be removed.
            </div>
          ),
          duration: 3,
        });
      }
    }
  };

  return (
    <>
      <div
        className={styles.header}
        style={{
          marginBottom:
            waybillBasicInfo.status &&
            waybillBasicInfo.status !== WaybillStatusEnum.PENDING &&
            waybillBasicInfo.status !== WaybillStatusEnum.PLANNING &&
            showRecord
              ? '16px'
              : '',
        }}
      >
        <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
          {/*top function btn*/}
          <div className={styles.header_top}>
            <div className={styles.header_left}>
              <WaybillTruckIcon
                color={
                  WaybillStatusEnumIcon[waybillBasicInfo?.status] || '#CACACA'
                }
              />
              <div className={styles.header_left_status}>
                {waybillBasicInfo.status}
              </div>
              {waybillBasicInfo?.financialStatus &&
                (waybillBasicInfo?.financialStatus !==
                WaybillFinancialStatusEnum.NOT_STARTED ? (
                  waybillBasicInfo?.financialStatus ===
                  WaybillFinancialStatusEnum.CLOSED ? (
                    <CloseCircleOutlined
                      style={{ fontSize: 28, color: '#FF4D4F' }}
                      className={styles.header_left_financial}
                    />
                  ) : waybillBasicInfo?.financialStatus ===
                    WaybillFinancialStatusEnum.SETTLED ? (
                    <IconFinancialStatusSettled
                      className={styles.header_left_financial}
                    />
                  ) : (
                    <IconFinancialStatus
                      className={styles.header_left_financial}
                    />
                  )
                ) : (
                  <IconFinancialStatusNotStarted
                    className={styles.header_left_financial}
                  />
                ))}
              <div className={styles.header_left_status}>
                {waybillBasicInfo?.financialStatus}
              </div>
              <div
                className={styles.header_left_status}
                style={{ marginLeft: 24 }}
              >
                <LineChartOutlined
                  style={{ fontSize: 28, color: '#009688', marginRight: 8 }}
                />
                Risk Level:{waybillBasicInfo?.riskLevel ?? '-'}
              </div>
            </div>
            <div className={styles.header_right}>
              <Access
                accessible={
                  isStandardWaybill
                    ? access[PermissionEnum.STANDARD_WAYBILL_OPERATE]
                    : access[PermissionEnum.TEMPORARY_WAYBILL_OPERATE]
                }
              >
                <Button
                  className={styles.header_btn}
                  onClick={() => fetchLogList()}
                  loading={operationLogModalState.loading}
                >
                  Operation Log
                </Button>
              </Access>
              {[
                WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION,
                WaybillFinancialStatusEnum.AWAITING_SETTLEMENT,
              ].includes(waybillBasicInfo?.financialStatus) && (
                <Access
                  accessible={access[PermissionEnum.WAYBILL_REJECT_PRICE]}
                >
                  <Button
                    className={styles.header_btn}
                    onClick={() => {
                      setShowReject(true);
                      setRejectTitle('Reject Price');
                    }}
                  >
                    Reject Price
                  </Button>
                </Access>
              )}

              {[WaybillFinancialStatusEnum.AWAITING_SETTLEMENT].includes(
                waybillBasicInfo?.financialStatus,
              ) && (
                <Access
                  accessible={
                    access[PermissionEnum.WAYBILL_REJECT_WAYBILL_INFORMATION]
                  }
                >
                  <Button
                    className={styles.header_btn}
                    onClick={() => {
                      setShowReject(true);
                      setRejectTitle('Reject Waybill information');
                    }}
                  >
                    Reject Waybill information
                  </Button>
                </Access>
              )}
              {[WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY].includes(
                waybillBasicInfo?.financialStatus,
              ) && (
                <Access
                  accessible={
                    access[PermissionEnum.WAYBILL_CONFIRM_POD_RECEIPT]
                  }
                >
                  <Button
                    type="primary"
                    className={styles.header_btn}
                    onClick={doConfirmPODReceipt}
                    loading={confirmPodReceiptLoading}
                  >
                    Confirm POD Receipt
                  </Button>
                </Access>
              )}
              {/* {waybillBasicInfo?.dispatchType ===
                WaybillDispatchTypeEnum.STANDARD_DISPATCH &&
              waybillBasicInfo?.status === WaybillStatusEnum.DELIVERED &&
              waybillBasicInfo?.pricingMode ===
                RouteBillingModeEnum.MILEAGE_BILLING ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_CONFIRM_ROUTE]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_ROUTE]
                  }
                >
                  <Button
                    className={styles.header_btn}
                    onClick={doConfirmRoute}
                    loading={confirmRouteModalState.loading}
                  >
                    Confirm Route
                  </Button>
                </Access>
              ) : null} */}
              {[WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION].includes(
                waybillBasicInfo?.financialStatus,
              ) && (
                <Access
                  accessible={
                    access[PermissionEnum.WAYBILL_CONFIRM_VERIFICATION]
                  }
                >
                  <Button
                    type="primary"
                    className={styles.header_btn}
                    onClick={doConfirmVerification}
                    loading={confirmVerificationLoading}
                  >
                    Confirm Verification
                  </Button>
                </Access>
              )}
              {[
                WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION,
              ].includes(waybillBasicInfo?.financialStatus) && (
                <Access
                  accessible={access[PermissionEnum.WAYBILL_CONFIRM_PRICE]}
                >
                  <Button
                    type="primary"
                    className={styles.header_btn}
                    onClick={doConfirmPrice}
                    loading={confirmPriceLoading}
                  >
                    Confirm Price
                  </Button>
                </Access>
              )}

              {[WaybillFinancialStatusEnum.NOT_STARTED].includes(
                waybillBasicInfo?.financialStatus,
              ) &&
              [WaybillStatusEnum.IN_TRANSIT].includes(
                waybillBasicInfo?.status,
              ) ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_ABNORMAL]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_ABNORMAL]
                  }
                >
                  <Button
                    className={styles.header_btn}
                    onClick={() => setShowReason(WaybillReasonEnum.ABNORMAL)}
                  >
                    Abnormal
                  </Button>
                </Access>
              ) : null}

              {[WaybillFinancialStatusEnum.NOT_STARTED].includes(
                waybillBasicInfo?.financialStatus,
              ) &&
              [
                WaybillStatusEnum.PLANNING,
                WaybillStatusEnum.PENDING,
                WaybillStatusEnum.IN_TRANSIT,
              ].includes(waybillBasicInfo?.status) ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_CANCEL]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_CANCEL]
                  }
                >
                  <Button
                    className={styles.header_btn}
                    onClick={() => {
                      onCancelCheck();
                    }}
                    loading={showCancelLoading}
                  >
                    Cancel
                  </Button>
                </Access>
              ) : null}
              {[WaybillStatusEnum.IN_TRANSIT].includes(
                waybillBasicInfo?.status,
              ) ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_MANAGE_POD]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD]
                  }
                >
                  <Button
                    type="primary"
                    className={styles.header_btn}
                    loading={podPending}
                    onClick={confirmDelivery}
                  >
                    Confirm Delivery
                  </Button>
                </Access>
              ) : null}
              {[WaybillStatusEnum.PLANNING].includes(
                waybillBasicInfo?.status,
              ) ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_SUBMIT]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_SUBMIT]
                  }
                >
                  <Button
                    type="primary"
                    className={styles.header_btn}
                    onClick={waybillSubmit}
                    loading={submitPending}
                  >
                    Submit
                  </Button>
                </Access>
              ) : null}
              {[WaybillStatusEnum.PENDING].includes(
                waybillBasicInfo?.status,
              ) ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_START]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_START]
                  }
                >
                  <Button
                    type="primary"
                    className={styles.header_btn}
                    onClick={waybillStart}
                    loading={startPending}
                  >
                    Start
                  </Button>
                </Access>
              ) : null}
            </div>
          </div>
        </Affix>
      </div>
      <OperationLogModal
        open={operationLogModalState.open}
        list={operationLogModalState.list}
        onCancel={() => setOperationLogModalState({ open: false })}
        onConfirm={() => setOperationLogModalState({ open: false })}
      />
      {!!showReason ? (
        <WaybillReasonModal
          type={showReason}
          waybillId={Number(waybillId)}
          hideModal={() => setShowReason(WaybillReasonEnum.NULL)}
          refresh={() => {
            updateBasicInfo();
            updateBilling();
          }}
        />
      ) : null}

      {confirmRouteModalState.open ? (
        <ConfirmRouteModal
          waybillId={Number(waybillId)}
          mapJsonStr={confirmRouteModalState.mapJsonStr}
          open={confirmRouteModalState.open}
          onCancel={() => setConfirmRouteModalState({ open: false })}
          onConfirm={() => {
            updateBasicInfo();
            updateBilling();
            setConfirmRouteModalState({ open: false });
          }}
        />
      ) : null}
      {showBillingModal ? (
        <ConfirmWaybillModal
          billingInfo={billingInfo}
          countryId={countryId}
          waybillId={Number(waybillId)}
          updateBilling={updateBilling}
          updateBasicInfo={updateBasicInfo}
          hideModal={() => setShowBillingModal(false)}
        />
      ) : null}
      {showReject && (
        <WaybillRejectModal
          open={showReject}
          onConfirm={onRejectConfirm}
          rejectTitle={rejectTitle}
          waybillFinancialStatus={waybillBasicInfo?.financialStatus}
          modalProps={{
            onCancel: () => setShowReject(false),
          }}
          submitter={{
            submitButtonProps: {
              loading: rejectConfirmLoading,
            },
          }}
        />
      )}
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
});
