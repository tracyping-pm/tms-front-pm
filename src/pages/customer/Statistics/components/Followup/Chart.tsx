import { crmStatisticVolume } from '@/api/statistics';
import { ICrmStatisticVolume } from '@/api/types/statistics';
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
  const [chartData, setChartData] = useState<ICrmStatisticVolume>();
  const containerRef = useRef<HTMLDivElement>(null); // summary Dom实例
  const size = useSize(containerRef);
  const chartInstanceRef = useRef<echarts.ECharts>();
  const fetchChartData = async () => {
    setChartLoading(true);

    const { bu, bdUserRoleIds, rankedBy } = globalFilter;
    const res = await crmStatisticVolume({
      bu,
      bdUserRoleIds,
      rankedBy,
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
  }, [globalFilter]);

  useEffect(() => {
    chartInstanceRef.current?.resize();
  }, [size]);

  useEffect(() => {
    if (chartData) {
      const {
        x,
        creationCount,
        reachOut,
        successfulContacted,
        quotationRequestReceived,
        quotationSubmitted,
        successClosed,
        lost,
        canceled,
      } = chartData;

      if (x?.length > 0) {
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
              'Creation Number',
              'Reach out',
              'Successful Contacted',
              'Quotation Request Received',
              'Quotation Submitted',
              'Successful Closed',
              'Lost',
              'Canceled',
            ],
          },
          color: [
            '#597EF7',
            '#2F54EB',
            '#009688',
            '#38B09C',
            '#81C9B9',
            '#52C41A',
            '#FFD666',
            '#BFBFBF',
          ],
          xAxis: {
            type: 'value',
          },
          yAxis: {
            type: 'category',
            data: x,
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
              name: 'Creation Number',
              type: 'bar',
              stack: 'total',
              emphasis: {
                focus: 'series',
              },
              barMaxWidth: 40,
              data: creationCount,
            },
            {
              name: 'Reach out',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: reachOut,
            },
            {
              name: 'Successful Contacted',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: successfulContacted,
            },
            {
              name: 'Quotation Request Received',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: quotationRequestReceived,
            },
            {
              name: 'Quotation Submitted',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: quotationSubmitted,
            },
            {
              name: 'Successful Closed',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: successClosed,
            },
            {
              name: 'Lost',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: lost,
            },
            {
              name: 'Canceled',
              type: 'bar',
              stack: 'total',
              barMaxWidth: 40,
              emphasis: {
                focus: 'series',
              },
              data: canceled,
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
          {chartData && chartData?.x?.length > 0 ? (
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
