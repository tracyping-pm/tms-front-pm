import { vendorAnalysisByProjectVendorAnnualTrend } from '@/api/statistics';
import {
  IVendorAnalysisByProjectVendorAnnualTrendItem,
  IVendorAnalysisByProjectVendorAnnualTrendPayload,
  WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import CardView from '@/pages/statistics/common/CardView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
import { useSearchParams } from '@umijs/max';
import { Flex, Table, TableColumnsType, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import Charts from './Charts';

const { Text } = Typography;

const Trend: FC = () => {
  const [dataSource, setDataSource] = useState<
    IVendorAnalysisByProjectVendorAnnualTrendItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const year = Number(searchParams.get('year'));
  const projectId = Number(searchParams.get('projectId'));
  const projectName = searchParams.get('projectName') as string;
  const vendorId = Number(searchParams.get('vendorId'));
  const vendorName = searchParams.get('vendorName') as string;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType;

  const fetchDataSource = async () => {
    const payload: IVendorAnalysisByProjectVendorAnnualTrendPayload = {
      year,
      projectId,
      vendorId,
      waybillTimeType,
    };

    if (!payload.year || !payload.projectId || !payload.vendorId) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await vendorAnalysisByProjectVendorAnnualTrend(payload).finally(
      () => {
        setLoading(false);
      },
    );

    if (res.code === 200) {
      setDataSource(res.data);
    }
  };

  const columns: TableColumnsType<IVendorAnalysisByProjectVendorAnnualTrendItem> =
    [
      {
        title: 'Month',
        dataIndex: 'yearMonth',
        width: 80,
        render: (_, record) => {
          const content = record.yearMonth;
          return <CustomTooltip title={content}>{content}</CustomTooltip>;
        },
      },
      {
        title: 'Waybill',
        dataIndex: 'waybillCount',
        // width: 100,
        ellipsis: true,
        // sorter: (a, b) => a.waybillCount - b.waybillCount,
        render: (_, record) => {
          const num = formatAmount(record.waybillCount);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: (
          <TooltipTitle tips="Unique Plate under Project: The count of de-duplicated trucks (license plate) for the supplier’s abnormal and delivered waybills under this project in the month.">
            Unique plate under project
          </TooltipTitle>
        ),
        dataIndex: 'truckCount',
        // width: 130,
        render: (_, record) => {
          const num = formatAmount(record.truckCount);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: 'Revenue',
        dataIndex: 'revenue',
        align: 'right',
        // width: 100,
        ellipsis: true,
        // sorter: (a, b) => a.revenue - b.revenue,
        render: (_, record) => {
          const num = formatAmountWithRound(record.revenue);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: 'Cost',
        dataIndex: 'cost',
        align: 'right',
        // width: 100,
        ellipsis: true,
        // sorter: (a, b) => a.cost - b.cost,
        render: (_, record) => {
          const num = formatAmountWithRound(record.cost);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: 'Gross Profit',
        dataIndex: 'grossProfit',
        align: 'right',
        // width: 120,
        ellipsis: true,
        // sorter: (a, b) => a.grossProfit - b.grossProfit,
        render: (_, record) => {
          const num = formatAmountWithRound(record.grossProfit);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: 'Gross Margin',
        dataIndex: 'grossMargin',
        align: 'right',
        // width: 120,
        ellipsis: true,
        // sorter: (a, b) => a.grossMargin - b.grossMargin,
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

  useEffect(() => {
    fetchDataSource();
  }, [searchParams]);

  const excludeTotalDataSource = dataSource.filter(
    (item) => item.yearMonth !== 'Total',
  );

  return (
    <>
      <Flex gap={12} vertical>
        <CardView
          title={`${year} Vendor Analysis Detail: ${projectName}`}
          loading={loading}
        >
          <Flex vertical gap={2}>
            <div>
              <Text>Vendor: </Text>
              <Text>{vendorName}</Text>
            </div>

            <Table<IVendorAnalysisByProjectVendorAnnualTrendItem>
              rowKey="yearMonth"
              size="small"
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              scroll={{ x: 1500 }}
              bordered
            />
          </Flex>
        </CardView>
        <CardView title={`Monthly Waybill Trend`} loading={loading}>
          <Charts dataSource={excludeTotalDataSource} type="waybill" />
        </CardView>
        <CardView title={`Monthly Revenue Trend`} loading={loading}>
          <Charts dataSource={excludeTotalDataSource} type="revenue" />
        </CardView>
        <CardView title={`Monthly GP Trend`} loading={loading}>
          <Charts dataSource={excludeTotalDataSource} type="grossProfit" />
        </CardView>
        <CardView title={`Monthly GM Trend`} loading={loading}>
          <Charts dataSource={excludeTotalDataSource} type="grossMargin" />
        </CardView>
      </Flex>
    </>
  );
};

export default Trend;
