import { getUserGuidanceUpdate } from '@/api-uam/common';
import { addListQuery, getListQuery } from '@/api/listQuery';
import {
  IListShippingRecordResponse,
  IOriginVoListItem,
  IRouteOriginAndDestinationListItem,
  IShippingRecordVoListItem,
  IWaybillBatchFailedDetailItem,
  IWaybillBatchSubmitOrStartResult,
  IWaybillListItem,
  IWaybillListParams,
  IWaybillRevCostExportParams,
  IWaypointListItem,
} from '@/api/types/waybill';
import {
  checkRouteLibImportingStatus,
  checkShippingRecord,
  checkSubmit,
  createBatchWaybillCreateTemplate,
  getAllWaybillExport,
  getCheckExportNumber,
  getExportRev,
  getWaybillExport,
  getWaybillList,
  listShippingRecord,
  listWaybillBatchCreateStatus,
  toStart,
  toSubmit,
  waybillBatchCheckStatus,
  waybillBatchStartResult,
  waybillBatchSubmitResult,
  waybillConfirmDelivery,
  waybillRouteDetail,
  waybillRouteTemporaryDetail,
} from '@/api/waybill';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, PATHS } from '@/constants';
import {
  BatchCreateWaybillsStatus,
  GetUserGuidanceEnum,
  SHOW_SHIPPING_RECORD_CARD,
  WaybillDispatchTypeEnum,
  WaybillFinancialStatusEnum,
  WaybillFinancialStatusEnumText,
  WaybillFinancialStatusEnumTextColor,
  WaybillStatusEnum,
  WaybillStatusEnumTextColor,
} from '@/enums';
import { ListQueryPageEnum } from '@/enums/listQueryPage';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { useLayoutStyles } from '@/hooks/useLayoutStyles';
import QuickDispatchModal from '@/pages/waybill/components/QuickDispatchModal';
import WaybillCopyModal from '@/pages/waybill/components/WaybillCopyModal';
import WaybillModal from '@/pages/waybill/components/WaybillModal';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { getPathByRoute, getSortRoutes, unzip } from '@/utils/map';
import { formatAmount, openNewTag } from '@/utils/utils';
import {
  ExclamationCircleFilled,
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { Access, useAccess, useModel } from '@umijs/max';
import {
  App,
  Badge,
  Button,
  Divider,
  Flex,
  message,
  Space,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { cloneDeep, default as lodash } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import BatchCreateWaybillsModal from './components/BatchCreateWaybillsModal';
import BatchErrorModal from './components/BatchErrorModal';
import BatchLockModal, { EnumBatchType } from './components/BatchLockModal';
import BatchStartWaybillModal from './components/BatchStartWaybillModal';
import BatchSubmitWaybillModal from './components/BatchSubmitWaybillModal';
import BatchSuccessModal from './components/BatchSuccessModal';
import BatchUpdateWaybill from './components/BatchUpdateWaybill';
import CustomExportModal from './components/CustomExportModal';
import { aggregateToJsonArray } from './components/DetailInformationCard';
import RouteEditStepsModal from './components/DetailRouteCard/RouteEditStepsModal';
import {
  buildTree,
  buildVid,
} from './components/DetailRouteCard/RouteEditStepsModal/support';
import { FINAL_STATUS_LIST } from './components/DetailRouteCard/Standard';
import TemporaryStepsModal from './components/DetailRouteCard/TemporaryStepsModal';
import Filter from './components/Filter';
import { IALL_NEED, IBE_NEED, IFE_NEED } from './components/Filter/constant';
import WaybillAddRecordModal from './components/WaybillAddRecordModal';
import WaybillExportRevCostModal from './components/WaybillExportRevCostModal';
import styles from './styles.less';

export type IStandardPlanRouteInitialValue = {
  selectedTree: IRouteOriginAndDestinationListItem[];
  selectedOrigins: IRouteOriginAndDestinationListItem[];
  selectedOriginStopPoints: IRouteOriginAndDestinationListItem[];
  selectedDestinations: IRouteOriginAndDestinationListItem[];
  selectedDestinationStopPoints: IRouteOriginAndDestinationListItem[];
  selectedWaypoints: IWaypointListItem[];
};

export type ITemporaryPlanRouteInitialValue = {
  routeCode: string;
  selectedOrigins: IRouteOriginAndDestinationListItem[];
  selectedDestinations: IRouteOriginAndDestinationListItem[];
};

export type IPlanRouteInitialValue =
  | IStandardPlanRouteInitialValue
  | ITemporaryPlanRouteInitialValue;

export const isStandardWaybill = (
  record?: IWaybillListItem,
): record is IWaybillListItem => {
  return record?.dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH;
};

export const isTemporaryWaybill = (
  record?: IWaybillListItem,
): record is IWaybillListItem => {
  return record?.dispatchType === WaybillDispatchTypeEnum.TEMPORARY_DISPATCH;
};

const topClassName = 'use-waybill-list';

const WaybillList: React.FC = () => {
  const access = useAccess();
  const { modal } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const countryId = (initialState?.currentUser?.countryId as number) ?? 1;
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const { addClassName, removeClassName } = useLayoutStyles();
  const [originData, setOriginData] =
    useState<PaginationResponse<IWaybillListItem>>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [showDispatch, setShowDispatch] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBatchAddModal, setShowBatchAddModal] = useState<boolean>(false);
  const [showRevCostModal, setShowRevCostModal] = useState<boolean>(false);
  const [waybillTemplateUrl, setWaybillTemplateUrl] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [tableSelect, setTableSelect] = useState<{
    ids: [];
    options: IWaybillListItem[];
  }>({
    ids: [],
    options: [],
  });
  const [batchCreateWaybillLoading, setBatchCreateWaybillLoading] =
    useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportAllLoading, setExportAllLoading] = useState<boolean>(false);
  const [exportRevCostLoading, setExportRevCostLoading] =
    useState<boolean>(false);

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

  const [batchSubmitModalOpen, setBatchSubmitModalOpen] =
    useState<boolean>(false);
  const [batchSubmitBtnLoading, setBatchSubmitBtnLoading] =
    useState<boolean>(false);
  const [batchSubmitUsefulIdList, setBatchSubmitUsefulIdList] = useState<
    number[]
  >([]);
  const [batchStartModalOpen, setBatchStartModalOpen] =
    useState<boolean>(false);
  const [batchStartBtnLoading, setBatchStartBtnLoading] =
    useState<boolean>(false);
  const [batchStartUsefulIdList, setBatchStartUsefulIdList] = useState<
    number[]
  >([]);
  const [batchUpdateModalOpen, setBatchUpdateModalOpen] =
    useState<boolean>(false);
  const [batchType, setBatchType] = useState<EnumBatchType>(
    EnumBatchType.SUBMIT,
  );
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [batchErrorModalOpen, setBatchErrorModalOpen] = useState(false);
  const [batchSuccessModalOpen, setBatchSuccessModalOpen] = useState(false);
  const [failedDetailList, setFailedDetailList] = useState<
    IWaybillBatchFailedDetailItem[]
  >([]);
  const [batchResultLoading, setBatchResultLoading] = useState(false);
  const [neverBatchSubmit, setNeverBatchSubmit] = useState(true);
  const [neverBatchStart, setNeverBatchStart] = useState(true);
  const [batchSubmitOpen, setBatchSubmitOpen] = useState(false);
  const [batchStartOpen, setBatchStartOpen] = useState(false);
  const [customExportOpen, setCustomExportOpen] = useState(false);

  const FE_NEED_REF = useRef<IFE_NEED>({});
  const BE_NEED_REF = useRef<IBE_NEED>({});
  const filterRef = useRef<any>();

  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);
  const playRevCostRef = useRef<any>(null);

  // Rev Cost export
  const playRevCostAnimation = useAddAnimation(playRevCostRef, playTargetRef);

  // export  select waybill
  const playStar = useAddAnimation(playSrcRef, playTargetRef);

  const playRevCostAnimationHandle = () => {
    playRevCostAnimation(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const playAnimation = () => {
    playStar(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  // 获取选择数据
  const getSelectItem = (values: { ids: []; options: [] }) => {
    console.log({ values });
    setTableSelect(values);
  };

  // 检查批量导入运单状态
  const onCheckBatchCreateWaybill = async () => {
    setBatchCreateWaybillLoading(true);
    const res = await listWaybillBatchCreateStatus();
    const urlRes = await createBatchWaybillCreateTemplate();
    setBatchCreateWaybillLoading(false);
    if (res.code === 200 && urlRes.code === 200) {
      if (res.data?.importStatus === BatchCreateWaybillsStatus.IMPORTING) {
        message.warning('Importing, please wait a moment');
        return;
      }
      if (!urlRes.data) {
        message.error(
          'Drive address generation failed, please try again later',
        );
        return;
      }
      setWaybillTemplateUrl(urlRes.data);
      setShowBatchAddModal(true);
    }
  };

  // 下载文件
  const onExportWaybill = async (ids: number[]) => {
    setExportLoading(true);
    const res = await getWaybillExport({ ids }).finally(() => {
      setExportLoading(false);
    });

    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  };

  // 检查文件
  const onCheckExportWaybill = async () => {
    const waybillNumber = tableSelect?.options;
    const ids = waybillNumber?.map((i: { id: number }) => i.id);

    if (ids?.length === 0) {
      message.error('Please select the waybill to be exported first');
      return;
    }
    if (ids?.length > 30000) {
      message.error('The number of selected waybills must not exceed 30,000');
      return;
    }
    modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleFilled />,
      width: 500,
      content: (
        <>
          <p>
            Confirm to generate files for the currently selected
            <strong> {ids?.length}</strong> waybills
          </p>
        </>
      ),
      okText: 'Confirm',
      cancelText: 'Cancel',
      okButtonProps: {
        style: { outline: 'none' },
      },
      onOk() {
        onExportWaybill(ids);
      },
      onCancel() {
        // do nothing
      },
    });
  };

  // 下载所有文件
  const onExportAllWaybill = async (params: IBE_NEED) => {
    setExportAllLoading(true);
    const res = await getAllWaybillExport(params).finally(() => {
      setExportAllLoading(false);
    });
    if (res.code === 200) {
      // playAnimation();
      doDownloadCenterAnimate();
    }
  };

  const onCheckExportAllWaybill = async () => {
    const {
      pageNum,
      pageSize,
      projectIdList,
      customerNameIdList,
      customerTagIdList,
      statusList,
      dispatchType,
      positionTimeStart,
      positionTimeEnd,
      creationTimeStart,
      unloadingCompletionTimeStart,
      unloadingCompletionTimeEnd,
      creationTimeEnd,
      customerCode,
      waybillId,
      truckId,
      originPadId,
      originSadId,
      originTadId,
      destinationPadId,
      destinationSadId,
      destinationTadId,
      vendorIdList,
      // podNumber, //
      destinationTimeStart,
      destinationTimeEnd,
      financialStatusList,
      originLabel,
      destinationLabel,
      driverIdList,
      logisticsCategory,
      truckTypeConsistency,
      riskLevelMin,
      riskLevelMax,
    } = BE_NEED_REF.current;
    const payload: IBE_NEED = {
      pageNum,
      pageSize,
      projectIdList,
      customerNameIdList,
      customerTagIdList,
      statusList,
      dispatchType,
      positionTimeStart,
      positionTimeEnd,
      unloadingCompletionTimeStart,
      unloadingCompletionTimeEnd,
      creationTimeStart,
      creationTimeEnd,
      customerCode,
      waybillId,
      truckId,
      originPadId,
      originSadId,
      originTadId,
      destinationPadId,
      destinationSadId,
      destinationTadId,
      vendorIdList,
      // podNumber,
      destinationTimeStart,
      destinationTimeEnd,
      financialStatusList,
      originLabel,
      destinationLabel,
      driverIdList,
      logisticsCategory,
      truckTypeConsistency,
      riskLevelMin,
      riskLevelMax,
    };
    const res = await getCheckExportNumber(payload);
    if (res.code === 200) {
      const { data } = res;
      if (data === 0) {
        message.error('The number of waybills on the current page is 0');
        return;
      }
      if (data > 30000) {
        message.error('The number of waybills must not exceed 30,000');
        return;
      }
      modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleFilled />,
        width: 500,
        content: (
          <>
            <p>
              Confirm to generate files for the currently selected
              <strong> {data}</strong> waybills
            </p>
          </>
        ),
        okText: 'Confirm',
        cancelText: 'Cancel',
        okButtonProps: {
          style: { outline: 'none' },
        },
        onOk() {
          onExportAllWaybill(payload);
        },
        onCancel() {
          // do nothing
        },
      });
    }
  };

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
      listPage: ListQueryPageEnum.WAYBILL_LIST,
      queryHistory: JSON.stringify(query),
    };
    setFilterLoading(true);
    await addListQuery(payload).finally(() => {
      setFilterLoading(false);
    });
  };

  const getDataSource = async () => {
    setLoading(true);
    const payload = BE_NEED_REF.current;
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
      listPage: ListQueryPageEnum.WAYBILL_LIST,
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

  // 重新拉取列表操作
  const tableListReload = () => {
    lodash.set(BE_NEED_REF.current, 'pageNum', DEFAULT_PAGINATION.pageNum);
    lodash.set(BE_NEED_REF.current, 'pageSize', DEFAULT_PAGINATION.pageSize);

    saveListQuery();
    getDataSource();
  };

  const copy = async () => {
    if (!tableSelect?.ids?.length) {
      message.error('Please select the waybill you want to copy');
    } else {
      setShowCopyModal(true);
    }
  };

  const updateWaybills = () => {
    setBatchUpdateModalOpen(true);
  };

  const batchSubmit = async () => {
    setBatchSubmitBtnLoading(true);
    const res = await waybillBatchCheckStatus({
      waybillIdList: tableSelect.ids,
      waybillBatchType: EnumBatchType.SUBMIT,
    }).finally(() => {
      setBatchSubmitBtnLoading(false);
    });

    if (res.code === 200) {
      const usefulIdList = res.data;
      setBatchSubmitUsefulIdList(usefulIdList);

      if (usefulIdList.length > 0) {
        setBatchSubmitModalOpen(true);
      } else {
        message.error('None of the selected waybills can be submitted.');
      }
    }
  };

  const batchStart = async () => {
    setBatchStartBtnLoading(true);
    const res = await waybillBatchCheckStatus({
      waybillIdList: tableSelect.ids,
      waybillBatchType: EnumBatchType.START,
    }).finally(() => {
      setBatchStartBtnLoading(false);
    });

    if (res.code === 200) {
      const usefulIdList = res.data;
      setBatchStartUsefulIdList(usefulIdList);

      if (usefulIdList.length > 0) {
        setBatchStartModalOpen(true);
      } else {
        message.error('None of the selected waybills can be started.');
      }
    }
  };

  const guidanceUpdateHandle = async () => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

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

  const onExportRevCostConfirm = async (v: IWaybillRevCostExportParams) => {
    setExportRevCostLoading(true);
    const res = await getExportRev(v);
    if (res.code === 200) {
      setShowRevCostModal(false);
      setExportRevCostLoading(false);
      // playRevCostAnimationHandle();
    }
  };

  const checkBatchResult = async () => {
    const allSettled: Array<
      Promise<APIJSON<IWaybillBatchSubmitOrStartResult>>
    > = [waybillBatchSubmitResult(), waybillBatchStartResult()];
    Promise.allSettled(allSettled).then(([submitResult, startResult]) => {
      if (submitResult.status === 'fulfilled') {
        if (submitResult.value.code === 200) {
          const { inProcessing } = submitResult.value.data;

          if (inProcessing === true) {
            setBatchType(EnumBatchType.SUBMIT);
            setLockModalOpen(true);
            setNeverBatchSubmit(false);
          } else {
            if (submitResult.value.data.totalNum === null) {
              // 没有批量处理过
              setNeverBatchSubmit(true);
            } else {
              // 批量处理过
              setNeverBatchSubmit(false);
            }
          }
        }
      }

      if (startResult.status === 'fulfilled') {
        if (startResult.value.code === 200) {
          const { inProcessing } = startResult.value.data;

          if (inProcessing === true) {
            setBatchType(EnumBatchType.START);
            setLockModalOpen(true);
            setNeverBatchStart(false);
          } else {
            if (startResult.value.data.totalNum === null) {
              // 没有批量处理过
              setNeverBatchStart(true);
            } else {
              // 批量处理过
              setNeverBatchStart(false);
            }
          }
        }
      }
    });
  };

  const onMenuClick = () => {
    setCustomExportOpen(true);
  };

  const openBatchResult = async (_batchType: EnumBatchType) => {
    setBatchType(_batchType);
    const apiMethod =
      _batchType === EnumBatchType.SUBMIT
        ? waybillBatchSubmitResult
        : waybillBatchStartResult;

    setBatchResultLoading(true);
    const res = await apiMethod().finally(() => {
      setBatchResultLoading(false);
      setBatchSubmitOpen(false);
      setBatchStartOpen(false);
    });

    if (res.code === 200) {
      const {
        totalNum,
        successNum,
        failedNum,
        failedDetailList: _failedDetailList,
      } = res.data;

      if (totalNum !== null) {
        // 展示处理结果
        if (failedNum > 0) {
          setFailedDetailList(_failedDetailList);
          setBatchErrorModalOpen(true);
        } else if (totalNum > 0 && successNum === totalNum) {
          setBatchSuccessModalOpen(true);
        } else {
          // 成功了部分
          // do nothing
        }
      } else {
        // 没有操作过批量操作或者已经看过批量操作结果
      }
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      ellipsis: {
        showTitle: false,
      },
      width: 130,
      fixed: 'left',
      render: (_, record) => {
        const showDetail = access[PermissionEnum.WAYBILL_DETAIL];

        return (
          <CustomTooltip title={record.waybillNumber}>
            {showDetail ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  openNewTag(`${PATHS.WAYBILL_LIST_DETAIL}/${record.id}`);
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
      title: 'Customer Name',
      dataIndex: 'customerName',
      width: 260,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName ? record.customerName : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Tag',
      dataIndex: 'customerTag',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerTag}>
            {record.customerTag ? record.customerTag : '-'}
          </CustomTooltip>
        );
      },
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
      title: 'Origin Label',
      dataIndex: 'originLabel',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.originLabel}>
            {record.originLabel}
          </CustomTooltip>
        );
      },
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
      title: 'Destination Label',
      dataIndex: 'destinationLabel',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.destinationLabel}>
            {record.destinationLabel}
          </CustomTooltip>
        );
      },
    },
    //
    {
      title: 'Required Delivery time',
      dataIndex: 'destinationTime',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return record.destinationTime ? (
          <CustomTooltip
            title={dayjs(record.destinationTime).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.destinationTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        ) : (
          '-'
        );
      },
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
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.vendorName}>
          {record.vendorName ? record.vendorName : '-'}
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
      render: (_, record) => (
        <CustomTooltip title={record.driverName}>
          {record.driverName ? record.driverName : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Dispatch Type',
      dataIndex: 'dispatchType',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.dispatchType}>
          {record.dispatchType ? record.dispatchType : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            title={dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
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
          <Badge color={WaybillStatusEnumTextColor[status]} text={status} />
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
        access[PermissionEnum.WAYBILL_DETAIL] ||
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
        const showDetail = access[PermissionEnum.WAYBILL_DETAIL];

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
                  onClick={() => {
                    openNewTag(`${PATHS.WAYBILL_LIST_DETAIL}/${record.id}`);
                  }}
                >
                  <span className="btn-text">Details</span>
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
              <Tooltip title="Add Record">
                <Button
                  className={styles.operateBtn}
                  color="primary"
                  variant="link"
                  loading={activeRecord?.id === record.id && addRecordLoading}
                  onClick={() => onAddRecord(record)}
                >
                  <span className="btn-text">Add Record</span>
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const toolBarRender = () => {
    return (
      <Flex justify={'space-between'} gap={12} wrap>
        <Space size={8} wrap>
          <Access
            key="create"
            accessible={access[PermissionEnum.CREATE_WAYBILL]}
          >
            <Button type="primary" onClick={() => setShowAddModal(true)}>
              Create Waybill
            </Button>
          </Access>

          <Access
            key="batchCreate"
            accessible={access[PermissionEnum.BATCH_CREATE_WAYBILL]}
          >
            <Button
              type="primary"
              loading={batchCreateWaybillLoading}
              onClick={onCheckBatchCreateWaybill}
            >
              Batch Create Waybills
            </Button>
          </Access>

          <Access
            key="exportRevOrCost"
            accessible={access[PermissionEnum.EXPORT_REV_COST]}
          >
            <Button
              key="exportRevOrCost"
              type="primary"
              loading={exportRevCostLoading}
              onClick={() => {
                if (completedGuidance) {
                  setShowRevCostModal(true);
                } else {
                  playRevCostAnimationHandle();
                  guidanceUpdateHandle();
                  setTimeout(() => {
                    setShowRevCostModal(true);
                  }, 3000);
                }
              }}
              ref={playRevCostRef}
            >
              Export REV/Cost
            </Button>
          </Access>

          <Access
            key="exportAll"
            accessible={access[PermissionEnum.EXPORT_WAYBILL]}
          >
            <Space.Compact>
              <Button
                key="exportAll"
                loading={exportAllLoading}
                onClick={() => {
                  if (completedGuidance) {
                    onCheckExportAllWaybill();
                  } else {
                    playAnimation();
                    guidanceUpdateHandle();
                    setTimeout(() => {
                      onCheckExportAllWaybill();
                    }, 3000);
                  }
                }}
                ref={playSrcRef}
              >
                Export All Waybill
              </Button>

              <Button icon={<SettingOutlined />} onClick={onMenuClick} />
            </Space.Compact>
          </Access>

          <Access
            key="export"
            accessible={access[PermissionEnum.EXPORT_WAYBILL]}
          >
            {' '}
            <Space.Compact>
              <Button
                key="export"
                loading={exportLoading}
                disabled={tableSelect.ids.length === 0}
                onClick={() => {
                  if (completedGuidance) {
                    onCheckExportWaybill();
                  } else {
                    playAnimation();
                    guidanceUpdateHandle();
                    setTimeout(() => {
                      onCheckExportWaybill();
                    }, 3000);
                  }
                }}
                ref={playSrcRef}
              >
                Export Selected Waybill
              </Button>{' '}
              <Button
                disabled={tableSelect.ids.length === 0}
                icon={<SettingOutlined />}
                onClick={onMenuClick}
              />
            </Space.Compact>
          </Access>

          <Access key="copy" accessible={access[PermissionEnum.COPY_WAYBILL]}>
            <Button disabled={tableSelect.ids.length === 0} onClick={copy}>
              Copy Waybill
            </Button>
          </Access>

          <Access
            key="updateWaybills"
            accessible={access[PermissionEnum.UPDATE_WAYBILLS]}
          >
            <Button onClick={updateWaybills}>Update Waybills</Button>
          </Access>
        </Space>

        <Space size={24}>
          <Access
            key="submit"
            accessible={access[PermissionEnum.BATCH_SUBMIT_WAYBILL]}
          >
            <Space
              split={<Divider type="vertical" style={{ margin: 4 }} />}
              align="center"
              size={0}
            >
              <Button
                disabled={tableSelect.ids.length === 0}
                loading={batchSubmitBtnLoading}
                onClick={batchSubmit}
              >
                Submit
              </Button>
              {!neverBatchSubmit && (
                <CustomTooltip
                  trigger={['hover']}
                  destroyTooltipOnHide
                  open={batchSubmitOpen}
                  zIndex={1000}
                  title="View the results of the most recent batch submitted"
                >
                  <Button
                    icon={<HistoryOutlined />}
                    onMouseEnter={() => setBatchSubmitOpen(true)}
                    onMouseLeave={() => setBatchSubmitOpen(false)}
                    onClick={() => openBatchResult(EnumBatchType.SUBMIT)}
                    loading={
                      batchResultLoading && batchType === EnumBatchType.SUBMIT
                    }
                  ></Button>
                </CustomTooltip>
              )}
            </Space>
          </Access>

          <Access
            key="start"
            accessible={access[PermissionEnum.BATCH_START_WAYBILL]}
          >
            <Space
              split={<Divider type="vertical" style={{ margin: 4 }} />}
              align="center"
              size={0}
            >
              <Button
                disabled={tableSelect.ids.length === 0}
                loading={batchStartBtnLoading}
                onClick={batchStart}
              >
                Start
              </Button>
              {!neverBatchStart && (
                <CustomTooltip
                  trigger={['hover']}
                  destroyTooltipOnHide
                  open={batchStartOpen}
                  zIndex={1000}
                  title="View the results of the most recent batch started"
                >
                  <Button
                    icon={<HistoryOutlined />}
                    onMouseEnter={() => setBatchStartOpen(true)}
                    onMouseLeave={() => setBatchStartOpen(false)}
                    onClick={() => openBatchResult(EnumBatchType.START)}
                    loading={
                      batchResultLoading && batchType === EnumBatchType.START
                    }
                  ></Button>
                </CustomTooltip>
              )}
            </Space>
          </Access>
        </Space>
      </Flex>
    );
  };

  const renderPositionTime = useCallback(() => {
    const positionTimeList = tableSelect.options.map(
      (item: IWaybillListItem) => item.positionTime,
    );
    const sortedPositionTimeList = positionTimeList.sort((a, b) => {
      return dayjs(a).isBefore(b) ? -1 : 1;
    });

    const uniqueArray = [...new Set(sortedPositionTimeList)];
    const startTime = uniqueArray[0];
    const endTime = uniqueArray[uniqueArray.length - 1];

    if (uniqueArray?.length > 1) {
      return (
        <span>
          from <span style={{ color: 'rgba(0, 0, 0, .85)' }}>{startTime}</span>{' '}
          to <span style={{ color: 'rgba(0, 0, 0, .85)' }}>{endTime}</span>
        </span>
      );
    } else {
      return <span style={{ color: 'rgba(0, 0, 0, .85)' }}>{startTime}</span>;
    }
  }, [tableSelect]);

  const tableAlertRender = () => {
    return (
      <>
        <div className={styles.customTableAlert}>
          <span className="len">{tableSelect.ids.length}</span> waybill is
          selected, position time {renderPositionTime()}
        </div>
      </>
    );
  };

  useEffect(() => {
    fetchListQuery();
  }, []);

  useEffect(() => {
    playTargetRef.current = document.querySelector('.downloadCenter');
  }, []);

  useEffect(() => {
    addClassName(topClassName);
    return () => {
      removeClassName(topClassName);
    };
  }, []);

  useEffect(() => {
    if (
      access[PermissionEnum.BATCH_SUBMIT_WAYBILL] ||
      access[PermissionEnum.BATCH_START_WAYBILL]
    ) {
      checkBatchResult();
    }
  }, []);

  return (
    <>
      <Filter onSearch={onFilterSearch} ref={filterRef} />
      <div className={styles.toolbar}>{toolBarRender()}</div>
      <CustomTable
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
          getSelectItem(items);
        }}
        rowSelection={{ all: true }}
        search={false}
        toolBarRender={false}
        tableAlertRender={tableAlertRender}
        manualRequest
      />
      {showAddModal ? (
        <WaybillModal
          refresh={() => {
            tableListReload();
          }}
          hideModal={() => setShowAddModal(false)}
        />
      ) : null}
      {showBatchAddModal && (
        <BatchCreateWaybillsModal
          open={showBatchAddModal}
          waybillTemplateUrl={waybillTemplateUrl}
          modalProps={{
            onCancel: () => {
              setShowBatchAddModal(false);
            },
          }}
        />
      )}
      {showCopyModal ? (
        <WaybillCopyModal
          selectedRowKeys={tableSelect?.ids}
          hideModal={() => setShowCopyModal(false)}
          refresh={() => tableListReload()}
        />
      ) : null}

      {showDispatch ? (
        <QuickDispatchModal
          width={680}
          hideModal={() => {
            setShowDispatch(false);
            tableListReload();
          }}
        />
      ) : null}

      {showRevCostModal ? (
        <WaybillExportRevCostModal
          onConfirm={onExportRevCostConfirm}
          modalProps={{
            okText: 'Ok',
            onCancel: () => {
              setShowRevCostModal(false);
              setExportRevCostLoading(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: exportRevCostLoading,
            },
          }}
        />
      ) : null}

      {addRecordModalOpen && activeRecord && (
        <WaybillAddRecordModal
          open={addRecordModalOpen}
          isGpsObtain={activeRecord.hasGps === 1}
          projectId={activeRecord.projectId}
          waybillId={activeRecord.id}
          destinationTime={activeRecord.destinationTime}
          actualPoints={actualPoints}
          googleMapPoints={googleMapPoints}
          originList={originList}
          destinationList={destinationList}
          plateNumber={activeRecord.plateNumber}
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

      <BatchSubmitWaybillModal
        selectedList={tableSelect.options}
        usefulIdList={batchSubmitUsefulIdList}
        open={batchSubmitModalOpen}
        onClose={() => setBatchSubmitModalOpen(false)}
        onFinish={() => {
          getDataSource();
          setNeverBatchSubmit(false);
        }}
      />

      <BatchStartWaybillModal
        selectedList={tableSelect.options}
        usefulIdList={batchStartUsefulIdList}
        open={batchStartModalOpen}
        onClose={() => setBatchStartModalOpen(false)}
        onFinish={() => {
          getDataSource();
          setNeverBatchSubmit(false);
        }}
      />

      <BatchLockModal
        type={batchType}
        open={lockModalOpen}
        onFinish={() => {
          setLockModalOpen(false);
          getDataSource();

          if (batchType === EnumBatchType.SUBMIT) {
            setNeverBatchSubmit(false);
          } else {
            setNeverBatchSubmit(false);
          }
        }}
      />

      <BatchUpdateWaybill
        open={batchUpdateModalOpen}
        onCancel={() => setBatchUpdateModalOpen(false)}
      />

      <BatchErrorModal
        open={batchErrorModalOpen}
        failedDetailList={failedDetailList}
        onCancel={() => {
          setBatchErrorModalOpen(false);
          setBatchSubmitOpen(false);
          setBatchStartOpen(false);
        }}
      />

      <BatchSuccessModal
        open={batchSuccessModalOpen}
        type={batchType}
        onCancel={() => {
          setBatchSuccessModalOpen(false);
          setBatchSubmitOpen(false);
          setBatchStartOpen(false);
        }}
      />
      {customExportOpen ? (
        <CustomExportModal
          open={customExportOpen}
          onCancel={() => {
            setCustomExportOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

export default WaybillList;
