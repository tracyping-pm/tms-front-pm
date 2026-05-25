import { useSetState } from 'ahooks';
import { Typography } from 'antd';
import cls from 'classnames';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';
import { useEffect, useState } from 'react';

import { customerAnalysisSummary } from '@/api/statistics';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './index.less';
TweenOne.plugins.push(Children);

const { Title } = Typography;
interface IState {
  animationTotal: any;
  animationDifference: any;
  animationRate: any;
  summaryData: {
    header: string;
    totalFloatLength: number;
    total: number | string;
    rate: number;
    difference: number;
  }[];
}

const initialState: IState = {
  animationTotal: undefined,
  animationDifference: undefined,
  animationRate: undefined,
  summaryData: [],
};

const SummaryItem = ({ item }: any) => {
  const [state, setState] = useSetState<IState>(initialState);
  useEffect(() => {
    if (item) {
      setState({
        animationTotal: {
          Children: {
            value: Number(item.total),
            floatLength: item.totalFloatLength,
            formatMoney: true,
          },
          duration: 1000,
        },
        animationRate: {
          Children: {
            value: Number(item.animationRate),
            floatLength: item.totalFloatLength,
            formatMoney: true,
          },
          duration: 1000,
        },
        animationDifference: {
          Children: {
            value: Number(item.animationDifference),
            floatLength: item.totalFloatLength,
            formatMoney: true,
          },
          duration: 1000,
        },
      });
    }
  }, [item]);
  return (
    <div className={styles.summary_item}>
      <div className={styles.summary_header}>{item.header}</div>
      <div className={styles.summary_count}>
        <TweenOne animation={state.animationTotal}></TweenOne>
        {item.header === 'Gross Margin' ? '%' : ''}
      </div>

      <div className={styles.summary_subTitle}>Compared to last month</div>
      <div className={styles.summary_comparativeData}>
        {item.rate === 0 ? (
          '-'
        ) : (
          <div
            className={cls(
              styles.summary_footerCount,
              item.rate > 0 ? styles.growth : styles.reduce,
            )}
          >
            {item.rate > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <TweenOne animation={state.animationRate}></TweenOne>%
          </div>
        )}
        {item.difference === 0 ? (
          '-'
        ) : (
          <div
            className={cls(
              styles.summary_footerCount,
              item.difference > 0 ? styles.growth : styles.reduce,
            )}
          >
            {item.difference > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}

            <TweenOne animation={state.animationDifference}></TweenOne>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Summary() {
  const { waybillTimeType } = useWaybillTimeType();
  const [state, setState] = useSetState<IState>(initialState);
  const [loading, setLoading] = useState<boolean>(true);

  const getDataSource = async () => {
    setLoading(true);
    const res = await customerAnalysisSummary({
      waybillTimeType,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const data = [
        {
          header: 'Total Revenue',
          total: res.data?.totalRevenue ?? 0,
          totalFloatLength: 0,
          rate: res.data?.revenueRate ?? 0,
          difference: res.data?.revenueDifference ?? 0,
          animationRate: Math.abs(res.data?.revenueRate ?? 0),

          animationDifference: Math.abs(res.data?.revenueDifference ?? 0),
        },
        {
          header: 'Total Cost',
          total: res.data?.totalCost ?? 0,
          totalFloatLength: 0,
          rate: res.data?.costRate ?? 0,
          difference: res.data?.costDifference ?? 0,
          animationRate: Math.abs(res.data?.costRate ?? 0),

          animationDifference: Math.abs(res.data?.costDifference ?? 0),
        },
        {
          header: 'Gross Profit',
          total: res.data?.grossProfit ?? 0,
          totalFloatLength: 0,
          rate: res.data?.grossProfitRate ?? 0,
          difference: res.data?.grossProfitDifference ?? 0,
          animationRate: Math.abs(res.data?.grossProfitRate ?? 0),

          animationDifference: Math.abs(res.data?.grossProfitDifference ?? 0),
        },
        {
          header: 'Gross Margin',
          total: res.data?.grossMargin ?? 0,
          totalFloatLength: 2,
          rate: res.data?.grossMarginRate ?? 0,
          difference: res.data?.grossMarginDifference ?? 0,
          animationRate: Math.abs(res.data?.grossMarginRate ?? 0),
          animationDifference: Math.abs(res.data?.grossMarginDifference ?? 0),
        },
        {
          header: 'Active Customers',
          total: res.data?.activeCustomers ?? 0,
          totalFloatLength: 0,
          rate: res.data?.activeCustomersRate ?? 0,
          difference: res.data?.activeCustomersDifference ?? 0,
          animationRate: Math.abs(res.data?.activeCustomersRate ?? 0),
          animationDifference: Math.abs(
            res.data?.activeCustomersDifference ?? 0,
          ),
        },
        {
          header: 'Active Projects',
          total: res.data?.activeProjects ?? 0,
          totalFloatLength: 0,
          rate: res.data?.activeProjectsRate ?? 0,
          difference: res.data?.activeProjectsDifference ?? 0,
          animationRate: Math.abs(res.data?.activeProjectsRate ?? 0),
          animationDifference: Math.abs(
            res.data?.activeProjectsDifference ?? 0,
          ),
        },
      ];

      setState({
        summaryData: data,
      });
    }
  };

  useEffect(() => {
    getDataSource();
  }, [waybillTimeType]);

  return (
    <div>
      <Title
        level={4}
        style={{ marginBottom: '8px' }}
      >{`Summary (${dayjs().subtract(1, 'month').format('MMMM')})`}</Title>

      {loading ? (
        <SkeletonView rows={4} cols={6} />
      ) : (
        <div className={styles.summary}>
          <div className={styles.summary_wrap}>
            {state?.summaryData?.map((i) => {
              return <SummaryItem item={i} key={i.header} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
