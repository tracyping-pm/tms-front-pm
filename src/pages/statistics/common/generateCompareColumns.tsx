import type { ICompareChangeItem } from '@/api/types/statistics';
import { EnumCountCompareResult } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { Flex, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import UpDownView from './UpDownView';
const { Text } = Typography;
export interface GenerateCompareColumnsOptions {
  baseTitle: string;
  listDataIndex: string;
  yearMonth: dayjs.Dayjs | string;
  comparisonPeriod: number;
  isCount: boolean;
  sortConfig?: {
    currentSortField?: string;
    currentSortOrder?: 'ascend' | 'descend' | undefined | null;
  };
  includeKey?: boolean;
  columnWidth?: number;
}

export const generateCompareColumns = <T extends Record<string, any>>(
  options: GenerateCompareColumnsOptions,
): ColumnType<T>[] => {
  const {
    baseTitle,
    listDataIndex,
    yearMonth,
    comparisonPeriod,
    isCount,
    sortConfig,
    includeKey = false,
    columnWidth = 220,
  } = options;

  if (!comparisonPeriod || !yearMonth) return [];

  const { currentSortField, currentSortOrder } = sortConfig || {};

  return Array.from({ length: comparisonPeriod }, (_, idx) => {
    const monthsAgo = idx + 1;
    const compareDate = dayjs(yearMonth).subtract(monthsAgo, 'month');
    const monthLabel = compareDate.format('YYYY-MM');
    const columnKey = `${listDataIndex}-${monthLabel}`;

    const getChangeValue = (item: ICompareChangeItem | undefined): number => {
      return isCount ? (item?.changeNum ?? 0) : (item?.changeAmount ?? 0);
    };

    const getCompareValue = (item: ICompareChangeItem | undefined): number => {
      return isCount ? (item?.compareNum ?? 0) : (item?.compareAmount ?? 0);
    };

    return {
      title: (
        <>
          {`${baseTitle} `}
          <div style={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: 12 }}>
            compare with {monthLabel}
          </div>
        </>
      ),
      width: columnWidth,
      ...(includeKey && { key: columnKey }),
      sorter: (a: any, b: any) => {
        const listA = a[listDataIndex] as ICompareChangeItem[] | undefined;
        const listB = b[listDataIndex] as ICompareChangeItem[] | undefined;
        const changeAmountA = getChangeValue(
          listA?.find((i) => i.month === monthLabel),
        );
        const changeAmountB = getChangeValue(
          listB?.find((i) => i.month === monthLabel),
        );
        return changeAmountA - changeAmountB;
      },
      ...(sortConfig && {
        sortOrder:
          currentSortField === columnKey ? currentSortOrder : undefined,
      }),
      render: (_value: any, record: any) => {
        const list = record[listDataIndex] as ICompareChangeItem[] | undefined;
        const compareItem = list?.find((i) => i.month === monthLabel);
        const changeAmount = getChangeValue(compareItem);
        const compareAmount = getCompareValue(compareItem);

        let result = EnumCountCompareResult.EQUAL;
        if (changeAmount > 0) result = EnumCountCompareResult.INCREASE;
        else if (changeAmount < 0) result = EnumCountCompareResult.DECREASE;

        return (
          <Flex justify="space-between">
            <UpDownView
              result={result}
              number={Math.abs(changeAmount)}
              control
            />
            <Text style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
              {formatAmount(compareAmount)}
            </Text>
          </Flex>
        );
      },
    };
  });
};
