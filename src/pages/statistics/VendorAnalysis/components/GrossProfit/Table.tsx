import {
  IVendorAnalysisByVendorItem,
  IVendorAnalysisByVendorProjectItem,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import { BUEnum } from '@/enums';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import UpDownView from '@/pages/statistics/common/UpDownView';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
  openNewTag,
} from '@/utils/utils';
import { Link } from '@umijs/max';
import { Table as AntdTable, Flex, TableProps, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  FC,
  Key,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './index.less';
import SubTable from './SubTable';

type ColumnsType<T extends object = object> = TableProps<T>['columns'];

const { Text } = Typography;

// type SortConfig = {
//   columnKey: string | undefined;
//   order: 'ascend' | 'descend' | undefined;
// };

interface ITableProps {
  bu?: BUEnum;
  dataSource: IVendorAnalysisByVendorItem[];
  yearMonth: string;
  currentSortField?: string;
  currentSortOrder?: 'ASC' | 'DESC';
  onSortChange: (field?: string, order?: 'ASC' | 'DESC') => void;
  scrollY?: number;
  tableRef: RefObject<HTMLDivElement>;
}

const Table: FC<ITableProps> = ({
  bu,
  dataSource,
  yearMonth,
  onSortChange,
  currentSortField,
  currentSortOrder,
  scrollY,
  tableRef,
}) => {
  const dateFormat = 'YYYY-MM';
  const defaultDate: Dayjs = dayjs();
  const { waybillTimeType } = useWaybillTimeType();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
  const subTableCacheRef = useRef<
    Map<number, IVendorAnalysisByVendorProjectItem[]>
  >(new Map());

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
      if (currentSortOrder === 'ASC') {
        return v1 - v2;
      }
      return v2 - v1;
    });
    return sortedData.slice(0, displayLimit);
  }, [dataSource, displayLimit, currentSortField, currentSortOrder]);

  const antdOrder = useMemo(() => {
    if (!currentSortOrder) return null;
    return currentSortOrder === 'ASC' ? 'ascend' : 'descend';
  }, [currentSortOrder]);

  const handleTableChange: TableProps<IVendorAnalysisByVendorItem>['onChange'] =
    (_p, _f, sorter: any) => {
      const field = sorter.field as string;
      const _order = sorter.order
        ? ((sorter.order === 'ascend' ? 'ASC' : 'DESC') as 'ASC' | 'DESC')
        : undefined;
      onSortChange(field, _order);
    };

  const columns: ColumnsType<IVendorAnalysisByVendorItem> = useMemo(
    () => [
      {
        title: 'NO.',
        width: 50,
        fixed: 'left',
        render: (_, _record, index) => {
          return index + 1;
        },
      },
      {
        title: 'Vendor',
        dataIndex: 'vendorName',
        width: 120,
        fixed: 'left',
        render: (_, record) => {
          return (
            <CustomTooltip title={record.vendorName}>
              <Text ellipsis>{record.vendorName}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Procurement PIC',
        dataIndex: 'vendorPicName',
        width: 100,
        fixed: 'left',
        render: (_, record) => {
          return (
            <CustomTooltip title={record.vendorPicName}>
              <Text ellipsis>{record.vendorPicName}</Text>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Project',
        dataIndex: 'projectCount',
        width: 80,
        render: (_, record) => {
          const vendorName = record.vendorName;
          const content = (
            <UpDownView
              arrowPosition="right"
              result={record.projectCountCompareResult}
              number={record.projectCount}
              useMoneyFormat={false}
              onClick={() => {
                openNewTag(
                  `${PATHS.VENDOR_STATISTIC_PROJECT_DETAIL}?yearMonth=${yearMonth}&vendorId=${record.vendorId}&projectCountCompareResult=${record.projectCountCompareResult}&projectCountCompareValue=${record.projectCountCompareValue}${vendorName ? `&vendorName=${encodeURIComponent(vendorName as string)}` : ''}${bu ? `&bu=${encodeURIComponent(bu as string)}` : ''}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            />
          );
          return content;
        },
      },
      {
        title: 'Waybill',
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
      {
        title: 'Cost',
        dataIndex: 'cost',
        width: 80,
        align: 'right',
        sorter: (a, b) => a.cost - b.cost,
        sortOrder: currentSortField === 'cost' ? antdOrder : null,
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
        dataIndex: 'revenue',
        width: 80,
        align: 'right',
        sorter: (a, b) => a.revenue - b.revenue,
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

      {
        title: 'Gross Profit',
        dataIndex: 'grossProfit',
        width: 80,
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
      {
        title: 'Gross Margin',
        dataIndex: 'grossMargin',
        width: 80,
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
      {
        title: 'Action',
        width: 100,
        align: 'right',
        render: (_, record) => {
          const year = dayjs(yearMonth).format('YYYY');
          const yearMonthStr = dayjs(yearMonth).format('YYYY-MM');
          const vendorName = record.vendorName
            ? `&vendorName=${encodeURIComponent(record.vendorName as string)}`
            : '';
          const _bu = bu ? `&bu=${encodeURIComponent(bu as string)}` : '';
          return (
            <Flex gap={12}>
              <Link
                to={`${PATHS.VENDOR_STATISTIC_GROSS_PROFIT_TREND_DETAIL}?year=${year}&vendorId=${record.vendorId}${vendorName}${_bu}&waybillTimeType=${waybillTimeType}`}
                target="_blank"
              >
                Trend
              </Link>
              <Link
                to={`${PATHS.VENDOR_STATISTIC_VENDOR_COMPARISON}?yearMonth=${yearMonthStr}&vendorId=${record.vendorId}${vendorName}${_bu}&waybillTimeType=${waybillTimeType}`}
                target="_blank"
              >
                Compare
              </Link>
            </Flex>
          );
        },
      },
    ],
    [yearMonth, currentSortField, antdOrder],
  );

  const expandedRowRender = (record: IVendorAnalysisByVendorItem) => (
    <SubTable
      yearMonth={
        yearMonth
          ? dayjs(yearMonth)?.format(dateFormat)
          : defaultDate.format(dateFormat)
      }
      vendorId={record.vendorId}
      bu={bu}
      // 传递排序配置
      parentSortField={currentSortField}
      parentSortOrder={currentSortOrder === 'ASC' ? 'ascend' : 'descend'}
      cache={subTableCacheRef.current}
    />
  );

  const handleExpand = useCallback(
    (expanded: boolean, record: IVendorAnalysisByVendorItem) => {
      setExpandedRowKeys((prev) => {
        return expanded
          ? [...prev, record.vendorId]
          : prev.filter((k) => k !== record.vendorId);
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
      console.log(
        'isNearBottom',
        scrollTop + clientHeight,
        scrollHeight - threshold,
      );
      if (isNearBottom) {
        loadingMoreRef.current = true;
        setDisplayLimit((prev) => prev + PAGE_SIZE);

        setTimeout(() => {
          loadingMoreRef.current = false;
        }, 300);
      }
    },
    [hasMore],
  );

  useEffect(() => {
    subTableCacheRef.current.clear();
  }, [dataSource]);

  return (
    <div ref={tableRef}>
      <AntdTable<IVendorAnalysisByVendorItem>
        className={styles.vendorStatisticTable}
        rowKey={(record) => record.vendorId}
        columns={columns as any}
        dataSource={displayDataSource}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 1000, y: scrollY }}
        onChange={handleTableChange}
        onScroll={handleScroll}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: handleExpand,
          columnWidth: dataSource?.length > 0 ? 50 : 0,
        }}
      />
    </div>
  );
};

export default Table;
