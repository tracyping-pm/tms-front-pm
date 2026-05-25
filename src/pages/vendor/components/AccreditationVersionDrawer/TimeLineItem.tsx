import CommonFileItem from '@/components/CommonFileItem';
import styles from './index.less';

import { ICommonMaterial } from '@/api/types/common';
import { IAccreditationVersionHistoryRecord } from '@/api/types/vendor';
import { Flex, Tag } from 'antd';
import dayjs from 'dayjs';
import { memo } from 'react';

export default memo(function TimeLineItem(props: {
  record: IAccreditationVersionHistoryRecord;
  fileList: ICommonMaterial[];
}) {
  const { record, fileList = [] } = props;

  return (
    <>
      <div>
        <div className={styles.validDate}>
          Valid Date:{' '}
          <span className={styles.time}>
            {record?.validIndefinitely ? (
              <Tag style={{ marginLeft: 10 }}> Permanently Valid</Tag>
            ) : (
              `${
                record?.validDateStart
                  ? dayjs(record?.validDateStart).format('YYYY/MM/DD')
                  : ''
              }
            -
            ${
              record?.validDateEnd
                ? dayjs(record?.validDateEnd).format('YYYY/MM/DD')
                : ''
            }`
            )}
          </span>
        </div>
        <div className={styles.validDate}>
          {record?.creator} {record?.createdAt} Add
        </div>
        <Flex gap={8} wrap="wrap">
          {fileList?.map((fileItem: ICommonMaterial) => (
            <div key={fileItem.fileMaterialId}>
              <CommonFileItem
                className={styles.file_item}
                thumbnail={fileItem.fileThumbnailUrl}
                fileType={fileItem.fileType}
                fileName={fileItem.fileName}
                materialId={fileItem.fileMaterialId}
                driveFileId={fileItem.fileDriveId}
                fileMimeType={fileItem.fileMimeType}
              />
              <div className={styles.fileNumber}>
                ID:{fileItem.fileNumber ?? '-'}
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </>
  );
});
