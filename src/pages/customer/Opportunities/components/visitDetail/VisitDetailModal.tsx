import { getImageSource } from '@/api/common';
import { followUpListVisitRecord } from '@/api/followUp';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import {
  IFollowUpListVisitRecord,
  IFollowUpListVisitRecordReq,
} from '@/api/types/followUp';
import CommonFileItem from '@/components/CommonFileItem';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { useSetState } from 'ahooks';
import {
  Collapse,
  Empty,
  Modal,
  ModalProps,
  Skeleton,
  Spin,
  Timeline,
} from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import { FC, useCallback, useEffect } from 'react';
import styles from './index.less';

interface IState {
  pending: boolean;
  list: IFollowUpListVisitRecord[];
}

const DEFAULT_STATE: IState = {
  pending: false,
  list: [],
};

export interface IVisitDetailProps extends ModalProps {
  record: IFollowUpListVisitRecordReq;
}

const VisitDetailModal: FC<IVisitDetailProps> = ({
  title = 'Visit Detail',
  open,
  record,
  //   onCancel,
  ...rest
}) => {
  const [state, setState] = useSetState<IState>(DEFAULT_STATE);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const initPreview = useCallback(async () => {
    const materialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    state.list?.forEach((item) => {
      item.materials?.forEach((material) => {
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
  }, [state.list]);

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

  const fetchData = useCallback(async () => {
    setState({ pending: true });
    const res = await followUpListVisitRecord(record).finally(() => {
      setState({ pending: false });
    });
    if (res.code === 200) {
      setState({ list: res.data ?? [] });
    }
  }, [record]);

  const buildItems = useCallback(() => {
    return state.list?.map?.((item) => {
      const time = dayjs(item.followUpTime).format('MM-DD HH:mm:ss');
      const year = dayjs(item.followUpTime).format('YYYY');
      const collapseItems = [
        {
          key: 'visitObjective',
          label: <div>Visit Objective: </div>,
          children: <div>{item.visitObjective}</div>,
        },
        {
          key: 'visitContent',
          label: <div>Visit Content: </div>,
          children: (
            <div
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: item.visitContent }}
            />
          ),
        },
        {
          key: 'actionPlan',
          label: <div>Action Plan: </div>,
          children: <div>{item.actionPlan}</div>,
        },
        {
          key: 'material',
          label: <div>Material: </div>,
          children: (
            <div>
              <div className="listItemMaterial">
                {item.materials?.map((material: ICommonMaterial) => (
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
                    onCustomPreview={() => onCustomPreview?.(material)}
                  />
                ))}
              </div>
            </div>
          ),
        },
      ];
      return {
        label: (
          <div className={styles.timelineLabel}>
            <div className="time">{time}</div>
            <div className="year">{year}</div>
          </div>
        ),
        children: (
          <div className={styles.timelineChildren}>
            <div className="item-title">{item.visitType}</div>
            <Collapse
              className={styles.customCollapse}
              items={collapseItems}
              ghost
              size="small"
              defaultActiveKey={[
                'visitObjective',
                'visitContent',
                'actionPlan',
                'material',
              ]}
            />
          </div>
        ),
      };
    });
  }, [state, imageState]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (state.list?.length > 0) {
      initPreview();
    }
  }, [state.list]);

  return (
    <>
      <Modal
        title={title}
        width={764}
        open={open}
        destroyOnClose
        maskClosable={false}
        zIndex={888}
        {...rest}
        footer={null}
      >
        <div
          className={cls('visit-detail', styles.visitDetailContainer)}
          style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' }}
        >
          {state.pending ? (
            <Skeleton active={true} />
          ) : state.list?.length > 0 ? (
            <Spin spinning={imageState.pending} tip="All Images Fetching...">
              <Timeline mode={'left'} items={buildItems()} />
            </Spin>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Modal>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
};

export default VisitDetailModal;
