import { getImageSource } from '@/api/common';
import {
  addPerception,
  deletePerception,
  deleteRecord,
  editPerception,
  getPerceptionsList,
  getRecordsList,
} from '@/api/customer';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import {
  ICustomerPerceptionListItem,
  ICustomerRecordForm,
  ICustomerRecordsListItem,
  ICustomerRecordsListItemChild,
} from '@/api/types/customer';
import CustomQuillModal from '@/components/CustomQuillModal';
import { formatBytes } from '@/components/CustomUpload/fileSupport';
import DetailTimeLineItem from '@/components/DetailTimeLineItem';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import {
  CUSTOMER_LEADS_POOL,
  CUSTOMER_TAB_LIST,
  IMAGE_TYPE,
  initialImageState,
  PERCEPTION_DEFAULT_EDIT_DATA,
  RECORD_DEFAULT_EDIT_DATA,
  RECORD_GENERATE_TYPE,
  TOTAL_LIMIT_SIZE,
} from '@/constants';
import { GenerateTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import CustomerRecordsModal from '@/pages/customer/components/CustomerRecordsModal';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useAccess, useParams, useSearchParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Empty, List, Spin, Timeline } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './styles.less';

interface ISummaryModalState {
  open: boolean;
  loading: boolean;
  id: string | null;
  description: string;
  materialList: ICommonMaterial[];
}

const initialSummaryModalState: ISummaryModalState = {
  open: false,
  loading: false,
  id: null,
  description: '',
  materialList: [],
  // richText:
  //   '<p><a href="https://www.baidu.com/" rel="noopener noreferrer" target="_blank">时光是根深蒂固</a></p><ol><li>树大根深的根深蒂固</li><li>收到根深蒂固</li><li>树大根深的根深蒂固</li></ol>',
};

export default memo(function CustomerDetailRecords(props: {
  tabKey: string;
  showModal?: boolean;
  setShowModal?: (b: boolean) => void;
  setShowAdd?: (b: boolean) => void;
}) {
  const access = useAccess();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const { tabKey, showModal = false, setShowModal, setShowAdd } = props;
  const { id: customerId } = useParams();
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [recordsList, setRecordList] = useState<ICustomerRecordsListItem[]>([]);
  const [filterRecordsList, setFilterRecordList] = useState<
    ICustomerRecordsListItem[]
  >([]);
  const [perceptionList, setPerceptionList] = useState<
    ICustomerPerceptionListItem[]
  >([]);
  const [editRecordData, setEditRecordData] = useState<ICustomerRecordForm>(
    RECORD_DEFAULT_EDIT_DATA,
  );
  const [editSummaryData, setEditSummaryData] =
    useState<ICustomerPerceptionListItem>(PERCEPTION_DEFAULT_EDIT_DATA);
  const [summaryModalState, setSummaryModalState] =
    useSetState<ISummaryModalState>(initialSummaryModalState);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const getList = async () => {
    setFetchLoading(true);
    // records list
    if (tabKey === CUSTOMER_TAB_LIST.RECORDS) {
      const res = await getRecordsList(Number(customerId));
      if (res?.code === 200) {
        setRecordList(res?.data?.followRecordList || []);
        // setViewAll(false);
        // setRecordList(res?.data?.followRecordList || []);
        // const filter = res?.data?.followRecordList?.filter(
        //   (item) => item.generateType === GenerateTypeEnum.MANUAL,
        // );
        // setFilterRecordList(filter);
      }
    }
    // summary list
    if (tabKey === CUSTOMER_TAB_LIST.PERCEPTION) {
      const res = await getPerceptionsList(Number(customerId));
      if (res?.code === 200) {
        setPerceptionList(res?.data?.perceptionList || []);
        if (res?.data?.perceptionList?.length >= 1) {
          setShowAdd?.(false);
        } else {
          setShowAdd?.(true);
        }
      }
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    getList();
  }, []);

  const hideModal = (option: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!setShowModal && setShowModal(option);
    if (tabKey === CUSTOMER_TAB_LIST.RECORDS) {
      setEditRecordData(RECORD_DEFAULT_EDIT_DATA);
    } else {
      setSummaryModalState({
        id: null,
        description: '',
      });
    }
  };

  // 删除操作
  const recordDeleteClick = async (recordData: ICustomerRecordsListItem) => {
    const res = await deleteRecord({
      customerId: Number(customerId),
      followRecordId: Number(recordData.followRecordId),
      generateType: recordData.generateType,
    });
    if (res?.code === 200) {
      message.success('Delete successfully!');
      getList();
    } else {
      message.error('Delete fail!');
    }
  };
  const perceptionDeleteClick = async (
    perceptionData: ICustomerPerceptionListItem,
  ) => {
    const res = await deletePerception({
      customerId: Number(customerId),
      perceptionId: Number(perceptionData?.perceptionId),
    });
    if (res?.code === 200) {
      message.success('delete success!');
      getList();
    } else {
      message.error('delete fail!');
    }
  };

  // 编辑操作
  const recordEditClick = (recordData: ICustomerRecordsListItem) => {
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

  const perceptionEditClick = (summaryData: ICustomerPerceptionListItem) => {
    setEditSummaryData({
      description: summaryData.description,
      addTime: summaryData.addTime,
      perceptionId: summaryData.perceptionId,
      materialList: summaryData.materialList,
    });
    setSummaryModalState({
      id: summaryData.perceptionId,
      description: summaryData.description,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!setShowModal && setShowModal(true);
  };

  const onSummaryConfirm = async (values: any) => {
    if (!Number(customerId)) {
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
    if (!!editSummaryData.perceptionId) {
      const formData = new FormData();
      noRequestFiles.forEach((item: File) => {
        formData.append('newFiles', item);
      });
      res = await editPerception({
        customerId: Number(customerId),
        perceptionId: Number(editSummaryData.perceptionId),
        addTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        description: description,
        deletedFileIdList: deletedFileIdList,
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
      res = await addPerception({
        customerId: Number(customerId),
        addTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        description: description,
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
      const index = _.findIndex(
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

    perceptionList?.forEach((item) => {
      item.materialList?.forEach((material) => {
        if (IMAGE_TYPE.includes(material.fileType)) {
          materialList.push(material);
        }
      });
    });

    recordsList?.forEach((item) => {
      item.materialList?.forEach((material: ICustomerRecordsListItemChild) => {
        if (IMAGE_TYPE.includes(material.fileType)) {
          if (material.fileId) {
            // 兼容奇怪的数据结构，这里 ICustomerRecordsListItemChild 和 ICommonMaterial 定义不一致
            material.fileMaterialId = material.fileId;
          }
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
  }, [perceptionList, recordsList]);

  useEffect(() => {
    if (recordsList.length) {
      if (viewAll) {
        setFilterRecordList(recordsList);
      } else {
        const filter = recordsList.filter(
          (item) => item.generateType === GenerateTypeEnum.MANUAL,
        );
        setFilterRecordList(filter);
      }
    }
  }, [viewAll, recordsList]);

  useEffect(() => {
    // initPreview
    initPreview();
  }, [perceptionList, recordsList]);

  const TimelineItems = useMemo(() => {
    if (tabKey === CUSTOMER_TAB_LIST.RECORDS) {
      return filterRecordsList.map((item) => ({
        dot:
          item.generateType === GenerateTypeEnum.AUTO ? (
            <ClockCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
          ) : null,
        children: (
          <DetailTimeLineItem
            key={item.followRecordId}
            data={item}
            time={item.followTime}
            editHandle={recordEditClick}
            deleteHandle={recordDeleteClick}
            showAvatar={
              item.generateType === GenerateTypeEnum.MANUAL && !!item.username
            }
            showEditBtn={
              access[PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS_EDIT] &&
              item.generateType === RECORD_GENERATE_TYPE &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
            showDeleteBtn={
              access[PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS_EDIT] &&
              item.generateType === RECORD_GENERATE_TYPE &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
            description={item.description}
            fileList={item?.materialList || []}
            onCustomPreview={onCustomPreview}
          />
        ),
      }));
    } else {
      return perceptionList.map((item) => ({
        children: (
          <DetailTimeLineItem
            key={item.perceptionId}
            time={item.addTime}
            data={item}
            showEditBtn={
              access[PermissionEnum.CUSTOMER_DETAIL_SUMMARY_EDIT] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
            showDeleteBtn={
              access[PermissionEnum.CUSTOMER_DETAIL_SUMMARY_EDIT] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
            editHandle={perceptionEditClick}
            deleteHandle={perceptionDeleteClick}
            description={item.description}
            fileList={item?.materialList || []}
            onCustomPreview={onCustomPreview}
          />
        ),
      }));
    }
  }, [tabKey, filterRecordsList, perceptionList, imageState]);

  return (
    <div className={styles.records}>
      {tabKey === CUSTOMER_TAB_LIST.RECORDS ? (
        <div className={styles.listTitle} onClick={() => setViewAll(!viewAll)}>
          {viewAll ? 'Don’t view system records' : 'View All'}
        </div>
      ) : null}
      <Spin spinning={fetchLoading || imageState.pending}>
        <List
          // @ts-ignore
          dataSource={(tabKey === CUSTOMER_TAB_LIST.RECORDS
            ? recordsList
            : perceptionList
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
      {showModal && tabKey === CUSTOMER_TAB_LIST.RECORDS ? (
        <CustomerRecordsModal
          defaultData={editRecordData}
          tabKey={tabKey}
          hideModal={() => hideModal(false)}
          refreshList={getList}
        />
      ) : null}
      {showModal && tabKey === CUSTOMER_TAB_LIST.PERCEPTION ? (
        <CustomQuillModal
          title={summaryModalState.id ? 'Edit Summary' : 'Add Summary'}
          open={showModal}
          loading={summaryModalState.loading}
          description={editSummaryData.description}
          materialList={editSummaryData.materialList}
          onCancel={() => {
            hideModal(false);
            setEditSummaryData(PERCEPTION_DEFAULT_EDIT_DATA);
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
