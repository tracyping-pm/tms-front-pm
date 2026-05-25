import { statisticBusinessStatistic } from '@/api/statistics';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Popover, Skeleton } from 'antd';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';
import { useEffect, useState } from 'react';
import { ReactComponent as CustomersIcon } from '../../../../public/svg/home/customers.svg';
import { ReactComponent as ProjectsIcon } from '../../../../public/svg/home/projects.svg';
import { ReactComponent as VendorsIcon } from '../../../../public/svg/home/vendors.svg';
import { ReactComponent as WaybillsIcon } from '../../../../public/svg/home/waybills.svg';

import Title, { OutSideTitle } from '../components/Title';
import styles from './index.less';
TweenOne.plugins.push(Children);

interface IState {
  animation1: any;
  animation2: any;
  businessStatisticData: {
    header: string;
    iconText: string;
    count: number;
    sevenDaysCount: number;
    footer: string;
    icon: JSX.Element;
  }[];
}

const initialState: IState = {
  animation1: null,
  animation2: null,
  businessStatisticData: [],
};

const SummaryItem = ({ item, count = 0, sevenDaysCount }: any) => {
  const [state, setState] = useSetState<IState>(initialState);
  useEffect(() => {
    if (item) {
      setState({
        animation1: {
          Children: {
            value: Number(count),
            floatLength: 0,
            formatMoney: true,
          },
          duration: 1000,
        },
        animation2: {
          Children: {
            value: Number(sevenDaysCount),
            floatLength: 0,
            formatMoney: true,
          },
          duration: 1000,
        },
      });
    }
  }, [count, sevenDaysCount, item]);
  return (
    <div className={styles.statistics_list}>
      <div className={styles.statistics_main}>
        <div className={styles.statistics_mainText}>
          <div>
            {item.header}
            <Popover
              content={
                <div style={{ width: 340, fontSize: 12 }}>{item.iconText}</div>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 8 }} />
            </Popover>
          </div>
          <div className={styles.statistics_count}>
            <TweenOne animation={state.animation1}></TweenOne>
          </div>
        </div>
        <div className={styles.statistics_icon}>{item.icon}</div>
      </div>
      <div className={styles.statistics_last}>
        {item.footer}
        <div className={styles.statistics_lastCount}>
          <TweenOne animation={state.animation2}></TweenOne>
        </div>
      </div>
    </div>
  );
};

export default function BusinessStatisticsSummary() {
  const [state, setState] = useSetState<IState>(initialState);
  const [loading, setLoading] = useState<boolean>(true);

  const getDataSource = async () => {
    setLoading(true);
    const res = await statisticBusinessStatistic();
    setLoading(false);

    if (res.code === 200) {
      const data = [
        {
          header: 'Regular Waybills',
          iconText:
            'Statistics of the total volume of regular waybills and the number of waybills executed within 7 days',
          count: res.data?.waybillCount ?? 0,
          sevenDaysCount: res.data?.waybillSevenDaysCount ?? 0,
          footer: ' Executed last 7 Days',
          icon: <WaybillsIcon></WaybillsIcon>,
        },
        {
          header: 'Regular Projects',
          iconText:
            'Statistics of the total number of regular projects and the number of new projects within 7 days',
          count: res.data?.projectCount ?? 0,
          sevenDaysCount: res.data?.projectSevenDaysCount ?? 0,
          footer: ' Added last 7 Days',
          icon: <ProjectsIcon></ProjectsIcon>,
        },
        {
          header: 'Existing Customers',
          iconText:
            'Statistics of the total number of existing customers and the number of new customers within 7 days',
          count: res.data?.customerCount ?? 0,
          sevenDaysCount: res.data?.customerSevenDaysCount ?? 0,
          footer: ' Added last 7 Days',
          icon: <CustomersIcon></CustomersIcon>,
        },
        {
          header: 'Vendors',
          iconText:
            'Statistics of the total number of vendors and the number of new vendors within 7 days',
          count: res.data?.vendorCount ?? 0,
          sevenDaysCount: res.data?.vendorSevenDaysCount ?? 0,
          footer: ' Added last 7 Days',
          icon: <VendorsIcon></VendorsIcon>,
        },
      ];

      setState({
        businessStatisticData: data,
      });
    }
  };

  useEffect(() => {
    getDataSource();
  }, []);

  return (
    <>
      <OutSideTitle title="Business Statistics Summary" />
      <Title title={''} style={{ padding: 0 }} />
      <Skeleton loading={loading}>
        <div className={styles.statistics}>
          {state?.businessStatisticData?.map((i) => {
            return (
              <SummaryItem
                item={i}
                key={i.header}
                count={i.count}
                sevenDaysCount={i.sevenDaysCount}
              ></SummaryItem>
            );
          })}
        </div>
      </Skeleton>
    </>
  );
}
