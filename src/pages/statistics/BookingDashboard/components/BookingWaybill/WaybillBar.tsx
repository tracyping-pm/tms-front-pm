import { useSize } from 'ahooks';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
import styles from './index.less';

const WaybillBar = ({ sourceData }: { sourceData: any }) => {
  const waybillRef = useRef(null);
  const size = useSize(waybillRef);
  const waybillBarRef = useRef<HTMLDivElement>(null);
  const waybillBarChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    waybillBarChartRef.current?.resize();
  };

  useEffect(() => {
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        icon: 'rect',
        data: ['Total Delivered', 'Total Committed'],
      },
      grid: {
        top: 26,
        left: 20,
        right: 30,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sourceData?.customerName,
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
        axisLabel: {
          interval: 0,
          width: sourceData?.customerName?.length > 12 ? 130 : 180,
          overflow: 'truncate',
        },
        tooltip: {
          show: true,
        },
      },
      yAxis: {
        type: 'value',
      },

      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          startValue: 0,
          endValue: 11,
          height: 20,
          bottom: 5,
          brushSelect: false,
          zoomLock: true,
        },
      ],

      series: [
        {
          color: '#009688',
          name: 'Total Delivered',
          type: 'bar',
          data: sourceData?.delivered || [],
          barMaxWidth: '12px',
          emphasis: {
            focus: 'series',
          },
        },
        {
          color: '#FA8C16',
          name: 'Total Committed',
          type: 'bar',
          barMaxWidth: '12px',
          data: sourceData?.committed || [],
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
    waybillBarChartRef.current = echarts.init(
      waybillBarRef.current as HTMLDivElement,
    );
    waybillBarChartRef.current?.setOption(option);
    resizeAll();
  }, [sourceData]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <>
      <div ref={waybillRef} className={styles.waybillBar}>
        <div ref={waybillBarRef} style={{ width: '100%', height: '430px' }} />
      </div>
    </>
  );
};

export default WaybillBar;
