import { Image } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import defaultURL from '../../../public/svg/default-sku.svg';
import styles from './index.less';

const DEFAULT_FALLBACK = defaultURL;

export interface IImagePreviewGroup {
  visible: boolean;
  items: string[];
  index: number;
  fallback?: string;
  onIndexChange?: (index: number, prevIndex: number) => void;
  onClose: () => void;
}

const ImagePreviewGroup: FC<IImagePreviewGroup> = ({
  visible,
  index = 0,
  items,
  fallback = DEFAULT_FALLBACK,
  onIndexChange,
  onClose,
}) => {
  const [previewVisible, setPreviewVisible] = useState<boolean>(visible);
  const [current, setCurrent] = useState<number>(index);

  const onChange = useCallback((curr: number, prevCurrent: number) => {
    setCurrent(curr);
    onIndexChange?.(curr, prevCurrent);
  }, []);

  const onVisibleChange = useCallback((value: boolean) => {
    setPreviewVisible(value);
    if (!value) {
      onClose();
    }
  }, []);

  useEffect(() => {
    setPreviewVisible(visible);
    if (visible) {
      setCurrent(index);
    }
  }, [visible, index]);

  return (
    <>
      <div className={cls('image-preview-group', styles.imagePreviewGroup)}>
        <Image.PreviewGroup
          preview={{
            visible: previewVisible,
            current,
            maskClosable: false,
            onChange: onChange,
            onVisibleChange: onVisibleChange,
          }}
          items={items}
          fallback={fallback}
        />
      </div>
    </>
  );
};

export default ImagePreviewGroup;
