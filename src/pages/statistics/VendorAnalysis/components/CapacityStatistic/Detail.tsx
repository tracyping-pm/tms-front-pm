import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  vendorAnalysisCapacityStatisticVendorList,
  vendorAnalysisCapacityStatisticVendorListExport,
} from '@/api/statistics';
import {
  IVendorAnalysisCapacityStatisticVendorItem,
  IVendorAnalysisCapacityStatisticVendorListPayload,
  WaybillTimeType,
} from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import {
  EnumCapacityStatisticActiveType,
  GetUserGuidanceEnum,
  VendorStatusEnum,
  VendorStatusEnumColor,
} from '@/enums';
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
  Badge,
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

const Detail: FC = ({}) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const [form] = Form.useForm();
  const nameValue = Form.useWatch('name', form);
  const [dataSource, setDataSource] = useState<
    IVendorAnalysisCapacityStatisticVendorItem[]
  >([]);
  const [originDataSource, setOriginDataSource] = useState<
    IVendorAnalysisCapacityStatisticVendorItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const activeType = searchParams.get(
    'activeType',
  ) as EnumCapacityStatisticActiveType;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType;

  const lastMonth = dayjs(yearMonth).subtract(1, 'month').format('YYYY-MM');
  const isLost = activeType === EnumCapacityStatisticActiveType.LOST_VENDOR;

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
    const payload: IVendorAnalysisCapacityStatisticVendorListPayload = {
      yearMonth,
      activeType,
      waybillTimeType,
    };

    if (!payload.yearMonth || !payload.activeType) {
      console.error('params error');
      return;
    }

    setLoading(true);
    const res = await vendorAnalysisCapacityStatisticVendorList(
      payload,
    ).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginDataSource(res.data);
      setDataSource(res.data);
    }
  };

  const onSearch = useCallback(() => {
    if (nameValue) {
      // 过滤 dataSource ,包括大小写
      setDataSource(
        originDataSource.filter((item) => {
          return item.vendorName
            .toLowerCase()
            .includes(nameValue?.toLowerCase());
        }),
      );
    } else {
      setDataSource(originDataSource);
    }
  }, [nameValue, originDataSource]);

  const onNameChange = useCallback(
    (name: string) => {
      const list = dataSource.map((item) => {
        const { vendorName } = item;
        const content = vendorName.replace(
          new RegExp(name, 'gi'),
          (match) => `<span style="color: red;">${match}</span>`,
        );

        return {
          ...item,
          _vendorName: content,
        };
      });

      // 过滤 dataSource ,包括大小写
      setDataSource(list);
    },
    [dataSource],
  );

  const onReset = useCallback(() => {
    form.resetFields();
    setDataSource(originDataSource);
  }, [originDataSource]);

  const doExport = async () => {
    const payload = {
      yearMonth,
      activeType,
      waybillTimeType,
    };

    if (!payload.yearMonth || !payload.activeType) {
      console.error('params error');
      return;
    }

    setExportLoading(true);
    const res = await vendorAnalysisCapacityStatisticVendorListExport(
      payload,
    ).finally(() => {
      setExportLoading(false);
    });

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

  const columns: TableColumnsType<IVendorAnalysisCapacityStatisticVendorItem> =
    [
      {
        title: 'NO.',
        fixed: 'left',
        width: 50,
        render: (_, _record, index) => {
          return index + 1;
        },
      },
      {
        title: 'Vendor Name',
        dataIndex: 'vendorName',
        fixed: 'left',
        width: 200,
        ellipsis: true,
        render: (_, record) => {
          return (
            <CustomTooltip title={record.vendorName}>
              <span
                dangerouslySetInnerHTML={{
                  __html: record._vendorName ?? record.vendorName,
                }}
              />
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Procurement PIC',
        dataIndex: 'vendorPicName',
        ellipsis: true,
        width: 130,
        render: (_, record) => {
          return (
            <CustomTooltip title={record.vendorPicName}>
              {record.vendorPicName}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Vendor Type',
        dataIndex: 'vendorType',
        ellipsis: true,
        width: 130,
        render: (_, record) => {
          return (
            <CustomTooltip title={record.vendorType}>
              {record.vendorType}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Status',
        dataIndex: 'vendorStatus',
        ellipsis: true,
        width: 150,
        render: (_, record) => {
          const status: VendorStatusEnum = record.vendorStatus;
          const Content = (
            <Badge color={VendorStatusEnumColor[status]} text={status} />
          );
          return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
        },
      },
      {
        title: (
          <TooltipTitle tips="Aging (Month): The number of months from the month of the position date of the first abnormal/delivered waybill of the supplier's owned-Truck on Inteluck to the present.">
            Aging(Month)
          </TooltipTitle>
        ),
        dataIndex: 'aging',
        width: 130,
        ellipsis: true,
        render: (_, record) => {
          const num = formatAmount(record.aging);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: 'Self-owned Trucks',
        dataIndex: 'selfTruckCount',
        width: 150,
        ellipsis: true,
        render: (_, record) => {
          const num = formatAmount(record.selfTruckCount);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: 'Total Trucks',
        dataIndex: 'totalTruckCount',
        width: 100,
        ellipsis: true,
        render: (_, record) => {
          const num = formatAmount(record.totalTruckCount);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: buildColumnTitle('Waybill'),
        dataIndex: 'waybillCount',
        width: 100,
        ellipsis: true,
        sorter: (a, b) => a.waybillCount - b.waybillCount,
        render: (_, record) => {
          const num = formatAmount(record.waybillCount);
          return <CustomTooltip title={num}>{num}</CustomTooltip>;
        },
      },
      {
        title: buildColumnTitle('Revenue'),
        dataIndex: 'revenue',
        align: 'right',
        width: 100,
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
        width: 100,
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
          <TooltipTitle
            tips={
              'Sorting Rule: Sort by Number of Waybills in Descending Order'
            }
          >
            {`${yearMonth} ${activeType}`}
          </TooltipTitle>
        }
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
      >
        <Form name="capacity-vendor-form" form={form}>
          <Flex gap={24}>
            <Form.Item label={null} name="name" noStyle>
              <Input
                placeholder="Vendor Name"
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
          <div>
            <Text>{dataSource?.length}</Text>{' '}
            <Text type="secondary">total</Text>
          </div>

          <Table<IVendorAnalysisCapacityStatisticVendorItem>
            rowKey="vendorId"
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

export default Detail;
