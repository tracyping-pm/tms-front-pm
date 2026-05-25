import { IActiveCustomerStaticRecord } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import { EnumCustomerStatisticActiveType } from '@/enums';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { formatAmount, openNewTag } from '@/utils/utils';
import { Table as AntdTable, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import cls from 'classnames';
import dayjs from 'dayjs';
import styles from './index.less';

const { Text } = Typography;
export default function Table({
  dataSource,
}: {
  dataSource: IActiveCustomerStaticRecord[];
}) {
  const { waybillTimeType } = useWaybillTimeType();
  const columns: ColumnsType<IActiveCustomerStaticRecord> = [
    {
      title: 'Month',
      width: 100,
      dataIndex: 'mouthDate',
      render: (_, record) => {
        const month = dayjs(record.mouthDate).format('YYYY-MM');
        return (
          <CustomTooltip title={month}>
            <Text ellipsis>{month}</Text>
          </CustomTooltip>
        );
      },
    },

    {
      title: (
        <TooltipTitle tips="Existing Active Customer + Existing Reactive Customer + New Customer">
          Total Active Customer
        </TooltipTitle>
      ),
      dataIndex: 'totalActiveCustomer',
      width: 140,
      render: (_, record) => {
        const totalActiveCustomer = record.totalActiveCustomer;
        return (
          <CustomTooltip title={formatAmount(totalActiveCustomer)}>
            <div
              className={cls(totalActiveCustomer > 0 && styles.number)}
              onClick={() => {
                if (totalActiveCustomer === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.CUSTOMER_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumCustomerStatisticActiveType.TOTAL_ACTIVE_CUSTOMER}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text
                ellipsis
                className={cls(totalActiveCustomer > 0 && styles.number)}
              >
                {formatAmount(totalActiveCustomer)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of customers who are active both this month and last month.">
          Existing Active Customer
        </TooltipTitle>
      ),
      dataIndex: 'existingActiveCustomer',
      width: 140,
      render: (_, record) => {
        const existingActiveCustomer = record.existingActiveCustomer;

        return (
          <CustomTooltip title={formatAmount(existingActiveCustomer)}>
            <div
              className={cls(existingActiveCustomer > 0 && styles.number)}
              onClick={() => {
                if (existingActiveCustomer === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.CUSTOMER_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumCustomerStatisticActiveType.EXISTING_ACTIVE_CUSTOMER}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text
                ellipsis
                className={cls(existingActiveCustomer > 0 && styles.number)}
              >
                {formatAmount(existingActiveCustomer)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of previously inactive customers who became active this month, excluding new customers.">
          Existing Reactive Customer
        </TooltipTitle>
      ),
      dataIndex: 'existingReactiveCustomer',
      width: 140,
      render: (_, record) => {
        const existingReactiveCustomer = record.existingReactiveCustomer;
        return (
          <CustomTooltip title={formatAmount(existingReactiveCustomer)}>
            <div
              onClick={() => {
                if (existingReactiveCustomer === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.CUSTOMER_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumCustomerStatisticActiveType.EXISTING_REACTIVE_CUSTOMER}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text
                ellipsis
                className={cls(existingReactiveCustomer > 0 && styles.number)}
              >
                {formatAmount(existingReactiveCustomer)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle
          tips={`Number of customers who were active last month but are inactive this month.`}
        >
          {'Lost Customer'}
        </TooltipTitle>
      ),
      dataIndex: 'lostCustomer',
      width: 140,
      render: (_, record) => {
        const lost = record.lostCustomer;
        return (
          <CustomTooltip title={formatAmount(lost)}>
            <div
              onClick={() => {
                if (lost === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.CUSTOMER_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumCustomerStatisticActiveType.LOST_CUSTOMER}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text ellipsis className={cls(lost > 0 && styles.number)}>
                {formatAmount(lost)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle
          tips={`Number of customers whose first "Abnormal" or "Delivered" waybill has a position time within the current month.`}
        >
          {'New Customer'}
        </TooltipTitle>
      ),
      dataIndex: 'newCustomer',
      width: 140,
      render: (_, record) => {
        const newCustomer = record.newCustomer;
        return (
          <CustomTooltip title={formatAmount(newCustomer)}>
            <div
              onClick={() => {
                if (newCustomer === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.CUSTOMER_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumCustomerStatisticActiveType.NEW_CUSTOMER}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text ellipsis className={cls(newCustomer > 0 && styles.number)}>
                {formatAmount(newCustomer)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <div>
      <AntdTable
        className={styles.statisticTable}
        scroll={{ y: 500 }}
        rowKey={(record) => record.mouthDate}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
      />
    </div>
  );
}
