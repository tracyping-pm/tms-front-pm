import { ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import React from 'react';
import styles from '../index.less';
import { FullscreenButtonProps } from '../types';

/**
 * 可复用的全屏切换按钮组件
 */
const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  isFullscreen,
  onClick,
  className = styles.fullscreenBtn,
}) => {
  return (
    <div className="fullscreen-wrap" onClick={onClick}>
      {isFullscreen ? (
        <ShrinkOutlined className={className} />
      ) : (
        <ArrowsAltOutlined className={className} />
      )}
    </div>
  );
};

export default FullscreenButton;
