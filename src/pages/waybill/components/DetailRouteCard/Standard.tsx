import {
  IOriginVoListItem,
  IRouteOriginAndDestinationListItem,
  IWaybillBaseInfoData,
  IWaypointListItem,
} from '@/api/types/waybill';
import {
  checkRouteLibImportingStatus,
  waybillRouteDetail,
  waybillRouteTemporaryDetail,
} from '@/api/waybill';
import { WaybillFinancialStatusEnum, WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import styles from '@/pages/waybill/components/DetailRouteCard/styles.less';
import { useAccess, useParams } from '@umijs/max';
import { App, Col, Row } from 'antd';
import cls from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';
import { ReactComponent as DestinationIcon } from '../../../../../public/svg/destination_icon.svg';
import { ReactComponent as OriginIcon } from '../../../../../public/svg/origin_icon.svg';
import { ReactComponent as StopPointIcon } from '../../../../../public/svg/stop_point_icon.svg';
import { ReactComponent as WaypointIcon } from '../../../../../public/svg/waypoint_icon.svg';
import { OPS_TYPE, StateContext } from '../../WaybillDetail/store';
import DetailCard from '../DetailCard';
import RouteEditStepsModal from './RouteEditStepsModal';
import {
  buildTree,
  buildVid,
  mixinStopPoints,
} from './RouteEditStepsModal/support';

export const FINAL_STATUS_LIST = [
  WaybillStatusEnum.DELIVERED,
  WaybillStatusEnum.CANCELED,
  WaybillStatusEnum.ABNORMAL,
];

interface IRouteDetailCare {
  onSubmit?: () => void;
}

const DetailRouteCard: FC<IRouteDetailCare> = () => {
  const access = useAccess();
  const { modal } = App.useApp();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const refreshBasicInfo: boolean = state?.refreshBasicInfo;
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};
  const refreshBilling: boolean = state?.refreshBasicInfo;
  const { id: waybillId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [routeCode, setRouteCode] = useState<string>('');
  const [initialValue, setInitialValue] = useState<{
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

  // 列表做展示的数据和原始数据不一样，需要去重
  const [viewOrigins, setViewOrigins] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);
  const [viewWaypoints, setViewWaypoints] = useState<IWaypointListItem[]>([]);
  const [viewDestinations, setViewDestinations] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);

  const [routeEditStepsModalOpen, setRouteEditStepsModalOpen] =
    useState<boolean>(false);
  const [editLoading, setEditLoading] = useState(false);

  const handleEdit = async () => {
    // check对应的 route lib 是否正在执行导入
    setEditLoading(true);
    const res = await checkRouteLibImportingStatus({
      id: Number(waybillId),
    }).finally(() => {
      setEditLoading(false);
    });
    if (res.code === 200) {
      if (res.data?.code !== 0) {
        modal.warning({
          title: 'Warning',
          content: res.data.msg,
          okText: 'Confirm',
          cancelButtonProps: {
            style: { display: 'none' },
          },
        });
      } else {
        setRouteEditStepsModalOpen(true);
      }
    }
  };

  const flattenTree = (tree: IOriginVoListItem[]) => {
    const flattenList: any[] = [];
    // 循环的时候顺便添加parentId
    const loop = (_tree: any[], parentId: number) => {
      _tree.forEach((item) => {
        const { children } = item;

        flattenList.push({
          ...item,
          parentId: parentId,
        });
        if (children?.length > 0) {
          loop(children, item.vid);
        }
      });
    };
    loop(tree, 0);
    return flattenList;
  };

  const formatRes = (
    originVos: IOriginVoListItem[],
    originStopPoints: IRouteOriginAndDestinationListItem[],
    destinationStopPoints: IRouteOriginAndDestinationListItem[],
  ) => {
    const flattenList = flattenTree(originVos);
    // 根据flattenList 再构建tree
    const selectedTree = buildTree(flattenList, 'vid');

    const level1List = flattenList.filter((item) => item.level === 1);
    const level2List = flattenList.filter((item) => item.level === 2);
    const level3List = flattenList.filter((item) => item.level === 3);

    // level1List 和 level2List 根据sort字段排序
    level1List.sort((a, b) => a.sort - b.sort);
    level2List.sort((a, b) => a.sort - b.sort);

    // level2VidList根据 buildVid 规则去重
    const level2VidListMap = new Map();
    level2List.forEach((item) => {
      const key = buildVid(item, 'D');
      level2VidListMap.set(key, item);
    });
    const level2ListUnique = Array.from(level2VidListMap.values());

    // level3List的每一项都有waypoint这个属性，它是string，如果存在相同的，就过滤掉
    const level3ListMap = new Map();
    level3List.forEach((item) => {
      level3ListMap.set(item.waypoint, item);
    });
    const level3ListUnique = Array.from(level3ListMap.values());

    const _viewOrigins = mixinStopPoints(level1List, originStopPoints ?? []);
    const _viewDestinations = mixinStopPoints(
      level2ListUnique,
      destinationStopPoints ?? [],
    );

    setViewOrigins(_viewOrigins);
    setViewDestinations(_viewDestinations);
    setViewWaypoints(level3ListUnique);

    setInitialValue({
      // @ts-ignore
      selectedTree: selectedTree,
      selectedOrigins: level1List,
      selectedOriginStopPoints: originStopPoints,
      selectedDestinations: level2List,
      selectedDestinationStopPoints: destinationStopPoints,
      selectedWaypoints: level3List,
    });
  };

  const fetchRoute = async () => {
    setLoading(true);
    const res = await waybillRouteDetail({ id: Number(waybillId) }).finally(
      () => {
        setLoading(false);
      },
    );
    if (res.code === 200) {
      const {
        routeCode: _routeCode,
        originVos,
        originStopPoints,
        destinationStopPoints,
      } = res.data;
      dispatch({
        type: OPS_TYPE.ROUTE_INFO,
        payload: {
          data: res.data || {},
        },
      });
      setRouteCode(_routeCode);
      formatRes(
        originVos ?? [],
        originStopPoints ?? [],
        destinationStopPoints ?? [],
      );
    }
  };

  const fetchSpecialRoute = async () => {
    setLoading(true);
    const res = await waybillRouteTemporaryDetail({
      id: Number(waybillId),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const {
        routeCode: _routeCode,
        origins,
        destinations,
        waypoints,
      } = res.data;
      dispatch({
        type: OPS_TYPE.ROUTE_INFO,
        payload: {
          data: res.data || {},
        },
      });
      setRouteCode(_routeCode);
      setViewOrigins(origins ?? []);
      setViewDestinations(destinations ?? []);
      // @ts-ignore
      setViewWaypoints(waypoints ?? []);
    }
  };

  const handleConfirm = () => {
    setRouteEditStepsModalOpen(false);
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

  useEffect(() => {
    if (waybillId) {
      if (FINAL_STATUS_LIST.includes(waybillBasicInfo?.status)) {
        fetchSpecialRoute();
      } else {
        fetchRoute();
      }
    }
  }, [waybillId, refreshBasicInfo]);

  return (
    <>
      <DetailCard
        title="Route"
        editCallback={handleEdit}
        editLoading={editLoading}
        showEditBtn={
          access[PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING] &&
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
        loading={loading}
        child={
          <div className={styles.card}>
            <div className={styles.card_content}>
              <Row>
                <Col span={10}>
                  <div className={styles.card_content_left}>
                    <div className={styles.card_title}>Origin</div>

                    <div className={styles.card_content_item_gap}>
                      {viewOrigins?.map((item) => {
                        const routeRegionList = [
                          item.padName,
                          item.sadName,
                          item.tadName,
                        ].filter(Boolean);
                        const routeRegion = routeRegionList.join(', ');

                        return (
                          <div
                            key={item.vid ?? item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <div className={styles.card_content_item}>
                              {item.isStop ? <StopPointIcon /> : <OriginIcon />}
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  {routeRegion}
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.address}
                                </div>
                              </div>
                            </div>
                            <div className={styles.card_content_label}>
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  Origin Label
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.label ?? '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>
                <Col span={4}>
                  <div className={styles.card_content_center}>
                    <div className={cls(styles.card_title)}>Waypoint</div>
                    <div
                      className={styles.card_content_item_gap}
                      style={{ gap: '56px' }}
                    >
                      {viewWaypoints?.map((item) => {
                        return (
                          <div
                            key={item.vid ?? item.id}
                            className={styles.card_content_item}
                          >
                            <WaypointIcon
                              style={{ flexGrow: 0, flexShrink: 0 }}
                            />
                            <div className={styles.card_content_item_address}>
                              <div
                                className={
                                  styles.card_content_item_address_name2
                                }
                              >
                                {item.waypoint ?? item}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>
                <Col span={10}>
                  <div className={styles.card_content_right}>
                    <div className={styles.card_title}>Destination</div>

                    <div className={styles.card_content_item_gap}>
                      {viewDestinations?.map((item) => {
                        const routeRegionList = [
                          item.padName,
                          item.sadName,
                          item.tadName,
                        ].filter(Boolean);
                        const routeRegion = routeRegionList.join(', ');

                        return (
                          <div
                            key={item.vid ?? item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <div className={styles.card_content_item}>
                              {item.isStop ? (
                                <StopPointIcon />
                              ) : (
                                <DestinationIcon />
                              )}
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  {routeRegion}
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.address}
                                </div>
                              </div>
                            </div>
                            <div className={styles.card_content_label}>
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  Destination Label
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.label ?? '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className={styles.card_footer}>Route Code:{routeCode}</div>
          </div>
        }
      />
      <RouteEditStepsModal
        open={routeEditStepsModalOpen}
        projectId={Number(waybillBasicInfo?.projectId)}
        waybillId={Number(waybillId)}
        onCancel={() => setRouteEditStepsModalOpen(false)}
        onConfirm={handleConfirm}
        initialValue={initialValue}
      />
    </>
  );
};

export default DetailRouteCard;
