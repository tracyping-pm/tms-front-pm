import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { BillingStatusEnumText, ServiceTypeTypeEnumText } from '../../enum';
const { RangePicker } = DatePicker;

interface IProps {
  onSearchHandle: (v?: any) => void;
}
export default function Header({ onSearchHandle }: IProps) {
  const [form] = Form.useForm();

  const onSearch = () => {
    const values = form.getFieldsValue();
    const payload = {
      hgCompanyName: values.hgCompanyName,
      hgServiceTypeList: values.hgServiceTypeList,
      hgClientName: values.hgClientName,
      hgClientTag: values.hgClientTag,
      hgBillingStatus: values.hgBillingStatus,
      hgInvoiceNo: values.hgInvoiceNo,
      hgClientReceiveDateStart: values.hgClientReceiveDate?.[0]
        ? dayjs(values.hgClientReceiveDate[0]).format('YYYY-MM-DD')
        : undefined,
      hgClientReceiveDateEnd: values.hgClientReceiveDate?.[1]
        ? dayjs(values.hgClientReceiveDate[1]).format('YYYY-MM-DD')
        : undefined,
      hgCoveredPeriodStart: values.hgCoveredPeriod?.[0]
        ? dayjs(values.hgCoveredPeriod[0]).format('YYYY-MM-DD')
        : undefined,
      hgCoveredPeriodEnd: values.hgCoveredPeriod?.[1]
        ? dayjs(values.hgCoveredPeriod[1]).format('YYYY-MM-DD')
        : undefined,
      uploadTimeStart: values.uploadTime?.[0]
        ? dayjs(values.uploadTime[0]).format('YYYY-MM-DD HH:mm:00')
        : undefined,
      uploadTimeEnd: values.uploadTime?.[1]
        ? dayjs(values.uploadTime[1]).format('YYYY-MM-DD HH:mm:00')
        : undefined,
    };
    onSearchHandle?.(payload);
  };
  const onReset = () => {
    form.resetFields();

    onSearchHandle?.();
  };

  return (
    <>
      <Form name="transportation-filter-form" form={form}>
        <div className="transportationFilterForm">
          <div style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'hgCompanyName'} label={null} noStyle>
              <Input
                placeholder={'Company Name'}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'hgServiceTypeList'} label={null} noStyle>
              <Select
                style={{ width: '100%' }}
                placeholder={'Service Type'}
                mode="multiple"
                options={Object.keys(ServiceTypeTypeEnumText).map((key) => ({
                  value: key,
                  label: key,
                }))}
              />
            </Form.Item>
          </div>
          <div style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'hgClientName'} label={null} noStyle>
              <Input
                placeholder={'Client Name'}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'hgClientTag'} label={null} noStyle>
              <Input
                placeholder={'Client Tag'}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'hgBillingStatus'} label={null} noStyle>
              <Select
                style={{ width: '100%' }}
                placeholder={'Billing Status'}
                options={Object.keys(BillingStatusEnumText).map((key) => ({
                  value: key,
                  label: key,
                }))}
              />
            </Form.Item>
          </div>
          <div style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'hgInvoiceNo'} label={null} noStyle>
              <Input
                placeholder={'Invoice No.'}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: DATE_WIDTH }}>
            <Form.Item name={'hgClientReceiveDate'} label={null} noStyle>
              <RangePicker
                placeholder={[
                  'Date Received (Returned)By Client Start',
                  'Date Received (Returned)By Client End',
                ]}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: DATE_WIDTH }}>
            <Form.Item name={'hgCoveredPeriod'} label={null} noStyle>
              <RangePicker
                placeholder={['Covered Period Start', 'Covered Period End']}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: DATE_WIDTH }}>
            <Form.Item name={'uploadTime'} label={null} noStyle>
              <RangePicker
                showTime
                format={'YYYY-MM-DD HH:mm'}
                placeholder={['Upload Time Start', 'Upload Time End']}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Button type="primary" onClick={onSearch}>
            Search
          </Button>
          <Button onClick={onReset}>Reset</Button>
        </div>
      </Form>
    </>
  );
}
