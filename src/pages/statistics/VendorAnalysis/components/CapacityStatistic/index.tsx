import { vendorAnalysisCapacityStatistic } from '@/api/statistics';
import {
  IVendorAnalysisCapacityStatisticItem,
  IVendorAnalysisCapacityStatisticPayload,
} from '@/api/types/statistics';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { Col, DatePicker, Flex, Row } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { useWaybillTimeType } from '../../../common/TimeTypeContext';
import Charts from './Charts';
import Table from './Table';

const CapacityStatistic: FC = () => {
  const { waybillTimeType } = useWaybillTimeType();
  const [dataSource, setDataSource] = useState<
    IVendorAnalysisCapacityStatisticItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [dateValue, setDateValue] = useState<Dayjs>(dayjs());
  const fetchDataSource = async (
    params: IVendorAnalysisCapacityStatisticPayload,
  ) => {
    setLoading(true);
    const res = await vendorAnalysisCapacityStatistic(params).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setDataSource(res.data);
    }
  };

  const onDatePickerChange = (date: Dayjs) => {
    setDateValue(date);
  };

  useEffect(() => {
    fetchDataSource({ year: dateValue.format('YYYY'), waybillTimeType });
  }, [dateValue, waybillTimeType]);

  return (
    <CardView title="Capacity Statistic">
      <Row gutter={12}>
        <Col span={12}>
          <Flex gap={15}>
            <DatePicker
              picker="year"
              value={dateValue}
              allowClear={false}
              onChange={onDatePickerChange}
              disabledDate={(current) => {
                return current && current > dayjs().endOf('day');
              }}
              style={{ width: '160px', marginBottom: '8px' }}
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
};

export default CapacityStatistic;
