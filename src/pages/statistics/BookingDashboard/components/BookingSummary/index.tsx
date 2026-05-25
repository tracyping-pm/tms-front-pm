import { bookingSummary } from '@/api/statistics';
import { IBookingSummaryRecord } from '@/api/types/statistics';
import { DatePicker, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Title from '../Title';
import SummaryLine from './SummaryLine';
import SummaryTable from './SummaryTable';
import styles from './index.less';
const { RangePicker } = DatePicker;
interface IFormatBookingSummary {
  mouthDate: string[];
  avgDelivered: number[];
  delivered: number[];
  avgCommitted: number[];
  committed: number[];
}
export default function BookingSummary() {
  const [sourceData, setSourceData] = useState<IFormatBookingSummary>();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<any>();
  const formatList = (list: IBookingSummaryRecord[]) => {
    const result: IFormatBookingSummary = {
      mouthDate: [],
      avgDelivered: [],
      delivered: [],
      avgCommitted: [],
      committed: [],
    };
    list.forEach((item) => {
      result.mouthDate.push(item.mouthDate);
      result.avgDelivered.push(item.avgDelivered);
      result.delivered.push(item.delivered);
      result.avgCommitted.push(item.avgCommitted);
      result.committed.push(item.committed);
    });
    return result;
  };

  const init = async (data: any[]) => {
    const payload = {
      startDate: data[0].format('YYYY-MM-DD'),
      endDate: data[1].format('YYYY-MM-DD'),
    };
    setLoading(true);
    const res = await bookingSummary(payload).finally(() => setLoading(false));
    if (res.code === 200) {
      const _data = formatList(res.data);
      setSourceData(_data);
    }
  };

  const onDateChange = (current: any[]) => {
    if (current) {
      setDates([current[0], current[1]]);
      init([current[0], current[1]]);
    }
  };

  useEffect(() => {
    const time = [
      dayjs().subtract(11, 'month').startOf('month'),
      dayjs().endOf('month'),
    ];
    setDates(time);
    init(time);
  }, []);

  return (
    <div className={styles.bookingSummary}>
      <Spin spinning={loading}>
        <Title
          title="Booking Summary"
          // subTitle="The last 12 months"
          extra={
            <RangePicker
              placeholder={['Start Time', 'End Time']}
              value={dates}
              onChange={(_dates: any) => {
                onDateChange(_dates);
              }}
              allowClear={false}
              picker="month"
              // disabledDate={disabledDate}
            />
          }
        />
        <SummaryTable sourceData={sourceData} />
        <SummaryLine sourceData={sourceData} />
      </Spin>
    </div>
  );
}
