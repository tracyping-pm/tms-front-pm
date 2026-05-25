import { getImageSource } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import { IPodItem } from '@/api/types/waybill';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Col, Row, Space, Spin } from 'antd';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import { FC, useCallback, useEffect } from 'react';
import styles from './index.less';
import ListItemView from './ListItemView';
import PodListItemPreview from './PodListItemPreview';

interface IState {
  leftList: IPodItem[];
  rightList: IPodItem[];
  expand: boolean;
  imageList: IPodItem[];
  list: IPodItem[];
}

const initialState: IState = {
  leftList: [],
  rightList: [],
  expand: true,
  imageList: [],
  list: [],
};

interface IProps {
  list: IPodItem[];
  canEdit: boolean;
}

const PodListView: FC<IProps> = ({ list, canEdit }) => {
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
    if (canEdit) {
      // 将list分成两个数组，分别赋值给leftList和rightList，分组依据是根据数组下标的奇偶性
      const leftList = list.filter((_, index) => index % 2 === 0);
      const rightList = list.filter((_, index) => index % 2 === 1);
      setState({ leftList, rightList });
    } else {
      setState({ list: list || [], imageList: list || [] });
    }
    // initPreview
    initPreview();
  }, [list, canEdit]);

  return (
    <>
      <div className={cls(styles.podListView, 'podListView')}>
        <Spin spinning={imageState.pending} tip="All Images Fetching...">
          {canEdit ? (
            <Row gutter={40}>
              <Col span={12}>
                <div className="listWrap">
                  {state.leftList.map((item) => {
                    return (
                      <ListItemView
                        key={item.waybillPodId}
                        item={item}
                        canEdit={canEdit}
                        onCustomPreview={onCustomPreview}
                        setPodListLoading={(b) => {
                          setImageState({
                            pending: b,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </Col>
              <Col span={12}>
                <div className="listWrap">
                  {state.rightList.map((item) => {
                    return (
                      <ListItemView
                        key={item.waybillPodId}
                        item={item}
                        canEdit={canEdit}
                        onCustomPreview={onCustomPreview}
                        setPodListLoading={(b) => {
                          setImageState({
                            pending: b,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </Col>
            </Row>
          ) : (
            <div>
              <Space size={24} direction="vertical" align="start" wrap>
                {state?.imageList?.map((item) => (
                  <PodListItemPreview
                    key={item.waybillPodId}
                    item={item}
                    onCustomPreview={onCustomPreview}
                  />
                ))}
              </Space>
              {state.list.length > 3 ? (
                <div
                  className={styles.podListExpand}
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
            </div>
          )}
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

export default PodListView;
