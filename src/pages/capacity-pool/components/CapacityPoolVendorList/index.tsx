import {
  capacityPoolVendorApprove,
  capacityPoolVendorList,
  capacityPoolVendorRevoke,
} from '@/api/capacity';
import { vendorListContract } from '@/api/contract';
import { ICapacityPoolVendorRecord } from '@/api/types/capacity';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { IconDetail } from '@/components/OperationIcon';
import { ItemType } from '@/components/TableDropdown';
import TableOperation from '@/components/TableOperation';
import { DEFAULT_PAGINATION, ES_DTO_CLASS, PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import {
  AccessStatusEnum,
  AccessStatusEnumText,
  AccessStatusEnumTextColor,
  CapacityPoolDetailTabsUsePlaceEnum,
  ContractStatusEnum,
  ContractStatusEnumColor,
  ContractStatusEnumText,
  FieldQueryHighlightTypeEnum,
  RouteBillingModeEnum,
  VendorStatusEnum,
  VendorStatusEnumColor,
  VendorStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import ContractListModal, {
  IContractListModalState,
  initialContractListModalState,
} from '@/pages/vendor/components/ContractListModal';
import { formatAmount, openNewTag } from '@/utils/utils';
import {
  BarsOutlined,
  CheckCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  PayCircleOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Badge, Button, Popconfirm, Popover } from 'antd';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  EVENT_CAPACITY_DETAIL_RELOAD,
  EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD,
  EVENT_CAPACITY_DETAIL_VENDOR_LIST_RELOAD,
} from '../../Detail/events';
import styles from '../common.less';

interface ICapacityPoolVendorList {
  capacityPoolId: number;
  projectId?: number;
  capacityPoolSource?: CapacityPoolDetailTabsUsePlaceEnum;
}

const modeEnumText = {
  [RouteBillingModeEnum.ROUTE_BILLING]: 'byRoute',
  [RouteBillingModeEnum.MILEAGE_BILLING]: 'byDistance',
};

let approveAbortController: AbortController | undefined;
let revokeAbortController: AbortController | undefined;

const CapacityPoolVendorList = ({
  capacityPoolId,
  projectId,
  capacityPoolSource = CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL,
}: ICapacityPoolVendorList) => {
  const access = useAccess();

  const { subscribe, publish } = useContext(PubSubContext);
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [vendorId, setVendorId] = useState<number>();
  const [revokeLoading, setRevokeLoading] = useState<boolean>(false);
  const [revokeContractChange, setRevokeContractChange] =
    useState<boolean>(false);

  const [contractListModalState, setContractListModalState] =
    useSetState<IContractListModalState>(initialContractListModalState);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const activeRecordKeyRef = useRef<number>();

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: vendorTagOptions,
    onSearch: vendorTagSearch,
    defaultFieldProps: vendorTagDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorTag',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const getDataSource = async (params?: any) => {
    const payload = {
      vendorNameId: params?.vendorName?.id,
      vendorTagId: params?.vendorTag?.id,
      vendorAccessStatus: params?.vendorAccessStatus,
      vendorStatus: params?.vendorStatus,
      pageNum: params?.current || params?.pageNum,
      pageSize: params?.pageSize,
      projectId: projectId,
      capacityPoolId,
      fromProjectPage:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS,
    };

    setLoading(true);
    const res = await capacityPoolVendorList(payload);
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

  const fetchContractList = useCallback(
    async (contractSigner: number, pageNum = 1, pageSize = 20) => {
      activeRecordKeyRef.current = contractSigner;
      const payload = {
        pageNum,
        pageSize,
        projectId,
        contractSigner,
        contractType: 'Vendor',
      };
      setContractListModalState({ loading: true });
      const res = await vendorListContract(payload).finally(() => {
        setContractListModalState({ loading: false });
      });
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
        const newOriginData = {
          list,
          pageNum,
          pageSize,
          total: res.data.total,
        };
        setContractListModalState({
          originData: newOriginData,
          open: true,
          projectId,
          contractSigner,
        });
      }
    },
    [],
  );

  const onViewPriceVersion = (record: ICapacityPoolVendorRecord) => {
    const {
      routeLibraryId,
      billingMode,
      billingVersionEnd,
      billingVersionStart,
    } = record;
    if (
      !routeLibraryId ||
      !billingMode ||
      !billingVersionEnd ||
      !billingVersionStart
    ) {
      return;
    }
    //@ts-ignore
    const url = `${PATHS.ROUTE_LIBRARY_PRICE}/${routeLibraryId}?mode=${modeEnumText[billingMode]}&identity=vendor&vendorId=${record.vendorId}`;
    openNewTag(url);
  };

  const doApprove = useCallback(async (id: number) => {
    approveAbortController = new AbortController();
    const { signal } = approveAbortController;

    const payload = {
      id: id,
    };
    const res = await capacityPoolVendorApprove(payload, signal);
    if (res?.code === 200) {
      message.success(`Approve successfully!`);
      // 刷新，但页码不变
      actionRef?.current?.reload();
      publish(EVENT_CAPACITY_DETAIL_RELOAD);
      publish(EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD);
    }
  }, []);

  const doRevoke = async (id: number) => {
    revokeAbortController = new AbortController();
    const { signal } = revokeAbortController;
    let res;
    if (!revokeContractChange) {
      setRevokeLoading(true);
      res = await capacityPoolVendorRevoke({ id }, signal);
      setRevokeLoading(false);
    } else {
      // 点击错误提示 关闭弹窗并将popOver 状态初始化
      setOpen(false);
      setRevokeContractChange(false);
    }
    if (res?.code === 200) {
      if (res?.data === 1) {
        setRevokeContractChange(true);
      } else if (res?.data === 0) {
        setOpen(false);
        setRevokeContractChange(false);
        actionRef?.current?.reload();
        publish(EVENT_CAPACITY_DETAIL_RELOAD);
        publish(EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD);
        message.success('The vendor has been revoked.');
      }
    }
  };

  const onOpenChange = (newOpen: boolean, id: number) => {
    setVendorId(id);
    setOpen(newOpen);
    if (!newOpen) {
      setRevokeContractChange(newOpen);
    }
  };

  const revokeContent = (id: number) => {
    return (
      <>
        <div className={styles.revokeContent}>
          {revokeContractChange ? (
            <>
              <CloseCircleFilled style={{ color: '#FF4D4F' }} />
              <p>
                There is a truck in use under this vendor and revoke vendor is
                not allowed.
              </p>
            </>
          ) : (
            <>
              <ExclamationCircleFilled style={{ color: '#FAAD14' }} />
              <p>
                Revoke vendor will remove all trucks under the vendor from the
                truck list, are you sure you want to revoke?
              </p>
            </>
          )}
        </div>
        <div className={styles.revokeContentTool}>
          <Button
            size="small"
            onClick={() => {
              doRevoke(id);
            }}
            type={!revokeContractChange ? 'default' : 'primary'}
            loading={revokeLoading}
          >
            Yes
          </Button>
          {!revokeContractChange && (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setOpen(false);
              }}
            >
              No
            </Button>
          )}
        </div>
      </>
    );
  };

  const onDropdownOpenHandle = (v: boolean) => {
    if (!v) {
      setRevokeContractChange(v);
      setOpen(v);
      setVendorId(undefined);
      setRevokeLoading(false);
      if (revokeAbortController) {
        revokeAbortController?.abort?.();
      }
      if (approveAbortController) {
        approveAbortController?.abort?.();
      }
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      valueType: 'select',
      width: 240,
      ellipsis: { showTitle: false },

      formItemProps: {
        label: null,
        style: {
          width: 217,
        },
      },
      fieldProps: {
        ...vendorNameDefaultFieldProps,
        placeholder: 'Vendor Name',
        options: vendorNameOptions,
        onSearch: vendorNameSearch,
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
      title: 'Vendor Tag',
      dataIndex: 'vendorTag',
      valueType: 'select',
      width: 120,
      ellipsis: { showTitle: false },
      hideInSearch:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS,
      formItemProps: {
        label: null,
        style: {
          width: 217,
        },
      },
      fieldProps: {
        ...vendorTagDefaultFieldProps,
        placeholder: 'Vendor Tag',
        options: vendorTagOptions,
        onSearch: vendorTagSearch,
      },
      render: (_, record) => {
        return (
          <CustomTooltip key={`vendorTag${record.id}`} title={record.vendorTag}>
            {record.vendorTag}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'vendorStatus',
      ellipsis: {
        showTitle: false,
      },
      width: 170,
      valueEnum: VendorStatusEnumText,
      hideInSearch:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS,
      formItemProps: {
        label: null,
        style: {
          width: 217,
        },
      },
      fieldProps: {
        placeholder: 'Accreditation Status',
      },
      valueType: 'select',
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
      title: 'Trucks',
      dataIndex: 'trucks',
      hideInSearch: true,
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <CustomTooltip title={formatAmount(record.trucks)} placement="top">
          {formatAmount(record.trucks)}
        </CustomTooltip>
      ),
    },
    {
      title: 'Vendor Access Status',
      dataIndex: 'vendorAccessStatus',
      ellipsis: {
        showTitle: false,
      },
      hideInSearch:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS,
      width: 200,
      valueEnum: AccessStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: 217,
        },
      },
      fieldProps: {
        placeholder: 'Vendor Access Status',
      },
      valueType: 'select',
      render: (_, record) => {
        const status: AccessStatusEnum = record.vendorAccessStatus;
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
      title: 'Latest Price Validity Period',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 240,
      render: (_, record) => {
        const { billingVersionStart, billingVersionEnd } = record;
        const dateRange = `${billingVersionStart} - ${billingVersionEnd}`;
        return (
          <CustomTooltip
            title={billingVersionStart && billingVersionEnd ? dateRange : ''}
          >
            {dateRange}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Operate',
      valueType: 'option',
      hideInTable:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS
          ? !access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL]
          : !access[
              PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_VIEW_PRICE_VERSION
            ] &&
            !access[
              PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_REVOKE_OR_APPROVE
            ] &&
            !access[PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_DETAIL],
      key: 'option',
      fixed: 'right',
      width:
        capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS
          ? 200
          : 270,
      render: (_, record) => {
        let operationList =
          capacityPoolSource ===
          CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS
            ? ([
                access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL]
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
                    record?.vendorId === activeRecordKeyRef.current,
                },
              ].filter(Boolean) as ItemType[])
            : ([
                {
                  key: 'contractList',
                  title: 'Contract List',
                  icon: <EyeOutlined />,
                  label: 'Contract List',
                  loading:
                    contractListModalState?.loading &&
                    record?.vendorId === activeRecordKeyRef.current,
                },
                access[
                  PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_VIEW_PRICE_VERSION
                ]
                  ? {
                      key: 'priceVersion',
                      title: 'View Price Version',
                      label: (
                        <CustomTooltip
                          title={'View Price Version'}
                          placement="top"
                        >
                          <div style={{ width: 70 }} className="ellipsis">
                            View Price Version
                          </div>
                        </CustomTooltip>
                      ),
                      icon: <PayCircleOutlined />,
                      disabled:
                        !record.routeLibraryId ||
                        !record.billingMode ||
                        !record.billingVersionEnd ||
                        !record.billingVersionStart,
                    }
                  : null,
                access[PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_DETAIL]
                  ? {
                      key: 'detail',
                      title: 'Detail',
                      icon: <BarsOutlined />,
                      label: 'Detail',
                      loading: false,
                    }
                  : null,
                access[
                  PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_REVOKE_OR_APPROVE
                ]
                  ? {
                      key: 'revokeAndApprove',
                      render: () => {
                        return (
                          <div key={'revokeAndApprove'}>
                            {record.vendorAccessStatus ===
                              AccessStatusEnum.APPROVED && (
                              <Popover
                                zIndex={1051}
                                content={revokeContent(record.id)}
                                styles={{
                                  body: { padding: 16 },
                                }}
                                onOpenChange={(bol: boolean) => {
                                  onOpenChange(bol, record.id);
                                }}
                                trigger="click"
                                open={open && vendorId === record.id}
                              >
                                <div className={styles.operateItem}>
                                  <CloseCircleOutlined
                                    className={styles.revokeIcon}
                                  />
                                  Revoke
                                </div>
                              </Popover>
                            )}
                            {record.vendorAccessStatus ===
                              AccessStatusEnum.NOT_APPROVED && (
                              <Popconfirm
                                zIndex={1051}
                                title="Confirm"
                                description="Do you want to approve this item?"
                                trigger="click"
                                onConfirm={() => doApprove(record.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <div className={styles.operateItem}>
                                  <CheckCircleOutlined
                                    className={styles.approveIcon}
                                  />
                                  Approve
                                </div>
                              </Popconfirm>
                            )}
                          </div>
                        );
                      },
                    }
                  : null,
              ].filter(Boolean) as ItemType[]);

        return (
          <TableOperation
            list={operationList}
            onTrigger={async (item: ItemType) => {
              if (item.key === 'detail') {
                openNewTag(`${PATHS.VENDOR_DETAIL}/${record.vendorId}`);
                return Promise.resolve();
              } else if (item.key === 'contractList') {
                await fetchContractList(record?.vendorId);
                return Promise.resolve();
              } else if (item.key === 'priceVersion') {
                await onViewPriceVersion(record);
                return Promise.resolve();
              } else if (item.key === 'revokeAndApprove') {
                return Promise.resolve();
              } else {
                console.error('Unknown operation');
              }
            }}
            onDropdownOpenHandle={(v) => {
              // 下拉菜单关闭  个状态清空及请求取消
              onDropdownOpenHandle(v);
            }}
          />
        );
      },
    },
  ];

  useEffect(() => {
    const unsubscribe = subscribe(
      EVENT_CAPACITY_DETAIL_VENDOR_LIST_RELOAD,
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
        className={styles.capacityPoolVendor}
        columns={columns}
        scroll={{ x: 1150 }}
        actionRef={actionRef}
        formRef={formRef}
        fixedSpin={false}
        //@ts-ignore
        search={{
          defaultCollapsed: false,
          collapseRender: false,
        }}
        request={async (params) => getDataSource(params)}
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
        }}
        loading={loading}
        toolBarRender={false}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      <ContractListModal
        originData={contractListModalState.originData}
        contractListModalState={contractListModalState}
        onCancel={() => setContractListModalState({ open: false })}
        onConfirm={() => setContractListModalState({ open: false })}
        pageSizeChange={(v) => {
          const { pageNum, pageSize, contractSigner } = v;
          fetchContractList(contractSigner, pageNum, pageSize);
        }}
      />
    </>
  );
};

export default CapacityPoolVendorList;
