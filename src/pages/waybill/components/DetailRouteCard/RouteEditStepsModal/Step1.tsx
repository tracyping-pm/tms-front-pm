import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { IPlaceGeoRecord } from '@/api/types/place';
import {
  IRouteOriginAndDestinationListItem,
  IWaypointListItem,
} from '@/api/types/waybill';
import {
  getWaybillRouteByCode,
  waybillRouteDestinationList,
  waybillRouteOriginList,
  waybillRouteWaypointList,
} from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { CountryEnumLabelListMap, FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Button, Col, Form, Input, Popover, Row } from 'antd';
import cls from 'classnames';
import { cloneDeep, debounce, default as lodash } from 'lodash';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ResolveAddressModal from './ResolveAddressModal';
import SelectedRoutesModal, {
  ISelectedRouteListDataType,
} from './SelectedRoutesModal';
import { CheckItemView, StatusText, WaypointCheckItemView } from './StatusView';
import styles from './styles.less';
import {
  STEP_EVENTS,
  buildDestinationRouteIds,
  buildOriginRouteIds,
  buildTree,
  deDuplication,
  deleteNodeAndParentIfNoChildren,
  getSelectedRoutesListByPaths,
  getTreeAllPath,
  mixinStopPoints,
  retainLevelTree,
} from './support';

let originAbortController: AbortController | undefined = undefined;
let destinationAbortController: AbortController | undefined = undefined;

const CONTAINER_HEIGHT = 56 * 7;

interface ITableHeader {
  labelLevelList: string[];
  type: 'origin' | 'destination';
}

const TableHeader: FC<ITableHeader> = ({ labelLevelList = [], type }) => {
  const level1Name = labelLevelList?.[1];
  const level2Name = labelLevelList?.[2];
  const level3Name = labelLevelList?.[3];
  const labelName = type === 'origin' ? 'Origin Label' : 'Destination Label';

  return (
    <>
      <div className={styles.tableHeader}>
        <Row gutter={12}>
          <Col span={6}>
            <span
              className={cls('tableHeaderSpan', styles.region)}
              title={level1Name}
            >
              {level1Name}
            </span>
          </Col>
          <Col span={6}>
            <span
              className={cls('tableHeaderSpan', styles.province)}
              title={level2Name}
            >
              {level2Name}
            </span>
          </Col>
          <Col span={6}>
            <span
              className={cls('tableHeaderSpan', styles.city)}
              title={level3Name}
            >
              {level3Name}
            </span>
          </Col>
          <Col span={6}>
            <span
              className={cls('tableHeaderSpan', styles.label)}
              title={labelName}
            >
              {labelName}
            </span>
          </Col>
        </Row>
      </div>
    </>
  );
};

const WaypointTableHeader = () => {
  return (
    <>
      <div className={styles.tableHeader}>
        <span className={cls('tableHeaderSpan', styles.region)}>Waypoint</span>
      </div>
    </>
  );
};

interface ISelectedRoutesModal {
  open: boolean;
  data: ISelectedRouteListDataType[];
}

interface ILabelErrorInfo {
  originLabelError: string | undefined;
  destinationLabelError: string | undefined;
  [k: string]: any;
}

interface IStep1 {
  projectId: number;
  waybillId: number;
  initialValue: {
    selectedTree: IRouteOriginAndDestinationListItem[];
    selectedOrigins: IRouteOriginAndDestinationListItem[];
    selectedOriginStopPoints: IRouteOriginAndDestinationListItem[];
    selectedDestinations: IRouteOriginAndDestinationListItem[];
    selectedDestinationStopPoints: IRouteOriginAndDestinationListItem[];
    selectedWaypoints: IWaypointListItem[];
  };
  doNext: () => void;
  doCancel: () => void;
}

const Step1: FC<IStep1> = ({
  projectId,
  waybillId,
  initialValue,
  doNext,
  doCancel,
}) => {
  const { message } = App.useApp();
  const { publish } = useContext(PubSubContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const filterFormRefForOrigin = useRef<ProFormInstance>();
  const filterFormRefForDestination = useRef<ProFormInstance>();
  const [selectedRouteNum, setSelectedRouteNum] = useState<number>(0);
  // originList options
  const [originListLoading, setOriginListLoading] = useState<boolean>(false);
  const [originList, setOriginList] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);
  const [originRawData, setOriginRawData] = useState<
    PaginationResponse<IRouteOriginAndDestinationListItem>
  >({});
  const pageNumRefForOrigin = useRef<number>(1);

  // destinationList options
  const [destinationListLoading, setDestinationListLoading] =
    useState<boolean>(false);
  const [destinationList, setDestinationList] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);
  const [destinationRawData, setDestinationRawData] = useState<
    PaginationResponse<IRouteOriginAndDestinationListItem>
  >({});
  const pageNumRefForDestination = useRef<number>(1);

  // waypoint
  const [waypointListLoading, setWaypointListLoading] =
    useState<boolean>(false);
  const [waypointList, setWaypointList] = useState<IWaypointListItem[]>([]);
  const [waypointRawData, setWaypointRawData] = useState<
    PaginationResponse<IWaypointListItem>
  >({});
  const pageNumRefForWaypoint = useRef<number>(1);

  // like
  const activeItemOriginRef =
    useRef<IRouteOriginAndDestinationListItem | null>();
  const activeItemDestinationRef =
    useRef<IRouteOriginAndDestinationListItem | null>();
  const activeItemWaypointRef = useRef<IWaypointListItem | null>();

  const cloneValues = cloneDeep(initialValue);

  const selectedTree = useRef<IRouteOriginAndDestinationListItem[]>(
    cloneValues?.selectedTree ?? [],
  );
  const selectedOrigins = useRef<IRouteOriginAndDestinationListItem[]>(
    cloneValues?.selectedOrigins ?? [],
  );
  const selectedDestinations = useRef<IRouteOriginAndDestinationListItem[]>(
    cloneValues?.selectedDestinations ?? [],
  );
  const selectedWaypoints = useRef<IWaypointListItem[]>(
    cloneValues?.selectedWaypoints ?? [],
  );

  // route code filter
  const routeCodeFilterFormRef = useRef<ProFormInstance>();
  const {
    options: routeCodeOptions,
    onSearch: routeCodeSearch,
    defaultFieldProps: routeCodeDefaultFieldProps,
  } = useFieldQuery({
    field: 'routeCode',
    esDtoClass: ES_DTO_CLASS.ROUTE,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
    projectId,
    approved: 1,
  });

  // resolve address
  const [resolveAddressModalOpen, setResolveAddressModalOpen] =
    useState<boolean>(false);
  const resolveAddressTypeRef = useRef<'origin' | 'destination'>('origin');

  // Selected Routes Modal
  const [selectedRoutesModalState, setSelectedRoutesModalState] =
    useSetState<ISelectedRoutesModal>({ open: false, data: [] });

  // Lable Error
  const [labelErrorInfo, setLabelErrorInfo] = useSetState<ILabelErrorInfo>({
    originLabelError: undefined,
    destinationLabelError: undefined,
  });

  const resetDestination = () => {
    activeItemDestinationRef.current = null;
    setDestinationList([]);
    setDestinationRawData({});
    pageNumRefForDestination.current = 1;
    filterFormRefForDestination.current?.resetFields();
  };

  const resetWaypoint = () => {
    activeItemWaypointRef.current = null;
    setWaypointList([]);
    setWaypointRawData({});
    pageNumRefForWaypoint.current = 1;
  };

  // origin
  const fetchDataForOrigin = async () => {
    if (originListLoading || originRawData?.hasNextPage === false) {
      return;
    }
    setOriginListLoading(true);

    const values = filterFormRefForOrigin.current?.getFieldsValue();
    const { padIdQuery, sadIdQuery, tadIdQuery, label } = values ?? {};

    const filters = {
      padIdQuery,
      sadIdQuery,
      tadIdQuery,
      label: label || undefined,
    };
    const payload = {
      waybillId,
      pageNum: pageNumRefForOrigin.current,
      pageSize: 10,
      ...filters,
    };
    const res = await waybillRouteOriginList(payload);
    setOriginListLoading(false);
    pageNumRefForOrigin.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = originList.concat(list);
      setOriginList(newData);
      setOriginRawData(res.data);
    }
  };

  const onScrollForOrigin = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      CONTAINER_HEIGHT
    ) {
      fetchDataForOrigin();
    }
  };

  const doSearchForOrigin = async (params?: {
    padIdQuery?: number;
    sadIdQuery?: number;
    tadIdQuery?: number;
    label?: string;
  }) => {
    if (originAbortController) {
      originAbortController?.abort?.();
    }
    originAbortController = new AbortController();
    const { signal } = originAbortController;

    activeItemOriginRef.current = null;
    resetDestination();
    resetWaypoint();

    pageNumRefForOrigin.current = 1;

    setOriginListLoading(true);
    setOriginList([]);
    const payload = {
      ...params,
      waybillId,
      pageNum: 1,
      pageSize: 10,
    };
    const res = await waybillRouteOriginList(payload, signal);
    setOriginListLoading(false);
    pageNumRefForOrigin.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      setOriginList(list);
      setOriginRawData(res.data);
    }
  };

  const doResetFormOrigin = useCallback(() => {
    routeCodeFilterFormRef.current?.resetFields();
    filterFormRefForOrigin.current?.resetFields();
    doSearchForOrigin();
  }, []);

  const onFilterSelectOrigin = useCallback(
    debounce(async () => {
      await filterFormRefForOrigin.current?.validateFields();
      const values = filterFormRefForOrigin.current?.getFieldsValue();
      const { padIdQuery, sadIdQuery, tadIdQuery, label } = values;
      const params = {
        padIdQuery,
        sadIdQuery,
        tadIdQuery,
        label: label || undefined,
      };
      doSearchForOrigin(params);
      routeCodeFilterFormRef.current?.resetFields();
    }, 300),
    [],
  );

  const onPadChangeForOrigin = useCallback(() => {
    filterFormRefForOrigin.current?.setFieldValue('sadIdQuery', undefined);
    filterFormRefForOrigin.current?.setFieldValue('tadIdQuery', undefined);
    onFilterSelectOrigin();
  }, []);

  const onSadChangeForOrigin = useCallback(() => {
    filterFormRefForOrigin.current?.setFieldValue('tadIdQuery', undefined);
    onFilterSelectOrigin();
  }, []);

  // destination
  const fetchDataForDestination = async () => {
    if (destinationListLoading || destinationRawData?.hasNextPage === false) {
      return;
    }
    setDestinationListLoading(true);
    const values = filterFormRefForDestination.current?.getFieldsValue();
    const { padIdQuery, sadIdQuery, tadIdQuery, label } = values ?? {};
    const filters = {
      padIdQuery,
      sadIdQuery,
      tadIdQuery,
      label: label || undefined,
    };
    const payload = {
      waybillId,
      routeId: Number(activeItemOriginRef.current?.routeId),
      pageNum: pageNumRefForDestination.current,
      pageSize: 10,
      ...filters,
    };
    const res = await waybillRouteDestinationList(payload);
    setDestinationListLoading(false);
    pageNumRefForDestination.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = destinationList.concat(list);
      setDestinationList(newData);
      setDestinationRawData(res.data);
    }
  };

  const fetchDataForDestinationByReset = async () => {
    pageNumRefForDestination.current = 1;
    setDestinationListLoading(true);
    setDestinationList([]);
    const payload = {
      waybillId,
      routeId: Number(activeItemOriginRef.current?.routeId),
      pageNum: 1,
      pageSize: 10,
    };
    const res = await waybillRouteDestinationList(payload);
    setDestinationListLoading(false);
    pageNumRefForDestination.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      setDestinationList(list);
      setDestinationRawData(res.data);
    }
  };

  const onScrollForDestination = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      CONTAINER_HEIGHT
    ) {
      fetchDataForDestination();
    }
  };

  const doSearchForDestination = async (params?: {
    padIdQuery?: number;
    sadIdQuery?: number;
    tadIdQuery?: number;
    label?: string;
  }) => {
    if (destinationAbortController) {
      destinationAbortController?.abort?.();
    }
    destinationAbortController = new AbortController();
    const { signal } = destinationAbortController;

    pageNumRefForDestination.current = 1;

    setDestinationListLoading(true);
    setDestinationList([]);
    const payload = {
      ...params,
      routeId: Number(activeItemOriginRef.current?.routeId),
      waybillId,
      pageNum: 1,
      pageSize: 10,
    };
    const res = await waybillRouteDestinationList(payload, signal);
    setDestinationListLoading(false);
    pageNumRefForDestination.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      setDestinationList(list);
      setDestinationRawData(res.data);
    }
  };

  const doResetFormDestination = useCallback(() => {
    routeCodeFilterFormRef.current?.resetFields();
    filterFormRefForDestination.current?.resetFields();
    doSearchForDestination();
  }, []);

  const onFilterSelectDestination = useCallback(
    debounce(async () => {
      await filterFormRefForDestination.current?.validateFields?.();
      const values = filterFormRefForDestination.current?.getFieldsValue();
      const { padIdQuery, sadIdQuery, tadIdQuery, label } = values;
      const params = {
        padIdQuery,
        sadIdQuery,
        tadIdQuery,
        label: label || undefined,
      };
      doSearchForDestination(params);
    }, 300),
    [],
  );

  const onPadChangeForDestination = useCallback(() => {
    filterFormRefForDestination.current?.setFieldValue('sadIdQuery', undefined);
    filterFormRefForDestination.current?.setFieldValue('tadIdQuery', undefined);
    onFilterSelectDestination();
  }, []);

  const onSadChangeForDestination = useCallback(() => {
    filterFormRefForDestination.current?.setFieldValue('tadIdQuery', undefined);
    onFilterSelectDestination();
  }, []);

  // waypoint
  const fetchDataForWaypoint = async () => {
    if (waypointListLoading || waypointRawData?.hasNextPage === false) {
      return;
    }
    setWaypointListLoading(true);
    const payload = {
      waybillId,
      routeId: Number(activeItemDestinationRef.current?.routeId),
      pageNum: pageNumRefForWaypoint.current,
      pageSize: 10,
    };
    const res = await waybillRouteWaypointList(payload);
    setWaypointListLoading(false);
    pageNumRefForWaypoint.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = waypointList.concat(list);
      setWaypointList(newData);
      setWaypointRawData(res.data);
    }
  };

  const fetchDataForWaypointByReset = async () => {
    pageNumRefForWaypoint.current = 1;
    setWaypointListLoading(true);
    setWaypointList([]);
    setWaypointListLoading(true);
    const payload = {
      waybillId,
      routeId: Number(activeItemDestinationRef.current?.routeId),
      pageNum: 1,
      pageSize: 10,
    };
    const res = await waybillRouteWaypointList(payload);
    setWaypointListLoading(false);
    pageNumRefForWaypoint.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      setWaypointList(list);
      setWaypointRawData(res.data);
    }
  };

  const onScrollForWaypoint = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      CONTAINER_HEIGHT
    ) {
      fetchDataForWaypoint();
    }
  };

  // like
  const doCheck = () => {
    setOriginList([...originList]);
    setDestinationList([...destinationList]);
    setWaypointList([...waypointList]);
  };

  const handleClickOriginItem = (item: IRouteOriginAndDestinationListItem) => {
    if (activeItemOriginRef.current?.vid === item.vid) {
      return;
    }
    activeItemOriginRef.current = item;
    resetDestination();
    resetWaypoint();
    fetchDataForDestinationByReset();
  };

  const handleClickDestinationItem = async (
    item: IRouteOriginAndDestinationListItem,
  ) => {
    if (activeItemDestinationRef.current?.vid === item.vid) {
      return;
    }
    item.parentId = activeItemOriginRef.current?.vid;
    activeItemDestinationRef.current = item;
    resetWaypoint();
    fetchDataForWaypointByReset();
  };

  const handleClickWayPointItem = (item: IWaypointListItem) => {
    item.parentId = activeItemDestinationRef.current?.vid;
    activeItemWaypointRef.current = item;
    const isExist = selectedWaypoints.current?.some((i) => i.vid === item.vid);

    if (isExist) {
      const tree1 = selectedTree.current;
      const tree = deleteNodeAndParentIfNoChildren(tree1, item.vid, 'vid');
      selectedTree.current = cloneDeep(tree);
      selectedOrigins.current = retainLevelTree(tree, 1);
      selectedDestinations.current = retainLevelTree(tree, 2);
      selectedWaypoints.current = retainLevelTree(tree, 3);
      doCheck();
    } else {
      // 勾选origin
      selectedOrigins.current.push(activeItemOriginRef.current!);
      // 去重
      selectedOrigins.current = deDuplication(selectedOrigins.current, 'vid');
      // 勾选destination
      selectedDestinations.current.push(activeItemDestinationRef.current!);
      // 去重
      selectedDestinations.current = deDuplication(
        selectedDestinations.current,
        'vid',
      );
      // 勾选waypoint
      selectedWaypoints.current.push(item);
      const flatten = [
        ...selectedOrigins.current,
        ...selectedDestinations.current,
        ...selectedWaypoints.current,
      ];
      const tree = buildTree(flatten, 'vid');
      selectedTree.current = cloneDeep(tree);
      selectedOrigins.current = retainLevelTree(tree, 1);
      selectedDestinations.current = retainLevelTree(tree, 2);
      selectedWaypoints.current = retainLevelTree(tree, 3);
      doCheck();
    }
  };

  const waypointSelectedByDefault = (item: IWaypointListItem) => {
    item.parentId = activeItemDestinationRef.current?.vid;

    // 勾选origin
    selectedOrigins.current.push(activeItemOriginRef.current!);
    // 去重
    selectedOrigins.current = deDuplication(selectedOrigins.current, 'vid');
    // 勾选destination
    selectedDestinations.current.push(activeItemDestinationRef.current!);
    // 去重
    selectedDestinations.current = deDuplication(
      selectedDestinations.current,
      'vid',
    );
    // 勾选waypoint
    selectedWaypoints.current.push(item);
    const flatten = [
      ...selectedOrigins.current,
      ...selectedDestinations.current,
      ...selectedWaypoints.current,
    ];
    const tree = buildTree(flatten, 'vid');
    selectedTree.current = cloneDeep(tree);
    selectedOrigins.current = retainLevelTree(tree, 1);
    selectedDestinations.current = retainLevelTree(tree, 2);
    selectedWaypoints.current = retainLevelTree(tree, 3);
    doCheck();
  };

  const resolveAddress = (type: 'origin' | 'destination') => {
    resolveAddressTypeRef.current = type;
    setResolveAddressModalOpen(true);
  };

  const onStarted = async (payload: any) => {
    setResolveAddressModalOpen(false);
    const formRef =
      resolveAddressTypeRef.current === 'origin'
        ? filterFormRefForOrigin
        : filterFormRefForDestination;
    const { level, lat, lng } = payload;
    const params = {
      level,
      lat,
      lng,
    };
    const res = await placeGeoResolveAddressResult(params);
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        padIdQuery: res.data.pad,
        sadIdQuery: res.data.sad,
        tadIdQuery: res.data.tad,
      });
      if (resolveAddressTypeRef.current === 'origin') {
        onFilterSelectOrigin();
      } else {
        onFilterSelectDestination();
      }
    }
  };

  const fetchRouteDataByCode = async (params: any) => {
    setOriginListLoading(true);
    setDestinationListLoading(true);
    setWaypointListLoading(true);

    setOriginList([]);
    setDestinationList([]);
    setWaypointList([]);

    const payload = {
      waybillId: waybillId,
      routeCode: params.routeCode,
    };
    const res = await getWaybillRouteByCode(payload);
    setOriginListLoading(false);
    setDestinationListLoading(false);
    setWaypointListLoading(false);

    if (res.code === 200) {
      if (lodash.isEmpty(res.data)) {
        message.warning('Unable to find related Route');
        return;
      } else {
        const { origin, destination, waypoint } = res.data;

        if (
          lodash.isEmpty(origin) ||
          lodash.isEmpty(destination) ||
          lodash.isEmpty(waypoint)
        ) {
          console.error('route data is empty');
          return;
        }
        message.success('Route has been found and selected');

        lodash.set(origin, 'level', 1);
        lodash.set(destination, 'level', 2);
        lodash.set(waypoint, 'level', 3);

        lodash.set(origin, 'parentId', null);
        lodash.set(destination, 'parentId', origin.vid);
        lodash.set(waypoint, 'parentId', destination.vid);

        activeItemOriginRef.current = origin;
        activeItemDestinationRef.current = destination;
        activeItemWaypointRef.current = waypoint;

        // 选中逻辑，操作selectedTree数据模型
        selectedOrigins.current.push(activeItemOriginRef.current);
        selectedDestinations.current.push(activeItemDestinationRef.current);
        selectedWaypoints.current.push(activeItemWaypointRef.current);

        const flatten = [
          ...selectedOrigins.current,
          ...selectedDestinations.current,
          ...selectedWaypoints.current,
        ];
        // 去重
        const uniqFlatten = deDuplication(flatten, 'vid');
        const tree = buildTree(uniqFlatten, 'vid');
        selectedTree.current = cloneDeep(tree);
        selectedOrigins.current = retainLevelTree(tree, 1);
        selectedDestinations.current = retainLevelTree(tree, 2);
        selectedWaypoints.current = retainLevelTree(tree, 3);

        setOriginList([origin]);
        setDestinationList([destination]);
        setWaypointList([waypoint]);
      }
    }
  };

  const handleRouteCodeSearch = async () => {
    await routeCodeFilterFormRef.current?.validateFields();
    const values = routeCodeFilterFormRef.current?.getFieldsValue?.();
    const { routeCode } = values ?? {};

    const params = {
      routeCode: routeCode?.name,
    };
    fetchRouteDataByCode(params);
  };

  const routeCodeReset = () => {
    doResetFormOrigin();
  };

  const validatorLabel = (
    value: string | undefined,
    type: 'origin' | 'destination',
  ) => {
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const fieldName = `${type}LabelError`;
    const maxLengInfo = `${capitalizeFirstLetter(type)} Label cannot exceed ${
      MAX_LENGTH.MAX_1000
    } characters`;

    const trimValue = String(value).trim();

    if (value === undefined) {
      setLabelErrorInfo({
        [fieldName]: undefined,
      });
      return Promise.resolve();
    } else if (value?.length > 0 && trimValue.length === 0) {
      setLabelErrorInfo({
        [fieldName]: 'Cannot only contain spaces',
      });
      return Promise.reject('Cannot only contain spaces');
    } else if (value?.length > MAX_LENGTH.MAX_1000) {
      setLabelErrorInfo({
        [fieldName]: maxLengInfo,
      });
      return Promise.reject(maxLengInfo);
    } else {
      setLabelErrorInfo({
        [fieldName]: undefined,
      });
      return Promise.resolve();
    }
  };

  const handleSelectedRoutesClick = () => {
    const tree = cloneDeep(selectedTree.current ?? []);
    const paths = getTreeAllPath(tree);
    const data = getSelectedRoutesListByPaths(paths);

    setSelectedRoutesModalState({ open: true, data: data });
  };

  const handleNext = useCallback(() => {
    if (
      !selectedOrigins.current?.length ||
      !selectedDestinations.current?.length ||
      !selectedWaypoints.current?.length
    ) {
      message.error('Please select at least one origin and destination');
      return;
    }

    const retainSelectedOrigins =
      retainLevelTree(selectedTree.current, 1) ?? [];
    const retainSelectedDestinations =
      retainLevelTree(selectedTree.current, 2) ?? [];

    // 添加routeIds字段
    const normalSelectedOrigins = buildOriginRouteIds(retainSelectedOrigins);
    const normalSelectedDestinations = buildDestinationRouteIds(
      retainSelectedDestinations,
    );

    // 默认选中的 再被取消，也要记录 sort 位置
    normalSelectedOrigins.forEach((item) => {
      const existsItem = lodash.find(
        cloneValues.selectedOrigins,
        (o) => o.vid === item.vid,
      );
      if (existsItem) {
        item.sort = existsItem.sort;
      }
    });

    normalSelectedDestinations.forEach((item) => {
      const existsItem = lodash.find(
        cloneValues.selectedDestinations,
        (o) => o.vid === item.vid,
      );
      if (existsItem) {
        item.sort = existsItem.sort;
      }
    });

    const _selectedOrigins = mixinStopPoints(
      normalSelectedOrigins,
      cloneValues.selectedOriginStopPoints,
    );
    const _selectedDestinations = mixinStopPoints(
      normalSelectedDestinations,
      cloneValues.selectedDestinationStopPoints,
    );

    // 剔除 children 字段
    const pureSelectedOrigins = cloneDeep(_selectedOrigins);
    const pureSelectedDestinations = cloneDeep(_selectedDestinations);
    pureSelectedOrigins.forEach((item) => {
      delete item.children;
    });
    pureSelectedDestinations.forEach((item) => {
      delete item.children;
    });

    const payload = {
      selectedOrigins: pureSelectedOrigins,
      selectedDestinations: pureSelectedDestinations,
    };
    publish(STEP_EVENTS.STEP1_NEXT_TRIGGER, { ...payload });
    doNext?.();
  }, []);

  useEffect(() => {
    const tree = cloneDeep(selectedTree.current ?? []);
    const paths = getTreeAllPath(tree);
    const data = getSelectedRoutesListByPaths(paths);

    setSelectedRouteNum(data.length);
  }, [selectedTree.current]);

  useEffect(() => {
    if (waypointList?.length === 1) {
      const item = waypointList[0];
      const isExist = selectedWaypoints.current?.some(
        (i) => i.vid === item.vid,
      );
      if (isExist || activeItemWaypointRef.current?.vid === item?.vid) {
        return;
      } else {
        waypointSelectedByDefault(item);
      }
    }
  }, [waypointList]);

  useEffect(() => {
    fetchDataForOrigin();
  }, []);

  return (
    <>
      <div className={cls('step1', styles.step1)}>
        <div className="routeCodeFilter">
          <div className="formWrap">
            <span className="label">Route Code</span>
            <ProForm
              className="formCase"
              submitter={false}
              initialValues={{ routeCode: undefined }}
              formRef={routeCodeFilterFormRef}
              autoFocusFirstInput={false}
            >
              <ProFormSelect
                name="routeCode"
                label={null}
                className="routeCodeInput"
                placeholder="Please enter route code"
                rules={[
                  { required: true, message: 'Please enter information first' },
                  // {
                  //   whitespace: true,
                  //   message: 'Cannot only contain spaces',
                  // },
                ]}
                valuePropName="name"
                fieldProps={{
                  ...routeCodeDefaultFieldProps,
                  onSearch: routeCodeSearch,
                  options: routeCodeOptions,
                }}
              />
            </ProForm>
          </div>
          <div className="filterBtns">
            <Button type="primary" onClick={() => handleRouteCodeSearch()}>
              Search
            </Button>
            <Button onClick={() => routeCodeReset()}>Reset</Button>
          </div>
        </div>
        <div className="main">
          <section
            className={styles.listItem}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            <div className={styles.caseTitle}>
              <span>Origin</span>
              <CustomStatusButton
                noStyle
                onClick={() => resolveAddress('origin')}
              >
                Resolve Address
              </CustomStatusButton>
            </div>
            <ProForm submitter={false} formRef={filterFormRefForOrigin}>
              <div className={cls('filters', styles.filters)}>
                <div className={styles.formItems}>
                  <Row gutter={8}>
                    <Col span={6}>
                      <ProFormSelect
                        name={'padIdQuery'}
                        label={null}
                        placeholder={labelLevelList?.[1]}
                        showSearch
                        fieldProps={{
                          filterOption: true,
                        }}
                        request={async () => {
                          const payload = {
                            country: countryId!,
                            noAllRegion: true,
                          };
                          const res = await placeGeoRegion(payload);
                          if (res.code === 200) {
                            return res?.data?.map((item: IPlaceGeoRecord) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          } else {
                            return [];
                          }
                        }}
                        onChange={onPadChangeForOrigin}
                      />
                    </Col>
                    <Col span={6}>
                      <ProFormSelect
                        name={'sadIdQuery'}
                        label={null}
                        placeholder={labelLevelList?.[2]}
                        dependencies={['padIdQuery']}
                        showSearch
                        fieldProps={{
                          filterOption: true,
                        }}
                        request={async (params) => {
                          if (!params.padIdQuery) {
                            return [];
                          }
                          const payload = {
                            region: params.padIdQuery,
                          };
                          const res = await placeGeoProvince(payload);
                          if (res.code === 200) {
                            return res?.data?.map((item: IPlaceGeoRecord) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          } else {
                            return [];
                          }
                        }}
                        onChange={onSadChangeForOrigin}
                      />
                    </Col>
                    <Col span={6}>
                      <ProFormSelect
                        name={'tadIdQuery'}
                        label={null}
                        placeholder={labelLevelList?.[3]}
                        dependencies={['padIdQuery', 'sadIdQuery']}
                        showSearch
                        fieldProps={{
                          filterOption: true,
                        }}
                        request={async (params) => {
                          if (!params.padIdQuery || !params.sadIdQuery) {
                            return [];
                          }
                          const payload = {
                            province: params.sadIdQuery,
                          };
                          const res = await placeLeoCity(payload);
                          if (res.code === 200) {
                            return res?.data?.map((item: IPlaceGeoRecord) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          } else {
                            return [];
                          }
                        }}
                        onChange={onFilterSelectOrigin}
                      />
                    </Col>
                    <Col span={6}>
                      <Popover
                        content={
                          <span style={{ color: 'var(--danger-color)' }}>
                            {labelErrorInfo?.originLabelError}
                          </span>
                        }
                        open={!!labelErrorInfo?.originLabelError}
                      >
                        <Form.Item
                          label={null}
                          name="label"
                          initialValue={undefined}
                          help={''}
                          rules={[
                            {
                              validator: (_, value) =>
                                validatorLabel(value, 'origin'),
                            },
                          ]}
                        >
                          <Input
                            placeholder={'Origin Label'}
                            onChange={onFilterSelectOrigin}
                            allowClear
                          />
                        </Form.Item>
                      </Popover>
                    </Col>
                  </Row>
                </div>
                <Button onClick={doResetFormOrigin}>Reset</Button>
              </div>
            </ProForm>
            <TableHeader labelLevelList={labelLevelList} type="origin" />
            <div className={styles.tableList}>
              <div
                style={{
                  height: `${CONTAINER_HEIGHT}px`,
                  overflow: 'auto',
                  width: '100%',
                }}
                onScroll={onScrollForOrigin}
              >
                {originList?.map((item: IRouteOriginAndDestinationListItem) => (
                  <CheckItemView
                    key={item.vid}
                    {...item}
                    isSelect={selectedOrigins.current?.some(
                      (selectedItem) => selectedItem.vid === item.vid,
                    )}
                    isActive={activeItemOriginRef?.current?.vid === item.vid}
                    onClick={() => handleClickOriginItem(item)}
                  />
                ))}
                <StatusText>
                  {originListLoading ? 'Loading...' : 'No more data'}
                </StatusText>
              </div>
            </div>
          </section>

          <section className={cls(styles.listItem, styles.destinationWrap)}>
            <div className={styles.caseTitle}>
              <span>Destination</span>
              <CustomStatusButton
                noStyle
                disabled={!activeItemOriginRef.current}
                onClick={() => resolveAddress('destination')}
              >
                Resolve Address
              </CustomStatusButton>
            </div>
            <ProForm
              submitter={false}
              formRef={filterFormRefForDestination}
              disabled={!activeItemOriginRef.current}
            >
              <div className={cls('filters', styles.filters)}>
                <div className={styles.formItems}>
                  <Row gutter={8}>
                    <Col span={6}>
                      <ProFormSelect
                        name={'padIdQuery'}
                        label={null}
                        placeholder={labelLevelList?.[1]}
                        showSearch
                        fieldProps={{
                          filterOption: true,
                        }}
                        request={async () => {
                          const payload = {
                            country: countryId!,
                            noAllRegion: false,
                          };
                          const res = await placeGeoRegion(payload);
                          if (res.code === 200) {
                            return res?.data?.map((item: IPlaceGeoRecord) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          } else {
                            return [];
                          }
                        }}
                        onChange={onPadChangeForDestination}
                      />
                    </Col>
                    <Col span={6}>
                      <ProFormSelect
                        name={'sadIdQuery'}
                        label={null}
                        placeholder={labelLevelList?.[2]}
                        dependencies={['padIdQuery']}
                        showSearch
                        fieldProps={{
                          filterOption: true,
                        }}
                        request={async (params) => {
                          if (!params.padIdQuery) {
                            return [];
                          }
                          const payload = {
                            region: params.padIdQuery,
                          };
                          const res = await placeGeoProvince(payload);
                          if (res.code === 200) {
                            return res?.data?.map((item: IPlaceGeoRecord) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          } else {
                            return [];
                          }
                        }}
                        onChange={onSadChangeForDestination}
                      />
                    </Col>
                    <Col span={6}>
                      <ProFormSelect
                        name={'tadIdQuery'}
                        label={null}
                        placeholder={labelLevelList?.[3]}
                        dependencies={['padIdQuery', 'sadIdQuery']}
                        showSearch
                        fieldProps={{
                          filterOption: true,
                        }}
                        request={async (params) => {
                          if (!params.padIdQuery || !params.sadIdQuery) {
                            return [];
                          }
                          const payload = {
                            province: params.sadIdQuery,
                          };
                          const res = await placeLeoCity(payload);
                          if (res.code === 200) {
                            return res?.data?.map((item: IPlaceGeoRecord) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          } else {
                            return [];
                          }
                        }}
                        onChange={onFilterSelectDestination}
                      />
                    </Col>
                    <Col span={6}>
                      <Popover
                        content={
                          <span style={{ color: 'var(--danger-color)' }}>
                            {labelErrorInfo?.destinationLabelError}
                          </span>
                        }
                        open={!!labelErrorInfo?.destinationLabelError}
                      >
                        <Form.Item
                          label={null}
                          name="label"
                          initialValue={undefined}
                          help={''}
                          rules={[
                            {
                              validator: (_, value) =>
                                validatorLabel(value, 'destination'),
                            },
                          ]}
                        >
                          <Input
                            placeholder={'Destination Label'}
                            onChange={onFilterSelectDestination}
                            allowClear
                          />
                        </Form.Item>
                      </Popover>
                    </Col>
                  </Row>
                </div>
                <Button onClick={doResetFormDestination}>Reset</Button>
              </div>
            </ProForm>
            <TableHeader labelLevelList={labelLevelList} type="destination" />
            <div className={styles.tableList}>
              <div
                style={{
                  height: `${CONTAINER_HEIGHT}px`,
                  overflow: 'auto',
                  width: '100%',
                }}
                onScroll={onScrollForDestination}
              >
                {destinationList?.map(
                  (item: IRouteOriginAndDestinationListItem) => (
                    <CheckItemView
                      key={item.vid}
                      {...item}
                      isSelect={selectedDestinations.current?.some(
                        (selectedItem) => selectedItem.vid === item.vid,
                      )}
                      isActive={
                        activeItemDestinationRef?.current?.vid === item.vid
                      }
                      onClick={() => handleClickDestinationItem(item)}
                    />
                  ),
                )}
                <StatusText>
                  {destinationListLoading ? 'Loading...' : 'No more data'}
                </StatusText>
              </div>
            </div>
          </section>

          <section
            className={styles.waypointWrap}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            <div className={styles.waypointTitle}>Waypoint</div>
            <WaypointTableHeader />
            <div className={styles.tableList}>
              <div
                style={{
                  height: `${CONTAINER_HEIGHT}px`,
                  overflow: 'auto',
                  width: '100%',
                }}
                onScroll={onScrollForWaypoint}
              >
                {waypointList?.map((item: IWaypointListItem) => (
                  <WaypointCheckItemView
                    key={item.vid}
                    {...item}
                    isSelect={selectedWaypoints.current?.some(
                      (selecteItem) => selecteItem.vid === item.vid,
                    )}
                    isActive={activeItemWaypointRef?.current?.vid === item.vid}
                    onClick={() => handleClickWayPointItem(item)}
                  />
                ))}
                <StatusText>
                  {waypointListLoading ? 'Loading...' : 'No more data'}
                </StatusText>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className={styles.footer}>
        <div
          className={styles.selectedRoutes}
          onClick={() => handleSelectedRoutesClick()}
        >
          {`${selectedRouteNum} ${
            selectedRouteNum > 1 ? 'Routes' : 'Route'
          } selected`}
        </div>
        <div className={styles.btns}>
          <Button onClick={() => doCancel?.()}>Cancel</Button>
          <Button type="primary" onClick={() => handleNext()}>
            Next
          </Button>
        </div>
      </div>
      <ResolveAddressModal
        open={resolveAddressModalOpen}
        onCancel={() => setResolveAddressModalOpen(false)}
        onStart={onStarted}
      />
      <SelectedRoutesModal
        open={selectedRoutesModalState.open}
        data={selectedRoutesModalState.data}
        onCancel={() => setSelectedRoutesModalState({ open: false })}
      />
    </>
  );
};

export default Step1;
