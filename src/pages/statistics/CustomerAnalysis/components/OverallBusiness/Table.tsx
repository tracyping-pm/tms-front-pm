import { ICustomerAnalysisBusinessMonitorRecord } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
import { Table as AntdTable, TableProps, Typography } from 'antd';

import dayjs from 'dayjs';
import { FC } from 'react';
import styles from './index.less';
const { Text } = Typography;

type ColumnsType<T extends object = object> = TableProps<T>['columns'];

interface ITableProps {
  dataSource: ICustomerAnalysisBusinessMonitorRecord[];
}
const Table: FC<ITableProps> = ({ dataSource }) => {
  const columns: ColumnsType<ICustomerAnalysisBusinessMonitorRecord> = [
    {
      title: 'Month',
      dataIndex: 'month',
      width: 100,
      render: (_, record) => {
        const month = dayjs(record.month).format('YYYY-MM');
        return (
          <CustomTooltip title={month}>
            <Text ellipsis>{month}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle
          tips={`Number of waybills in "Delivered" and "Abnormal" status within the position time of the month.`}
        >
          {'Waybill'}
        </TooltipTitle>
      ),
      dataIndex: 'waybillNum',
      width: 100,
      render: (_, record) => {
        const waybillNum = formatAmount(record.waybillNum);
        return (
          <CustomTooltip title={waybillNum}>
            <Text ellipsis>{waybillNum}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle
          tips={`Average daily volume = Number of waybills / 26, rounded to the nearest whole number.`}
        >
          {'Avg Daily Waybill'}
        </TooltipTitle>
      ),
      dataIndex: 'avgWaybillNum',
      width: 120,
      render: (_, record) => {
        const avgWaybillNum = formatAmount(record.avgWaybillNum);
        return (
          <CustomTooltip title={avgWaybillNum}>
            <Text ellipsis>{avgWaybillNum}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="basic Amount + additional charge + exception fee">
          {'Revenue'}
        </TooltipTitle>
      ),
      dataIndex: 'totalRevenue',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const totalRevenue = formatAmountWithRound(record.totalRevenue);
        return (
          <CustomTooltip title={totalRevenue}>
            <Text ellipsis>{totalRevenue}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Basic Amount Payable (paid in advance + remaining) + additional charge+exception fee">
          {'Cost'}
        </TooltipTitle>
      ),
      dataIndex: 'totalCost',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const totalCost = formatAmountWithRound(record.totalCost);
        return (
          <CustomTooltip title={totalCost}>
            <Text ellipsis>{totalCost}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossProfit',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const grossProfit = formatAmountWithRound(record.grossProfit);
        return (
          <CustomTooltip title={grossProfit}>
            <Text ellipsis>{grossProfit}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Gross Margin',
      dataIndex: 'grossMargin',
      width: 100,
      align: 'right',
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

  return (
    <div>
      <AntdTable
        className={styles.statisticTable}
        rowKey={(record) => record.month}
        columns={columns}
        size="small"
        dataSource={dataSource}
        pagination={false}
        bordered
        scroll={{ y: 500 }}
      />
    </div>
  );
};
export default Table;
