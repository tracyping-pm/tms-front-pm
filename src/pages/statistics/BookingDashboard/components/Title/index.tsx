import CustomTooltip from '@/components/CustomTooltip';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Button } from 'antd';
import cls from 'classnames';
import { FC, ReactNode, useEffect } from 'react';
import styles from './index.less';

interface ITitle {
  className?: string;

  containerRef?: React.RefObject<HTMLDivElement>;
  showFullScreen?: boolean;
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  tooltip?: ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  controlled?: boolean;
  newIsFullscreen?: boolean;
  newToggleFullscreen?: () => void;
}

const Title: FC<ITitle> = ({
  title,
  showFullScreen = false,
  containerRef,
  subTitle,
  tooltip,
  extra,
  className,
  style,
  controlled = false,
  newIsFullscreen = false,
  newToggleFullscreen, // 父子组件同时控制按钮
}) => {
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(containerRef, {
    pageFullscreen: { zIndex: 800 },
  });

  let scrollTop = 0;

  const lockBodyScroll = () => {
    scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const unlockBodyScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollTop);
  };

  useEffect(() => {
    if (isFullscreen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    return () => unlockBodyScroll();
  }, [isFullscreen]);

  return (
    <>
      <div className={cls(styles.titleWrap, className)} style={style}>
        <div className="left">
          <div className="title">
            <span className="mainTitle">{title}</span>
            {tooltip && (
              <span className="tooltip">
                <CustomTooltip title={tooltip} placement="top">
                  <QuestionCircleOutlined />
                </CustomTooltip>
              </span>
            )}
            <span className="extra">{extra}</span>
          </div>
        </div>
        {showFullScreen && (
          <Button
            icon={
              isFullscreen || newIsFullscreen ? (
                <FullscreenExitOutlined />
              ) : (
                <FullscreenOutlined />
              )
            }
            color="default"
            variant="link"
            style={{ fontSize: '20px' }}
            onClick={() => {
              if (controlled) {
                newToggleFullscreen?.();
              } else {
                toggleFullscreen();
              }
            }}
          />
        )}
      </div>
      {subTitle && <div className={styles.subTitle}>{subTitle}</div>}
    </>
  );
};

export default Title;
