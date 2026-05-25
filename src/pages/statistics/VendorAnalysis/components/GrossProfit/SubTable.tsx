import {
  IVendorAnalysisByVendorProjectItem,
  IVendorAnalysisByVendorProjectListPayload,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
// import { faker } from '@faker-js/faker';
import { vendorAnalysisByVendorProjectList } from '@/api/statistics';
import { BUEnum } from '@/enums';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import { Table, TableColumnsType, Typography } from 'antd';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const { Text } = Typography;

interface ISubTableProps {
  yearMonth: string;
  vendorId: number;
  bu?: BUEnum;
  parentSortField?: string;
  parentSortOrder?: 'ascend' | 'descend';
  cache?: Map<number, IVendorAnalysisByVendorProjectItem[]>;
}

const SubTable: FC<ISubTableProps> = memo(
  ({ yearMonth, vendorId, bu, parentSortField, parentSortOrder, cache }) => {
    const { waybillTimeType } = useWaybillTimeType();
    const [dataSource, setDataSource] = useState<
      IVendorAnalysisByVendorProjectItem[]
    >([]);
    const [loading, setLoading] = useState(false);

    const fetchDataSource = async () => {
      const cached = cache?.get(vendorId);
      if (cached) {
        setDataSource(cached);
        return;
      }
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
      const res = await vendorAnalysisByVendorProjectList(payload).finally(
        () => {
          setLoading(false);
        },
      );

      if (res.code === 200) {
        setDataSource(res.data);
        cache?.set(vendorId, res.data);
      }
    };

    const columns: TableColumnsType<IVendorAnalysisByVendorProjectItem> =
      useMemo(
        () => [
          {
            title: 'NO.',
            // fixed: 'left',
            width: 50,
            render: (_, _record, index) => {
              return index + 1;
            },
          },
          {
            title: 'Project',
            dataIndex: 'projectName',
            // fixed: 'left',
            width: 120,
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
            width: 90,
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
            width: 100,
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
        ],
        [yearMonth, vendorId, bu],
      );

    const displayData = useMemo(() => {
      console.log(parentSortField, parentSortOrder);
      if (!parentSortOrder || !parentSortField) return dataSource;

      return [...dataSource].sort((a, b) => {
        // @ts-ignore
        const v1 = a[parentSortField];
        // @ts-ignore
        const v2 = b[parentSortField];

        // 这里的逻辑要与主表保持一致
        if (parentSortOrder === 'ascend') return v1 - v2;
        return v2 - v1;
      });
    }, [dataSource, parentSortField, parentSortOrder]);

    useEffect(() => {
      fetchDataSource();
    }, [yearMonth, vendorId]);

    return loading ? (
      <SkeletonView rows={5} />
    ) : (
      <Table<IVendorAnalysisByVendorProjectItem>
        className={styles.subTable}
        rowKey={(record) => record.projectId}
        columns={columns}
        dataSource={displayData}
        pagination={false}
        rowHoverable={false}
        size="small"
        bordered
        virtual
        scroll={{ x: 1400, y: 400 }}
      />
    );
  },
);

export default SubTable;
