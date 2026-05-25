import { ossGetDownloadUrl, ossGetPreviewUrl } from '@/api-uam/oss';
import { BELONG_IMG_EXTS, SUPPORT_OSS_PREVIEW_TYPE } from '@/constants';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Button, Divider, Image, Popconfirm, Spin, Tooltip } from 'antd';
import cls from 'classnames';
import { memo, useState } from 'react';
import defaultURL from '../../../public/svg/default-sku.svg';
import { splitFileName } from '../CustomUpload/fileSupport';
import IframeModal, {
  IIFrameModalState,
  initialIframeModalState,
} from '../IframeModal';
import ImageLoading from '../ImageLoading';
import styles from './index.less';

const BELONG_IMG_LIST = BELONG_IMG_EXTS.map((item) => item.split('.')[1]);
const DEFAULT_URL = defaultURL;

export default memo(function FileItemView(props: {
  mode?: 'card' | 'list';
  width?: number | string;
  height?: number | string;
  modeListItemWidth?: number | string;
  className?: string;
  snapshotUrl?: string;
  originalFileName: string;
  documentId: number;
  showPreview?: boolean;
  showDownload?: boolean;
  showDelete?: boolean;
  showModeListSnapshotUrl?: boolean;
  loading?: boolean;
  confirmContent?: string;
  onDeleteTrigger?: () => void;
  onCustomPreview?: () => void;
  onCustomDownload?: () => void;
}) {
  const {
    mode = 'card',
    width = 120,
    height = 120,
    modeListItemWidth = 256,
    className,
    snapshotUrl,
    originalFileName,
    documentId,
    showPreview = true,
    showDownload = true,
    showDelete = true,
    showModeListSnapshotUrl = false,
    loading = false,
    confirmContent = 'Confirm delete the file?',
    onDeleteTrigger,
    onCustomPreview,
    onCustomDownload,
  } = props;
  const [previewPending, setPreviewPending] = useState<boolean>(false);
  const [downloadPending, setDownloadPending] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [originImageSrc, setOriginImageSrc] = useState<string>('');
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const { ext } = splitFileName(originalFileName);
  const isBelongImg = BELONG_IMG_LIST.includes(ext?.toLowerCase());

  const handlePreviewImg = async () => {
    if (onCustomPreview) {
      onCustomPreview();
      return;
    }

    setPreviewPending(true);
    const res = await ossGetPreviewUrl({ documentId }).finally(() => {
      setPreviewPending(false);
    });
    if (res.code === 200) {
      setOriginImageSrc(res.data);
      setPreviewVisible(true);
    }
  };

  const handlePreviewOssFile = async () => {
    setPreviewPending(true);
    const res = await ossGetPreviewUrl({ documentId }).finally(() => {
      setPreviewPending(false);
    });
    if (res.code === 200) {
      setIframeModalState({
        url: res.data,
        open: true,
      });
    }
  };

  const handleDownLoad = async () => {
    if (onCustomDownload) {
      onCustomDownload();
      return;
    }
    setDownloadPending(true);
    const res = await ossGetDownloadUrl({
      documentId,
    }).finally(() => {
      setDownloadPending(false);
    });
    if (res.code === 200) {
      const link = document.createElement('a');
      link.href = res.data;
      link.download = originalFileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleDelete = () => {
    onDeleteTrigger?.();
  };

  const ImgTag = memo(() => {
    return (
      <div className={styles.file_item_otherTag}>
        <span className={styles.file_item_tagName}>{ext?.toUpperCase()}</span>
      </div>
    );
  });

  return (
    <>
      {mode === 'card' ? (
        <Spin spinning={previewPending || downloadPending || loading}>
          <div
            className={`${styles.file_item} ${className}`}
            style={{ width, height }}
          >
            {/*<div className={styles.file_item_tag}>PNG</div>*/}
            <ImgTag />
            <Image
              src={snapshotUrl ?? DEFAULT_URL}
              width={width}
              height={height}
              style={{ objectFit: 'cover' }}
              preview={{
                visible: previewVisible,
                src: originImageSrc,
                onVisibleChange: (value) => {
                  setPreviewVisible(value);
                },
              }}
              placeholder={<ImageLoading />}
              fallback={DEFAULT_URL}
            />
            <div
              className={styles.file_item_shadow}
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <div className={styles.file_item_shadow_icon}>
                {showPreview && (
                  <span
                    className={styles.file_item_shadow_icon_span}
                    onClick={
                      isBelongImg ? handlePreviewImg : handlePreviewOssFile
                    }
                  >
                    <EyeOutlined className={styles.file_item_shadow_icon} />
                    Preview
                  </span>
                )}
                {showDownload && (
                  <span
                    className={styles.file_item_shadow_icon_span}
                    onClick={handleDownLoad}
                  >
                    <ArrowDownOutlined
                      className={styles.file_item_shadow_icon}
                    />
                    Download
                  </span>
                )}
                {showDelete && (
                  <Popconfirm
                    title={confirmContent}
                    onConfirm={() => handleDelete()}
                    placement="leftTop"
                    okText="Yes"
                    cancelText="No"
                  >
                    <span className={styles.file_item_shadow_icon_span}>
                      <DeleteOutlined
                        className={styles.file_item_shadow_icon}
                      />
                      Delete
                    </span>
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>
        </Spin>
      ) : (
        <div
          className={cls('listView', styles.listView)}
          style={{ width: modeListItemWidth }}
        >
          {showModeListSnapshotUrl ? (
            <div className="snapshotUrl">
              <Image
                src={snapshotUrl ?? DEFAULT_URL}
                width={48}
                height={20}
                style={{ objectFit: 'cover' }}
                preview={
                  previewVisible
                    ? {
                        visible: previewVisible,
                        src: originImageSrc,
                        onVisibleChange: (value) => {
                          setPreviewVisible(value);
                        },
                      }
                    : false
                }
                placeholder={<ImageLoading width={48} height={20} />}
                fallback={DEFAULT_URL}
              />
            </div>
          ) : (
            <PaperClipOutlined />
          )}
          <span className="file-type ellipsis">
            <Tooltip title={originalFileName} placement="topLeft">
              {originalFileName}
            </Tooltip>
          </span>
          <span className="operate">
            {isBelongImg ? (
              <Button
                type="link"
                icon={<EyeOutlined style={{ fontSize: '14px' }} />}
                loading={previewPending}
                onClick={handlePreviewImg}
              />
            ) : (
              <Tooltip
                title={
                  SUPPORT_OSS_PREVIEW_TYPE.includes(ext?.toLowerCase())
                    ? ''
                    : 'Preview is not supported!'
                }
              >
                <Button
                  disabled={
                    !SUPPORT_OSS_PREVIEW_TYPE.includes(ext?.toLowerCase())
                  }
                  type="link"
                  icon={<EyeOutlined style={{ fontSize: '14px' }} />}
                  loading={previewPending}
                  onClick={handlePreviewOssFile}
                />
              </Tooltip>
            )}
            <Divider type="vertical" orientation="center" />
            <Button
              type="link"
              icon={<DownloadOutlined style={{ fontSize: '14px' }} />}
              loading={downloadPending}
              onClick={handleDownLoad}
            />
            {showDelete && (
              <>
                <Divider type="vertical" orientation="center" />
                <Popconfirm
                  title={confirmContent}
                  onConfirm={() => handleDelete()}
                  placement="topLeft"
                  align={{ offset: [12, -10] }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="link"
                    icon={<DeleteOutlined style={{ fontSize: '14px' }} />}
                  />
                </Popconfirm>
              </>
            )}
          </span>
        </div>
      )}
      <IframeModal
        url={iframeModalState.url}
        open={iframeModalState.open}
        onCancel={() => setIframeModalState({ open: false })}
      />
    </>
  );
});
