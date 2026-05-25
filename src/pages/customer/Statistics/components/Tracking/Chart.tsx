import { crmStatisticTrackingChart } from '@/api/statistics';
import { ICrmStatisticTrackingChart } from '@/api/types/statistics';
import { useSize } from 'ahooks';
import { Empty, Flex } from 'antd';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { FC, useEffect, useRef, useState } from 'react';
import { useGlobalFilter } from '../../GlobalFilterContext';
import SkeletonView from '../SkeletonView';

const Chart: FC = () => {
  const { globalFilter } = useGlobalFilter();
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState<ICrmStatisticTrackingChart>();
  const containerRef = useRef<HTMLDivElement>(null); // summary Dom实例
  const size = useSize(containerRef);
  const chartInstanceRef = useRef<echarts.ECharts>();
  const fetchChartData = async () => {
    setChartLoading(true);

    const { bu, bdUserRoleIds } = globalFilter;
    const res = await crmStatisticTrackingChart({
      bu,
      bdUserRoleIds,
      minCreatedAt: dayjs(globalFilter.startTime).format('YYYY-MM-DD 00:00:00'),
      maxCreatedAt: dayjs(globalFilter.endTime).format('YYYY-MM-DD 23:59:59'),
    }).finally(() => {
      setChartLoading(false);
    });

    if (res.code === 200) {
      setChartData(res.data);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [
    globalFilter.bu,
    globalFilter.bdUserRoleIds,
    globalFilter.timeOption,
    globalFilter.startTime,
    globalFilter.endTime,
    globalFilter.retryCount,
  ]);

  useEffect(() => {
    chartInstanceRef.current?.resize();
  }, [size]);

  useEffect(() => {
    if (chartData) {
      const {
        pic,
        opportunityCreation,
        currPeriodCreatedAndClosed,
        prevCreatedCurrClosed,
      } = chartData;

      if (pic?.length > 0) {
        const options = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            top: 40,
            left: 100,
            right: 20,
            bottom: 40,
          },
          legend: {
            type: 'scroll',
            padding: [0, 0],
            data: [
              'Opportunity Creation',
              'Curr Period Created and Closed',
              'Prev Created Curr Closed',
            ],
          },
          color: ['#597EF7', '#52C41A', '#38B09C'],
          xAxis: {
            type: 'value',
          },
          yAxis: {
            type: 'category',
            data: pic,
            inverse: true,
            interval: 20,
            // axisTick: { show: false },
            axisLabel: {
              interval: 0,
              width: 80,
              overflow: 'truncate',
              ellipsis: '...',
            },
            axisPointer: {
              label: {
                show: true,
              },
            },
          },
          series: [
            {
              name: 'Opportunity Creation',
              type: 'bar',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: opportunityCreation,
            },
            {
              name: 'Curr Period Created and Closed',
              type: 'bar',
              barMaxWidth: 40,
              stack: 'total',
              emphasis: {
                focus: 'series',
              },
              data: currPeriodCreatedAndClosed,
            },
            {
              name: 'Prev Created Curr Closed',
              type: 'bar',
              barMaxWidth: 40,
              stack: 'total',
              emphasis: {
                focus: 'series',
              },
              data: prevCreatedCurrClosed,
            },
          ],
        };

        chartInstanceRef.current = echarts.init(containerRef.current);
        chartInstanceRef.current?.setOption(options);
        chartInstanceRef.current?.resize();
      } else {
        chartInstanceRef.current?.clear();
      }
    } else {
      chartInstanceRef.current?.dispose();
    }
  }, [chartData]);

  return (
    <>
      {chartLoading ? (
        <SkeletonView />
      ) : (
        <>
          {chartData && chartData?.pic?.length > 0 ? (
            <div ref={containerRef} style={{ height: '100%' }} />
          ) : (
            <Flex justify="center" align="center" style={{ height: '100%' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No Data"
              />
            </Flex>
          )}
        </>
      )}
    </>
  );
};

export default Chart;
