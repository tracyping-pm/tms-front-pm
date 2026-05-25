import { customerAnalysisAnnualRevenueStatistics } from '@/api/statistics';
import {
  ICustomerAnalysisAnnualRevenueStatisticsRecord,
  ICustomerAnalysisParams,
  WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import CardView from '@/pages/statistics/common/CardView';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
import { useSearchParams } from '@umijs/max';
import { Flex, Table, TableColumnsType, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useMemo, useState } from 'react';
import Charts from './Charts';

const { Text } = Typography;

const Trend: FC = ({}) => {
  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const customerId = searchParams.get('id') as string;
  const customerName = searchParams.get('customerName') as string;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType;

  const [dataSource, setDataSource] = useState<
    ICustomerAnalysisAnnualRevenueStatisticsRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [sorter, setSorter] = useState<{
    field?: string;
    order?: 'ascend' | 'descend';
  }>({});

  const fetchDataSource = async () => {
    const payload: ICustomerAnalysisParams = {
      startDate: dayjs(yearMonth).startOf('year').format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(yearMonth).endOf('year').format('YYYY-MM-DD 23:59:59'),
      customerId: Number(customerId),
      waybillTimeType,
    };

    if (!payload.startDate || !payload.endDate) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await customerAnalysisAnnualRevenueStatistics(payload).finally(
      () => {
        setLoading(false);
      },
    );

    if (res.code === 200) {
      setDataSource(res.data || []);
    }
  };

  const columns: TableColumnsType<ICustomerAnalysisAnnualRevenueStatisticsRecord> =
    [
      {
        title: 'Month',
        dataIndex: 'month',
        fixed: 'left',

        render: (_, record, index) => {
          const month =
            index === 0 ? record.month : dayjs(record.month).format('YYYY-MM');

          return (
            <CustomTooltip title={month}>
              <Text ellipsis>{month}</Text>
            </CustomTooltip>
          );
        },
      },

      {
        title: 'Waybill',
        dataIndex: 'waybillNum',

        render: (_, record) => {
          const num = formatAmount(record.waybillNum);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },

      {
        title: 'Avg Daily Waybill',
        dataIndex: 'avgWaybillNum',

        render: (_, record) => {
          const num = formatAmount(record.avgWaybillNum);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Revenue',
        dataIndex: 'revenue',
        align: 'right',

        sorter: true,
        render: (_, record) => {
          const num = formatAmountWithRound(record.revenue);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Cost',
        dataIndex: 'cost',
        align: 'right',

        sorter: true,
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
        title: 'Gross Profit',
        dataIndex: 'grossProfit',
        align: 'right',

        sorter: true,
        render: (_, record) => {
          const num = formatAmountWithRound(record.grossProfit);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Gross Margin',
        dataIndex: 'grossMargin',
        align: 'right',

        sorter: true,
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
    ];
  const getSortedData = (
    data: ICustomerAnalysisAnnualRevenueStatisticsRecord[],
    sorterObj: any,
  ) => {
    if (!sorterObj?.field || !sorterObj?.order) return data;

    const totalRow = data.find((item) => item.month === 'Total');
    const rest = data.filter((item) => item.month !== 'Total');
    const field =
      sorter.field as keyof ICustomerAnalysisAnnualRevenueStatisticsRecord;
    const sortedRest = [...rest].sort((a, b) => {
      const valA = Number(a[field]) || 0;
      const valB = Number(b[field]) || 0;

      if (sorter.order === 'ascend') {
        return valA - valB;
      }
      return valB - valA;
    });

    return totalRow ? [totalRow, ...sortedRest] : sortedRest;
  };

  const sortedData = useMemo(() => {
    return getSortedData(dataSource, sorter);
  }, [dataSource, sorter]);

  useEffect(() => {
    fetchDataSource();
  }, [searchParams]);

  return (
    <Flex gap={12} vertical>
      <CardView
        title={`${dayjs(yearMonth).format('YYYY')} Customer Analysis Detail: ${customerName}`}
      >
        <Table<ICustomerAnalysisAnnualRevenueStatisticsRecord>
          rowKey="projectId"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={sortedData}
          pagination={false}
          scroll={{ x: 1500 }}
          bordered
          onChange={(_, __, sorterObj: any) => {
            setSorter({
              field: sorterObj.field,
              order: sorterObj.order,
            });
          }}
        />
      </CardView>
      <CardView title={`Monthly Waybill Trend`}>
        <Charts dataSource={dataSource.slice(1)} type="waybill" />
      </CardView>
      <CardView title={`Monthly Revenue Trend`}>
        <Charts dataSource={dataSource.slice(1)} type="revenue" />
      </CardView>
      <CardView title={`Monthly GP Trend`}>
        <Charts dataSource={dataSource.slice(1)} type="grossProfit" />
      </CardView>
      <CardView title={`Monthly GM Trend`}>
        <Charts dataSource={dataSource.slice(1)} type="grossMargin" />
      </CardView>
    </Flex>
  );
};

export default Trend;
