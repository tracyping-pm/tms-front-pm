import { getImageSource } from '@/api/common';
import { IImageState, ISourceImage } from '@/api/types/common';
import CommonFileItem from '@/components/CommonFileItem';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { useSetState } from 'ahooks';
import { List, Tag } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';

import { ICategoryItem } from '@/api/types/application';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
} from '@/api/types/vendor';
import dayjs from 'dayjs';
import styles from './common.less';

interface ItemProps extends IAccreditationCategoryListItem {
  vendorId: number;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
}

const Item = memo(function ({
  validIndefinitely,
  required,
  validDateStart,
  validDateEnd,
  fileCategory,
  accreditationMaterialList = [],
  categoryMaterialId,
  imageState,
  change,
  setImageState,
}: ItemProps) {
  const onCustomPreview = useCallback(
    (material: IAccreditationMaterialListItem) => {
      const index = _.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState, setImageState],
  );

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_title}>
          <div className={styles.item_fileCategory}>
            {required ? <span style={{ color: '#ff4d4f' }}>*</span> : null}
            <span className={change ? styles.blueText : ''}>
              {fileCategory}
            </span>
            {validIndefinitely ? (
              <Tag style={{ marginLeft: 10 }}> Permanently Valid</Tag>
            ) : (
              ''
            )}
          </div>
          <div>
            <span className={styles.item_validity}>Valid Date:</span>
            {validDateStart ? dayjs(validDateStart).format('YYYY/MM/DD') : ''}-
            {validDateEnd ? dayjs(validDateEnd).format('YYYY/MM/DD') : ''}
          </div>
        </div>
        <div className={styles.item_content}>
          {accreditationMaterialList?.map(
            (fileItem: IAccreditationMaterialListItem) => (
              <CommonFileItem
                key={fileItem.fileAccreditationId}
                className={styles.file_item}
                thumbnail={fileItem.fileThumbnailUrl}
                fileType={fileItem.fileType}
                fileName={fileItem.fileName}
                materialId={categoryMaterialId}
                driveFileId={fileItem.fileDriveId}
                fileMimeType={fileItem.fileMimeType}
                onCustomPreview={() => onCustomPreview(fileItem)}
              />
            ),
          )}
        </div>
      </div>
    </>
  );
});

export default function AccreditationList(props: {
  accreditationId: number;
  categoryList: ICategoryItem[];
}) {
  const { accreditationId, categoryList } = props;

  const [list, setList] = useState<IAccreditationCategoryListItem[]>([]);

  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setList(categoryList);
  };

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    categoryList?.forEach((item) => {
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
  }, [categoryList]);

  useEffect(() => {
    fetchData();
  }, [categoryList]);

  useEffect(() => {
    initPreview();
  }, [categoryList]);

  return (
    <>
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
              <Item
                {...item}
                vendorId={Number(accreditationId)}
                imageState={imageState}
                setImageState={setImageState}
              />
            </List.Item>
          )}
        ></List>
      </div>

      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
}
