import { BELONG_IMG_EXTS } from '@/constants';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
} from '@ant-design/icons';
import { App, Image } from 'antd';
import { memo, useEffect, useState } from 'react';
import defaultURL from '../../../public/svg/default-sku.svg';
import { downloadFile, getExts } from '../CustomUpload/fileSupport';
import styles from './styles.less';

const DEFAULT_URL = defaultURL;

export default memo(function NoRequestFileItem(props: {
  className?: string;
  width?: number;
  height?: number;
  file: File;
  showDelete?: boolean;
  onDeleteTrigger?: () => void;
  onCustomPreview?: () => void;
}) {
  const { modal } = App.useApp();
  const {
    className,
    file,
    width = 120,
    height = 120,
    showDelete = false,
    onDeleteTrigger,
    onCustomPreview,
  } = props;
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [fileSrc, setFileSrc] = useState<string>(DEFAULT_URL);

  const fileType = getExts(file);
  const isBelongImg = BELONG_IMG_EXTS.includes(fileType);

  const handlePreview = async () => {
    if (onCustomPreview) {
      onCustomPreview();
      return;
    }
    setPreviewVisible(true);
  };

  const handleDownLoad = async () => {
    downloadFile(file);
  };

  const handleDelete = () => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm delete the file?',
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
          {fileType?.slice(1)?.toUpperCase()}
        </span>
      </div>
    );
  });

  useEffect(() => {
    if (isBelongImg) {
      const src = URL.createObjectURL(file);
      setFileSrc(src);
    } else {
      setFileSrc(DEFAULT_URL);
    }
  }, []);

  return (
    <>
      <div
        className={`${styles.file_item} ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <ImgTag />
        <Image
          src={fileSrc}
          width={width}
          height={width}
          style={{ objectFit: 'cover' }}
          preview={{
            visible: previewVisible,
            src: fileSrc,
            onVisibleChange: (value) => {
              setPreviewVisible(value);
            },
          }}
          fallback={DEFAULT_URL}
        />
        <div
          className={styles.file_item_shadow}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <div className={styles.file_item_shadow_icon}>
            {isBelongImg ? (
              <span
                className={styles.file_item_shadow_icon_span}
                onClick={handlePreview}
              >
                <EyeOutlined className={styles.file_item_shadow_icon} />
                Preview
              </span>
            ) : (
              <span
                className={styles.file_item_shadow_icon_span}
                onClick={handleDownLoad}
              >
                <ArrowDownOutlined className={styles.file_item_shadow_icon} />
                Download
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
    </>
  );
});
