import { crmStatisticTrackingList } from '@/api/statistics';
import { ICrmStatisticTrackingItem } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import { OpportunitiesStatusEnum } from '@/enums';
import { formatAmount, openNewTag } from '@/utils/utils';
import { Table, Typography } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { useGlobalFilter } from '../../GlobalFilterContext';
import BaseCell from '../BaseCell';
import SkeletonView from '../SkeletonView';

const { Column, ColumnGroup } = Table;
const { Link } = Typography;

const TrackingTable: FC = () => {
  const { globalFilter } = useGlobalFilter();
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<ICrmStatisticTrackingItem[]>([]);
  const fetchTableData = async () => {
    setTableLoading(true);

    const { bu, bdUserRoleIds } = globalFilter;
    const res = await crmStatisticTrackingList({
      bu,
      bdUserRoleIds,
      minCreatedAt: dayjs(globalFilter.startTime).format('YYYY-MM-DD 00:00:00'),
      maxCreatedAt: dayjs(globalFilter.endTime).format('YYYY-MM-DD 23:59:59'),
    }).finally(() => {
      setTableLoading(false);
    });
    if (res.code === 200) {
      setTableData(res.data);
    }
  };

  const getCommonFilter = useCallback(() => {
    const { bu } = globalFilter;

    const commonFilter = {
      opportunityStatus: [OpportunitiesStatusEnum.SUCCESSFUL_CLOSED],
      buList: bu ? [bu] : undefined,
      // pageNum: 1,
      // pageSize: 20,
    };

    _.filter(commonFilter, (value) => value !== undefined);

    return commonFilter;
  }, [globalFilter]);

  const onTotalClosedClick = useCallback(
    (record: ICrmStatisticTrackingItem, isTotal = false) => {
      const { startTime, endTime } = globalFilter;
      const timeStart = dayjs(startTime).format?.('YYYY-MM-DD 00:00:00');
      const timeEnd = dayjs(endTime).format?.('YYYY-MM-DD 23:59:59');

      const commonFilter = getCommonFilter();
      const filter = {
        ...commonFilter,
        picUserRoleIdList: isTotal ? [] : [record.picUserRoleId],
        successfulClosedTimeStart: timeStart,
        successfulClosedTimeEnd: timeEnd,
      };

      const extraJson = {
        FE_NEED: filter,
        BE_NEED: filter,
      };
      const urlExtra = JSON.stringify(extraJson);

      openNewTag(`${PATHS.OPPORTUNITIES_LIST}?extra=${urlExtra}`);
    },
    [globalFilter],
  );

  const onCurrPeriodCreatedAndClosedClick = useCallback(
    (record: ICrmStatisticTrackingItem, isTotal = false) => {
      const { startTime, endTime } = globalFilter;
      const timeStart = dayjs(startTime).format?.('YYYY-MM-DD 00:00:00');
      const timeEnd = dayjs(endTime).format?.('YYYY-MM-DD 23:59:59');

      const commonFilter = getCommonFilter();
      const filter = {
        ...commonFilter,
        picUserRoleIdList: isTotal ? [] : [record.picUserRoleId],
        createTimeStart: timeStart,
        createTimeEnd: timeEnd,
        successfulClosedTimeStart: timeStart,
        successfulClosedTimeEnd: timeEnd,
      };

      const extraJson = {
        FE_NEED: filter,
        BE_NEED: filter,
      };
      const urlExtra = JSON.stringify(extraJson);

      openNewTag(`${PATHS.OPPORTUNITIES_LIST}?extra=${urlExtra}`);
    },
    [globalFilter],
  );

  const onPrevCreatedCurrClosedClick = useCallback(
    (record: ICrmStatisticTrackingItem, isTotal = false) => {
      const { startTime, endTime } = globalFilter;
      const timeStart = dayjs(startTime).format?.('YYYY-MM-DD 00:00:00');
      const timeEnd = dayjs(endTime).format?.('YYYY-MM-DD 23:59:59');
      const createTimeStart = dayjs('2024-01-01').format?.(
        'YYYY-MM-DD 00:00:00',
      );
      const createTimeEnd = dayjs(startTime)
        .subtract(1)
        .format?.('YYYY-MM-DD 23:59:59');

      const commonFilter = getCommonFilter();
      const filter = {
        ...commonFilter,
        picUserRoleIdList: isTotal ? [] : [record.picUserRoleId],
        createTimeStart,
        createTimeEnd,
        successfulClosedTimeStart: timeStart,
        successfulClosedTimeEnd: timeEnd,
      };

      const extraJson = {
        FE_NEED: filter,
        BE_NEED: filter,
      };
      const urlExtra = JSON.stringify(extraJson);

      openNewTag(`${PATHS.OPPORTUNITIES_LIST}?extra=${urlExtra}`);
    },
    [globalFilter],
  );

  useEffect(() => {
    fetchTableData();
  }, [
    globalFilter.bu,
    globalFilter.bdUserRoleIds,
    globalFilter.timeOption,
    globalFilter.startTime,
    globalFilter.endTime,
    globalFilter.retryCount,
  ]);

  return (
    <>
      {tableLoading ? (
        <SkeletonView />
      ) : (
        <Table<ICrmStatisticTrackingItem>
          dataSource={tableData}
          scroll={{ x: 'max-content' }}
          size="small"
          pagination={false}
          rowHoverable={false}
          bordered
        >
          <Column<ICrmStatisticTrackingItem>
            key="pic"
            title="BD/CAM"
            width={160}
            fixed="left"
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title="Total"
                  />
                );
              }
              return (
                <CustomTooltip title={record.pic}>{record.pic}</CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticTrackingItem>
            key="leadCreation"
            title="Lead Customer Creation"
            width={160}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.leadCreation)}
                  />
                );
              }
              return (
                <CustomTooltip title={formatAmount(record.leadCreation)}>
                  {formatAmount(record.leadCreation)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticTrackingItem>
            key="opportunityCreation"
            title="Opportunity Creation"
            width={160}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.opportunityCreation)}
                  />
                );
              }
              return (
                <CustomTooltip title={formatAmount(record.opportunityCreation)}>
                  {formatAmount(record.opportunityCreation)}
                </CustomTooltip>
              );
            }}
          />

          <ColumnGroup
            key="Opportunity Successful Closed"
            title="Opportunity Successful Closed"
            align="left"
          >
            <Column<ICrmStatisticTrackingItem>
              key="totalClosed"
              title="Total Closed"
              width={120}
              render={(_value, record) => {
                if (record.pic === 'Total') {
                  return (
                    <BaseCell style={{ backgroundColor: '#EEF6F4' }}>
                      {record.totalClosed > 0 ? (
                        <Link
                          underline
                          onClick={() => onTotalClosedClick(record, true)}
                        >
                          {formatAmount(record.totalClosed)}
                        </Link>
                      ) : (
                        record.totalClosed
                      )}
                    </BaseCell>
                  );
                }
                return (
                  <CustomTooltip title={formatAmount(record.totalClosed)}>
                    {record.totalClosed > 0 ? (
                      <Link
                        underline
                        onClick={() => onTotalClosedClick(record)}
                      >
                        {formatAmount(record.totalClosed)}
                      </Link>
                    ) : (
                      record.totalClosed
                    )}
                  </CustomTooltip>
                );
              }}
            />

            <Column<ICrmStatisticTrackingItem>
              key="currPeriodCreatedAndClosed"
              title="Curr Period Created and Closed"
              width={200}
              render={(_value, record) => {
                if (record.pic === 'Total') {
                  return (
                    <BaseCell style={{ backgroundColor: '#EEF6F4' }}>
                      {record.currPeriodCreatedAndClosed > 0 ? (
                        <Link
                          underline
                          onClick={() =>
                            onCurrPeriodCreatedAndClosedClick(record, true)
                          }
                        >
                          {formatAmount(record.currPeriodCreatedAndClosed)}
                        </Link>
                      ) : (
                        record.currPeriodCreatedAndClosed
                      )}
                    </BaseCell>
                  );
                }
                return (
                  <CustomTooltip
                    title={formatAmount(record.currPeriodCreatedAndClosed)}
                  >
                    {record.currPeriodCreatedAndClosed > 0 ? (
                      <Link
                        underline
                        onClick={() =>
                          onCurrPeriodCreatedAndClosedClick(record)
                        }
                      >
                        {formatAmount(record.currPeriodCreatedAndClosed)}
                      </Link>
                    ) : (
                      record.currPeriodCreatedAndClosed
                    )}
                  </CustomTooltip>
                );
              }}
            />

            <Column<ICrmStatisticTrackingItem>
              key="prevCreatedCurrClosed"
              title="Prev Created Curr Closed"
              width={180}
              render={(_value, record) => {
                if (record.pic === 'Total') {
                  return (
                    <BaseCell style={{ backgroundColor: '#EEF6F4' }}>
                      {record.prevCreatedCurrClosed > 0 ? (
                        <Link
                          underline
                          onClick={() =>
                            onPrevCreatedCurrClosedClick(record, true)
                          }
                        >
                          {formatAmount(record.prevCreatedCurrClosed)}
                        </Link>
                      ) : (
                        record.prevCreatedCurrClosed
                      )}
                    </BaseCell>
                  );
                }
                return (
                  <CustomTooltip
                    title={formatAmount(record.prevCreatedCurrClosed)}
                  >
                    {record.prevCreatedCurrClosed > 0 ? (
                      <Link
                        underline
                        onClick={() => onPrevCreatedCurrClosedClick(record)}
                      >
                        {formatAmount(record.prevCreatedCurrClosed)}
                      </Link>
                    ) : (
                      record.prevCreatedCurrClosed
                    )}
                  </CustomTooltip>
                );
              }}
            />
          </ColumnGroup>
        </Table>
      )}
    </>
  );
};

export default TrackingTable;
