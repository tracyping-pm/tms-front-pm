import { DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Image, Progress, Tooltip, UploadFile } from 'antd';
import cls from 'classnames';
import { FC, memo } from 'react';
import defaultURL from '../../../public/svg/default-sku.svg';
import ImageLoading from '../ImageLoading';
import { splitFileName } from './constant';
import FileItemView from './FileItemView';
import styles from './index.less';
import { IOssFile } from './types';

const DEFAULT_URL = defaultURL;
const PROGRESS_SIZE = { height: 2 };

export interface IStatusFile extends UploadFile {
  ossFile?: IOssFile;
}

export interface IProps {
  statusFile: IStatusFile;
  mode?: 'card' | 'list';
  width?: number | string;
  height?: number | string;
  modeListItemWidth?: number | string;
  showPreview?: boolean;
  showDownload?: boolean;
  showDelete?: boolean;
  showModeListSnapshotUrl?: boolean;
  onDeleteTrigger?: () => void;
  onCustomPreview?: () => void;
}

const StatusFileItem: FC<IProps> = ({
  statusFile,
  mode = 'card',
  width = 120,
  height = 120,
  modeListItemWidth = 256,
  showPreview = true,
  showDownload = true,
  showDelete = true,
  showModeListSnapshotUrl = false,
  onDeleteTrigger,
  onCustomPreview,
}) => {
  const { status, percent, ossFile } = statusFile;
  const { name, ext } = splitFileName(statusFile.name);

  const ImgTag = memo(() => {
    return (
      <div className={styles.imageTag}>
        <span className="tagName">{ext.toUpperCase()}</span>
      </div>
    );
  });

  return (
    <>
      <div
        className={cls('status-file-container', styles.statusFileContainer)}
        style={{ width: mode === 'list' ? '100%' : 'auto' }}
      >
        {mode === 'card' && (
          <div className="status-file-card">
            {status === 'uploading' && (
              <div
                className="item-case uploading-case"
                style={{ width, height }}
              >
                <ImgTag />
                <div className="ellipsis originalFileName" title={name}>
                  {name}
                </div>
                <div className="progress">
                  <Progress
                    percent={percent}
                    status="active"
                    size={PROGRESS_SIZE}
                    strokeColor="#009688"
                  />
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="item-case error-case" style={{ width, height }}>
                <ImgTag />
                <div className="ellipsis originalFileName" title={name}>
                  {name}
                </div>
                <div className="status-file-shadow">
                  <div className="shadow-icon">
                    {showDelete && (
                      <span
                        className="shadow-icon-span"
                        onClick={() => onDeleteTrigger?.()}
                      >
                        <DeleteOutlined />
                        Delete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'list' && (
          <div className="status-file-list">
            {status === 'uploading' && (
              <div>
                <div
                  className={cls('listView', styles.listView)}
                  style={{ width: modeListItemWidth }}
                >
                  {showModeListSnapshotUrl ? (
                    <div className="snapshotUrl">
                      <Image
                        src={DEFAULT_URL}
                        width={48}
                        height={20}
                        style={{ objectFit: 'cover' }}
                        preview={false}
                        placeholder={<ImageLoading width={48} height={20} />}
                        fallback={DEFAULT_URL}
                      />
                    </div>
                  ) : (
                    <PaperClipOutlined />
                  )}
                  <div className="file-type ellipsis">
                    <div className="ellipsis">
                      <Tooltip title={statusFile.name} placement="topLeft">
                        {statusFile.name}
                      </Tooltip>
                    </div>
                    <div className="progress">
                      <Progress
                        percent={percent}
                        status="active"
                        size={PROGRESS_SIZE}
                        strokeColor="#009688"
                      />
                    </div>
                  </div>
                  <span className="operate"></span>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div
                className={cls('listView error', styles.listView)}
                style={{ width: modeListItemWidth }}
              >
                {showModeListSnapshotUrl ? (
                  <div className="snapshotUrl">
                    <Image
                      className="snapshotUrl"
                      src={DEFAULT_URL}
                      width={48}
                      height={20}
                      style={{ objectFit: 'cover' }}
                      preview={false}
                      placeholder={<ImageLoading width={48} height={20} />}
                      fallback={DEFAULT_URL}
                    />
                  </div>
                ) : (
                  <PaperClipOutlined />
                )}
                <span
                  className="file-type ellipsis"
                  style={{
                    color: 'var(--danger-color)',
                  }}
                >
                  <Tooltip title={statusFile.name} placement="topLeft">
                    {statusFile.name}
                  </Tooltip>
                </span>
                <span className="operate">
                  {/* <Divider type="vertical" orientation="center" /> */}
                  {showDelete && (
                    <Button
                      type="link"
                      icon={
                        <DeleteOutlined
                          style={{
                            fontSize: '14px',
                            color: 'var(--danger-color)',
                          }}
                        />
                      }
                      onClick={() => onDeleteTrigger?.()}
                    />
                  )}
                </span>
              </div>
            )}
          </div>
        )}
        {status === 'done' && ossFile && (
          <FileItemView
            key={ossFile.documentId}
            mode={mode}
            width={width}
            height={height}
            modeListItemWidth={'100%'}
            className={styles.file_item}
            originalFileName={ossFile.originalFileName}
            documentId={ossFile.documentId}
            snapshotUrl={ossFile.snapshotUrl}
            showPreview={showPreview}
            showDownload={showDownload}
            showDelete={showDelete}
            onDeleteTrigger={() => onDeleteTrigger?.()}
            onCustomPreview={() => onCustomPreview?.()}
          />
        )}
      </div>
    </>
  );
};

export default StatusFileItem;
