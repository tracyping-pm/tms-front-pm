import { IVendorAnalysisCapacityStatisticItem } from '@/api/types/statistics';
import { useSize } from 'ahooks';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { FC, useEffect, useRef } from 'react';

interface IChartProps {
  dataSource: IVendorAnalysisCapacityStatisticItem[];
}

const Charts: FC<IChartProps> = ({ dataSource }) => {
  const wrapperRef = useRef(null);
  const size = useSize(wrapperRef);
  const echartsWrapperRef = useRef<HTMLDivElement>(null);
  const eChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    eChartRef.current?.resize();
  };

  useEffect(() => {
    const data: {
      yearMonthList: string[];
      lostVendorList: number[];
      existingActiveVendorList: number[];
      retentionRateList: number[];
      existingReactiveVendorList: number[];
      newVendorList: number[];
    } = {
      yearMonthList: [],
      lostVendorList: [],
      existingActiveVendorList: [],
      retentionRateList: [],
      existingReactiveVendorList: [],
      newVendorList: [],
    };

    dataSource.forEach((item) => {
      data.yearMonthList.push(item.yearMonth);
      data.lostVendorList.push(item.lostVendor);
      data.existingActiveVendorList.push(item.existingActiveVendor);
      data.retentionRateList.push(item.retentionRate);
      data.existingReactiveVendorList.push(item.existingReactiveVendor);
      data.newVendorList.push(item.newVendor);
    });

    const TOP_RADIUS = [4, 4, 0, 0]; // 上圆角
    const NO_RADIUS = [0, 0, 0, 0];
    // const BAR_WIDTH = 14;

    const processStackData = () => {
      const {
        yearMonthList,
        existingActiveVendorList,
        existingReactiveVendorList,
        newVendorList,
      } = data;

      const activeSeriesData: any[] = [];
      const reactiveSeriesData: any[] = [];
      const newSeriesData: any[] = [];

      yearMonthList.forEach((_, index) => {
        const valActive = existingActiveVendorList[index] || 0;
        const valReactive = existingReactiveVendorList[index] || 0;
        const valNew = newVendorList[index] || 0;

        let activeRadius = NO_RADIUS;
        let reactiveRadius = NO_RADIUS;
        let newRadius = NO_RADIUS;

        if (valNew > 0) {
          newRadius = TOP_RADIUS;
        } else if (valReactive > 0) {
          reactiveRadius = TOP_RADIUS;
        } else if (valActive > 0) {
          activeRadius = TOP_RADIUS;
        }

        // 构建带样式的 item
        activeSeriesData.push({
          value: valActive,
          itemStyle: { borderRadius: activeRadius },
        });

        reactiveSeriesData.push({
          value: valReactive,
          itemStyle: { borderRadius: reactiveRadius },
        });

        newSeriesData.push({
          value: valNew,
          itemStyle: { borderRadius: newRadius },
        });
      });

      return { activeSeriesData, reactiveSeriesData, newSeriesData };
    };

    // 执行处理
    const { activeSeriesData, reactiveSeriesData, newSeriesData } =
      processStackData();

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
        axisPointer: {
          type: 'shadow',
        },
        // 自定义 Tooltip，将负数显示为正数
        formatter: function (params: any) {
          const index = params[0].dataIndex;
          const rawDate = data.yearMonthList[index];
          const headerDate = dayjs(rawDate).locale('en').format('MMM YYYY');
          let rel = `<div><strong>${headerDate}</strong></div>`;

          params.forEach((item: any) => {
            // if (item.value === 0) return;

            const value =
              item.seriesName === 'Retention Rate'
                ? Math.abs(item.value) + '%'
                : Math.abs(item.value);
            rel += `<div>${item.marker} ${item.seriesName} : <strong>${value}</strong></div>`;
          });

          return rel;
        },
      },
      legend: {
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        data: [
          'Lost Vendor',
          'Existing Active Vendor',
          'Existing Reactive Vendor',
          'New Vendor',
          'Retention Rate',
        ],
      },
      grid: {
        top: '10%',
        left: 20,
        right: 30,
        bottom: 12,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.yearMonthList.map((item) =>
          dayjs(item).locale('en').format('MMM'),
        ),
        axisTick: {
          show: true,
          alignWithLabel: true,
        },
        tooltip: {
          show: true,
        },
      },
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: function (value: number) {
              return Math.abs(value);
            },
          },
        },
        {
          type: 'value',
          min: (v: any) => -v.max,
          max: (v: any) => v.max,
          splitLine: {
            show: false,
          },
          alignTicks: true,
          axisLabel: {
            formatter: (v: number) => (v < 0 ? '' : `${v.toFixed(2)}%`),
          },
        },
      ],
      series: [
        {
          color: '#FF4D4F',
          name: 'Lost Vendor',
          type: 'bar',
          // 数据预处理，转为负数
          data: data.lostVendorList.map((v) => -v),
          // barWidth: BAR_WIDTH,
          emphasis: {
            focus: 'self',
          },
          itemStyle: {
            borderRadius: [0, 0, 4, 4],
          },
        },
        {
          color: '#52C41A',
          name: 'Existing Active Vendor',
          type: 'bar',
          stack: 'total',
          data: activeSeriesData,
          // barWidth: BAR_WIDTH,
          emphasis: {
            focus: 'self',
          },
        },
        {
          color: '#FA8C16',
          name: 'Existing Reactive Vendor',
          type: 'bar',
          stack: 'total',
          data: reactiveSeriesData,
          // barWidth: BAR_WIDTH,
          emphasis: {
            focus: 'self',
          },
        },
        {
          color: '#1677FF',
          name: 'New Vendor',
          type: 'bar',
          stack: 'total',
          data: newSeriesData,
          // barWidth: BAR_WIDTH,
          emphasis: {
            focus: 'self',
          },
        },
        {
          color: '#009688',
          name: 'Retention Rate',
          type: 'line',
          symbol: 'none',
          data: data.retentionRateList,
          yAxisIndex: 1,
          // barWidth: BAR_WIDTH,
          emphasis: {
            focus: 'self',
          },
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
    <>
      <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
        <div
          ref={echartsWrapperRef}
          style={{ width: '100%', height: '100%', minHeight: '300px' }}
        />
      </div>
    </>
  );
};

export default Charts;
