import { vendorAnalysisByCustomer } from '@/api/statistics';
import {
  IVendorAnalysisByCustomerItem,
  IVendorAnalysisByCustomerPayload,
  IVendorAnalysisByCustomerVendorItem,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { generateCompareColumns } from '@/pages/statistics/common/generateCompareColumns';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Radio,
  Select,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SortOrder } from 'antd/es/table/interface';
import dayjs, { Dayjs } from 'dayjs';
import {
  FC,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWaybillTimeType } from '../../../common/TimeTypeContext';
import SubTable from './SubTable';

const { Text } = Typography;

type SortConfig = {
  columnKey: string | undefined;
  order: 'ascend' | 'descend' | undefined;
};

enum STATISTICS_TIME_OPTION {
  NONE = 'none',
  CURRENT_MONTH = 'Current Month',
  LAST_MONTH = 'Last Month',
}

const dateFormat = 'YYYY-MM';
const defaultDate: Dayjs = dayjs();

const ByCustomer: FC = () => {
  const { waybillTimeType } = useWaybillTimeType();
  const [form] = Form.useForm();
  const yearMonthValue = Form.useWatch('yearMonth', form);
  const comparisonPeriodValue = Form.useWatch('comparisonPeriod', form);
  const [dataSource, setDataSource] = useState<IVendorAnalysisByCustomerItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [scrollY, setScrollY] = useState(500);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    columnKey: 'revenue',
    order: 'descend',
  });
  const subTableCacheRef = useRef<
    Map<number, IVendorAnalysisByCustomerVendorItem[]>
  >(new Map());
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const [currentSortField, setCurrentSortField] = useState<string>('revenue');
  const [currentSortOrder, setCurrentSortOrder] =
    useState<SortOrder>('descend');

  // const antdOrder = (order: SortOrder) => {
  //   return order === 'ascend' ? 'ascend' : 'descend';
  // };

  // 前端分页配置
  const PAGE_SIZE = 20;
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  // 是否还有更多数据
  const hasMore = displayLimit < dataSource.length;
  const loadingMoreRef = useRef(false);
  // 分批显示的数据
  const displayDataSource = useMemo(() => {
    if (!currentSortField || !currentSortOrder) {
      return dataSource.slice(0, displayLimit);
    }
    const sortedData = [...dataSource].sort((a: any, b: any) => {
      const v1 = a[currentSortField];
      const v2 = b[currentSortField];
      if (currentSortOrder === 'ascend') {
        return v1 - v2;
      }
      return v2 - v1;
    });
    return sortedData.slice(0, displayLimit);
  }, [dataSource, displayLimit, currentSortField, currentSortOrder]);

  const antdOrder = useMemo((): SortOrder | undefined => {
    if (!currentSortOrder) return undefined;
    return currentSortOrder === 'ascend' ? 'ascend' : 'descend';
  }, [currentSortOrder]);

  const fetchDataSource = async (params: IVendorAnalysisByCustomerPayload) => {
    setDisplayLimit(PAGE_SIZE);
    setLoading(true);
    subTableCacheRef.current.clear();
    setExpandedRowKeys([]);
    const res = await vendorAnalysisByCustomer(params).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setDataSource(res.data);
    }
  };

  const onSearch = () => {
    const values = form.getFieldsValue();

    fetchDataSource({
      yearMonth: values.yearMonth?.format(dateFormat),
      customerId: values?.customerObj?.id,
      waybillTimeType,
      comparisonPeriod: values?.comparisonPeriod,
    });
  };

  const onReset = () => {
    form.setFieldsValue({
      yearMonth: defaultDate,
      timeOption: STATISTICS_TIME_OPTION.CURRENT_MONTH,
      comparisonPeriod: 1,
    });
    fetchDataSource({
      yearMonth: defaultDate.format(dateFormat),
      waybillTimeType,
      comparisonPeriod: 1,
    });
  };

  const handleValuesChange = (changedValues: any) => {
    // 逻辑 A：当用户点击 Radio 按钮时，同步修改 DatePicker
    if ('timeOption' in changedValues) {
      const option = changedValues.timeOption;
      let targetDate = dayjs();

      if (option === STATISTICS_TIME_OPTION.LAST_MONTH) {
        targetDate = dayjs().subtract(1, 'month');
      }

      form.setFieldsValue({
        yearMonth: targetDate,
      });
    }

    // 逻辑 B：当用户手动选择 DatePicker 时，判断是否匹配快捷按钮
    if ('yearMonth' in changedValues) {
      const selectedDate = changedValues.yearMonth;
      const isCurrentMonth = selectedDate.isSame(dayjs(), 'month');
      const isLastMonth = selectedDate.isSame(
        dayjs().subtract(1, 'month'),
        'month',
      );

      if (isCurrentMonth) {
        form.setFieldsValue({
          timeOption: STATISTICS_TIME_OPTION.CURRENT_MONTH,
        });
      } else if (isLastMonth) {
        form.setFieldsValue({ timeOption: STATISTICS_TIME_OPTION.LAST_MONTH });
      } else {
        form.setFieldsValue({ timeOption: STATISTICS_TIME_OPTION.NONE });
      }
    }
  };

  const handleTableChange = useCallback(
    (_pagination: any, _filters: any, sorter: any) => {
      const { columnKey, order } = Array.isArray(sorter) ? sorter[0] : sorter;

      setSortConfig({ columnKey, order });
      setCurrentSortField(columnKey as string);
      setCurrentSortOrder(order as SortOrder);
    },
    [],
  );

  const columns: ColumnsType<IVendorAnalysisByCustomerItem> = useMemo(() => {
    const waybillCompareColumns =
      generateCompareColumns<IVendorAnalysisByCustomerItem>({
        baseTitle: 'Waybill Change',
        listDataIndex: 'waybillCountChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: true,
        sortConfig: {
          currentSortField,
          currentSortOrder,
        },
        includeKey: true,
        columnWidth: 160,
      });
    const revenueCompareColumns =
      generateCompareColumns<IVendorAnalysisByCustomerItem>({
        baseTitle: 'Revenue Change',
        listDataIndex: 'revenueChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
        sortConfig: {
          currentSortField,
          currentSortOrder,
        },
        includeKey: true,
      });
    const gpCompareColumns =
      generateCompareColumns<IVendorAnalysisByCustomerItem>({
        baseTitle: 'GP Change',
        listDataIndex: 'gpChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
        sortConfig: {
          currentSortField,
          currentSortOrder,
        },
        includeKey: true,
      });
    const gmCompareColumns =
      generateCompareColumns<IVendorAnalysisByCustomerItem>({
        baseTitle: 'GM Change',
        listDataIndex: 'gmChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
        sortConfig: {
          currentSortField,
          currentSortOrder,
        },
        includeKey: true,
      });

    return [
      {
        title: 'NO.',
        width: 50,
        render: (_, _record, index) => {
          return index + 1;
        },
      },
      {
        title: 'Customer',
        key: 'customerName',
        width: 220,
        dataIndex: 'customerName',
        render: (_, record) => {
          return (
            <CustomTooltip title={record.customerName}>
              <Text ellipsis>{record.customerName}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Vendor',
        key: 'vendorCount',
        dataIndex: 'vendorCount',
        width: 160,
        render: (_, record) => {
          const num = formatAmount(record.vendorCount);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Waybill',
        key: 'waybillCount',
        dataIndex: 'waybillCount',
        width: 100,
        render: (_, record) => {
          const num = formatAmount(record.waybillCount);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...waybillCompareColumns,
      {
        title: (
          <TooltipTitle tips="The count of de-duplicated trucks (license plate) for the supplier’s abnormal and delivered waybills under this customer in the month.">
            Unique Plate Used
          </TooltipTitle>
        ),
        key: 'truckCount',
        dataIndex: 'truckCount',
        width: 160,
        render: (_, record) => {
          const num = formatAmount(record.truckCount);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: (
          <TooltipTitle tips="All Contract Costs of Inteluck for the Following Vendors under This Project">
            Cost
          </TooltipTitle>
        ),
        key: 'cost',
        dataIndex: 'cost',
        width: 160,
        align: 'right',
        render: (_, record) => {
          const num = formatAmountWithRound(record.cost);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Revenue',
        key: 'revenue',
        dataIndex: 'revenue',
        width: 160,
        align: 'right',
        sorter: (a, b) => a.revenue - b.revenue,
        // defaultSortOrder: 'descend',
        sortOrder: currentSortField === 'revenue' ? antdOrder : null,
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
        key: 'grossProfit',
        dataIndex: 'grossProfit',
        width: 160,
        align: 'right',
        sorter: (a, b) => a.grossProfit - b.grossProfit,
        sortOrder: currentSortField === 'grossProfit' ? antdOrder : null,
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
        key: 'grossMargin',
        dataIndex: 'grossMargin',
        width: 160,
        align: 'right',
        sorter: (a, b) => a.grossMargin - b.grossMargin,
        sortOrder: currentSortField === 'grossMargin' ? antdOrder : null,
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
    ];
  }, [displayDataSource, currentSortOrder, currentSortField, yearMonthValue]);

  const expandedRowRender = useCallback(
    (record: IVendorAnalysisByCustomerItem) => (
      <SubTable
        yearMonth={
          yearMonthValue
            ? yearMonthValue?.format(dateFormat)
            : defaultDate.format(dateFormat)
        }
        customerId={record.customerId}
        customerName={record.customerName}
        comparisonPeriod={comparisonPeriodValue}
        parentSortField={sortConfig.columnKey}
        parentSortOrder={sortConfig.order}
        cache={subTableCacheRef.current}
      />
    ),
    [yearMonthValue, comparisonPeriodValue, sortConfig],
  );

  const handleExpand = useCallback(
    (expanded: boolean, record: IVendorAnalysisByCustomerItem) => {
      setExpandedRowKeys((prev) => {
        return expanded
          ? [...prev, record.customerId]
          : prev.filter((k) => k !== record.customerId);
      });
    },
    [],
  );

  // 处理滚动加载
  const handleScroll = useCallback(
    (e: any) => {
      if (loadingMoreRef.current || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const threshold = 100;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      if (isNearBottom) {
        setMoreLoading(true);
        loadingMoreRef.current = true;
        setDisplayLimit((prev) => prev + PAGE_SIZE);

        setTimeout(() => {
          setMoreLoading(false);
          loadingMoreRef.current = false;
        }, 300);
      }
    },
    [hasMore],
  );

  useEffect(() => {
    const values = form.getFieldsValue();
    if (!values.yearMonth) {
      form.setFieldsValue({
        yearMonth: defaultDate,
        timeOption: STATISTICS_TIME_OPTION.CURRENT_MONTH,
        comparisonPeriod: 1,
      });
    }

    fetchDataSource({
      yearMonth:
        values.yearMonth?.format(dateFormat) || defaultDate.format(dateFormat),
      customerId: values?.customerObj?.id,
      waybillTimeType,
      comparisonPeriod: values?.comparisonPeriod ?? 1,
    });
  }, [waybillTimeType]);

  return (
    <CardView
      title={
        <TooltipTitle tips="Vendor Analysis By Customer: Displays customers  who are active in the current month.">
          Vendor Analysis By Customer
        </TooltipTitle>
      }
      showFullScreen
      fullScreenChanged={(isFullScreen) => {
        setScrollY(isFullScreen ? window.innerHeight - 200 : 500);
      }}
    >
      <Form
        name="gross-profit-by-vendor-form"
        form={form}
        style={{ marginBottom: '8px' }}
        initialValues={{
          yearMonth: defaultDate,
          timeOption: STATISTICS_TIME_OPTION.CURRENT_MONTH,
          comparisonPeriod: 1,
        }}
        onValuesChange={handleValuesChange}
      >
        <Flex gap={10} wrap>
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
            <Form.Item name="customerObj" noStyle>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Customer',
                  style: { width: '100%' },
                }}
                request={{
                  field: 'customerName',
                  esDtoClass: ES_DTO_CLASS.CUSTOMER,
                  type: FieldQueryHighlightTypeEnum.COUNTRY,
                }}
              />
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

          <Form.Item name="timeOption" noStyle>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={STATISTICS_TIME_OPTION.CURRENT_MONTH}>
                Current Month
              </Radio.Button>
              <Radio.Button value={STATISTICS_TIME_OPTION.LAST_MONTH}>
                Last Month
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Button type="primary" onClick={onSearch}>
            Search
          </Button>

          <Button onClick={onReset}>Reset</Button>
        </Flex>
      </Form>
      {loading ? (
        <SkeletonView />
      ) : (
        <>
          <div>
            <Text>{dataSource?.length}</Text>{' '}
            <Text type="secondary">total</Text>
          </div>
          <Table<IVendorAnalysisByCustomerItem>
            rowKey={(record) => record.customerId}
            columns={columns}
            dataSource={displayDataSource}
            pagination={false}
            rowHoverable={false}
            size="small"
            bordered
            loading={moreLoading}
            //   virtual
            scroll={{ y: scrollY }}
            onChange={handleTableChange}
            onScroll={handleScroll}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: handleExpand,
              columnWidth: dataSource?.length > 0 ? 50 : 0,
            }}
          />
        </>
      )}
    </CardView>
  );
};

export default ByCustomer;
