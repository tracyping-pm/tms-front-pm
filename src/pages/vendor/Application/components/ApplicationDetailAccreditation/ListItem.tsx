import { IImageState } from '@/api/types/common';
import { IDriverAccreditationMaterialListItem } from '@/api/types/truck';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
} from '@/api/types/vendor';
import CommonFileItem from '@/components/CommonFileItem';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import lodash from 'lodash';
import { useCallback } from 'react';

import styles from './styles.less';

interface ItemProps extends IAccreditationCategoryListItem {
  truckId: number;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}
export default function ListItem({
  required,
  fileCategory,
  accreditationMaterialList = [],
  categoryMaterialId,
  imageState,
  validDateStart,
  validDateEnd,
  validIndefinitely,
  change,
  setImageState,
}: ItemProps) {
  const onCustomPreview = useCallback(
    (material: IAccreditationMaterialListItem) => {
      const index = lodash.findIndex(
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
          <div>
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
        </div>
        {!validIndefinitely && (
          <div className={styles.item_time}>
            validDate:
            {validDateStart ? dayjs(validDateStart).format('YYYY/MM/DD') : ''}-
            {validDateEnd ? dayjs(validDateEnd).format('YYYY/MM/DD') : ''}
          </div>
        )}
        <div className={styles.item_content}>
          {accreditationMaterialList?.map(
            (fileItem: IDriverAccreditationMaterialListItem) => (
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
}
