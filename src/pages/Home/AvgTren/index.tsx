import { statisticLastSevenDaysAvg } from '@/api/statistics';
import { ProFormDatePicker } from '@ant-design/pro-components';
import { useSetState, useSize } from 'ahooks';
import { Spin, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { useCallback, useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import Title from '../components/Title';
import styles from './index.less';

let emphasisStyle = {
  itemStyle: {
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.3)',
  },
};

interface IState {
  latest: string;
  loading: boolean;
  daysAvg: number[];
  daysDataList: any[];
  xaxis: string[];

  startTime: Dayjs;
  endTime: Dayjs;
}

const initialState: IState = {
  latest: '',
  loading: false,
  daysAvg: [],
  daysDataList: [],
  xaxis: [],
  startTime: dayjs().startOf('year'),
  endTime: dayjs(),
};

const AvgTren: React.FC<{ latestTime: string }> = ({ latestTime }) => {
  const avgRef = useRef(null);
  const size = useSize(avgRef);
  const avgTrendRef = useRef<HTMLDivElement>(null);
  const avgTrendChartRef = useRef<echarts.ECharts | null>(null);

  const [state, setState] = useSetState<IState>(initialState);

  const getDataSource = async (dateRange?: {
    startDate: string;
    endDate: string;
  }) => {
    const payload = dateRange
      ? dateRange
      : {
          startDate: state.startTime.format('YYYY-MM-DD'),
          endDate: state.endTime.format('YYYY-MM-DD'),
        };
    setState({
      loading: true,
    });

    const daysAvgRes = await statisticLastSevenDaysAvg(payload);

    if (daysAvgRes.code === 200) {
      const { daysAvg, daysDataList, xaxis } = daysAvgRes.data;
      setState({
        latest: latestTime ?? '',
        loading: false,
        daysAvg,
        daysDataList,
        xaxis,
      });
    }
  };

  const CustomTooltips = ({ daysDataList, xaxis, yAxisValue }: any) => {
    return (
      <div className={styles.customTooltips}>
        <p className={styles.customTooltips_title}>{xaxis}</p>
        <div className={styles.customTooltips_list}>
          <div className={styles.customTooltips_header}>
            <span>Last 7 Days Avg</span>
            <span className={styles.customTooltips_avg}>{yAxisValue}</span>
          </div>
          {daysDataList?.map(
            (i: { statDate: string; waybillNumber: number }) => {
              return (
                <div key={i.statDate} className={styles.customTooltips_item}>
                  <span>{i.statDate}</span> <span>{i.waybillNumber}</span>
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  };

  const resizeAll = () => {
    avgTrendChartRef.current?.resize();
  };
  const dayChange = useCallback(
    (val: any, type: 'start' | 'end') => {
      if (!val) {
        return;
      }
      let diffInDays;
      if (type === 'start') {
        diffInDays = dayjs(state.endTime).diff(dayjs(val), 'day');
      } else {
        diffInDays = dayjs(val).diff(dayjs(state.startTime), 'day');
      }
      if (diffInDays > 399) {
        return message.error(
          'The statistical time range must not be greater than 400 days',
        );
      }
      let payload = {};
      if (type === 'start') {
        setState({
          startTime: dayjs(val),
        });
        payload = {
          startDate: dayjs(val).format('YYYY-MM-DD'),
          endDate: state.endTime.format('YYYY-MM-DD'),
        };
      } else {
        setState({
          endTime: dayjs(val),
        });
        payload = {
          startDate: state.startTime.format('YYYY-MM-DD'),
          endDate: dayjs(val).format('YYYY-MM-DD'),
        };
      }
      //@ts-ignore
      getDataSource(payload);
      resizeAll();
    },
    [state.startTime, state.endTime],
  );
  useEffect(() => {
    getDataSource();
  }, [latestTime]);

  useEffect(() => {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (d: any) => {
          const daysDataList = state?.daysDataList?.[d?.[0]?.dataIndex];
          const xaxis = d?.[0].name;
          const value = d?.[0].value;
          return renderToString(
            <CustomTooltips
              daysDataList={daysDataList}
              xaxis={xaxis}
              yAxisValue={value}
            ></CustomTooltips>,
          );
        },
      },
      grid: {
        top: 26,
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: state.xaxis,
        // triggerEvent: true,
        axisLabel: {
          interval:
            state.xaxis?.length > 300
              ? 3
              : state.xaxis?.length > 180
                ? 2
                : state.xaxis?.length > 90
                  ? 1
                  : 0,
          rotate: 70,
        },
      },
      yAxis: {
        type: 'value',
      },

      series: [
        {
          name: 'line',
          type: 'line',
          emphasis: emphasisStyle,
          smooth: true,
          symbol: 'none',
          data: state.daysAvg,
          lineStyle: {
            color: '#5D45DB',
            width: 2.5,
          },
        },
      ],
    };
    avgTrendChartRef.current = echarts.init(
      avgTrendRef.current as HTMLDivElement,
    );
    avgTrendChartRef.current?.setOption(option);
    resizeAll();
  }, [state.daysDataList, state.daysAvg, state.xaxis]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <>
      <div
        ref={avgRef}
        className={styles.avgTren}
        style={{ marginTop: '16px' }}
      >
        <Title
          title={'Last 7 Days Avg Trend'}
          subTitle={`Data last updated at ${dayjs(state.latest).format(
            'YYYY-MM-DD HH:mm',
          )}`}
          tooltip={
            'The trend of the number of shipments in the last 7 days for each day within the statistical time period'
          }
          extra={
            <div style={{ display: 'flex', gap: 6 }}>
              <ProFormDatePicker
                fieldProps={{
                  value: state.startTime,
                  onChange: (val) => {
                    dayChange(val, 'start');
                  },
                  disabledDate: (current) => {
                    return current >= dayjs(state.endTime).startOf('day');
                  },
                  style: { width: 145 },
                }}
              />
              <span style={{ marginTop: 7 }}>-</span>
              <ProFormDatePicker
                fieldProps={{
                  value: state.endTime,
                  onChange: (val) => {
                    dayChange(val, 'end');
                  },
                  disabledDate: (current) => {
                    return (
                      current > dayjs().endOf('day') ||
                      current <= dayjs(state.startTime).startOf('day')
                    );
                  },
                  style: { width: 145 },
                }}
              />
            </div>
          }
        />
        <div className={styles.charts}>
          <Spin spinning={state.loading}>
            <div ref={avgTrendRef} style={{ width: '100%', height: '420px' }} />
          </Spin>
        </div>
      </div>
    </>
  );
};

export default AvgTren;
