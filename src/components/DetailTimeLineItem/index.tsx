import CommonFileItem from '@/components/CommonFileItem';
import styles from '@/components/DetailTimeLineItem/styles.less';

import { memo } from 'react';
import { ReactComponent as CustomerEditIcon } from '../../../public/svg/customer_edit_icon.svg';
import CustomConfirmModal from '../CustomConfirmModal';
import { IconEdit } from '../OperationIcon';

const AVATAR_COLOR = [
  '#f5222d',
  '#fa541c',
  '#fa8c16',
  '#faad14',
  '#fadb14',
  '#a0d911',
  '#52c41a',
  '#13c2c2',
  '#1677ff',
  '#2f54eb',
  '#722ed1',
  '#eb2f96',
];

export default memo(function DetailTimeLineItem(props: {
  data: any;
  time: string;
  description: string;
  fileList: any[];
  showAvatar?: boolean;
  showEditBtn?: boolean;
  showDeleteBtn?: boolean;
  editHandle?: (d: any) => void;
  deleteHandle?: (d: any) => void;
  onCustomPreview?: (material: any) => void;
}) {
  const {
    data,
    time = '',
    description = '',
    fileList = [],
    showEditBtn = true,
    showDeleteBtn = true,
    showAvatar = false,
    editHandle = () => {},
    deleteHandle = () => {},
    onCustomPreview = () => {},
  } = props;

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_time}>
          {showAvatar ? (
            <div
              className={styles.item_avatar}
              style={{ backgroundColor: AVATAR_COLOR[data?.colorId ?? 0] }}
            >
              {data.username?.slice(0, 1)?.toUpperCase()}
            </div>
          ) : null}
          {`${data?.username ?? ''} ${time}`}
          <>
            {showEditBtn ? (
              <IconEdit
                showPopover={false}
                className={styles.item_time_editIcon}
                onClick={() => editHandle(data)}
              />
            ) : null}
            {showDeleteBtn ? (
              <CustomConfirmModal
                key="delete"
                title="Delete"
                content="Confirm delete item"
                onOk={() => deleteHandle(data)}
              >
                <CustomerEditIcon className={styles.item_time_delIcon} />
              </CustomConfirmModal>
            ) : null}
          </>
        </div>
        <div className={styles.item_desc}>
          {/*<p className={styles.item_desc_title}>Description</p>*/}
          <div
            className={styles.item_desc_content}
            dangerouslySetInnerHTML={{ __html: description }}
          >
            {/* {description} */}
          </div>
        </div>
        {fileList.length ? (
          <div className={styles.item_mater}>
            {/*<p className={styles.item_mater_title}>Material</p>*/}
            <div className={styles.item_mater_file}>
              {fileList.map((material: any) => (
                <CommonFileItem
                  key={material.fileId || material.fileDriveId}
                  className={styles.file_item}
                  thumbnail={
                    material.fileBase64String || material.fileThumbnailUrl
                  }
                  fileType={material.fileType}
                  fileName={material.fileName}
                  materialId={material.fileId || material.fileMaterialId}
                  driveFileId={material.fileDriveId}
                  fileMimeType={material.fileMimeType}
                  onCustomPreview={() => onCustomPreview?.(material)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
});
