import {
  IRouteOriginAndDestinationListItem,
  IWaybillBaseInfoData,
  IWaypointListItem,
} from '@/api/types/waybill';
import { waybillCarrierAssignCheck } from '@/api/waybill';
import { PATHS, WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import {
  WaybillDispatchTypeEnum,
  WaybillFinancialStatusEnum,
  WaybillStatusEnum,
} from '@/enums';
import { EnumClaimTicketType } from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import {
  DEFAULT_CARRIER_SELECT,
  OPS_TYPE,
  StateContext,
} from '@/pages/waybill/WaybillDetail/store';
import CardItem from '@/pages/waybill/components/CardItem';
import CarrierSelect from '@/pages/waybill/components/CarrierSelect';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { formatAmount, openNewTag } from '@/utils/utils';
import { CloseCircleFilled } from '@ant-design/icons';
import { useAccess, useParams } from '@umijs/max';
import { App, message, Row } from 'antd';
import { useCallback, useContext, useEffect, useState } from 'react';
import RouteEditStepsModal from '../DetailRouteCard/RouteEditStepsModal';
import TemporaryStepsModal from '../DetailRouteCard/TemporaryStepsModal';
import styles from './styles.less';

export default function DetailCarrierCard(props: {
  isStandardWaybill: boolean;
}) {
  const access = useAccess();
  const { modal } = App.useApp();
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};
  const carrierSelect = state?.carrierSelect || {};

  let routeInfo = state?.routeInfo;
  const { isStandardWaybill } = props;
  const refreshBasicInfo: boolean = state?.refreshBasicInfo;
  const refreshBilling: boolean = state?.refreshBilling;
  const loading: boolean = state?.loading;
  const { id: waybillId } = useParams();
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [routeDetail, setRouteDetail] = useState<any>(undefined);

  const [standardRouteEditStepsModalOpen, setStandardRouteEditStepsModalOpen] =
    useState<boolean>(false);
  const [temporaryEditStepsModalOpen, setTemporaryEditStepsModalOpen] =
    useState<boolean>(false);
  const [standardInitialValue] = useState<{
    selectedTree: IRouteOriginAndDestinationListItem[];
    selectedOrigins: IRouteOriginAndDestinationListItem[];
    selectedOriginStopPoints: IRouteOriginAndDestinationListItem[];
    selectedDestinations: IRouteOriginAndDestinationListItem[];
    selectedDestinationStopPoints: IRouteOriginAndDestinationListItem[];
    selectedWaypoints: IWaypointListItem[];
  }>({
    selectedTree: [],
    selectedOrigins: [],
    selectedOriginStopPoints: [],
    selectedDestinations: [],
    selectedDestinationStopPoints: [],
    selectedWaypoints: [],
  });

  const [temporaryInitialValue] = useState<{
    routeCode: string;
    selectedOrigins: IRouteOriginAndDestinationListItem[];
    selectedDestinations: IRouteOriginAndDestinationListItem[];
  }>({
    routeCode: '',
    selectedOrigins: [],
    selectedDestinations: [],
  });

  const verificationAssign = async () => {
    let bol;
    const keysArray = Object.keys(routeDetail!);
    //是否已完成路线规划,否则弹窗提示【Please plan route before assign truck】
    if (
      waybillBasicInfo?.dispatchType ===
      WaybillDispatchTypeEnum.TEMPORARY_DISPATCH
    ) {
      bol = keysArray.every((item) => routeDetail?.[item] === null);
    } else {
      bol = keysArray.every(
        (item) =>
          routeDetail?.[item] === null || routeDetail?.[item]?.length === 0,
      );
    }

    if (bol) {
      modal.confirm({
        title: 'Error',
        icon: <CloseCircleFilled style={{ color: '#FF4D4F' }} />,
        content: 'Please plan route before assign truck',
        okText: 'Plan Route',
        cancelText: 'No',
        onOk: () => {
          if (
            waybillBasicInfo?.dispatchType ===
            WaybillDispatchTypeEnum.TEMPORARY_DISPATCH
          ) {
            setTemporaryEditStepsModalOpen(true);
          } else {
            setStandardRouteEditStepsModalOpen(true);
          }
        },
      });
    } else {
      setShowSelect(true);
    }
  };

  const handleStandardConfirm = () => {
    setStandardRouteEditStepsModalOpen(false);
    dispatch({
      type: OPS_TYPE.REFRESH_BASIC_INFO,
      payload: {
        data: !refreshBasicInfo,
      },
    });
    dispatch({
      type: OPS_TYPE.REFRESH_BILLING,
      payload: {
        data: !refreshBilling,
      },
    });
  };

  const handleTemporaryConfirm = () => {
    setTemporaryEditStepsModalOpen(false);
    dispatch({
      type: OPS_TYPE.REFRESH_BASIC_INFO,
      payload: {
        data: !refreshBasicInfo,
      },
    });
    dispatch({
      type: OPS_TYPE.REFRESH_BILLING,
      payload: {
        data: !refreshBilling,
      },
    });
  };

  const initCarrierSelect = useCallback(() => {
    if (!waybillBasicInfo?.vendorId) {
      dispatch({
        type: OPS_TYPE.CARRIER_SELECT,
        payload: {
          data: DEFAULT_CARRIER_SELECT,
        },
      });
    }
    if (waybillBasicInfo?.vendorId && !waybillBasicInfo?.vendorTruckId) {
      dispatch({
        type: OPS_TYPE.CARRIER_SELECT,
        payload: {
          data: {
            ...carrierSelect,
            step: 2,
            vendor: {
              id: waybillBasicInfo?.vendorId,
              vendorName: waybillBasicInfo?.vendorName,
            },
            truck: null,
            driver: null,
            helpers: [],
          },
        },
      });
    }
    if (
      waybillBasicInfo?.vendorId &&
      waybillBasicInfo?.vendorTruckId &&
      !waybillBasicInfo?.driverId
    ) {
      dispatch({
        type: OPS_TYPE.CARRIER_SELECT,
        payload: {
          data: {
            ...carrierSelect,
            step: 3,
            vendor: {
              id: waybillBasicInfo?.vendorId,
              vendorName: waybillBasicInfo?.vendorName,
            },
            truck: {
              id: waybillBasicInfo?.capacityPoolTruckId,
              truckId: waybillBasicInfo?.truckId,
              vendorTruckId: waybillBasicInfo?.vendorTruckId,
              vendorId: waybillBasicInfo?.vendorId,
              truckType: waybillBasicInfo?.truckType,
              truckTypeConsistency: waybillBasicInfo?.truckTypeConsistency,
            },
            driver: null,
            helpers: [],
          },
        },
      });
    }
    if (
      waybillBasicInfo?.vendorId &&
      waybillBasicInfo?.vendorTruckId &&
      waybillBasicInfo?.driverId
    ) {
      dispatch({
        type: OPS_TYPE.CARRIER_SELECT,
        payload: {
          data: {
            step: waybillBasicInfo?.helperVos?.length ? 4 : 3,
            vendor: {
              id: waybillBasicInfo?.vendorId,
              vendorName: waybillBasicInfo?.vendorName,
            },
            truck: {
              id: waybillBasicInfo?.capacityPoolTruckId,
              truckId: waybillBasicInfo?.truckId,
              vendorTruckId: waybillBasicInfo?.vendorTruckId,
              vendorId: waybillBasicInfo?.vendorId,
              truckType: waybillBasicInfo?.truckType,
              truckTypeConsistency: waybillBasicInfo?.truckTypeConsistency,
            },
            driver: {
              id: waybillBasicInfo?.driverId,
            },
            helpers: waybillBasicInfo?.helperVos?.map((h) => h.id),
          },
        },
      });
    }
  }, [waybillBasicInfo]);

  const onAssignCheck = async () => {
    const res = await waybillCarrierAssignCheck({
      id: waybillBasicInfo?.id,
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        verificationAssign();
      } else if (res.data.code === 1) {
        modal.confirm({
          title: 'Confirm',
          content:
            'There are associated tickets. Confirm  reassign the carrier',
          okText: 'Yes, reassign',
          cancelText: 'No, Close',
          onOk: () => {
            verificationAssign();
          },
        });
      } else if (res.data.code === 2) {
        message.error({
          content: (
            <div
              style={{
                width: 595,
                wordBreak: 'break-word',
                textAlign: 'left',
              }}
            >
              There is an associated ticket
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
      } else if (res.data.code === 3) {
        message.error(
          'The settlement item is associated with a statement . Reassigning  carrier is not allowed.',
          3,
        );
      }
    }
  };

  useEffect(() => {
    if (Object.keys(routeInfo).length !== 0) {
      setRouteDetail(routeInfo);
    }
  }, [routeInfo]);

  useEffect(() => {
    initCarrierSelect();
  }, [waybillBasicInfo]);

  return (
    <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.CARRIER}>
      <DetailCard
        title="Carrier"
        editCallback={() => {
          // if (waybillBasicInfo.hasLinkedStatement) {
          //   return;
          // }
          onAssignCheck();
        }}
        loading={loading}
        routeDetail={routeDetail} // assin时需要校验route信息的修改 故添加监听字段来更新回调函数
        showEditBtn={
          (isStandardWaybill
            ? access[PermissionEnum.STANDARD_WAYBILL_CARRIER_ASSIGN]
            : access[PermissionEnum.TEMPORARY_WAYBILL_CARRIER_ASSIGN]) &&
          ((waybillBasicInfo?.financialStatus ===
            WaybillFinancialStatusEnum.NOT_STARTED &&
            waybillBasicInfo?.status === WaybillStatusEnum.PLANNING) ||
            (waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              waybillBasicInfo?.status === WaybillStatusEnum.PENDING) ||
            (waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT) ||
            waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY ||
            waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION)
        }
        child={
          <div className={styles.content}>
            <Row>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Vendor Name"
                  value={waybillBasicInfo?.vendorName}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Vendor Tag"
                  value={waybillBasicInfo?.vendorTag}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Contact"
                  value={waybillBasicInfo?.contactName}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Number"
                  value={waybillBasicInfo?.phoneNumber}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem label="Email" value={waybillBasicInfo?.email} />
              </div>
            </Row>
            <Row>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Plate Number"
                  value={waybillBasicInfo?.plateNumber}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Customer Requested Truck Type"
                  value={waybillBasicInfo?.requiredTruckTypeName}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Actual Use Truck Type"
                  value={waybillBasicInfo?.truckTypeName}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Capacity"
                  value={formatAmount(waybillBasicInfo?.capacity) || '-'}
                />
              </div>
            </Row>
            <div className={styles.line}></div>
            <Row>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Truck Driver"
                  value={waybillBasicInfo?.driverName}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="License Number"
                  value={waybillBasicInfo?.licenseNumber}
                />
              </div>
              <div style={{ width: '20%' }}>
                <CardItem
                  label="Driver Contact"
                  value={waybillBasicInfo?.driverPhoneNumber}
                />
              </div>
            </Row>
            {waybillBasicInfo?.helperVos?.length ? (
              <div className={styles.helpers}>
                {waybillBasicInfo?.helperVos.map((item, index) => (
                  <div className={styles.helpers_item} key={item.id}>
                    <div>
                      <div className={styles.helpers_label}>
                        Helper {index + 1}
                      </div>
                      <div className={styles.helpers_value}>
                        {item.helperName}
                      </div>
                    </div>
                    <div>
                      <div className={styles.helpers_label}>
                        Helper {index + 1} Contact
                      </div>
                      <div className={styles.helpers_value}>
                        {item.helperPhoneNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        }
      />

      {showSelect ? (
        <CarrierSelect
          waybillId={Number(waybillId)}
          waybillDetail={waybillBasicInfo}
          projectId={waybillBasicInfo.projectId}
          positionTime={waybillBasicInfo.positionTime}
          onClose={async () => {
            setShowSelect(false);
            initCarrierSelect();
          }}
          refresh={async () => {
            // 更新basicInfo
            dispatch({
              type: OPS_TYPE.REFRESH_BASIC_INFO,
              payload: {
                data: !refreshBasicInfo,
              },
            });
            dispatch({
              type: OPS_TYPE.REFRESH_BILLING,
              payload: {
                data: !refreshBilling,
              },
            });
          }}
        />
      ) : null}

      <RouteEditStepsModal
        open={standardRouteEditStepsModalOpen}
        projectId={Number(waybillBasicInfo?.projectId)}
        waybillId={Number(waybillId)}
        onCancel={() => setStandardRouteEditStepsModalOpen(false)}
        onConfirm={handleStandardConfirm}
        initialValue={standardInitialValue}
      />

      <TemporaryStepsModal
        open={temporaryEditStepsModalOpen}
        projectId={Number(waybillBasicInfo?.projectId)}
        waybillId={Number(waybillId)}
        onCancel={() => setTemporaryEditStepsModalOpen(false)}
        onConfirm={handleTemporaryConfirm}
        initialValue={temporaryInitialValue}
      />
    </div>
  );
}
