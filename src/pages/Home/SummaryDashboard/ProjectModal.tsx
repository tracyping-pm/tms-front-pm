import { projectList } from '@/api/project';
import CustomStatusButton, { ThemeEnum } from '@/components/CustomStatusButton';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { ES_DTO_CLASS } from '@/constants';
import {
  CustomerSizeEnumText,
  FieldQueryHighlightTypeEnum,
  ProjectStatusEnum,
  ProjectStatusEnumText,
  ProjectStatusOptions,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  ActionType,
  ProColumns,
  ProForm,
  ProFormDateTimeRangePicker,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import dayjs from 'dayjs';
import { Key, useEffect, useRef, useState } from 'react';
import styles from '../index.less';

export default function ProjectModal({
  initParams,
  initKeys,
  initIds,
  hideModal,
  confirm,
}: {
  initParams: any;
  initKeys: Key[];
  initIds: Key[];
  hideModal: () => void;
  confirm: (k: Key[], p: any, c: Key[]) => void;
}) {
  const [originData, setOriginData] = useState<PaginationResponse>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [customerIds, setCustomerIds] = useState<Key[]>([]);

  const initState = useRef<boolean>(true);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const lastParams = useRef<any>({});

  useEffect(() => {
    if (initKeys.length) {
      setSelectedKeys(initKeys);
    }
    if (initIds.length) {
      setCustomerIds(initIds);
    }
    if (initParams) {
      formRef.current?.setFieldsValue(initParams);
    }
  }, []);

  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
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
  } = useFieldQuery({
    field: 'customerTag',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const getDataSource = async (params: any) => {
    const values = formRef.current?.getFieldsValue();
    values.pageNum = params.current;
    values.pageSize = params.pageSize;
    const currentParams = initState.current && initParams ? initParams : values;
    initState.current = false;
    const payload = {
      pageNum: currentParams.pageNum,
      pageSize: currentParams.pageSize,
      projectName: currentParams?.projectName?.name,
      customerName: currentParams?.customerName?.name,
      customerTag: currentParams?.customerTag?.name,
      projectStatus: currentParams?.projectStatus,
      creationTimeStart: currentParams.creationTime?.[0]
        ? dayjs(currentParams.creationTime?.[0]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      creationTimeEnd: currentParams.creationTime?.[1]
        ? dayjs(currentParams.creationTime?.[1]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
    };
    lastParams.current = currentParams;
    setLoading(true);
    const res = await projectList(payload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
      return {
        data: res.data?.list ?? [],
        success: true,
        total: res.data?.total,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
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
      hideInSearch: true,
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
      hideInSearch: true,
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
      hideInSearch: true,
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
      hideInSearch: true,
      valueType: 'select',
      render: (_, record) => {
        const status: ProjectStatusEnum = record.projectStatus;
        let theme = ThemeEnum.ORANGE;
        switch (status) {
          case ProjectStatusEnum.PREPARING:
            theme = ThemeEnum.BLUE;
            break;
          case ProjectStatusEnum.INPROGRESS:
            theme = ThemeEnum.BLUE;
            break;
          case ProjectStatusEnum.CANCELED:
            theme = ThemeEnum.GRAY;
            break;
          case ProjectStatusEnum.TERMINATED:
            theme = ThemeEnum.RED;
            break;
          case ProjectStatusEnum.COMPLETED:
            theme = ThemeEnum.GREEN;
            break;
          default:
            break;
        }
        return (
          <CustomTooltip title={status}>
            <CustomStatusButton theme={theme} noStyle>
              {ProjectStatusEnumText[status]}
            </CustomStatusButton>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      hideInSearch: true,
      valueType: 'dateTimeRange',
      valueEnum: CustomerSizeEnumText,
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
  ];

  // const toolBarRender = () => [
  //   <div key="tool" className={styles.project_tool}>
  //     {originData.total ? (
  //       <div className={styles.project_tool_title}>
  //         {originData.total} records in total
  //       </div>
  //     ) : null}
  //   </div>,
  // ];

  const FormRender = () => [
    <ProForm
      key="form"
      formRef={formRef}
      submitter={false}
      style={{ width: '100%' }}
    >
      <div className={styles.project_form}>
        <ProFormSelect
          name="projectName"
          allowClear
          placeholder="Project Name"
          valuePropName="name"
          fieldProps={{
            onSearch: projectNameSearch,
            options: projectNameOptions,
            style: { width: '184px' },
            ...projectNameDefaultFieldProps,
          }}
        />
        <ProFormSelect
          name="customerName"
          allowClear
          placeholder="Customer Name"
          valuePropName="name"
          fieldProps={{
            ...customerNameDefaultFieldProps,
            onSearch: customerNameSearch,
            options: customerNameOptions,
            style: { width: '184px' },
          }}
        />
        <ProFormSelect
          name="customerTag"
          allowClear
          placeholder="Customer Tag"
          valuePropName="name"
          fieldProps={{
            ...customerTagDefaultFieldProps,
            onSearch: customerTagSearch,
            options: customerTagOptions,
            style: { width: '184px' },
          }}
        />
        <ProFormSelect
          name="projectStatus"
          allowClear
          placeholder="Status"
          style={{ width: '184px' }}
          options={ProjectStatusOptions}
        />
        <ProFormDateTimeRangePicker
          name="creationTime"
          fieldProps={{
            style: { width: '350px' },
          }}
          placeholder={['Creation Time Start', 'Creation Time End']}
        />
        <Button
          type="primary"
          onClick={() => actionRef.current?.reloadAndRest?.()}
        >
          Search
        </Button>
        <Button
          onClick={() => {
            formRef.current?.setFieldsValue({
              projectName: undefined,
              customerName: undefined,
              customerTag: undefined,
              projectStatus: undefined,
              creationTime: undefined,
            });
            actionRef.current?.reloadAndRest?.();
          }}
        >
          Reset
        </Button>
      </div>
      <div className={styles.project_tips}>
        {customerIds.length} Customer and {selectedKeys.length} Projects
        selected
      </div>
    </ProForm>,
  ];

  return (
    <Modal
      open={true}
      closeIcon={false}
      okText="Confirm"
      width={1376}
      maskClosable={false}
      onCancel={hideModal}
      onOk={() => confirm(selectedKeys, lastParams.current, customerIds)}
    >
      <div className={styles.project}>
        {/*<FormRender />*/}
        <CustomTable
          columns={columns}
          scroll={{ x: 1200 }}
          actionRef={actionRef}
          search={false}
          // @ts-ignore
          request={async (params) => getDataSource(params)}
          pagination={{
            showSizeChanger: false,
            pageSize: 10,
            defaultCurrent: initParams ? initParams.pageNum : 1,
            total: originData.total,
            position: ['bottomLeft'],
          }}
          size="small"
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onSelect: (record: any, selected: boolean) => {
              const copyKeys = selectedKeys.slice();
              const copyIds = customerIds.slice();
              if (selected) {
                if (!copyKeys.includes(record.id)) {
                  setSelectedKeys([...copyKeys, record.id]);
                }
                if (!copyIds.includes(record.customerId)) {
                  setCustomerIds([...copyIds, record.customerId]);
                }
              } else {
                if (copyKeys.includes(record.id)) {
                  const findIndex = copyKeys.findIndex(
                    (item) => item === record.id,
                  );
                  copyKeys.splice(findIndex, 1);
                  setSelectedKeys(copyKeys);
                }
                if (copyIds.includes(record.customerId)) {
                  const findId = copyIds.findIndex(
                    (item) => item === record.customerId,
                  );
                  copyIds.splice(findId, 1);
                  setCustomerIds(copyIds);
                }
              }
            },
            onSelectAll: (
              selected: boolean,
              selectedRows: any,
              changeRows: any,
            ) => {
              const copyKeys = selectedKeys.slice();
              const copyIds = customerIds.slice();
              if (selected) {
                changeRows.forEach((item: any) => {
                  if (!copyKeys.includes(item.id)) {
                    copyKeys.push(item.id);
                  }
                  if (!copyIds.includes(item.customerId)) {
                    copyIds.push(item.customerId);
                  }
                });
                setSelectedKeys(copyKeys);
                setCustomerIds(copyIds);
              } else {
                changeRows.forEach((item: any) => {
                  if (copyKeys.includes(item.id)) {
                    const findIndex = copyKeys.findIndex(
                      (key) => key === item.id,
                    );
                    copyKeys.splice(findIndex, 1);
                  }
                  if (copyIds.includes(item.customerId)) {
                    const findId = copyIds.findIndex(
                      (key) => key === item.customerId,
                    );
                    copyIds.splice(findId, 1);
                  }
                });
                setSelectedKeys(copyKeys);
                setCustomerIds(copyIds);
              }
            },
          }}
          loading={loading}
          toolBarRender={FormRender}
          form={{
            syncToUrl: false,
            syncToInitialValues: false,
          }}
        />
      </div>
    </Modal>
  );
}
