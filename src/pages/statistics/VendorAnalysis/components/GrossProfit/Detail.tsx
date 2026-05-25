import { vendorAnalysisByVendorProjectList } from '@/api/statistics';
import {
  IVendorAnalysisByVendorProjectItem,
  IVendorAnalysisByVendorProjectListPayload,
  WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { BUEnum, EnumCountCompareResult } from '@/enums';
import CardView from '@/pages/statistics/common/CardView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
import { useSearchParams } from '@umijs/max';
import { Flex, Table, TableColumnsType, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;

const Detail: FC = ({}) => {
  const [dataSource, setDataSource] = useState<
    IVendorAnalysisByVendorProjectItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const vendorId = Number(searchParams.get('vendorId'));
  const vendorName = searchParams.get('vendorName') as string;
  const bu =
    searchParams.get('bu') !== null
      ? (searchParams.get('bu') as BUEnum)
      : undefined;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType;

  const projectCountCompareResult = searchParams.get(
    'projectCountCompareResult',
  ) as EnumCountCompareResult;
  const projectCountCompareValue = searchParams.get(
    'projectCountCompareValue',
  ) as string;

  const projectCountCompareResultText = useMemo(() => {
    switch (projectCountCompareResult) {
      case EnumCountCompareResult.INCREASE:
        return 'increased';
      case EnumCountCompareResult.DECREASE:
        return 'decreased';
      default:
        return 'increased';
    }
  }, [projectCountCompareResult]);

  const fetchDataSource = async () => {
    const payload: IVendorAnalysisByVendorProjectListPayload = {
      yearMonth,
      vendorId,
      bu,
      waybillTimeType,
    };

    if (!payload.yearMonth || !payload.vendorId) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await vendorAnalysisByVendorProjectList(payload).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setDataSource(res.data);
    }
  };

  const columns: TableColumnsType<IVendorAnalysisByVendorProjectItem> = [
    {
      title: 'NO.',
      fixed: 'left',
      width: 50,
      render: (_, _record, index) => {
        return index + 1;
      },
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      fixed: 'left',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Aging (Month): The number of months from the month of the position date of the first abnormal/delivered waybill of the supplier's owned trucks under this project to the present.">
          Aging(Month)
        </TooltipTitle>
      ),
      dataIndex: 'aging',
      width: 130,
      ellipsis: true,
      render: (_, record) => {
        const num = formatAmount(record.aging);
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
      width: 130,
      render: (_, record) => {
        const num = formatAmount(record.truckCount);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: 'Waybill',
      dataIndex: 'waybillCount',
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.waybillCount - b.waybillCount,
      render: (_, record) => {
        const num = formatAmount(record.waybillCount);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      align: 'right',
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (_, record) => {
        const num = formatAmountWithRound(record.revenue);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'right',
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.cost - b.cost,
      render: (_, record) => {
        const num = formatAmountWithRound(record.cost);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossProfit',
      align: 'right',
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.grossProfit - b.grossProfit,
      render: (_, record) => {
        const num = formatAmountWithRound(record.grossProfit);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: 'Gross Margin',
      dataIndex: 'grossMargin',
      align: 'right',
      width: 120,
      ellipsis: true,
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
  ];

  useEffect(() => {
    fetchDataSource();
  }, [searchParams]);

  return (
    <Flex vertical gap={1}>
      <CardView
        title={`${yearMonth} Vendor Gross Profit by Project: ${vendorName} ${bu ? `(BU: ${bu})` : ''}`}
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
      >
        <Flex vertical gap={8}>
          <div>
            <Text>
              {`Compared to last month, ${projectCountCompareResultText} ${projectCountCompareValue} projects`}
            </Text>
          </div>

          <div>
            <Text>{dataSource?.length}</Text>{' '}
            <Text type="secondary">total</Text>
          </div>

          <Table<IVendorAnalysisByVendorProjectItem>
            rowKey="vendorId"
            size="small"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 1500 }}
            bordered
          />
        </Flex>
      </CardView>
    </Flex>
  );
};

export default Detail;
