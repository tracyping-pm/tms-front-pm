import {
  accountActivated,
  accountCustomerAdd,
  accountCustomerList,
  accountDelete,
  accountPasswordReset,
  accountSuspended,
} from '@/api/account';
import { IAccountRecord, IResetPasswordRes } from '@/api/types/account';
import CustomConfirmModal from '@/components/CustomConfirmModal';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
} from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  AccountStatusEnum,
  AccountStatusEnumColor,
  AccountStatusEnumText,
  FieldQueryHighlightTypeEnum,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import useUrlState from '@ahooksjs/use-url-state';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  FormOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { App, Badge, Button, Divider, Space } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import AccountCreateSuccessModal from '../components/AccountCreateSuccessModal';
import AccountCreateModal from './components/AccountCreateModal';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  customerId?: number;
  status?: AccountStatusEnum;
}
interface IFE_NEED extends IBE_NEED {
  customerName?: string;
  customerTag?: string;
  email?: string;
}

const AccountList: React.FC = () => {
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [successRecord, setSuccessRecord] = useState<IResetPasswordRes>(
    {} as IResetPasswordRes,
  );
  const [accountCreateModalOpen, setAccountCreateModalOpen] =
    useState<boolean>(false);
  const [accountCreateSuccessModalTitle, setAccountCreateSuccessModalTitle] =
    useState<string>('');
  const [accountCreateSuccessModalOpen, setAccountCreateSuccessModalOpen] =
    useState<boolean>(false);
  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

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
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
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
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const {
    options: emailOptions,
    onSearch: emailSearch,
    defaultFieldProps: emailDefaultFieldProps,
    value: emailValue,
    setValue: setEmailValue,
  } = useFieldQuery({
    field: 'portalEmail',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await accountCustomerList(BE_NEED);
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

    if (values.customerName) {
      lodash.set(FE_NEED, 'customerName', values.customerName?.name);
      lodash.set(FE_NEED, 'customerId', values.customerName?.id);
      lodash.set(BE_NEED, 'customerId', values.customerName?.id);
    }

    if (values.customerTag) {
      lodash.set(FE_NEED, 'customerTag', values.customerTag?.name);
      lodash.set(FE_NEED, 'customerId', values.customerTag?.id);
      lodash.set(BE_NEED, 'customerId', values.customerTag?.id);
    }

    if (values.email) {
      lodash.set(FE_NEED, 'email', values.email?.name);
      lodash.set(FE_NEED, 'customerId', values.email?.id);
      lodash.set(BE_NEED, 'customerId', values.email?.id);
    }

    if (values.status) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'status', values.status);
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
      status: FE_NEED.status,
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      customerName: FE_NEED.customerName
        ? { value: FE_NEED.customerName, id: FE_NEED.customerId }
        : undefined,
      customerTag: FE_NEED.customerTag
        ? { value: FE_NEED.customerTag, id: FE_NEED.customerId }
        : undefined,
      email: FE_NEED.email
        ? { value: FE_NEED.email, id: FE_NEED.customerId }
        : undefined,
    });

    setCustomerNameValue(FE_NEED.customerName);
    setCustomerTagValue(FE_NEED.customerTag);
    setEmailValue(FE_NEED.email);
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
    } else {
      await getDataSource({ pageNum: 1, pageSize: 20 });
    }
  };

  const handleAddFinish = async (values: any) => {
    const { email, customerId } = values;
    const params = {
      email,
      customerId,
    };
    setLoading(true);
    const res = await accountCustomerAdd(params);
    setLoading(false);
    if (res.code === 200) {
      setSuccessRecord(res.data);
      setAccountCreateModalOpen(false);
      setAccountCreateSuccessModalTitle('Successfully Created!');
      setAccountCreateSuccessModalOpen(true);
      reload();
    }
  };

  const handleCopyOk = () => {
    setAccountCreateSuccessModalOpen(false);
    message.success('Copied!');
    reload();
  };

  const handleResetPassword = async (record: IAccountRecord) => {
    const res = await accountPasswordReset({ id: record.id });
    if (res.code === 200) {
      setSuccessRecord(res.data);
      setAccountCreateSuccessModalTitle('Successfully Reset!');
      setAccountCreateSuccessModalOpen(true);
    }
  };

  const handleDelete = async (record: IAccountRecord) => {
    const res = await accountDelete({ ids: [record.id] });
    if (res.code === 200) {
      reload();
      message.success('Successfully Deleted!');
    }
  };

  const handleStatusOperate = async (
    record: IAccountRecord,
    statusText: string,
  ) => {
    const method =
      record.status === AccountStatusEnum.ACTIVATED
        ? accountSuspended
        : accountActivated;
    const res = await method({ ids: [record.id] });
    if (res.code === 200) {
      reload();
      message.success(`Successfully ${statusText}!`);
    }
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
    setCustomerNameValue(undefined);
    setCustomerTagValue(undefined);
    setEmailValue(undefined);
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
      title: 'Customer Name',
      dataIndex: 'customerName',
      valueType: 'select',

      ellipsis: { showTitle: false },
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
          <CustomTooltip key={`customerName${record.id}`} title={record.name}>
            {record.name}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Tag',
      dataIndex: 'customerTag',
      valueType: 'select',

      ellipsis: { showTitle: false },
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
          <CustomTooltip
            key={`customerTag${record.id}`}
            title={record.aliasName}
          >
            {record.aliasName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...emailDefaultFieldProps,
        placeholder: 'Email',
        options: emailOptions,
        onSearch: emailSearch,
        value: emailValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.email}>{record.email}</CustomTooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      valueType: 'select',
      valueEnum: AccountStatusEnumText,
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
        const status: AccountStatusEnum = record.status;
        const Content = (
          <Badge color={AccountStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 170,
      ellipsis: { showTitle: false },
      hideInSearch: true,
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
      width: 310,
      className: 'overrided-pro-table-option-cell',
      render: (_, record) => {
        let statusText = '';
        let showStatusOperate = true;
        if (record.status === AccountStatusEnum.INACTIVE) {
          showStatusOperate = false;
        } else {
          statusText =
            record.status === AccountStatusEnum.ACTIVATED
              ? 'Suspend'
              : 'Reactivate';
        }
        let resetPasswordStatus = record.status === AccountStatusEnum.SUSPENDED;

        return (
          <>
            <Space
              split={<Divider style={{ margin: 0 }} type="vertical" />}
              size={0}
            >
              <CustomConfirmModal
                key="reset-password"
                title="Operation Confirm"
                content="Confirm reset password"
                onOk={() => handleResetPassword(record)}
              >
                <CustomTooltip title="Reset password" placement="top">
                  <Button
                    icon={<FormOutlined />}
                    type="link"
                    className="ellipsis"
                    disabled={resetPasswordStatus}
                  >
                    <div style={{ width: 45 }} className="ellipsis">
                      Reset password
                    </div>
                  </Button>
                </CustomTooltip>
              </CustomConfirmModal>
              <CustomConfirmModal
                key="delete"
                title="Operation Confirm"
                content="Confirm to delete the account"
                onOk={() => handleDelete(record)}
              >
                <Button icon={<DeleteOutlined />} type="link">
                  Delete
                </Button>
              </CustomConfirmModal>
              {showStatusOperate ? (
                <CustomConfirmModal
                  key="status-operate"
                  title="Operation Confirm"
                  content={`Confirm to ${statusText.toLocaleLowerCase()} the account`}
                  onOk={() => handleStatusOperate(record, statusText)}
                >
                  <CustomTooltip title={statusText} placement="top">
                    <Button
                      icon={
                        statusText === 'Reactivate' ? (
                          <CheckCircleOutlined />
                        ) : (
                          <StopOutlined />
                        )
                      }
                      type="link"
                    >
                      <div style={{ width: 45 }} className="ellipsis">
                        {statusText}
                      </div>
                    </Button>
                  </CustomTooltip>
                </CustomConfirmModal>
              ) : null}
            </Space>
          </>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Button
      key="create"
      type="primary"
      onClick={() => setAccountCreateModalOpen(true)}
    >
      Create Account
    </Button>,
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <>
      <CustomTable
        columns={columns}
        formRef={formRef}
        scroll={{ x: 1500 }}
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
        rowSelection={false}
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      <AccountCreateModal
        title="Create Account"
        open={accountCreateModalOpen}
        // @ts-ignore
        onFinish={handleAddFinish}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => setAccountCreateModalOpen(false),
        }}
        submitter={{
          submitButtonProps: {
            loading: loading,
          },
        }}
      />
      <AccountCreateSuccessModal
        title={accountCreateSuccessModalTitle}
        open={accountCreateSuccessModalOpen}
        record={successRecord}
        // @ts-ignore
        onCopyOk={handleCopyOk}
        modalProps={{
          onCancel: () => setAccountCreateSuccessModalOpen(false),
        }}
      />
    </>
  );
};

export default AccountList;
