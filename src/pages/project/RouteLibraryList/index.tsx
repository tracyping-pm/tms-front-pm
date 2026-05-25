import { getRouteLibraryList } from '@/api/project';
import { IRouteLibraryListItem } from '@/api/types/project';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CustomerSizeEnumText,
  FieldQueryHighlightTypeEnum,
  RouteBillingModeEnum,
  RouteBillingModeEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import LibraryModal from '@/pages/project/components/LibraryModal';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  projectId?: number;
  libraryId?: number;
  billingMode?: RouteBillingModeEnum;
  userId?: number;
  pricerId?: number;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  projectName?: string;
  libraryName?: string;
  pricerName?: string;
}

const RouteLibraries: React.FC = () => {
  const access = useAccess();
  // const { message } = App.useApp();
  // 列表展示配置
  const [originData, setOriginData] =
    useState<PaginationResponse<IRouteLibraryListItem>>(DEFAULT_PAGINATION);
  // route modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

  const {
    options: libraryNameOptions,
    onSearch: libraryNameSearch,
    defaultFieldProps: libraryNameDefaultFieldProps,
    value: libraryNameValue,
    setValue: setLibraryNameValue,
  } = useFieldQuery({
    field: 'libraryName',
    esDtoClass: ES_DTO_CLASS.ROUTE_LIBRARY,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
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

  const {
    options: pricerNameOptions,
    onSearch: pricerNameSearch,
    defaultFieldProps: pricerNameDefaultFieldProps,
    value: pricerNameValue,
    setValue: setPricerNameValue,
  } = useFieldQuery({
    isUAM: true,
    field: 'aliasName',
    esDtoClass: ES_DTO_CLASS.USER,
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
    const res = await getRouteLibraryList(BE_NEED);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data ?? []);
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

    if (values.projectName) {
      lodash.set(FE_NEED, 'projectName', values.projectName?.name);
      lodash.set(FE_NEED, 'projectId', values.projectName?.id);
      lodash.set(BE_NEED, 'projectId', values.projectName?.id);
    }

    if (values.libraryName) {
      lodash.set(FE_NEED, 'libraryName', values.libraryName?.name);
      lodash.set(FE_NEED, 'libraryId', values.libraryName?.id);
      lodash.set(BE_NEED, 'libraryId', values.libraryName?.id);
    }

    if (values.billingMode) {
      lodash.set(FE_NEED, 'billingMode', values.billingMode);
      lodash.set(BE_NEED, 'billingMode', values.billingMode);
    }

    if (values.pricerName) {
      lodash.set(FE_NEED, 'pricerName', values.pricerName?.name);
      lodash.set(BE_NEED, 'userId', values.pricerName?.id);
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
      billingMode: FE_NEED.billingMode,
      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      projectName: FE_NEED.projectName
        ? { value: FE_NEED.projectName, id: FE_NEED.projectId }
        : undefined,
      libraryName: FE_NEED.libraryName
        ? { value: FE_NEED.libraryName, id: FE_NEED.libraryId }
        : undefined,
      pricerName: FE_NEED.pricerName
        ? { value: FE_NEED.pricerName }
        : undefined,
    });

    setProjectNameValue(FE_NEED.projectName);
    setLibraryNameValue(FE_NEED.libraryName);
    setPricerNameValue(FE_NEED.pricerName);
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
    setProjectNameValue(undefined);
    setLibraryNameValue(undefined);
    setPricerNameValue(undefined);
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
      title: 'Library Name',
      dataIndex: 'libraryName',
      valueType: 'select',
      width: 300,
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
        ...libraryNameDefaultFieldProps,
        placeholder: 'Library Name',
        options: libraryNameOptions,
        onSearch: libraryNameSearch,
        value: libraryNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.libraryName}>
            {record.libraryName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      valueType: 'select',
      width: 300,
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
      title: 'Pricing Mode',
      dataIndex: 'billingMode',
      width: 300,
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      valueEnum: RouteBillingModeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Pricing Mode',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.billingMode}>
            {record.billingMode}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Pricer',
      dataIndex: 'pricerName',
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
      fieldProps: {
        ...pricerNameDefaultFieldProps,
        placeholder: 'Pricer',
        options: pricerNameOptions,
        onSearch: pricerNameSearch,
        value: pricerNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.pricerName}>
            {record.pricerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'No. of Routes',
      dataIndex: 'activeRouteNum',
      hideInSearch: true,
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.activeRouteNum}>
            {record.activeRouteNum}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'No. of Customer PV (Active/ Total)',
      dataIndex: 'activeCustomerVersionNum',
      hideInSearch: true,
      width: 260,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const content = `${record.activeCustomerVersionNum} / ${record.totalCustomerVersionNum}`;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'No. of Vendor PV (Active/ Total)',
      dataIndex: 'activeVendaVersionNum',
      hideInSearch: true,
      width: 260,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const content = `${record.activeVendaVersionNum} / ${record.totalVendaVersionNum}`;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 200,
      valueType: 'dateTimeRange',
      ellipsis: {
        showTitle: false,
      },
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
      hideInTable: !access[PermissionEnum.ROUTE_LIBRARY_DETAIL],
      key: 'option',
      fixed: 'right',
      width: 90,
      // text, record, _, action
      render: (_, record) => {
        return (
          <Button
            icon={<BarsOutlined />}
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => {
              saveScrollTop();
              history.push(`${PATHS.ROUTE_LIBRARY_DETAIL}/${record.id}`);
            }}
          >
            Details
          </Button>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create"
      accessible={access[PermissionEnum.ROUTE_LIBRARY_CREATE]}
    >
      <Button type="primary" onClick={() => setShowAddModal(true)}>
        Create Library
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
        scroll={{ x: 2000 }}
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
      {showAddModal ? (
        <LibraryModal
          hideModal={() => {
            setShowAddModal(false);
          }}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {},
          }}
          refresh={reload}
        />
      ) : null}
    </>
  );
};

export default RouteLibraries;
