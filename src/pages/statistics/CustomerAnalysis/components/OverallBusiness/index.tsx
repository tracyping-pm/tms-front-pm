import { customerAnalysisBusinessMonitor } from '@/api/statistics';
import {
  ICustomerAnalysisBusinessMonitorParams,
  ICustomerAnalysisBusinessMonitorRecord,
} from '@/api/types/statistics';
import { BUEnum } from '@/enums';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { Button, Col, DatePicker, Flex, Form, Row, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import Charts from './Charts';
import Table from './Table';
const defaultDate: Dayjs = dayjs();
export default function OverallBusiness() {
  const { waybillTimeType } = useWaybillTimeType();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<
    ICustomerAnalysisBusinessMonitorRecord[]
  >([]);

  const [loading, setLoading] = useState(false);

  const fetchDataSource = async (params: { date: Dayjs; bu?: BUEnum }) => {
    setLoading(true);

    const payload: ICustomerAnalysisBusinessMonitorParams = {
      startDate:
        dayjs(params.date).startOf('year').format('YYYY-MM-DD 00:00:00') || '',
      endDate:
        dayjs(params.date).endOf('year').format('YYYY-MM-DD 23:59:59') || '',
      bu: params.bu,
      waybillTimeType,
    };
    const res = await customerAnalysisBusinessMonitor(payload).finally(() =>
      setLoading(false),
    );
    if (res.code === 200) {
      setDataSource(res.data || []);
    }
  };

  const onSearch = () => {
    const values = form.getFieldsValue();
    const payload = {
      date: values.yearMonth,
      bu: values.bu,
    };

    fetchDataSource(payload);
  };
  const onReset = () => {
    form.resetFields();
    fetchDataSource({ date: defaultDate });
  };

  useEffect(() => {
    const values = form.getFieldsValue();
    if (!values.yearMonth) {
      form.setFieldsValue({
        yearMonth: defaultDate,
      });
    }

    fetchDataSource({
      date: values.yearMonth || defaultDate,
      bu: values.bu,
    });
  }, [waybillTimeType]);

  return (
    <CardView
      title={
        <TooltipTitle tips="All revenues and expenditures included in the statistics only cover Contract Revenue and Contract Cost">
          Overall Business Status Monitor
        </TooltipTitle>
      }
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form
            name="overall-business-form"
            form={form}
            style={{ marginBottom: '8px' }}
            initialValues={{
              yearMonth: defaultDate,
            }}
          >
            <Flex gap={15} style={{ marginBottom: 12 }}>
              <div style={{ width: '160px' }}>
                <Form.Item name="yearMonth" noStyle>
                  <DatePicker
                    picker="year"
                    placeholder="Year"
                    allowClear={false}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('day');
                    }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
              <div style={{ width: '200px' }}>
                <Form.Item name="bu" noStyle>
                  <Select
                    style={{ width: 200 }}
                    placeholder="All BU"
                    options={Object.values(BUEnum).map((item) => ({
                      label: item,
                      value: item,
                    }))}
                  />
                </Form.Item>
              </div>

              <Button
                type="primary"
                onClick={() => {
                  onSearch();
                }}
              >
                Search
              </Button>
              <Button onClick={onReset}>Reset</Button>
            </Flex>
          </Form>
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
