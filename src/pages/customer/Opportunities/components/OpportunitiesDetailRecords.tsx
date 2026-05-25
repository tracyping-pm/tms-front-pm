import { getImageSource } from '@/api/common';
import { followUpList } from '@/api/followUp';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import { IFollowUpListRecord } from '@/api/types/followUp';
import CommonFileItem from '@/components/CommonFileItem';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { OpportunitiesStatusEnumText, VisitTypeEnumText } from '@/enums';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { useParams } from '@umijs/max';
import { useInfiniteScroll, useSetState } from 'ahooks';
import { Avatar, Empty } from 'antd';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { EVENT_OPPORTUNITY_RECORD_RELOAD } from '../event';
import {
  SHOW_REASON_STATUS_LIST,
  SHOW_VISIT_ACTIVITY_STATUS_LIST,
} from './followingUp/support';
import styles from './styles.less';

const PAGE_SIZE = 10;

const OpportunitiesDetailRecords = () => {
  const { id } = useParams();
  const { subscribe } = useContext(PubSubContext);
  const ref = useRef<HTMLDivElement>(null);
  const resultDataRef = useRef<IFollowUpListRecord[]>([]);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const getLoadMoreList = useCallback(
    async (nextPage: number) => {
      const res = await followUpList({
        pageNum: nextPage ?? 1,
        pageSize: PAGE_SIZE,
        id: Number(id),
      });
      if (res.code === 200) {
        // @ts-ignore
        resultDataRef.current = resultDataRef.current.concat(res.data ?? []);
        return new Promise((resolve) => {
          resolve({
            list: resultDataRef.current,
            ...res.data,
          });
        });
      }
    },
    [id],
  );

  const { data, reload, loading, loadingMore, noMore } = useInfiniteScroll(
    // @ts-ignore
    (d) => getLoadMoreList(d?.nextPage),
    {
      target: document,
      isNoMore: (d) => !d?.hasNextPage,
    },
  );

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
    const materialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    data?.list?.forEach((item) => {
      item.materials?.forEach((material: ICommonMaterial) => {
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
  }, [data?.list]);

  useEffect(() => {
    initPreview();
  }, [data]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_OPPORTUNITY_RECORD_RELOAD, () => {
      reload();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.header_record}>
      <DetailCard
        title="Follow-up Records"
        editCallback={() => {}}
        loading={loading}
        showEditBtn={false}
        hideBorder={true}
        child={
          <div className={styles.header_record} ref={ref}>
            {data?.list?.map((item: IFollowUpListRecord) => (
              <div
                key={item.followUpId}
                className={cls(styles.header_record_wrap, 'record-wrap')}
              >
                <div className={styles.header_record_item}>
                  <div className={styles.header_record_label}>
                    <Avatar
                      size="small"
                      style={{
                        marginRight: 16,
                        backgroundColor: 'var(--primary-color)',
                      }}
                    >
                      {item.followUpUser.slice(0, 1).toLocaleUpperCase()}
                    </Avatar>
                    {item.followUpUser}
                  </div>
                  <div className={styles.header_record_value}>
                    {item.followUpTime}
                  </div>
                </div>
                <div className={styles.header_record_item}>
                  <div className={styles.header_record_label}>
                    Opportunity Status:
                  </div>
                  <div className={styles.header_record_value}>
                    {OpportunitiesStatusEnumText[item.opportunityStatus]}
                  </div>
                </div>
                <div className={styles.header_record_item}>
                  <div className={styles.header_record_label}>
                    {SHOW_REASON_STATUS_LIST.includes(item.opportunityStatus)
                      ? 'Reason: '
                      : 'Remark: '}
                  </div>
                  <div className={styles.header_record_value}>
                    {item.remarkOrReason ?? '-'}
                  </div>
                </div>
                {SHOW_VISIT_ACTIVITY_STATUS_LIST.includes(
                  item.opportunityStatus,
                ) && (
                  <div className={styles.header_record_visit}>
                    <div className={styles.header_record_item}>
                      <div className={styles.header_record_label}>
                        Visit Type:
                      </div>
                      <div className={styles.header_record_value}>
                        {VisitTypeEnumText[item.visitType]}
                      </div>
                    </div>
                    <div className={styles.header_record_item}>
                      <div className={styles.header_record_label}>
                        Visit Objective:
                      </div>
                      <div className={styles.header_record_value}>
                        {item.visitObjective ?? '-'}
                      </div>
                    </div>
                    <div className={styles.header_record_item}>
                      <div className={styles.header_record_label}>
                        Visit Content:
                      </div>
                      <div className={styles.header_record_value}>
                        <div
                          style={{ whiteSpace: 'pre-wrap' }}
                          dangerouslySetInnerHTML={{
                            __html: item.visitContent,
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.header_record_item}>
                      <div className={styles.header_record_label}>
                        Action Plan:
                      </div>
                      <div className={styles.header_record_value}>
                        {item.actionPlan}
                      </div>
                    </div>
                    <div className={styles.header_record_item}>
                      <div className={styles.header_record_label}>
                        Material:
                      </div>
                      <div className={styles.header_record_value}>
                        <div className="listItemMaterial">
                          {item.materials?.length > 0
                            ? item.materials?.map(
                                (material: ICommonMaterial) => (
                                  <CommonFileItem
                                    key={material.fileMaterialId}
                                    width={118}
                                    height={118}
                                    className="materialItem"
                                    thumbnail={material.fileThumbnailUrl}
                                    fileType={material.fileType}
                                    fileName={material.fileName}
                                    materialId={material.fileMaterialId}
                                    driveFileId={material.fileDriveId}
                                    fileMimeType={material.fileMimeType}
                                    onCustomPreview={() =>
                                      onCustomPreview?.(material)
                                    }
                                  />
                                ),
                              )
                            : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 8 }}>
              {!noMore && loadingMore && (
                <div className="bottom-tips">Loading more...</div>
              )}
              {(data?.list?.length ?? 0) > 0 && noMore && (
                <div className="bottom-tips">No more data</div>
              )}

              {(data?.list?.length ?? 0) === 0 && noMore && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
        }
      />
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </div>
  );
};

export default OpportunitiesDetailRecords;
