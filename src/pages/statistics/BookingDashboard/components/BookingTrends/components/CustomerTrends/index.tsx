import { bookingTrendsByCustomer } from '@/api/statistics';
import {
  IBookingCustomerWaybillRecord,
  IBookingTrendsByCustomerRecord,
} from '@/api/types/statistics';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { CustomerStatusEnum, CustomerStatusEnumColor } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { useSize } from 'ahooks';
import { Badge, Spin } from 'antd';
import { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import { BookingTrendsTypeEnum } from '../..';
import Title from '../../../Title';
import styles from './index.less';

let emphasisStyle = {
  showSymbol: true,

  itemStyle: {
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.3)',
  },
};
export default function CustomerTrends({
  dateType,
  dateRange,
  selectedCustomer,
}: {
  dateType: BookingTrendsTypeEnum;
  dateRange: Dayjs[];
  selectedCustomer: IBookingCustomerWaybillRecord;
}) {
  const [sourceData, setSourceData] = useState<any>();
  const [loading, setLoading] = useState(false);

  const customerTrendsRef = useRef(null);
  const size = useSize(customerTrendsRef);
  const customerTrendsLineRef = useRef<HTMLDivElement>(null);
  const customerTrendsChartRef = useRef<echarts.ECharts | null>(null);

  const resizeAll = () => {
    customerTrendsChartRef.current?.resize();
  };

  const formatList = (obj: IBookingTrendsByCustomerRecord) => {
    const mouthDate: string[] = [];
    const delivered: number[] = [];
    const committed: number[] = [];

    obj?.trendsVo?.forEach((item) => {
      mouthDate.push(item.mouthDate);
      delivered.push(item.delivered!);
      committed.push(item.committed!);
    });

    const _customerInfoList = {
      customerName: obj?.customerName,
      customerStatus: obj?.customerStatus,
      bdPic: obj?.bdPic,
      camPic: obj?.camPic,
      projectNum: obj?.projectNum,
      committedWaybill: obj?.committedWaybill,
      deliveredWaybill: obj?.deliveredWaybill,
      completionRate: obj?.completionRate,
    };
    return {
      mouthDate,
      delivered,
      committed,
      customerInfoList: [_customerInfoList],
    };
  };

  const initEcharts = (data: any) => {
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255)',
      },
      legend: {
        icon: 'circle',
        data: ['Total Delivered', 'Total Committed'],
      },
      grid: {
        top: 26,
        left: 20,
        right: 40,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data?.mouthDate,
        axisLabel: {
          interval: 'auto',
          // interval: function (index, value) {
          //   const maxCount = 10;
          //   const step = Math.ceil(data?.mouthDate.length / maxCount);
          //   return index % step === 0;
          // },
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ccc', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'value',
      },

      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          startValue: 0,
          endValue: 11,
          height: 20,
          bottom: 5,
          brushSelect: false,
        },
      ],

      series: [
        {
          color: '#009688',
          name: 'Total Delivered',
          type: 'line',
          data: data?.delivered || [],
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          emphasis: emphasisStyle,

          lineStyle: {
            width: 1.5,
          },
          areaStyle: { color: 'rgba(0, 150, 136, 0.40)' },
        },
        {
          color: '#FA8C16',
          name: 'Total Committed',
          type: 'line',
          data: data?.committed || [],
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          emphasis: emphasisStyle,

          lineStyle: {
            width: 1.5,
          },
          areaStyle: { color: 'rgba(242, 133, 50, 0.40)' },
        },
      ],
    };
    customerTrendsChartRef.current = echarts.init(
      customerTrendsLineRef.current as HTMLDivElement,
    );
    customerTrendsChartRef.current?.setOption(option, true);
    resizeAll();
  };

  const init = async () => {
    const payload = {
      customerId: selectedCustomer?.customerId,
      timeRange: dateType === BookingTrendsTypeEnum.byDay ? 1 : 2,
      startDate: dateRange[0].format('YYYY-MM-DD 00:00:00'),
      endDate: dateRange[1].format('YYYY-MM-DD 23:59:59'),
    };
    setLoading(true);
    const res = await bookingTrendsByCustomer(payload).finally(() => {
      setLoading(false);
    });

    if (res?.code === 200) {
      const _data = formatList(res.data);
      setSourceData(_data);
      initEcharts(_data);
    }
  };

  useEffect(() => {
    if (!selectedCustomer) {
      const _data = formatList({} as IBookingTrendsByCustomerRecord);
      setSourceData(_data);
      initEcharts(_data);
      return;
    }
    init();
  }, [selectedCustomer, dateRange]);

  useEffect(() => {
    resizeAll();
  }, [size]);

  const columns: ProColumns[] = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'customerStatus',

      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const status: CustomerStatusEnum = record.customerStatus;
        const Content = (
          <Badge color={CustomerStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'BD PIC',
      dataIndex: 'bdPic',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.bdPic}>{record.bdPic}</CustomTooltip>
        );
      },
    },
    {
      title: 'CAM / PIC',
      dataIndex: 'camPic',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.camPic}>{record.camPic}</CustomTooltip>
        );
      },
    },
    {
      title: 'Project',
      dataIndex: 'projectNum',

      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectNum}>
            {record.projectNum}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Committed Waybill',
      dataIndex: 'committedWaybill',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const committedWaybill = record.committedWaybill;
        return (
          <CustomTooltip title={formatAmount(committedWaybill)}>
            {formatAmount(committedWaybill)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Delivered Waybill',
      dataIndex: 'deliveredWaybill',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const deliveredWaybill = record.deliveredWaybill;
        return (
          <CustomTooltip title={formatAmount(deliveredWaybill)}>
            {formatAmount(deliveredWaybill)}
          </CustomTooltip>
        );
      },
    },
    {
      title: (
        <>
          Completion Rate{' '}
          <CustomTooltip
            title="Completion Rate=Total Delivered / Total Committed"
            placement="top"
          >
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />
          </CustomTooltip>
        </>
      ),

      dataIndex: 'completionRate',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const completionRate = record.completionRate;
        return (
          <CustomTooltip title={completionRate}>
            {completionRate}%
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <div className={styles.content}>
      <div className={styles.customerTrendsLineMain} ref={customerTrendsRef}>
        <Title
          title={
            <span className={styles.title}>
              Customer Trends(Committed vs Delivered)
            </span>
          }
          // containerRef={containerRef}
          // showFullScreen={true}
          extra={
            <span className={styles.customerName}>
              {selectedCustomer?.customerName ?? '-'}
            </span>
          }
        />
        <Spin spinning={loading}>
          <div className={styles.customerTrendsLine}>
            <div
              ref={customerTrendsLineRef}
              style={{ width: '100%', height: '320px' }}
            />
          </div>
        </Spin>
      </div>
      <div className={styles.customerTrendsTable}>
        <CustomTable
          columns={columns}
          dataSource={sourceData?.customerInfoList || []}
          pagination={false}
          toolBarRender={false}
          loading={loading}
          manualRequest
          search={false}
          bordered
          fixedSpin={false}
        />
      </div>
    </div>
  );
}
