import { customerAnalysisByProjectList } from '@/api/statistics';
import {
  IActiveProjectListRecord,
  ICustomerAnalysisByProjectRecord,
  ICustomerAnalysisParams,
  WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import {
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
} from '@/enums';
import CardView from '@/pages/statistics/common/CardView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { formatAmount, formatMoneyWithDecimal } from '@/utils/utils';
import { useSearchParams } from '@umijs/max';
import { Badge, Flex, Table, TableColumnsType, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

const AnalysisByProject: FC = ({}) => {
  const [dataSource, setDataSource] = useState<
    ICustomerAnalysisByProjectRecord[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const customerId = searchParams.get('customerId') as string;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType;

  const fetchDataSource = async () => {
    const payload: ICustomerAnalysisParams = {
      startDate: dayjs(yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(yearMonth).endOf('month').format('YYYY-MM-DD 23:59:59'),
      customerId: Number(customerId),
      waybillTimeType,
    };

    if (!payload.startDate || !payload.endDate || !payload.customerId) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await customerAnalysisByProjectList(payload).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setDataSource(res.data || []);
    }
  };

  const buildColumnTitle = (title: string) => {
    return (
      <Flex vertical style={{ userSelect: 'none' }}>
        <span>{title}</span>
        <span>({yearMonth})</span>
      </Flex>
    );
  };

  const columns: TableColumnsType<IActiveProjectListRecord> = [
    {
      title: 'No.',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      fixed: 'left',

      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            <Text ellipsis>{record.projectName}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Status',
      dataIndex: 'projectStatus',

      render: (_, record) => {
        //@ts-ignore
        const status: ProjectStatusEnum = record.projectStatus;
        const Content = (
          <Badge
            color={ProjectStatusEnumColor[status]}
            text={ProjectStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },

    {
      title: buildColumnTitle('Waybill'),
      dataIndex: 'waybillNum',

      render: (_, record) => {
        const num = formatAmount(record.waybillNum);
        return (
          <CustomTooltip title={num}>
            <Text ellipsis>{num}</Text>
          </CustomTooltip>
        );
      },
    },

    {
      title: buildColumnTitle('Avg Daily Waybill'),
      dataIndex: 'avgWaybillNum',
      align: 'right',

      render: (_, record) => {
        const num = formatAmount(record.avgWaybillNum);
        return (
          <CustomTooltip title={num}>
            <Text ellipsis>{num}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: buildColumnTitle('Revenue'),
      dataIndex: 'revenue',
      align: 'right',

      sorter: (a, b) => a.revenue - b.revenue,
      render: (_, record) => {
        const num = formatMoneyWithDecimal(record.revenue);
        return (
          <CustomTooltip title={num}>
            <Text ellipsis>{num}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: buildColumnTitle('Cost'),
      dataIndex: 'cost',
      align: 'right',

      sorter: (a, b) => a.cost - b.cost,
      render: (_, record) => {
        const num = formatMoneyWithDecimal(record.cost);
        return (
          <CustomTooltip title={num}>
            <Text ellipsis>{num}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: buildColumnTitle('Gross Profit'),
      dataIndex: 'grossProfit',
      align: 'right',

      sorter: (a, b) => a.grossProfit - b.grossProfit,
      render: (_, record) => {
        const num = formatMoneyWithDecimal(record.grossProfit);
        return (
          <CustomTooltip title={num}>
            <Text ellipsis>{num}</Text>
          </CustomTooltip>
        );
      },
    },
    {
      title: buildColumnTitle('Gross Margin'),
      dataIndex: 'grossMargin',
      align: 'right',

      sorter: (a, b) => a.grossMargin - b.grossMargin,
      render: (_, record) => {
        const num = `${record.grossMargin}%`;
        return (
          <CustomTooltip title={num}>
            <Text ellipsis>{num}</Text>
          </CustomTooltip>
        );
      },
    },
  ];

  useEffect(() => {
    fetchDataSource();
  }, [searchParams]);

  return (
    <>
      <CardView
        title={
          <TooltipTitle
            tips={
              'Customer Analysis By Project: Displays projects where the project start date is on or before the selected month, including those with zero waybill volume.'
            }
          >
            {`Customer Analysis - Project`}
          </TooltipTitle>
        }
        borderTopLeftRadius={0}
        borderTopRightRadius={0}
      >
        <Flex vertical gap={8}>
          <div>
            <Text>{dataSource?.length}</Text>{' '}
            <Text type="secondary">total</Text>
          </div>

          <Table<IActiveProjectListRecord>
            rowKey="projectId"
            size="small"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 1500 }}
            bordered
          />
        </Flex>
      </CardView>
    </>
  );
};

export default AnalysisByProject;
