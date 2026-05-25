import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useState } from 'react';
import styles from './index.less';

export interface IFloatButtonItem {
  anchorId: string;
  description: string;
  tooltip?: string;
}

interface IProps {
  anchorList: IFloatButtonItem[];
  useBackTop?: boolean;
  visibilityHeight?: number;
}

const CustomFloatButton: FC<IProps> = ({
  anchorList,
  useBackTop = true,
  visibilityHeight = 100,
}) => {
  const [open, setOpen] = useState<boolean>(true);
  const [innerOpen, setInnerOpenOpen] = useState<boolean>(true);

  const onClick = useCallback(() => {
    if (innerOpen) {
      setOpen(false);
    } else {
      setOpen(!open);
    }
  }, [open, innerOpen]);

  const handleClickItem = useCallback((item: IFloatButtonItem) => {
    const element = document.getElementById(item.anchorId);
    if (element) {
      element?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  return (
    <>
      <div className={cls('float-btn-wrap', styles.floatBtnWrap)}>
        <FloatButton.Group
          shape="square"
          trigger="click"
          open={open}
          onOpenChange={setInnerOpenOpen}
          className="float-btn-wrap"
          icon={<DownOutlined />}
          closeIcon={<CloseOutlined />}
          onClick={onClick}
        >
          {useBackTop && (
            <FloatButton.BackTop visibilityHeight={visibilityHeight} />
          )}
          {anchorList.map((item) => (
            <FloatButton
              key={item.anchorId}
              icon={null}
              description={item.description}
              tooltip={item.tooltip}
              //   href={`#${item.anchorId}`}
              onClick={() => handleClickItem(item)}
            />
          ))}
        </FloatButton.Group>
      </div>
    </>
  );
};

export default CustomFloatButton;
