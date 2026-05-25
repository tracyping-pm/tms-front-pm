import { quotedPriceStatistics, quotedPriceWaybillList } from '@/api/tool';
import { IQuotedPriceStatisticsParams } from '@/api/types/tool';
import CommonTitle from '@/components/CommonTitle';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, LAYOUT_HEADER_HEIGHT } from '@/constants';
import { CountryCurrencyEnumText, WaybillDispatchTypeEnum } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Col, Row, Skeleton, Tag } from 'antd';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useRef, useState } from 'react';
import BasicAmountStatistics from '../BasicAmountStatistics';
import styles from './index.less';

interface ISearchResults {
  searchData: IQuotedPriceStatisticsParams;
}
export default function SearchResults({ searchData }: ISearchResults) {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;

  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [receivableStatistics, setReceivableStatistics] = useState<
    { label: ReactNode; value: string }[]
  >([]);
  const [payableStatistics, setPayableStatistics] = useState<
    { label: ReactNode; value: string }[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  const formRef = useRef<ProFormInstance>();

  const getStatisticsSource = async () => {
    setLoading(true);
    const res = await quotedPriceStatistics({
      ...searchData,
      priceLevel: 'V1',
    });
    setLoading(false);
    if (res.code === 200) {
      const symbol = CountryCurrencyEnumText[countryId as number];
      const statistics = res.data?.map((item) => [
        {
          label: 'Maximum',
          value:
            typeof item.max === 'number'
              ? `${symbol} ${formatAmount(item.max)}`
              : '-',
        },
        {
          label: 'Minimum',
          value:
            typeof item.min === 'number'
              ? `${symbol} ${formatAmount(item.min)}`
              : '-',
        },
        {
          label: 'Median',
          value:
            typeof item.median === 'number'
              ? `${symbol} ${formatAmount(item.median)}`
              : '-',
        },
        {
          label: '80th Percentile',
          value:
            typeof item.percentile === 'number'
              ? `${symbol} ${formatAmount(item.percentile)}`
              : '-',
        },
        {
          label: 'Mean',
          value:
            typeof item.mean === 'number'
              ? `${symbol} ${formatAmount(item.mean)}`
              : '-',
        },
        {
          label: (
            <>
              Standard Deviation{' '}
              <CustomTooltip
                titleMaxWidth={290}
                title={
                  'A larger standard deviation indicates greater spread of data points from the average, while a smaller value shows data is more tightly clustered around the mean.'
                }
                placement="top"
              >
                <QuestionCircleOutlined />
              </CustomTooltip>{' '}
            </>
          ),
          value: `${item.standardDeviation}`,
        },
      ]);
      setReceivableStatistics(statistics?.[0] ?? []);
      setPayableStatistics(statistics?.[1] ?? []);
    }
  };
  const getWaybillSource = async (prams: any) => {
    setLoading(true);
    const res = await quotedPriceWaybillList({ ...prams, priceLevel: 'V1' });
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    await getWaybillSource({ ...searchData, ...params });
  };

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      key: 'waybillNumber',
      ellipsis: { showTitle: false },
      fixed: 'left',
      render: (_, record) => {
        return (
          <CustomTooltip title={record.waybillNumber}>
            {record.waybillNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Dispatch Type',
      dataIndex: 'dispatchType',
      key: 'dispatchType',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = (
          <Tag
            color={
              record.dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH
                ? 'blue'
                : 'green'
            }
          >
            {record.dispatchType}
          </Tag>
        );
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Basic Amount Receivable',
      dataIndex: 'basicAmountReceivable',
      key: 'basicAmountReceivable',
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { basicAmountReceivable } = record;
        const content =
          typeof basicAmountReceivable === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(basicAmountReceivable)}`
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Basic Amount Receivable/km',
      dataIndex: 'basicAmountReceivableKm',
      key: 'basicAmountReceivableKm',
      width: 240,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { basicAmountReceivableKm } = record;
        const content =
          typeof basicAmountReceivableKm === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(basicAmountReceivableKm)}`
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Basic Amount Payable',
      dataIndex: 'basicAmountPayable',
      key: 'basicAmountPayable',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { basicAmountPayable } = record;
        const content =
          typeof basicAmountPayable === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(basicAmountPayable)}`
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Basic Amount Payable/km',
      dataIndex: 'basicAmountPayableKm',
      key: 'basicAmountPayableKm',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { basicAmountPayableKm } = record;
        const content =
          typeof basicAmountPayableKm === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(basicAmountPayableKm)}`
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Route Distance (km)',
      dataIndex: 'distance',
      key: 'routeDistance',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { distance } = record;
        const content =
          typeof distance === 'number' ? formatAmount(distance) + ' km' : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossProfit',
      key: 'grossProfit',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { grossProfit } = record;
        const content =
          typeof grossProfit === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(grossProfit)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Gross Margin',
      dataIndex: 'grossMargin',
      key: 'grossMargin',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const { grossMargin } = record;
        const content =
          typeof grossMargin === 'number'
            ? `${formatAmount(grossMargin)}%`
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },

    {
      title: 'Customer Requested Truck Type',
      dataIndex: 'requiredTruckTypeName',
      key: 'requiredTruckTypeName',
      width: 250,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.requiredTruckTypeName;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Actual Use Truck Type',
      dataIndex: 'actualTruckTypeName',
      key: 'actualTruckTypeName',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.actualTruckTypeName;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.projectName;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.customerName;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Vendor',
      dataIndex: 'vendorName',
      key: 'vendorName',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.vendorName;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Industry',
      dataIndex: 'industryName',
      key: 'industryName',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.industryName;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Requirement Frequency',
      dataIndex: 'requirementFrequency',
      key: 'requirementFrequency',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.requirementFrequency;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Origin',
      dataIndex: 'originRegion',
      key: 'originRegion',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = `${record.originRegion} ${record.originAddress}`;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = `${record.destinationRegion} ${record.destinationAddress}`;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Position Time',
      dataIndex: 'positionTime',
      key: 'positionTime',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const content = record.positionTime
          ? dayjs(record.positionTime).format('YYYY-MM-DD HH:mm:ss')
          : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
  ];

  useEffect(() => {
    const payload = { ...searchData, pageNum: 1, pageSize: 20 };
    getWaybillSource(payload);
    getStatisticsSource();
  }, [searchData]);

  return (
    <>
      <CommonTitle
        title={
          <>
            Delivered Trips
            <span className={styles.billingMode}>
              * Sort by position time (descending)
            </span>
          </>
        }
      />
      <Row gutter={[24, 0]}>
        <Col span={12}>
          <Skeleton loading={loading}>
            <BasicAmountStatistics
              title="Basic Amount Receivable Statistics"
              statistics={receivableStatistics}
            />
          </Skeleton>
        </Col>
        <Col span={12}>
          <Skeleton loading={loading}>
            <BasicAmountStatistics
              title="Basic Amount Payable Statistics"
              statistics={payableStatistics}
            />
          </Skeleton>
        </Col>

        <Col span={24}>
          <CustomTable
            className={'priceToolTable'}
            columns={columns}
            scroll={{ x: 4000 }}
            formRef={formRef}
            dataSource={originData.list}
            fixedSpin={false}
            form={{
              name: 'price-tool-table-list',
            }}
            pagination={{
              showSizeChanger: true,
              current: originData.pageNum,
              pageSize: originData.pageSize,
              total: originData.total,
              onChange: (page: number, pageSize: number) => {
                onPaginationChange({ pageNum: page, pageSize: pageSize });
              },
            }}
            search={false}
            loading={loading}
            toolBarRender={false}
            manualRequest
            filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
          />
        </Col>
      </Row>
    </>
  );
}
