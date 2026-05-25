import { placeCity, placeProvince, placeRegion } from '@/api/place';
import { getTruckTypeList } from '@/api/truck';
import { IPlaceRecord } from '@/api/types/place';
import { ITruckTypeListItem } from '@/api/types/truck';
import { IAddVendorParams, IVendorListItem } from '@/api/types/vendor';
import { vendorFileExpireCount, vendorList } from '@/api/vendor';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import ExpiringDayFilter from '@/components/ExpiringDayFilter';
import NumberRangeSelect, {
  INumberRange,
} from '@/components/NumberRangeSelect';
import {
  ContractExpireStatusAmount,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
  CountryRegionNameText,
  CustomerSizeEnumText,
  CustomerStatusEnumText,
  EnumContractExpireStatus,
  FieldQueryHighlightTypeEnum,
  UploadPathTypeEnum,
  VendorStatusEnum,
  VendorStatusEnumColor,
  VendorStatusEnumText,
  VendorTypeEnum,
  VendorTypeEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import VendorModal from '@/pages/vendor/components/VendorModal';
import VendorTransferModal from '@/pages/vendor/components/VendorTransferModal';
import { formatString } from '@/utils/format';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess, useModel } from '@umijs/max';
import { Badge, Button, Flex } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import {
  Key,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import SkeletonView from '../statistics/common/SkeletonView';
import BatchUpdateAccreditationModal from './components/BatchUpdateAccreditationModal';
import { EVENT_VENDOR_LIST_RELOAD } from './event';
import styles from './index.less';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  status?: VendorStatusEnum;
  vendorName?: string;
  vendorTag?: string;
  vendorType?: VendorTypeEnum;
  userId?: number;
  trucksMin?: number;
  trucksMax?: number;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  padId?: number;
  sadId?: number;
  tadId?: number;
  truckTypeList?: number[];
  validityPeriodFrom?: number;
  validityPeriodTo?: number;
  contractExpireStatus?: EnumContractExpireStatus;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  bdUserName?: string;
  trucksObj?: INumberRange;
}

const VendorList: React.FC = () => {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // const { message } = App.useApp();
  // 列表展示配置
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  // 添加vendor modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  // 转移vendor modal
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  // 编辑vendor 默认值
  const [formDefaultValue, setFormDefaultValue] =
    useState<IAddVendorParams | null>(null);
  // vendor id list
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  // vendor bdId list
  const [bdUserRoleIds, setBdUserRoleIds] = useState<number[]>([]);
  const [showUpdateAccreditationModal, setShowUpdateAccreditationModal] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [truckTypeList, setTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  const [updateRecord, setUpdateRecord] = useState<IVendorListItem>();
  const [contractExpireStatus, setContractExpireStatus] =
    useState<EnumContractExpireStatus>();
  const [expireCountLoading, setExpireCountLoading] = useState(false);
  const [expireCountData, setExpireCountData] = useState<any>();
  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
    value: vendorNameValue,
    setValue: setVendorNameValue,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: vendorTagOptions,
    onSearch: vendorTagSearch,
    defaultFieldProps: vendorTagDefaultFieldProps,
    value: vendorTagValue,
    setValue: setVendorTagValue,
  } = useFieldQuery({
    field: 'vendorTag',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: bdOptions,
    onSearch: bdSearch,
    defaultFieldProps: bdDefaultFieldProps,
    value: bdValue,
    setValue: setBdValue,
  } = useFieldQuery({
    isUAM: true,
    field: 'aliasName',
    esDtoClass: ES_DTO_CLASS.USER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const resetSelectedRowKeys = () => {
    setSelectedRowKeys([]);
    setBdUserRoleIds([]);
  };

  const resetAreaFields = (fields?: string[]) => {
    formRef?.current?.resetFields?.(fields);
  };

  const saveScrollTop = () => {
    // 记录滚动位置
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED } = extraJson;
    const scrollTop = document?.scrollingElement?.scrollTop ?? 0;

    const newExtra = { ...extraJson, FE_NEED: { ...FE_NEED, scrollTop } };

    setUrlState({
      extra: JSON.stringify(newExtra),
    });
  };

  const doScrollTop = (top: number) => {
    setTimeout(() => {
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await vendorList(BE_NEED);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const reload = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    const validityPeriodObj = contractExpireStatus
      ? {
          validityPeriodFrom:
            contractExpireStatus === EnumContractExpireStatus.EXPIRED
              ? undefined
              : 0,
          validityPeriodTo: ContractExpireStatusAmount[contractExpireStatus],
        }
      : undefined;

    const params = { ...(BE_NEED ?? {}), ...validityPeriodObj };
    getDataSource(params);
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    setContractExpireStatus(undefined);
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };
    const values = formRef.current?.getFieldsValue();

    if (values.status) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'status', values.status);
    }

    if (values.vendorName) {
      const nameOrValue = values.vendorName?.name || values.vendorName?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'vendorName', _value);
      lodash.set(BE_NEED, 'vendorName', _value);
    }

    if (values.vendorTag) {
      const nameOrValue = values.vendorTag?.name || values.vendorTag?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'vendorTag', _value);
      lodash.set(BE_NEED, 'vendorTag', _value);
    }

    if (values.vendorType) {
      lodash.set(FE_NEED, 'vendorType', values.vendorType);
      lodash.set(BE_NEED, 'vendorType', values.vendorType);
    }

    if (values.bdUserName) {
      lodash.set(
        FE_NEED,
        'bdUserName',
        values.bdUserName?.name
          ? formatString(values.bdUserName?.name)
          : undefined,
      );
      lodash.set(FE_NEED, 'userId', values.bdUserName?.value);
      lodash.set(BE_NEED, 'userId', values.bdUserName?.value);
    }

    if (values.trucksObj) {
      lodash.set(FE_NEED, 'trucksObj', values.trucksObj);
      lodash.set(BE_NEED, 'trucksMin', values.trucksObj?.min);
      lodash.set(BE_NEED, 'trucksMax', values.trucksObj?.max);
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'creationTimeStart', startTime);
      lodash.set(FE_NEED, 'creationTimeEnd', endTime);

      lodash.set(BE_NEED, 'creationTimeStart', startTime);
      lodash.set(BE_NEED, 'creationTimeEnd', endTime);
    }

    if (values.pad) {
      lodash.set(FE_NEED, 'padId', values.pad);
      lodash.set(BE_NEED, 'padId', values.pad);
    }

    if (values.sad) {
      lodash.set(FE_NEED, 'sadId', values.sad);
      lodash.set(BE_NEED, 'sadId', values.sad);
    }

    if (values.tad) {
      lodash.set(FE_NEED, 'tadId', values.tad);
      lodash.set(BE_NEED, 'tadId', values.tad);
    }
    if (values.truckTypeList) {
      lodash.set(FE_NEED, 'truckTypeList', values.truckTypeList);
      lodash.set(BE_NEED, 'truckTypeList', values.truckTypeList);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });

    // BE_NEED
    getDataSource(BE_NEED);
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      status: FE_NEED.status,
      vendorType: FE_NEED.vendorType,
      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
      pad: FE_NEED.padId,
      sad: FE_NEED.sadId,
      tad: FE_NEED.tadId,
      trucksObj: FE_NEED.trucksObj,
      truckTypeList: FE_NEED.truckTypeList,
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      vendorName: FE_NEED.vendorName
        ? { value: FE_NEED.vendorName }
        : undefined,
      vendorTag: FE_NEED.vendorTag ? { value: FE_NEED.vendorTag } : undefined,
      bdUserName: FE_NEED.bdUserName
        ? { value: FE_NEED.userId, name: FE_NEED.bdUserName }
        : undefined,
    });

    setVendorNameValue(FE_NEED.vendorName);
    setVendorTagValue(FE_NEED.vendorTag);
    setBdValue(FE_NEED.bdUserName);
  };

  const doFirstQuery = async () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED, BE_NEED } = extraJson;
    if (FE_NEED) {
      fillTableForm(FE_NEED);
    }

    if (BE_NEED) {
      await getDataSource(BE_NEED);
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    } else {
      await getDataSource({ pageNum: 1, pageSize: 20 });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    }
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    const validityPeriodObj = contractExpireStatus
      ? {
          validityPeriodFrom:
            contractExpireStatus === EnumContractExpireStatus.EXPIRED
              ? undefined
              : 0,
          validityPeriodTo: ContractExpireStatusAmount[contractExpireStatus],
        }
      : undefined;

    await getDataSource({ ...BE_NEED, ...params, ...validityPeriodObj });
  };

  // 编辑
  const handleEditVendor = (data: IVendorListItem | null) => {
    if (data) {
      setFormDefaultValue({
        id: data.id,
        vendorName: data.vendorName,
        vendorTag: data.vendorTag,
        vendorType: data.vendorType,
        garageLocation: data.garageLocation,
        countryName: data.countryName,
        country: data.country,
        pad: data.pad,
        sad: data.sad,
        tad: data.tad,
        taxMark: data.taxMark,
        tinNumber: data.tinNumber,
        listOfServices: data.listOfServices,
        email: data.email,
      });
    }
    setShowAddModal(true);
  };

  const onReset = () => {
    setContractExpireStatus(undefined);
    setUrlState({ extra: undefined });
    setVendorNameValue(undefined);
    setVendorTagValue(undefined);
    setBdValue(undefined);
  };

  const onTruckTypeOption = async () => {
    const res = await getTruckTypeList();
    if (res.code === 200) {
      const list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setTruckTypeList(list);
    }
  };

  const getExpireCount = async () => {
    setExpireCountLoading(true);
    const res = await vendorFileExpireCount().finally(() => {
      setExpireCountLoading(false);
    });

    if (res.code === 200) {
      setExpireCountData(res.data);
    }
  };

  const onExpireStatusChange = async (v: EnumContractExpireStatus) => {
    formRef.current?.resetFields();
    onReset();
    const _status = v === contractExpireStatus ? undefined : v;
    const validityPeriodObj = _status
      ? {
          validityPeriodFrom:
            v === EnumContractExpireStatus.EXPIRED ? undefined : 0,
          validityPeriodTo: ContractExpireStatusAmount[v],
        }
      : undefined;
    setContractExpireStatus(_status);
    await getDataSource({
      pageNum: 1,
      pageSize: 20,
      ...validityPeriodObj,
    });
  };

  const reloadTableData = async (options?: { keepFormValues?: boolean }) => {
    if (contractExpireStatus) {
      await getDataSource({
        pageNum: 1,
        pageSize: 20,
        validityPeriodFrom:
          contractExpireStatus === EnumContractExpireStatus.EXPIRED
            ? undefined
            : 0,
        validityPeriodTo: ContractExpireStatusAmount[contractExpireStatus],
      });
    } else {
      if (options?.keepFormValues) {
        reload();
      }
    }
  };

  const refreshAllData = useCallback(() => {
    console.log('[Scheduled Task] 执行凌晨数据自动刷新');
    getExpireCount();

    reloadTableData({ keepFormValues: true });
  }, [getExpireCount, reloadTableData]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const setupMidnightRefresh = () => {
      const now = new Date();
      const midnight = new Date(now);

      // 设置为次日凌晨 00:00:01
      midnight.setDate(now.getDate() + 1);
      midnight.setHours(0, 0, 1, 0);

      // const msToMidnight = 5 * 1000;
      const msToMidnight = midnight.getTime() - now.getTime();

      // 1. 设置第一个定时器，等待到凌晨
      timerId = setTimeout(() => {
        refreshAllData();

        // 2. 到达凌晨后，开启每 24 小时一次的循环
        intervalId = setInterval(
          () => {
            refreshAllData();
          },
          24 * 60 * 60 * 1000,
        );
      }, msToMidnight);
    };

    setupMidnightRefresh();

    // 销毁组件时必须清除计时器，防止内存泄漏
    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [refreshAllData]);

  useEffect(() => {
    getExpireCount();
    onTruckTypeOption();
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      valueType: 'select',
      width: 240,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...vendorNameDefaultFieldProps,
        placeholder: 'Vendor Name',
        options: vendorNameOptions,
        onSearch: vendorNameSearch,
        value: vendorNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`vendorName${record.id}`}
            title={record.vendorName}
          >
            {record.vendorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Tag',
      dataIndex: 'vendorTag',
      valueType: 'select',
      width: 120,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...vendorTagDefaultFieldProps,
        placeholder: 'Vendor Tag',
        options: vendorTagOptions,
        onSearch: vendorTagSearch,
        value: vendorTagValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip key={`vendorTag${record.id}`} title={record.vendorTag}>
            {record.vendorTag}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Type',
      dataIndex: 'vendorType',
      valueType: 'select',
      width: 100,
      valueEnum: VendorTypeEnumText,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'All Type',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorType}>
            {record.vendorType}
          </CustomTooltip>
        );
      },
    },
    {
      title: CountryRegionNameText[countryId as number]?.[0],
      width: 240,
      dataIndex: 'pad',
      ellipsis: true,
      hideInTable: true,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: CountryRegionNameText[countryId as number]?.[0],
        onChange: () => {
          resetAreaFields(['sad', 'tad']);
        },
      },
      request: async () => {
        const payload = {
          country: countryId,
        };
        const res = await placeRegion(payload);
        if (res.code === 200) {
          return res?.data?.map((item: IPlaceRecord) => {
            return {
              label: item.description,
              value: item.id,
            };
          });
        } else {
          return [];
        }
      },
    },
    {
      title: CountryRegionNameText[countryId as number]?.[1],
      width: 240,
      dataIndex: 'sad',
      ellipsis: true,
      hideInTable: true,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: CountryRegionNameText[countryId as number]?.[1],
        onChange: () => resetAreaFields(['tad']),
      },
      dependencies: ['pad'],
      request: async () => {
        const values = formRef.current?.getFieldsValue();
        if (!values.pad) {
          return [];
        }
        const payload = {
          region: values.pad,
        };
        const res = await placeProvince(payload);
        if (res.code === 200) {
          return res?.data?.map((item: IPlaceRecord) => {
            return {
              label: item.description,
              value: item.id,
            };
          });
        } else {
          return [];
        }
      },
    },
    {
      title: CountryRegionNameText[countryId as number]?.[2],
      width: 240,
      dataIndex: 'tad',
      ellipsis: true,
      hideInTable: true,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: CountryRegionNameText[countryId as number]?.[2],
      },
      dependencies: ['pad', 'sad'],
      request: async () => {
        const values = formRef.current?.getFieldsValue();
        if (!values.pad || !values.sad) {
          return [];
        }
        const payload = {
          province: values.sad,
        };
        const res = await placeCity(payload);
        if (res.code === 200) {
          return res?.data?.map((item: IPlaceRecord) => {
            return {
              label: item.description,
              value: item.id,
            };
          });
        } else {
          return [];
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: VendorStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Status',
      },
      render: (_, record) => {
        const status: VendorStatusEnum = record.status;
        const Content = (
          <Badge color={VendorStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Garage Location',
      dataIndex: 'garageLocation',
      width: 120,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`garageLocation${record.id}`}
            title={record.garageLocation}
          >
            {record.garageLocation}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Region',
      width: 240,
      dataIndex: 'region',
      ellipsis: { showTitle: false },
      hideInSearch: true,
      valueType: 'select',
      valueEnum: CustomerStatusEnumText,
      render: (_, record) => {
        return (
          <CustomTooltip key={`region${record.id}`} title={record.region}>
            {record.region}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Trucks',
      width: 80,
      dataIndex: 'trucksObj',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Trucks',
      },
      renderFormItem: () => {
        return <NumberRangeSelect placeholder="Trucks" />;
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`trucks${record.id}`}
            title={formatAmount(record.trucks)}
            placement="top"
          >
            {formatAmount(record.trucks)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckTypeList',
      hideInTable: true,
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        maxTagCount: 2,
        placeholder: 'Truck Type',
        options: truckTypeList,
      },
    },
    {
      title: 'Procurement PIC',
      dataIndex: 'bdUserName',
      valueType: 'select',
      width: 130,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...bdDefaultFieldProps,
        placeholder: 'Procurement PIC',
        options: bdOptions,
        onSearch: bdSearch,
        value: bdValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`bdUserName${record.id}`}
            title={record.bdUserName}
          >
            {record.bdUserName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Remaining Days',
      dataIndex: 'accreditationRemainingDays',
      width: 140,
      render: (_, record) => {
        const { accreditationRemainingDays } = record;

        return (
          <CustomTooltip title={accreditationRemainingDays}>
            {accreditationRemainingDays}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTimeRange',
      valueEnum: CustomerSizeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Creation Time Start', 'Creation Time End'],
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`createdAt${record.id}`}
            title={dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable:
        !access[PermissionEnum.VENDOR_LIST_EDIT] &&
        !access[PermissionEnum.VENDOR_DETAIL] &&
        !access[PermissionEnum.VENDOR_LIST_UPDATE_ACCREDITATION],
      width: 250,
      // text, record, _, action
      render: (_, record) => {
        return (
          <Flex gap={16}>
            <Access
              key="detail"
              accessible={access[PermissionEnum.VENDOR_DETAIL]}
            >
              <Button
                // icon={<BarsOutlined />}
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  saveScrollTop();
                  history.push(`${PATHS.VENDOR_DETAIL}/${record.id}`);
                }}
              >
                Details
              </Button>
            </Access>
            <Access
              key="edit"
              accessible={access[PermissionEnum.VENDOR_LIST_EDIT]}
            >
              <Button
                // icon={<EditOutlined />}
                color="primary"
                style={{ padding: 0 }}
                variant="link"
                onClick={() => {
                  handleEditVendor(record);
                }}
              >
                Edit
              </Button>
            </Access>
            <Access
              key="Update"
              accessible={
                access[PermissionEnum.VENDOR_LIST_UPDATE_ACCREDITATION]
              }
            >
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  setUpdateRecord(record);
                  setShowUpdateAccreditationModal(true);
                }}
              >
                Update Accreditation
              </Button>
            </Access>
          </Flex>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access key="create" accessible={access[PermissionEnum.VENDOR_CREATE]}>
      <Button type="primary" onClick={() => setShowAddModal(true)}>
        Create Vendor
      </Button>
    </Access>,
    <Access key="transfer" accessible={access[PermissionEnum.VENDOR_TRANSFER]}>
      <Button
        disabled={selectedRowKeys.length === 0}
        onClick={() => setShowTransferModal(true)}
      >
        Transfer Vendor
      </Button>
    </Access>,
  ];

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_VENDOR_LIST_RELOAD, () => {
      reload();
      getExpireCount();
    });

    return unsubscribe;
  }, [contractExpireStatus]);

  return (
    <>
      <section style={{ marginBottom: '12px' }}>
        {expireCountLoading ? (
          <SkeletonView rows={3} cols={4} />
        ) : (
          <ExpiringDayFilter
            dataSource={expireCountData}
            value={contractExpireStatus}
            onChange={onExpireStatusChange}
            expireFileType="(Accreditation)"
          />
        )}
      </section>
      <CustomTable
        className={styles.vendorListTable}
        columns={columns}
        scroll={{ x: 1500 }}
        formRef={formRef}
        form={{
          name: 'vendor-list',
        }}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
            resetSelectedRowKeys();
          },
        }}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys: Key[], selectedRows: IVendorListItem[]) => {
            setSelectedRowKeys(keys as number[]);
            let bdIds: number[] = [];
            selectedRows.forEach((item) => {
              if (!bdIds.includes(item.bdUserRoleId)) {
                bdIds.push(item.bdUserRoleId);
              }
            });
            setBdUserRoleIds(bdIds);
          },
        }}
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {showAddModal ? (
        <VendorModal
          formDefaultValue={formDefaultValue}
          hideModal={() => {
            setShowAddModal(false);
            setFormDefaultValue(null);
          }}
          refresh={reload}
        />
      ) : null}
      {showTransferModal ? (
        <VendorTransferModal
          vendorIds={selectedRowKeys}
          bdUserRoleIds={bdUserRoleIds}
          onCancel={() => setShowTransferModal(false)}
          onConfirm={() => {
            setShowTransferModal(false);
            resetSelectedRowKeys();
            reload();
          }}
        />
      ) : null}
      {showUpdateAccreditationModal ? (
        <BatchUpdateAccreditationModal
          open={showUpdateAccreditationModal}
          recordId={updateRecord?.id as number}
          recordName={updateRecord?.vendorName as string}
          source={UploadPathTypeEnum.VENDOR}
          hideModal={() => {
            setShowUpdateAccreditationModal(false);
          }}
          // refresh={reload}
        />
      ) : null}
    </>
  );
};

export default VendorList;
