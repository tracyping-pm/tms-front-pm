import { addTransmittalWaybillList } from '@/api/transmittal';
import { getTruckTypeList } from '@/api/truck';
import { ICommonListItem, IFieldQueryHighlightRes } from '@/api/types/common';
import {
  IAddTransmittalWaybillListItem,
  IAddTransmittalWaybillListParams,
  IWaybillPodNumberListItem,
} from '@/api/types/transmittal';
import { ITruckTypeListItem } from '@/api/types/truck';
import { ICustomerCodeListItem } from '@/api/types/waybill';
import {
  waybillCustomerCodeList,
  waybillCustomerCodeTypeList,
  waybillCustomerCodeUpdate,
} from '@/api/waybill';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { IconDetail, IconEdit } from '@/components/OperationIcon';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import { FieldQueryHighlightTypeEnum, TransmittalTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useMultipleFieldQuery } from '@/hooks/useMultipleFieldQuery';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { Empty, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import CustomerCodeModal from './components/CustomerCodeModal';
import TransmittalCreateHeader from './components/TransmittalCreateHeader';

interface IListSearchCondition {
  projectNameList?: string[];
  projectIdList?: number[];
  customerNameList?: string[];
  customerIdList?: number[];
  vendorNameList?: string[];
  vendorIdList?: number[];
  plateNumberNameList?: string[];
  plateNumberIdList?: number[];
  driverNameList?: string[];
  driverIdList?: number[];
  waybillNameList?: string[];
  waybillIdList?: number[];
  truckType?: number[];
}

interface IQueryState extends IListSearchCondition {
  pageNum?: number;
  pageSize?: number;
  podNumber?: string;
  unloadTimeStart?: string;
  unloadTimeEnd?: string;
  deliverTimeStart?: string;
  deliverTimeEnd?: string;
}

enum buildTypeEnum {
  PROJECT = 'project',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  PLATE = 'plate',
  DRIVER = 'driver',
  WAYBILL = 'waybill',
}

const initialQueryState: IQueryState = {
  pageNum: 1,
  pageSize: 20,
  projectNameList: [],
  projectIdList: [],
  customerNameList: [],
  customerIdList: [],
  vendorNameList: [],
  vendorIdList: [],
  plateNumberNameList: [],
  plateNumberIdList: [],
  driverNameList: [],
  driverIdList: [],
  waybillNameList: [],
  waybillIdList: [],
  truckType: [],
  podNumber: undefined,
  unloadTimeStart: undefined,
  unloadTimeEnd: undefined,
  deliverTimeStart: undefined,
  deliverTimeEnd: undefined,
};

export interface IHeaderFormData {
  isCustomer: boolean;
  transmittalType: TransmittalTypeEnum;
  customerId?: number;
  vendorId?: number;
}

const TransmittalCreate: React.FC = () => {
  const access = useAccess();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<number[]>([]);
  const [currentRecord, setCurrentRecord] =
    useState<IAddTransmittalWaybillListItem>(
      {} as IAddTransmittalWaybillListItem,
    );
  const [headerFormData, setHeaderFormData] = useState<IHeaderFormData>({
    isCustomer: true,
    transmittalType: TransmittalTypeEnum.CUSTOMER,
    customerId: undefined,
    vendorId: undefined,
  });

  const [options, setOptions] = useState<ICommonListItem[]>([]);
  const [editCustomerCodeModal, setEditCustomerCodeModal] =
    useState<boolean>(false);
  const [customerCodeList, setCustomerCodeList] = useState<
    ICustomerCodeListItem[]
  >([]);
  const [customerCodeConfirmLoading, setCustomerCodeConfirmLoading] =
    useState<boolean>(false);

  const queryRef = useRef<IQueryState>(initialQueryState);
  const formRef = useRef<ProFormInstance>();

  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
    value: projectNameValue,
  } = useMultipleFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
    value: customerNameValue,
  } = useMultipleFieldQuery({
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
  } = useMultipleFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: plateNumberOptions,
    onSearch: plateNumberSearch,
    defaultFieldProps: plateNumberDefaultFieldProps,
    value: plateNumberValue,
  } = useMultipleFieldQuery({
    field: 'plateNumber',
    esDtoClass: ES_DTO_CLASS.TRUCK,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: driverNameOptions,
    onSearch: driverNameSearch,
    defaultFieldProps: driverNameDefaultFieldProps,
    value: driverNameValue,
  } = useMultipleFieldQuery({
    field: 'name',
    esDtoClass: ES_DTO_CLASS.CREW,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: waybillNumberOptions,
    onSearch: waybillNumberSearch,
    defaultFieldProps: waybillNumberDefaultFieldProps,
    value: waybillNumberValue,
  } = useMultipleFieldQuery({
    field: 'waybillNumber',
    esDtoClass: ES_DTO_CLASS.WAYBILL,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  const getOption = async (waybillId: number) => {
    setLoading(true);
    try {
      const res = await waybillCustomerCodeTypeList(waybillId);
      if (res.code === 200) {
        const list: ICommonListItem[] = [];
        (res.data || []).forEach((item) => {
          list.push({
            label: item.customerCodeTypeName,
            value: item.customerCodeTypeId,
          });
        });
        setOptions(list);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const formatBuild = (buildType: buildTypeEnum, fieldQueryValue: any) => {
    const buildTypeObject: Record<
      buildTypeEnum,
      [string, keyof IListSearchCondition, keyof IListSearchCondition]
    > = {
      project: ['projectName', 'projectIdList', 'projectNameList'],
      customer: ['customerName', 'customerIdList', 'customerNameList'],
      vendor: ['vendorName', 'vendorIdList', 'customerNameList'],
      plate: ['plateNumber', 'plateNumberIdList', 'plateNumberNameList'],
      driver: ['driverName', 'driverIdList', 'driverNameList'],
      waybill: ['waybillNumber', 'waybillIdList', 'waybillNameList'],
    };
    const [fromKey, idListKey, nameListKey] = buildTypeObject[buildType];
    const values = formRef.current?.getFieldsValue();
    if (values[fromKey]?.length > 0) {
      queryRef.current[idListKey] = values[fromKey]?.map?.(
        (item: IFieldQueryHighlightRes) => item.id || item.value,
      );
      queryRef.current[nameListKey] = values[fromKey].map?.(
        (item: IFieldQueryHighlightRes) => item.name || item.label,
      );
    } else {
      if (fieldQueryValue && fieldQueryValue?.length > 0) {
        queryRef.current[idListKey] = fieldQueryValue?.map?.(
          (item: IFieldQueryHighlightRes) => item.id || item.value,
        );

        queryRef.current[nameListKey] = fieldQueryValue?.map?.(
          (item: IFieldQueryHighlightRes) => item.name || item.label,
        );
      } else {
        queryRef.current[idListKey] = [];
        queryRef.current[nameListKey] = [];
      }
    }
  };

  const buildQuery = () => {
    const values = formRef.current?.getFieldsValue();
    queryRef.current.pageNum = 1;
    queryRef.current.pageSize = 20;
    formatBuild(buildTypeEnum.PROJECT, projectNameValue);
    formatBuild(buildTypeEnum.CUSTOMER, customerNameValue);
    formatBuild(buildTypeEnum.VENDOR, vendorNameValue);
    formatBuild(buildTypeEnum.PLATE, plateNumberValue);
    formatBuild(buildTypeEnum.DRIVER, driverNameValue);
    formatBuild(buildTypeEnum.WAYBILL, waybillNumberValue);

    if (values.truckType?.length > 0) {
      queryRef.current.truckType = values.truckType;
    } else {
      queryRef.current.truckType = [];
    }

    queryRef.current.podNumber = values.podNumberList || undefined;

    if (lodash.isArray(values.unloadingTime)) {
      const [start, end] = values.unloadingTime;
      queryRef.current.unloadTimeStart = start?.format('YYYY-MM-DD 00:00:00');
      queryRef.current.unloadTimeEnd = end?.format('YYYY-MM-DD 23:59:59');
    } else {
      queryRef.current.unloadTimeStart = undefined;
      queryRef.current.unloadTimeEnd = undefined;
    }

    if (lodash.isArray(values.deliveredTime)) {
      const [start, end] = values.deliveredTime;
      queryRef.current.deliverTimeStart = start?.format?.(
        'YYYY-MM-DD 00:00:00',
      );
      queryRef.current.deliverTimeEnd = end?.format?.('YYYY-MM-DD 23:59:59');
    } else {
      queryRef.current.deliverTimeStart = undefined;
      queryRef.current.deliverTimeEnd = undefined;
    }
  };

  const getDataSource = useCallback(
    async (input: any) => {
      if (!headerFormData.customerId && !headerFormData.vendorId) {
        setOriginData(DEFAULT_PAGINATION);
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
      setLoading(true);
      buildQuery();
      const params = lodash.merge({}, queryRef.current, input);
      let customerIds;
      let vendorIds;
      if (headerFormData.isCustomer) {
        customerIds = [headerFormData.customerId];
        if (params?.vendorIdList?.length > 0) {
          vendorIds = params.vendorIdList;
        }
      } else {
        vendorIds = [headerFormData.vendorId];
        if (params?.customerIdList?.length > 0) {
          customerIds = params.customerIdList;
        }
      }
      const payload = {
        customerIds,
        vendorIds,
        pageNum: params?.current ? Number(params.current) : params.pageNum,
        pageSize: params?.pageSize,
        transmittalType: headerFormData.transmittalType,
        projectIds:
          params?.projectIdList?.length > 0 ? params.projectIdList : undefined,
        truckIds:
          params?.plateNumberIdList?.length > 0
            ? params.plateNumberIdList
            : undefined,
        truckTypeIds:
          params.truckType?.length > 0 ? params.truckType : undefined,
        driverNameList:
          params?.driverNameList?.length > 0
            ? params.driverNameList
            : undefined,
        waybillIdList:
          params?.waybillIdList?.length > 0 ? params.waybillIdList : undefined,
        podNumber: params?.podNumber || undefined,
        deliverTimeStart: params?.deliverTimeStart || undefined,
        deliverTimeEnd: params?.deliverTimeEnd || undefined,
        unloadTimeStart: params?.unloadTimeStart || undefined,
        unloadTimeEnd: params?.unloadTimeEnd || undefined,
      };
      const res = await addTransmittalWaybillList(
        payload as IAddTransmittalWaybillListParams,
      ).finally(() => {
        setLoading(false);
      });
      if (res.code === 200) {
        setOriginData(res.data);
        const list = res.data?.list ?? [];
        return {
          data: [...list],
          success: true,
          total: res.data?.total,
        };
      }
      return {
        data: [],
        success: false,
        total: 0,
      };
    },
    [headerFormData],
  );

  const initialListQuery = () => {
    const query = lodash.merge({}, initialQueryState);
    queryRef.current = query;
  };

  useEffect(() => {
    getDataSource(queryRef.current);
  }, [headerFormData]);

  const onEditCustomerCode = async (waybillId: number) => {
    const res = await waybillCustomerCodeList(waybillId).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      if (!options?.length && !res?.data?.length) {
        return message.error(
          'Cannot fill in Customer Code because the project has not been configured.',
        );
      }
      setCustomerCodeList(res?.data || []);
      setEditCustomerCodeModal(true);
    }
  };

  const onEditCustomerCodeConfirm = async (values: ICustomerCodeListItem[]) => {
    const payload = {
      waybillId: Number(currentRecord.waybillId),
      customerCodeList: values,
    };
    setCustomerCodeConfirmLoading(true);
    const res = await waybillCustomerCodeUpdate(payload).finally(() => {
      setCustomerCodeConfirmLoading(false);
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        getDataSource(queryRef.current);
        message.success('Edit Customer Code successfully!');
        setEditCustomerCodeModal(false);
      } else {
        message.warning(res.data.msg || 'Warning');
      }
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      valueType: 'select',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        valuePropName: 'name',
      },
      fieldProps: {
        ...projectNameDefaultFieldProps,
        placeholder: 'Project Name',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        options: projectNameOptions,
        onSearch: projectNameSearch,
        value: projectNameValue,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Waybill No.',
      dataIndex: 'waybillNumber',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      formItemProps: {
        label: null,
      },
      fieldProps: {
        ...waybillNumberDefaultFieldProps,
        placeholder: 'Waybill No.',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        options: waybillNumberOptions,
        onSearch: waybillNumberSearch,
        value: waybillNumberValue,
      },
      width: 160,
      render: (_, record) => (
        <CustomTooltip title={record.waybillNumber}>
          {record.waybillNumber}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      hideInSearch: headerFormData.isCustomer,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      formItemProps: {
        label: null,
      },
      fieldProps: {
        ...customerNameDefaultFieldProps,
        placeholder: 'Customer Name',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        options: customerNameOptions,
        onSearch: customerNameSearch,
        value: customerNameValue,
      },
      width: 160,
      render: (_, record) => (
        <CustomTooltip title={record.customerName}>
          {record.customerName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      hideInSearch: !headerFormData.isCustomer,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      formItemProps: {
        label: null,
      },
      fieldProps: {
        ...vendorNameDefaultFieldProps,
        placeholder: 'Vendor Name',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        options: vendorNameOptions,
        onSearch: vendorNameSearch,
        value: vendorNameValue,
      },
      width: 160,
      render: (_, record) => (
        <CustomTooltip title={record.vendorName}>
          {record.vendorName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      valueType: 'select',
      width: 160,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        valuePropName: 'name',
      },
      fieldProps: {
        ...plateNumberDefaultFieldProps,
        placeholder: 'Plate Number',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        options: plateNumberOptions,
        onSearch: plateNumberSearch,
        value: plateNumberValue,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.plateNumber}>
            {record.plateNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      valueType: 'select',
      width: 200,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Truck Type',
        mode: 'multiple',
      },
      request: async () => {
        const res = await getTruckTypeList();
        if (res.code === 200) {
          return res?.data?.map((item: ITruckTypeListItem) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        }
        return [];
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.truckType}>
            {record.truckType}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      hideInSearch: true,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <CustomTooltip title={record.origin}>{record.origin}</CustomTooltip>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      hideInSearch: true,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <CustomTooltip title={record.destination}>
          {record.destination}
        </CustomTooltip>
      ),
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      valueType: 'select',
      width: 160,
      hideInTable: true,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        valuePropName: 'name',
      },
      fieldProps: {
        ...driverNameDefaultFieldProps,
        placeholder: 'Driver',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
        options: driverNameOptions,
        onSearch: driverNameSearch,
        value: driverNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.driverName}>
            {record.driverName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Code',
      dataIndex: 'podNumberList',
      valueType: 'text',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Customer Code',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render(_, record) {
        let content = '-';
        if (record.podNumberList?.length) {
          content = record.podNumberList.reduce(
            (acc: string, cur: IWaybillPodNumberListItem) => {
              return acc + `${cur.customerCodeTypeName}：${cur.number}，`;
            },
            '',
          );
          content = content.slice(0, -1);
        }
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Unloading Time',
      dataIndex: 'unloadingTime',
      valueType: 'dateRange',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Unloading Time Start', 'Unloading Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const content = record.unloadingTime
          ? dayjs(record.unloadingTime).format('YYYY-MM-DD HH:mm:ss')
          : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Delivery Time',
      dataIndex: 'deliveredTime',
      valueType: 'dateRange',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Delivery Time Start', 'Delivery Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const content = record.deliveredTime
          ? dayjs(record.deliveredTime).format('YYYY-MM-DD HH:mm:ss')
          : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      align: 'center',
      width: 88,
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxSizing: 'border-box',
            }}
          >
            <IconEdit
              content="Edit Customer Code"
              style={{ color: '#009688', fontSize: 14 }}
              onClick={async () => {
                if (loading) {
                  return;
                }
                await getOption(record.waybillId);
                setCurrentRecord(record);
                onEditCustomerCode(record.waybillId);
              }}
            />
            <Access
              key="detail"
              accessible={access[PermissionEnum.WAYBILL_DETAIL]}
            >
              <IconDetail
                onClick={() => {
                  history.push(
                    `${PATHS.WAYBILL_LIST_DETAIL}/${record.waybillId}`,
                  );
                }}
              />
            </Access>
          </div>
        );
      },
    },
  ];

  const tableAlertRender = () => {
    return (
      <>
        <div
          style={{
            marginTop: 12,
            color: 'rgba(0, 0, 0, 45%)',
            fontSize: '14px',
            lineHeight: '22px',
          }}
        >
          <span
            style={{
              color: 'rgba(0, 0, 0, 85%)',
            }}
          >
            {originData.total}
          </span>{' '}
          records in total, {selectedWaybillIds.length} records Selected
        </div>
      </>
    );
  };

  return (
    <>
      <Spin spinning={loading}>
        <TransmittalCreateHeader
          waybillIds={selectedWaybillIds}
          headerFormData={headerFormData}
          setHeaderFormData={setHeaderFormData}
        />
        {headerFormData.customerId || headerFormData.vendorId ? (
          <CustomTable
            columns={columns}
            scroll={{ x: 1500 }}
            formRef={formRef}
            dataSource={originData.list}
            request={async (params) => getDataSource(params)}
            pagination={{
              showSizeChanger: true,
              pageSize: originData.pageSize,
              total: originData.total,
            }}
            toolBarRender={false}
            tableAlertRender={tableAlertRender}
            rowKey="waybillId"
            selectedKey="waybillId"
            getSelectTableItem={(items) => {
              setSelectedWaybillIds(items.ids);
            }}
            rowSelection={{ all: true }}
            onReset={initialListQuery}
            manualRequest
            filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              minHeight: '500px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
          </div>
        )}

        {editCustomerCodeModal && (
          <CustomerCodeModal
            open={editCustomerCodeModal}
            list={customerCodeList}
            options={options}
            onConfirm={onEditCustomerCodeConfirm}
            modalProps={{
              onCancel: () => setEditCustomerCodeModal(false),
            }}
            submitter={{
              submitButtonProps: {
                loading: customerCodeConfirmLoading,
              },
            }}
          />
        )}
      </Spin>
    </>
  );
};

export default TransmittalCreate;
