import { IBookingProjectTrendsByCustomerRecord } from '@/api/types/statistics';
import {
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
} from '@/enums';
import { useSize } from 'ahooks';
import { Badge, Flex, Select } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import Title from '../../../Title';
import styles from './index.less';

let emphasisStyle = {
  showSymbol: true,

  itemStyle: {
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.3)',
  },
};
export default function CustomerProjectLine({
  newIsFullscreen,
  newToggleFullscreen,
  sourceData,
  currentProject,
  projectSelectOptions,
  onSelectCurrentProject,
}: {
  newIsFullscreen: boolean;
  newToggleFullscreen: () => void;
  sourceData: IBookingProjectTrendsByCustomerRecord;
  currentProject?: { projectId: number; projectName: string };
  projectSelectOptions: any[];
  onSelectCurrentProject: (project: {
    projectId: number;
    projectName: string;
  }) => void;
}) {
  const [dataSource, setDataSource] = useState<any>();
  const projectTrendsRef = useRef(null);
  const size = useSize(projectTrendsRef);
  const projectTrendsLineRef = useRef<HTMLDivElement>(null);
  const projectTrendsChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    projectTrendsChartRef.current?.resize();
  };
  const initEcharts = (data: any) => {
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
        right: 40,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data?.mouthDate,
        axisLabel: {
          interval: 'auto',
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'value',
      },

      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          startValue: 0,
          endValue: 11,
          height: 20,
          bottom: 5,
          brushSelect: false,
        },
      ],

      series: [
        {
          color: '#009688',
          name: 'Total Delivered',
          type: 'line',
          data: data?.delivered || [],
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          emphasis: emphasisStyle,

          lineStyle: {
            width: 1.5,
          },
          areaStyle: { color: 'rgba(0, 150, 136, 0.40)' },
        },
        {
          color: '#FA8C16',
          name: 'Total Committed',
          type: 'line',
          data: data?.committed || [],
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          emphasis: emphasisStyle,

          lineStyle: {
            width: 1.5,
          },
          areaStyle: { color: 'rgba(242, 133, 50, 0.40)' },
        },
      ],
    };
    projectTrendsChartRef.current = echarts.init(
      projectTrendsLineRef.current as HTMLDivElement,
    );
    projectTrendsChartRef.current?.setOption(option);
    resizeAll();
  };
  function flattenProjectData(project: any) {
    return {
      projectName: project?.projectName,
      projectId: project?.projectId,
      mouthDate: project?.trendsVo?.map((v: any) => v.mouthDate),
      delivered: project?.trendsVo?.map((v: any) => v.delivered),
      committed: project?.trendsVo?.map((v: any) => v.committed),
    };
  }

  const fetchData = async () => {
    const _data = flattenProjectData(sourceData);

    setDataSource(_data);
    initEcharts(_data);
  };

  useEffect(() => {
    if (!sourceData) {
      return;
    }
    fetchData();
  }, [sourceData]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <div className={styles.projectTrendsMain} ref={projectTrendsRef}>
      <Title
        title={
          <span className={styles.title}>
            Project Trends(Committed vs Delivered)
          </span>
        }
        // containerRef={containerRef}
        showFullScreen={true}
        controlled={true}
        newIsFullscreen={newIsFullscreen}
        newToggleFullscreen={newToggleFullscreen}
        extra={
          <>
            <Select
              style={{ width: 450 }}
              placeholder="Select Project"
              options={projectSelectOptions}
              showSearch={true}
              value={currentProject?.projectId || dataSource?.projectId}
              optionRender={(option) => {
                const status: ProjectStatusEnum = option.data.projectStatus;
                return (
                  <Flex justify="space-between">
                    <div
                      className="ellipsis"
                      title={option.data.label}
                      style={{ width: '300px' }}
                    >
                      {option.data.label}
                    </div>
                    <Badge
                      color={ProjectStatusEnumColor[status]}
                      text={ProjectStatusEnumText[status]}
                    />
                  </Flex>
                );
              }}
              filterOption={(input, option) => {
                return (
                  (option as { label: string; value: number })?.label ?? ''
                )
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              onChange={(_, option) => {
                onSelectCurrentProject({
                  projectId: option.value,
                  projectName: option.label,
                });
              }}
            />
          </>
        }
      />

      <div className={styles.projectTrendsLine}>
        <div
          ref={projectTrendsLineRef}
          style={{ width: '100%', height: '320px' }}
        />
      </div>
    </div>
  );
}
