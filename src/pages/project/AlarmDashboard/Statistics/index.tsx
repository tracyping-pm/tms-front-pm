import { alarmDashboardStatisticsList } from '@/api/project';
import { IAlarmDashboardStatisticsListItem } from '@/api/types/project';
import { STATISTICS_TIME_OPTION } from '@/constants';
import { Button, DatePicker, Radio, Row } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import StatisticsList from './List';
import styles from './styles.less';

const { RangePicker } = DatePicker;

const AlarmStatistics: React.FC = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<
    IAlarmDashboardStatisticsListItem[]
  >([]);

  const [timeOption, setTimeOption] = useState<STATISTICS_TIME_OPTION>(
    STATISTICS_TIME_OPTION.CURRENT_MONTH,
  );
  const [startTime, setStartTime] = useState<any>(dayjs().startOf('month'));
  const [endTime, setEndTime] = useState<any>(
    dayjs().endOf('month').isAfter(dayjs().endOf('day'))
      ? dayjs().endOf('day')
      : dayjs().endOf('month'),
  );

  const btnChange = (e: { target: any }) => {
    setTimeOption(e.target.value);
    switch (e.target.value) {
      case STATISTICS_TIME_OPTION.CURRENT_MONTH:
        setStartTime(dayjs().startOf('month'));
        setEndTime(
          dayjs().endOf('month').isAfter(dayjs().endOf('day'))
            ? dayjs().endOf('day')
            : dayjs().endOf('month'),
        );
        break;
      case STATISTICS_TIME_OPTION.LAST_MONTH:
        setStartTime(dayjs().subtract(1, 'month').startOf('month'));
        setEndTime(dayjs().subtract(1, 'month').endOf('month'));
        break;
      case STATISTICS_TIME_OPTION.CURRENT_WEEK:
        setStartTime(dayjs().startOf('week').add(1, 'day'));
        setEndTime(
          dayjs().endOf('week').add(1, 'day').isAfter(dayjs().endOf('day'))
            ? dayjs().endOf('day')
            : dayjs().endOf('week').add(1, 'day'),
        );
        break;
      case STATISTICS_TIME_OPTION.LAST_WEEK:
        setStartTime(dayjs().subtract(1, 'week').startOf('week').add(1, 'day'));
        setEndTime(dayjs().subtract(1, 'week').endOf('week').add(1, 'day'));
        break;
    }
  };

  const searchHandle = async () => {
    setTableLoading(true);
    const res = await alarmDashboardStatisticsList({
      startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
      endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
    }).finally(() => {
      setTableLoading(false);
    });
    if (res.code === 200) {
      setTableData(res.data);
    }
  };

  useEffect(() => {
    searchHandle();
  }, [startTime, endTime]);

  return (
    <>
      <div className={styles.statistics} style={{ marginTop: 24 }}>
        <div>
          <div className={styles.option}>
            <div className={styles.option_title}>
              Alarm Handling Volume Statistics
            </div>
            <div className={styles.option_operate}>
              <Radio.Group
                defaultValue={STATISTICS_TIME_OPTION.CURRENT_MONTH}
                buttonStyle="solid"
                value={timeOption}
                onChange={btnChange}
              >
                <Radio.Button value={STATISTICS_TIME_OPTION.CURRENT_MONTH}>
                  Current Month
                </Radio.Button>
                <Radio.Button value={STATISTICS_TIME_OPTION.LAST_MONTH}>
                  Last Month
                </Radio.Button>
                <Radio.Button value={STATISTICS_TIME_OPTION.CURRENT_WEEK}>
                  Current Week
                </Radio.Button>
                <Radio.Button value={STATISTICS_TIME_OPTION.LAST_WEEK}>
                  Last Week
                </Radio.Button>
              </Radio.Group>
              <RangePicker
                value={[startTime, endTime]}
                allowClear={false}
                onChange={(dates: any) => {
                  setStartTime(dayjs(dates[0]).startOf('day'));
                  setEndTime(dayjs(dates[1]).endOf('day'));
                  setTimeOption(STATISTICS_TIME_OPTION.NONE);
                }}
              />
              <Button type="primary" onClick={searchHandle} size={'middle'}>
                Search
              </Button>
              <Button
                onClick={() => {
                  btnChange({
                    target: { value: STATISTICS_TIME_OPTION.CURRENT_MONTH },
                  });
                }}
                size={'middle'}
              >
                Reset
              </Button>
            </div>
          </div>
          <Row>
            <StatisticsList loading={tableLoading} list={tableData} />
          </Row>
        </div>
      </div>
    </>
  );
};

export default AlarmStatistics;
