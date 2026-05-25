import { formatAmountWithRound, formatMoneyWithDecimal } from '@/utils/utils';
import { useSize } from 'ahooks';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const Charts = ({ dataSource, type }: { dataSource: any[]; type: string }) => {
  const wrapperRef = useRef(null);
  const size = useSize(wrapperRef);
  const echartsWrapperRef = useRef<HTMLDivElement>(null);
  const eChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    eChartRef.current?.resize();
  };

  useEffect(() => {
    const data: any = {
      mouthDate: [],
      values: [],
    };
    dataSource.forEach((item) => {
      data.mouthDate.push(item.month);
      if (type === 'waybill') {
        data.values.push(item.waybillNum);
      } else if (type === 'revenue') {
        data.values.push(item.revenue);
      } else if (type === 'cost') {
        data.values.push(item.cost);
      } else if (type === 'grossProfit') {
        data.values.push(item.grossProfit);
      } else if (type === 'grossMargin') {
        data.values.push(item.grossMargin);
      }
    });
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          const index = params[0].dataIndex;
          const rawDate = data?.mouthDate[index];
          const headerDate = dayjs(rawDate).locale('en').format('MMM YYYY');
          let rel = `<strong>${headerDate}</strong>`;

          params.forEach((item: any) => {
            let value = item.value;

            if (type === 'grossMargin') {
              value = formatMoneyWithDecimal(item.value);
              rel += ` : <strong>${value}</strong>`;
              rel += `%`;
            } else {
              value = formatAmountWithRound(item.value);
              rel += ` : <strong>${value}</strong>`;
            }
          });

          return rel;
        },
      },

      grid: {
        top: 30,
        left: 20,
        right: 30,
        bottom: 12,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data?.mouthDate?.map((item: string) =>
          dayjs(item).locale('en').format('MMM'),
        ),
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
        axisLabel: {
          interval: 0,
          overflow: 'truncate',
        },
        tooltip: {
          show: true,
        },
      },
      yAxis: [
        {
          type: 'value',
          axisTick: { show: false },
          axisLabel: {
            formatter: function (value: number) {
              if (type === 'grossMargin') {
                return formatMoneyWithDecimal(value) + '%';
              } else {
                return formatAmountWithRound(value);
              }
            },
          },
        },
      ],

      series: [
        {
          color: '#009688',
          type: 'line',
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#009688',
          },
          data: data?.values || [],
          emphasis: {
            focus: 'series',
          },
          areaStyle: {
            color: 'rgba(0, 150, 136, 0.20)',
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              if (type === 'grossMargin') {
                return formatMoneyWithDecimal(params.value) + '%';
              } else {
                return formatAmountWithRound(params.value);
              }
            },
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
      <div ref={wrapperRef} style={{ width: '100%', height: 400 }}>
        <div
          ref={echartsWrapperRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </>
  );
};

export default Charts;
