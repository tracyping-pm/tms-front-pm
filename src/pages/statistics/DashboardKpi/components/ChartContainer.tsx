import React from 'react';
import { ChartContainerProps } from '../types';
import FullscreenButton from './FullscreenButton';

/**
 * 可复用的图表容器组件，包含全屏功能
 */
const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  chartRef,
  isFullscreen,
  toggleFullscreen,
  className = 'column-item',
  style,
}) => {
  return (
    <div className={className} ref={chartRef} style={style}>
      <FullscreenButton
        isFullscreen={isFullscreen}
        onClick={toggleFullscreen}
      />
      {children}
    </div>
  );
};

export default ChartContainer;
