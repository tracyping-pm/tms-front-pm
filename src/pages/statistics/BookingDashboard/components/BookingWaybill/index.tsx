import { bookingCustomerWaybill } from '@/api/statistics';
import { IBookingCustomerWaybillRecord } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DatePicker, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Title from '../Title';
import styles from './index.less';
import WaybillBar from './WaybillBar';

const { RangePicker } = DatePicker;

interface IFormatBookingCustomerWaybill {
  customerName: string[];
  delivered: number[];
  committed: number[];
}
export default function BookingWaybill() {
  const [sourceData, setSourceData] = useState<IFormatBookingCustomerWaybill>();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<any>();

  const containerRef = useRef(null);

  const formatList = (list: IBookingCustomerWaybillRecord[]) => {
    const result: IFormatBookingCustomerWaybill = {
      customerName: [],
      delivered: [],
      committed: [],
    };
    list.forEach((item) => {
      result.customerName.push(item.customerName);
      result.delivered.push(item.delivered!);
      result.committed.push(item.committed!);
    });
    return result;
  };

  const init = async (data: any[]) => {
    const payload = {
      startDate: data[0].format('YYYY-MM-DD 00:00:00'),
      endDate: data[1].format('YYYY-MM-DD 23:59:59'),
    };
    setLoading(true);
    const res = await bookingCustomerWaybill(payload).finally(() =>
      setLoading(false),
    );
    if (res?.code === 200) {
      setSourceData(formatList(res.data));
    }
  };

  const onDateChange = (current: any[]) => {
    if (current) {
      setDates([current[0], current[1]]);
      init([current[0], current[1]]);
    }
  };
  const disabledDate = (current: dayjs.Dayjs) => {
    if (!dates || !dates[0]) return false;

    const start = dates[0];
    return (
      current.isAfter(start.add(12, 'month'), 'day') ||
      current.isBefore(start.subtract(12, 'month'), 'day')
    );
  };

  useEffect(() => {
    const time = [dayjs().startOf('month'), dayjs().endOf('month')];
    setDates(time);
    init(time);
  }, []);

  return (
    <div className={styles.waybillBarMain} ref={containerRef}>
      <Title
        title="Customer Booking Waybill"
        containerRef={containerRef}
        showFullScreen={true}
        subTitle={
          <>
            Committed Qty: Descending
            <CustomTooltip
              title="Display Only In-Service Customers"
              placement="top"
            >
              <InfoCircleOutlined
                style={{ color: 'rgba(0, 0, 0, 0.25)', marginLeft: 10 }}
              />
            </CustomTooltip>
          </>
        }
        extra={
          <RangePicker
            placeholder={['Start Time', 'End Time']}
            value={dates}
            onChange={(_dates: any) => {
              onDateChange(_dates);
            }}
            allowClear={false}
            disabledDate={disabledDate}
          />
        }
      />
      <Spin spinning={loading}>
        <WaybillBar sourceData={sourceData}></WaybillBar>
      </Spin>
    </div>
  );
}
