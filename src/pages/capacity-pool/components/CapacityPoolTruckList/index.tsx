import {
  capacityPoolTruckApproveRevoke,
  capacityPoolTruckList,
} from '@/api/capacity';
import { getTruckTypeList } from '@/api/truck';
import { ICapacityPoolTruckRecord } from '@/api/types/capacity';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { DEFAULT_PAGINATION, ES_DTO_CLASS, PATHS } from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
  AccessStatusEnum,
  AccessStatusEnumText,
  AccessStatusEnumTextColor,
  CapacityPoolDetailTabsUsePlaceEnum,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  VendorStatusEnum,
  VendorStatusEnumColor,
  VendorStatusEnumText,
  VendorTruckStatusEnum,
  VendorTruckStatusEnumColor,
  VendorTruckStatusEnumText,
  VendorTruckVanTypeEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { openNewTag } from '@/utils/utils';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { App, Badge, Button, Popconfirm, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import {
  Key,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  EVENT_CAPACITY_DETAIL_RELOAD,
  EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD,
} from '../../Detail/events';
import styles from '../common.less';
interface ICapacityPoolTruckList {
  capacityPoolId?: number;
  projectId?: number;
  capacityPoolSource?: CapacityPoolDetailTabsUsePlaceEnum;
}
const CapacityPoolTruckList = ({
  capacityPoolId,
  projectId,
  capacityPoolSource = CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL,
}: ICapacityPoolTruckList) => {
  const access = useAccess();
  const { modal, message } = App.useApp();
  // @ts-ignore
  // const { state } = useContext(StateContext);
  const { subscribe, publish } = useContext(PubSubContext);
  // const reloadAll = state?.reloadAll ?? false;
  // const { message, modal } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ICapacityPoolTruckRecord[]>(
    [],
  );
  const [serviceTruckTypeList, setServiceTruckTypeList] = useState<
    DefaultOptionType[]
  >([]);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  // const filterFormRef = useRef<ProFormInstance>();

  const getDataSource = async (params: any) => {
    const values = formRef.current?.getFieldsValue();
    const formParams = {
      truckType: values?.truckType,
      status: values?.status,
      vendorId: values?.vendorObj?.id,
      truckId: values?.plateNumberObj?.id,
      truckStatusList: values?.truckStatusList,
      vanType: values?.vanType,
    };

    const payload = {
      ...params,
      ...formParams,
      pageNum: params.current || params.pageNum,
      pageSize: params.pageSize,
      capacityPoolId:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
          ? capacityPoolId
          : undefined,
      projectId:
        capacityPoolSource !==
        CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
          ? projectId
          : undefined,
    };
    if (payload.truckType === 0) {
      delete payload.truckType;
    }
    if (payload.vendorId === 0) {
      delete payload.vendorId;
    }
    delete payload.current;
    delete payload.vendorObj;
    delete payload.plateNumberObj;
    setLoading(true);
    const res = await capacityPoolTruckList(payload);
    setLoading(false);

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
  };

  // const doResetForm = useCallback(() => {
  //   filterFormRef.current?.resetFields();
  //   actionRef?.current?.reloadAndRest?.();
  // }, []);

  const doSearch = useCallback(() => {
    actionRef?.current?.reloadAndRest?.();
  }, []);

  // const doNotice = useCallback(() => {
  //   dispatch({
  //     type: OPS_TYPE.RELOAD_ALL,
  //     payload: {
  //       reloadAll: true,
  //     },
  //   });
  //   setTimeout(() => {
  //     dispatch({
  //       type: OPS_TYPE.RELOAD_ALL,
  //       payload: {
  //         reloadAll: false,
  //       },
  //     });
  //   }, 0);
  // }, []);

  const onApproveOrRevoke = useCallback(
    async (ids: number[], isApprove: boolean) => {
      const payload = {
        ids: ids,
        enable: isApprove,
      };
      const res = await capacityPoolTruckApproveRevoke(payload);
      if (res?.code === 200) {
        message.success(`${isApprove ? 'Approve' : 'Revoke'} successfully!`);
        // 刷新，但页码不变
        actionRef?.current?.reload();
        publish(EVENT_CAPACITY_DETAIL_RELOAD);
        // doNotice();
      }
    },
    [],
  );
  const doApproveOrRevoke = useCallback(
    async (ids: number[], isApprove: boolean) => {
      if (ids?.length < 1) {
        return;
      }
      // const hasMutiple = ids?.length > 1;

      const payload = {
        ids: ids,
        enable: isApprove,
      };
      const res = await capacityPoolTruckApproveRevoke(payload);
      if (res?.code === 200) {
        message.success(`${isApprove ? 'Approve' : 'Revoke'} successfully!`);
        // 刷新，但页码不变
        actionRef?.current?.reload();
        setSelectedRowKeys([]);
        setSelectedRows([]);
        publish(EVENT_CAPACITY_DETAIL_RELOAD);
        // doNotice();
      }
    },
    [],
  );

  const doBatchCheck = useCallback(
    (isApprove: boolean) => {
      if (isApprove) {
        // 如果Not Approved数量=0，则弹窗提示”There is no Truck with Not Approved status among the selected vehicles“
        // 如果Not Approved数量≠0，则二次弹窗确认”Confirm to set the x（车辆数） Not Approved vehicles among the selected vehicles to Approved“
        const notApprovedRows = selectedRows.filter(
          (item) => item.status === AccessStatusEnum.NOT_APPROVED,
        );
        if (notApprovedRows?.length === 0) {
          message.warning(
            'There is no Truck with Not Approved status among the selected vehicles',
          );
          return;
        } else {
          modal.confirm({
            title: 'Confirm',
            content: `Confirm to set the ${notApprovedRows.length} Not Approved vehicles among the selected vehicles to Approved?`,
            onOk: async () => {
              const ids = notApprovedRows.map((item) => item.id);
              await doApproveOrRevoke(ids, isApprove);
            },
            onCancel() {},
          });
        }
      } else {
        // 如果Approved数量=0，则弹窗提示”There is no Truck with Approved status among the selected vehicles“
        // 如果Approved数量≠0，则二次弹窗确认”Confirm to set the x（车辆数） Approved vehicles among the selected vehicles to Not Approved“

        const approvedRows = selectedRows.filter(
          (item) => item.status === AccessStatusEnum.APPROVED,
        );
        if (approvedRows?.length === 0) {
          message.warning(
            'There is no Truck with Approved status among the selected vehicles',
          );
          return;
        } else {
          modal.confirm({
            title: 'Confirm',
            content: `Confirm to set the ${approvedRows.length} Approved vehicles among the selected vehicles to Not Approved?`,
            onOk: async () => {
              const ids = approvedRows.map((item) => item.id);
              await doApproveOrRevoke(ids, isApprove);
            },
            onCancel() {},
          });
        }
      }
    },
    [selectedRowKeys, selectedRows],
  );

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: { label: string; value: number }[] = [];
    if (res.code === 200) {
      list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    }
    setServiceTruckTypeList(list);
  };
  const toolBarRender = () => [
    <Access
      key="revoke"
      accessible={
        access[PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE]
      }
    >
      <Button
        disabled={selectedRowKeys.length === 0}
        onClick={() => doBatchCheck(false)}
        color="danger"
        variant="outlined"
      >
        Revoke
      </Button>
    </Access>,
    <Access
      key="approve"
      accessible={
        access[PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE]
      }
    >
      <Button
        disabled={selectedRowKeys.length === 0}
        onClick={() => doBatchCheck(true)}
        // type="primary"
        variant="outlined"
        className={styles.approveBtn}
      >
        Approve
      </Button>
    </Access>,
  ];
  const columns: ProColumns[] = [
    {
      title: 'Plate Number',
      dataIndex: 'plateNumberObj',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      width: 200,
      order: 5,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Plate No.' }}
          request={{
            field: 'plateNumber',
            esDtoClass: ES_DTO_CLASS.TRUCK,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
            uniqueLogic:
              FieldQueryHighlightUniqueLogicEnum.CAPACITY_POOL_TRUCKS_PLATE_NUMBER,
            uniqueLogicParams: { poolId: capacityPoolId },
          }}
        />
      ),
      render: (_, record) => (
        <CustomTooltip title={record.plateNumber}>
          <a
            onClick={() => {
              openNewTag(`${PATHS.VENDOR_TRUCK_DETAIL}/${record.truckId}`);
            }}
          >
            {record.plateNumber}
          </a>
        </CustomTooltip>
      ),
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      valueType: 'select',
      order: 2,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        options: serviceTruckTypeList,
        placeholder: 'Truck Type',
      },
      ellipsis: {
        showTitle: false,
      },
      width: 190,
      render: (_, record) => (
        <CustomTooltip title={record.truckTypeName}>
          {record.truckTypeName}
        </CustomTooltip>
      ),
    },

    {
      title: 'Accreditation Status',
      dataIndex: 'truckStatusList',
      valueEnum: VendorTruckStatusEnumText,
      valueType: 'select',
      order: 4,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'Accreditation Status',
      },
      render: (_, record) => {
        const status: VendorTruckStatusEnum = record.truckStatus;
        const Content = (
          <Badge
            color={VendorTruckStatusEnumColor[status]}
            text={VendorTruckStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },

    {
      title: 'Access Status',
      dataIndex: 'status',
      valueEnum: AccessStatusEnumText,
      valueType: 'select',
      order: 3,
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
        placeholder: 'Access Status',
      },
      width: 150,
      render: (_, record) => {
        const status: AccessStatusEnum = record.status;
        const Content = (
          <Badge
            color={AccessStatusEnumTextColor[status]}
            text={AccessStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Van Type',
      dataIndex: 'vanType',
      valueEnum: VendorTruckVanTypeEnumText,
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      hideInTable: true,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Van Type',
      },
      width: 150,
      order: 1,
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorObj',
      width: 260,
      valueType: 'select',
      order: 6,
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
          fieldProps={{ placeholder: 'Vendor Name' }}
          request={{
            field: 'vendorName',
            esDtoClass: ES_DTO_CLASS.VENDOR,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => (
        <CustomTooltip title={record.vendorName}>
          {record.vendorName}
        </CustomTooltip>
      ),
    },

    {
      title: 'Vendor Accreditation Status',
      dataIndex: 'vendorStatus',
      ellipsis: {
        showTitle: false,
      },
      width: 240,
      hideInSearch: true,
      render: (_, record) => {
        const status: VendorStatusEnum = record.vendorStatus;
        const Content = (
          <Badge
            color={VendorStatusEnumColor[status]}
            text={VendorStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },

    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.contactPerson}>
          {record.contactPerson}
        </CustomTooltip>
      ),
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.contactNumber}>
          {record.contactNumber}
        </CustomTooltip>
      ),
    },
    {
      title: 'Contact Email',
      dataIndex: 'contactEmail',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.contactEmail}>
          {record.contactEmail}
        </CustomTooltip>
      ),
    },

    {
      title: 'Operate',
      valueType: 'option',

      hideInTable:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS
          ? !access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL]
          : !access[PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_DETAIL] &&
            !access[
              PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE
            ],
      key: 'option',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        return (
          <Space>
            <Access
              accessible={
                access[PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_DETAIL]
              }
            >
              <CustomStatusButton
                noStyle
                onClick={() => {
                  openNewTag(`${PATHS.VENDOR_TRUCK_DETAIL}/${record.truckId}`);
                }}
              >
                Detail
              </CustomStatusButton>
            </Access>
            {record.status === AccessStatusEnum.APPROVED ? (
              <Access
                key="revoke"
                accessible={
                  access[
                    PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE
                  ]
                }
              >
                <Popconfirm
                  title="Confirm"
                  description="Do you want to revoke this item?"
                  trigger="click"
                  onConfirm={() => onApproveOrRevoke([record.id], false)}
                  okText="Yes"
                  cancelText="No"
                >
                  <CustomStatusButton noStyle className={styles.revokeTableBtn}>
                    Revoke
                  </CustomStatusButton>
                </Popconfirm>
              </Access>
            ) : null}

            {record.status === AccessStatusEnum.NOT_APPROVED ? (
              <Access
                key="approve"
                accessible={
                  access[
                    PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE
                  ]
                }
              >
                <Popconfirm
                  title="Confirm"
                  description="Do you want to approve this item?"
                  trigger="click"
                  onConfirm={() => onApproveOrRevoke([record.id], true)}
                  okText="Yes"
                  cancelText="No"
                >
                  <CustomStatusButton
                    noStyle
                    className={styles.approveTableBtn}
                  >
                    Approve
                  </CustomStatusButton>
                </Popconfirm>
              </Access>
            ) : null}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTruckTypeListHandle();
    const unsubscribe = subscribe(
      EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD,
      () => {
        actionRef?.current?.reload?.();
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <CustomTable
        noStyle
        className={styles.capacityPoolTab}
        columns={columns}
        scroll={{ x: 1150 }}
        actionRef={actionRef}
        formRef={formRef}
        fixedSpin={false}
        request={async (params) => getDataSource(params)}
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
        }}
        search={
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
            ? {
                defaultCollapsed: false,
                collapseRender: false,
              }
            : false
        }
        onSubmit={doSearch}
        // onReset={doResetForm}
        loading={loading}
        rowSelection={
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
            ? {
                selectedRowKeys,
                onChange: (
                  keys: Key[],
                  _selectedRows: ICapacityPoolTruckRecord[],
                ) => {
                  setSelectedRowKeys(keys);
                  setSelectedRows(_selectedRows);
                },
              }
            : false
        }
        toolBarRender={
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
            ? toolBarRender
            : false
        }
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
    </>
  );
};

export default CapacityPoolTruckList;
