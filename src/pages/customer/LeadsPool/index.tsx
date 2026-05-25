import { customerIndustryList } from '@/api/customer';
import { leadDetail, leadFunnelPerson, leadList } from '@/api/lead';
import { ILeadFunnelPerson, ILeadListItem } from '@/api/types/lead';
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
  FieldQueryHighlightTypeEnum,
  LeadStatusEnum,
  LeadStatusEnumText,
  LeadStatusEnumTextColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { Badge, Button, Divider, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { Key, useEffect, useRef, useState } from 'react';
import CreateLeadModal from './components/CreateLeadModal';
import TransferLeadModal from './components/TransferLeadModal';
import styles from './styles.less';
interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  customerName?: string;
  customerTag?: string;
  industryName?: string;
  industrySecondIdList?: number[];
  leadStatus?: LeadStatusEnum;
  bu?: BUEnum;
  userId?: number;
  priority?: CustomerPriorityEnum;
  size?: CustomerSizeEnum;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  picUserAliasName?: string[];
}
interface IFE_NEED extends IBE_NEED {
  picUserRoleIdList?: number[];
  scrollTop?: number;
  customerNameObj?: I_FUZZY_API_RESPONSE;
  customerTagObj?: I_FUZZY_API_RESPONSE;
}

const LeadsPoolList: React.FC = () => {
  const access = useAccess();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ILeadListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [createLeadModalOpen, setCreateLeadModalOpen] =
    useState<boolean>(false);
  const [leadDetailData, setLeadDetailData] = useState<any>({});
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [leadIds, setLeadIds] = useState<any[]>([]);
  const [bdUserRoleIds, setBdUserRoleIds] = useState<number[]>([]);
  const [bdPicOptions, setBdPicOptions] = useState<DefaultOptionType[]>([]);
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
    const res = await leadList(BE_NEED);
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

    if (values.customerNameObj) {
      lodash.set(FE_NEED, 'customerNameObj', values.customerNameObj);
      lodash.set(BE_NEED, 'customerName', values.customerNameObj.name);
    }

    if (values.customerTagObj) {
      lodash.set(FE_NEED, 'customerTagObj', values.customerTagObj);
      lodash.set(BE_NEED, 'customerTag', values.customerTagObj.name);
    }

    if (values.picUserAliasName) {
      lodash.set(FE_NEED, 'picUserAliasName', values.picUserAliasName);
      lodash.set(BE_NEED, 'picUserRoleIdList', values.picUserAliasName);
    }

    if (values.industryName) {
      const secondIds: number[] = [];
      values.industryName?.forEach((item: number[]) => {
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
      lodash.set(FE_NEED, 'industryName', values.industryName);
      lodash.set(BE_NEED, 'industrySecondIdList', secondIds);
    }

    if (values.priority) {
      lodash.set(FE_NEED, 'priority', values.priority);
      lodash.set(BE_NEED, 'priorityList', values.priority);
    }

    if (values.leadStatus) {
      lodash.set(FE_NEED, 'leadStatus', values.leadStatus);
      lodash.set(BE_NEED, 'leadStatusList', values.leadStatus);
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
      industryName: FE_NEED.industryName,
      leadStatus: FE_NEED.leadStatus,
      bu: FE_NEED.bu,
      priority: FE_NEED.priority,
      picUserAliasName: FE_NEED.picUserAliasName,
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

  const handleEdit = async (id: number) => {
    setLoading(true);
    const res = await leadDetail({
      id,
    });
    setLoading(false);
    if (res.code === 200) {
      setLeadDetailData({
        ...res.data,
        industryIdList: [res.data?.industryFirstId, res.data?.industrySecondId],
      });
      setCreateLeadModalOpen(true);
    }
  };

  const confirmCreateLead = async () => {
    setCreateLeadModalOpen(false);
    reload();
  };

  const handleCreateLead = () => {
    setLeadDetailData({});
    setCreateLeadModalOpen(true);
  };

  const handleTransferLead = () => {
    const ids = selectedRows.map((item) => item.id);
    const newBdUserRoleIds = selectedRows.map((item) => item.picUserRoleId);
    setLeadIds(ids);
    setBdUserRoleIds(newBdUserRoleIds);
    setTransferModalOpen(true);
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
  };

  const getOptionsHandle = async () => {
    const res = await leadFunnelPerson();
    if (res.code === 200) {
      const list =
        res?.data?.map((_item: ILeadFunnelPerson) => {
          return {
            ..._item,
            label: _item.aliasName,
            value: _item.userRoleId,
          };
        }) ?? [];

      setBdPicOptions(list);
    }
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
            fieldProps={{
              placeholder: 'Customer Name',
            }}
            request={{
              field: 'customerName',
              esDtoClass: ES_DTO_CLASS.LEAD,
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
            fieldProps={{
              placeholder: 'Customer Tag',
            }}
            request={{
              field: 'customerTag',
              esDtoClass: ES_DTO_CLASS.LEAD,
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
      dataIndex: 'industryName',
      width: 300,
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
      dataIndex: 'leadStatus',
      ellipsis: { showTitle: false },
      width: 160,
      valueType: 'select',
      valueEnum: LeadStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: { mode: 'multiple', placeholder: 'Status' },
      render: (_, record) => {
        const leadStatus: LeadStatusEnum = record.leadStatus;
        const Content = (
          <Badge
            color={LeadStatusEnumTextColor[leadStatus]}
            text={leadStatus}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
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
      title: 'BD/CAM PIC',
      dataIndex: 'picUserAliasName',
      ellipsis: { showTitle: false },
      width: 120,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'BD/CAM PIC',
        mode: 'multiple',
        showSearch: true,
        options: bdPicOptions,
        maxTagCount: 2,
        optionRender: (option: DefaultOptionType) => {
          return (
            <div className={styles.bdSelectOption}>
              <div className={styles.bdSelectOptionLabel}>
                {option.data.label}
              </div>
              <div className={styles.bdSelectOptionRoleName}>
                {option.data?.roleName}
              </div>
            </div>
          );
        },
        filterOption: (input: string, option: DefaultOptionType) => {
          return ((option as { label: string; value: string })?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
      render: (_, record) => {
        let content;
        if (record.picType && record.picUserAliasName) {
          content = record.picType + '：' + record.picUserAliasName || '-';
        } else if (record.picUserAliasName) {
          content = record.picUserAliasName || '-';
        }
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      valueType: 'select',
      width: 100,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'Priority',
        options: CustomerPriorityOptions,
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
      width: 160,
      hideInTable:
        !access[PermissionEnum.LEAD_DETAIL] &&
        !access[PermissionEnum.LEAD_POOL_EDIT],
      render: (_, record) => {
        return (
          <Space split={<Divider type="vertical" />} size="small">
            <Access accessible={access[PermissionEnum.LEAD_DETAIL]}>
              <Button
                icon={<BarsOutlined />}
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  saveScrollTop();
                  history.push(
                    `${PATHS.CUSTOMER_LEAD_POOL_DETAIL}/${record.id}`,
                  );
                }}
              >
                Details
              </Button>
            </Access>
            <Access
              accessible={
                access[PermissionEnum.LEAD_POOL_EDIT] &&
                record.leadStatus !== LeadStatusEnum.SUCCESSFUL_CLOSED
              }
            >
              <Button
                icon={<EditOutlined />}
                color="primary"
                style={{ padding: 0 }}
                variant="link"
                onClick={() => {
                  handleEdit(record.id);
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
    <Access key="create" accessible={access[PermissionEnum.LEAD_POOL_CREATE]}>
      <Button type="primary" onClick={() => handleCreateLead()}>
        Create Lead
      </Button>
    </Access>,
    <Access
      key="transfer"
      accessible={access[PermissionEnum.LEAD_POOL_TRANSFER]}
    >
      <Button
        disabled={selectedRowKeys.length === 0}
        onClick={() => handleTransferLead()}
      >
        Transfer Leads
      </Button>
    </Access>,
  ];

  useEffect(() => {
    doFirstQuery();
    getOptionsHandle();
  }, []);

  return (
    <>
      <CustomTable
        columns={columns}
        scroll={{ x: 1900 }}
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
            // onSubmit({ pageNum: page, pageSize: pageSize });
            onPaginationChange({ pageNum: page, pageSize: pageSize });
            resetSelectedRowKeys();
          },
        }}
        loading={loading}
        rowSelection={
          !access[PermissionEnum.LEAD_POOL_TRANSFER]
            ? false
            : {
                getCheckboxProps: (record: { leadStatus: LeadStatusEnum }) => ({
                  disabled:
                    record.leadStatus === LeadStatusEnum.SUCCESSFUL_CLOSED,
                }),
                selectedRowKeys,
                onChange: (keys: Key[], selectedRowsVal: ILeadListItem[]) => {
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

      {createLeadModalOpen && (
        <CreateLeadModal
          title={leadDetailData?.id ? 'Edit Lead' : 'Create Lead'}
          open={createLeadModalOpen}
          record={leadDetailData}
          onConfirm={confirmCreateLead}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => setCreateLeadModalOpen(false),
          }}
        />
      )}

      <TransferLeadModal
        open={transferModalOpen}
        leadIds={leadIds}
        bdUserRoleIds={bdUserRoleIds}
        onCancel={() => setTransferModalOpen(false)}
        onConfirm={() => {
          setTransferModalOpen(false);
          reload();
          resetSelectedRowKeys();
        }}
      />
    </>
  );
};

export default LeadsPoolList;
