import { projectList } from '@/api/project';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { IconDetail } from '@/components/OperationIcon';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LogisticsCategoryEnumText,
  PATHS,
} from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
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
import { openNewTag } from '@/utils/utils';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useAccess, useParams } from '@umijs/max';
import { Badge } from 'antd';
import lodash from 'lodash';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { EVENT_MAP } from '../../constants';
import styles from './styles.less';

export default memo(function CustomerDetailProjects() {
  const access = useAccess();

  const { subscribe } = useContext(PubSubContext);
  const { id: pageId } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const searchParamsRef = useRef<any>();
  const getDataSource = async (params: any) => {
    setLoading(true);
    const res = await projectList(params);
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onSubmit = (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const BE_NEED = {
      customerId: pageId,
      pageNum,
      pageSize,
    };
    const values = formRef.current?.getFieldsValue();

    if (values.projectNameObj) {
      lodash.set(BE_NEED, 'projectName', values.projectNameObj.name);
    }
    if (values.projectStatus) {
      lodash.set(BE_NEED, 'projectStatus', values.projectStatus);
    }
    if (values.logisticsCategory) {
      lodash.set(BE_NEED, 'logisticsCategory', values.logisticsCategory);
    }

    if (values.serviceCategory) {
      lodash.set(BE_NEED, 'serviceCategory', values.serviceCategory);
    }

    if (values.logisticsFlow) {
      lodash.set(BE_NEED, 'logisticsFlow', values.logisticsFlow);
    }

    if (values.distance) {
      lodash.set(BE_NEED, 'distance', values.distance);
    }
    searchParamsRef.current = BE_NEED;
    getDataSource(BE_NEED);
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
    customerId: number;
  }) => {
    await getDataSource({ ...searchParamsRef.current, ...params });
  };

  const columns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectNameObj',
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
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Project Name' }}
          request={{
            field: 'projectName',
            esDtoClass: ES_DTO_CLASS.PROJECT,
            type: FieldQueryHighlightTypeEnum.USER_ROLE,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customers Name',
      dataIndex: 'customerName',
      hideInSearch: true,
      ellipsis: { showTitle: false },
      width: 300,
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
      hideInSearch: true,
      ellipsis: { showTitle: false },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerTag}>
            {record.customerTag}
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
      valueType: 'select',
      hideInSearch: true,
      width: 200,
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
      title: 'Financial status',
      dataIndex: 'financialStatus',
      valueType: 'select',
      hideInSearch: true,
      width: 200,
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
      title: 'Creation Time',
      dataIndex: 'creationTime',
      valueType: 'select',
      width: 200,
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.createdAt}>
          <div className={styles.commonText}>{record.createdAt}</div>
        </CustomTooltip>
      ),
    },
    {
      title: 'Operate',
      valueType: 'option',
      hideInTable: !access[PermissionEnum.CUSTOMER_DETAIL_PROJECTS_DETAIL],
      key: 'id',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            boxSizing: 'border-box',
          }}
        >
          <IconDetail
            onClick={() =>
              openNewTag(`${PATHS.PROJECT_DETAIL_BASE}/${record.id}?type=blank`)
            }
          ></IconDetail>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_MAP.PROJECT_LIST_RELOAD, () => {
      // actionRef?.current?.reload?.();
      getDataSource({ customerId: pageId, pageNum: 1, pageSize: 20 });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    getDataSource({ customerId: pageId, pageNum: 1, pageSize: 20 });
  }, []);

  return (
    <div className={styles.projects}>
      <CustomTable
        noStyle
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        // headerTitle={null}
        scroll={{ x: 2100 }}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({
              pageNum: page,
              pageSize: pageSize,
              customerId: +pageId!,
            });
          },
        }}
        loading={loading}
        onSubmit={onSubmit}
        toolBarRender={false}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
    </div>
  );
});
