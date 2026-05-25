import { IActiveProjectStaticRecord } from '@/api/types/statistics';
import { formatAmount } from '@/utils/utils';
import { useSize } from 'ahooks';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const Charts = ({
  dataSource,
}: {
  dataSource: IActiveProjectStaticRecord[];
}) => {
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
      existingActiveProject: [],
      existingReactiveProject: [],
      lost: [],
      newProject: [],
    };
    dataSource.forEach((item: any) => {
      data.mouthDate.push(item.mouthDate);
      data.existingActiveProject.push(item.existingActiveProject);
      data.existingReactiveProject.push(item.existingReactiveProject);
      data.lost.push(item.lostProject);
      data.newProject.push(item.newProject);
    });
    const TOP_RADIUS = [4, 4, 0, 0]; // 上圆角
    const NO_RADIUS = [0, 0, 0, 0];
    const BAR_WIDTH = 'auto';
    const processStackData = () => {
      const {
        mouthDate,
        existingActiveProject,
        existingReactiveProject,
        newProject,
      } = data;

      const activeSeriesData: any[] = [];
      const reactiveSeriesData: any[] = [];
      const newSeriesData: any[] = [];

      mouthDate.forEach((_: string, index: number) => {
        const valActive = existingActiveProject[index] || 0;
        const valReactive = existingReactiveProject[index] || 0;

        const valNew = newProject[index] || 0;

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
          const rawDate = data?.mouthDate[index];
          const headerDate = dayjs(rawDate).locale('en').format('MMM YYYY');
          let rel = `<div><strong>${headerDate}</strong></div>`;

          params.forEach((item: any) => {
            const value = formatAmount(Math.abs(item.value));
            rel += `<div>${item.marker} ${item.seriesName} : <strong>${value}</strong></div>`;
          });

          return rel;
        },
      },
      legend: [
        {
          icon: 'rect',
          itemWidth: 8,
          itemHeight: 8,
          data: [
            'Lost Project',
            'Existing Active Project',
            'Existing Reactive Project',
            'New Project',
          ],
        },
      ],
      grid: {
        top: 30,
        left: 20,
        right: 30,
        bottom: 12,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data?.mouthDate.map((item: string) =>
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
          axisLabel: {
            formatter: function (value: number) {
              return Math.abs(value);
            },
          },
        },
      ],

      series: [
        {
          color: '#FF4D4F',
          name: 'Lost Project',
          type: 'bar',
          data: data?.lost?.map((v: number) => -v) || [],
          barMaxWidth: BAR_WIDTH,
          emphasis: {
            focus: 'series',
          },
          itemStyle: {
            borderRadius: [0, 0, 4, 4],
          },
        },
        {
          color: '#52C41A',
          name: 'Existing Active Project',
          type: 'bar',
          data: activeSeriesData || [],
          stack: 'total',
          barMaxWidth: BAR_WIDTH,
          emphasis: {
            focus: 'series',
          },
        },
        {
          color: '#FA8C16',
          name: 'Existing Reactive Project',
          type: 'bar',
          barMaxWidth: BAR_WIDTH,
          stack: 'total',
          data: reactiveSeriesData || [],
          emphasis: {
            focus: 'series',
          },
        },
        {
          color: '#1677FF',
          name: 'New Project',
          type: 'bar',
          barMaxWidth: BAR_WIDTH,
          stack: 'total',
          data: newSeriesData || [],
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
