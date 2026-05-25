import { IVendorAnalysisByVendorItem } from '@/api/types/statistics';
import { formatMoneyWithDecimal } from '@/utils/utils';
import { useSize } from 'ahooks';
import * as echarts from 'echarts';
import { FC, RefObject, useEffect, useRef } from 'react';

interface IChartProps {
  yearMonth: string;
  dataSource: IVendorAnalysisByVendorItem[];
  tableRef: RefObject<HTMLDivElement>;
}

const Charts: FC<IChartProps> = ({ yearMonth, dataSource, tableRef }) => {
  const wrapperRef = useRef(null);
  const size = useSize(wrapperRef);
  const tableSize = useSize(tableRef);
  const echartsWrapperRef = useRef<HTMLDivElement>(null);
  const eChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    eChartRef.current?.resize();
  };

  useEffect(() => {
    const data: {
      vendorList: string[];
      grossMarginList: number[];
    } = {
      vendorList: [],
      grossMarginList: [],
    };

    dataSource.reverse().forEach((item) => {
      data.vendorList.push(item.vendorName);
      data.grossMarginList.push(item.grossMargin);
    });

    console.log({ data });
    const zoomStartValue = data.vendorList[data.vendorList.length - 10];
    const zoomEndValue = data.vendorList[data.vendorList.length - 1];

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          let rel = `<div><strong>${yearMonth}</strong></div>`;

          params.forEach((item: any) => {
            // if (item.value === 0) return;

            const color = item.value > 0 ? '#52C41A' : '#FF4D4F';
            const formatValue = formatMoneyWithDecimal(item.value) + '%';
            rel += `<div>${item.axisValue}</div><div>Gross Margin: <span style="color: ${color}">${formatValue}</span></div>`;
          });

          return rel;
        },
      },
      grid: {
        top: '10%',
        left: 20,
        right: 50,
        bottom: 10,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        axisLabel: {
          formatter: function (value: number) {
            return formatMoneyWithDecimal(value) + '%';
          },
        },
      },
      yAxis: {
        type: 'category',
        data: data.vendorList,
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
        },
        tooltip: {
          show: true,
        },
      },
      dataZoom: {
        type: 'slider',
        yAxisIndex: 0,
        startValue: zoomStartValue,
        endValue: zoomEndValue,
        width: 30,
        brushSelect: true,
        zoomLock: false,
      },
      series: [
        {
          name: 'Gross Margin',
          type: 'bar',
          // 平滑曲线，大数据量下视觉更好
          smooth: true,
          data: data.grossMarginList.map((n) => ({
            value: n,
            itemStyle: { color: n > 0 ? '#52C41A' : '#FF4D4F' },
          })),
          label: {
            show: true,
            position: 'inside',
            hideOverlap: true,
            formatter: (params: any) => {
              return formatMoneyWithDecimal(params.value) + '%';
            },
            fontSize: 10,
            color: '#666',
          },
          //标签布局优化：防止标签溢出容器
          labelLayout: {
            hideOverlap: true,
            moveOverlap: 'shiftY', // 纵向偏移防重叠
          },
          // 优化 Emphasis：鼠标悬停时始终显示该点的标签且放大，保证交互性
          emphasis: {
            focus: 'series',
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              formatter: (params: any) =>
                formatMoneyWithDecimal(params.value) + '%',
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
  }, [size, tableSize]);

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
