import styles from './styles.less';

import { IVendorBizStatusRecordItem } from '@/api/types/vendor';
import FileItemView from '@/components/OssUpload/FileItemView';
import { IDocument, IOssFile } from '@/components/OssUpload/types';
import { CrewStatusEnumColor } from '@/enums';
import { Badge } from 'antd';
import { memo } from 'react';

export default memo(function TimeLineItem(props: {
  data: IVendorBizStatusRecordItem;

  fileList: IDocument[];

  onCustomPreview?: (file: IOssFile, documentList: IDocument[]) => void;
}) {
  const {
    data,
    fileList = [],

    onCustomPreview = () => {},
  } = props;

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_time}>
          {`${data?.createdAt} ${data?.creator ?? ''} `}
        </div>
        <div className={styles.item_desc}>
          <div className={styles.item_desc_content}>
            <Badge
              color={CrewStatusEnumColor[data?.afterStatus]}
              text={data?.afterStatus}
            />
          </div>
          <div className={styles.item_desc_content}>{data?.reason}</div>
          {data?.remark ? (
            <div className={styles.item_desc_content}>{data?.remark}</div>
          ) : null}
        </div>
        {fileList.length ? (
          <div className={styles.item_mater}>
            <div className={styles.item_mater_file}>
              {fileList.map((material: any) => (
                <FileItemView
                  key={material.documentId}
                  modeListItemWidth={'100%'}
                  originalFileName={material.originalFileName}
                  documentId={material.documentId}
                  snapshotUrl={material.snapshotUrl}
                  showPreview
                  showDownload
                  showDelete={false}
                  onCustomPreview={() => onCustomPreview(material, fileList)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
});
