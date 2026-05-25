import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  customerAnalysisActiveCustomerList,
  customerAnalysisActiveCustomerListExport,
} from '@/api/statistics';
import {
  IActiveCustomerListParams,
  IActiveCustomerListRecord,
  type WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { EnumCustomerStatisticActiveType, GetUserGuidanceEnum } from '@/enums';
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

const CustomerStatisticDetail: FC = ({}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const [form] = Form.useForm();
  const nameValue = Form.useWatch('customerName', form);
  const [dataSource, setDataSource] = useState<IActiveCustomerListRecord[]>([]);
  const [originDataSource, setOriginDataSource] = useState<
    IActiveCustomerListRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const activeType = searchParams.get(
    'activeType',
  ) as EnumCustomerStatisticActiveType;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType | null;
  const lastMonth = dayjs(yearMonth).subtract(1, 'month').format('YYYY-MM');
  const isLost = activeType === EnumCustomerStatisticActiveType.LOST_CUSTOMER;

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
    const payload: IActiveCustomerListParams = {
      startDate: dayjs(yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(yearMonth).endOf('month').format('YYYY-MM-DD 23:59:59'),
      customerActiveType: activeType,
      waybillTimeType: waybillTimeType || 'unloading',
    };

    if (!payload.startDate || !payload.endDate || !payload.customerActiveType) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await customerAnalysisActiveCustomerList(payload).finally(
      () => {
        setLoading(false);
      },
    );

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
        return item?.customerName
          ?.toLowerCase()
          .includes(_nameValue?.toLowerCase());
      }),
    );
  }, [nameValue, originDataSource]);

  const onNameChange = useCallback(
    (name: string) => {
      const list = originDataSource.map((item) => {
        const { customerName } = item;
        const content = customerName.replace(
          new RegExp(name, 'gi'),
          (match) => `<span style="color: red;">${match}</span>`,
        );

        return {
          ...item,
          customerName: content,
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
    const payload: IActiveCustomerListParams = {
      startDate: dayjs(yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(yearMonth).endOf('month').format('YYYY-MM-DD 23:59:59'),
      customerActiveType: activeType,
      waybillTimeType: waybillTimeType || 'unloading',
    };

    if (!payload.startDate || !payload.endDate || !payload.customerActiveType) {
      console.error('params error');
      return;
    }

    setExportLoading(true);
    const res = await customerAnalysisActiveCustomerListExport(payload).finally(
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

  const columns: TableColumnsType<IActiveCustomerListRecord> = [
    {
      title: 'No.',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      fixed: 'left',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            <span
              dangerouslySetInnerHTML={{ __html: record.customerName }}
            ></span>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer PIC(BD)',
      dataIndex: 'bdName',
      fixed: 'left',
      ellipsis: true,
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.bdName}>{record.bdName}</CustomTooltip>
        );
      },
    },
    {
      title: 'Customer PIC(CAM)',
      dataIndex: 'camName',
      fixed: 'left',
      ellipsis: true,
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.camName}>{record.camName}</CustomTooltip>
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
        <Form name="statistic-customer-form" form={form} layout="inline">
          <Flex gap={24}>
            <Form.Item label={null} name="customerName">
              <Input
                placeholder="Customer Name"
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

          <Table<IActiveCustomerListRecord>
            rowKey="customerId"
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

export default CustomerStatisticDetail;
