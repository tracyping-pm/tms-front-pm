import { useSetState } from 'ahooks';
import { Typography } from 'antd';
import cls from 'classnames';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';
import { useEffect, useState } from 'react';

import { vendorAnalysisSummary } from '@/api/statistics';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useWaybillTimeType } from '../../../common/TimeTypeContext';
import styles from './index.less';

const { Title } = Typography;

TweenOne.plugins.push(Children);

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
        <TweenOne animation={state.animationTotal}></TweenOne>{' '}
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

export default function BusinessStatisticsSummary() {
  const { waybillTimeType } = useWaybillTimeType();
  const [state, setState] = useSetState<IState>(initialState);
  const [loading, setLoading] = useState<boolean>(true);

  const getDataSource = async () => {
    setLoading(true);
    const res = await vendorAnalysisSummary({ waybillTimeType }).finally(() =>
      setLoading(false),
    );

    const data = [
      {
        header: 'Total Cost',
        total: res.data?.cost ?? 0,
        totalFloatLength: 0,
        rate: res.data?.costGrowthRate ?? 0,
        difference: res.data?.costIncrement ?? 0,
        animationRate: Math.abs(res.data?.costGrowthRate ?? 0),
        animationDifference: Math.abs(res.data?.costIncrement ?? 0),
      },
      {
        header: 'Total Revenue',
        total: res.data?.revenue ?? 0,
        totalFloatLength: 0,
        rate: res.data?.revenueGrowthRate ?? 0,
        difference: res.data?.revenueIncrement ?? 0,
        animationRate: Math.abs(res.data?.revenueGrowthRate ?? 0),
        animationDifference: Math.abs(res.data?.revenueIncrement ?? 0),
      },
      {
        header: 'Gross Profit',
        total: res.data?.grossProfit ?? 0,
        totalFloatLength: 0,
        rate: res.data?.grossProfitGrowthRate ?? 0,
        difference: res.data?.grossProfitIncrement ?? 0,
        animationRate: Math.abs(res.data?.grossProfitGrowthRate ?? 0),
        animationDifference: Math.abs(res.data?.grossProfitIncrement ?? 0),
      },
      {
        header: 'Gross Margin',
        total: res.data?.grossMargin ?? 0,
        totalFloatLength: 2,
        rate: res.data?.grossMarginGrowthRate ?? 0,
        difference: res.data?.grossMarginIncrement ?? 0,
        animationRate: Math.abs(res.data?.grossMarginGrowthRate ?? 0),
        animationDifference: Math.abs(res.data?.grossMarginIncrement ?? 0),
      },
      {
        header: 'Active Vendors',
        total: res.data?.activeVendor ?? 0,
        totalFloatLength: 0,
        rate: res.data?.activeVendorGrowthRate ?? 0,
        difference: res.data?.activeVendorIncrement ?? 0,
        animationRate: Math.abs(res.data?.activeVendorGrowthRate ?? 0),
        animationDifference: Math.abs(res.data?.activeVendorIncrement ?? 0),
      },
      {
        header: 'Active Trucks (Unique Plate)',
        total: res.data?.activeTruck ?? 0,
        totalFloatLength: 0,
        rate: res.data?.activeTruckGrowthRate ?? 0,
        difference: res.data?.activeTruckIncrement ?? 0,
        animationRate: Math.abs(res.data?.activeTruckGrowthRate ?? 0),
        animationDifference: Math.abs(res.data?.activeTruckIncrement ?? 0),
      },
    ];

    setState({
      summaryData: data,
    });
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
