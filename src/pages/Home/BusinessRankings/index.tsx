import { statisticTopCustomer, statisticTopProject } from '@/api/statistics';
import { PATHS } from '@/constants';
import { openNewTag } from '@/utils/utils';
import { useModel } from '@umijs/max';
import { useSetState, useSize } from 'ahooks';
import { Col, Row } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import _, { cloneDeep } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import SingleTooltip from '../components/SingleTootip';
import Title, { OutSideTitle } from '../components/Title';
import { customersOption } from '../echartData';
import styles from './index.less';

const DEFAULT_CHART_HEIGHT = '600px';

interface IState {
  latestCustomer: string;
  latestProject: string;
}

const InitialState: IState = {
  latestCustomer: '',
  latestProject: '',
};

const BusinessRankings = ({
  customerTime,
  projectTime,
}: {
  customerTime: string;
  projectTime: string;
}) => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const ref = useRef(null);
  const size = useSize(ref);
  const [state, setState] = useSetState<IState>(InitialState);

  const customersRef = useRef<HTMLDivElement>(null); // customers Dom实例
  const customersChartRef = useRef<echarts.ECharts | null>(null); // customers chart图标实例

  const projectsRef = useRef<HTMLDivElement>(null); // customers Dom实例
  const projectsChartRef = useRef<echarts.ECharts | null>(null); // customers chart图标实例

  const customersInit = async () => {
    customersChartRef.current = echarts.init(
      customersRef.current as HTMLDivElement,
    );
  };

  const projectsInit = async () => {
    projectsChartRef.current = echarts.init(
      projectsRef.current as HTMLDivElement,
    );
    projectsChartRef.current?.setOption?.(customersOption);
  };

  useEffect(() => {
    setState({
      latestCustomer: customerTime ?? '',
      latestProject: projectTime ?? '',
    });
  }, [customerTime, projectTime]);

  const setOptions = (type: 'customers' | 'projects', data: any) => {
    const option =
      type === 'customers'
        ? cloneDeep(customersOption)
        : cloneDeep(customersOption);
    const curRef = type === 'customers' ? customersChartRef : projectsChartRef;
    const baseUrl =
      type === 'customers'
        ? PATHS.CUSTOMER_DETAIL_BASE
        : PATHS.PROJECT_DETAIL_BASE;

    const sortedData = _.sortBy(data, 'summaryYearlyIncome');
    const yAxisData = sortedData.map((item) => item.name);
    const series_0_data = sortedData.map((item) => item.summaryYearlySpending);
    const series_1_data = sortedData.map((item) => item.summaryYearlyGP);

    _.set(option, 'yAxis.data', yAxisData);
    _.set(option, 'series[0].data', series_0_data);
    _.set(option, 'series[1].data', series_1_data);
    _.set(option, 'tooltip.formatter', (params: any) => {
      const item = params?.[0] ?? {};
      const { dataIndex } = item;
      const activeItem = sortedData[dataIndex] ?? {};
      const {
        name,
        summaryTripNumbers,
        summaryYearlyIncome,
        summaryYearlySpending,
        summaryYearlyGP,
      } = activeItem;
      // Gross Margin：Summary GP / Summary Income *100%
      const GM = (summaryYearlyGP / summaryYearlyIncome) * 100;

      return renderToString(
        <SingleTooltip
          countryId={countryId}
          title={name}
          tripNumbers={summaryTripNumbers}
          income={summaryYearlyIncome}
          spending={summaryYearlySpending}
          GP={summaryYearlyGP}
          GM={GM}
        />,
      );
    });

    curRef.current?.setOption(option);
    // bind event
    curRef.current?.on('click', 'yAxis', (params: any) => {
      const { componentType, targetType, dataIndex } = params;
      if (componentType === 'yAxis' && targetType === 'axisLabel') {
        const item = sortedData[dataIndex];
        const url = `${baseUrl}/${item.id}`;
        openNewTag(url);
      }
    });
  };

  const fetchAllData = async () => {
    const res1 = await statisticTopCustomer();
    const res2 = await statisticTopProject();

    if (res1.code === 200) {
      setOptions('customers', res1?.data ?? []);
    }
    if (res2.code === 200) {
      setOptions('projects', res2?.data ?? []);
    }
  };

  const resizeAll = useCallback(() => {
    customersChartRef.current?.resize();
    projectsChartRef.current?.resize();
  }, [size]);

  useEffect(() => {
    customersInit();
    projectsInit();
    fetchAllData();
  }, []);

  useEffect(() => {
    if (size) {
      resizeAll();
    }
  }, [size]);

  return (
    <>
      <div
        ref={ref}
        style={{ marginTop: '24px' }}
        className={cls(styles.businessRankings, 'businessRankings')}
      >
        <OutSideTitle title="Business Rankings" />
        <Row gutter={24}>
          <Col span={12}>
            <Title
              title="Top 15 Customers"
              subTitle={`Data last updated at ${dayjs(
                state.latestCustomer,
              ).format('YYYY-MM-DD HH:mm')}`}
              tooltip="Ranking of the top 15 customers by business scale this year"
            />
            <div
              className="chartItem"
              ref={customersRef}
              style={{
                height: DEFAULT_CHART_HEIGHT,
              }}
            />
          </Col>
          <Col span={12}>
            <Title
              title="Top 15 Projects"
              subTitle={`Data last updated at ${dayjs(
                state.latestProject,
              ).format('YYYY-MM-DD HH:mm')}`}
              tooltip="Ranking of the top 15 projects by business scale this year"
            />
            <div
              className="chartItem"
              ref={projectsRef}
              style={{
                height: DEFAULT_CHART_HEIGHT,
              }}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default BusinessRankings;
