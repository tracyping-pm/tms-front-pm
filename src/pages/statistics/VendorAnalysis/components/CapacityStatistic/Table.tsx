import { IVendorAnalysisCapacityStatisticItem } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import { EnumCapacityStatisticActiveType } from '@/enums';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { formatAmount, formatAmountWithRound, openNewTag } from '@/utils/utils';
import { Table as AntdTable, TableProps } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import styles from './index.less';

type ColumnsType<T extends object = object> = TableProps<T>['columns'];

interface ITableProps {
  dataSource: IVendorAnalysisCapacityStatisticItem[];
}

const Table: FC<ITableProps> = ({ dataSource }) => {
  const { waybillTimeType } = useWaybillTimeType();
  const columns: ColumnsType<IVendorAnalysisCapacityStatisticItem> = [
    {
      title: 'Month',
      dataIndex: 'yearMonth',
      width: 80,
      render: (_, record) => {
        const content = dayjs(record.yearMonth).format('YYYY-MM');
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: (
        <TooltipTitle tips="Total Active Vendor = Existing Active Vendor + Existing Reactive Vendor + New Vendor">
          Total Active Vendor
        </TooltipTitle>
      ),
      dataIndex: 'totalActiveVendor',
      render: (_, record) => {
        if (record.totalActiveVendor > 0) {
          const content = formatAmount(record.totalActiveVendor);
          return (
            <CustomTooltip title={content}>
              <div
                className={styles.number}
                onClick={() => {
                  openNewTag(
                    `${PATHS.VENDOR_STATISTIC_DETAIL}?yearMonth=${record.yearMonth}&activeType=${EnumCapacityStatisticActiveType.TOTAL_ACTIVE_VENDOR}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                {content}
              </div>
            </CustomTooltip>
          );
        } else {
          return record.totalActiveVendor;
        }
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of vendors who are active both this month and last month.">
          Existing Active Vendor
        </TooltipTitle>
      ),
      dataIndex: 'existingActiveVendor',
      render: (_, record) => {
        if (record.existingActiveVendor > 0) {
          const content = formatAmount(record.existingActiveVendor);
          return (
            <CustomTooltip title={content}>
              <div
                className={styles.number}
                onClick={() => {
                  openNewTag(
                    `${PATHS.VENDOR_STATISTIC_DETAIL}?yearMonth=${record.yearMonth}&activeType=${EnumCapacityStatisticActiveType.EXISTING_ACTIVE_VENDOR}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                {content}
              </div>
            </CustomTooltip>
          );
        } else {
          return record.existingActiveVendor;
        }
      },
    },
    {
      title: (
        <TooltipTitle tips="(Existing Active Vendors / Total Active Vendors in Previous Month) * 100% ">
          Retention Rate
        </TooltipTitle>
      ),
      dataIndex: 'retentionRate',
      render: (_, record) => {
        const retentionRate =
          typeof record.retentionRate === 'number' &&
          !Number.isNaN(record.retentionRate)
            ? formatAmountWithRound(record.retentionRate) + '%'
            : '-';
        return (
          <CustomTooltip title={retentionRate}>{retentionRate}</CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of previously inactive vendors who became active this month, excluding new vendors.">
          Existing Reactive Vendor
        </TooltipTitle>
      ),
      dataIndex: 'existingReactiveVendor',
      render: (_, record) => {
        if (record.existingReactiveVendor > 0) {
          const content = formatAmount(record.existingReactiveVendor);
          return (
            <CustomTooltip title={content}>
              <div
                className={styles.number}
                onClick={() => {
                  openNewTag(
                    `${PATHS.VENDOR_STATISTIC_DETAIL}?yearMonth=${record.yearMonth}&activeType=${EnumCapacityStatisticActiveType.EXISTING_REACTIVE_VENDOR}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                {content}
              </div>
            </CustomTooltip>
          );
        } else {
          return record.existingReactiveVendor;
        }
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of vendors who were active last month but are inactive this month.">
          Lost Vendor
        </TooltipTitle>
      ),
      dataIndex: 'lostVendor',
      render: (_, record) => {
        if (record.lostVendor > 0) {
          const content = formatAmount(record.lostVendor);
          return (
            <CustomTooltip title={content}>
              <div
                className={styles.number}
                onClick={() => {
                  openNewTag(
                    `${PATHS.VENDOR_STATISTIC_DETAIL}?yearMonth=${record.yearMonth}&activeType=${EnumCapacityStatisticActiveType.LOST_VENDOR}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                {content}
              </div>
            </CustomTooltip>
          );
        } else {
          return record.lostVendor;
        }
      },
    },
    {
      title: (
        <TooltipTitle
          tips={`Number of vendors whose first "Abnormal" or "Delivered" waybill for a self-owned truck has a position time within the current month, where self-owned truck is defined as "Ownership = Owned Truck" for both the vendor and the truck.`}
        >
          New Vendor
        </TooltipTitle>
      ),
      dataIndex: 'newVendor',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        if (record.newVendor > 0) {
          const content = formatAmount(record.newVendor);
          return (
            <CustomTooltip title={content}>
              <div
                className={styles.number}
                onClick={() => {
                  openNewTag(
                    `${PATHS.VENDOR_STATISTIC_DETAIL}?yearMonth=${record.yearMonth}&activeType=${EnumCapacityStatisticActiveType.NEW_VENDOR}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                {content}
              </div>
            </CustomTooltip>
          );
        } else {
          return record.newVendor;
        }
      },
    },
  ];

  return (
    <div>
      <AntdTable<IVendorAnalysisCapacityStatisticItem>
        className={styles.vendorStatisticTable}
        rowKey={(record) => record.yearMonth}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        virtual
      />
    </div>
  );
};

export default Table;
