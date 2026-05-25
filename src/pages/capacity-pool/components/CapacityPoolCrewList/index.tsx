import {
  capacityPoolCrewApproveRevoke,
  capacityPoolCrewList,
} from '@/api/capacity';
import { ICapacityPoolCrewRecord } from '@/api/types/capacity';
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
  CrewStatusEnum,
  CrewStatusEnumColor,
  CrewStatusEnumText,
  CrewTypeEnum,
  CrewTypeEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  TruckTransportationStatusEnum,
  TruckTransportationStatusEnumColor,
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

  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ICapacityPoolCrewRecord[]>(
    [],
  );

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const getDataSource = async (params: any) => {
    const values = formRef.current?.getFieldsValue();

    const formParams = {
      crewName: values?.crewObj?.name,
      licenseNumber: values?.licenseNumberObj?.name,

      status: values?.status,
      accessStatus: values?.accessStatus,

      driverFlag: values?.type?.includes(CrewTypeEnum.DRIVER),
      helperFlag: values?.type?.includes(CrewTypeEnum.HELPER),
      vendorId: values?.vendorObj?.id,
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

    if (payload.vendorId === 0) {
      delete payload.vendorId;
    }
    delete payload.current;
    delete payload.crewObj;
    delete payload.vendorObj;
    delete payload.licenseNumberObj;
    setLoading(true);
    const res = await capacityPoolCrewList(payload);
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

  const doSearch = useCallback(() => {
    actionRef?.current?.reloadAndRest?.();
  }, []);

  const onApproveOrRevoke = useCallback(
    async (ids: number[], isApprove: boolean) => {
      const payload = {
        ids: ids,
        enable: isApprove,
        capacityPoolId: capacityPoolId!,
      };
      const res = await capacityPoolCrewApproveRevoke(payload);
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

      const payload = {
        ids: ids,
        enable: isApprove,
        capacityPoolId: capacityPoolId!,
      };
      const res = await capacityPoolCrewApproveRevoke(payload);
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
        // 如果Not Approved数量=0，则弹窗提示”There is no Crew with Not Approved status among the selected vehicles“
        // 如果Not Approved数量≠0，则二次弹窗确认”Confirm to set the x（车辆数） Not Approved Crew among the selected Crew to Approved“
        const notApprovedRows = selectedRows.filter(
          (item) => item.accessStatus === AccessStatusEnum.NOT_APPROVED,
        );
        if (notApprovedRows?.length === 0) {
          message.warning(
            'There is no Crew with Not Approved status among the selected Crew',
          );
          return;
        } else {
          modal.confirm({
            title: 'Confirm',
            content: `Confirm to set the ${notApprovedRows.length} Not Approved crew among the selected crew to Approved?`,
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
          (item) => item.accessStatus === AccessStatusEnum.APPROVED,
        );
        if (approvedRows?.length === 0) {
          message.warning(
            'There is no crew with Approved status among the selected crew',
          );
          return;
        } else {
          modal.confirm({
            title: 'Confirm',
            content: `Confirm to set the ${approvedRows.length} Approved crew among the selected crew to Not Approved?`,
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
  const toolBarRender = () => [
    <Access
      key="revoke"
      accessible={
        access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE]
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
        access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE]
      }
    >
      <Button
        disabled={selectedRowKeys.length === 0}
        onClick={() => doBatchCheck(true)}
        className={styles.approveBtn}
        variant="outlined"
      >
        Approve
      </Button>
    </Access>,
  ];
  const columns: ProColumns[] = [
    {
      title: 'Crew Name',
      dataIndex: 'crewObj',
      valueType: 'select',
      order: 5,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'Crew Name',
          }}
          request={{
            field: 'name',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
            uniqueLogic: FieldQueryHighlightUniqueLogicEnum.POOL_ID,
            uniqueLogicParams: {
              poolId: capacityPoolId,
            },
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`name${record.id}`}
            title={record.name}
            placement="top"
          >
            <a
              onClick={() => {
                openNewTag(`${PATHS.VENDOR_CREW_DETAIL}/${record.crewId}`);
              }}
            >
              {record.name}
            </a>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'status',
      valueEnum: CrewStatusEnumText,
      valueType: 'select',
      order: 4,
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
        // mode: 'multiple',
        placeholder: 'Accreditation Status',
      },
      width: 150,
      render: (_, record) => {
        const status: CrewStatusEnum = record.status;
        const Content = (
          <Badge
            color={CrewStatusEnumColor[status]}
            text={CrewStatusEnumText[status]}
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
      width: 160,
      hideInSearch: true,
      render: (_, record) => {
        const transportationStatus: TruckTransportationStatusEnum =
          record.transportationStatus;
        const Content = (
          <Badge
            color={TruckTransportationStatusEnumColor[transportationStatus]}
            text={transportationStatus}
          />
        );
        return (
          <CustomTooltip title={Content}>
            {transportationStatus ? Content : '-'}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Access Status',
      dataIndex: 'accessStatus',
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
      render: (_, record) => {
        const status: AccessStatusEnum = record.accessStatus;

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
      title: 'Type',
      dataIndex: 'type',
      valueEnum: CrewTypeEnumText,
      valueType: 'select',
      order: 2,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'Type',
      },
      render: (_, record) => {
        const { driverFlag, helperFlag } = record;
        const driverStr = driverFlag
          ? CrewTypeEnumText[CrewTypeEnum.DRIVER]
          : '';
        const helperStr = helperFlag
          ? CrewTypeEnumText[CrewTypeEnum.HELPER]
          : '';
        const str =
          !!driverStr && !!helperStr
            ? `${driverStr},${helperStr}`
            : driverStr
              ? driverStr
              : helperStr;
        return (
          <CustomTooltip key={`type${record.id}`} title={str}>
            {str}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorObj',
      valueType: 'select',
      order: 6,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'vendor Name',
          }}
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
      title: 'License Number',
      dataIndex: 'licenseNumberObj',
      hideInTable: true,
      valueType: 'select',
      order: 1,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'License Number',
            style: { width: '216px' },
          }}
          request={{
            field: 'licenseNumber',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
    },

    {
      title: 'Contact',
      dataIndex: 'phoneNum',
      ellipsis: {
        showTitle: false,
      },
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.phoneCode + ' ' + record.phoneNum}>
          {record.phoneCode + ' ' + record.phoneNum}
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
          : !access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_DETAIL] &&
            !access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE],
      key: 'option',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        return (
          <Space>
            <Access
              accessible={
                access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_DETAIL]
              }
            >
              <CustomStatusButton
                noStyle
                onClick={() => {
                  openNewTag(`${PATHS.VENDOR_CREW_DETAIL}/${record.crewId}`);
                }}
              >
                Detail
              </CustomStatusButton>
            </Access>

            {record.accessStatus === AccessStatusEnum.APPROVED ? (
              <Access
                key="revoke"
                accessible={
                  access[
                    PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE
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

            {record.accessStatus === AccessStatusEnum.NOT_APPROVED ? (
              <Access
                key="approve"
                accessible={
                  access[
                    PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE
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
        search={
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
            ? {
                defaultCollapsed: false,
                collapseRender: false,
              }
            : false
        }
        request={async (params) => getDataSource(params)}
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
        }}
        loading={loading}
        fixedSpin={false}
        toolBarRender={
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
            ? toolBarRender
            : false
        }
        rowSelection={
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
            ? {
                selectedRowKeys,
                onChange: (
                  keys: Key[],
                  _selectedRows: ICapacityPoolCrewRecord[],
                ) => {
                  setSelectedRowKeys(keys);
                  setSelectedRows(_selectedRows);
                },
              }
            : false
        }
        onSubmit={doSearch}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
    </>
  );
};

export default CapacityPoolTruckList;
