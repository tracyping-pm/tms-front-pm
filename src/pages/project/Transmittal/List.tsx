import { transmittalCancel, transmittalList } from '@/api/transmittal';
import {
  ITransmittalListItem,
  ITransmittalListParams,
} from '@/api/types/transmittal';
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
  FieldQueryHighlightTypeEnum,
  TransmittalStatusEnum,
  TransmittalStatusEnumText,
  TransmittalStatusEnumTextColor,
  TransmittalTypeEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import useUrlState from '@ahooksjs/use-url-state';
import {
  BarsOutlined,
  CloseCircleOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { App, Badge, Button, Divider, message } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';

interface IFE_NEED extends ITransmittalListParams {
  scrollTop?: number;
}

const TransmittalList: React.FC = () => {
  const access = useAccess();
  const { modal } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);

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
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
    value: vendorNameValue,
    setValue: setVendorNameValue,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: transmittalNumberOptions,
    onSearch: transmittalNumberSearch,
    defaultFieldProps: transmittalNumberDefaultFieldProps,
    value: transmittalNumberValue,
    setValue: setTransmittalNumberValue,
  } = useFieldQuery({
    field: 'transmittalNumber',
    esDtoClass: ES_DTO_CLASS.TRANSMITTAL,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
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

  const getDataSource = async (BE_NEED: ITransmittalListParams) => {
    setLoading(true);
    const res = await transmittalList(BE_NEED).finally(() => {
      setLoading(false);
    });
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: ITransmittalListParams = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.transmittalNumber) {
      lodash.set(FE_NEED, 'transmittalNumber', values.transmittalNumber?.name);
      lodash.set(FE_NEED, 'transmittalId', values.transmittalNumber?.id);
      lodash.set(BE_NEED, 'transmittalId', values.transmittalNumber?.id);
    }

    if (values.transmittalType) {
      lodash.set(FE_NEED, 'transmittalType', values.transmittalType);
      lodash.set(BE_NEED, 'transmittalType', values.transmittalType);
    }

    if (values.customerName) {
      lodash.set(FE_NEED, 'customerName', values.customerName?.name);
      lodash.set(FE_NEED, 'customerId', values.customerName?.id);
      lodash.set(BE_NEED, 'customerId', values.customerName?.id);
    }

    if (values.vendorName) {
      lodash.set(FE_NEED, 'vendorName', values.vendorName?.name);
      lodash.set(FE_NEED, 'vendorId', values.vendorName?.id);
      lodash.set(BE_NEED, 'vendorId', values.vendorName?.id);
    }

    if (values.status?.length) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'statusList', values.status);
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;

      lodash.set(FE_NEED, 'createTimeStart', startTime);
      lodash.set(FE_NEED, 'createTimeEnd', endTime);
      lodash.set(BE_NEED, 'createTimeStart', startTime);
      lodash.set(BE_NEED, 'createTimeEnd', endTime);
    }

    const urlParams = {
      FE_NEED,
      BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });
    getDataSource(BE_NEED);
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      transmittalType: FE_NEED.transmittalType,
      status: FE_NEED.status,
      createdAt: [
        FE_NEED.createTimeStart ? dayjs(FE_NEED.createTimeStart) : undefined,
        FE_NEED.createTimeEnd ? dayjs(FE_NEED.createTimeEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      transmittalNumber: FE_NEED.transmittalId
        ? { id: FE_NEED.transmittalId, name: FE_NEED.transmittalNumber }
        : undefined,
      customerName: FE_NEED.customerId
        ? { id: FE_NEED.customerId, name: FE_NEED.customerName }
        : undefined,
      vendorName: FE_NEED.vendorId
        ? { id: FE_NEED.vendorId, name: FE_NEED.vendorName }
        : undefined,
    });

    setTransmittalNumberValue(FE_NEED.transmittalNumber);
    setCustomerNameValue(FE_NEED.customerName);
    setVendorNameValue(FE_NEED.vendorName);
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
    setTransmittalNumberValue(undefined);
    setCustomerNameValue(undefined);
    setVendorNameValue(undefined);
  };

  const handleCancel = (record: ITransmittalListItem) => {
    modal.confirm({
      title: 'Cancel Transmittal',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to cancel transmittal?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await transmittalCancel({ id: record.transmittalId });
        if (res.code === 200) {
          message.success('Cancel transmittal successfully!');
          doFirstQuery();
        }
      },
      onCancel() {},
    });
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
      title: 'Transmittal Number',
      dataIndex: 'transmittalNumber',
      valueType: 'select',
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
        ...transmittalNumberDefaultFieldProps,
        placeholder: 'Transmittal Number',
        options: transmittalNumberOptions,
        onSearch: transmittalNumberSearch,
        value: transmittalNumberValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.transmittalNumber}>
            {record.transmittalNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Transmittal Type',
      dataIndex: 'transmittalType',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: TransmittalTypeEnumText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'All Type',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      width: 150,
      render: (_, record) => (
        <CustomTooltip title={record.status}>
          {record.transmittalType}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      valueType: 'select',
      width: 260,
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
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      valueType: 'select',
      width: 240,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...vendorNameDefaultFieldProps,
        placeholder: 'Vendor Name',
        options: vendorNameOptions,
        onSearch: vendorNameSearch,
        value: vendorNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`vendorName${record.id}`}
            title={record.vendorName}
          >
            {record.vendorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: TransmittalStatusEnumText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'All Status',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        mode: 'multiple',
      },
      render: (_, record) => {
        const status: TransmittalStatusEnum = record.status;
        const Content = (
          <Badge color={TransmittalStatusEnumTextColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Statistical Interval',
      dataIndex: 'statisticalInterval',
      valueType: 'dateRange',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Creation Time Start', 'Creation Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const content =
          record.statisticalIntervalStart && record.statisticalIntervalEnd
            ? record.statisticalIntervalStart +
              ' - ' +
              record.statisticalIntervalEnd
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Creation Time Start', 'Creation Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const content = record.createdAt
          ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')
          : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      // align: 'center',
      hideInTable: !access[PermissionEnum.TRANSMITTAL_DETAIL],
      width: 180,
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxSizing: 'border-box',
            }}
          >
            <Button
              icon={<BarsOutlined />}
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                saveScrollTop();
                history.push(
                  `${PATHS.TRANSMITTAL_LIST_DETAIL}/${record.transmittalId}`,
                );
              }}
            >
              Details
            </Button>
            {record.status === TransmittalStatusEnum.AWAITING_CONFIRMED ? (
              <Divider type="vertical" />
            ) : null}
            <Access
              key="cancel"
              accessible={
                record.status === TransmittalStatusEnum.AWAITING_CONFIRMED
              }
            >
              <Button
                icon={<CloseCircleOutlined />}
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  handleCancel(record);
                }}
              >
                Cancel
              </Button>
            </Access>
          </div>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access key="create" accessible={access[PermissionEnum.TRANSMITTAL_CREATE]}>
      <Button
        type="primary"
        onClick={() => {
          history.push(`${PATHS.TRANSMITTAL_CREATE}`);
        }}
      >
        Add Transmittal
      </Button>
    </Access>,
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <>
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
    </>
  );
};

export default TransmittalList;
