import React from 'react';
import { IframeChartProps } from '../types';

/**
 * 可复用的 iframe 图表组件
 */
const IframeChart: React.FC<IframeChartProps> = ({
  src,
  width = '100%',
  height = '100%',
  className = 'grafana-iframe',
}) => {
  if (!src) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          color: '#999',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <iframe
      className={className}
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      style={{ border: 'none' }}
    />
  );
};

export default IframeChart;
