import { getSummaryData } from '@/api/statistics';
import { ISummaryData, ISummaryTableData } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { SummaryGroupByDate, SummaryGroupByDateText } from '@/enums';
import Dashboard from '@/pages/Home/SummaryDashboard/Dashboard';
import LoadingModal from '@/pages/Home/SummaryDashboard/LoadingModal';
import ProjectModal from '@/pages/Home/SummaryDashboard/ProjectModal';
import styles from '@/pages/Home/index.less';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ProFormDatePicker } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { useSize } from 'ahooks';
import { App, Button, Input, Skeleton } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { Key, useCallback, useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { ReactComponent as FileIcon } from '../../../../public/svg/dashboard_file.svg';

export default function SummaryDashboard({
  latestTime,
}: {
  latestTime: string;
}) {
  const { initialState } = useModel('@@initialState') ?? {};
  // const access = useAccess();
  const { message, modal } = App.useApp();
  const countryId = initialState?.currentUser?.countryId;
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadLoading, setLoadLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<ISummaryData | null>(null);
  const [timeGroup, setTimeGroup] = useState<SummaryGroupByDate>(
    SummaryGroupByDate.DAY,
  );
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Key[]>([]);
  const [searchFilter, setSearchFilter] = useState<any>(null);
  const [startTime, setStartTime] = useState<any>(dayjs().subtract(59, 'day'));
  const [endTime, setEndTime] = useState<any>(dayjs());

  const summaryRef = useRef<HTMLDivElement>(null); // summary Dom实例
  const size = useSize(summaryRef);
  const summaryChartRef = useRef<echarts.ECharts | null>(null); // summary chart图标实例
  const lastDayTime = useRef<any[]>([dayjs().subtract(59, 'day'), dayjs()]);
  const lastWeekTime = useRef<any[]>([dayjs().subtract(51, 'week'), dayjs()]);
  const lastMonthTime = useRef<any[]>([
    dayjs().subtract(11, 'month').startOf('month'),
    dayjs(),
  ]);

  const summaryInit = async () => {
    setLoading(true);
    const res = await getSummaryData({
      groupBy: timeGroup,
      projectIds: selectedKeys.length ? selectedKeys : undefined,
      startDate:
        timeGroup === SummaryGroupByDate.WEEK
          ? dayjs(startTime).startOf('week').add(1, 'day').format('YYYY-MM-DD')
          : dayjs(startTime).format('YYYY-MM-DD'),
      endDate:
        timeGroup === SummaryGroupByDate.WEEK
          ? dayjs(endTime).endOf('week').add(1, 'day').format('YYYY-MM-DD')
          : dayjs(endTime).format('YYYY-MM-DD'),
    });
    setLoading(false);
    if (res.code === 200) {
      setSummaryData(res.data);
    }
  };

  useEffect(() => {
    summaryInit();
  }, [timeGroup, startTime, endTime, selectedKeys]);

  useEffect(() => {
    summaryChartRef.current?.resize();
  }, [size]);

  const getInterval = (num: number): number => {
    // 得到num位数（如num=782371.89，mag为100000，num=78.89,mag为10）
    let mag = 10 ** Math.floor(Math.log10(num));
    let res = num / mag; // num/mag得到间隔数（res>=1 && res<10）
    if (res >= 6) {
      return mag;
    } else if (res >= 3 && res < 6) {
      // 控制间隔区间值
      return mag / 2;
    } else {
      // 控制间隔区间值
      // （mag为10倍数，所以取2和5）
      return mag / 5;
    }
  };

  useEffect(() => {
    if (summaryData && !loading) {
      // 计算最大值/最小值
      let money: number[] = [];
      summaryData.xaxis?.map((x, i) => {
        // 计算绝对值
        const abs =
          Math.abs(summaryData.confirmedSpending[i]) +
          Math.abs(summaryData.unconfirmedSpending[i]) +
          Math.abs(summaryData.confirmedGp[i]) +
          Math.abs(summaryData.unconfirmedGp[i]);
        // 计算总和
        const sum =
          summaryData.confirmedSpending[i] +
          summaryData.unconfirmedSpending[i] +
          summaryData.confirmedGp[i] +
          summaryData.unconfirmedGp[i];
        // 所以y负轴值为两者差值的一半（且<=0）
        const nega = (sum - abs) / 2;
        // 将正负轴值放入数组
        money.push(Math.floor(sum + Math.abs(nega)), Math.floor(nega));
        return x;
      });
      let max1 = Math.max(...money); // y1轴最大值（可能为0）
      let min1 = Math.min(...money); // y1轴最小值（可能为0）
      let max2 = Math.max(...summaryData.summaryTripNumbers); // y2轴最大值（>=0）
      const mag1 = getInterval(max1) || 10000; // y1轴坐标间隔数控制在6-10左右（可能为0）
      let ymin1 = -Math.ceil(Math.abs(min1) / mag1) * mag1; // 向上取值，y1轴最小刻度（可能为0）
      let ymax1 = Math.ceil(max1 / mag1) * mag1; // 向上取值，y1轴最大刻度（可能为0）
      const y1scale1 = ymax1 === 0 ? 6 : ymax1 / mag1; // y1正值刻度数（为0取6）
      const y1scale2 = ymin1 === 0 ? 0 : Math.abs(ymin1) / mag1; // y1负值刻度数
      const mag2 = max2 === 0 ? 1 : Math.ceil(max2 / y1scale1); // y2轴正值刻度数
      const summaryOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: (t: any) => {
            const dataIndex = t?.[0]?.dataIndex;
            const data: ISummaryTableData = {
              confirmedGp: summaryData.confirmedGp[dataIndex],
              confirmedIncome: summaryData.confirmedIncome[dataIndex],
              confirmedSpending: summaryData.confirmedSpending[dataIndex],
              confirmedTripNumbers: summaryData.confirmedTripNumbers[dataIndex],
              summaryGPPerTrip: summaryData.summaryGPPerTrip[dataIndex],
              summaryGp: summaryData.summaryGp[dataIndex],
              summaryGrossMargin: summaryData.summaryGrossMargin[dataIndex],
              summaryIncome: summaryData.summaryIncome[dataIndex],
              summaryIncomePerTrip: summaryData.summaryIncomePerTrip[dataIndex],
              summarySpending: summaryData.summarySpending[dataIndex],
              summarySpendingPerTrip:
                summaryData.summarySpendingPerTrip[dataIndex],
              summaryTripNumbers: summaryData.summaryTripNumbers[dataIndex],
              unconfirmedGp: summaryData.unconfirmedGp[dataIndex],
              unconfirmedIncome: summaryData.unconfirmedIncome[dataIndex],
              unconfirmedSpending: summaryData.unconfirmedSpending[dataIndex],
              unconfirmedTripNumbers:
                summaryData.unconfirmedTripNumbers[dataIndex],
              xaxis: summaryData.xaxis[dataIndex],
            };
            return renderToString(
              <Dashboard
                data={data}
                timeGroup={timeGroup}
                countryId={countryId as number}
              />,
            );
          },
        },
        legend: {
          top: 'bottom',
          itemWidth: 10,
          itemHeight: 8,
        },
        grid: {
          top: '8%',
          left: '0.5%',
          right: '0.5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: summaryData.xaxis,
            axisLabel: {
              interval:
                summaryData.xaxis?.length > 300
                  ? 3
                  : summaryData.xaxis?.length > 180
                    ? 2
                    : summaryData.xaxis?.length > 90
                      ? 1
                      : 0,
              rotate: 60,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            alignTicks: true,
            interval: mag1,
            min: ymin1,
            max: ymax1 === 0 ? mag1 * y1scale1 : ymax1,
          },
          {
            type: 'value',
            alignTicks: true,
            interval: mag2,
            max: mag2 * y1scale1,
            min: -mag2 * y1scale2,
          },
        ],
        color: ['#009688', '#0BB8A8', '#F18532', '#FFAD6D', '#5D45DB'],
        series: [
          {
            name: `Confirmed ${SummaryGroupByDateText[timeGroup]} Spending`,
            type: 'bar',
            barMaxWidth: 30, // 宽度
            stack: 'column', // 相同名称会堆叠
            emphasis: {
              focus: 'series',
            },
            data: summaryData.confirmedSpending,
          },
          {
            name: `Unconfirmed ${SummaryGroupByDateText[timeGroup]} Spending`,
            type: 'bar',
            barMaxWidth: 30, // 宽度
            stack: 'column',
            emphasis: {
              focus: 'series',
            },
            data: summaryData.unconfirmedSpending,
          },
          {
            name: `Confirmed ${SummaryGroupByDateText[timeGroup]} GP`,
            type: 'bar',
            barMaxWidth: 30, // 宽度
            stack: 'column',
            emphasis: {
              focus: 'series',
            },
            data: summaryData.confirmedGp,
          },
          {
            name: `Unconfirmed ${SummaryGroupByDateText[timeGroup]} GP`,
            type: 'bar',
            barMaxWidth: 30, // 宽度
            stack: 'column',
            emphasis: {
              focus: 'series',
            },
            data: summaryData.unconfirmedGp,
          },
          {
            name: 'Summary Trip Numbers',
            type: 'line',
            yAxisIndex: 1,
            symbol: 'none',
            data: summaryData.summaryTripNumbers,
          },
        ],
      };
      summaryChartRef.current = echarts.init(
        summaryRef.current as HTMLDivElement,
      );
      summaryChartRef.current?.setOption(summaryOption as any);
      summaryChartRef.current?.resize();
    }
  }, [timeGroup, summaryData, loading]);

  const dayChange = useCallback(
    (val: any, type: 'start' | 'end') => {
      if (!val) {
        return;
      }
      let diffInDays;
      if (type === 'start') {
        diffInDays = dayjs(endTime).diff(dayjs(val), 'day');
      } else {
        diffInDays = dayjs(val).diff(dayjs(startTime), 'day');
      }
      if (diffInDays > 399) {
        return message.error(
          'The statistical time range must not be greater than 400 days',
        );
      }
      if (type === 'start') {
        setStartTime(dayjs(val).startOf('day'));
        lastDayTime.current = [
          dayjs(val).startOf('day'),
          lastDayTime?.current?.[1],
        ];
      } else {
        setEndTime(dayjs(val).endOf('day'));
        lastDayTime.current = [
          lastDayTime?.current?.[0],
          dayjs(val).endOf('day'),
        ];
      }
    },
    [lastDayTime, startTime, endTime],
  );

  const weekChange = useCallback(
    (val: any, type: 'start' | 'end') => {
      if (!val) {
        return;
      }
      let diffInDays;
      if (type === 'start') {
        diffInDays = dayjs(endTime).diff(dayjs(val), 'week');
      } else {
        diffInDays = dayjs(val).diff(dayjs(startTime), 'week');
      }
      if (diffInDays > 399) {
        return message.error(
          'The statistical time range must not be greater than 400 weeks',
        );
      }
      if (type === 'start') {
        setStartTime(dayjs(val));
        lastWeekTime.current = [dayjs(val), lastWeekTime?.current?.[1]];
      } else {
        setEndTime(dayjs(val));
        lastWeekTime.current = [lastWeekTime?.current?.[0], dayjs(val)];
      }
    },
    [lastWeekTime, startTime, endTime],
  );

  const monthChange = useCallback(
    (val: any, type: 'start' | 'end') => {
      if (!val) {
        return;
      }
      return;
      let diffInDays;
      if (type === 'start') {
        diffInDays = dayjs(endTime).diff(dayjs(val), 'month');
      } else {
        diffInDays = dayjs(val).diff(dayjs(startTime), 'month');
      }
      if (diffInDays > 399) {
        return message.error(
          'The statistical time range must not be greater than 400 months',
        );
      }
      if (type === 'start') {
        setStartTime(dayjs(val).startOf('month'));
        lastMonthTime.current = [
          dayjs(val).startOf('month'),
          lastMonthTime?.current?.[1],
        ];
      } else {
        setEndTime(dayjs(val).endOf('month'));
        lastMonthTime.current = [
          lastMonthTime?.current?.[0],
          dayjs(val).endOf('month'),
        ];
      }
    },
    [lastMonthTime, startTime, endTime],
  );

  const filterProjects = (keys: Key[], params: any, ids: Key[]) => {
    setSelectedKeys(keys);
    setSelectedCustomers(ids);
    setSearchFilter(params);
    setShowModal(false);
  };

  const downloadPrepare = () => {
    modal.confirm({
      title: 'Download data',
      content: 'Do you want to download the data in the chart',
      okText: 'Confirm',
      onOk: async () => {
        setLoadLoading(true);
      },
    });
  };

  return (
    <div className={styles.summary}>
      <div className={styles.summary_header}>
        <div className={styles.summary_left}>
          <div className={styles.summary_left_title}>
            Data Summary
            <CustomTooltip
              title={
                'The number of waybills and income and spending during the statistical period'
              }
              placement="top"
            >
              <QuestionCircleOutlined
                style={{ color: '#838CA1', marginLeft: 8 }}
              />
            </CustomTooltip>
          </div>
          <div className={styles.summary_left_desc}>
            {latestTime
              ? `Data last updated at ${dayjs(latestTime ?? '').format(
                  'H:mm on MMMM D,YYYY',
                )}`
              : ''}
          </div>
        </div>
        <div className={styles.summary_filter}>
          <div className={cls('formBar', styles.summary_formBar)}>
            <Input
              name="projectName"
              prefix={<FileIcon />}
              onClick={() => {
                setShowModal(true);
              }}
              allowClear
              value={
                selectedKeys.length
                  ? `${selectedCustomers.length} Customer${
                      selectedCustomers.length > 1 ? 's' : ''
                    } and ${selectedKeys.length} Project${
                      selectedKeys.length > 1 ? 's' : ''
                    }`
                  : undefined
              }
              style={{ width: '260px' }}
              onChange={(event) => {
                if (!event?.target?.value) {
                  setSelectedKeys([]);
                  setSelectedCustomers([]);
                  setSearchFilter(null);
                }
              }}
              placeholder={'All Projects'}
            />
            <div className={styles.summary_formBar_time}>
              <div>Group By</div>
              <Button
                type={
                  timeGroup === SummaryGroupByDate.DAY ? 'primary' : undefined
                }
                onClick={() => {
                  setStartTime(lastDayTime?.current?.[0]);
                  setEndTime(lastDayTime?.current?.[1]);
                  setTimeGroup(SummaryGroupByDate.DAY);
                }}
              >
                Day
              </Button>
              <Button
                type={
                  timeGroup === SummaryGroupByDate.WEEK ? 'primary' : undefined
                }
                onClick={() => {
                  setStartTime(lastWeekTime?.current?.[0]);
                  setEndTime(lastWeekTime?.current?.[1]);
                  setTimeGroup(SummaryGroupByDate.WEEK);
                }}
              >
                Week
              </Button>
              <Button
                type={
                  timeGroup === SummaryGroupByDate.MONTH ? 'primary' : undefined
                }
                onClick={() => {
                  setStartTime(lastMonthTime?.current?.[0]);
                  setEndTime(lastMonthTime?.current?.[1]);
                  setTimeGroup(SummaryGroupByDate.MONTH);
                }}
              >
                Month
              </Button>
            </div>
            {timeGroup === SummaryGroupByDate.DAY && (
              <div className={styles.summary_formBar_date}>
                <ProFormDatePicker
                  fieldProps={{
                    value: startTime,
                    onChange: (val: any) => {
                      dayChange(val, 'start');
                    },
                    disabledDate: (current: any) => {
                      return current >= dayjs(endTime).startOf('day');
                    },
                  }}
                  style={{ width: '180px' }}
                />
                <span style={{ marginTop: 7 }}>-</span>
                <ProFormDatePicker
                  fieldProps={{
                    value: endTime,
                    onChange: (val: any) => {
                      dayChange(val, 'end');
                    },
                    disabledDate: (current: any) => {
                      return (
                        current > dayjs().endOf('day') ||
                        current <= dayjs(startTime).startOf('day')
                      );
                    },
                  }}
                  style={{ width: '180px' }}
                />
              </div>
            )}
            {timeGroup === SummaryGroupByDate.WEEK && (
              <div className={styles.summary_formBar_date}>
                <ProFormDatePicker
                  fieldProps={{
                    value: startTime,
                    picker: 'week',
                    onChange: (val: any) => {
                      weekChange(val, 'start');
                    },
                    disabledDate: (current: any) => {
                      return current >= dayjs(endTime).startOf('day');
                    },
                  }}
                  style={{ width: '180px' }}
                />
                <span style={{ marginTop: 7 }}>-</span>
                <ProFormDatePicker
                  fieldProps={{
                    value: endTime,
                    picker: 'week',
                    onChange: (val: any) => {
                      weekChange(val, 'end');
                    },
                    disabledDate: (current: any) => {
                      return (
                        current > dayjs().endOf('day') ||
                        current <= dayjs(startTime).startOf('day')
                      );
                    },
                  }}
                  style={{ width: '180px' }}
                />
              </div>
            )}
            {timeGroup === SummaryGroupByDate.MONTH && (
              <div className={styles.summary_formBar_date}>
                <ProFormDatePicker
                  fieldProps={{
                    value: startTime,
                    picker: 'month',
                    onChange: (val: any) => {
                      monthChange(val, 'start');
                    },
                    disabledDate: (current: any) => {
                      return current >= dayjs(endTime).startOf('day');
                    },
                  }}
                  style={{ width: '180px' }}
                />
                <span style={{ marginTop: 7 }}>-</span>
                <ProFormDatePicker
                  fieldProps={{
                    value: endTime,
                    picker: 'month',
                    onChange: (val: any) => {
                      monthChange(val, 'end');
                    },
                    disabledDate: (current: any) => {
                      return (
                        current > dayjs().endOf('day') ||
                        current <= dayjs(startTime).startOf('day')
                      );
                    },
                  }}
                  style={{ width: '180px' }}
                />
              </div>
            )}
            {/* <Access
              accessible={access[PermissionEnum.BUSINESS_PERFORMANCE_DOWNLOAD]}
            > */}
            <Button
              className={styles.summary_formBar_down}
              onClick={downloadPrepare}
            >
              <DownloadOutlined className={styles.summary_formBar_down_icon} />
            </Button>
            {/* </Access> */}
          </div>
        </div>
      </div>
      {loading ? (
        <div className={styles.summary_stand}>
          <Skeleton
            title={false}
            paragraph={{
              rows: 8,
              width: [
                '48%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '64%',
              ],
            }}
            style={{ height: '450px' }}
            active
          />
        </div>
      ) : (
        <div style={{ padding: '0 24px', boxSizing: 'border-box' }}>
          <div ref={summaryRef} style={{ width: '100%', height: '450px' }} />
        </div>
      )}
      {showModal ? (
        <ProjectModal
          hideModal={() => {
            setShowModal(false);
          }}
          initParams={searchFilter}
          initKeys={selectedKeys}
          initIds={selectedCustomers}
          confirm={filterProjects}
        />
      ) : null}
      {loadLoading ? (
        <LoadingModal
          params={{
            groupBy: timeGroup,
            projectIds: selectedKeys.length ? selectedKeys : undefined,
            startDate: dayjs(startTime).format('YYYY-MM-DD'),
            endDate: dayjs(endTime).format('YYYY-MM-DD'),
          }}
          hide={() => setLoadLoading(false)}
        />
      ) : null}
    </div>
  );
}
