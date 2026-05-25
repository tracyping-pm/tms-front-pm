import { crmStatisticVolumeData } from '@/api/statistics';
import { ICrmStatisticVolumeDataItem } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { formatAmount } from '@/utils/utils';
import { Flex, Table } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { ReactComponent as IconFirstNum } from '../../../../../../public/svg/customer/firstNum.svg';
import { ReactComponent as IconSecondNum } from '../../../../../../public/svg/customer/secondNum.svg';
import { ReactComponent as IconThirdNum } from '../../../../../../public/svg/customer/thirdNum.svg';
import { useGlobalFilter } from '../../GlobalFilterContext';
import BaseCell from '../BaseCell';
import SkeletonView from '../SkeletonView';

const { Column } = Table;
const FollowupTable: FC = () => {
  const { globalFilter } = useGlobalFilter();
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<ICrmStatisticVolumeDataItem[]>([]);
  const fetchTableData = async () => {
    setTableLoading(true);

    const { bu, bdUserRoleIds, rankedBy } = globalFilter;
    const res = await crmStatisticVolumeData({
      bu,
      bdUserRoleIds,
      rankedBy,
      minCreatedAt: dayjs(globalFilter.startTime).format('YYYY-MM-DD 00:00:00'),
      maxCreatedAt: dayjs(globalFilter.endTime).format('YYYY-MM-DD 23:59:59'),
    }).finally(() => {
      setTableLoading(false);
    });
    if (res.code === 200) {
      setTableData(res.data);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [globalFilter]);

  return (
    <>
      {tableLoading ? (
        <SkeletonView />
      ) : (
        <Table<ICrmStatisticVolumeDataItem>
          dataSource={tableData}
          scroll={{ x: 'max-content' }}
          size="small"
          pagination={false}
          rowHoverable={false}
          bordered
        >
          <Column<ICrmStatisticVolumeDataItem>
            key="Ranking"
            title="Ranking"
            width={80}
            fixed="left"
            render={(_value, record, index) => {
              if (record.pic === 'Total') {
                return <BaseCell style={{ backgroundColor: '#EEF6F4' }} />;
              }
              if (index === 0) {
                return (
                  <Flex align="center" gap={8}>
                    <span>1.</span>
                    <IconFirstNum />
                  </Flex>
                );
              } else if (index === 1) {
                return (
                  <Flex align="center" gap={8}>
                    <span>2.</span>
                    <IconSecondNum />
                  </Flex>
                );
              } else if (index === 2) {
                return (
                  <Flex align="center" gap={8}>
                    <span>3.</span>
                    <IconThirdNum />
                  </Flex>
                );
              } else {
                return `${index + 1}.`;
              }
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="pic"
            title="BD/CAM"
            width={80}
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

          <Column<ICrmStatisticVolumeDataItem>
            key="opportunityCount"
            title={
              <BaseCell
                style={{ backgroundColor: '#EEF6F4' }}
                data-title="Total"
              />
            }
            width={110}
            fixed="left"
            render={(_value, record) => {
              return (
                <BaseCell
                  style={{ backgroundColor: '#EEF6F4' }}
                  data-title={formatAmount(record.opportunityCount)}
                />
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="reachOutCount"
            title="Reach Out"
            width={90}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.reachOutCount)}
                  />
                );
              }
              return (
                <CustomTooltip title={formatAmount(record.reachOutCount)}>
                  {formatAmount(record.reachOutCount)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="successfulContactedCount"
            title="Successful Contact"
            width={100}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.successfulContactedCount)}
                  />
                );
              }
              return (
                <CustomTooltip
                  title={formatAmount(record.successfulContactedCount)}
                >
                  {formatAmount(record.successfulContactedCount)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="quotationRequestReceivedCount"
            title="Quotation Request Received"
            width={120}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(
                      record.quotationRequestReceivedCount,
                    )}
                  />
                );
              }
              return (
                <CustomTooltip
                  title={formatAmount(record.quotationRequestReceivedCount)}
                >
                  {formatAmount(record.quotationRequestReceivedCount)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="quotationSubmittedCount"
            title="Quotation Submitted"
            width={90}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.quotationSubmittedCount)}
                  />
                );
              }
              return (
                <CustomTooltip
                  title={formatAmount(record.quotationSubmittedCount)}
                >
                  {formatAmount(record.quotationSubmittedCount)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="successClosedCount"
            title="Successful Closed"
            width={100}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.successClosedCount)}
                  />
                );
              }
              return (
                <CustomTooltip title={formatAmount(record.successClosedCount)}>
                  {formatAmount(record.successClosedCount)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="lostCount"
            title="Lost"
            width={60}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.lostCount)}
                  />
                );
              }
              return (
                <CustomTooltip title={formatAmount(record.lostCount)}>
                  {formatAmount(record.lostCount)}
                </CustomTooltip>
              );
            }}
          />

          <Column<ICrmStatisticVolumeDataItem>
            key="canceledCount"
            title="Canceled"
            width={80}
            render={(_value, record) => {
              if (record.pic === 'Total') {
                return (
                  <BaseCell
                    style={{ backgroundColor: '#EEF6F4' }}
                    data-title={formatAmount(record.canceledCount)}
                  />
                );
              }
              return (
                <CustomTooltip title={formatAmount(record.canceledCount)}>
                  {formatAmount(record.canceledCount)}
                </CustomTooltip>
              );
            }}
          />
        </Table>
      )}
    </>
  );
};

export default FollowupTable;
