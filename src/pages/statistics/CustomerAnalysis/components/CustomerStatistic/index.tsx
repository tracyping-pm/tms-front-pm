import { customerAnalysisActiveCustomerStatic } from '@/api/statistics';
import {
  IActiveCustomerStaticRecord,
  IActiveStaticParams,
} from '@/api/types/statistics';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import { Col, DatePicker, Flex, Row } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import Charts from './Charts';
import Table from './Table';
export default function CustomerStatistic() {
  const { waybillTimeType } = useWaybillTimeType();
  const [dataSource, setDataSource] = useState<IActiveCustomerStaticRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [dateValue, setDateValue] = useState<Dayjs>(dayjs());

  const fetchDataSource = async (date: Dayjs) => {
    setLoading(true);

    const payload: IActiveStaticParams = {
      startDate:
        dayjs(date).startOf('year').format('YYYY-MM-DD 00:00:00') || '',
      endDate: dayjs(date).endOf('year').format('YYYY-MM-DD 23:59:59') || '',
      waybillTimeType,
    };
    const res = await customerAnalysisActiveCustomerStatic(payload).finally(
      () => setLoading(false),
    );
    if (res.code === 200) {
      const data = res.data ?? [];
      setDataSource(data);
    }
  };

  const onDatePickerChange = (date: Dayjs) => {
    setDateValue(date);

    // fetchDataSource(date);
  };

  useEffect(() => {
    fetchDataSource(dateValue);
  }, [dateValue, waybillTimeType]);

  return (
    <CardView title={'Customer Statistic'}>
      <Row gutter={12}>
        <Col span={12}>
          <Flex gap={15} style={{ marginBottom: 12 }}>
            <DatePicker
              style={{ width: 160 }}
              picker="year"
              value={dateValue}
              allowClear={false}
              onChange={onDatePickerChange}
              disabledDate={(current) => {
                return current && current > dayjs().endOf('day');
              }}
            />
          </Flex>
          {loading ? <SkeletonView /> : <Table dataSource={dataSource} />}
        </Col>
        <Col span={12}>
          {loading ? (
            <SkeletonView rows={11} />
          ) : (
            <Charts dataSource={dataSource} />
          )}
        </Col>
      </Row>
    </CardView>
  );
}
