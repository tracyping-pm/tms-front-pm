import {
  customerFromSheet,
  customerManageSheet,
  getCustomerFromSheetData,
  getCustomerManageStatus,
  getCustomerSheetStatus,
  getRoutePriceSetting,
  getVendorFromSheetData,
  getVendorManageStatus,
  getVendorSheetStatus,
  libraryDetailCustomerPricingInfo,
  libraryDetailVendorPricingInfo,
  resetCustomerFromSheetStatus,
  resetCustomerManageStatus,
  resetVendorFromSheetStatus,
  resetVendorManageStatus,
  vendorFromSheet,
  vendorManageSheet,
} from '@/api/project';
import {
  ILibraryDetailPriceVersionInfo,
  IPriceSettingData,
  SyncFromSheetData,
} from '@/api/types/project';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { InfoItem } from '@/components/DetailHeader';
import { PATHS } from '@/constants';
import {
  LibraryManageStatusEnum,
  LibrarySheetConfirmEnum,
  LibrarySheetConfirmEnumText,
  LibrarySyncFromStatusEnum,
  ROUTE_LIBRARY_IDENTITY,
  ROUTE_LIBRARY_MODE,
  RouteLibraryModeText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useModel,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { App, Button, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import LoadingConfirmModal from '../components/LoadingConfirmModal';
import SheetCompletedModal from '../components/SheetCompletedModal';
import DistanceTable from './components/DistanceTable';
import EditLibraryInfoModal from './components/EditLibraryInfoModal';
import PriceSettingModal from './components/PriceSettingModal';
import RouteTable from './components/RouteTable';
import styles from './index.less';

export default function RouteLibraryPrice() {
  const access = useAccess();
  let syncTimer: any = null;
  let manageTimer: any = null;
  const { id: libraryId } = useParams();
  const [searchParams] = useSearchParams();
  const { initialState } = useModel('@@initialState');
  const { message, modal } = App.useApp();

  const localHrefRef = useRef<string>('');
  const countryId = initialState?.currentUser?.countryId;
  const routeMode = searchParams.get('mode') as ROUTE_LIBRARY_MODE; // byRoute or byDistance
  const identity = searchParams.get('identity') as ROUTE_LIBRARY_IDENTITY; // customer or vendor
  const versionId = searchParams.get('versionId');
  const vendorId = searchParams.get('vendorId'); // vendorId

  const [showSetting, setShowSetting] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [settingData, setSettingData] = useState<IPriceSettingData>(
    {} as IPriceSettingData,
  );
  const [refresh, setRefresh] = useState<boolean>(false);
  const [versionLoading, setVersionLoading] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] =
    useState<ILibraryDetailPriceVersionInfo>(
      {} as ILibraryDetailPriceVersionInfo,
    );
  const [showLibraryInfoModal, setShowLibraryInfoModal] =
    useState<boolean>(false);
  // sync from sheet
  const [syncFromStatus, setSyncFromStatus] =
    useState<LibrarySyncFromStatusEnum>(LibrarySyncFromStatusEnum.NORMAL); // sync from sheet状态
  const [syncFromLoading, setSyncFromLoading] = useState<boolean>(false);
  const [syncFromCompleted, setSyncFromCompleted] = useState<boolean>(false);
  const [syncFromData, setSyncFromData] = useState<SyncFromSheetData>(
    {} as SyncFromSheetData,
  );
  // manage sheet
  const [sheetManageCompleted, setSheetManageCompleted] =
    useState<boolean>(false);
  const [sheetConfirmLoading, setSheetConfirmLoading] =
    useState<LibrarySheetConfirmEnum>(LibrarySheetConfirmEnum.HIDE);
  const [sheetManageLoading, setSheetManageLoading] = useState<boolean>(false);

  const getVersionInfo = async () => {
    let res;
    setVersionLoading(true);
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
      res = await libraryDetailVendorPricingInfo(Number(versionId));
    } else {
      res = await libraryDetailCustomerPricingInfo(Number(versionId));
    }
    setVersionLoading(false);
    if (res.code === 200) {
      setVersionInfo(res.data);
    }
  };

  const openSetting = async () => {
    setFetchLoading(true);
    const res = await getRoutePriceSetting({
      id: Number(libraryId),
      customerOrVendor: identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER,
      vendorId: Number(vendorId) ?? undefined,
    });
    setFetchLoading(false);
    if (res.code === 200) {
      setSettingData(res.data);
      setShowSetting(true);
    }
  };

  // 导出轮训处理
  const startManageTimer = async () => {
    if (manageTimer) clearInterval(manageTimer);
    manageTimer = setInterval(async () => {
      let statusRes;
      if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
        statusRes = await getVendorManageStatus({
          vendorId: Number(vendorId) as number,
          routeLibraryId: Number(libraryId),
          billingMode: RouteLibraryModeText[routeMode],
        });
      } else {
        statusRes = await getCustomerManageStatus({ id: Number(libraryId) });
      }
      if (statusRes.code === 200) {
        switch (statusRes.data?.manageSheetStatus) {
          case LibraryManageStatusEnum.IMPORTING:
            setSheetManageLoading(true);
            setSheetManageCompleted(false);
            break;
          case LibraryManageStatusEnum.COMPLETED:
            setSheetConfirmLoading(LibrarySheetConfirmEnum.MANAGE);
            setSheetManageLoading(false);
            setSheetManageCompleted(true);
            localHrefRef.current = statusRes.data?.spreadsheetUrl;
            clearInterval(manageTimer);
            break;
          case LibraryManageStatusEnum.EXCEPTION:
            setSheetManageLoading(false);
            setSheetConfirmLoading(LibrarySheetConfirmEnum.EXCEPTION);
            if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
              resetVendorManageStatus({
                vendorId: Number(vendorId) as number,
                routeLibraryId: Number(libraryId),
                billingMode: RouteLibraryModeText[routeMode],
              });
            } else {
              resetCustomerManageStatus({ id: Number(libraryId) });
            }
            clearInterval(manageTimer);
            break;
        }
      }
    }, 5000);
  };
  // 初始化查询导出状态
  const getManageStatus = async () => {
    let statusRes;
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
      statusRes = await getVendorManageStatus({
        vendorId: Number(vendorId) as number,
        routeLibraryId: Number(libraryId),
        billingMode: RouteLibraryModeText[routeMode],
      });
    } else {
      statusRes = await getCustomerManageStatus({ id: Number(libraryId) });
    }
    if (statusRes.code === 200) {
      switch (statusRes.data?.manageSheetStatus) {
        case LibraryManageStatusEnum.IMPORTING:
          setSheetManageLoading(true);
          setSheetManageCompleted(false);
          startManageTimer();
          break;
        case LibraryManageStatusEnum.VERSION_CHANGED:
          setSheetManageLoading(false);
          setSheetManageCompleted(false);
          break;
        case LibraryManageStatusEnum.COMPLETED:
          setSheetManageLoading(false);
          setSheetManageCompleted(true);
          localHrefRef.current = statusRes.data?.spreadsheetUrl;
          break;
        case LibraryManageStatusEnum.EXCEPTION:
          setSheetManageLoading(false);
          setSheetManageCompleted(false);
          if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
            resetVendorManageStatus({
              vendorId: Number(vendorId) as number,
              routeLibraryId: Number(libraryId),
              billingMode: RouteLibraryModeText[routeMode],
            });
          } else {
            resetCustomerManageStatus({ id: Number(libraryId) });
          }
          break;
      }
    }
  };
  // 导出
  const manageSheet = async () => {
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR && !vendorId) {
      message.error('Please selected vendor.');
      return;
    }
    // 导出完成则跳转
    if (sheetManageCompleted && localHrefRef.current) {
      window.open(localHrefRef.current);
      return;
    }
    if (sheetManageLoading) {
      return;
    }
    setSheetManageLoading(true);
    let res;
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
      res = await vendorManageSheet({
        vendorId: Number(vendorId) as number,
        routeLibraryId: Number(libraryId),
        billingMode: RouteLibraryModeText[routeMode],
      });
    } else {
      res = await customerManageSheet({
        routeLibraryId: Number(libraryId),
        billingMode: RouteLibraryModeText[routeMode],
      });
    }
    if (res.code === 200) {
      startManageTimer();
    } else {
      setSheetManageLoading(false);
    }
  };

  // 导入轮训处理
  const startSyncFromTimer = async () => {
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = setInterval(async () => {
      let res, statusRes;
      if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
        statusRes = await getVendorSheetStatus({
          routeLibraryId: Number(libraryId),
          vendorId: Number(vendorId) as number,
          billingMode: RouteLibraryModeText[routeMode],
        });
      } else {
        statusRes = await getCustomerSheetStatus({
          id: Number(libraryId),
        });
      }
      if (statusRes.code === 200) {
        switch (statusRes.data?.syncFromSheetStatus) {
          case LibrarySyncFromStatusEnum.NORMAL:
            setSyncFromStatus(LibrarySyncFromStatusEnum.NORMAL);
            setSyncFromLoading(false);
            clearInterval(syncTimer);
            break;
          case LibrarySyncFromStatusEnum.SYNCHRONIZING:
            setSyncFromStatus(LibrarySyncFromStatusEnum.SYNCHRONIZING);
            setSyncFromLoading(true);
            break;
          case LibrarySyncFromStatusEnum.COMPLETED:
            setSyncFromStatus(LibrarySyncFromStatusEnum.COMPLETED);
            setSyncFromLoading(false);
            clearInterval(syncTimer);
            if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
              res = await getVendorFromSheetData({
                vendorId: Number(vendorId) as number,
                routeLibraryId: Number(libraryId),
                billingMode: RouteLibraryModeText[routeMode],
              });
            } else {
              res = await getCustomerFromSheetData({
                routeLibraryId: Number(libraryId),
                billingMode: RouteLibraryModeText[routeMode],
              });
            }
            if (res?.code === 200) {
              setSyncFromData(res.data);
              setRefresh(!refresh);
            }
            break;
          case LibrarySyncFromStatusEnum.UNCOMPLETED:
            setSyncFromStatus(LibrarySyncFromStatusEnum.UNCOMPLETED);
            setSyncFromLoading(false);
            clearInterval(syncTimer);
            break;
        }
      }
    }, 5000);
  };
  // 初始化查询导入状态
  const getSyncFromStatus = async () => {
    let res, statusRes;
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
      statusRes = await getVendorSheetStatus({
        routeLibraryId: Number(libraryId),
        vendorId: Number(vendorId) as number,
        billingMode: RouteLibraryModeText[routeMode],
      });
    } else {
      statusRes = await getCustomerSheetStatus({
        id: Number(libraryId),
      });
    }
    if (statusRes.code === 200) {
      switch (statusRes.data?.syncFromSheetStatus) {
        case LibrarySyncFromStatusEnum.NORMAL:
          setSyncFromStatus(LibrarySyncFromStatusEnum.NORMAL);
          setSyncFromLoading(false);
          break;
        case LibrarySyncFromStatusEnum.SYNCHRONIZING:
          setSyncFromStatus(LibrarySyncFromStatusEnum.SYNCHRONIZING);
          setSyncFromLoading(true);
          startSyncFromTimer();
          break;
        case LibrarySyncFromStatusEnum.COMPLETED:
          setSyncFromStatus(LibrarySyncFromStatusEnum.COMPLETED);
          setSyncFromLoading(false);
          if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
            res = await getVendorFromSheetData({
              vendorId: Number(vendorId) as number,
              routeLibraryId: Number(libraryId),
              billingMode: RouteLibraryModeText[routeMode],
            });
          } else {
            res = await getCustomerFromSheetData({
              routeLibraryId: Number(libraryId),
              billingMode: RouteLibraryModeText[routeMode],
            });
          }
          if (res?.code === 200) {
            setSyncFromData(res.data);
          }
          break;
        case LibrarySyncFromStatusEnum.UNCOMPLETED:
          setSyncFromStatus(LibrarySyncFromStatusEnum.UNCOMPLETED);
          setSyncFromLoading(false);
          break;
      }
    }
  };
  // 导入
  const syncFromSheet = async () => {
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR && !vendorId) {
      message.error('Please selected vendor.');
      return;
    }
    let statusRes;
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
      statusRes = await getVendorSheetStatus({
        routeLibraryId: Number(libraryId),
        vendorId: Number(vendorId) as number,
        billingMode: RouteLibraryModeText[routeMode],
      });
    } else {
      statusRes = await getCustomerSheetStatus({
        id: Number(libraryId),
      });
    }
    if (
      statusRes?.code === 200 &&
      statusRes?.data?.syncFromSheetStatus ===
        LibrarySyncFromStatusEnum.SYNCHRONIZING
    ) {
      message.error('Please wait for the current synchronization to complete');
      setSyncFromStatus(LibrarySyncFromStatusEnum.SYNCHRONIZING);
      setSyncFromLoading(true);
      startSyncFromTimer();
      return;
    }
    if (syncFromLoading) {
      return;
    }
    modal.confirm({
      title:
        'Confirm to synchronize the data of Google Drive Sheet to the system?',
      okText: 'Confirm',
      content: `After confirmation, the system will start processing the Sheet data, and no other data can be synchronized during this period. After completion, you can view the import results through the prompt chart next to the synchronization button.`,
      onOk: async () => {
        setSyncFromStatus(LibrarySyncFromStatusEnum.NORMAL);
        let res;
        if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
          res = await vendorFromSheet({
            routeLibraryId: Number(libraryId),
            vendorId: Number(vendorId) as number,
            billingMode: RouteLibraryModeText[routeMode],
          });
        } else {
          res = await customerFromSheet({
            routeLibraryId: Number(libraryId),
            billingMode: RouteLibraryModeText[routeMode],
          });
        }
        if (res.code === 200) {
          setSyncFromLoading(true);
          startSyncFromTimer();
        }
      },
      onCancel() {},
    });
  };
  // 导入结果提示
  const syncFromTips = async () => {
    if (syncFromStatus === LibrarySyncFromStatusEnum.UNCOMPLETED) {
      message.error('Data synchronization failed, please check and try again');
      let res;
      if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
        res = await resetVendorFromSheetStatus({
          vendorId: Number(vendorId) as number,
          routeLibraryId: Number(libraryId),
          billingMode: RouteLibraryModeText[routeMode],
        });
      } else {
        res = await resetCustomerFromSheetStatus({ id: Number(libraryId) });
      }
      if (res.code === 200) {
        setSyncFromStatus(LibrarySyncFromStatusEnum.NORMAL);
      }
    }
    if (syncFromStatus === LibrarySyncFromStatusEnum.COMPLETED) {
      setSyncFromCompleted(true);
    }
  };

  useEffect(() => {
    if (identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER) {
      getManageStatus();
      getSyncFromStatus();
    }
    return () => {
      // 销毁时有定时器则清除
      if (manageTimer) {
        clearInterval(manageTimer);
      }
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (manageTimer) clearInterval(manageTimer);
    if (syncTimer) clearInterval(syncTimer);
    localHrefRef.current = '';
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR && vendorId) {
      getManageStatus();
      getSyncFromStatus();
    }
  }, [vendorId]);

  useEffect(() => {
    getVersionInfo();
  }, [versionId]);

  return (
    <div>
      <BreadcrumbCase
        items={[
          { name: 'Route Libraries', path: PATHS.ROUTE_LIBRARY_LIST },
          { name: 'Details', path: PATHS.ROUTE_LIBRARY_PRICE },
        ]}
      />
      {/*header*/}
      <div className={styles.header}>
        <div className={styles.header_left} onClick={() => history.back()}>
          <Button icon={<ArrowLeftOutlined />}>Save and go back</Button>
        </div>
        <div className={styles.header_right}>
          <Access
            accessible={
              identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER
                ? access[
                    PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_SETTING
                  ]
                : access[
                    PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_SETTING
                  ]
            }
          >
            <Button
              icon={<SettingOutlined />}
              disabled={
                identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER ? false : !vendorId
              }
              loading={fetchLoading}
              onClick={openSetting}
            >
              Price Setting
            </Button>
          </Access>

          <Access
            accessible={
              identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER
                ? access[
                    PermissionEnum
                      .ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_SYNC_FROM_SHEET
                  ]
                : access[
                    PermissionEnum
                      .ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_SYNC_FROM_SHEET
                  ]
            }
          >
            <Button loading={syncFromLoading} onClick={syncFromSheet}>
              {syncFromStatus === LibrarySyncFromStatusEnum.COMPLETED ? (
                <div className={styles.header_completed}>
                  <CheckOutlined className={styles.header_completed_icon} />
                </div>
              ) : null}
              {syncFromStatus === LibrarySyncFromStatusEnum.UNCOMPLETED ? (
                <div
                  className={styles.header_completed}
                  style={{ backgroundColor: 'red' }}
                >
                  <CloseOutlined className={styles.header_completed_icon} />
                </div>
              ) : null}
              {syncFromLoading ? 'Synchronizing' : 'Sync from sheet'}
            </Button>

            {syncFromStatus === LibrarySyncFromStatusEnum.COMPLETED ||
            syncFromStatus === LibrarySyncFromStatusEnum.UNCOMPLETED ? (
              <InfoCircleOutlined
                onClick={syncFromTips}
                style={{ marginLeft: '-16px', cursor: 'pointer' }}
              />
            ) : null}
          </Access>

          <Access
            accessible={
              identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER
                ? access[
                    PermissionEnum
                      .ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_MANAGE_SHEET
                  ]
                : access[
                    PermissionEnum
                      .ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_MANAGE_SHEET
                  ]
            }
          >
            <Button onClick={manageSheet} loading={sheetManageLoading}>
              {sheetManageCompleted ? (
                <div className={styles.header_completed}>
                  <CheckOutlined className={styles.header_completed_icon} />
                </div>
              ) : null}
              {sheetManageLoading ? 'Synchronizing' : 'Manage sheet'}
            </Button>
          </Access>
        </div>
      </div>
      {/* info */}
      <Spin spinning={versionLoading}>
        <div className={styles.info}>
          <Access
            accessible={
              identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER
                ? access[
                    PermissionEnum
                      .ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_EDIT_INFO
                  ]
                : access[
                    PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_EDIT_INFO
                  ]
            }
          >
            <Button
              className={styles.info_edit}
              onClick={() => setShowLibraryInfoModal(true)}
              type="link"
            >
              <EditOutlined className={styles.header_title_icon} />
              Edit
            </Button>
          </Access>
          <InfoItem
            label={'Price Version Name'}
            name={versionInfo?.versionName ? versionInfo?.versionName : '-'}
            tag={undefined}
            popover={true}
          />
          <InfoItem
            label={'Status'}
            name={
              versionInfo?.contractStatus ? versionInfo?.contractStatus : '-'
            }
            tag={undefined}
            popover={true}
          />
          <InfoItem
            label={'Truck Type'}
            name={
              versionInfo?.truckTypeNames ? versionInfo?.truckTypeNames : '-'
            }
            tag={undefined}
            popover={true}
          />
          {identity === ROUTE_LIBRARY_IDENTITY.VENDOR ? (
            <InfoItem
              label={'Vendor'}
              name={versionInfo?.vendorName ? versionInfo?.vendorName : '-'}
              tag={undefined}
              popover={true}
            />
          ) : null}
          {identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER ? (
            <InfoItem
              label={'Customer'}
              name={versionInfo?.customerName ? versionInfo?.customerName : '-'}
              tag={undefined}
              popover={true}
            />
          ) : null}
        </div>
      </Spin>

      {/*table*/}
      <div className={styles.content}>
        {routeMode === 'byRoute' ? (
          <RouteTable
            refresh={refresh}
            routeMode={routeMode}
            libraryId={Number(libraryId)}
            countryId={countryId}
            versionId={Number(versionId)}
            identity={identity}
            vendorId={+vendorId!}
          />
        ) : (
          <DistanceTable
            refresh={refresh}
            routeMode={routeMode}
            libraryId={Number(libraryId)}
            countryId={countryId}
            versionId={Number(versionId)}
            identity={identity}
            vendorId={+vendorId!}
          />
        )}
      </div>
      {showSetting ? (
        <PriceSettingModal
          identity={identity}
          selectedVendor={Number(vendorId)}
          settingData={settingData}
          hideModal={() => setShowSetting(false)}
        />
      ) : null}
      {syncFromCompleted ? (
        <SheetCompletedModal
          versionData={syncFromData}
          confirm={() => setSyncFromCompleted(false)}
        />
      ) : null}
      {!!sheetConfirmLoading ? (
        <LoadingConfirmModal
          hideModal={() => setSheetConfirmLoading(LibrarySheetConfirmEnum.HIDE)}
          title={LibrarySheetConfirmEnumText[sheetConfirmLoading][0]}
          content={LibrarySheetConfirmEnumText[sheetConfirmLoading][1]}
          confirmText={LibrarySheetConfirmEnumText[sheetConfirmLoading][2]}
          confirm={() => {
            if (sheetConfirmLoading === LibrarySheetConfirmEnum.MANAGE) {
              if (localHrefRef.current) {
                setSheetConfirmLoading(LibrarySheetConfirmEnum.HIDE);
                window.open(localHrefRef.current);
              }
            } else {
              setSheetConfirmLoading(LibrarySheetConfirmEnum.HIDE);
            }
          }}
        />
      ) : null}
      {showLibraryInfoModal ? (
        <EditLibraryInfoModal
          identity={identity}
          versionId={Number(versionId)}
          defaultData={versionInfo}
          callBack={() => {
            getManageStatus();
            getSyncFromStatus();
          }}
          hideModal={() => {
            setShowLibraryInfoModal(false);
            getVersionInfo();
          }}
        />
      ) : null}
    </div>
  );
}
