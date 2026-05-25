import { statisticPerformanceComparison } from '@/api/statistics';
import {
  perTipOption,
  revGMOption,
  tripNumOption,
} from '@/pages/Home/echartData';
import { useSetState, useSize } from 'ahooks';
import { Col, DatePicker, Row, Spin } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import _ from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import Title, { OutSideTitle } from '../components/Title';
import styles from './index.less';

const DEFAULT_CHART_HEIGHT = '420px';

interface IState {
  date: dayjs.Dayjs;
  latest: string;
  pending: boolean;
}

const InitialState: IState = {
  date: dayjs(),
  latest: '',
  pending: false,
};

const PerformanceComparison = ({ latestTime }: { latestTime: string }) => {
  const ref = useRef(null);
  const size = useSize(ref);
  const [state, setState] = useSetState<IState>(InitialState);

  const tripNumRef = useRef<HTMLDivElement>(null); // tripNum Dom实例
  const tripNumChartRef = useRef<echarts.ECharts | null>(null); // tripNum chart图标实例

  const revGMRef = useRef<HTMLDivElement>(null); // revGM Dom实例
  const revGMChartRef = useRef<echarts.ECharts | null>(null); // revGM chart图标实例

  const perTipRef = useRef<HTMLDivElement>(null); // perTip Dom实例
  const perTipChartRef = useRef<echarts.ECharts | null>(null); // perTip chart图标实例

  const tripNumInit = async () => {
    tripNumChartRef.current = echarts.init(
      tripNumRef.current as HTMLDivElement,
    );
  };

  const revGMInit = async () => {
    revGMChartRef.current = echarts.init(revGMRef.current as HTMLDivElement);
  };

  const perTipInit = async () => {
    perTipChartRef.current = echarts.init(perTipRef.current as HTMLDivElement);
  };

  useEffect(() => {
    const latest = latestTime ?? '';
    setState({ latest });
  }, [latestTime]);

  const fetchData = useCallback(async () => {
    const payload = {
      statDate: state.date.format('YYYY-MM-01'),
    };
    setState({ pending: true });
    const res = await statisticPerformanceComparison(payload);
    setState({ pending: false });
    if (res.code === 200) {
      const {
        xaxis,
        tripNum,
        summarySpending,
        summaryGP,
        grossMargin,
        summarySpendingPerTrip,
        summaryGPPerTrip,
      } = res.data ?? {};

      const formatXais = xaxis.map((date: string) => {
        return dayjs(date).format('YYYY-MM');
      });

      _.set(tripNumOption, 'xAxis.data', formatXais);
      _.set(tripNumOption, 'series[0].data', tripNum);

      _.set(revGMOption, 'xAxis[0].data', formatXais);
      _.set(revGMOption, 'series[0].data', summarySpending);
      _.set(revGMOption, 'series[1].data', summaryGP);
      _.set(revGMOption, 'series[2].data', grossMargin);

      _.set(perTipOption, 'xAxis[0].data', formatXais);
      _.set(perTipOption, 'series[0].data', summarySpendingPerTrip);
      _.set(perTipOption, 'series[1].data', summaryGPPerTrip);

      tripNumChartRef.current?.setOption(tripNumOption);
      revGMChartRef.current?.setOption(revGMOption);
      perTipChartRef.current?.setOption(perTipOption);
    }
  }, [state.date]);

  const dateChange = useCallback((date: dayjs.Dayjs | null) => {
    setState({ date: date! });
  }, []);

  const resizeAll = () => {
    tripNumChartRef.current?.resize();
    revGMChartRef.current?.resize();
    perTipChartRef.current?.resize();
  };

  useEffect(() => {
    tripNumInit();
    revGMInit();
    perTipInit();
  }, []);

  useEffect(() => {
    resizeAll();
  }, [size]);

  useEffect(() => {
    fetchData();
  }, [state.date]);

  return (
    <>
      <div
        ref={ref}
        style={{ marginTop: '24px' }}
        className={cls(styles.performanceComparison, 'performanceComparison')}
      >
        <OutSideTitle title="Performance Comparison" />
        <Title
          title="Monthly Data Comparison"
          subTitle={`Data last updated at ${dayjs(state.latest).format(
            'YYYY-MM-DD HH:mm',
          )}`}
          tooltip="Comparison of business data between target month, month-on-month and year-on-year months"
          extra={
            <DatePicker
              picker="month"
              placeholder="Select Date"
              defaultValue={state.date}
              disabledDate={(current) => {
                return current && current > dayjs().endOf('day');
              }}
              onChange={(date: dayjs.Dayjs | null) => dateChange(date)}
              allowClear={false}
            />
          }
        />
        <Spin spinning={state.pending}>
          <div className="charts">
            <Row gutter={80}>
              <Col span={8}>
                <div className="chartItemTitle">Trip Numbers</div>
                <div
                  ref={tripNumRef}
                  style={{ height: DEFAULT_CHART_HEIGHT }}
                />
              </Col>
              <Col span={8}>
                <div className="chartItemTitle">Rev & GM</div>
                <div ref={revGMRef} style={{ height: DEFAULT_CHART_HEIGHT }} />
              </Col>
              <Col span={8}>
                <div className="chartItemTitle">Rev / GP per Trip</div>
                <div ref={perTipRef} style={{ height: DEFAULT_CHART_HEIGHT }} />
              </Col>
            </Row>
          </div>
        </Spin>
      </div>
    </>
  );
};

export default PerformanceComparison;
