import { IActiveProjectStaticRecord } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import { EnumProjectStatisticActiveType } from '@/enums';
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
  dataSource: IActiveProjectStaticRecord[];
}) {
  const { waybillTimeType } = useWaybillTimeType();
  const columns: ColumnsType<IActiveProjectStaticRecord> = [
    {
      title: 'Month',
      dataIndex: 'mouthDate',
      width: 100,
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
        <TooltipTitle tips="Existing Active Project + Existing Reactive Project + New Project">
          Total Active Project
        </TooltipTitle>
      ),
      dataIndex: 'totalActiveProject',
      width: 140,
      render: (_, record) => {
        const totalActiveProject = record.totalActiveProject;
        return (
          <CustomTooltip title={formatAmount(totalActiveProject)}>
            <div
              onClick={() => {
                if (totalActiveProject === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.PROJECT_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumProjectStatisticActiveType.TOTAL_ACTIVE_PROJECT}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text
                ellipsis
                className={cls(totalActiveProject > 0 && styles.number)}
              >
                {formatAmount(totalActiveProject)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of projects who are active both this month and last month.">
          Existing Active Project
        </TooltipTitle>
      ),
      dataIndex: 'existingActiveProject',
      width: 140,
      render: (_, record) => {
        const existingActiveProject = record.existingActiveProject;
        return (
          <CustomTooltip title={formatAmount(existingActiveProject)}>
            <div
              onClick={() => {
                if (existingActiveProject === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.PROJECT_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumProjectStatisticActiveType.EXISTING_ACTIVE_PROJECT}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text
                ellipsis
                className={cls(existingActiveProject > 0 && styles.number)}
              >
                {formatAmount(existingActiveProject)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle tips="Number of previously inactive projects who became active this month, excluding new Project.">
          Existing Reactive Project
        </TooltipTitle>
      ),
      dataIndex: 'existingReactiveProject',
      width: 140,
      render: (_, record) => {
        const existingReactiveProject = record.existingReactiveProject;
        return (
          <CustomTooltip title={formatAmount(existingReactiveProject)}>
            <div
              onClick={() => {
                if (existingReactiveProject === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.PROJECT_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumProjectStatisticActiveType.EXISTING_REACTIVE_PROJECT}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text
                ellipsis
                className={cls(existingReactiveProject > 0 && styles.number)}
              >
                {formatAmount(existingReactiveProject)}
              </Text>
            </div>
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <TooltipTitle
          tips={`Number of projects  who were active last month but are inactive this month.`}
        >
          {'Lost Project'}
        </TooltipTitle>
      ),
      dataIndex: 'lostProject',
      width: 140,
      render: (_, record) => {
        const lost = record.lostProject;
        return (
          <CustomTooltip title={formatAmount(lost)}>
            <div
              onClick={() => {
                if (lost === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.PROJECT_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumProjectStatisticActiveType.LOST_PROJECT}&waybillTimeType=${waybillTimeType}`,
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
          tips={`Number of projects whose first "Abnormal" or "Delivered" waybill has a position time within the current month.`}
        >
          {'New Project'}
        </TooltipTitle>
      ),
      dataIndex: 'newProject',
      width: 140,
      render: (_, record) => {
        const newProject = record.newProject;
        return (
          <CustomTooltip title={formatAmount(newProject)}>
            <div
              onClick={() => {
                if (newProject === 0) {
                  return;
                }
                openNewTag(
                  `${PATHS.PROJECT_STATISTIC_DETAIL}?yearMonth=${record.mouthDate}&activeType=${EnumProjectStatisticActiveType.NEW_PROJECT}&waybillTimeType=${waybillTimeType}`,
                );
              }}
            >
              <Text ellipsis className={cls(newProject > 0 && styles.number)}>
                {formatAmount(newProject)}
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
        rowKey={(record) => record.mouthDate}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        scroll={{ y: 500 }}
      />
    </div>
  );
}
