import { ICommonMaterial } from '@/api/types/common';
import { IAccreditationHistoryRecord } from '@/api/types/vendor';
import CommonFileItem from '@/components/CommonFileItem';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import styles from './index.less';

export default function ListItem({
  accreditationMaterialList = [],
  creator,
  createdAt,
  validDateStart,
  validDateEnd,
  validIndefinitely,
}: IAccreditationHistoryRecord) {
  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_title}>
          {validIndefinitely ? (
            <Tag> Permanently Valid</Tag>
          ) : (
            <div className={styles.item_time}>
              <span>Valid Date: </span>
              {validDateStart ? dayjs(validDateStart).format('YYYY/MM/DD') : ''}
              -{validDateEnd ? dayjs(validDateEnd).format('YYYY/MM/DD') : ''}
            </div>
          )}
        </div>
        <div className={styles.item_title}>
          {createdAt} {creator ? `${creator} Add` : ''}
        </div>

        <div className={styles.item_content}>
          {accreditationMaterialList?.map((fileItem: ICommonMaterial) => (
            <CommonFileItem
              key={fileItem.fileMaterialId}
              className={styles.file_item}
              thumbnail={fileItem.fileThumbnailUrl}
              fileType={fileItem.fileType}
              fileName={fileItem.fileName}
              materialId={fileItem.fileMaterialId}
              driveFileId={fileItem.fileDriveId}
              fileMimeType={fileItem.fileMimeType}
              // onCustomPreview={() => onCustomPreview(fileItem)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
