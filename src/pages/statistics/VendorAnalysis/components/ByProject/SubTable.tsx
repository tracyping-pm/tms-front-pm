import { vendorAnalysisByProjectVendorList } from '@/api/statistics';
import {
  IVendorAnalysisByProjectPayload,
  IVendorAnalysisByProjectVendorItem,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { generateCompareColumns } from '@/pages/statistics/common/generateCompareColumns';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
// import { faker } from '@faker-js/faker';
import { PATHS } from '@/constants';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import { Link } from '@umijs/max';
import { Flex, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SortOrder } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const { Text } = Typography;

interface ISubTableProps {
  yearMonth: string;
  projectId: number;
  projectName: string;
  comparisonPeriod?: number;
  parentSortField?: string;
  parentSortOrder?: 'ascend' | 'descend';
  cache?: Map<number, IVendorAnalysisByProjectVendorItem[]>;
}

const SubTable: FC<ISubTableProps> = memo(
  ({
    yearMonth,
    projectId,
    projectName,
    comparisonPeriod,
    parentSortField,
    parentSortOrder,
    cache,
  }) => {
    const { waybillTimeType } = useWaybillTimeType();
    const [dataSource, setDataSource] = useState<
      IVendorAnalysisByProjectVendorItem[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState<string | undefined>(
      parentSortField,
    );
    const [sortOrder, setSortOrder] = useState<
      'ascend' | 'descend' | undefined
    >(parentSortOrder);
    const fetchDataSource = async () => {
      const cached = cache?.get(projectId);
      if (cached) {
        setDataSource(cached);
        return;
      }

      const payload: IVendorAnalysisByProjectPayload = {
        yearMonth,
        projectId,
        waybillTimeType,
        comparisonPeriod,
      };
      setLoading(true);
      const res = await vendorAnalysisByProjectVendorList(payload).finally(
        () => {
          setLoading(false);
        },
      );

      if (res.code === 200) {
        setDataSource(res.data);
        cache?.set(projectId, res.data);
      }
    };

    const antdOrder = useMemo((): SortOrder | undefined => {
      if (!sortOrder) return undefined;
      return sortOrder === 'ascend' ? 'ascend' : 'descend';
    }, [sortOrder]);

    const handleTableChange = useCallback(
      (_pagination: any, _filters: any, sorter: any) => {
        const { columnKey, order } = Array.isArray(sorter) ? sorter[0] : sorter;

        setSortField(columnKey as string);
        setSortOrder(order as 'ascend' | 'descend');
      },
      [],
    );

    const columns: ColumnsType<IVendorAnalysisByProjectVendorItem> =
      useMemo(() => {
        const waybillChangeCompareColumns =
          generateCompareColumns<IVendorAnalysisByProjectVendorItem>({
            baseTitle: 'Waybill Change',
            listDataIndex: 'waybillCountChangeList',
            yearMonth: yearMonth,
            comparisonPeriod: comparisonPeriod ?? 0,
            isCount: true,
            sortConfig: {
              currentSortField: sortField,
              currentSortOrder: sortOrder,
            },
            includeKey: true,
            columnWidth: 160,
          });
        const revenueChangeCompareColumns =
          generateCompareColumns<IVendorAnalysisByProjectVendorItem>({
            baseTitle: 'Revenue Change',
            listDataIndex: 'revenueChangeList',
            yearMonth: yearMonth,
            comparisonPeriod: comparisonPeriod ?? 0,
            isCount: false,
            sortConfig: {
              currentSortField: sortField,
              currentSortOrder: sortOrder,
            },
            includeKey: true,
          });
        const gpChangeCompareColumns =
          generateCompareColumns<IVendorAnalysisByProjectVendorItem>({
            baseTitle: 'GP Change',
            listDataIndex: 'gpChangeList',
            yearMonth: yearMonth,
            comparisonPeriod: comparisonPeriod ?? 0,
            isCount: false,
            sortConfig: {
              currentSortField: sortField,
              currentSortOrder: sortOrder,
            },
            includeKey: true,
          });
        const gmChangeCompareColumns =
          generateCompareColumns<IVendorAnalysisByProjectVendorItem>({
            baseTitle: 'GM Change',
            listDataIndex: 'gmChangeList',
            yearMonth: yearMonth,
            comparisonPeriod: comparisonPeriod ?? 0,
            isCount: false,
            sortConfig: {
              currentSortField: sortField,
              currentSortOrder: sortOrder,
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
            title: 'Vendor',
            key: 'vendorName',
            dataIndex: 'vendorName',
            //   width: 120,
            render: (_, record) => {
              return (
                <CustomTooltip title={record.vendorName}>
                  <Text ellipsis>{record.vendorName}</Text>
                </CustomTooltip>
              );
            },
          },
          {
            title: (
              <TooltipTitle tips="The time when vendor's owned truck completed its first waybill (Delivered/Abnormal) for this project.">
                First Delivery date
              </TooltipTitle>
            ),
            key: 'firstDeliveryDate',
            dataIndex: 'firstDeliveryDate',
            width: 160,
            render: (_, record) => {
              return (
                <CustomTooltip title={record.firstDeliveryDate}>
                  <Text ellipsis>{record.firstDeliveryDate}</Text>
                </CustomTooltip>
              );
            },
          },
          {
            title: 'Vendor Type',
            key: 'vendorType',
            dataIndex: 'vendorType',
            //   width: 120,
            render: (_, record) => {
              return (
                <CustomTooltip title={record.vendorType}>
                  <Text ellipsis>{record.vendorType}</Text>
                </CustomTooltip>
              );
            },
          },
          {
            title: 'Procurement PIC',
            key: 'vendorPicName',
            dataIndex: 'vendorPicName',
            //   width: 120,
            render: (_, record) => {
              return (
                <CustomTooltip title={record.vendorPicName}>
                  <Text ellipsis>{record.vendorPicName}</Text>
                </CustomTooltip>
              );
            },
          },
          {
            title: 'Waybill',
            key: 'waybillCount',
            dataIndex: 'waybillCount',
            width: 80,
            render: (_, record) => {
              const num = formatAmount(record.waybillCount);
              return (
                <CustomTooltip title={num}>
                  <Text ellipsis>{num}</Text>
                </CustomTooltip>
              );
            },
          },
          ...waybillChangeCompareColumns,
          {
            title: 'Unique Plate Used',
            key: 'truckCount',
            dataIndex: 'truckCount',
            //   width: 120,
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
              <TooltipTitle tips="All Contract Costs of Inteluck for Following Vendors under This Project">
                Cost
              </TooltipTitle>
            ),
            key: 'cost',
            dataIndex: 'cost',
            //   width: 80,
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
            //   width: 80,
            align: 'right',
            sorter: (a, b) => a.revenue - b.revenue,
            // defaultSortOrder: 'descend',
            sortOrder: sortField === 'revenue' ? antdOrder : null,
            render: (_, record) => {
              const num = formatAmountWithRound(record.revenue);
              return (
                <CustomTooltip title={num}>
                  <Text ellipsis>{num}</Text>
                </CustomTooltip>
              );
            },
          },
          ...revenueChangeCompareColumns,

          {
            title: 'Gross Profit',
            key: 'grossProfit',
            dataIndex: 'grossProfit',
            //   width: 80,
            align: 'right',
            sorter: (a, b) => a.grossProfit - b.grossProfit,
            sortOrder: sortField === 'grossProfit' ? antdOrder : null,
            render: (_, record) => {
              const num = formatAmountWithRound(record.grossProfit);
              return (
                <CustomTooltip title={num}>
                  <Text ellipsis>{num}</Text>
                </CustomTooltip>
              );
            },
          },
          ...gpChangeCompareColumns,

          {
            title: 'Gross Margin',
            key: 'grossMargin',
            dataIndex: 'grossMargin',
            //   width: 80,
            align: 'right',
            sorter: (a, b) => a.grossMargin - b.grossMargin,
            sortOrder: sortField === 'grossMargin' ? antdOrder : null,
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
          ...gmChangeCompareColumns,

          {
            title: 'Action',
            width: 120,
            align: 'right',
            render: (_, record) => {
              const year = dayjs(yearMonth).format('YYYY');
              const vendorName = record.vendorName
                ? `&vendorName=${encodeURIComponent(record.vendorName as string)}`
                : '';
              const _projectName = projectName
                ? `&projectName=${encodeURIComponent(projectName as string)}`
                : '';
              return (
                <Flex gap={12}>
                  <Link
                    to={`${PATHS.VENDOR_STATISTIC_BY_PROJECT_TREND_DETAIL}?year=${year}&projectId=${projectId}&vendorId=${record.vendorId}${_projectName}${vendorName}&waybillTimeType=${waybillTimeType}`}
                    target="_blank"
                  >
                    Trend
                  </Link>

                  <Link
                    to={`${PATHS.VENDOR_STATISTIC_VENDOR_COMPARISON}?yearMonth=${yearMonth}&projectId=${projectId}&vendorId=${record.vendorId}${vendorName}&waybillTimeType=${waybillTimeType}`}
                    target="_blank"
                  >
                    Compare
                  </Link>
                </Flex>
              );
            },
          },
        ];
      }, [yearMonth, projectId, projectName, sortField, sortOrder]);

    const displayData = useMemo(() => {
      if (!sortOrder || !sortField) return dataSource;

      return [...dataSource].sort((a, b) => {
        // @ts-ignore
        const v1 = a[sortField];
        // @ts-ignore
        const v2 = b[sortField];

        // 这里的逻辑要与主表保持一致
        if (sortOrder === 'ascend') return v1 - v2;
        return v2 - v1;
      });
    }, [dataSource, sortField, sortOrder]);

    useEffect(() => {
      fetchDataSource();
    }, [yearMonth, projectId]);

    return loading ? (
      <SkeletonView rows={5} />
    ) : (
      <Table<IVendorAnalysisByProjectVendorItem>
        className={styles.subTable}
        rowKey={(record) => record.vendorId}
        columns={columns}
        dataSource={displayData}
        pagination={false}
        rowHoverable={false}
        onChange={handleTableChange}
        size="small"
        bordered
        virtual
        scroll={{ y: 400 }}
      />
    );
  },
);

export default SubTable;
