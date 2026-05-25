import { getImageSource } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Space, Spin } from 'antd';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import { FC, useCallback, useEffect } from 'react';
import ListItem, { IStatementMaterialListItem } from './ListItem';
import styles from './index.less';

interface IState {
  expand: boolean;
  imageList: IStatementMaterialListItem[];
  list: IStatementMaterialListItem[];
}

const initialState: IState = {
  expand: true,
  imageList: [],
  list: [],
};

interface IProps {
  canEdit: boolean;
  showIcon?: boolean;
  showTax?: boolean;
  showCancelText?: boolean;
  list: IStatementMaterialListItem[];
  onGetEditData?: (v: IStatementMaterialListItem) => void;
  onDeleteData?: (v: IStatementMaterialListItem) => void;
}

const FileMaterialList: FC<IProps> = ({
  canEdit,
  showIcon,
  showTax = false,
  showCancelText = false,
  list,
  onGetEditData,
  onDeleteData,
}) => {
  const [state, setState] = useSetState<IState>(initialState);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

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

    list?.forEach((item) => {
      item.materialVoList?.forEach((material) => {
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
  }, [list]);

  useEffect(() => {
    setState({ list: list || [], imageList: list || [] });
    initPreview();
  }, [list]);

  return (
    <>
      <div className={cls(styles.fileListMain, 'fileListMain')}>
        <Spin spinning={imageState.pending} tip="All Images Fetching...">
          <Space size={24} direction="vertical" align="start" wrap>
            {state?.imageList?.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                canEdit={
                  canEdit &&
                  item.title !== 'Settlement Reject Supporting' &&
                  item.title !== 'Customer Confirm Proof'
                }
                showCancelText={showCancelText}
                showIcon={showIcon}
                showTax={showTax}
                onCustomPreview={onCustomPreview}
                onEditHandle={() => {
                  onGetEditData?.(item);
                }}
                onDeleteHandle={() => {
                  onDeleteData?.(item);
                }}
              />
            ))}
          </Space>
          {state.list.length > 3 ? (
            <div
              className={styles.fileListMainExpand}
              onClick={() => {
                const bol = state.expand;
                setState({
                  expand: !bol,
                  imageList: bol ? state.list?.slice?.(0, 3) : state.list,
                });
              }}
            >
              {state.expand ? <UpSquareOutlined /> : <DownSquareOutlined />}
            </div>
          ) : null}
        </Spin>
        <ImagePreviewGroup
          visible={imageState.visible}
          items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
          index={imageState.index}
          onClose={() => setImageState({ visible: false })}
        />
      </div>
    </>
  );
};

export default FileMaterialList;
