import { getTruckTypeList, truckFileExpireCount, truckList } from '@/api/truck';
import { ITruckListItem, ITruckTypeListItem } from '@/api/types/truck';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import ExpiringDayFilter from '@/components/ExpiringDayFilter';
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
  CustomerSizeEnumText,
  EnumContractExpireStatus,
  FieldQueryHighlightTypeEnum,
  TruckTransportationStatusEnum,
  TruckTransportationStatusEnumColor,
  TruckTransportationStatusEnumText,
  UploadPathTypeEnum,
  VendorTruckStatusEnum,
  VendorTruckStatusEnumColor,
  VendorTruckStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import TruckModal from '@/pages/vendor/components/TruckModal';
import { formatString } from '@/utils/format';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import {
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { Badge, Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import BatchUpdateAccreditationModal from '../components/BatchUpdateAccreditationModal';
import { EVENT_TRUCK_LIST_RELOAD } from '../event';
import styles from './index.less';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  plateNumber?: string;
  truckType?: number;
  vendorName?: string;
  vendorTag?: string;
  status?: VendorTruckStatusEnum;
  transportationStatus?: TruckTransportationStatusEnum;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  validityPeriodFrom?: number;
  validityPeriodTo?: number;
}

interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
}

const TruckList: React.FC = () => {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  // 列表展示配置
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  // 添加truck modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showUpdateAccreditationModal, setShowUpdateAccreditationModal] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [contractExpireStatus, setContractExpireStatus] =
    useState<EnumContractExpireStatus>();
  const [expireCountLoading, setExpireCountLoading] = useState(false);
  const [expireCountData, setExpireCountData] = useState<any>();
  const [updateRecord, setUpdateRecord] = useState<ITruckListItem>();
  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

  const {
    options: plateNumberOptions,
    onSearch: plateNumberSearch,
    defaultFieldProps: plateNumberDefaultFieldProps,
    value: plateNumberValue,
    setValue: setPlateNumberValue,
  } = useFieldQuery({
    field: 'plateNumber',
    esDtoClass: ES_DTO_CLASS.TRUCK,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

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
    const res = await truckList(BE_NEED);
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

    if (values.plateNumber) {
      const nameOrValue = values.plateNumber?.name || values.plateNumber?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'plateNumber', _value);
      lodash.set(BE_NEED, 'plateNumber', _value);
    }

    if (values.truckType) {
      lodash.set(FE_NEED, 'truckType', values.truckType);
      lodash.set(BE_NEED, 'truckType', values.truckType);
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

    if (values.status) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'status', values.status);
    }

    if (values.transportationStatus) {
      lodash.set(FE_NEED, 'transportationStatus', values.transportationStatus);
      lodash.set(BE_NEED, 'transportationStatus', values.transportationStatus);
    }

    if (values.accreditationRemainingDays) {
      lodash.set(
        FE_NEED,
        'validityPeriodFrom',
        values.accreditationRemainingDays[0],
      );
      lodash.set(
        FE_NEED,
        'validityPeriodTo',
        values.accreditationRemainingDays[1],
      );

      lodash.set(
        BE_NEED,
        'validityPeriodFrom',
        values.accreditationRemainingDays[0],
      );
      lodash.set(
        BE_NEED,
        'validityPeriodTo',
        values.accreditationRemainingDays[1],
      );
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
      truckType: FE_NEED.truckType,
      status: FE_NEED.status,
      transportationStatus: FE_NEED.transportationStatus,

      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
      accreditationRemainingDays: [
        FE_NEED.validityPeriodFrom,
        FE_NEED.validityPeriodTo,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      plateNumber: FE_NEED.plateNumber
        ? { value: FE_NEED.plateNumber }
        : undefined,
      vendorName: FE_NEED.vendorName
        ? { value: FE_NEED.vendorName }
        : undefined,
      vendorTag: FE_NEED.vendorTag ? { value: FE_NEED.vendorTag } : undefined,
    });

    setPlateNumberValue(FE_NEED.plateNumber);
    setVendorNameValue(FE_NEED.vendorName);
    setVendorTagValue(FE_NEED.vendorTag);
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

  const onReset = () => {
    setContractExpireStatus(undefined);
    setUrlState({ extra: undefined });
    setPlateNumberValue(undefined);
    setVendorNameValue(undefined);
    setVendorTagValue(undefined);
    // 自动触发 onSubmit
  };

  const getExpireCount = async () => {
    setExpireCountLoading(true);
    const res = await truckFileExpireCount().finally(() => {
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

    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      valueType: 'select',
      width: 200,
      order: 8,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...plateNumberDefaultFieldProps,
        placeholder: 'Plate Number',
        options: plateNumberOptions,
        onSearch: plateNumberSearch,
        value: plateNumberValue,
      },
      render: (_, record) => (
        <CustomTooltip
          key={`plateNumber${record.id}`}
          title={record.plateNumber}
        >
          <a
            onClick={() => {
              saveScrollTop();
              history.push(`${PATHS.VENDOR_TRUCK_DETAIL}/${record.id}`);
            }}
          >
            {record.plateNumber}
          </a>
        </CustomTooltip>
      ),
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      valueType: 'select',
      width: 200,
      order: 7,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Truck Type',
      },
      request: async () => {
        const res = await getTruckTypeList();
        if (res.code === 200) {
          return res?.data?.map((item: ITruckTypeListItem) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        }
        return [];
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`truckTypeName${record.id}`}
            title={record.truckTypeName}
          >
            {record.truckTypeName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'status',
      valueEnum: VendorTruckStatusEnumText,
      valueType: 'select',
      width: 150,
      order: 4,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Accreditation Status',
      },
      render: (_, record) => {
        const status: VendorTruckStatusEnum = record.status;
        const Content = (
          <Badge color={VendorTruckStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Transportation Status',
      dataIndex: 'transportationStatus',
      valueEnum: TruckTransportationStatusEnumText,
      valueType: 'select',
      width: 160,
      order: 3,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Transportation Status',
      },
      render: (_, record) => {
        const transportationStatus: TruckTransportationStatusEnum =
          record.transportationStatus;
        const Content = (
          <Badge
            color={TruckTransportationStatusEnumColor[transportationStatus]}
            text={transportationStatus}
          />
        );
        return (
          <CustomTooltip title={Content}>
            {transportationStatus ? Content : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Van Type',
      dataIndex: 'vanType',
      width: 140,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip key={`vanType${record.id}`} title={record.vanType}>
            {record.vanType}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Net Capacity',
      dataIndex: 'netCapacity',
      width: 140,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`netCapacity${record.id}`}
            title={formatAmount(record.netCapacity)}
          >
            {record.netCapacity ? `${formatAmount(record.netCapacity)}MT` : 0}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      width: 140,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`volume${record.id}`}
            title={formatAmount(record.volume)}
          >
            {record.volume ? `${formatAmount(record.volume)}CBM` : 0}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      valueType: 'select',
      width: 200,
      order: 6,
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
      hideInTable: true,
      order: 5,
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
      title: 'Ownership',
      dataIndex: 'ownership',
      hideInSearch: true,
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip key={`ownership${record.id}`} title={record.ownership}>
            {record.ownership}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Remaining Days',
      dataIndex: 'accreditationRemainingDays',
      order: 2,
      width: 160,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Accreditation Remaining', 'Accreditation Remaining'],
      },
      renderFormItem: (item, { defaultRender, ...rest }) => {
        return !!defaultRender ? (
          <ProFormDigitRange
            fieldProps={{
              ...rest,
              className: 'digitRangeInput',
              min: -99999999,
              max: 99999999,
              precision: 0,
              controls: false,
              formatter: (v) => formatAmount(v!),
            }}
            transform={(value: [number, number]) => {
              if (value && value.length === 2) {
                const [start, end] = value;
                return {
                  min: Math.min(start, end),
                  max: Math.max(start, end),
                };
              }
              return {};
            }}
          />
        ) : null;
      },
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
      title: 'Update Time',
      dataIndex: 'updatedAt',
      width: 180,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`updatedAt${record.id}`}
            title={dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 180,
      order: 1,
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
      width: 210,
      hideInTable:
        !access[PermissionEnum.TRUCK_DETAIL] &&
        !access[PermissionEnum.TRUCK_LIST_UPDATE_ACCREDITATION],
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxSizing: 'border-box',
            }}
          >
            <Access
              key="detail"
              accessible={access[PermissionEnum.TRUCK_DETAIL]}
            >
              <Button
                // icon={<BarsOutlined />}
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  saveScrollTop();
                  history.push(`${PATHS.VENDOR_TRUCK_DETAIL}/${record.id}`);
                }}
              >
                Details
              </Button>
            </Access>
            <Access
              key="Update"
              accessible={
                access[PermissionEnum.TRUCK_LIST_UPDATE_ACCREDITATION]
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
          </div>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access key="create" accessible={access[PermissionEnum.TRUCK_CREATE]}>
      <Button key="create" type="primary" onClick={() => setShowAddModal(true)}>
        Create Truck
      </Button>
    </Access>,
  ];
  useEffect(() => {
    const unsubscribe = subscribe(EVENT_TRUCK_LIST_RELOAD, () => {
      reload();
      getExpireCount();
    });

    return unsubscribe;
  }, [contractExpireStatus]);

  return (
    <>
      <section style={{ background: '#fff', padding: '12px' }}>
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
        className={styles.truckListTable}
        form={{
          name: 'truck-list',
        }}
        columns={columns}
        scroll={{ x: 1800 }}
        formRef={formRef}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
            // onSubmit({ pageNum: page, pageSize: pageSize });
          },
        }}
        loading={loading}
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {showAddModal ? (
        <TruckModal
          hideModal={() => {
            setShowAddModal(false);
          }}
          refresh={reload}
        />
      ) : null}
      {showUpdateAccreditationModal ? (
        <BatchUpdateAccreditationModal
          open={showUpdateAccreditationModal}
          recordId={updateRecord?.id as number}
          source={UploadPathTypeEnum.TRUCK}
          hideModal={() => {
            setShowUpdateAccreditationModal(false);
          }}
          // refresh={reload}
        />
      ) : null}
    </>
  );
};

export default TruckList;
