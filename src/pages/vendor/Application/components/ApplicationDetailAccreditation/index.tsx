import { getImageSource } from '@/api/common';
import { ICategoryItem } from '@/api/types/application';
import { IImageState, ISourceImage } from '@/api/types/common';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
} from '@/api/types/vendor';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { List, Spin } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import ListItem from './ListItem';
import styles from './styles.less';

export default memo(function CrewDetailAccreditation(props: {
  categoryList: ICategoryItem[];
}) {
  const { categoryList } = props;
  // const access = useAccess();

  const { id: crewId } = useParams();

  const [list, setList] = useState<IAccreditationCategoryListItem[]>([]);

  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    const font = categoryList?.filter((item) => item.required);
    const end = categoryList?.filter((item) => !item.required);
    setList([...font, ...end]);
  };

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    list?.forEach((item) => {
      item.accreditationMaterialList?.forEach(
        (material: IAccreditationMaterialListItem) => {
          if (IMAGE_TYPE.includes(material.fileType)) {
            materialList.push(material);
          }
        },
      );
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
    if (categoryList) {
      fetchData();
    }
  }, [categoryList]);

  useEffect(() => {
    // initPreview
    initPreview();
  }, [list]);

  return (
    <>
      <Spin spinning={!categoryList.length || imageState.pending}>
        <div className={styles.accreditation}>
          <List
            size="large"
            split={false}
            dataSource={list}
            renderItem={(item: IAccreditationCategoryListItem) => (
              <List.Item
                key={item.categoryAccreditationId}
                style={{ padding: 0 }}
              >
                <ListItem
                  {...item}
                  truckId={Number(crewId)}
                  imageState={imageState}
                  setImageState={setImageState}
                  reload={fetchData}
                />
              </List.Item>
            )}
          ></List>
        </div>
      </Spin>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
});
