import { materialFile, materialImage, materialPreview } from '@/api/common';
import { BELONG_IMG_EXTS } from '@/constants';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { App, Button, Divider, Image, Spin, Tooltip } from 'antd';
import cls from 'classnames';
import { memo, useState } from 'react';
import defaultURL from '../../../public/svg/default-sku.svg';
import IframeModal, {
  IIFrameModalState,
  initialIframeModalState,
} from '../IframeModal';
import ImageLoading from '../ImageLoading';
import styles from './styles.less';

const BELONG_IMG_LIST = BELONG_IMG_EXTS.map((item) => item.split('.')[1]);
const DEFAULT_URL = defaultURL;

export default memo(function CommonFileItem(props: {
  mode?: 'card' | 'list';
  width?: number | string;
  height?: number | string;
  modeListItemWidth?: number | string;
  className?: string;
  thumbnail?: string;
  fileType: string;
  fileName: string;
  materialId: number | string;
  driveFileId: string;
  fileMimeType: string;
  showPreview?: boolean;
  showDownload?: boolean;
  showDelete?: boolean;
  showIconText?: boolean;
  showListThumbnail?: boolean;
  loading?: boolean;
  confirmContent?: string;
  onDeleteTrigger?: () => void;
  onCustomPreview?: () => void;
}) {
  const {
    mode = 'card',
    width = 120,
    height = 120,
    modeListItemWidth = 256,
    className,
    thumbnail,
    fileType = 'image',
    fileName,
    showPreview = true,
    showDownload = true,
    showDelete = false,
    showIconText = true,
    showListThumbnail = true,
    fileMimeType,
    driveFileId,
    materialId,
    loading = false,
    confirmContent = 'Confirm delete the file?',
    onDeleteTrigger,
    onCustomPreview,
  } = props;

  const { modal } = App.useApp();
  const [previewPending, setPreviewPending] = useState<boolean>(false);
  const [downloadPending, setDownloadPending] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [originImageSrc, setOriginImageSrc] = useState<string>('');
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);

  const isBelongImg = BELONG_IMG_LIST.includes(fileType);

  const handlePreviewDrive = async () => {
    // const urlMap = {
    //   url1: 'https://docs.google.com/document/d/1DYV0qr6m1KY3BZGJuLfEz-4GjUxgD99yVYVL1qMwAoo/preview#heading=h.x71y81r1p95u',
    //   url2: 'https://docs.google.com/spreadsheets/d/1Dy7JgiUbjtWFnUlITqFPQ_mHJiDk8Lcyei-CrS6qBms/preview',
    //   url3: 'https://docs.google.com/presentation/d/10CR6BfAg4_hwCmcWRyspDkH_T3SisOdUwZBSKk3kMwc/preview',
    //   url4: 'https://docs.google.com/drawings/d/1_XDulqaTrm5zUqff8JqUDU6cFQsF6iSBCbGYM4ztcEM/preview',
    //   url5: 'https://drive.google.com/file/d/1aHONrl4Mk9XVX4b4Ld9Zqkv7MBD4JIjF/preview', // MP4
    //   url6: 'https://drive.google.com/file/d/18wcO8_o84v8Xb8bT-BTsQWpBWDy3Pb8D/preview', // ZIP
    //   url7: 'https://drive.google.com/file/d/18kYwOqbMyMYwRS9hGADlfAZdKwigLA_1/preview', // IMAGE
    // };

    // setIframeModalState({
    //   url: urlMap.url4,
    //   open: true,
    // });

    setPreviewPending(true);
    const res = await materialPreview({
      materialId: materialId,
      driveFileId: driveFileId,
    });
    setPreviewPending(false);

    if (res.code === 200) {
      setIframeModalState({
        url: res.data,
        open: true,
      });
    }
  };

  const handlePreviewImg = async () => {
    if (onCustomPreview) {
      onCustomPreview();
      return;
    }

    setPreviewPending(true);
    const payload = {
      materialId,
      driveFileId,
    };
    const res = await materialImage(payload);
    setPreviewPending(false);
    if (res.code === 200) {
      const src = `data:${fileMimeType};base64,${res.data}`;
      setOriginImageSrc(src);
      setPreviewVisible(true);
    }
  };

  const handleDownLoad = async () => {
    setDownloadPending(true);
    const payload = {
      materialId,
      driveFileId,
      fileName,
    };
    const res = await materialFile(payload);
    setDownloadPending(false);
    if (res.code === 200) {
      const link = document.createElement('a');
      link.href = res.data;
      link.download = `${fileName}.${fileType}`;

      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleDelete = () => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: confirmContent,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk() {
        onDeleteTrigger?.();
      },
      onCancel() {
        // do nothing
      },
    });
  };

  const ImgTag = memo(() => {
    return (
      <div className={styles.file_item_otherTag}>
        <span className={styles.file_item_tagName}>
          {fileType.toUpperCase()}
        </span>
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
              src={thumbnail ?? DEFAULT_URL}
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
                      isBelongImg ? handlePreviewImg : handlePreviewDrive
                    }
                  >
                    <EyeOutlined className={styles.file_item_shadow_icon} />
                    {showIconText ? 'Preview' : ''}
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
                    {showIconText ? 'Download' : ''}
                  </span>
                )}
                {showDelete && (
                  <span
                    className={styles.file_item_shadow_icon_span}
                    onClick={handleDelete}
                  >
                    <DeleteOutlined className={styles.file_item_shadow_icon} />
                    Delete
                  </span>
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
          {showListThumbnail ? (
            <div className="thumbnail">
              <Image
                src={thumbnail ?? DEFAULT_URL}
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
            <Tooltip title={fileName} placement="topLeft">
              {fileName}
            </Tooltip>
          </span>
          <span className="operate">
            <Button
              type="link"
              icon={<EyeOutlined style={{ fontSize: '14px' }} />}
              loading={previewPending}
              onClick={isBelongImg ? handlePreviewImg : handlePreviewDrive}
            />

            {showDownload && (
              <>
                <Divider type="vertical" orientation="center" />
                <Button
                  type="link"
                  icon={<DownloadOutlined style={{ fontSize: '14px' }} />}
                  loading={downloadPending}
                  onClick={handleDownLoad}
                />
              </>
            )}
            {showDelete && (
              <>
                <Divider type="vertical" orientation="center" />
                <Button
                  type="link"
                  icon={<DeleteOutlined style={{ fontSize: '14px' }} />}
                  onClick={handleDelete}
                />
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
