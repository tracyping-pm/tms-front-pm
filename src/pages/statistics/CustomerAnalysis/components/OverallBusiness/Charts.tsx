import { ICustomerAnalysisBusinessMonitorRecord } from '@/api/types/statistics';
import { formatAmount, formatAmountWithRound } from '@/utils/utils';
import { useSize } from 'ahooks';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

interface IEchartsData {
  month: string[];
  revenue: number[];
  cost: number[];
  grossProfit: number[];
  grossMargin: number[];
}
const Charts = ({
  dataSource,
}: {
  dataSource: ICustomerAnalysisBusinessMonitorRecord[];
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
    const data: IEchartsData = {
      month: [],
      revenue: [],
      cost: [],
      grossProfit: [],
      grossMargin: [],
    };
    dataSource.forEach((item) => {
      data.month.push(item.month);
      data.revenue.push(item.totalRevenue);
      data.cost.push(item.totalCost);
      data.grossProfit.push(item.grossProfit);
      data.grossMargin.push(item.grossMargin);
    });
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any[]) => {
          let html = `${params[0].axisValue}<br/>`;

          params.forEach((p) => {
            const name = p.seriesName;
            const color = p.color;
            const isGrossMargin = name === 'Gross Margin';
            const width = isGrossMargin ? 10 : 10;
            const height = isGrossMargin ? 2 : 10;
            const value = isGrossMargin
              ? `${formatAmount(p.value)}%`
              : formatAmountWithRound(p.value);

            html += `
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="
                    display:inline-block;
                    width:${width}px;
                    height:${height}px;
                    background:${color};
                  "></span>
                  ${name}: ${value}
                </div>
              `;
          });

          return html;
        },
      },
      legend: {
        left: 'center',
        icon: 'none',
        itemGap: -10,
        // 使用富文本自定义显示
        formatter: function (name: string) {
          if (name === 'Gross Margin') {
            return '{line|} ' + name;
          }
          return '{square|} ' + name;
        },

        textStyle: {
          rich: {
            square: {
              width: 8,
              height: 8,
              backgroundColor: function (params: { name: string }) {
                const colorMap = {
                  Revenue: option?.series?.[0]?.color,
                  Cost: option?.series?.[1]?.color,
                  'Gross Profit': option?.series?.[2]?.color,
                };
                const name = params.name as keyof typeof colorMap;
                return colorMap[name];
              },
              // verticalAlign: 'middle',
            },
            line: {
              width: 8,
              height: 2,
              backgroundColor: function () {
                return option?.series?.[3]?.color;
              },
              // verticalAlign: 'middle',
            },
          },
        },

        data: ['Revenue', 'Cost', 'Gross Profit', 'Gross Margin'],
      },
      grid: {
        top: 30,
        left: 20,
        right: 30,
        bottom: 12,
        containLabel: true,
      },
      yAxis: {
        type: 'category',
        data: data?.month,
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
        axisLabel: {
          interval: 0,
          // width: sourceData?.month?.length > 12 ? 130 : 180,
          overflow: 'truncate',
        },
        tooltip: {
          show: true,
        },
        inverse: true,
      },
      xAxis: [
        {
          type: 'value',
          axisTick: { show: false },
        },
        {
          type: 'value',
          splitLine: {
            show: false,
          },
          axisLabel: {
            formatter: '{value} %',
          },
        },
      ],

      series: [
        {
          color: '#FADB14',
          name: 'Revenue',
          type: 'bar',
          data: data?.revenue || [],
          barMaxWidth: BAR_WIDTH,
          emphasis: {
            focus: 'series',
          },
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (params: { value: number }) => {
              return params.value === 0
                ? ''
                : formatAmountWithRound(params.value);
            },
          },
        },
        {
          color: '#FA8C16',
          name: 'Cost',
          type: 'bar',
          data: data?.cost || [],
          barMaxWidth: BAR_WIDTH,
          emphasis: {
            focus: 'series',
          },
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (params: { value: number }) => {
              return params.value === 0
                ? ''
                : formatAmountWithRound(params.value);
            },
          },
        },
        {
          color: '#009688',
          name: 'Gross Profit',
          type: 'bar',
          barMaxWidth: BAR_WIDTH,
          data: data?.grossProfit || [],
          emphasis: {
            focus: 'series',
          },
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (params: { value: number }) => {
              return params.value === 0
                ? ''
                : formatAmountWithRound(params.value);
            },
          },
        },
        {
          color: '#1677FF',
          name: 'Gross Margin',
          type: 'line',
          symbol: 'none',
          xAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value: string) {
              return value + ' %';
            },
          },
          data: data?.grossMargin || [],
          emphasis: {
            focus: 'series',
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
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </>
  );
};

export default Charts;
