import { vendorListContract } from '@/api/contract';
import { vendorProject } from '@/api/vendor';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { IconDetail } from '@/components/OperationIcon';
import { ItemType } from '@/components/TableDropdown';
import TableOperation from '@/components/TableOperation';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LogisticsCategoryEnumText,
  PATHS,
} from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  ContractStatusEnum,
  ContractStatusEnumColor,
  ContractStatusEnumText,
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
import { openNewTag } from '@/utils/utils';
import { EyeOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Badge } from 'antd';
import lodash from 'lodash';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ContractListModal, {
  IContractListModalState,
  initialContractListModalState,
} from '../ContractListModal';
import styles from './styles.less';

export default memo(function VendorDetailProjects() {
  const access = useAccess();
  const { id: vendorId } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [contractListModalState, setContractListModalState] =
    useSetState<IContractListModalState>(initialContractListModalState);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const activeRecordKeyRef = useRef<number>();
  const searchParamsRef = useRef<any>();

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

  const fetchContractList = useCallback(
    async (projectId: number, pageNum = 1, pageSize = 20) => {
      activeRecordKeyRef.current = projectId;
      const payload = {
        pageNum,
        pageSize,
        projectId,
        contractSigner: +vendorId!,
        contractType: 'Vendor',
      };
      setContractListModalState({ loading: true });
      const res = await vendorListContract(payload).finally(() => {
        setContractListModalState({ loading: false });
      });
      setContractListModalState({ loading: false });
      if (res.code === 200) {
        const data = res.data?.list || [];
        const list =
          data?.map?.((item) => ({
            id: item?.id,
            contractNumber: item?.contractNumber,
            contractStatus: item?.contractStatus,
            startDate: item?.startDate,
            endDate: item?.endDate,
          })) ?? [];
        const _originData = { list, pageNum, pageSize, total: res.data.total };
        setContractListModalState({
          originData: _originData,
          open: true,
          projectId,
          contractSigner: +vendorId!,
        });
      }
    },
    [],
  );

  const onReset = useCallback(() => {
    setProjectNameValue(undefined);
  }, []);

  const getDataSource = async (params: any) => {
    setLoading(true);

    const res = await vendorProject(params);
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onSubmit = (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const BE_NEED = {
      vendorId: Number(vendorId),
      pageNum,
      pageSize,
    };
    const values = formRef.current?.getFieldsValue();

    if (values.projectName) {
      lodash.set(BE_NEED, 'projectId', values.projectName?.id);
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
    vendorId: number;
  }) => {
    await getDataSource({ ...searchParamsRef.current, ...params, vendorId });
  };

  const columns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      valueType: 'select',
      ellipsis: { showTitle: false },
      width: 300,
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
      render: (_, record) => (
        <CustomTooltip
          key={`projectName${record.id}`}
          title={record.projectName}
        >
          {record.projectName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customers Name',
      dataIndex: 'customerName',
      hideInSearch: true,
      ellipsis: { showTitle: false },
      width: 300,
      render: (_, record) => (
        <CustomTooltip
          key={`customerName${record.id}`}
          title={record.customerName}
        >
          {record.customerName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Tag',
      dataIndex: 'customerTag',
      hideInSearch: true,
      ellipsis: { showTitle: false },
      width: 150,
      render: (_, record) => (
        <CustomTooltip
          key={`customerTag${record.id}`}
          title={record.customerTag}
        >
          {record.customerTag}
        </CustomTooltip>
      ),
    },
    {
      title: 'Latest Contract Status',
      dataIndex: 'contractStatus',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      hideInSearch: true,
      render: (_, record) => {
        const status: ContractStatusEnum = record.contractStatus;
        const theme = ContractStatusEnumColor[status];
        const Content = ContractStatusEnumText[status] ? (
          <Badge color={theme} text={ContractStatusEnumText[status]} />
        ) : (
          '-'
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Latest Contract Validity Period',

      ellipsis: {
        showTitle: false,
      },
      width: 230,
      hideInSearch: true,
      render: (_, record) => {
        const { contractStartDate, contractEndDate } = record;
        const content = contractStartDate
          ? `${contractStartDate}--${contractEndDate}`
          : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Project Status',
      dataIndex: 'projectStatus',
      valueType: 'select',
      valueEnum: ProjectStatusEnumText,
      width: 200,
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
            color={!!status ? ProjectStatusEnumColor[status] : ''}
            text={ProjectStatusEnumText[status] ?? '-'}
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
            color={!!status ? ProjectStatusEnumColor[status] : ''}
            text={TransportationStatusEnumText[status] ?? '-'}
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
            color={!!status ? ProjectStatusEnumColor[status] : ''}
            text={FinancialStatusEnumText[status] ?? '-'}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Logistics Category',
      dataIndex: 'logisticsCategory',
      width: DEFAULT_WIDTH,
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
      width: DEFAULT_WIDTH,
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
      width: DEFAULT_WIDTH,
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
      width: DEFAULT_WIDTH,
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
      dataIndex: 'createdAt',
      valueType: 'select',
      width: 200,
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip key={`createdAt${record.id}`} title={record.createdAt}>
          {record.createdAt}
        </CustomTooltip>
      ),
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'id',
      width: 200,
      fixed: 'right',
      hideInTable: !access[PermissionEnum.VENDOR_DETAIL_PROJECT_DETAIL],
      render: (_, record) => {
        const operationList = [
          access[PermissionEnum.VENDOR_DETAIL_PROJECT_DETAIL]
            ? {
                key: 'detail',
                title: 'Detail',
                icon: <IconDetail showPopover={false} />,
                label: 'Detail',
                loading: false,
              }
            : null,
          {
            key: 'contractList',
            title: 'Contract List',
            icon: <EyeOutlined />,
            label: 'Contract List',
            loading:
              contractListModalState?.loading &&
              record?.id === activeRecordKeyRef.current,
          },
        ].filter(Boolean) as ItemType[];
        return (
          <TableOperation
            list={operationList}
            onTrigger={async (item: ItemType) => {
              if (item.key === 'detail') {
                openNewTag(
                  `${PATHS.PROJECT_DETAIL_BASE}/${record.id}?type=blank`,
                );
                return Promise.resolve();
              } else if (item.key === 'contractList') {
                await fetchContractList(record?.id);
                return Promise.resolve();
              } else {
                console.error('Unknown operation');
              }
            }}
          />
        );
      },
    },
  ];

  useEffect(() => {
    getDataSource({ vendorId: Number(vendorId), pageNum: 1, pageSize: 20 });
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
              vendorId: Number(vendorId),
            });
            // onSubmit({ pageNum: page, pageSize: pageSize });
          },
        }}
        loading={loading}
        onSubmit={onSubmit}
        onReset={onReset}
        toolBarRender={false}
        form={{
          name: 'vendor-project',
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      <ContractListModal
        contractListModalState={contractListModalState}
        originData={contractListModalState.originData}
        onCancel={() => setContractListModalState({ open: false })}
        onConfirm={() => setContractListModalState({ open: false })}
        pageSizeChange={(v) => {
          const { pageNum, pageSize, projectId } = v;
          fetchContractList(projectId, pageNum, pageSize);
        }}
      />
    </div>
  );
});
