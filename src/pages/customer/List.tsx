import {
  customerAdd,
  customerChange,
  customerDetail,
  customerIndustryList,
  customerList,
} from '@/api/customer';
import { ICustomerRecord } from '@/api/types/customer';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import {
  CustomerPriorityOptions,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  BUEnum,
  BUEnumText,
  CustomerPriorityEnum,
  CustomerSizeEnum,
  CustomerSizeEnumText,
  CustomerStatusEnum,
  CustomerStatusEnumColor,
  CustomerStatusEnumText,
  FieldQueryHighlightTypeEnum,
  TaxTypeEnum,
  TaxTypeEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { App, Badge, Button, Divider, Space } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { Key, useEffect, useRef, useState } from 'react';
import CustomerModal from './components/CustomerModal';
import TransferModal from './components/TransferModal';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  customerName?: string;
  customerTag?: string;
  industryIdList?: number[];
  status?: CustomerStatusEnum;
  customerTaxMark?: TaxTypeEnum;
  bu?: BUEnum;
  userId?: number;
  camUserId?: number;
  priority?: CustomerPriorityEnum;
  size?: CustomerSizeEnum;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  customerNameObj?: I_FUZZY_API_RESPONSE;
  customerTagObj?: I_FUZZY_API_RESPONSE;
  bdObj?: I_FUZZY_API_RESPONSE;
  camObj?: I_FUZZY_API_RESPONSE;
}

const CustomerList: React.FC = () => {
  const access = useAccess();
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ICustomerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [customerModalTitle, setCustomerModalTitle] = useState<string>('');
  const [customerEdit, setCustomerEdit] = useState<boolean>(false);
  const [activeRecord, setActiveRecord] = useState<ICustomerRecord>(
    {} as ICustomerRecord,
  );
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [customerIds, setCustomerIds] = useState<any[]>([]);
  const [bdUserRoleIds, setBdUserRoleIds] = useState<number[]>([]);
  const [camUserRoleIds, setCamUserRoleIds] = useState<number[]>([]);
  const [industryList, setIndustryList] = useState<any[]>([]);
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();

  const resetSelectedRowKeys = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
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
    const res = await customerList(BE_NEED);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.customerNameObj) {
      lodash.set(FE_NEED, 'customerNameObj', values.customerNameObj);
      lodash.set(BE_NEED, 'customerName', values.customerNameObj.name);
    }

    if (values.customerTagObj) {
      lodash.set(FE_NEED, 'customerTagObj', values.customerTagObj);
      lodash.set(BE_NEED, 'customerTag', values.customerTagObj.name);
    }

    if (values.bdObj) {
      lodash.set(FE_NEED, 'bdObj', values.bdObj);
      lodash.set(BE_NEED, 'userId', values.bdObj?.id);
    }

    if (values.camObj) {
      lodash.set(FE_NEED, 'camObj', values.camObj);
      lodash.set(BE_NEED, 'camUserId', values.camObj?.id);
    }

    if (values.industryIdList) {
      const secondIds: number[] = [];
      values.industryIdList?.forEach((item: number[]) => {
        if (item.length === 1) {
          industryList.forEach((subItem) => {
            if (item[0] === subItem.value) {
              subItem.children?.forEach((childItem: { value: number }) => {
                secondIds.push(childItem.value);
              });
            }
          });
        } else {
          secondIds.push(item[1]);
        }
      });
      lodash.set(FE_NEED, 'industryIdList', values.industryIdList);
      lodash.set(BE_NEED, 'industryIdList', secondIds);
    }

    if (values.priority) {
      lodash.set(FE_NEED, 'priority', values.priority);
      lodash.set(BE_NEED, 'priority', values.priority);
    }

    if (values.size) {
      lodash.set(FE_NEED, 'size', values.size);
      lodash.set(BE_NEED, 'size', values.size);
    }

    if (values.status) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'status', values.status);
    }

    if (values.customerTaxMark) {
      lodash.set(FE_NEED, 'customerTaxMark', values.customerTaxMark);
      lodash.set(BE_NEED, 'customerTaxMark', values.customerTaxMark);
    }

    if (values.bu) {
      lodash.set(FE_NEED, 'bu', values.bu);
      lodash.set(BE_NEED, 'buList', values.bu);
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
      industryIdList: FE_NEED.industryIdList,
      status: FE_NEED.status,
      customerTaxMark: FE_NEED.customerTaxMark,
      priority: FE_NEED.priority,
      size: FE_NEED.size,
      bu: FE_NEED.bu,
      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      customerNameObj: FE_NEED.customerNameObj
        ? FE_NEED.customerNameObj
        : undefined,
      customerTagObj: FE_NEED.customerTagObj
        ? FE_NEED.customerTagObj
        : undefined,
      bdObj: FE_NEED.bdObj ? FE_NEED.bdObj : undefined,
      camObj: FE_NEED.camObj ? FE_NEED.camObj : undefined,
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
  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;

    await getDataSource({ ...BE_NEED, ...params });
  };

  const handleAddFinish = async (values: any) => {
    setLoading(true);
    const res = await customerAdd(values);
    setLoading(false);

    if (res.code === 200) {
      setCustomerModalOpen(false);
      message.success('Add customer successfully!');
      doFirstQuery();
    }
  };

  const handleEditFinish = async (values: any) => {
    setLoading(true);
    const res = await customerChange(values);
    setLoading(false);
    if (res.code === 200) {
      setCustomerModalOpen(false);
      message.success('Update customer successfully!');
      doFirstQuery();
    }
  };

  const handleEdit = async (record: ICustomerRecord) => {
    setLoading(true);
    const payload = {
      id: record.id,
    };
    const res = await customerDetail(payload);
    setLoading(false);
    if (res.code === 200) {
      setActiveRecord(res.data);
      setCustomerModalTitle('Edit Customer');
      setCustomerEdit(true);
      setCustomerModalOpen(true);
    }
  };

  const onConfirm = async (values: any, isEdit: boolean) => {
    if (isEdit) {
      handleEditFinish(values);
    } else {
      handleAddFinish(values);
    }
  };

  const handleCreateCustomer = () => {
    setActiveRecord({} as ICustomerRecord);
    setCustomerModalTitle('Create Customer');
    setCustomerEdit(false);
    setCustomerModalOpen(true);
  };

  const handleBatchTransfer = () => {
    const ids = selectedRows.map((item) => item.id);
    const newBdUserRoleIds = selectedRows.map((item) => item.bdUserRoleId);
    const newCamUserRoleIds = selectedRows.map((item) => item.camUserRoleId);

    setCustomerIds(ids);
    setBdUserRoleIds(newBdUserRoleIds);
    setCamUserRoleIds(newCamUserRoleIds);
    setTransferModalOpen(true);
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
    // 自动触发 onSubmit
  };

  const columns: ProColumns[] = [
    {
      title: 'Customer Name',
      dataIndex: 'customerNameObj',
      valueType: 'select',
      width: 260,
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
            fieldProps={{ placeholder: 'Customer Name' }}
            request={{
              field: 'customerName',
              esDtoClass: ES_DTO_CLASS.CUSTOMER,
              type: FieldQueryHighlightTypeEnum.USER_ROLE,
            }}
          />
        );
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
      dataIndex: 'customerTagObj',
      valueType: 'select',
      width: 260,
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
            fieldProps={{ placeholder: 'Customer Tag' }}
            request={{
              field: 'customerTag',
              esDtoClass: ES_DTO_CLASS.CUSTOMER,
              type: FieldQueryHighlightTypeEnum.USER_ROLE,
            }}
          />
        );
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
      title: 'Industry',
      dataIndex: 'industryIdList',
      width: 200,
      ellipsis: { showTitle: false },
      valueType: 'cascader',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        multiple: true,
        placeholder: 'Industry',
        showSearch: true,
        changeOnSelect: true,
      },
      request: async () => {
        const res = await customerIndustryList();
        if (res.code === 200) {
          setIndustryList(res.data);
          return res.data;
        } else {
          return [];
        }
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.industryName}>
            {record.industryName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: CustomerStatusEnumText,
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
        const status: CustomerStatusEnum = record.status;
        const Content = (
          <Badge color={CustomerStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 100,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Priority',
        options: CustomerPriorityOptions,
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      valueType: 'select',
      valueEnum: CustomerSizeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Size',
      },
      render: (_, record) => {
        return <CustomTooltip title={record.size}>{record.size}</CustomTooltip>;
      },
    },
    {
      title: 'BU',
      dataIndex: 'bu',
      ellipsis: { showTitle: false },
      valueType: 'select',
      width: 240,
      valueEnum: BUEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'BU',
      },
      render: (_, record) => (
        <CustomTooltip title={record.bu}>{record.bu}</CustomTooltip>
      ),
    },
    {
      title: 'BD',
      dataIndex: 'bdObj',
      valueType: 'select',
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
            fieldProps={{ placeholder: 'BD' }}
            customProps={{
              isUAM: true,
            }}
            request={{
              field: 'aliasName',
              esDtoClass: ES_DTO_CLASS.USER,
              type: FieldQueryHighlightTypeEnum.USER_ROLE,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.bdUserAliasName}>
            {record.bdUserAliasName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'CAM',
      dataIndex: 'camObj',
      valueType: 'select',
      width: 200,
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
            fieldProps={{ placeholder: 'CAM' }}
            customProps={{
              isUAM: true,
            }}
            request={{
              field: 'aliasName',
              esDtoClass: ES_DTO_CLASS.USER,
              type: FieldQueryHighlightTypeEnum.USER_ROLE,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.camUserAliasName}>
            {record.camUserAliasName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Tax Mark',
      dataIndex: 'customerTaxMark',
      ellipsis: { showTitle: false },
      valueType: 'select',
      width: 120,
      valueEnum: TaxTypeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Tax Mark',
      },
      render: (_, record) => (
        <CustomTooltip title={record.customerTaxMark}>
          {record.customerTaxMark}
        </CustomTooltip>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.region}>{record.region}</CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 180,
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
        const formatDate = dayjs(record.createdAt).format(
          'YYYY-MM-DD HH:mm:ss',
        );
        return <CustomTooltip title={formatDate}>{formatDate}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      align: 'left',
      width: 170,
      hideInTable:
        !access[PermissionEnum.CUSTOMER_DETAIL] &&
        !access[PermissionEnum.CUSTOMER_LIST_EDIT],
      render: (_, record) => {
        return (
          <Space split={<Divider type="vertical" />} size="small">
            <Access accessible={access[PermissionEnum.CUSTOMER_DETAIL]}>
              <Button
                icon={<BarsOutlined />}
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  saveScrollTop();
                  history.push(`${PATHS.CUSTOMER_DETAIL_BASE}/${record.id}`);
                }}
              >
                Details
              </Button>
            </Access>
            <Access accessible={access[PermissionEnum.CUSTOMER_LIST_EDIT]}>
              <Button
                icon={<EditOutlined />}
                color="primary"
                style={{ padding: 0 }}
                variant="link"
                onClick={() => {
                  handleEdit(record);
                }}
              >
                Edit
              </Button>
            </Access>
          </Space>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create"
      accessible={access[PermissionEnum.CUSTOMER_LIST_CREATE]}
    >
      <Button type="primary" onClick={() => handleCreateCustomer()}>
        Create Customer
      </Button>
    </Access>,
    <Access
      key="transfer"
      accessible={access[PermissionEnum.CUSTOMER_LIST_TRANSFER]}
    >
      <Button
        disabled={selectedRowKeys.length === 0}
        onClick={() => handleBatchTransfer()}
      >
        Transfer Customers
      </Button>
    </Access>,
  ];

  useEffect(() => {
    doFirstQuery();
  }, []);

  return (
    <>
      {/* <div>urlState: {urlState?.extra}</div> */}
      <CustomTable
        columns={columns}
        scroll={{ x: 2500 }}
        formRef={formRef}
        dataSource={originData.list}
        form={{
          name: 'customer-list',
        }}
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
        rowSelection={
          !access[PermissionEnum.CUSTOMER_LIST_TRANSFER]
            ? false
            : {
                selectedRowKeys,
                onChange: (keys: Key[], selectedRowsVal: ICustomerRecord[]) => {
                  setSelectedRowKeys(keys);
                  setSelectedRows(selectedRowsVal);
                },
              }
        }
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {customerModalOpen && (
        <CustomerModal
          title={customerModalTitle}
          record={activeRecord}
          isEdit={customerEdit}
          open={customerModalOpen}
          onConfirm={onConfirm}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setCustomerModalOpen(false);
              setActiveRecord({} as ICustomerRecord);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: loading,
            },
          }}
        />
      )}

      <TransferModal
        open={transferModalOpen}
        customerIds={customerIds}
        bdUserRoleIds={bdUserRoleIds}
        camUserRoleIds={camUserRoleIds}
        onCancel={() => setTransferModalOpen(false)}
        onConfirm={() => {
          setTransferModalOpen(false);
          doFirstQuery();
          resetSelectedRowKeys();
        }}
      />
    </>
  );
};

export default CustomerList;
