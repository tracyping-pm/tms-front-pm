import { formatAmountWithRound, formatMoneyWithDecimal } from '@/utils/utils';
import { useSize } from 'ahooks';
import { Empty, Flex } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const PieChart = ({
  top = 15,
  time = '',
  dataSource = [],
}: {
  top?: number;
  time?: string;
  dataSource: { name: string; value: number }[];
}) => {
  const wrapperRef = useRef(null);
  const size = useSize(wrapperRef);
  const echartsWrapperRef = useRef<HTMLDivElement>(null);
  const eChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    eChartRef.current?.resize();
  };

  useEffect(() => {
    if (
      !dataSource?.length ||
      dataSource?.every?.((item) => item.value === 0)
    ) {
      return;
    }
    const option = {
      title: {
        text: `Top ${top} Project Revenue Ratio`,
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const name = params.name;
          const value = `${formatAmountWithRound(params.value)} (${formatMoneyWithDecimal(params.percent)}%)`;
          return `<div>
                  <div>${time}</div>
                  <div>${params.marker} ${name} : <strong>${value}</strong></div>
                </div>
              `;
        },
      },
      color: [
        '#009688',
        '#1890FF',
        '#A0D911',
        '#52C41A',
        '#13C2C2',
        '#2F54EB',
        '#FA8C16',
        '#F5222D',
        '#FA541C',
        '#FAAD14',
        '#FADB14',
      ],
      legend: {
        type: 'scroll',
        left: 'center',
        bottom: 0,
      },
      grid: {
        top: 30,
        left: 20,
        right: 30,
        bottom: 200,
        containLabel: true,
      },

      series: [
        {
          type: 'pie',
          radius: '35%',
          data: dataSource ?? [],
          center: ['50%', '38%'],
          avoidLabelOverlap: true,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          minShowLabelAngle: 1.7,
          label: {
            show: true,
            formatter: '{b}: {d}%',
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
        {dataSource?.every?.((item) => item.value === 0) ? (
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
    </>
  );
};

export default PieChart;
