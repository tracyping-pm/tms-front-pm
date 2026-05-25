import { getImageSource, ISummaryListItem } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import {
  IVendorRecordListItem,
  IVendorSummaryRecord,
} from '@/api/types/vendor';
import {
  deleteVendorRecord,
  getVendorRecordList,
  vendorSummaryAdd,
  vendorSummaryDelete,
  vendorSummaryEdit,
  vendorSummaryList,
} from '@/api/vendor';
import CustomQuillModal from '@/components/CustomQuillModal';
import { formatBytes } from '@/components/CustomUpload/fileSupport';
import DetailTimeLineItem from '@/components/DetailTimeLineItem';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import {
  IMAGE_TYPE,
  initialImageState,
  RECORD_GENERATE_TYPE,
  SUMMARY_DEFAULT_EDIT_DATA,
  TOTAL_LIMIT_SIZE,
  VENDOR_TAB_LIST,
} from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import VendorRecordsModal from '@/pages/vendor/components/VendorRecordsModal';
import { useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Empty, List, Spin, Timeline } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './styles.less';

interface ISummaryModalState {
  open: boolean;
  loading: boolean;
  id: number;
  description: string;
  materialList: ICommonMaterial[];
}

const initialSummaryModalState: ISummaryModalState = {
  open: false,
  loading: false,
  id: 0,
  description: '',
  materialList: [],
  // richText:
  //   '<p><a href="https://www.baidu.com/" rel="noopener noreferrer" target="_blank">时光是根深蒂固</a></p><ol><li>树大根深的根深蒂固</li><li>收到根深蒂固</li><li>树大根深的根深蒂固</li></ol>',
};

export default memo(function CustomerDetailRecords(props: {
  tabKey: string;
  recordFresh: boolean;
  showModal?: boolean;
  setShowModal?: (b: boolean) => void;
  setShowAdd?: (b: boolean) => void;
}) {
  const access = useAccess();
  const { id: vendorId } = useParams();
  const { message } = App.useApp();
  const { tabKey, showModal, recordFresh, setShowModal, setShowAdd } = props;
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [editRecordData, setEditRecordData] =
    useState<IVendorRecordListItem | null>(null);
  const [recordsList, setRecordsList] = useState<IVendorRecordListItem[]>([]);

  const [summaryList, setSummaryList] = useState<IVendorSummaryRecord[]>([]);
  const [editSummaryData, setEditSummaryData] = useState<ISummaryListItem>(
    SUMMARY_DEFAULT_EDIT_DATA,
  );
  const [summaryModalState, setSummaryModalState] =
    useSetState<ISummaryModalState>(initialSummaryModalState);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const getList = async () => {
    setFetchLoading(true);

    if (tabKey === VENDOR_TAB_LIST.RECORDS) {
      const res = await getVendorRecordList({ id: Number(vendorId) }).finally(
        () => {
          setFetchLoading(false);
        },
      );
      if (res.code === 200) {
        setRecordsList(res.data?.followRecordList || []);
      }
    }
    if (tabKey === VENDOR_TAB_LIST.SUMMARY) {
      const res = await vendorSummaryList({ id: Number(vendorId) }).finally(
        () => {
          setFetchLoading(false);
        },
      );
      if (res?.code === 200) {
        setSummaryList(res?.data?.summaryList || []);
        if (res?.data?.summaryList?.length >= 1) {
          setShowAdd?.(false);
        } else {
          setShowAdd?.(true);
        }
      }
    }
  };

  useEffect(() => {
    getList();
  }, [recordFresh]);

  const hideModal = (option: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!setShowModal && setShowModal(option);

    if (tabKey === VENDOR_TAB_LIST.RECORDS) {
      setEditRecordData(null);
    } else if (tabKey === VENDOR_TAB_LIST.SUMMARY) {
      setSummaryModalState({
        id: 0,
        description: '',
      });
    } else {
      console.error('Unknown tab key');
    }
  };

  // 删除操作
  const recordDeleteClick = async (item: IVendorRecordListItem) => {
    const res = await deleteVendorRecord({
      vendorId: Number(vendorId),
      followRecordId: Number(item.followRecordId),
      generateType: item.generateType,
      deletedFileIdList: item.materialList?.map(
        (subItem) => subItem?.fileMaterialId,
      ),
    });
    if (res.code === 200) {
      message.success('Delete successfully!');
      getList();
    }
  };

  // 编辑操作
  const recordEditClick = (recordData: IVendorRecordListItem) => {
    setEditRecordData({
      description: recordData.description,
      followTime: recordData.followTime,
      followRecordId: recordData.followRecordId,
      generateType: recordData.generateType,
      materialList: recordData.materialList,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!setShowModal && setShowModal(true);
  };

  const summaryDeleteClick = async (summaryData: IVendorSummaryRecord) => {
    const res = await vendorSummaryDelete({
      vendorId: Number(vendorId),
      vendorSummaryId: summaryData.vendorSummaryId,
      // deletedFileIdList: summaryData?.materialList?.map(item=>item.fileDriveId)
    });
    if (res?.code === 200) {
      message.success('delete success!');
      getList();
    } else {
      message.error('delete fail!');
    }
  };

  const summaryEditClick = (summaryData: IVendorSummaryRecord) => {
    setEditSummaryData({
      description: summaryData.description,
      addTime: summaryData.addTime,
      vendorSummaryId: summaryData.vendorSummaryId,
      materialList: summaryData.materialList,
    });
    setSummaryModalState({
      id: summaryData.vendorSummaryId,
      description: summaryData.description,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!setShowModal && setShowModal(true);
  };

  const onSummaryConfirm = async (values: any) => {
    if (!Number(vendorId)) {
      message.error('customerId is undefined');
      return;
    }
    if (values.noRequestFiles) {
      const totalSize = values.noRequestFiles?.reduce?.(
        (acc: number, cur: File) => acc + cur.size,
        0,
      );
      if (totalSize > TOTAL_LIMIT_SIZE) {
        const formatStr = formatBytes(TOTAL_LIMIT_SIZE);
        message.error(`The total file size cannot exceed ${formatStr}`);
        return;
      }
    }

    setSummaryModalState({ loading: true });
    const { description, noRequestFiles = [], deletedFileIdList = [] } = values;

    let res;
    if (!!editSummaryData.vendorSummaryId) {
      const formData = new FormData();
      noRequestFiles.forEach((item: File) => {
        formData.append('files', item);
      });
      const dto = {
        vendorId: Number(vendorId),
        vendorSummaryId: editSummaryData.vendorSummaryId,
        addTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        description: description,
        deletedFileIdList: deletedFileIdList,
      };
      const blob = new Blob([JSON.stringify(dto)], {
        type: 'application/json',
      });
      formData.append('dto', blob);
      res = await vendorSummaryEdit({
        data: formData,
      }).finally(() => {
        setSummaryModalState({ loading: false });
      });
      if (res?.code === 200) {
        message.success('Edit successfully!');
        getList?.();
        hideModal?.(false);
      }
    } else {
      const formData = new FormData();
      noRequestFiles.forEach((item: File) => {
        formData.append('files', item);
      });
      const dto = {
        vendorId: Number(vendorId),
        addTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        description: description,
      };
      const blob = new Blob([JSON.stringify(dto)], {
        type: 'application/json',
      });
      formData.append('dto', blob);
      res = await vendorSummaryAdd({
        data: formData,
      }).finally(() => {
        setSummaryModalState({ loading: false });
      });
      if (res?.code === 200) {
        message.success('Add successfully!');
        getList?.();
        hideModal?.(false);
      }
    }
  };

  const onCustomPreview = useCallback(
    (material: ICommonMaterial) => {
      const index = lodash.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState],
  );

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    summaryList?.forEach((item) => {
      item.materialList?.forEach((material) => {
        if (IMAGE_TYPE.includes(material.fileType)) {
          materialList.push(material);
        }
      });
    });

    recordsList?.forEach((item) => {
      item.materialList?.forEach((material: ICommonMaterial) => {
        if (IMAGE_TYPE.includes(material.fileType)) {
          materialList.push(material);
        }
      });
    });

    setImageState({
      pending: true,
    });
    materialList.forEach((material) => {
      allSettled.push(getImageSource(material));
    });

    Promise.allSettled(allSettled)
      .then((values) => {
        const sourceImages: ISourceImage[] = [];
        values?.forEach((value) => {
          if (value.status === 'fulfilled') {
            sourceImages.push(value.value);
          }
        });
        setImageState({
          sourceImages,
        });
      })
      .finally(() => {
        setImageState({
          pending: false,
        });
      });
  }, [summaryList, recordsList]);

  const TimelineItems = useMemo(() => {
    if (tabKey === VENDOR_TAB_LIST.RECORDS) {
      return recordsList.map((item) => ({
        children: (
          <DetailTimeLineItem
            key={item.followRecordId}
            data={item}
            time={item.followTime}
            description={item.description}
            fileList={item.materialList}
            showEditBtn={
              access[PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS_EDIT] &&
              item.generateType === RECORD_GENERATE_TYPE
            }
            showDeleteBtn={
              access[PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS_EDIT] &&
              item.generateType === RECORD_GENERATE_TYPE
            }
            editHandle={recordEditClick}
            deleteHandle={recordDeleteClick}
            onCustomPreview={onCustomPreview}
          />
        ),
      }));
    } else if (tabKey === VENDOR_TAB_LIST.SUMMARY) {
      return summaryList.map((item) => ({
        children: (
          <DetailTimeLineItem
            key={item.vendorSummaryId}
            time={item.addTime}
            data={item}
            showEditBtn={access[PermissionEnum.VENDOR_DETAIL_SUMMARY_EDIT]}
            showDeleteBtn={access[PermissionEnum.VENDOR_DETAIL_SUMMARY_EDIT]}
            editHandle={summaryEditClick}
            deleteHandle={summaryDeleteClick}
            description={item.description}
            fileList={item?.materialList || []}
            onCustomPreview={onCustomPreview}
          />
        ),
      }));
    } else {
      return [];
    }
  }, [tabKey, recordsList, summaryList, imageState]);

  useEffect(() => {
    // initPreview
    initPreview();
  }, [summaryList, recordsList]);

  return (
    <div className={styles.records}>
      <Spin spinning={fetchLoading || imageState.pending}>
        <List
          // @ts-ignore
          dataSource={(tabKey === VENDOR_TAB_LIST.RECORDS
            ? recordsList
            : summaryList
          ).slice(0, 1)}
          split={false}
          locale={{
            emptyText: (
              <div className={styles.empty}>
                {!fetchLoading && !TimelineItems.length ? (
                  <Empty
                    description="no data"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : null}
              </div>
            ),
          }}
          renderItem={() => (
            <List.Item>
              <Timeline items={TimelineItems} />
            </List.Item>
          )}
        />
      </Spin>
      {showModal && tabKey === VENDOR_TAB_LIST.RECORDS ? (
        <VendorRecordsModal
          defaultData={editRecordData}
          tabKey={tabKey}
          hideModal={() => hideModal(false)}
          refreshList={getList}
        />
      ) : null}
      {showModal && tabKey === VENDOR_TAB_LIST.SUMMARY ? (
        <CustomQuillModal
          title={summaryModalState.id ? 'Edit Summary' : 'Add Summary'}
          open={showModal}
          loading={summaryModalState.loading}
          description={editSummaryData.description}
          materialList={editSummaryData.materialList}
          onCancel={() => {
            hideModal(false);
            setEditSummaryData(SUMMARY_DEFAULT_EDIT_DATA);
          }}
          onConfirm={onSummaryConfirm}
        />
      ) : null}
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </div>
  );
});
