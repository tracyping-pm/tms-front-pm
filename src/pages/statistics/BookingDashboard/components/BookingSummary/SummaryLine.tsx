import { useSize } from 'ahooks';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
import styles from './index.less';
let emphasisStyle = {
  showSymbol: true,

  itemStyle: {
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.3)',
  },
};

const SummaryLine = ({ sourceData }: { sourceData: any }) => {
  const summaryRef = useRef(null);
  const size = useSize(summaryRef);
  const summaryLineRef = useRef<HTMLDivElement>(null);
  const summaryLineChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    summaryLineChartRef.current?.resize();
  };

  useEffect(() => {
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
      },
      legend: {
        icon: 'circle',
        data: ['Total Delivered', 'Total Committed'],
      },
      grid: {
        top: 26,
        left: 20,
        right: 30,
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: sourceData?.mouthDate,
        // triggerEvent: true,
        axisLabel: {
          interval: 0,
          // rotate: 70,
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'value',
      },

      series: [
        {
          color: '#009688',
          name: 'Total Delivered',
          type: 'line',
          data: sourceData?.delivered || [],
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          emphasis: emphasisStyle,

          lineStyle: {
            width: 2.5,
          },
          areaStyle: { color: 'rgba(0, 150, 136, 0.40)' },
        },
        {
          color: '#FA8C16',
          name: 'Total Committed',
          type: 'line',
          data: sourceData?.committed || [],
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          emphasis: emphasisStyle,

          lineStyle: {
            width: 2.5,
          },
          areaStyle: { color: 'rgba(242, 133, 50, 0.40)' },
        },
      ],
    };
    summaryLineChartRef.current = echarts.init(
      summaryLineRef.current as HTMLDivElement,
    );
    summaryLineChartRef.current?.setOption(option);
    resizeAll();
  }, [sourceData]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <>
      <div ref={summaryRef} className={styles.summaryLine}>
        <div ref={summaryLineRef} style={{ width: '100%', height: '400px' }} />
      </div>
    </>
  );
};

export default SummaryLine;
