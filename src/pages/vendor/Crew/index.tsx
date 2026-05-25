import { crewFileExpireCount, crewList } from '@/api/crew';
import { getCountryPhone } from '@/api/customer';
import { IContractTrackingExpireCountData } from '@/api/types/contract';
import { ICrewListItem, ICrewListVendorRecord } from '@/api/types/crew';
import { IPhoneSelectOptionsItem } from '@/api/types/customer';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import ExpiringDayFilter from '@/components/ExpiringDayFilter';
import FuzzySelector from '@/components/FuzzySelector';
import {
  ContractExpireStatusAmount,
  DEFAULT_COUNTRY_PHONE_CODE,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
  CrewStatusEnum,
  CrewStatusEnumColor,
  CrewStatusEnumText,
  CrewTypeEnum,
  CrewTypeEnumText,
  EnumContractExpireStatus,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  TruckTransportationStatusEnum,
  TruckTransportationStatusEnumColor,
  TruckTransportationStatusEnumText,
  UploadPathTypeEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { formatString } from '@/utils/format';
import { formatAmount, openNewTag } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import {
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history, useAccess, useModel } from '@umijs/max';
import { Badge, Button, Flex, Form, Select } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import BatchUpdateAccreditationModal from '../components/BatchUpdateAccreditationModal';
import CrewModal from './components/CrewModal';

import { EVENT_CREW_LIST_RELOAD } from '../event';
import styles from './styles.less';

interface IBE_NEED {
  pageNum: number;
  pageSize: number;
  name?: string;
  statusList?: CrewStatusEnum[];
  transportationStatusList?: TruckTransportationStatusEnum[];
  driverFlag?: boolean;
  helperFlag?: boolean;
  licenseNumber?: string;
  id?: number;
  phoneCodeId?: number;
  phoneNum?: string;
  contactPhoneId?: string;
  vendorId?: number;
  validityPeriodFrom?: number;
  validityPeriodTo?: number;
  updatedTimeStart?: string;
  updatedTimeEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  vendorName?: string;
  phoneNumberId?: number;
  licenseNumberId?: number;
  idNumber?: string;
}

const CrewList: React.FC = () => {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showUpdateAccreditationModal, setShowUpdateAccreditationModal] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [updateRecord, setUpdateRecord] = useState<ICrewListItem>();
  const [contractExpireStatus, setContractExpireStatus] =
    useState<EnumContractExpireStatus>();
  const [expireCountLoading, setExpireCountLoading] = useState(false);
  const [expireCountData, setExpireCountData] =
    useState<IContractTrackingExpireCountData>();
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();

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
    const payload = {
      ...BE_NEED,
    };
    const res = await crewList(payload);
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

  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
    }
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    setContractExpireStatus(undefined);
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();
    if (values.name) {
      lodash.set(FE_NEED, 'name', values.name?.name);
      lodash.set(BE_NEED, 'name', values.name?.name);
    }
    if (values.status) {
      lodash.set(FE_NEED, 'statusList', values.status);
      lodash.set(BE_NEED, 'statusList', values.status);
    }

    if (values.transportationStatus) {
      lodash.set(
        FE_NEED,
        'transportationStatusList',
        values.transportationStatus,
      );
      lodash.set(
        BE_NEED,
        'transportationStatusList',
        values.transportationStatus,
      );
    }

    if (values.type) {
      const driverFlag = values.type?.includes?.(CrewTypeEnum.DRIVER);
      const helperFlag = values.type?.includes?.(CrewTypeEnum.HELPER);

      lodash.set(FE_NEED, 'driverFlag', driverFlag ? true : undefined);
      lodash.set(BE_NEED, 'driverFlag', driverFlag ? true : undefined);
      lodash.set(FE_NEED, 'helperFlag', helperFlag ? true : undefined);
      lodash.set(BE_NEED, 'helperFlag', helperFlag ? true : undefined);
    }
    if (values.licenseNumber) {
      lodash.set(
        FE_NEED,
        'licenseNumber',
        formatString(values.licenseNumber?.name),
      );
      lodash.set(FE_NEED, 'licenseNumberId', values.licenseNumber?.id);
      lodash.set(BE_NEED, 'licenseNumber', values.licenseNumber?.name);
    }
    if (values.idNumber) {
      lodash.set(FE_NEED, 'id', formatString(values.idNumber?.id));
      lodash.set(FE_NEED, 'idNumber', formatString(values.idNumber?.name));
      lodash.set(BE_NEED, 'id', values.idNumber?.id);
    }
    if (values.phoneNum) {
      lodash.set(FE_NEED, 'phoneNum', values.phoneNum?.name);
      lodash.set(FE_NEED, 'phoneNumberId', values.phoneNum?.id);
      lodash.set(BE_NEED, 'phoneNum', values.phoneNum?.name);
    }
    if (values.phoneCodeId) {
      lodash.set(FE_NEED, 'phoneCodeId', values.phoneCodeId);
      lodash.set(BE_NEED, 'phoneCodeId', values.phoneCodeId);
    }

    if (values.vendorList) {
      lodash.set(FE_NEED, 'vendorName', values.vendorList?.name);
      lodash.set(FE_NEED, 'vendorId', values.vendorList?.id);
      lodash.set(BE_NEED, 'vendorId', values.vendorList?.id);
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

    if (values.updatedAt) {
      const [start, end] = values.updatedAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'updatedTimeStart', startTime);
      lodash.set(FE_NEED, 'updatedTimeEnd', endTime);

      lodash.set(BE_NEED, 'updatedTimeStart', startTime);
      lodash.set(BE_NEED, 'updatedTimeEnd', endTime);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });

    // BE_NEED
    getDataSource(BE_NEED);
    if (!values.phoneCodeId) {
      formRef.current?.setFieldsValue({
        phoneCodeId: DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
      });
    }
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      status: FE_NEED.statusList,
      transportationStatus: FE_NEED.transportationStatusList,
      phoneCodeId: FE_NEED.phoneCodeId
        ? FE_NEED.phoneCodeId
        : DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
      type: [
        FE_NEED.driverFlag ? CrewTypeEnum.DRIVER : undefined,
        FE_NEED.helperFlag ? CrewTypeEnum.HELPER : undefined,
      ].filter((item) => item),

      accreditationRemainingDays: [
        FE_NEED.validityPeriodFrom,
        FE_NEED.validityPeriodTo,
      ],
      updatedAt: [
        FE_NEED.updatedTimeStart ? dayjs(FE_NEED.updatedTimeStart) : undefined,
        FE_NEED.updatedTimeEnd ? dayjs(FE_NEED.updatedTimeEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      crewName: FE_NEED.name ? { name: FE_NEED.name } : undefined,
      idNumber: FE_NEED.id
        ? { name: FE_NEED.idNumber, id: FE_NEED.id }
        : undefined,
      licenseNumber: FE_NEED.licenseNumber
        ? { name: FE_NEED.licenseNumber, id: FE_NEED.licenseNumberId }
        : undefined,
      phoneNum: FE_NEED.phoneNum
        ? { name: FE_NEED.phoneNum, id: FE_NEED.phoneNumberId }
        : undefined,
      vendorList: FE_NEED.vendorId
        ? { name: FE_NEED.vendorName, id: FE_NEED.vendorId }
        : undefined,
    });
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
      formRef.current?.setFieldsValue({
        phoneCodeId: DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
      });

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
    // 自动触发 onSubmit
  };

  const getExpireCount = async () => {
    setExpireCountLoading(true);
    const res = await crewFileExpireCount().finally(() => {
      setExpireCountLoading(false);
    });

    if (res.code === 200) {
      setExpireCountData(res.data);
    }
  };

  const onExpireStatusChange = async (v: EnumContractExpireStatus) => {
    formRef.current?.resetFields();
    formRef.current?.setFieldsValue({
      phoneCodeId: DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
    });
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
    getCityCode();
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Crew Name',
      dataIndex: 'name',
      width: 150,
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Crew Name' }}
          request={{
            field: 'name',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`name${record.id}`}
            title={record.name}
            placement="top"
          >
            {record.name}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'status',
      ellipsis: { showTitle: false },
      width: 150,
      valueType: 'select',
      valueEnum: CrewStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'Accreditation Status',
      },
      render: (_, record) => {
        const status: CrewStatusEnum = record.status;
        const Content = (
          <Badge color={CrewStatusEnumColor[status]} text={status} />
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
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
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
      title: 'Type',
      dataIndex: 'type',
      width: 130,
      valueEnum: CrewTypeEnumText,
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
        placeholder: 'Type',
      },
      render: (_, record) => {
        const { driverFlag, helperFlag } = record;
        const driverStr = driverFlag
          ? CrewTypeEnumText[CrewTypeEnum.DRIVER]
          : '';
        const helperStr = helperFlag
          ? CrewTypeEnumText[CrewTypeEnum.HELPER]
          : '';
        const str =
          !!driverStr && !!helperStr
            ? `${driverStr},${helperStr}`
            : driverStr
              ? driverStr
              : helperStr;
        return (
          <CustomTooltip key={`type${record.id}`} title={str}>
            {str}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'ID Number',
      dataIndex: 'idNumber',
      valueType: 'select',
      width: 120,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'ID Number' }}
          request={{
            field: 'idNumber',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`idNumber${record.id}`}
            title={record.idNumber}
            placement="top"
          >
            {record.idNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      valueType: 'select',
      width: 120,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'License Number' }}
          request={{
            field: 'licenseNumber',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`licenseNumber${record.id}`}
            title={record.licenseNumber}
            placement="top"
          >
            {record.licenseNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contact',
      dataIndex: 'phoneNum',
      width: 120,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      renderFormItem: () => (
        <div style={{ display: 'flex' }}>
          <Form.Item name="phoneCodeId" noStyle>
            <Select
              style={{ width: 92, textAlign: 'left' }}
              options={codeList}
              optionLabelProp="show"
              optionFilterProp="label"
              popupMatchSelectWidth={false}
              showSearch
              // onChange={(value, option) => setCodeOption(option)}
            ></Select>
          </Form.Item>
          <Form.Item name="phoneNum" noStyle>
            <FuzzySelector
              fieldProps={{ placeholder: 'Contact' }}
              request={{
                field: 'phoneNum',
                esDtoClass: ES_DTO_CLASS.CREW,
                type: FieldQueryHighlightTypeEnum.COUNTRY,
                uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CREW_PHONE_CODE,
                uniqueLogicParams: {
                  phoneCodeId:
                    formRef.current?.getFieldValue('phoneCodeId') ??
                    DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
                },
              }}
            />
          </Form.Item>
        </div>
      ),
      render: (_, record) => {
        return (
          <CustomTooltip key={`phoneNum${record.id}`} title={record.phoneNum}>
            {record.phoneCode + ' ' + record.phoneNum}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor',
      dataIndex: 'vendorList',
      width: 120,
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Vendor Name' }}
          request={{
            field: 'vendorName',
            esDtoClass: ES_DTO_CLASS.VENDOR,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),

      render: (_, record) => {
        const { vendorList } = record;
        const content = vendorList?.length
          ? vendorList?.map((item: ICrewListVendorRecord, index: number) => {
              return (
                <a
                  style={{ margin: '0 2px' }}
                  key={item.vendorId}
                  onClick={() => {
                    openNewTag(`${PATHS.VENDOR_DETAIL}/${item.vendorId}`);
                  }}
                >
                  {item.vendorName}
                  {index !== vendorList?.length - 1 ? ',' : ''}
                </a>
              );
            })
          : '-';
        return (
          <CustomTooltip key={`vendorName${record.id}`} title={content}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Remaining Days',
      dataIndex: 'accreditationRemainingDays',
      width: 160,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Accreditation Remaining ', 'Accreditation Remaining '],
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
      width: 150,
      valueType: 'dateTimeRange',

      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Update Time Start', 'Update Time End'],
      },
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
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 210,
      hideInTable:
        !access[PermissionEnum.CREW_DETAIL] &&
        !access[PermissionEnum.CREW_LIST_UPDATE_ACCREDITATION],
      render: (_, record) => {
        return (
          <Flex gap={16}>
            <Access
              key="detail"
              accessible={access[PermissionEnum.CREW_DETAIL]}
            >
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  saveScrollTop();
                  history.push(`${PATHS.VENDOR_CREW_DETAIL}/${record.id}`);
                }}
              >
                Details
              </Button>
            </Access>
            <Access
              key="Update"
              accessible={access[PermissionEnum.CREW_LIST_UPDATE_ACCREDITATION]}
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
    <Access key="create" accessible={access[PermissionEnum.CREW_CREATE]}>
      <Button key="create" type="primary" onClick={() => setShowAddModal(true)}>
        Add Crew
      </Button>
    </Access>,
  ];

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_CREW_LIST_RELOAD, () => {
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
        className={styles.crewListTable}
        form={{
          name: 'crew-list',
        }}
        columns={columns}
        scroll={{ x: 1400 }}
        formRef={formRef}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            // onSubmit({ pageNum: page, pageSize: pageSize });
            onPaginationChange({ pageNum: page, pageSize: pageSize });
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
        <CrewModal
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
          source={UploadPathTypeEnum.CREW}
          hideModal={() => {
            setShowUpdateAccreditationModal(false);
          }}
          // refresh={reload}
        />
      ) : null}
    </>
  );
};
export default CrewList;
