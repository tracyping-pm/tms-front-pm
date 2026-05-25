import { useFullscreen } from 'ahooks';
import { DatePicker, DatePickerProps, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Title from '../Title';
import CustomerList from './components/CustomerList';
import CustomerProject from './components/CustomerProject';
import CustomerTrends from './components/CustomerTrends';
import styles from './index.less';

const { RangePicker } = DatePicker;

export enum BookingTrendsTypeEnum {
  byDay = 'byDay',
  byMonth = 'byMonth',
}
export default function BookingTrends() {
  const [dateType, setDateType] = useState<BookingTrendsTypeEnum>(
    BookingTrendsTypeEnum.byDay,
  );

  const containerRef = useRef(null);

  const [dateRange, setDateRange] = useState<Dayjs[]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
    // dayjs('2024-03-01 00:00:00').startOf('month'),
    // dayjs('2025-03-31 23:59:59').endOf('month'),
  ]);

  const [activeCustomerObj, setActiveCustomerObj] = useState<{
    customerId: number;
    customerName: string;
  }>();

  const [isFullscreen, { toggleFullscreen }] = useFullscreen(containerRef, {
    pageFullscreen: { zIndex: 800 },
  });

  const onDateChange = (dates: Dayjs[]) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const onDateTypeChange = (value: BookingTrendsTypeEnum) => {
    if (value === BookingTrendsTypeEnum.byMonth) {
      setDateRange([
        dayjs().subtract(11, 'month').startOf('month'),
        dayjs().endOf('month'),
      ]);
    } else {
      setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
    }
    setDateType(value);
  };

  const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();
  const disabledMonthsDate: DatePickerProps['disabledDate'] = (
    current,
    { from, type },
  ) => {
    if (from) {
      const minDate = from.add(-12, 'months');
      const maxDate = from.add(12, 'months');

      switch (type) {
        case 'year':
          return (
            current.year() < minDate.year() || current.year() > maxDate.year()
          );

        default:
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );
      }
    }

    return false;
  };

  const disabledDaysDate: DatePickerProps['disabledDate'] = (
    current,
    { from, type },
  ) => {
    if (from) {
      const minDate = from.add(-31, 'days');
      const maxDate = from.add(31, 'days');

      switch (type) {
        case 'year':
          return (
            current.year() < minDate.year() || current.year() > maxDate.year()
          );

        case 'month':
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );

        default:
          return Math.abs(current.diff(from, 'days')) >= 31;
      }
    }

    return false;
  };

  let scrollTop = useRef(0);
  const getScrollTop = () => {
    const layoutContent =
      document.querySelector<HTMLElement>('.booKingDashboard');
    return layoutContent?.scrollHeight;
  };
  const lockBodyScroll = () => {
    scrollTop.current = getScrollTop() ?? 0;
    document.body.style.overflow = 'hidden';
  };

  const unlockBodyScroll = () => {
    document.body.style.overflow = '';

    window?.scrollTo(0, scrollTop.current);
  };

  useEffect(() => {
    if (isFullscreen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    return () => unlockBodyScroll();
  }, [isFullscreen]);

  return (
    <div className={styles.trendsMain} ref={containerRef}>
      <Title
        title="Customer Booking Trends"
        showFullScreen
        controlled={true}
        newIsFullscreen={isFullscreen}
        newToggleFullscreen={() => {
          toggleFullscreen();
        }}
        extra={
          <>
            {dateType === BookingTrendsTypeEnum.byDay ? (
              <RangePicker
                placeholder={['Start Time', 'End Time']}
                // @ts-ignore
                value={dateRange}
                onChange={(dates: any) => {
                  onDateChange(dates);
                }}
                disabledDate={disabledDaysDate}
                allowClear={false}
              />
            ) : (
              <RangePicker
                placeholder={['Start Month', 'End Month']}
                // @ts-ignore
                value={dateRange}
                onChange={(dates: any) => {
                  const _dates = [
                    dayjs(dates[0]).startOf('month'),
                    dayjs(dates[1]).endOf('month'),
                  ];
                  onDateChange(_dates);
                }}
                disabledDate={disabledMonthsDate}
                picker="month"
                allowClear={false}
              />
            )}
            <Select
              defaultValue={dateType}
              style={{ width: 120, marginLeft: 10 }}
              onChange={(value: BookingTrendsTypeEnum) => {
                onDateTypeChange(value);
              }}
              options={[
                { value: BookingTrendsTypeEnum.byDay, label: 'By Day' },
                { value: BookingTrendsTypeEnum.byMonth, label: 'By Month' },
              ]}
            />
          </>
        }
      />

      <div className={styles.trendsContent}>
        <CustomerList
          dateRange={dateRange}
          onSelectCustomerHandle={(customerObj) => {
            setActiveCustomerObj(customerObj);
          }}
        />
        <div className={styles.trendsChart}>
          <CustomerTrends
            dateRange={dateRange}
            dateType={dateType}
            selectedCustomer={activeCustomerObj!}
          />
          <CustomerProject
            newIsFullscreen={isFullscreen}
            newToggleFullscreen={toggleFullscreen}
            dateRange={dateRange}
            dateType={dateType}
            selectedCustomer={activeCustomerObj!}
          />
        </div>
      </div>
    </div>
  );
}
