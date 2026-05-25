import { ISummaryTableData } from '@/api/types/statistics';
import {
  CountryCurrencyEnumText,
  SummaryGroupByDate,
  SummaryGroupByDateText,
} from '@/enums';
import { formatAmountPercentage } from '@/utils/utils';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import styles from '../index.less';

export default function Dashboard({
  countryId = 1,
  timeGroup,
  data,
}: {
  countryId: number;
  timeGroup: SummaryGroupByDate;
  data: ISummaryTableData;
}) {
  const CommonTitle = useCallback(
    ({
      borderTop = false,
      label,
      value,
    }: {
      borderTop?: boolean;
      label: string;
      value: string | number;
    }) => {
      return (
        <div
          className={`${
            borderTop
              ? `${styles.commonTitle} ${styles.commonTitle_up}`
              : styles.commonTitle
          }`}
        >
          <div className={styles.commonTitle_label}>{label}</div>
          <div className={styles.commonTitle_value}>{value}</div>
        </div>
      );
    },
    [],
  );

  const CommonLine = useCallback(
    ({ label, value }: { label: string; value: string | number }) => {
      return (
        <div className={styles.commonLine}>
          <div className={styles.commonLine_label}>{label}</div>
          <div className={styles.commonLine_value}>
            {CountryCurrencyEnumText?.[countryId as number]}
            {value}
          </div>
        </div>
      );
    },
    [],
  );

  const titleTime = useMemo(() => {
    switch (timeGroup) {
      case SummaryGroupByDate.DAY:
        return data.xaxis;
      case SummaryGroupByDate.WEEK:
        return `${data.xaxis} ~ ${dayjs(data.xaxis)
          .add(6, 'day')
          .format('YYYY-MM-DD')}`;
      case SummaryGroupByDate.MONTH:
        return `${data.xaxis} ~ ${dayjs(data.xaxis)
          .endOf('month')
          .format('YYYY-MM-DD')}`;
    }
  }, [data, timeGroup]);

  return (
    <div className={styles.board}>
      <div className={styles.board_header}>
        <div className={styles.board_header_title}>{titleTime}</div>
      </div>
      <div className={styles.board_content}>
        {/*Summary*/}
        <div>
          <div className={styles.board_content_title}>Summary</div>
          <div className={styles.board_content_item}>
            <CommonTitle label="Trip Numbers" value={data.summaryTripNumbers} />
            <div className={styles.board_content_item_data}>
              <CommonLine
                label={`${SummaryGroupByDateText[timeGroup]} Income`}
                value={formatAmountPercentage(data.summaryIncome)}
              />
              <CommonLine
                label={`${SummaryGroupByDateText[timeGroup]} Spending`}
                value={formatAmountPercentage(data.summarySpending)}
              />
              <CommonLine
                label={`${SummaryGroupByDateText[timeGroup]} GP`}
                value={formatAmountPercentage(data.summaryGp)}
              />
            </div>
            <div className={styles.board_content_item_line}></div>
            <div className={styles.board_content_item_data}>
              <CommonLine
                label="Income Per Trip"
                value={formatAmountPercentage(data.summaryIncomePerTrip)}
              />
              <CommonLine
                label="Spending Per Trip"
                value={formatAmountPercentage(data.summarySpendingPerTrip)}
              />
              <CommonLine
                label="GP Per Trip"
                value={formatAmountPercentage(data.summaryGPPerTrip)}
              />
            </div>
            <CommonTitle
              borderTop
              label="Gross Margin"
              value={data.summaryGrossMargin}
            />
          </div>
        </div>
        {/*Confirmed*/}
        {data.confirmedTripNumbers !== 0 &&
        data.unconfirmedTripNumbers === 0 ? null : (
          <div>
            <div className={styles.board_content_title}>Confirmed</div>
            <div className={styles.board_content_item}>
              <CommonTitle
                label="Trip Numbers"
                value={data.confirmedTripNumbers}
              />
              <div className={styles.board_content_item_data}>
                <CommonLine
                  label={`${SummaryGroupByDateText[timeGroup]} income`}
                  value={formatAmountPercentage(data.confirmedIncome)}
                />
                <CommonLine
                  label={`${SummaryGroupByDateText[timeGroup]} GP`}
                  value={formatAmountPercentage(data.confirmedGp)}
                />
              </div>
            </div>
            <div
              className={styles.board_content_title}
              style={{ marginTop: '23px' }}
            >
              Unconfirmed
            </div>
            <div className={styles.board_content_item}>
              <CommonTitle
                label="Trip Numbers"
                value={data.unconfirmedTripNumbers}
              />
              <div className={styles.board_content_item_data}>
                <CommonLine
                  label={`${SummaryGroupByDateText[timeGroup]} income`}
                  value={formatAmountPercentage(data.unconfirmedIncome)}
                />
                <CommonLine
                  label={`${SummaryGroupByDateText[timeGroup]} GP`}
                  value={formatAmountPercentage(data.unconfirmedGp)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
