import { projectAdd, projectList } from '@/api/project';
// import CustomStatusButton, { ThemeEnum } from '@/components/CustomStatusButton';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  LogisticsCategoryEnumText,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CustomerSizeEnumText,
  DistanceEnumText,
  FieldQueryHighlightTypeEnum,
  FinancialStatusEnum,
  FinancialStatusEnumText,
  LogisticsCategoryEnum,
  LogisticsFlowEnumText,
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
  ServiceCategoryEnumText,
  TransportationStatusEnum,
  TransportationStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { formatString } from '@/utils/format';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { App, Badge, Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import ProjectModal from './components/ProjectModal';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  projectName?: string;
  customerName?: string;
  customerTag?: string;
  logisticsFlow?: string;
  serviceCategory?: string;
  distance?: string;
  projectStatus?: ProjectStatusEnum;
  transportationStatus?: TransportationStatusEnum;
  financialStatus?: FinancialStatusEnum;
  logisticsCategory?: LogisticsCategoryEnum;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
}

const ProjectList: React.FC = () => {
  const access = useAccess();
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [projectModalTitle, setProjectModalTitle] = useState<string>('');
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);

  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

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
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
    value: customerNameValue,
    setValue: setCustomerNameValue,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: customerTagOptions,
    onSearch: customerTagSearch,
    defaultFieldProps: customerTagDefaultFieldProps,
    value: customerTagValue,
    setValue: setCustomerTagValue,
  } = useFieldQuery({
    field: 'customerTag',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
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
    const res = await projectList(BE_NEED);
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

    if (values.projectName) {
      const nameOrValue = values.projectName?.name || values.projectName?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'projectName', _value);
      lodash.set(BE_NEED, 'projectName', _value);
    }

    if (values.customerName) {
      const nameOrValue =
        values.customerName?.name || values.customerName?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'customerName', _value);
      lodash.set(BE_NEED, 'customerName', _value);
    }

    if (values.customerTag) {
      const nameOrValue = values.customerTag?.name || values.customerTag?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;

      lodash.set(FE_NEED, 'customerTag', _value);
      lodash.set(BE_NEED, 'customerTag', _value);
    }

    if (values.projectStatus) {
      lodash.set(FE_NEED, 'projectStatus', values.projectStatus);
      lodash.set(BE_NEED, 'projectStatus', values.projectStatus);
    }

    if (values.transportationStatus) {
      lodash.set(FE_NEED, 'transportationStatus', values.transportationStatus);
      lodash.set(BE_NEED, 'transportationStatus', values.transportationStatus);
    }

    if (values.financialStatus) {
      lodash.set(FE_NEED, 'financialStatus', values.financialStatus);
      lodash.set(BE_NEED, 'financialStatus', values.financialStatus);
    }

    if (values.logisticsCategory) {
      lodash.set(FE_NEED, 'logisticsCategory', values.logisticsCategory);
      lodash.set(BE_NEED, 'logisticsCategory', values.logisticsCategory);
    }

    if (values.serviceCategory) {
      lodash.set(FE_NEED, 'serviceCategory', values.serviceCategory);
      lodash.set(BE_NEED, 'serviceCategory', values.serviceCategory);
    }

    if (values.logisticsFlow) {
      lodash.set(FE_NEED, 'logisticsFlow', values.logisticsFlow);
      lodash.set(BE_NEED, 'logisticsFlow', values.logisticsFlow);
    }

    if (values.distance) {
      lodash.set(FE_NEED, 'distance', values.distance);
      lodash.set(BE_NEED, 'distance', values.distance);
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
      projectStatus: FE_NEED.projectStatus,
      transportationStatus: FE_NEED.transportationStatus,
      financialStatus: FE_NEED.financialStatus,
      logisticsCategory: FE_NEED.logisticsCategory,
      serviceCategory: FE_NEED.serviceCategory,
      logisticsFlow: FE_NEED.logisticsFlow,
      distance: FE_NEED.distance,
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
        ? { value: FE_NEED.projectName }
        : undefined,
      customerName: FE_NEED.customerName
        ? { value: FE_NEED.customerName }
        : undefined,
      customerTag: FE_NEED.customerTag
        ? { value: FE_NEED.customerTag }
        : undefined,
    });

    setProjectNameValue(FE_NEED.projectName);
    setCustomerNameValue(FE_NEED.customerName);
    setCustomerTagValue(FE_NEED.customerTag);
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
    setCustomerNameValue(undefined);
    setCustomerTagValue(undefined);
    // 自动触发 onSubmit
  };

  const handleAddFinish = async (values: any) => {
    const {
      projectName,
      customerId,
      commodity,
      daysForPod,
      agreedStartTime,
      agreedEndTime,
      confirmationWindow,
      logisticsCategory,
      serviceCategory,
      logisticsFlow,
      distance,
      bu,
      buList,
      currentRequirementList,
      requirementType,
      potentialVolumeQuantity,
      potentialVolumeFrequency,
      requirementFrequency,
      serviceTruckTypeIds,
      creditTerms,
    } = values;
    const params = {
      projectName,
      customerId,
      commodity,
      daysForPod,
      agreedStartTime,
      agreedEndTime,
      confirmationWindow,
      logisticsCategory,
      serviceCategory,
      logisticsFlow,
      distance,
      bu,
      buList,
      currentRequirementList,
      requirementType,
      potentialVolumeQuantity,
      potentialVolumeFrequency,
      requirementFrequency,
      serviceTruckTypeIds,
      creditTerms,
    };
    setConfirmLoading(true);
    const res = await projectAdd(params);
    setConfirmLoading(false);
    if (res.code === 200) {
      setProjectModalOpen(false);
      message.success('Add project successfully!');
      reload();
    }
  };

  const onConfirm = async (values: any) => {
    handleAddFinish(values);
  };

  const handleCreateProject = () => {
    setProjectModalTitle('Create Project');
    setProjectModalOpen(true);
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
      title: 'Customer Name',
      dataIndex: 'customerName',
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
        ...customerNameDefaultFieldProps,
        placeholder: 'Customer Name',
        options: customerNameOptions,
        onSearch: customerNameSearch,
        value: customerNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Tag',
      dataIndex: 'customerTag',
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
        ...customerTagDefaultFieldProps,
        placeholder: 'Customer Tag',
        options: customerTagOptions,
        onSearch: customerTagSearch,
        value: customerTagValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerTag}>
            {record.customerTag}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Logistics Category',
      dataIndex: 'logisticsCategory',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: LogisticsCategoryEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Logistics Category',
      },
      render: (_, record) => {
        const logisticsCategory: LogisticsCategoryEnum =
          record.logisticsCategory;
        const logisticsCategoryValue =
          LogisticsCategoryEnumText[logisticsCategory];
        return (
          <CustomTooltip title={logisticsCategoryValue}>
            {logisticsCategoryValue}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Service Category',
      dataIndex: 'serviceCategory',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: ServiceCategoryEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Service Category',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.serviceCategory}>
            {record.serviceCategory}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Logistics Flow',
      dataIndex: 'logisticsFlow',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: LogisticsFlowEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Logistics Flow',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.logisticsFlow}>
            {record.logisticsFlow}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: DistanceEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Distance',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.distance}>
            {record.distance}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Status',
      dataIndex: 'projectStatus',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: ProjectStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Project Status',
      },
      render: (_, record) => {
        const status: ProjectStatusEnum = record.projectStatus;
        const Content = (
          <Badge
            color={ProjectStatusEnumColor[status]}
            text={ProjectStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Transportation Status',
      dataIndex: 'transportationStatus',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: TransportationStatusEnumText,
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
        const status: TransportationStatusEnum = record.transportationStatus;
        const Content = (
          <Badge
            color={ProjectStatusEnumColor[status]}
            text={TransportationStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Financial Status',
      dataIndex: 'financialStatus',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: FinancialStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Financial Status',
      },
      render: (_, record) => {
        const status: FinancialStatusEnum = record.financialStatus;
        const Content = (
          <Badge
            color={ProjectStatusEnumColor[status]}
            text={FinancialStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
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
      hideInTable: !access[PermissionEnum.PROJECT_DETAIL],
      width: 90,
      render: (_, record) => {
        return (
          <Access
            key="detail"
            accessible={access[PermissionEnum.PROJECT_DETAIL]}
          >
            <Button
              icon={<BarsOutlined />}
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                saveScrollTop();
                history.push(`${PATHS.PROJECT_DETAIL_BASE}/${record.id}`);
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
      accessible={access[PermissionEnum.PROJECT_LIST_CREATE]}
    >
      <Button type="primary" onClick={() => handleCreateProject()}>
        Create Project
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
        scroll={{ x: 2400 }}
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
      <ProjectModal
        title={projectModalTitle}
        isEdit={false}
        open={projectModalOpen}
        onConfirm={onConfirm}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            setProjectModalOpen(false);
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
          },
        }}
      />
    </>
  );
};

export default ProjectList;
