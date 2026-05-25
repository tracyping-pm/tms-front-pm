import {
  alarmDashboardTaskList,
  alarmDashboardTaskListRefresh,
} from '@/api/project';
import { IAlarmDashboardTaskListPayload } from '@/api/types/project';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import NumberRangeSelect, {
  INumberRange,
} from '@/components/NumberRangeSelect';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import { CustomerSizeEnumText, FieldQueryHighlightTypeEnum } from '@/enums';
import { formatAmount, openNewTag } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  projectIdList?: number[];
  vendorIdList?: number[];
  driverIdList?: number[];
  timeoutDurationMin?: number;
  timeoutDurationMax?: number;
  riskLevelMin?: number;
  riskLevelMax?: number;
  firstLoadingCompletionTimeStart?: string;
  firstLoadingCompletionTimeEnd?: string;
  latestUnloadingCompletionTimeStart?: string;
  latestUnloadingCompletionTimeEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  projectNameList?: I_FUZZY_API_RESPONSE[];
  vendorNameList?: I_FUZZY_API_RESPONSE[];
  driverNameList?: I_FUZZY_API_RESPONSE[];
  timeoutDurationObj?: INumberRange;
  riskLevelObj?: INumberRange;
}

const TasksList: React.FC = () => {
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();

  const doScrollTop = (top: number) => {
    setTimeout(() => {
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await alarmDashboardTaskList(
      BE_NEED as IAlarmDashboardTaskListPayload,
    ).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };
    const values = formRef.current?.getFieldsValue();

    if (values.timeoutDurationObj) {
      lodash.set(FE_NEED, 'timeoutDurationObj', values.timeoutDurationObj);
      lodash.set(BE_NEED, 'timeoutDurationMin', values.timeoutDurationObj.min);
      lodash.set(BE_NEED, 'timeoutDurationMax', values.timeoutDurationObj.max);
    }

    if (values.riskLevelObj) {
      lodash.set(FE_NEED, 'riskLevelObj', values.riskLevelObj);
      lodash.set(BE_NEED, 'riskLevelMin', values.riskLevelObj.min);
      lodash.set(BE_NEED, 'riskLevelMax', values.riskLevelObj.max);
    }

    if (values.firstLoadingCompletionTime) {
      const [start, end] = values.firstLoadingCompletionTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'firstLoadingCompletionTimeStart', startTime);
      lodash.set(FE_NEED, 'firstLoadingCompletionTimeEnd', endTime);

      lodash.set(BE_NEED, 'firstLoadingCompletionTimeStart', startTime);
      lodash.set(BE_NEED, 'firstLoadingCompletionTimeEnd', endTime);
    }

    if (values.latestUnloadingCompletionTime) {
      const [start, end] = values.latestUnloadingCompletionTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'latestUnloadingCompletionTimeStart', startTime);
      lodash.set(FE_NEED, 'latestUnloadingCompletionTimeEnd', endTime);

      lodash.set(BE_NEED, 'latestUnloadingCompletionTimeStart', startTime);
      lodash.set(BE_NEED, 'latestUnloadingCompletionTimeEnd', endTime);
    }

    if (values?.projectNameList?.length > 0) {
      lodash.set(FE_NEED, 'projectNameList', values.projectNameList);
      lodash.set(
        BE_NEED,
        'projectIdList',
        values.projectNameList.map((item: I_FUZZY_API_RESPONSE) => item.id),
      );
    }

    if (values?.vendorNameList?.length > 0) {
      lodash.set(FE_NEED, 'vendorNameList', values.vendorNameList);
      lodash.set(
        BE_NEED,
        'vendorIdList',
        values.vendorNameList.map((item: I_FUZZY_API_RESPONSE) => item.id),
      );
    }

    if (values?.driverNameList?.length > 0) {
      lodash.set(FE_NEED, 'driverNameList', values.driverNameList);
      lodash.set(
        BE_NEED,
        'driverNameList',
        values.driverNameList.map((item: I_FUZZY_API_RESPONSE) => item.name),
      );
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });
    getDataSource(BE_NEED);
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      timeoutDurationObj: FE_NEED.timeoutDurationObj,
      riskLevelObj: FE_NEED.riskLevelObj,
      firstLoadingCompletionTime: [
        FE_NEED.firstLoadingCompletionTimeStart
          ? dayjs(FE_NEED.firstLoadingCompletionTimeStart)
          : undefined,
        FE_NEED.firstLoadingCompletionTimeEnd
          ? dayjs(FE_NEED.firstLoadingCompletionTimeEnd)
          : undefined,
      ],
      latestUnloadingCompletionTime: [
        FE_NEED.latestUnloadingCompletionTimeStart
          ? dayjs(FE_NEED.latestUnloadingCompletionTimeStart)
          : undefined,
        FE_NEED.latestUnloadingCompletionTimeEnd
          ? dayjs(FE_NEED.latestUnloadingCompletionTimeEnd)
          : undefined,
      ],
      projectNameList: FE_NEED.projectNameList
        ? FE_NEED.projectNameList
        : undefined,
      vendorNameList: FE_NEED.vendorNameList
        ? FE_NEED.vendorNameList
        : undefined,
      driverNameList: FE_NEED.driverNameList
        ? FE_NEED.driverNameList
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
      await getDataSource({ pageNum: 1, pageSize: 20 });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    }
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
  };

  const manualRefresh = async () => {
    setRefreshLoading(true);
    const res = await alarmDashboardTaskListRefresh().finally(() => {
      setRefreshLoading(false);
    });
    if (res.code === 200 && res.data) {
      doFirstQuery();
    }
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;

    await getDataSource({ ...BE_NEED, ...params });
  };

  useEffect(() => {
    doFirstQuery();
  }, []);

  const columns: ProColumns[] = [
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
      width: 120,
      dataIndex: 'riskLevelObj',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      order: 4,
      renderFormItem: () => {
        return <NumberRangeSelect placeholder="Risk Level" />;
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={formatAmount(record.riskLevel)} placement="top">
            {formatAmount(record.riskLevel)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Timeout duration for Delivery (H)',
      width: 230,
      dataIndex: 'timeoutDurationObj',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      order: 5,
      renderFormItem: () => {
        return (
          <NumberRangeSelect placeholder="Timeout duration for Delivery (H)" />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            title={formatAmount(record.timeoutDurationHours)}
            placement="top"
          >
            {formatAmount(record.timeoutDurationHours)}
          </CustomTooltip>
        );
      },
    },
    {
      title: () => {
        return (
          <>
            <span>Estimated Duration (H) </span>
            <Tooltip
              title={'Estimated duration on the google map'}
              placement="top"
            >
              <span style={{ margin: '0 2px' }}>
                <InfoCircleOutlined />
              </span>
            </Tooltip>
          </>
        );
      },
      dataIndex: 'estimatedDurationHours',
      width: 190,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={formatAmount(record.estimatedDurationHours)}>
            {formatAmount(record.estimatedDurationHours)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Used Duration (H)',
      dataIndex: 'usedDurationHours',
      width: 150,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={formatAmount(record.usedDurationHours)}>
            {formatAmount(record.usedDurationHours)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Waybill No.',
      dataIndex: 'waybillNumber',
      width: 150,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.waybillNumber}>
            <div
              style={{
                color: '#009688',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={() => {
                openNewTag(`${PATHS.WAYBILL_LIST_DETAIL}/${record.waybillId}`);
              }}
            >
              {record.waybillNumber}
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: '1st Loading Completion Time',
      dataIndex: 'firstLoadingCompletionTime',
      width: 210,
      valueType: 'dateTimeRange',
      valueEnum: CustomerSizeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      order: 3,
      fieldProps: {
        placeholder: [
          '1st Loading Completion Time Start',
          '1st Loading Completion Time End',
        ],
      },
      render: (_, record) => {
        const title = record.firstLoadingCompletionTime
          ? dayjs(record.firstLoadingCompletionTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )
          : '-';
        return <CustomTooltip title={title}>{title}</CustomTooltip>;
      },
    },
    {
      title: 'Latest Unloading Completion Time',
      dataIndex: 'latestUnloadingCompletionTime',
      width: 240,
      valueType: 'dateTimeRange',
      valueEnum: CustomerSizeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      order: 2,
      fieldProps: {
        placeholder: [
          'Latest Unloading Completion Time Start',
          'Latest Unloading Completion Time End',
        ],
      },
      render: (_, record) => {
        const title = record.latestUnloadingCompletionTime
          ? dayjs(record.latestUnloadingCompletionTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )
          : '-';
        return <CustomTooltip title={title}>{title}</CustomTooltip>;
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorNameList',
      valueType: 'select',
      width: 160,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Vendor Name', mode: 'multiple' }}
            request={{
              field: 'vendorName',
              esDtoClass: ES_DTO_CLASS.VENDOR,
              type: FieldQueryHighlightTypeEnum.COUNTRY,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorName}>
            {record.vendorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Trucks',
      dataIndex: 'trucks',
      width: 150,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={formatAmount(record.trucks)}>
            {formatAmount(record.trucks)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Driver Delivered Waybills',
      dataIndex: 'driverCount',
      width: 180,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={formatAmount(record.driverCount)}>
            {formatAmount(record.driverCount)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Driver Contact No.',
      dataIndex: 'driverContactNumber',
      width: 150,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.driverContactNumber}>
            {record.driverContactNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Driver Name',
      dataIndex: 'driverNameList',
      valueType: 'select',
      width: 160,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Driver Name', mode: 'multiple' }}
            request={{
              field: 'name',
              esDtoClass: ES_DTO_CLASS.CREW,
              type: FieldQueryHighlightTypeEnum.COUNTRY,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.driverName}>
            {record.driverName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      width: 150,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'projectNameList',
      valueType: 'select',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      order: 1,
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Project Name', mode: 'multiple' }}
            request={{
              field: 'projectName',
              esDtoClass: ES_DTO_CLASS.PROJECT,
              type: FieldQueryHighlightTypeEnum.COUNTRY,
            }}
          />
        );
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <div className={styles.taskList}>
      <div className={styles.listTitle}>Alarm Task List</div>
      <CustomTable
        headerTitle={
          <div className={styles.headerTitleWrap}>
            <span className={styles.titleText}>
              When the waybill is updated to Abnormal/Canceled/Delivered, the
              task will be closed and removed from the list
            </span>
            <Button
              type="primary"
              loading={refreshLoading}
              icon={<SyncOutlined />}
              onClick={manualRefresh}
              size={'middle'}
            />
          </div>
        }
        columns={columns}
        scroll={{ x: 1500 }}
        formRef={formRef}
        form={{
          name: 'TasksList',
        }}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
          },
        }}
        loading={loading}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
    </div>
  );
};

export default TasksList;
