import { customerAnalysisList } from '@/api/statistics';
import { ICustomerAnalysisListRecord } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import { generateCompareColumns } from '@/pages/statistics/common/generateCompareColumns';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
  openNewTag,
} from '@/utils/utils';
import {
  Table as AntdTable,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import cls from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const { Text } = Typography;
const defaultDate: Dayjs = dayjs();
export default function AnalysisCustomer() {
  const { waybillTimeType } = useWaybillTimeType();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<ICustomerAnalysisListRecord[]>(
    [],
  );
  const [scrollY, setScrollY] = useState(500);
  const [originDataSource, setOriginDataSource] = useState<
    ICustomerAnalysisListRecord[]
  >([]);

  const nameValue = Form.useWatch('customerName', form);
  const comparisonPeriodValue = Form.useWatch('comparisonPeriod', form);
  const [loading, setLoading] = useState(false);

  const fetchDataSource = async () => {
    const params = form.getFieldsValue();

    setLoading(true);
    const payload = {
      startDate: dayjs(params.yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(params.yearMonth)
        .endOf('month')
        .format('YYYY-MM-DD 23:59:59'),
      searchName: params.customerName,
      waybillTimeType,
      comparisonPeriod: params.comparisonPeriod,
    };
    const res = await customerAnalysisList(payload).finally(() =>
      setLoading(false),
    );
    if (res.code === 200) {
      const data = res.data ?? [];
      setOriginDataSource(res.data);
      // setDataSource(data);
      const _nameValue = params?.customerName ?? '';
      // 过滤 dataSource ,包括大小写
      setDataSource(
        data.filter((item) => {
          return item?.customerName
            ?.toLowerCase()
            .includes(_nameValue?.toLowerCase());
        }),
      );
    }
  };
  const onNameChange = useCallback(
    (name: string) => {
      const list = originDataSource.map((item) => {
        const { customerName } = item;
        const content = customerName.replace(
          new RegExp(name, 'gi'),
          (match) => `<span style="color: red;">${match}</span>`,
        );

        return {
          ...item,
          customerName: content,
        };
      });

      // 过滤 dataSource ,包括大小写
      setDataSource(list);
    },
    [dataSource],
  );

  const onSearch = () => {
    fetchDataSource();
  };
  const onReset = () => {
    form.setFieldsValue({
      yearMonth: defaultDate,
      customerName: undefined,
      comparisonPeriod: 1,
    });
    fetchDataSource();
  };

  useEffect(() => {
    if (nameValue) {
      onNameChange(nameValue);
    }
  }, [nameValue]);

  useEffect(() => {
    const values = form.getFieldsValue();
    if (!values.yearMonth) {
      form.setFieldsValue({
        date: values.yearMonth || defaultDate,
      });
    }
    fetchDataSource();
  }, [waybillTimeType]);

  const yearMonthValue = Form.useWatch('yearMonth', form);

  const columns: ColumnsType<ICustomerAnalysisListRecord> = useMemo(() => {
    const waybillCompareColumns =
      generateCompareColumns<ICustomerAnalysisListRecord>({
        baseTitle: 'Waybill Change',
        listDataIndex: 'waybillNumChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: true,
        columnWidth: 160,
      });
    const avgWaybillCompareColumns =
      generateCompareColumns<ICustomerAnalysisListRecord>({
        baseTitle: 'Avg Daily Waybill Change',
        listDataIndex: 'avgWaybillNumChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: true,
        columnWidth: 160,
      });
    const revenueCompareColumns =
      generateCompareColumns<ICustomerAnalysisListRecord>({
        baseTitle: 'Revenue Change',
        listDataIndex: 'revenueChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
      });
    const gpCompareColumns =
      generateCompareColumns<ICustomerAnalysisListRecord>({
        baseTitle: 'GP Change',
        listDataIndex: 'gpChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
      });
    const gmCompareColumns =
      generateCompareColumns<ICustomerAnalysisListRecord>({
        baseTitle: 'GM Change',
        listDataIndex: 'gmChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
      });

    return [
      {
        title: 'No.',
        width: 50,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: 'Customer',
        dataIndex: 'customerName',
        ellipsis: true,
        width: 220,
        fixed: 'left',
        render: (_, record) => {
          return (
            <CustomTooltip title={record.customerName}>
              <span
                dangerouslySetInnerHTML={{ __html: record.customerName }}
              ></span>
            </CustomTooltip>
          );
        },
      },

      {
        title: 'PIC(BD)',
        dataIndex: 'bdName',
        width: 100,
        render: (_, record) => {
          return (
            <CustomTooltip title={record.bdName}>
              <Text ellipsis>{record.bdName}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'PIC(CAM)',
        dataIndex: 'camName',
        width: 100,
        render: (_, record) => {
          return (
            <CustomTooltip title={record.camName}>
              <Text ellipsis>{record.camName}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Project',
        dataIndex: 'projectNum',
        width: 100,
        render: (_, record) => {
          const num = record.projectNum;
          return (
            <CustomTooltip title={formatAmount(num)}>
              <div
                onClick={() => {
                  if (num === 0) {
                    return;
                  }
                  openNewTag(
                    `${PATHS.CUSTOMER_ANALYSIS_BY_PROJECT}?yearMonth=${dayjs(form.getFieldsValue().yearMonth).format('YYYY-MM')}&customerId=${record.customerId}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                <Text ellipsis className={cls(num > 0 && styles.number)}>
                  {formatAmount(num)}
                </Text>
              </div>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Waybill',
        dataIndex: 'waybillNum',
        width: 100,
        render: (_, record) => {
          const num = formatAmount(record.waybillNum);

          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },

      ...waybillCompareColumns,
      {
        title: 'Avg Daily Waybill',
        dataIndex: 'avgWaybillNum',
        width: 130,
        render: (_, record) => {
          const num = formatAmount(record.avgWaybillNum);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...avgWaybillCompareColumns,
      {
        title: 'Revenue',
        dataIndex: 'revenue',
        align: 'right',
        width: 120,
        sorter: (a, b) => a.revenue - b.revenue,
        defaultSortOrder: 'descend',
        render: (_, record) => {
          const num = formatAmountWithRound(record.revenue);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...revenueCompareColumns,
      {
        title: 'Gross Profit',
        dataIndex: 'grossProfit',
        align: 'right',
        width: 120,
        sorter: (a, b) => a.grossProfit - b.grossProfit,
        render: (_, record) => {
          const num = formatAmountWithRound(record.grossProfit);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...gpCompareColumns,

      {
        title: 'Gross Margin',
        dataIndex: 'grossMargin',
        align: 'right',
        width: 120,
        sorter: (a, b) => a.grossMargin - b.grossMargin,
        render: (_, record) => {
          const grossMargin =
            typeof record.grossMargin === 'number' &&
            !Number.isNaN(record.grossMargin)
              ? formatMoneyWithDecimal(record.grossMargin) + '%'
              : '-';
          return (
            <CustomTooltip title={grossMargin}>
              <Text ellipsis>{grossMargin}</Text>
            </CustomTooltip>
          );
        },
      },
      ...gmCompareColumns,
      {
        title: 'Action',
        width: 150,
        render: (_, record) => {
          const customerName = record.customerName
            ? `&customerName=${encodeURIComponent(record.customerName as string)}`
            : '';
          return (
            <Flex gap={12} align="center">
              <Button
                type="link"
                size="small"
                onClick={() => {
                  openNewTag(
                    `${PATHS.CUSTOMER_ANALYSIS_CUSTOMER_TREND}?yearMonth=${dayjs(form.getFieldsValue().yearMonth).format('YYYY-MM')}&id=${record.customerId}${customerName}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                Trend
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  openNewTag(
                    `${PATHS.CUSTOMER_ANALYSIS_CUSTOMER_COMPARISON}?yearMonth=${dayjs(form.getFieldsValue().yearMonth).format('YYYY-MM')}&customerId=${record.customerId}${customerName}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                Compare
              </Button>
            </Flex>
          );
        },
      },
    ];
  }, [dataSource, yearMonthValue, waybillTimeType]);

  return (
    <CardView
      title={'Customer Analysis'}
      showFullScreen
      fullScreenChanged={(isFullScreen) => {
        setScrollY(isFullScreen ? window.innerHeight - 200 : 500);
      }}
    >
      <Row gutter={12}>
        <Col span={24}>
          <Form
            name="customer-analysis-form"
            form={form}
            style={{ marginBottom: '8px' }}
            initialValues={{
              yearMonth: defaultDate,
              comparisonPeriod: 1,
            }}
          >
            <Flex gap={15} wrap style={{ marginBottom: 12 }}>
              <div style={{ width: '160px' }}>
                <Form.Item name="yearMonth" noStyle>
                  <DatePicker
                    picker="month"
                    placeholder="Month"
                    allowClear={false}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('day');
                    }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <div style={{ width: '160px' }}>
                <Form.Item name="customerName" noStyle>
                  <Input placeholder="Customer Name" />
                </Form.Item>
              </div>

              <div style={{ width: 300 }}>
                <Form.Item
                  name="comparisonPeriod"
                  label="Comparison Period"
                  style={{ marginBottom: 0, width: 300 }}
                >
                  <Select
                    placeholder="Compare Month"
                    allowClear
                    options={Array.from({ length: 12 }, (_, i) => ({
                      label:
                        i === 0
                          ? 'Previous Month'
                          : `Past  ${i + 1} Month${i + 1 > 1 ? 's' : ''}`,
                      value: i + 1,
                    }))}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <Button type="primary" onClick={onSearch}>
                Search
              </Button>

              <Button onClick={onReset}>Reset</Button>
            </Flex>
          </Form>
          {loading ? (
            <SkeletonView />
          ) : (
            <AntdTable
              rowKey={(record) => record.customerId}
              virtual
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 'max-content', y: scrollY }}
            />
          )}
        </Col>
      </Row>
    </CardView>
  );
}
