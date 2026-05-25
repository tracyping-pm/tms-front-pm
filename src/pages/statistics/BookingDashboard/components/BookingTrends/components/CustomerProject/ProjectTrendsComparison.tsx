import { useSize } from 'ahooks';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
import Title from '../../../Title';
import styles from './index.less';

const ProjectTrendsComparison = ({
  newIsFullscreen,
  newToggleFullscreen,

  currentProject,
  customerName,
  sourceData,
  type,
}: {
  newIsFullscreen: boolean;
  newToggleFullscreen: () => void;
  currentProject?: { projectId: number; projectName: string };
  customerName: string;
  sourceData: any;
  type: 'Committed' | 'Delivered';
}) => {
  const projectTrendsComparisonRef = useRef(null);
  const size = useSize(projectTrendsComparisonRef);
  const projectTrendsComparisonBarRef = useRef<HTMLDivElement>(null);
  const projectTrendsComparisonBarChartRef = useRef<echarts.ECharts | null>(
    null,
  );
  // const containerRef = useRef(null);

  const resizeAll = () => {
    projectTrendsComparisonBarChartRef.current?.resize();
  };
  const firstProjectColor = '#009688';
  const colorList = [
    '#1890FF',
    '#FADB14',
    '#FA541C',
    '#2F54EB',
    '#FAAD14',
    '#722ED1',
    '#F5222D',
    '#EB2F96',
    '#FA8C16',
    '#69C0FF',
    '#FFF566',
    '#FF9C6E',
    '#85A5FF',
    '#FFD666',
    '#B37FEB',
    '#FF7875',
    '#FF85C0',
    '#FFC069',
    '#40A9FF',
    '#FFEC3D',
  ];

  const initEcharts = (data: any) => {
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255,255,255)',
        borderWidth: 0,
        axisPointer: {
          type: 'shadow',
        },
        // 关键：自定义 tooltip，让当前 series 高亮显示
        formatter: (params: any) => {
          const activeSeriesName = params?.seriesName;
          let html = `<div style="margin-bottom:4px;">${params.name}</div>`;

          data?.list.forEach((p: any) => {
            const isActive = p.projectName === activeSeriesName;

            html += `
          <div style="
            padding: 4px 8px;
            border-radius: 4px;
            margin: 2px 0;
            background: ${isActive ? 'rgba(64,158,255,0.15)' : 'transparent'};
            font-weight: ${isActive ? 600 : 400};
          ">
            <span style="
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${p.color};
              margin-right: 4px;
            "></span>
            ${p.projectName}：${
              type === 'Delivered'
                ? p?.delivered[params.dataIndex] || 0
                : p?.committed[params.dataIndex] || 0
            }
          </div>
        `;
          });

          return html;
        },
      },
      legend: {
        type: 'scroll',
        icon: 'rect',
        data: data?.projectName,
      },
      grid: {
        top: 36,
        left: 20,
        right: 30,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data?.mouthDate,
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
        axisLabel: {
          interval: 'auto',
          // width: 100,
          // overflow: 'truncate',
        },
        tooltip: {
          show: true,
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

      series: data?.list?.map((item: any) => ({
        color: item.color,
        name: item.projectName,
        type: 'bar',
        // stack: 'total',
        data:
          type === 'Delivered' ? item?.delivered || [] : item?.committed || [],
        barMaxWidth: '12px',
        emphasis: {
          focus: 'series',
        },
      })),
    };
    projectTrendsComparisonBarChartRef.current = echarts.init(
      projectTrendsComparisonBarRef.current as HTMLDivElement,
    );
    projectTrendsComparisonBarChartRef.current?.setOption(option, true);
    resizeAll();
  };
  const flattenData = (data: any, firstProjectName: string) => {
    const result: any = {
      mouthDate: [],
      list: [],
      projectName: [],
    };
    const projectMap = new Map();
    data?.forEach((monthItem: { mouthDate: string; trendsVo: any[] }) => {
      // 收集月份
      result.mouthDate.push(monthItem.mouthDate);
      monthItem.trendsVo.forEach((_project) => {
        if (!projectMap.has(_project.projectId)) {
          const item = {
            projectName: _project.projectName,
            delivered: [],
            committed: [],
          };
          projectMap.set(_project.projectId, item);
          result.list.push(item);
        }

        const target = projectMap.get(_project.projectId);
        target.delivered.push(_project.delivered);
        target.committed.push(_project.committed);
      });
    });
    // 传入项目放第一
    const orderedProjects = Array.from(projectMap.values()).sort((a, b) => {
      if (a.projectName === firstProjectName) return -1;
      if (b.projectName === firstProjectName) return 1;
      return 0;
    });

    result.list = orderedProjects.map((item, index) => ({
      ...item,
      color:
        index === 0 ? firstProjectColor : colorList[index % colorList.length],
    }));

    result.projectName = orderedProjects.map((v) => v.projectName);

    return result;
  };

  useEffect(() => {
    const _data = flattenData(sourceData, currentProject?.projectName || '');
    initEcharts(_data);
  }, [sourceData, currentProject]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <div
      className={styles.projectTrendsComparisonBarMain}
      ref={projectTrendsComparisonRef}
    >
      <Title
        title={
          <span className={styles.title}>
            Project Trends({type}) Comparison for
          </span>
        }
        // containerRef={containerRef}
        showFullScreen={true}
        controlled={true}
        newIsFullscreen={newIsFullscreen}
        newToggleFullscreen={newToggleFullscreen}
        extra={
          <>
            {' '}
            <span className={styles.customerName}>{customerName ?? '-'}</span>
          </>
        }
      />
      <div className={styles.projectTrendsComparisonBar}>
        <div
          ref={projectTrendsComparisonBarRef}
          style={{ width: '100%', height: '340px' }}
        />
      </div>
    </div>
  );
};

export default ProjectTrendsComparison;
