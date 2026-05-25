import {
  approveRevokeLibraryRoute,
  approveRevokeList,
  batchDeleteList,
  checkDeleteList,
  deleteLibraryRoute,
  getLibraryRouteList,
} from '@/api/project';
import {
  IAddChangeLibraryRouteParams,
  ILibraryRouteListItem,
  ILibraryRouteListParams,
} from '@/api/types/project';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { IconDelete, IconEdit } from '@/components/OperationIcon';
import RegionSelect from '@/components/RegionSelect';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  MAX_LENGTH,
  ROUTE_LIBRARY_DETAIL_TABS,
} from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  AccessStatusEnum,
  AccessStatusEnumText,
  AccessStatusEnumTextColor,
  FieldQueryHighlightTypeEnum,
  LIBRARY_ROUTE_STATUS,
  LibraryRouteStatusEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  OPS_TYPE,
  StateContext,
} from '@/pages/project/RouteLibraryDetail/store';
import RouteModal from '@/pages/project/components/RouteModal';
import styles from '@/pages/vendor/components/VendorDetailProjects/styles.less';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Access, useAccess, useParams } from '@umijs/max';
import { App, Badge, Button, Form } from 'antd';
import {
  Key,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ReactComponent as ListOptionsApprove } from '../../../../../public/svg/list_options_approve.svg';
import { ReactComponent as ListOptionsRevoke } from '../../../../../public/svg/list_options_revoke.svg';

export default function RouteLibraryDetailTable(props: {
  tabKey?: ROUTE_LIBRARY_DETAIL_TABS;
}) {
  const access = useAccess();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { message, modal } = App.useApp();
  const { id: libraryId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [originData, setOriginData] =
    useState<PaginationResponse<ILibraryRouteListItem>>(DEFAULT_PAGINATION);
  const actionRef = useRef<ActionType>();
  const filterFormRef = useRef<ProFormInstance>();
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [routeFormDefaultValue, setRouteFormDefaultValue] =
    useState<IAddChangeLibraryRouteParams>({} as IAddChangeLibraryRouteParams);
  const queryRef = useRef<any>({});
  console.log(props);

  const {
    options: routeCodeOptions,
    onSearch: routeCodeSearch,
    defaultFieldProps: routeCodeDefaultFieldProps,
  } = useFieldQuery({
    field: 'routeCode',
    esDtoClass: ES_DTO_CLASS.ROUTE,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
    projectId: state?.libraryDetail?.projectId,
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [state.routeRefresh]);

  const getDataSource = async (params: ILibraryRouteListParams) => {
    const values = filterFormRef.current?.getFieldsValue();
    let payload = {
      id: Number(libraryId),
      pageNum: Number(params.current),
      pageSize: params.pageSize,
      originPad: queryRef.current?.originPad ?? undefined,
      originSad: queryRef.current?.originSad ?? undefined,
      originTad: queryRef.current?.originTad ?? undefined,
      originLabel: values?.originLabel ? values?.originLabel : undefined,
      destinationPad: queryRef.current?.destinationPad ?? undefined,
      destinationSad: queryRef.current?.destinationSad ?? undefined,
      destinationTad: queryRef.current?.destinationTad ?? undefined,
      destinationLabel: values?.destinationLabel
        ? values?.destinationLabel
        : undefined,
      wayPoint: values?.waypoint ? values?.waypoint : undefined,
      routeId: values?.routeCode?.id ?? undefined,
      status: values?.status ?? undefined,
    };
    setLoading(true);
    const res = await getLibraryRouteList(payload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data ?? []);
      dispatch({
        type: OPS_TYPE.ROUTE_LIST,
        payload: {
          data: res.data?.list ?? [],
        },
      });
    }
    return {
      data: res.data?.list ?? [],
      success: true,
      total: 0,
    };
  };

  const approveRevokeRoute = async (id: number, enable: boolean) => {
    modal.confirm({
      title: `${enable ? 'Approve ' : 'Revoke'} Confirm`,
      content: `Confirm to ${enable ? 'approve ' : 'revoke'} this route?`,
      okText: 'Confirm',
      okButtonProps: {
        style: { outline: 'none' },
      },
      onOk: async () => {
        const change = await approveRevokeLibraryRoute({
          id,
          enable,
        });
        if (change.code === 200) {
          actionRef.current?.reload();
          dispatch({
            type: OPS_TYPE.HEADER_REFRESH,
            payload: {
              data: !state.headerRefresh,
            },
          });
          message.success(`${enable ? 'Approve' : 'Revoke'} successfully!`);
        }
      },
    });
  };

  const deleteRoute = async (id: number) => {
    modal.confirm({
      title: 'Delete Confirm',
      content: `Confirm to delete the route and the corresponding Pricing Standard`,
      okText: 'Confirm',
      okButtonProps: {
        style: { outline: 'none' },
      },
      onOk: async () => {
        const change = await deleteLibraryRoute({
          id,
        });
        if (change.code === 200) {
          actionRef.current?.reload();
          dispatch({
            type: OPS_TYPE.HEADER_REFRESH,
            payload: {
              data: !state.headerRefresh,
            },
          });
          message.success(`Delete successfully!`);
        }
      },
    });
  };

  const onRegionChange = (type: 'origin' | 'destination', values: any) => {
    const padId = `${type}Pad`;
    const sadId = `${type}Sad`;
    const tadId = `${type}Tad`;
    if (values) {
      queryRef.current = {
        ...queryRef.current,
        [padId]: values?.padId,
        [sadId]: values?.sadId,
        [tadId]: values?.tadId,
      };
    } else {
      queryRef.current = {
        ...queryRef.current,
        [padId]: undefined,
        [sadId]: values?.sadId,
        [tadId]: values?.tadId,
      };
    }
  };

  const search = () => {
    actionRef?.current?.reloadAndRest?.();
  };

  const resetTable = () => {
    queryRef.current = {};
    filterFormRef.current?.resetFields();
    actionRef?.current?.reloadAndRest?.();
  };

  const batchApprove = (enable: boolean) => {
    if (selectedKeys.length === 0) {
      message.warning('Please select at least one route');
    } else {
      modal.confirm({
        title: `${enable ? 'Approve ' : 'Revoke'} Confirm`,
        content: `Confirm that you want to ${
          enable ? 'Approve ' : 'Revoke'
        } the selected route`,
        okText: 'Confirm',
        onOk: async () => {
          const res = await approveRevokeList({
            ids: selectedKeys,
            enable: enable,
          });
          if (res.code === 200) {
            actionRef.current?.reload();
            dispatch({
              type: OPS_TYPE.HEADER_REFRESH,
              payload: {
                data: !state.headerRefresh,
              },
            });
            setSelectedKeys([]);
            message.success(`${enable ? 'Approve ' : 'Revoke'} successfully!`);
          }
        },
      });
    }
  };

  const batchDelete = async () => {
    if (selectedKeys.length === 0) {
      message.warning('Please select at least one route');
    } else {
      const check = await checkDeleteList({ ids: selectedKeys });
      if (check.data) {
        modal.confirm({
          title: `Delete Confirm`,
          content: `Confirm that you want to delete the selected route`,
          okText: 'Confirm',
          onOk: async () => {
            const res = await batchDeleteList({
              ids: selectedKeys,
            });
            if (res.code === 200) {
              actionRef.current?.reload();
              dispatch({
                type: OPS_TYPE.HEADER_REFRESH,
                payload: {
                  data: !state.headerRefresh,
                },
              });
              setSelectedKeys([]);
              message.success(`Delete successfully!`);
            }
          },
        });
      } else {
        modal.confirm({
          title: `Delete Confirm`,
          content: `The selected route is in use and cannot be deleted.`,
          okText: 'Confirm',
          okButtonProps: {
            style: { outline: 'none' },
          },
        });
      }
    }
  };

  const doNotify = useCallback(() => {
    modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: 'Confirm',
      content:
        'The address triggers Region library update, please close this pop-up window and add it again.',
      okText: 'Close and add again',
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
      onOk() {
        setShowRouteModal(false);
        // 关闭后立马打开
        setTimeout(() => {
          setShowRouteModal(true);
        }, 0);
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Origin',
      ellipsis: true,
      dataIndex: 'origin',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip key={`origin${record.createdAt}`} title={record.origin}>
          <span className={styles.commonText}>{record.origin}</span>
        </CustomTooltip>
      ),
      width: 350,
    },
    {
      title: 'Origin Label',
      ellipsis: true,
      dataIndex: 'originLabel',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`originLabel${record.createdAt}`}
          title={record.originLabel}
        >
          <span className={styles.commonText}>{record.originLabel}</span>
        </CustomTooltip>
      ),
      width: 300,
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`destination${record.createdAt}`}
          title={record.destination}
        >
          <div className={styles.commonText}>{record.destination}</div>
        </CustomTooltip>
      ),
      width: 350,
    },
    {
      title: 'Destination Label',
      ellipsis: true,
      dataIndex: 'destinationLabel',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`destinationLabel${record.createdAt}`}
          title={record.destinationLabel}
        >
          <span className={styles.commonText}>{record.destinationLabel}</span>
        </CustomTooltip>
      ),
      width: 300,
    },
    {
      title: 'Waypoint',
      dataIndex: 'wayPoint',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`wayPoint${record.createdAt}`}
          title={record.wayPoint}
        >
          <div className={styles.commonText}>{record.wayPoint}</div>
        </CustomTooltip>
      ),
      width: 300,
    },
    {
      title: 'RouteCode',
      dataIndex: 'routeCode',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`routeCode${record.createdAt}`}
          title={record.routeCode}
        >
          <div className={styles.commonText}>{record.routeCode}</div>
        </CustomTooltip>
      ),
      width: 200,
    },
    {
      title: 'Access Status',
      dataIndex: 'status',
      hideInSearch: true,
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
      width: 200,
    },
    {
      title: 'Operate',
      valueType: 'option',
      hideInTable:
        !access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_EDIT] &&
        !access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE] &&
        !access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE],
      key: 'id',
      width: 150,
      fixed: 'right',
      render: (_, record: ILibraryRouteListItem) => (
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
            boxSizing: 'border-box',
          }}
        >
          <Access
            key="edit"
            accessible={access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_EDIT]}
          >
            <div
              onClick={() => {
                setRouteFormDefaultValue({
                  id: record.id,
                  routeLibraryId: Number(libraryId),
                  originPad: record.originPad,
                  originSad: record.originSad,
                  originTad: record.originTad,
                  originAddress: record.originAddress,
                  originLat: record.originLat,
                  originLng: record.originLng,
                  wayPoint: record.wayPoint,
                  originLabel: record.originLabel,
                  destinationPad: record.destinationPad,
                  destinationSad: record.destinationSad,
                  destinationTad: record.destinationTad,
                  destinationAddress: record.destinationAddress,
                  destinationLat: record.destinationLat,
                  destinationLng: record.destinationLng,
                  destinationLabel: record.destinationLabel,
                  routeCode: record.routeCode,
                });
                setShowRouteModal(true);
              }}
            >
              {/* <ListOptionsEdit /> */}
              <IconEdit style={{ color: '#009688' }}></IconEdit>
            </div>
          </Access>
          <Access
            key="approve"
            accessible={
              access[
                PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE
              ]
            }
          >
            <CustomTooltip
              title={`${
                record.status === LibraryRouteStatusEnum.APPROVED
                  ? 'Revoke'
                  : 'Approve '
              }`}
              placement="top"
            >
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  approveRevokeRoute(
                    record.id,
                    record.status === LibraryRouteStatusEnum?.APPROVED
                      ? false
                      : true,
                  );
                }}
              >
                {record.status === LibraryRouteStatusEnum.APPROVED ? (
                  <ListOptionsRevoke />
                ) : (
                  <ListOptionsApprove />
                )}
              </div>
            </CustomTooltip>
          </Access>
          <Access
            key="delete"
            accessible={
              access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE]
            }
          >
            <IconDelete
              onClick={() => deleteRoute(record.id)}
              style={{ color: '#ff4d4f' }}
            ></IconDelete>
          </Access>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        paddingTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        // padding: '24px 0 0',
        minHeight: '400px',
        backgroundColor: '#fff',
      }}
    >
      <ProForm
        name="RouteLibraryDetailTableForm"
        submitter={false}
        formRef={filterFormRef}
      >
        <div className={styles.listForm}>
          <Form.Item name="origin">
            <RegionSelect
              width={DEFAULT_WIDTH}
              noAllRegion={true}
              showAddress={false}
              placeholder="Origin Region"
              onChange={(values) => onRegionChange('origin', values)}
            />
          </Form.Item>
          <ProFormText
            name={'originLabel'}
            style={{ width: `${DEFAULT_WIDTH}px` }}
            placeholder={'Origin Label'}
            fieldProps={{
              style: { width: `${DEFAULT_WIDTH}px` },
            }}
            rules={[
              {
                max: MAX_LENGTH.MAX_1000,
                message: `Origin label cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
              },
            ]}
          />
          <Form.Item name="destination">
            <RegionSelect
              width={DEFAULT_WIDTH}
              noAllRegion={false}
              showAddress={false}
              placeholder="Destination Region"
              onChange={(values) => onRegionChange('destination', values)}
            />
          </Form.Item>
          <ProFormText
            name={'destinationLabel'}
            style={{ width: `${DEFAULT_WIDTH}px` }}
            placeholder={'Destination Label'}
            fieldProps={{
              style: { width: `${DEFAULT_WIDTH}px` },
            }}
            rules={[
              {
                max: MAX_LENGTH.MAX_1000,
                message: `Destination label cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
              },
            ]}
          />
          <ProFormText
            name={'waypoint'}
            fieldProps={{
              style: { width: `${DEFAULT_WIDTH}px` },
            }}
            placeholder={'Waypoint'}
            rules={[
              {
                max: MAX_LENGTH.ADDRESS,
                message: `Waypoint cannot exceed ${MAX_LENGTH.ADDRESS} characters`,
              },
            ]}
          />
          <ProFormSelect
            name={'routeCode'}
            style={{ width: `${DEFAULT_WIDTH}px` }}
            placeholder={'Route Code'}
            valuePropName="routeCodeName"
            fieldProps={{
              ...routeCodeDefaultFieldProps,
              onSearch: routeCodeSearch,
              options: routeCodeOptions,
            }}
          />
          <ProFormSelect
            name={'status'}
            style={{ width: `${DEFAULT_WIDTH}px` }}
            label={null}
            placeholder={'All Status'}
            options={LIBRARY_ROUTE_STATUS}
          />
          <Button type="primary" onClick={search}>
            Search
          </Button>
          <Button onClick={resetTable}>Reset</Button>
        </div>
      </ProForm>
      {(access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE] ||
        access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE]) && (
        <div className={styles.operateBtn}>
          <Access
            key="batch-approve"
            accessible={
              access[
                PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE
              ]
            }
          >
            <Button type="primary" onClick={() => batchApprove(true)}>
              Approve
            </Button>
          </Access>
          <Access
            key="batch-delete"
            accessible={
              access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE]
            }
          >
            <Button onClick={batchDelete}>Delete</Button>
          </Access>
          <Access
            key="batch-revoke"
            accessible={
              access[
                PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE
              ]
            }
          >
            <Button onClick={() => batchApprove(false)}>Revoke</Button>
          </Access>
        </div>
      )}
      <CustomTable
        columns={columns}
        headerTitle={null}
        actionRef={actionRef}
        loading={loading}
        scroll={{ x: 1400 }}
        scrollOffsetY={548}
        // @ts-ignore
        request={async (params: ILibraryRouteListParams) =>
          getDataSource(params)
        }
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
        }}
        rowSelection={
          access[
            PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE
          ] || access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE]
            ? {
                selectedRowKeys: selectedKeys,
                onSelect: (record: any, selected: boolean) => {
                  const copyKeys = selectedKeys.slice();
                  if (selected) {
                    if (!copyKeys.includes(record.id)) {
                      setSelectedKeys([...copyKeys, record.id]);
                    }
                  } else {
                    if (copyKeys.includes(record.id)) {
                      const findIndex = copyKeys.findIndex(
                        (item) => item === record.id,
                      );
                      copyKeys.splice(findIndex, 1);
                      setSelectedKeys(copyKeys);
                    }
                  }
                },
                onSelectAll: (
                  selected: boolean,
                  selectedRows: any,
                  changeRows: any,
                ) => {
                  const copyKeys = selectedKeys.slice();
                  if (selected) {
                    changeRows.forEach((item: any) => {
                      if (!copyKeys.includes(item.id)) {
                        copyKeys.push(item.id);
                      }
                    });
                    setSelectedKeys(copyKeys);
                  } else {
                    changeRows.forEach((item: any) => {
                      if (copyKeys.includes(item.id)) {
                        const findIndex = copyKeys.findIndex(
                          (key) => key === item.id,
                        );
                        copyKeys.splice(findIndex, 1);
                      }
                    });
                    setSelectedKeys(copyKeys);
                  }
                },
              }
            : false
        }
        search={false}
        toolBarRender={false}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      {showRouteModal ? (
        <RouteModal
          formDefaultValue={routeFormDefaultValue}
          hideModal={() => {
            setShowRouteModal(false);
          }}
          refresh={() => {
            actionRef?.current?.reload();
            dispatch({
              type: OPS_TYPE.HEADER_REFRESH,
              payload: {
                data: !state.headerRefresh,
              },
            });
          }}
          doNotify={doNotify}
        />
      ) : null}
    </div>
  );
}
