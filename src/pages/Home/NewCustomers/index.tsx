import { Table } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';

import { statisticNewCustomer } from '@/api/statistics';
import { formatAmount } from '@/utils/utils';
import { useSetState, useSize } from 'ahooks';
import { ColumnsType } from 'antd/es/table';
import Title, { OutSideTitle } from '../components/Title';
import styles from './index.less';

interface IState {
  xAxisValue: string;
  loading: boolean;
  daysIncome: number[][];
  daysDataList: any[];
  xaxis: string[];
}
const initialState: IState = {
  loading: false,
  daysIncome: [],
  daysDataList: [],
  xaxis: [],
  xAxisValue: '',
};
const NewCustomers: React.FC = () => {
  const customersRef = useRef(null);
  const size = useSize(customersRef);
  const stackedLineRef = useRef<HTMLDivElement>(null);
  const tooltipTableRef = useRef<HTMLDivElement>(null);
  const stackedLineChartRef = useRef<echarts.ECharts | null>(null);
  const [customerList, setCustomerList] = useState<any>();

  const [state, setState] = useSetState<IState>(initialState);

  const columns: ColumnsType<any> = [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'Customer',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Daily Trip Numbers',
      dataIndex: 'dailyTripNumber',
      key: 'dailyTripNumber',
      render: (_, recode) => {
        return formatAmount(recode.dailyTripNumber);
      },
    },
    {
      title: 'Daily income',
      dataIndex: 'dailyIncome',
      key: 'dailyIncome',
      render: (_, recode) => {
        return formatAmount(recode.dailyIncome);
      },
    },
    {
      title: 'Daily Spending',
      dataIndex: 'dailySpending',
      key: 'dailySpending',
      render: (_, recode) => {
        return formatAmount(recode.dailySpending);
      },
    },
    {
      title: 'Daily Gp',
      dataIndex: 'dailyGp',
      key: 'dailyGp',
      render: (_, recode) => {
        return formatAmount(recode.dailyGp);
      },
    },
  ];

  const resizeAll = () => {
    stackedLineChartRef.current?.resize();
  };
  const getDataSource = async () => {
    const res = await statisticNewCustomer();
    if (res.code === 200) {
      const { daysIncome, daysDataList, xaxis } = res.data;
      setState({
        daysIncome,
        daysDataList,
        xaxis,
      });
    }
  };

  useEffect(() => {
    getDataSource();
  }, []);

  useEffect(() => {
    // 渲染折线
    let seriesOptions: any = [];
    state.daysIncome?.forEach((i, index) => {
      const a = {
        name: `line${index + 1}`,
        type: 'line',
        stack: 'Total',
        lineStyle: {
          // color: 'transparent',
          color: '#fff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#009688',
            },
            {
              offset: 1,
              color: '#BCFFF9',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        symbol: 'none',
        // showSymbol: false,
        data: i,
      };
      seriesOptions.push(a);
    });

    const option = {
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
          // crossStyle：{
          //   color:'#fff'
          // }
        },
        // showDelay:500,
        enterable: true,
        // appendToBody: true,
        formatter: (d: { dataIndex: number; name: string }[]) => {
          const daysDataList = state?.daysDataList?.[d?.[0]?.dataIndex];
          setCustomerList([...daysDataList]);
          setState({
            xAxisValue: d?.[0].name,
          });
          return tooltipTableRef.current;
        },
      },
      grid: {
        top: 24,
        left: 24,
        right: 24,
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        show: true,
        type: 'category',
        boundaryGap: false,
        data: state.xaxis,
        axisLabel: {
          interval: 0,
          rotate: 60,
        },
        axisLine: {
          show: true,
        },
        triggerEvent: true,
      },
      yAxis: {
        type: 'value',
      },
      series: seriesOptions,
    };
    stackedLineChartRef.current = echarts.init(
      stackedLineRef.current as HTMLDivElement,
    );
    // @ts-ignore
    stackedLineChartRef.current?.setOption?.(option);

    resizeAll();
  }, [state.daysDataList, state.daysIncome, state.xaxis]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  return (
    <>
      <div ref={customersRef} style={{ marginTop: 24 }}>
        <OutSideTitle title="New Customers" />
        <Title
          title={'New Customers Daily'}
          tooltip={
            'Business performance of the top 20 new customers in the past 30 days'
          }
        />
        <div className={styles.charts}>
          <div
            ref={stackedLineRef}
            style={{ width: '100%', height: '420px' }}
          />
        </div>
        <div className={styles.tooltips}>
          <div ref={tooltipTableRef}>
            <p className={styles.tooltips_title}>{state.xAxisValue}</p>
            <div className="newCustomersTable" key={state.xAxisValue}>
              <Table
                rowKey={`customer`}
                columns={columns}
                dataSource={customerList}
                pagination={false}
              ></Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewCustomers;
