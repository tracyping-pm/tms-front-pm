import { capacityPoolCreate, capacityPoolList } from '@/api/capacity';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import { CustomerSizeEnumText, FieldQueryHighlightTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { formatString } from '@/utils/format';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { App, Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useCallback, useEffect, useRef, useState } from 'react';
import PoolModal from '../project/components/PoolModal';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  poolName?: string;
  projectId?: number;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  projectName?: string;
}

const CapacityList: React.FC = () => {
  const access = useAccess();
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [poolModalOpen, setPoolModalOpen] = useState<boolean>(false);
  const [poolModalConfirmLoading, setPoolModalConfirmLoading] =
    useState<boolean>(false);

  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

  const {
    options: poolNameOptions,
    onSearch: poolNameSearch,
    defaultFieldProps: poolNameDefaultFieldProps,
    value: poolNameValue,
    setValue: setPoolNameValue,
  } = useFieldQuery({
    field: 'poolName',
    esDtoClass: ES_DTO_CLASS.CAPACITY,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
    value: projectNameValue,
    setValue: setProjectNameValue,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
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
    const res = await capacityPoolList(BE_NEED);
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const reload = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    getDataSource(BE_NEED ?? {});
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.poolName) {
      const nameOrValue = values.poolName?.name || values.poolName?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'poolName', _value);
      lodash.set(BE_NEED, 'poolName', _value);
    }

    if (values.projectName) {
      lodash.set(FE_NEED, 'projectName', values.projectName?.name);
      lodash.set(FE_NEED, 'projectId', values.projectName?.id);
      lodash.set(BE_NEED, 'projectId', values.projectName?.id);
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
      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      poolName: FE_NEED.poolName ? { value: FE_NEED.poolName } : undefined,
      projectName: FE_NEED.projectName
        ? { value: FE_NEED.projectName, id: FE_NEED.projectId }
        : undefined,
    });

    setPoolNameValue(FE_NEED.poolName);
    setProjectNameValue(FE_NEED.projectName);
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

  const handleCreatePool = () => {
    setPoolModalOpen(true);
  };

  const onPoolModalConfirm = useCallback(async (values: any) => {
    const { poolName, projectId, projectName } = values;
    const params = {
      poolName,
      projectId,
      projectName,
    };
    setPoolModalConfirmLoading(true);
    const res = await capacityPoolCreate(params);
    setPoolModalConfirmLoading(false);
    if (res.code === 200) {
      setPoolModalOpen(false);
      reload();
      message.success('Add Pool successfully!');
    }
  }, []);

  const onReset = () => {
    setUrlState({ extra: undefined });
    setPoolNameValue(undefined);
    setProjectNameValue(undefined);
    // 自动触发 onSubmit
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

  const columns: ProColumns[] = [
    {
      title: 'Pool Name',
      dataIndex: 'poolName',
      valueType: 'select',
      width: 260,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...poolNameDefaultFieldProps,
        placeholder: 'Pool Name',
        options: poolNameOptions,
        onSearch: poolNameSearch,
        value: poolNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.poolName}>
            {record.poolName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      valueType: 'select',
      width: 260,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...projectNameDefaultFieldProps,
        placeholder: 'Project Name',
        options: projectNameOptions,
        onSearch: projectNameSearch,
        value: projectNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Trucks',
      dataIndex: 'trucks',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (_, record) => {
        return (
          <CustomTooltip title={formatAmount(record.trucks)} placement="top">
            {formatAmount(record.trucks)}
          </CustomTooltip>
        );
      },
    },
    // {
    //   title: 'Approved Trucks ',
    //   dataIndex: 'approvedTrucks',
    //   hideInSearch: true,
    //   ellipsis: {
    //     showTitle: false,
    //   },
    //   width: 160,
    //   render: (_, record) => {
    //     return (
    //       <CustomTooltip title={formatAmount(record.approvedTrucks)}>
    //         {formatAmount(record.approvedTrucks)}
    //       </CustomTooltip>
    //     );
    //   },
    // },
    {
      title: 'Vendors',
      dataIndex: 'vendors',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (_, record) => {
        return (
          <CustomTooltip title={formatAmount(record.vendors)} placement="top">
            {formatAmount(record.vendors)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Crews',
      dataIndex: 'crews',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (_, record) => {
        return (
          <CustomTooltip title={formatAmount(record.crews)} placement="top">
            {formatAmount(record.crews)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Approved Vendors',
      dataIndex: 'approvedVendors',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 160,
      render: (_, record) => {
        return (
          <CustomTooltip
            title={formatAmount(record.approvedVendors)}
            placement="top"
          >
            {formatAmount(record.approvedVendors)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
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
            title={dayjs(record.creationTime).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.creationTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable: !access[PermissionEnum.CAPACITY_POOL_DETAIL],
      width: 90,
      // text, record, _, action
      render: (_, record) => {
        return (
          <Access
            key="detail"
            accessible={access[PermissionEnum.CAPACITY_POOL_DETAIL]}
          >
            <Button
              icon={<BarsOutlined />}
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                saveScrollTop();
                history.push(`${PATHS.CAPACITY_DETAIL}/${record.id}`);
              }}
            >
              Details
            </Button>
          </Access>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create"
      accessible={access[PermissionEnum.CAPACITY_POOL_CREATE]}
    >
      <Button key="create" type="primary" onClick={() => handleCreatePool()}>
        Create Pool
      </Button>
    </Access>,
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <>
      {/* <div>urlState: {urlState?.extra}</div> */}
      <CustomTable
        columns={columns}
        scroll={{ x: 1500 }}
        formRef={formRef}
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
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      <PoolModal
        title={'Create Pool'}
        isEdit={false}
        open={poolModalOpen}
        onConfirm={onPoolModalConfirm}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            setPoolModalOpen(false);
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: poolModalConfirmLoading,
          },
        }}
      />
    </>
  );
};

export default CapacityList;
