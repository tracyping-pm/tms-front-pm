import { IAlarmDashboardStatisticsListItem } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import { formatAmount } from '@/utils/utils';
import { Table, TableColumnsType } from 'antd';
import { FC } from 'react';
import { ReactComponent as IconFirstNum } from '../../../../../public/svg/customer/firstNum.svg';
import { ReactComponent as IconSecondNum } from '../../../../../public/svg/customer/secondNum.svg';
import { ReactComponent as IconThirdNum } from '../../../../../public/svg/customer/thirdNum.svg';
import styles from './styles.less';

interface IStatisticsListProps {
  loading: boolean;
  list: IAlarmDashboardStatisticsListItem[];
}

const StatisticsList: FC<IStatisticsListProps> = ({
  list = [],
  loading = false,
}) => {
  const columns: TableColumnsType<IAlarmDashboardStatisticsListItem> = [
    {
      title: 'Ranking',
      dataIndex: 'id',
      width: 80,
      ellipsis: { showTitle: false },
      render: (text, record, index) => {
        if (index === 0) {
          return (
            <div className={styles.indexRender}>
              1. <IconFirstNum style={{ marginBottom: '2px' }} />
            </div>
          );
        } else if (index === 1) {
          return (
            <div className={styles.indexRender}>
              2. <IconSecondNum style={{ marginBottom: '2px' }} />
            </div>
          );
        } else if (index === 2) {
          return (
            <div className={styles.indexRender}>
              3. <IconThirdNum style={{ marginBottom: '2px' }} />
            </div>
          );
        } else {
          return `${index + 1}.`;
        }
      },
    },
    {
      title: 'OC',
      dataIndex: 'userName',
      render: (_, record) => {
        return (
          <CustomTooltip title={record.userName}>
            {record.userName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Done',
      dataIndex: 'doneCount',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={formatAmount(record.doneCount)}>
            {formatAmount(record.doneCount)}
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        padding: 12,
        paddingBottom: 0,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.userId}
        columns={columns}
        dataSource={list}
        size="small"
        pagination={false}
        // scroll={{ y: 240 }}
      />
    </div>
  );
};

export default StatisticsList;
