import { StatisticRankTypeEnum, StatisticRankTypeEnumText } from '@/constants';
import { formatAmountWithRound } from '@/utils/utils';
import { useSize } from 'ahooks';
import { Empty, Flex } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const BarChart = ({
  dataSource,
  rankType,
}: {
  dataSource: { name: string[]; value: number[] };
  rankType: StatisticRankTypeEnum;
}) => {
  const wrapperRef = useRef(null);
  const size = useSize(wrapperRef);
  const echartsWrapperRef = useRef<HTMLDivElement>(null);
  const eChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    eChartRef.current?.resize();
  };

  useEffect(() => {
    const BAR_WIDTH = 'auto';
    if (!dataSource?.name?.length) {
      return;
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          const name = params[0].name;

          let rel = `<strong>${name}</strong>`;

          params.forEach((item: any) => {
            const value = formatAmountWithRound(item.value);
            rel += `  <div>
                 
              <div>${item.marker} ${StatisticRankTypeEnumText[rankType]} : <strong>${value}</strong> ${rankType === StatisticRankTypeEnum.GM ? '%' : ''}</div>
            </div>`;
          });

          return rel;
        },
      },

      grid: {
        top: 30,
        left: 20,
        right: 30,
        bottom: 25,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dataSource?.name,
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
        axisLabel: {
          rotate: -65,
          interval: 0,
          width: 85,
          overflow: 'truncate',
        },
        tooltip: {
          show: true,
        },
      },
      yAxis: [
        {
          type: 'value',
        },
      ],
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
          showDetail: false,
        },
      ],

      series: [
        {
          color: '#009688',
          type: 'bar',
          barMaxWidth: BAR_WIDTH,
          data: dataSource?.value || [],
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
    eChartRef.current = echarts.init(
      echartsWrapperRef.current as HTMLDivElement,
    );
    eChartRef.current?.setOption(option);
    resizeAll();
  }, [dataSource]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <div style={{ width: '100%' }}>
      <div ref={wrapperRef} style={{ width: '100%', height: 630 }}>
        {dataSource?.name?.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            style={{ width: '100%', height: '100%' }}
          >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
          </Flex>
        ) : (
          <div
            ref={echartsWrapperRef}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default BarChart;
