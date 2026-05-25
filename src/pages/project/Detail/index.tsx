import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  getAllWaybillExport,
  getCheckExportNumber,
  getWaybillExport,
} from '@/api/waybill';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTabs from '@/components/CustomTabs';
import { LAYOUT_HEADER_HEIGHT, PATHS, PROJECT_TAB_LIST } from '@/constants';
import {
  CapacityPoolDetailTabsUsePlaceEnum,
  ContractTypeEnum,
  GetUserGuidanceEnum,
  ProjectStatusEnum,
  WaybillDispatchTypeEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import CapacityPoolDetailTabs from '@/pages/capacity-pool/components/CapacityPoolDetailTabs';
import ProjectDetailRouteLibrary from '@/pages/project/components/ProjectDetailRouteLibrary';
import ProjectDetailWaybill from '@/pages/project/components/ProjectDetailWaybill';
import CustomExportModal from '@/pages/waybill/components/CustomExportModal';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { isValidityPeriod, openNewTag } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import {
  ExclamationCircleFilled,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Access,
  useAccess,
  useModel,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Button, Space } from 'antd';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ProjectDetailBusinessDocuments from '../components/ProjectDetailBusinessDocuments';
import ProjectDetailCustomerContracts from '../components/ProjectDetailCustomerContracts';
import ProjectDetailHeader from '../components/ProjectDetailHeader';
import ProjectDetailStopPointList from '../components/ProjectDetailStopPointList';
import ProjectDetailTeamMembers from '../components/ProjectDetailTeamMembers';
import ProjectDetailVendorContracts, {
  ICreateContractModalState,
} from '../components/ProjectDetailVendorContracts';
import { OPS_TYPE, StateContext, StoreProvider } from './store';
import styles from './styles.less';

const initialCreateContractModalState: ICreateContractModalState = {
  open: false,
  confirmLoading: false,
};

const ProjectDetailMain = () => {
  const access = useAccess();
  const { id: projectId } = useParams();
  const [searchParams] = useSearchParams();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const capacityPoolId = state?.projectDetail?.data?.capacityPoolId;
  const routeLibraryId = state?.projectDetail?.data?.routeLibraryId;
  const projectName = state?.projectDetail?.data?.projectName;
  const projectStatus = state?.projectDetail?.data?.projectStatus;
  const agreedStartTime = state?.projectDetail?.data?.agreedStartTime;
  const agreedEndTime = state?.projectDetail?.data?.agreedEndTime;
  const [tabKey, setTabKey] = useState<string>(
    searchParams.get('tabKey') || '',
  );
  const [
    createCustomerContractModalState,
    setCreateCustomerContractModalState,
  ] = useSetState<ICreateContractModalState>(initialCreateContractModalState);
  const [createVendorContractModalState, setCreateVendorContractModalState] =
    useSetState<ICreateContractModalState>(initialCreateContractModalState);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addAccreditation, setAddAccreditation] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportAllLoading, setExportAllLoading] = useState<boolean>(false);
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [stopPointModal, setStopPointModal] = useState<boolean>(false);
  const [customExportOpen, setCustomExportOpen] = useState(false);
  const [tableSelect, setTableSelect] = useState<{ ids: []; options: [] }>({
    ids: [],
    options: [],
  });
  const [tableQueryParams, setTableQueryParams] = useState<any>();
  const { modal } = App.useApp();
  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);
  const playStar = useAddAnimation(playSrcRef, playTargetRef);
  const [, setUrlState] = useUrlState();

  useEffect(() => {
    playTargetRef.current = document.querySelector('.downloadCenter');
    // playTargetRef.current = document.querySelector('.exportCase');
  }, []);

  const playAnimation = () => {
    playStar(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };
  // 下载文件
  const onExportWaybill = async (ids: number[]) => {
    setExportLoading(true);
    const res = await getWaybillExport({ ids });
    setExportLoading(false);
    if (res.code === 200) {
      // playAnimation();
      doDownloadCenterAnimate();
    }
  };
  // 检查文件
  const onCheckExportWaybill = async () => {
    const waybillNumber = tableSelect.options;
    const ids = waybillNumber.map((i: { id: number }) => i.id);

    if (ids.length === 0) {
      message.error('Please select the waybill to be exported first');
      return;
    }
    if (ids.length > 30000) {
      message.error('The number of selected waybills must not exceed 30,000');
      return;
    }
    modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleFilled />,
      width: 500,
      content: (
        <>
          <p>
            Confirm to generate files for the currently selected
            <strong> {ids?.length}</strong> waybills
          </p>
        </>
      ),
      okText: 'Confirm',
      cancelText: 'Cancel',
      okButtonProps: {
        style: { outline: 'none' },
      },
      onOk() {
        onExportWaybill(ids);
      },
      onCancel() {
        // do nothing
      },
    });
  };
  // 下载所有文件
  const onExportAllWaybill = async (params: any) => {
    setExportAllLoading(true);
    const res = await getAllWaybillExport(params);
    setExportAllLoading(false);
    if (res.code === 200) {
      // playAnimation();
      doDownloadCenterAnimate();
    }
  };

  const onCheckExportAllWaybill = async () => {
    const {
      pageNum,
      pageSize,
      customerNameIdList,
      customerTagIdList,
      statusList,
      dispatchType,
      positionTimeStart,
      positionTimeEnd,
      unloadingCompletionTimeStart,
      unloadingCompletionTimeEnd,
      creationTimeStart,
      creationTimeEnd,
      customerCode,
      waybillId,
      truckId,
      truckTypeId,
      originPadId,
      originSadId,
      originTadId,
      destinationPadId,
      destinationSadId,
      destinationTadId,
      vendorIdList,
      destinationTimeStart,
      destinationTimeEnd,
      financialStatusList,
      originLabel,
      destinationLabel,
      driverIdList,
      logisticsCategory,
      truckTypeConsistency,
      riskLevelMin,
      riskLevelMax,
    } = tableQueryParams;
    const payload: any = {
      pageNum,
      pageSize,
      projectIdList: [projectId],
      customerNameIdList,
      customerTagIdList,
      statusList,
      dispatchType,
      positionTimeStart,
      positionTimeEnd,
      unloadingCompletionTimeStart,
      unloadingCompletionTimeEnd,
      creationTimeStart,
      creationTimeEnd,
      customerCode,
      waybillId,
      truckId,
      truckTypeId,
      originPadId,
      originSadId,
      originTadId,
      destinationPadId,
      destinationSadId,
      destinationTadId,
      vendorIdList,
      destinationTimeStart,
      destinationTimeEnd,
      financialStatusList,
      originLabel,
      destinationLabel,
      driverIdList,
      logisticsCategory,
      truckTypeConsistency,
      riskLevelMin,
      riskLevelMax,
    };
    const res = await getCheckExportNumber(payload);
    if (res.code === 200) {
      const { data } = res;
      if (data === 0) {
        message.error('The number of waybills on the current page is 0');
        return;
      }
      if (data > 30000) {
        message.error('The number of waybills must not exceed 30,000');
        return;
      }
      modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleFilled />,
        width: 500,
        content: (
          <>
            <p>
              Confirm to generate files for the currently selected
              <strong> {data}</strong> waybills
            </p>
          </>
        ),
        okText: 'Confirm',
        cancelText: 'Cancel',
        okButtonProps: {
          style: { outline: 'none' },
        },
        onOk() {
          onExportAllWaybill(payload);
        },
        onCancel() {
          // do nothing
        },
      });
    }
  };

  // 校验项目是否在有效期
  const isTimeValidityPeriod = useCallback(() => {
    return isValidityPeriod(agreedStartTime, agreedEndTime);
  }, [agreedStartTime, agreedEndTime]);

  // 复制waybills
  const copy = async () => {
    if (
      !isTimeValidityPeriod() &&
      tableSelect?.options?.some(
        (item: { dispatchType: WaybillDispatchTypeEnum }) =>
          item.dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
      )
    ) {
      message.error(
        'Copy failed, only temporary waybills are allowed to be created in non-valid project',
      );
      return;
    }

    if (!tableSelect?.ids?.length) {
      message.error('Please select the waybill you want to copy');
    } else {
      setShowCopyModal(true);
    }
  };

  const guidanceUpdateHandle = async () => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  // 获取选择数据
  const getSelectItem = (values: { ids: []; options: [] }) => {
    setTableSelect(values);
  };

  const onMenuClick = () => {
    setCustomExportOpen(true);
  };

  // tab额外按钮
  const TabBarExtraContent = memo((props: { tabKey: string }) => {
    const { tabKey: activeTab } = props;
    switch (activeTab) {
      case PROJECT_TAB_LIST.WAYBILLS:
        return (
          <>
            <Access
              key="export"
              accessible={access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_EXPORT]}
            >
              <Space.Compact>
                <Button
                  key="export"
                  type="link"
                  loading={exportLoading}
                  onClick={() => {
                    if (completedGuidance) {
                      onCheckExportWaybill();
                    } else {
                      playAnimation();
                      guidanceUpdateHandle();
                      setTimeout(() => {
                        onCheckExportWaybill();
                      }, 3000);
                    }
                  }}
                  ref={playSrcRef}
                  className={styles.linkBtn}
                >
                  Export Selected Waybill
                </Button>
                <Button
                  type="link"
                  icon={<SettingOutlined />}
                  onClick={onMenuClick}
                />
              </Space.Compact>
            </Access>
            <Access
              key="exportAll"
              accessible={access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_EXPORT]}
            >
              <Space.Compact>
                <Button
                  key="exportAll"
                  type="link"
                  loading={exportAllLoading}
                  onClick={() => {
                    if (completedGuidance) {
                      onCheckExportAllWaybill();
                    } else {
                      playAnimation();
                      guidanceUpdateHandle();
                      setTimeout(() => {
                        onCheckExportAllWaybill();
                      }, 3000);
                    }
                  }}
                  ref={playSrcRef}
                  className={styles.linkBtn}
                >
                  Export All Waybill
                </Button>{' '}
                <Button
                  type="link"
                  icon={<SettingOutlined />}
                  onClick={onMenuClick}
                />
              </Space.Compact>
            </Access>
            <Access
              key="Copy Dispatch"
              accessible={access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_COPY]}
            >
              {projectStatus === ProjectStatusEnum.INPROGRESS ? (
                // <Popover
                //   content={
                //     isTimeValidityPeriod()
                //       ? ''
                //       : 'projects is not within the validity period'
                //   }
                //   placement="top"
                // >
                <Button
                  key="Copy Dispatch"
                  type="link"
                  onClick={() => {
                    copy();
                  }}
                  className={styles.linkBtn}
                  // disabled={!isTimeValidityPeriod()}
                >
                  Copy Waybill
                </Button>
              ) : // </Popover>
              null}
            </Access>
          </>
        );
      case PROJECT_TAB_LIST.BUSINESS_DOCUMENTS:
        return (
          <Access
            key="materialType"
            accessible={
              access[PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS_EDIT]
            }
          >
            <div
              className={styles.addContact}
              onClick={() => setAddAccreditation(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Material Type
            </div>
          </Access>
        );
      case PROJECT_TAB_LIST.CAPACITY_POOL:
        return (
          <div className={styles.tabBarExtraContent}>
            {capacityPoolId ? (
              <Access
                accessible={
                  access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL_DETAIL]
                }
              >
                <CustomStatusButton
                  noStyle
                  onClick={() =>
                    openNewTag(
                      `${PATHS.CAPACITY_DETAIL}/${capacityPoolId}?type=blank`,
                    )
                  }
                >
                  Pool Detail
                </CustomStatusButton>
              </Access>
            ) : (
              <Access
                accessible={
                  access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL_CREATE]
                }
              >
                <CustomStatusButton
                  noStyle
                  onClick={() => {
                    dispatch({
                      type: OPS_TYPE.CREATE_POOL_MODAL,
                      payload: {
                        open: true,
                      },
                    });
                  }}
                >
                  Create Pool
                </CustomStatusButton>
              </Access>
            )}
          </div>
        );
      case PROJECT_TAB_LIST.STOP_POINTS:
        return (
          <Access
            accessible={access[PermissionEnum.PROJECT_DETAIL_STOP_POINT_CREATE]}
          >
            <div
              key="addStopPoints"
              className={styles.addContact}
              onClick={() => setStopPointModal(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Stop Points
            </div>
          </Access>
        );
      case PROJECT_TAB_LIST.ROUTE_LIBRARY:
        return (
          <div style={{ display: 'flex', gap: '24px' }}>
            <Access
              accessible={
                access[PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY_CREATE]
              }
            >
              {!routeLibraryId && projectName ? (
                <CustomStatusButton
                  noStyle
                  onClick={() => {
                    if (projectStatus !== ProjectStatusEnum.PREPARING) {
                      message.warning(
                        'The selected project status must be Preparing',
                      );
                    } else {
                      setShowAddModal(true);
                    }
                  }}
                >
                  Create Library
                </CustomStatusButton>
              ) : null}
            </Access>

            <Access
              accessible={
                access[PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY_DETAILS]
              }
            >
              {!!routeLibraryId ? (
                <CustomStatusButton
                  noStyle
                  onClick={() =>
                    openNewTag(
                      `${PATHS.ROUTE_LIBRARY_DETAIL}/${routeLibraryId}?type=blank`,
                    )
                  }
                >
                  Library Details
                </CustomStatusButton>
              ) : null}
            </Access>
          </div>
        );
      case PROJECT_TAB_LIST.CUSTOMER_CONTRACTS:
        return (
          <Access
            accessible={
              access[PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_CREATE]
            }
          >
            <div
              key="customerContracts"
              className={styles.addContact}
              onClick={() =>
                setCreateCustomerContractModalState({ open: true })
              }
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Customer Contract
            </div>
          </Access>
        );
      case PROJECT_TAB_LIST.VENDOR_CONTRACTS:
        return (
          <Access
            accessible={
              access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_CREATE]
            }
          >
            <div
              key="vendorContracts"
              className={styles.addContact}
              onClick={() => setCreateVendorContractModalState({ open: true })}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Vendor Contract
            </div>
          </Access>
        );
      default:
        return null;
    }
  });

  const tabItems = useMemo(() => {
    if (projectStatus) {
      const list = [
        access[PermissionEnum.PROJECT_DETAIL_WAYBILLS]
          ? {
              key: 'waybills',
              label: 'Waybills',
              children: (
                <ProjectDetailWaybill
                  selectedRowKeys={tableSelect?.ids}
                  getSelectTableItem={(items) => {
                    getSelectItem(items);
                  }}
                  getQuerys={(query) => {
                    setTableQueryParams(query);
                  }}
                  setShowCopyModalHandle={() => {
                    setShowCopyModal(false);
                  }}
                  showCopyModal={showCopyModal}
                  projectStatus={projectStatus}
                  projectName={projectName}
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS]
          ? {
              key: 'businessDocuments',
              label: 'Business Documents',
              children: (
                <ProjectDetailBusinessDocuments
                  showModal={addAccreditation}
                  setShowModal={setAddAccreditation}
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY]
          ? {
              key: 'routeLibrary',
              label: 'Route Library',
              children: (
                <ProjectDetailRouteLibrary
                  projectName={projectName}
                  showAddModal={showAddModal}
                  setShowAddModal={setShowAddModal}
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL]
          ? {
              key: 'capacityPool',
              label: 'Capacity Pool',
              children: (
                <CapacityPoolDetailTabs
                  projectId={+projectId!}
                  capacityPoolId={capacityPoolId}
                  capacityPoolSource={
                    CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS
                  }
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_STOP_POINTS]
          ? {
              key: 'stopPoints',
              label: 'Stop Points',
              children: (
                <ProjectDetailStopPointList
                  showModal={stopPointModal}
                  setShowModal={(b) => {
                    setStopPointModal(b);
                  }}
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS]
          ? {
              key: ContractTypeEnum.CUSTOMER,
              label: 'Customer Contracts',
              children: (
                <ProjectDetailCustomerContracts
                  tabKey={tabKey}
                  createContractModalState={createCustomerContractModalState}
                  setCreateContractModalState={(value) => {
                    setCreateCustomerContractModalState(value);
                  }}
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS]
          ? {
              key: ContractTypeEnum.VENDOR,
              label: 'Vendor Contracts',
              children: (
                <ProjectDetailVendorContracts
                  tabKey={tabKey}
                  createContractModalState={createVendorContractModalState}
                  setCreateContractModalState={(value) => {
                    setCreateVendorContractModalState(value);
                  }}
                />
              ),
            }
          : null,
        access[PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS]
          ? {
              key: 'teamMembers',
              label: 'Team Members',
              children: <ProjectDetailTeamMembers />,
            }
          : null,
      ].filter(Boolean);
      if (
        ![
          ProjectStatusEnum.INPROGRESS,
          ProjectStatusEnum.COMPLETED,
          ProjectStatusEnum.TERMINATED,
        ].includes(projectStatus) &&
        access[PermissionEnum.PROJECT_DETAIL_WAYBILLS]
      ) {
        const newList = list.filter((l) => l?.key !== 'waybills');
        if (!tabKey) {
          // @ts-ignore
          setTabKey(newList?.[0]?.key);
        }
        return newList;
      } else {
        if (!tabKey) {
          // @ts-ignore
          setTabKey(list?.[0]?.key);
        }
        return list;
      }
    } else {
      return [];
    }
  }, [
    tabKey,
    projectStatus,
    projectName,
    showAddModal,
    addAccreditation,
    tableSelect,
    showCopyModal,
    stopPointModal,
    createCustomerContractModalState,
    createVendorContractModalState,
  ]);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Projects', path: PATHS.PROJECT_LIST },
          { name: 'Projects Detail', path: PATHS.PROJECT_DETAIL_BASE },
        ]}
      />
      {/*top info*/}
      <ProjectDetailHeader />
      {/*tabs list*/}
      <Access
        accessible={
          access[PermissionEnum.PROJECT_DETAIL_WAYBILLS] ||
          access[PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS] ||
          access[PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY] ||
          access[PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL]
        }
      >
        <div className={styles.content}>
          <CustomTabs
            activeKey={tabKey}
            tabBarGutter={60}
            items={tabItems as any[]}
            size="large"
            onChange={(key: string) => {
              setTabKey(key);
              setUrlState({ extra: undefined });
            }}
            tabBarExtraContent={<TabBarExtraContent tabKey={tabKey} />}
            useSticky
            offsetTop={LAYOUT_HEADER_HEIGHT + 82}
          />
        </div>
      </Access>

      {customExportOpen ? (
        <CustomExportModal
          open={customExportOpen}
          onCancel={() => {
            setCustomExportOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

const ProjectDetail = () => {
  return (
    <StoreProvider>
      <ProjectDetailMain />
    </StoreProvider>
  );
};

export default ProjectDetail;
