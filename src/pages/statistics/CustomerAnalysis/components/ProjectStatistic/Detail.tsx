import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  customerAnalysisActiveProjectList,
  customerAnalysisActiveProjectListExport,
} from '@/api/statistics';
import {
  IActiveProjectListParams,
  IActiveProjectListRecord,
  WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { EnumProjectStatisticActiveType, GetUserGuidanceEnum } from '@/enums';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import CardView from '@/pages/statistics/common/CardView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { doDownloadCenterAnimate } from '@/utils/animate';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
} from '@/utils/utils';
import { useModel, useSearchParams } from '@umijs/max';
import {
  Button,
  Flex,
  Form,
  Input,
  Space,
  Table,
  TableColumnsType,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const { Text } = Typography;

const ProjectStatisticDetail: FC = ({}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const [form] = Form.useForm();
  const nameValue = Form.useWatch('projectName', form);
  const [dataSource, setDataSource] = useState<IActiveProjectListRecord[]>([]);
  const [originDataSource, setOriginDataSource] = useState<
    IActiveProjectListRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const activeType = searchParams.get(
    'activeType',
  ) as EnumProjectStatisticActiveType;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType | null;
  const lastMonth = dayjs(yearMonth).subtract(1, 'month').format('YYYY-MM');
  const isLost = activeType === EnumProjectStatisticActiveType.LOST_PROJECT;

  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);
  const playStar = useAddAnimation(playSrcRef, playTargetRef);

  const playAnimation = () => {
    playStar(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const guidanceUpdateHandle = async () => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const fetchDataSource = async () => {
    const payload: IActiveProjectListParams = {
      startDate: dayjs(yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(yearMonth).endOf('month').format('YYYY-MM-DD 23:59:59'),
      projectActiveType: activeType,
      waybillTimeType: waybillTimeType || 'unloading',
    };

    if (!payload.startDate || !payload.endDate || !payload.projectActiveType) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await customerAnalysisActiveProjectList(payload).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginDataSource(res.data);
      setDataSource(res.data);
    }
  };

  const onSearch = useCallback(() => {
    const _nameValue = nameValue ?? '';
    // 过滤 dataSource ,包括大小写
    setDataSource(
      originDataSource.filter((item) => {
        return item?.projectName
          ?.toLowerCase()
          .includes(_nameValue?.toLowerCase());
      }),
    );
  }, [nameValue, originDataSource]);

  const onNameChange = useCallback(
    (name: string) => {
      const list = originDataSource.map((item) => {
        const { projectName } = item;
        const content = projectName.replace(
          new RegExp(name, 'gi'),
          (match) => `<span style="color: red;">${match}</span>`,
        );

        return {
          ...item,
          projectName: content,
        };
      });

      // 过滤 dataSource ,包括大小写
      setDataSource(list);
    },
    [originDataSource],
  );

  const onReset = useCallback(() => {
    form.resetFields();
    setDataSource(originDataSource);
  }, [originDataSource]);

  const doExport = async () => {
    const payload: IActiveProjectListParams = {
      startDate: dayjs(yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(yearMonth).endOf('month').format('YYYY-MM-DD 23:59:59'),
      projectActiveType: activeType,
      waybillTimeType: waybillTimeType || 'unloading',
    };

    if (!payload.startDate || !payload.endDate || !payload.projectActiveType) {
      console.error('params error');
      return;
    }

    setExportLoading(true);
    const res = await customerAnalysisActiveProjectListExport(payload).finally(
      () => {
        setExportLoading(false);
      },
    );

    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  };

  const buildColumnTitle = (title: string) => {
    return (
      <Flex vertical style={{ userSelect: 'none' }}>
        <span>{title}</span>
        <span>({isLost ? lastMonth : yearMonth})</span>
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
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            <span
              dangerouslySetInnerHTML={{ __html: record.projectName }}
            ></span>
          </CustomTooltip>
        );
      },
    },

    {
      title: buildColumnTitle('Waybill'),
      dataIndex: 'waybillNum',
      fixed: 'left',
      ellipsis: true,
      width: 150,
      sorter: (a, b) => a.waybillNum - b.waybillNum,
      render: (_, record) => {
        const num = formatAmount(record.waybillNum);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },

    {
      title: buildColumnTitle('Avg Daily Waybill'),
      dataIndex: 'avgWaybillNum',
      align: 'right',
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.avgWaybillNum - b.avgWaybillNum,
      render: (_, record) => {
        const num = formatAmount(record.avgWaybillNum);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: buildColumnTitle('Revenue'),
      dataIndex: 'revenue',
      align: 'right',
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (_, record) => {
        const num = formatAmountWithRound(record.revenue);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: buildColumnTitle('Cost'),
      dataIndex: 'cost',
      align: 'right',
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.cost - b.cost,
      render: (_, record) => {
        const num = formatAmountWithRound(record.cost);
        return <CustomTooltip title={num}>{num}</CustomTooltip>;
      },
    },
    {
      title: buildColumnTitle('Gross Profit'),
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
      title: buildColumnTitle('Gross Margin'),
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
  ];

  useEffect(() => {
    fetchDataSource();
  }, [searchParams]);

  useEffect(() => {
    if (nameValue) {
      onNameChange(nameValue);
    }
  }, [nameValue]);

  useEffect(() => {
    playTargetRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <Flex vertical gap={1}>
      <CardView
        title={
          isLost ? (
            <TooltipTitle
              tips={`Data for "Lost" customers shows last month's figures`}
            >
              {`${yearMonth} ${activeType}`}
            </TooltipTitle>
          ) : (
            <> {`${yearMonth} ${activeType}`}</>
          )
        }
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
      >
        <Form name="statistic-project-form" form={form} layout="inline">
          <Flex gap={24}>
            <Form.Item label={null} name="projectName">
              <Input
                placeholder="Project Name"
                allowClear
                style={{ width: '270px' }}
              />
            </Form.Item>

            <Space size={8}>
              <Button type="primary" onClick={onSearch}>
                Search
              </Button>
              <Button onClick={onReset}>Reset</Button>
            </Space>
          </Flex>
        </Form>
      </CardView>

      <CardView borderTopLeftRadius={0} borderTopRightRadius={0}>
        <Flex vertical gap={8}>
          <div>
            <Button
              ref={playSrcRef}
              loading={exportLoading}
              type="primary"
              onClick={() => {
                if (completedGuidance) {
                  doExport();
                } else {
                  playAnimation();
                  guidanceUpdateHandle();
                  doExport();
                }
              }}
            >
              Export
            </Button>
          </div>
          <TooltipTitle
            tips={
              'Sorting Rule: Sort by Waybill Volume in Descending Order by Default'
            }
          >
            <div>
              <Text>{dataSource?.length}</Text>{' '}
              <Text type="secondary">total</Text>
            </div>
          </TooltipTitle>

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
    </Flex>
  );
};

export default ProjectStatisticDetail;
