import { addListQuery, getListQuery } from '@/api/listQuery';
import {
  IListShippingRecordResponse,
  IOriginVoListItem,
  IRouteOriginAndDestinationListItem,
  IShippingRecordVoListItem,
  IWaybillListItem,
  IWaybillListParams,
} from '@/api/types/waybill';
import {
  checkRouteLibImportingStatus,
  checkShippingRecord,
  checkSubmit,
  getWaybillList,
  listShippingRecord,
  toStart,
  toSubmit,
  waybillConfirmDelivery,
  waybillRouteDetail,
  waybillRouteTemporaryDetail,
} from '@/api/waybill';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, PATHS } from '@/constants';
import {
  SHOW_SHIPPING_RECORD_CARD,
  WaybillFinancialStatusEnum,
  WaybillFinancialStatusEnumText,
  WaybillFinancialStatusEnumTextColor,
  WaybillStatusEnum,
  WaybillStatusEnumText,
  WaybillStatusEnumTextColor,
} from '@/enums';
import { ListQueryPageEnum } from '@/enums/listQueryPage';
import { PermissionEnum } from '@/enums/permission';
import { StateContext } from '@/pages/project/Detail/store';
import {
  IPlanRouteInitialValue,
  isStandardWaybill,
  IStandardPlanRouteInitialValue,
  isTemporaryWaybill,
  ITemporaryPlanRouteInitialValue,
} from '@/pages/waybill/List';
import { aggregateToJsonArray } from '@/pages/waybill/components/DetailInformationCard';
import RouteEditStepsModal from '@/pages/waybill/components/DetailRouteCard/RouteEditStepsModal';
import {
  buildTree,
  buildVid,
} from '@/pages/waybill/components/DetailRouteCard/RouteEditStepsModal/support';
import { FINAL_STATUS_LIST } from '@/pages/waybill/components/DetailRouteCard/Standard';
import TemporaryStepsModal from '@/pages/waybill/components/DetailRouteCard/TemporaryStepsModal';
import Filter from '@/pages/waybill/components/Filter';
import {
  IALL_NEED,
  IBE_NEED,
  IFE_NEED,
} from '@/pages/waybill/components/Filter/constant';
import WaybillAddRecordModal from '@/pages/waybill/components/WaybillAddRecordModal';
import WaybillCopyModal from '@/pages/waybill/components/WaybillCopyModal';
import { getPathByRoute, getSortRoutes, unzip } from '@/utils/map';
import { formatAmount, openNewTag } from '@/utils/utils';
import { ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { useAccess, useModel, useParams } from '@umijs/max';
import { App, Badge, Button, Divider, Space, Tooltip } from 'antd';
import { cloneDeep, default as lodash } from 'lodash';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

const ProjectDetailWaybill: React.FC<{
  showCopyModal: boolean;
  projectName: string;
  projectStatus: string;
  selectedRowKeys: any;
  setShowCopyModalHandle: () => void;
  getSelectTableItem: (values: any) => void;
  getQuerys: (values: any) => void;
}> = (props) => {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const countryId = (initialState?.currentUser?.countryId as number) ?? 1;
  //@ts-ignore
  const { state } = useContext(StateContext);
  const refreshFlag = state?.refreshFlag;
  const { id: projectId } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse<IWaybillListItem>>(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState<boolean>(false);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);

  const FE_NEED_REF = useRef<IFE_NEED>({});
  const BE_NEED_REF = useRef<IBE_NEED>({});
  const filterRef = useRef<any>();

  const [activeRecord, setActiveRecord] = useState<IWaybillListItem>();
  const [addRecordModalOpen, setAddRecordModalOpen] = useState<boolean>(false);
  const [addRecordLoading, setAddRecordLoading] = useState<boolean>(false);
  const [googleMapPoints, setGoogleMapPoints] = useState<
    google.maps.LatLngLiteral[]
  >([]);
  const [actualPoints, setActualPoints] = useState<IShippingRecordVoListItem[]>(
    [],
  );
  const [originList, setOriginList] = useState<
    Array<google.maps.LatLngLiteral & { address: string; isStop: boolean }>
  >([]);
  const [destinationList, setDestinationList] = useState<
    Array<google.maps.LatLngLiteral & { address: string; isStop: boolean }>
  >([]);

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [startLoading, setStartLoading] = useState<boolean>(false);
  const [confirmDeliveryLoading, setConfirmDeliveryLoading] =
    useState<boolean>(false);

  const [planRouteLoading, setPlanRouteLoading] = useState<boolean>(false);
  const [routeEditStepsModalOpen, setRouteEditStepsModalOpen] =
    useState<boolean>(false);
  const [planRouteInitialValue, setPlanRouteInitialValue] =
    useState<IPlanRouteInitialValue>();
  const fillFilter = () => {
    // 回填 FE_NEED 数据
    filterRef.current?.doFill(FE_NEED_REF.current);
  };

  const saveListQuery = async () => {
    const query = {
      FE_NEED: FE_NEED_REF.current,
      BE_NEED: BE_NEED_REF.current,
    };
    const payload = {
      listPage: ListQueryPageEnum.PROJECT_WAYBILL_LIST,
      queryHistory: JSON.stringify(query),
    };
    setFilterLoading(true);
    await addListQuery(payload).finally(() => {
      setFilterLoading(false);
    });
  };

  const getDataSource = async () => {
    setLoading(true);
    // 回调请求参数外部导出waybill需要使用
    const payload = {
      ...BE_NEED_REF.current,
      projectIdList: [Number(projectId)],
    };
    props.getQuerys(payload);
    const res = await getWaybillList(payload as IWaybillListParams).finally(
      () => {
        setLoading(false);
      },
    );
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onFilterSearch = (ALL_NEED: IALL_NEED) => {
    console.log({ ALL_NEED });
    const { FE_NEED, BE_NEED } = ALL_NEED ?? {};
    FE_NEED_REF.current = FE_NEED ?? {};
    BE_NEED_REF.current = BE_NEED ?? {};

    saveListQuery();
    getDataSource();
  };

  const onPaginationChange = (pageNum: number, pageSize: number) => {
    lodash.set(BE_NEED_REF.current, 'pageNum', pageNum);
    lodash.set(BE_NEED_REF.current, 'pageSize', pageSize);

    saveListQuery();
    getDataSource();
  };

  const fetchListQuery = useCallback(async () => {
    // 每次请求历史记录 pageNum pageSize 都重置为初始状态
    lodash.set(BE_NEED_REF.current, 'pageNum', DEFAULT_PAGINATION.pageNum);
    lodash.set(BE_NEED_REF.current, 'pageSize', DEFAULT_PAGINATION.pageSize);

    const payload = {
      listPage: ListQueryPageEnum.PROJECT_WAYBILL_LIST,
    };
    setFilterLoading(true);
    const res = await getListQuery(payload).finally(() => {
      setFilterLoading(false);
    });

    if (res.code === 200) {
      try {
        const jsonStr = res.data ?? '{}';
        const ALL_NEED = JSON.parse(jsonStr);
        const { FE_NEED, BE_NEED } = ALL_NEED;

        FE_NEED_REF.current = FE_NEED ?? {};
        BE_NEED_REF.current = BE_NEED ?? {};

        lodash.set(BE_NEED_REF.current, 'pageNum', DEFAULT_PAGINATION.pageNum);
        lodash.set(
          BE_NEED_REF.current,
          'pageSize',
          DEFAULT_PAGINATION.pageSize,
        );

        fillFilter();
        getDataSource();
      } catch (error) {
        getDataSource();
      }
    } else {
      getDataSource();
    }
  }, []);

  const refresh = useCallback(() => {
    lodash.set(BE_NEED_REF.current, 'pageNum', DEFAULT_PAGINATION.pageNum);
    lodash.set(BE_NEED_REF.current, 'pageSize', DEFAULT_PAGINATION.pageSize);

    saveListQuery();
    getDataSource();
  }, []);

  const getPointsByRecord = (list: IShippingRecordVoListItem[] = []) => {
    const newList = cloneDeep(list);
    return newList?.reverse();
  };

  const getPointsBySelect = (mapJsonStr: string) => {
    try {
      const mapJson: any = unzip(mapJsonStr);
      const { routes, activeRouteIndex } = mapJson;
      setOriginList(mapJson.originList);
      setDestinationList(mapJson.destinationList);

      const _routeList = getSortRoutes(routes);
      const activeRoute = _routeList[activeRouteIndex];
      const pathList = getPathByRoute(activeRoute);

      return pathList;
    } catch (e) {
      return [];
    }
  };

  const formatMapData = (data: IListShippingRecordResponse) => {
    const curActualPoints = getPointsByRecord(data?.shippingRecordVoList ?? []);
    setActualPoints(curActualPoints);

    const curGoogleMapPoints = getPointsBySelect(data?.mapJsonStr);
    setGoogleMapPoints(curGoogleMapPoints);
  };

  const fetchShippingRecordList = async (record: IWaybillListItem) => {
    setAddRecordLoading(true);
    const { id, plateNumber, hasGps } = record;
    const res = await listShippingRecord({
      hasGps,
      waybillId: id,
      plateNumber: plateNumber, // IOE691,
    }).finally(() => setAddRecordLoading(false));

    if (res.code === 200) {
      formatMapData(res.data);
      setAddRecordModalOpen(true);
    }
  };

  const onAddRecord = async (record: IWaybillListItem) => {
    setActiveRecord(record);

    if (
      SHOW_SHIPPING_RECORD_CARD.includes(record.status) ||
      (record?.status === WaybillStatusEnum.CANCELED &&
        record?.preStatus !== WaybillStatusEnum.PENDING &&
        record?.preStatus !== WaybillStatusEnum.PLANNING)
    ) {
      fetchShippingRecordList(record);
    } else {
      setAddRecordModalOpen(true);
    }
  };

  const flattenStandardTree = (tree: IOriginVoListItem[]) => {
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

  const formatStandardRouteRes = (
    originVos: IOriginVoListItem[],
    originStopPoints: IRouteOriginAndDestinationListItem[],
    destinationStopPoints: IRouteOriginAndDestinationListItem[],
  ) => {
    const flattenList = flattenStandardTree(originVos);
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

    // level3List的每一项都有waypoint这个属性，它是string，如果存在相同的，就过滤掉
    const level3ListMap = new Map();
    level3List.forEach((item) => {
      level3ListMap.set(item.waypoint, item);
    });

    setPlanRouteInitialValue({
      selectedTree: selectedTree,
      selectedOrigins: level1List,
      selectedOriginStopPoints: originStopPoints,
      selectedDestinations: level2List,
      selectedDestinationStopPoints: destinationStopPoints,
      selectedWaypoints: level3List,
    });
  };

  const fetchPlanRoute = async (record: IWaybillListItem) => {
    setPlanRouteLoading(true);
    const res = await waybillRouteDetail({ id: record.id }).finally(() => {
      setPlanRouteLoading(false);
    });

    if (res.code === 200) {
      const { originVos, originStopPoints, destinationStopPoints } = res.data;

      formatStandardRouteRes(
        originVos ?? [],
        originStopPoints ?? [],
        destinationStopPoints ?? [],
      );

      setRouteEditStepsModalOpen(true);
    }
  };

  const initStandardPlanRoute = (record: IWaybillListItem) => {
    if (FINAL_STATUS_LIST.includes(record?.status)) {
      setRouteEditStepsModalOpen(true);
    } else {
      fetchPlanRoute(record);
    }
  };

  const initTemporaryPlanRoute = async (record: IWaybillListItem) => {
    setPlanRouteLoading(true);
    const res = await waybillRouteTemporaryDetail({
      id: record.id,
    }).finally(() => {
      setPlanRouteLoading(false);
    });
    if (res.code === 200) {
      const { routeCode, origins, destinations } = res.data;

      const selectedOrigins = origins?.map((item) => {
        return {
          ...item,
          vid: String(item.id),
        };
      });
      const selectedDestinations = destinations?.map((item) => {
        return {
          ...item,
          vid: String(item.id),
        };
      });
      setPlanRouteInitialValue({
        routeCode,
        selectedOrigins,
        selectedDestinations,
      });

      setRouteEditStepsModalOpen(true);
    }
  };

  const onPlanRoute = async (record: IWaybillListItem) => {
    setActiveRecord(record);

    // check对应的 route lib 是否正在执行导入
    setPlanRouteLoading(true);
    const res = await checkRouteLibImportingStatus({
      id: record.id,
    }).finally(() => {
      setPlanRouteLoading(false);
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
        if (isStandardWaybill(record)) {
          initStandardPlanRoute(record);
        } else if (isTemporaryWaybill(record)) {
          initTemporaryPlanRoute(record);
        } else {
          console.error('error: unknown waybill dispatch type');
        }
      }
    }
  };

  const waybillSubmit = async (record: IWaybillListItem) => {
    setActiveRecord(record);

    setSubmitLoading(true);
    const check = await checkSubmit({ id: record.id });
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
              res = await toSubmit({ id: record.id }).finally(() => {
                setSubmitLoading(false);
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
                  getDataSource();
                } else {
                  message.success('Submit successfully!');
                  getDataSource();
                }
              }
            },
            onCancel() {
              setSubmitLoading(false);
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
          setSubmitLoading(false);
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
          setSubmitLoading(false);
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
          setSubmitLoading(false);
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
          setSubmitLoading(false);
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
              res = await toSubmit({ id: record.id }).finally(() => {
                setSubmitLoading(false);
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
                  getDataSource();
                } else {
                  message.success('Submit successfully!');
                  getDataSource();
                }
              }
            },
          });
          setSubmitLoading(false);
          break;
      }
    } else {
      setSubmitLoading(false);
    }
  };

  const waybillStart = async (record: IWaybillListItem) => {
    setActiveRecord(record);

    modal.confirm({
      title: 'Start Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to Start this waybill',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setStartLoading(true);
        const res = await toStart({ id: record.id }).finally(() => {
          setStartLoading(false);
        });
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
              getDataSource();
            } else {
              message.success('Start successfully!');
              getDataSource();
            }
          }
        }
      },
    });
  };

  const confirmDelivery = async (record: IWaybillListItem) => {
    setActiveRecord(record);

    setConfirmDeliveryLoading(true);
    const check = await checkShippingRecord({
      waybillId: record.id,
      projectId: record.projectId,
    }).finally(() => {
      setConfirmDeliveryLoading(false);
    });
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
                waybillId: record.id,
                countryId: countryId,
                projectId: record.projectId,
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
                  getDataSource();
                } else {
                  message.success('Confirm delivery successfully!');
                  getDataSource();
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

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        valuePropName: 'name',
      },
      width: 130,
      fixed: 'left',
      render: (_, record) => {
        const showDetail =
          access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_DETAIL];

        return (
          <CustomTooltip title={record.waybillNumber}>
            {showDetail ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  openNewTag(
                    `${PATHS.WAYBILL_LIST_DETAIL}/${record.id}?type=blank`,
                  );
                }}
              >
                {record.waybillNumber}
              </Button>
            ) : (
              record.waybillNumber
            )}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Code',
      dataIndex: 'customerCode',
      width: 270,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        const list = aggregateToJsonArray(record.customerCodeVos);
        const customerCode =
          list.reduce((acc, cur, index) => {
            const curStr = !!cur.numbers
              ? `${cur.customerCodeType}:${cur.numbers}`
              : '';
            return `${acc}${index !== 0 && curStr && acc ? ',' : ''}${curStr}`;
          }, '') || '';

        return (
          <CustomTooltip
            title={customerCode}
            rootClassName={styles.customerCodePopover}
          >
            {customerCode}
          </CustomTooltip>
        );
      },
    },
    {
      title: () => {
        return (
          <>
            <span>Risk Level </span>
            <Tooltip
              title={
                'Risk Level = 1 + Hours Late × 0.5 + MAX(0, Hours Late - 12) × 1.0 +  Driver Delivered Waybill Number × (-0.005) + Vendor Delivered Waybill Number  × (-0.002)'
              }
              placement="top"
            >
              <span style={{ margin: '0 2px' }}>
                <InfoCircleOutlined />
              </span>
            </Tooltip>
          </>
        );
      },
      width: 200,
      dataIndex: 'riskLevel',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomTooltip title={formatAmount(record.riskLevel)} placement="top">
            {formatAmount(record.riskLevel)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Position Time',
      dataIndex: 'positionTime',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <CustomTooltip title={record.positionTime}>
          {record.positionTime}
        </CustomTooltip>
      ),
    },
    {
      title: 'Unloading Time',
      dataIndex: 'unloadingCompletionTime',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <CustomTooltip title={record.unloadingCompletionTime}>
          {record.unloadingCompletionTime}
        </CustomTooltip>
      ),
    },
    {
      title: 'Financial Status',
      dataIndex: 'financialStatus',
      ellipsis: {
        showTitle: false,
      },
      width: 210,
      render: (_, record) => {
        const status: WaybillFinancialStatusEnum = record.financialStatus;
        const Content = (
          <Badge
            color={WaybillFinancialStatusEnumTextColor[status]}
            text={WaybillFinancialStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Origin Region',
      dataIndex: 'originRegion',
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.originRegion}>
          {record.originRegion ? record.originRegion : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Destination Region',
      dataIndex: 'destinationRegion',
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.destinationRegion}>
          {record.destinationRegion ? record.destinationRegion : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.plateNumber}>
          {record.plateNumber ? record.plateNumber : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorName}>
            {record.vendorName ? record.vendorName : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Actual Truck Type',
      dataIndex: 'truckTypeName',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.truckTypeName}>
          {record.truckTypeName ? record.truckTypeName : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Driver Name',
      dataIndex: 'driverName',
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.driverName}>
            {record.driverName ? record.driverName : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Dispatch Type',
      dataIndex: 'dispatchType',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.createdAt}>
            {record.createdAt}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Transportation Status',
      dataIndex: 'status',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const status: WaybillStatusEnum = record.status;
        const Content = (
          <Badge
            color={WaybillStatusEnumTextColor[status]}
            text={WaybillStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable: !(
        access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_DETAIL] ||
        access[PermissionEnum.STANDARD_WAYBILL_SUBMIT] ||
        access[PermissionEnum.TEMPORARY_WAYBILL_SUBMIT] ||
        access[PermissionEnum.STANDARD_WAYBILL_START] ||
        access[PermissionEnum.TEMPORARY_WAYBILL_START] ||
        access[PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING] ||
        access[PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING] ||
        access[PermissionEnum.STANDARD_WAYBILL_MANAGE_POD] ||
        access[PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD] ||
        access[PermissionEnum.STANDARD_WAYBILL_ADD_RECORD] ||
        access[PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD]
      ),
      width: 320,
      render: (_, record) => {
        const showDetail =
          access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_DETAIL];

        const showSubmit =
          (isStandardWaybill(record)
            ? access[PermissionEnum.STANDARD_WAYBILL_SUBMIT]
            : access[PermissionEnum.TEMPORARY_WAYBILL_SUBMIT]) &&
          record?.status === WaybillStatusEnum.PLANNING;

        const showStart =
          (isStandardWaybill(record)
            ? access[PermissionEnum.STANDARD_WAYBILL_START]
            : access[PermissionEnum.TEMPORARY_WAYBILL_START]) &&
          record?.status === WaybillStatusEnum.PENDING;

        const showPlanRoute =
          (isStandardWaybill(record)
            ? access[PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING]
            : access[PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING]) &&
          ((record?.financialStatus ===
            WaybillFinancialStatusEnum.NOT_STARTED &&
            record?.status === WaybillStatusEnum.PLANNING) ||
            (record?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              record?.status === WaybillStatusEnum.PENDING) ||
            (record?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              record?.status === WaybillStatusEnum.IN_TRANSIT) ||
            record?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY ||
            record?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION);

        const showConfirmDelivery =
          (isStandardWaybill(record)
            ? access[PermissionEnum.STANDARD_WAYBILL_MANAGE_POD]
            : access[PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD]) &&
          record?.status === WaybillStatusEnum.IN_TRANSIT;

        const showAddRecord =
          (isStandardWaybill(record)
            ? access[PermissionEnum.STANDARD_WAYBILL_ADD_RECORD]
            : access[PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD]) &&
          record?.financialStatus === WaybillFinancialStatusEnum.NOT_STARTED &&
          record?.status === WaybillStatusEnum.IN_TRANSIT;

        return (
          <Space split={<Divider type="vertical" />} align="center" size={0}>
            {showDetail && (
              <Tooltip title="Details">
                <Button
                  className={styles.operateBtn}
                  color="primary"
                  variant="link"
                  style={{ padding: 0 }}
                  onClick={() => {
                    openNewTag(
                      `${PATHS.WAYBILL_LIST_DETAIL}/${record.id}?type=blank`,
                    );
                  }}
                >
                  Details
                </Button>
              </Tooltip>
            )}

            {showSubmit && (
              <Tooltip title="Submit">
                <Button
                  className={styles.operateBtn}
                  color="primary"
                  variant="link"
                  loading={activeRecord?.id === record.id && submitLoading}
                  onClick={() => waybillSubmit(record)}
                >
                  <span className="btn-text">Submit</span>
                </Button>
              </Tooltip>
            )}

            {showStart && (
              <Tooltip title="Start">
                <Button
                  className={styles.operateBtn}
                  color="primary"
                  variant="link"
                  loading={activeRecord?.id === record.id && startLoading}
                  onClick={() => waybillStart(record)}
                >
                  <span className="btn-text">Start</span>
                </Button>
              </Tooltip>
            )}

            {showPlanRoute && (
              <Tooltip title="Plan">
                <Button
                  className={styles.operateBtn}
                  color="primary"
                  variant="link"
                  loading={activeRecord?.id === record.id && planRouteLoading}
                  onClick={() => onPlanRoute(record)}
                >
                  <span className="btn-text">Plan</span>
                </Button>
              </Tooltip>
            )}

            {showConfirmDelivery && (
              <Tooltip title="Confirm Delivery">
                <Button
                  className={styles.operateBtn}
                  color="primary"
                  variant="link"
                  loading={
                    activeRecord?.id === record.id && confirmDeliveryLoading
                  }
                  onClick={() => confirmDelivery(record)}
                >
                  <span className="btn-text">Confirm Delivery</span>
                </Button>
              </Tooltip>
            )}

            {showAddRecord && (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                loading={activeRecord?.id === record.id && addRecordLoading}
                onClick={() => onAddRecord(record)}
              >
                Add Record
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    refresh();
  }, [refreshFlag]);

  useEffect(() => {
    fetchListQuery();
  }, []);

  return (
    <div className={styles.content}>
      <Filter onSearch={onFilterSearch} ref={filterRef} useInDetail />
      <div className="table-content">
        <CustomTable
          noStyle
          columns={columns}
          scroll={{ x: 3500 }}
          loading={loading || filterLoading}
          dataSource={originData.list}
          pagination={{
            showSizeChanger: true,
            current: originData.pageNum,
            pageSize: originData.pageSize,
            total: originData.total,
            onChange: onPaginationChange,
          }}
          getSelectTableItem={(items) => {
            props.getSelectTableItem(items);
          }}
          rowSelection={{ all: true }}
          search={false}
          toolBarRender={false}
          manualRequest
        />
      </div>
      {props.showCopyModal ? (
        <WaybillCopyModal
          bindingProject={{
            id: Number(projectId),
            name: props.projectName,
          }}
          selectedRowKeys={props.selectedRowKeys}
          hideModal={() => props.setShowCopyModalHandle?.()}
          refresh={() => refresh()}
        />
      ) : null}

      {addRecordModalOpen && activeRecord && (
        <WaybillAddRecordModal
          open={addRecordModalOpen}
          isGpsObtain={activeRecord.hasGps === 1}
          projectId={activeRecord?.projectId}
          waybillId={activeRecord?.id}
          destinationTime={activeRecord?.destinationTime}
          actualPoints={actualPoints}
          googleMapPoints={googleMapPoints}
          originList={originList}
          destinationList={destinationList}
          plateNumber={activeRecord?.plateNumber}
          onCancel={() => setAddRecordModalOpen(false)}
          onConfirm={() => {
            setAddRecordModalOpen(false);
            getDataSource();
          }}
        />
      )}

      {isStandardWaybill(activeRecord) && routeEditStepsModalOpen && (
        <RouteEditStepsModal
          open={routeEditStepsModalOpen}
          projectId={activeRecord.projectId}
          waybillId={activeRecord.id}
          initialValue={planRouteInitialValue as IStandardPlanRouteInitialValue}
          onCancel={() => setRouteEditStepsModalOpen(false)}
          onConfirm={() => {
            setRouteEditStepsModalOpen(false);
            getDataSource();
          }}
        />
      )}

      {isTemporaryWaybill(activeRecord) && routeEditStepsModalOpen && (
        <TemporaryStepsModal
          open={routeEditStepsModalOpen}
          projectId={activeRecord.projectId}
          waybillId={activeRecord.id}
          initialValue={
            planRouteInitialValue as ITemporaryPlanRouteInitialValue
          }
          onCancel={() => setRouteEditStepsModalOpen(false)}
          onConfirm={() => {
            setRouteEditStepsModalOpen(false);
            getDataSource();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetailWaybill;
