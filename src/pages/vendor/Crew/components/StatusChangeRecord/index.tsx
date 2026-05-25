import { IVendorBizStatusRecordItem } from '@/api/types/vendor';
import { getVendorBizStatusRecordList } from '@/api/vendor';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { initialImagePreviewGroupState } from '@/components/OssUpload/constant';
import {
  IDocument,
  IImagePreviewGroupState,
  IOssFile,
  ISourceImage,
} from '@/components/OssUpload/types';
import PubSubContext from '@/context/pubsub';
import { ApplicationTypeEnum } from '@/enums';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Empty, List, Spin, Timeline } from 'antd';
import { memo, useContext, useEffect, useMemo, useState } from 'react';

import { EVENT_STATUS_CHANGE_RECORD_RELOAD } from '@/pages/vendor/event';
import styles from './styles.less';
import TimeLineItem from './TimeLineItem';

export default memo(function StatusChangeRecord() {
  // const access = useAccess();
  const { id: crewId } = useParams();
  const { subscribe } = useContext(PubSubContext);
  // const { message } = App.useApp();
  // const { tabKey, recordFresh, setShowAdd } = props;
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  const [recordList, setRecordList] = useState<IVendorBizStatusRecordItem[]>(
    [],
  );

  const [imagePreviewGroupState, setImagePreviewGroupState] =
    useSetState<IImagePreviewGroupState>(initialImagePreviewGroupState);

  const getList = async () => {
    setFetchLoading(true);

    const res = await getVendorBizStatusRecordList({
      entityId: Number(crewId),
      entityType: ApplicationTypeEnum.CREW,
    }).finally(() => {
      setFetchLoading(false);
    });
    if (res?.code === 200) {
      setRecordList(res?.data || []);
    }
  };

  const onCustomPreview = (file: IOssFile, documentList: IDocument[]) => {
    let index;
    const _documentList = documentList?.map((item, _index) => {
      if (item.documentId === file.documentId) {
        index = _index;
      }
      return {
        documentId: item.documentId,
        src: item.snapshotUrl,
      };
    });
    setImagePreviewGroupState({
      index: index!,
      visible: true,
      sourceImageList: _documentList,
    });
  };

  const TimelineItems = useMemo(() => {
    return recordList.map((item) => ({
      children: (
        <TimeLineItem
          key={item.id}
          data={item}
          fileList={item?.proofDocumentList || []}
          onCustomPreview={onCustomPreview}
        />
      ),
    }));
  }, [recordList, imagePreviewGroupState]);

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    // initPreview();
  }, [recordList]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_STATUS_CHANGE_RECORD_RELOAD, () => {
      getList();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.records}>
      <Spin spinning={fetchLoading || imagePreviewGroupState.pending}>
        <List
          // @ts-ignore
          dataSource={recordList.slice(0, 1)}
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

      <ImagePreviewGroup
        visible={imagePreviewGroupState.visible}
        items={imagePreviewGroupState.sourceImageList?.map(
          (item: ISourceImage) => item.src,
        )}
        index={imagePreviewGroupState.index}
        onClose={() => setImagePreviewGroupState({ visible: false })}
      />
    </div>
  );
});
