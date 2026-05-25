import { DEFAULT_PAGINATION } from '@/constants';
import { GetUserGuidanceEnum } from '@/enums';
import { useModel } from '@umijs/max';

import cls from 'classnames';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  faTransportationCancel,
  faTransportationCollect,
  faTransportationExport,
  faTransportationList,
} from '@/api/tool';
import { IFaTransportationListParams } from '@/api/types/tool';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { Alert, App, Button, Popconfirm, Space, Spin } from 'antd';
import Header from './components/Header';
import ImportModal from './components/ImportModal';
import TransportationTable from './components/Table';
import styles from './index.less';

const Transportation: FC = () => {
  // const access = useAccess();
  const { modal } = App.useApp();

  const { initialState: userInfo, setInitialState: setUserInfo } =
    useModel('@@initialState');
  const completedGuidance =
    userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;

  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [collectedLoading, setCollectedLoading] = useState<boolean>(false);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [exportSelectedLoading, setExportSelectedLoading] =
    useState<boolean>(false);

  const [selectData, setSelectData] = useState<{ ids: number[] }>();
  const filterDataRef = useRef<any>(null);
  // 用户引导
  const downloadRef = useRef<any>(null);
  const exportRef = useRef<any>(null);
  const animation = useAddAnimation(exportRef, downloadRef);
  const playAnimation = () => {
    animation(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const guidanceUpdateHandle = async () => {
    await setUserInfo((s) => ({
      ...s,
      currentUser: {
        ...userInfo?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const doDownload = useCallback(async () => {
    setExportSelectedLoading(true);
    const res = await faTransportationExport(filterDataRef.current).finally(
      () => {
        setExportSelectedLoading(false);
      },
    );
    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  }, [filterDataRef.current]);

  const onExportSelectedRecords = useCallback(() => {
    if (completedGuidance) {
      doDownload();
    } else {
      playAnimation();
      guidanceUpdateHandle();
      setTimeout(() => {
        doDownload();
      }, 3000);
    }
  }, [completedGuidance]);

  const fetchData = async (payload: IFaTransportationListParams) => {
    setLoading(true);
    const res = await faTransportationList(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onSearch = (v?: IFaTransportationListParams) => {
    const payload = v
      ? {
          ...filterDataRef.current,
          ...v,
          pageNum: 1,
        }
      : {
          pageNum: 1,
          pageSize: 20,
        };
    filterDataRef.current = payload;
    fetchData(payload);
  };

  const onPaginationHandle = (v: any) => {
    const payload = {
      ...filterDataRef.current,
      ...v,
    };
    filterDataRef.current.pageSize = v?.pageSize;
    fetchData(payload);
  };

  const onImportRecords = () => {
    setImportModalOpen(true);
  };

  const onGetSelectedData = (v: any) => {
    setSelectData(v);
  };

  const onBatchCollection = async () => {
    setCollectedLoading(true);

    const payload = {
      ids: selectData?.ids ?? [],
    };
    const res = await faTransportationCollect(payload).finally(() => {
      setCollectedLoading(false);
      setSelectData(undefined);
    });
    if (res.code === 200) {
      modal.success({
        title: 'Batch Collected(G) Result',
        content: `Collected successfully ${res.data} data.`,
        okText: 'OK',
      });
      onPaginationHandle?.({
        pageNum: originData.pageNum!,
        pageSize: originData.pageSize!,
      });
    }
  };

  const onBatchCancel = async () => {
    setCancelLoading(true);
    const payload = {
      ids: selectData?.ids ?? [],
    };
    const res = await faTransportationCancel(payload).finally(() => {
      setCancelLoading(false);
      setSelectData(undefined);
    });
    if (res.code === 200) {
      modal.success({
        title: 'Batch Cancel(G) Result',
        content: `Cancel successfully ${res.data} data.`,
        okText: 'OK',
      });

      onPaginationHandle?.({
        pageNum: originData.pageNum!,
        pageSize: originData.pageSize!,
      });
    }
  };

  useEffect(() => {
    onSearch();
  }, []);

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <Spin spinning={loading}>
      <div className={cls('fa-transportation', styles.faTransportation)}>
        <Header onSearchHandle={onSearch} />
        {collectedLoading || cancelLoading ? (
          <Alert
            banner
            message="Sorry! While batch processing is in progress, page actions are disabled. But you can still use the search feature."
          />
        ) : null}
        <div className={styles.topOperate}>
          <Space size="small">
            <Button
              type="primary"
              onClick={onImportRecords}
              disabled={collectedLoading || cancelLoading}
            >
              Import Records
            </Button>

            <Button
              ref={exportRef}
              type="primary"
              loading={exportSelectedLoading}
              onClick={onExportSelectedRecords}
              disabled={collectedLoading || cancelLoading}
            >
              Export Selected Records
            </Button>
          </Space>
          <Space size="small">
            <Button
              disabled={
                !selectData?.ids?.length || collectedLoading || cancelLoading
              }
              loading={collectedLoading}
              onClick={() => {
                onBatchCollection();
              }}
            >
              Collected
            </Button>
            <Popconfirm
              title="Do you want to invalidate the data?"
              onConfirm={() => {
                onBatchCancel();
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                disabled={
                  !selectData?.ids?.length || collectedLoading || cancelLoading
                }
                loading={cancelLoading}
              >
                Cancel
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <TransportationTable
          originData={originData}
          onPaginationHandle={onPaginationHandle}
          batchOperateStatus={collectedLoading || cancelLoading}
          onGetSelectedHandle={(v) => {
            onGetSelectedData(v);
          }}
        />
      </div>

      <ImportModal
        open={importModalOpen}
        modalProps={{
          onCancel: () => {
            setImportModalOpen(false);
          },
        }}
        refresh={() => {
          fetchData?.({
            pageNum: 1,
            pageSize: 20,
          });
        }}
      />
    </Spin>
  );
};

export default Transportation;
