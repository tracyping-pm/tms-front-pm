import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  arStatisticOverview,
  arStatisticOverviewDownload,
  arStatisticOverviewIndependentDownload,
  arStatisticOverviewTripsNumDownload,
} from '@/api/billing';
import {
  IArStatisticOverviewKeyDownloadPayload,
  IArStatisticOverviewPayload,
  IArStatisticOverviewResp,
  IStatisticOverviewDataItem,
} from '@/api/types/billing';
import { CURRENCY_SYMBOL } from '@/constants';
import { CountryMapEnum, CurrencyNameEnum, GetUserGuidanceEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { formatAmount } from '@/utils/utils';
import {
  ArrowsAltOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  ShrinkOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Access, useAccess, useModel } from '@umijs/max';
import { useFullscreen } from 'ahooks';
import {
  Button,
  DatePicker,
  Divider,
  Space,
  Table,
  TimeRangePickerProps,
  Tooltip,
} from 'antd';
import cls from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import BaseCell from '../components/BaseCell';
import styles from './index.less';

const { Column, ColumnGroup } = Table;
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const rangePresets: TimeRangePickerProps['presets'] = [
  {
    label: 'Current Month',
    value: [dayjs().startOf('month'), dayjs()],
  },
  {
    label: 'Current Quarter',
    value: [
      dayjs()
        .month(Math.floor(dayjs().month() / 3) * 3)
        .startOf('month'),
      dayjs(),
    ],
  },
  {
    label: 'Current Year',
    value: [dayjs().startOf('year'), dayjs()],
  },
];

// @ts-ignore
const defaultDayjsDate: [Dayjs, Dayjs] = rangePresets[0].value;

const defaultRange: IArStatisticOverviewPayload = {
  startDate: defaultDayjsDate[0]?.format(dateFormat),
  endDate: defaultDayjsDate[1]?.format(dateFormat),
};

const Overview: FC = () => {
  const access = useAccess();
  const { initialState: userInfo, setInitialState: setUserInfo } =
    useModel('@@initialState');
  const completedGuidance =
    userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const countryId = userInfo?.currentUser?.countryId;
  const isTH = countryId === CountryMapEnum.Thailand;
  const currencySymbol = isTH
    ? CURRENCY_SYMBOL[CurrencyNameEnum.BAHT]
    : CURRENCY_SYMBOL[CurrencyNameEnum.PESO];

  const [rangeValue, setRangValue] = useState<any>(defaultDayjsDate);
  const [dataSource, setDataSource] = useState<IStatisticOverviewDataItem[]>(
    [],
  );
  const [dataOrigin, setDataOrigin] = useState<IArStatisticOverviewResp>();
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [recordDownloading, setRecordDownloading] = useState<boolean>(false);
  const [recordActive, setRecordActive] =
    useState<IStatisticOverviewDataItem>();

  const containerRef = useRef(null);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(containerRef, {
    pageFullscreen: { zIndex: 800 },
  });

  // 用户引导
  const downloadRef = useRef<any>(null);
  const exportRef = useRef<any>(null);

  const animation = useAddAnimation(exportRef, downloadRef);

  const playAnimation = () => {
    animation(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const guidanceUpdateHandle = async () => {
    await setUserInfo((s) => ({
      ...s,
      currentUser: {
        ...userInfo?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const doDownload = useCallback(
    async (payload: { startDate: string; endDate: string }) => {
      setDownloading(true);
      const res = await arStatisticOverviewDownload(payload).finally(() => {
        setDownloading(false);
      });

      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [rangeValue],
  );

  const onNumOfTripsClick = useCallback(
    async (record: IStatisticOverviewDataItem) => {
      setRecordActive(record);
      const [star, end] = rangeValue;
      if (!star || !end) {
        return;
      }

      const payload: IArStatisticOverviewKeyDownloadPayload = {
        startDate: star.format(dateFormat),
        endDate: end.format(dateFormat),
        key: record.key,
      };
      setRecordDownloading(true);
      const res = await arStatisticOverviewTripsNumDownload(payload).finally(
        () => {
          setRecordDownloading(false);
        },
      );
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [rangeValue],
  );

  const onIndependentAmountClick = useCallback(
    async (record: IStatisticOverviewDataItem) => {
      setRecordActive(record);
      const [star, end] = rangeValue;
      if (!star || !end) {
        return;
      }

      const payload: IArStatisticOverviewKeyDownloadPayload = {
        startDate: star.format(dateFormat),
        endDate: end.format(dateFormat),
        key: record.key,
      };
      setRecordDownloading(true);
      const res = await arStatisticOverviewIndependentDownload(payload).finally(
        () => {
          setRecordDownloading(false);
        },
      );
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [rangeValue],
  );

  const goDownloadCenter = useCallback(() => {
    const [star, end] = rangeValue;
    if (!star || !end) {
      return;
    }

    const payload = {
      startDate: star.format(dateFormat),
      endDate: end.format(dateFormat),
    };

    if (completedGuidance) {
      doDownload(payload);
    } else {
      playAnimation();
      guidanceUpdateHandle();
      setTimeout(() => {
        doDownload(payload);
      }, 3000);
    }
  }, [completedGuidance, rangeValue]);

  const format = (value?: number | null) => {
    if (value === undefined) {
      return '';
    }
    if (value === null) {
      return '-';
    }
    return formatAmount(value);
  };

  const formatTax = (value?: number | null) => {
    if (value === null) {
      return '-';
    }
    return format(value);
  };

  const onRangeChange = (dates: (Dayjs | null)[], dateStrings: string[]) => {
    if (dates) {
      console.log('From: ', dates[0], ', to: ', dates[1]);
      console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
      setRangValue(dates);
    } else {
      console.log('Clear');
      setRangValue([null, null]);
    }
  };

  const fetchData = async (payload?: IArStatisticOverviewPayload) => {
    setLoading(true);
    const res = await arStatisticOverview({
      ...defaultRange,
      ...payload,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDataOrigin(res.data);
      const { dataList, totalData } = res.data;
      setDataSource([...dataList, totalData]);
    }
  };

  const fetchDataByRangeValue = useCallback(() => {
    const [star, end] = rangeValue;
    const payload = {
      startDate: star?.format(dateFormat),
      endDate: end?.format(dateFormat),
    };
    fetchData(payload);
  }, [rangeValue]);

  useEffect(() => {
    fetchDataByRangeValue();
  }, [rangeValue]);

  useEffect(() => {
    // 获取下载组件
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <div className={cls('overview', styles.overview)} ref={containerRef}>
        <Table<IStatisticOverviewDataItem>
          title={() => (
            <div className="table-title">
              <div className="table-title-main">
                <h3>
                  AR Overview{' '}
                  <Tooltip
                    title={
                      <ul>
                        <li>
                          Amount = Contract Revenue + Miscellaneous Charge +
                          Claim + Reimbursement Expense + VAT + WHT
                        </li>
                        <li>Independent Statement Amount = Unlinked waybill</li>
                      </ul>
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </h3>
                <Space>
                  <RangePicker
                    disabledDate={(currentDate) => {
                      return currentDate?.isAfter(dayjs(), 'day');
                    }}
                    presets={rangePresets}
                    value={rangeValue}
                    // @ts-ignore
                    onChange={onRangeChange}
                    allowClear={false}
                  />
                  <Space size={0} split={<Divider type="vertical" />}>
                    <Access
                      accessible={
                        access[
                          PermissionEnum
                            .AR_STATEMENT_STATISTIC_OVERVIEW_DOWNLOAD
                        ]
                      }
                    >
                      <Button
                        ref={exportRef}
                        icon={<DownloadOutlined />}
                        color="default"
                        variant="link"
                        loading={downloading}
                        onClick={() => goDownloadCenter()}
                      />
                    </Access>

                    <Button
                      icon={<SyncOutlined />}
                      color="default"
                      variant="link"
                      onClick={() => fetchDataByRangeValue()}
                    />
                  </Space>
                </Space>
              </div>
              <div className="table-title-extra">
                <Button
                  icon={
                    isFullscreen ? <ShrinkOutlined /> : <ArrowsAltOutlined />
                  }
                  color="default"
                  variant="link"
                  style={{ fontSize: '20px' }}
                  onClick={() => toggleFullscreen()}
                />
              </div>
            </div>
          )}
          dataSource={dataSource}
          loading={loading}
          bordered
          scroll={{ x: 'max-content' }}
          size="small"
          pagination={false}
          className="overview-table"
          rowClassName={(record) => {
            if (record.key === 'total') {
              return 'total-row';
            }
            return '';
          }}
        >
          <Column
            key="Trips Delivery Status"
            title="Trips Delivery Status"
            width={140}
            align="center"
            fixed="left"
            onCell={(_record, rowIndex) => {
              if (rowIndex === 0) {
                return {
                  rowSpan: 1,
                  colSpan: 1,
                };
              }
              if (rowIndex === 1) {
                return {
                  rowSpan: 9,
                };
              }
              if (rowIndex === 10) {
                return {
                  colSpan: 4,
                };
              }
              return {
                rowSpan: 0,
                colSpan: 0,
              };
            }}
            render={(_value, _record, rowIndex) => {
              if (rowIndex === 0) {
                return (
                  <div>
                    <div>Pending/In Transit</div>
                    <div>({dataOrigin?.beforeFinProportion}%)</div>
                  </div>
                );
              }
              if (rowIndex === 1) {
                return (
                  <div>
                    <div>Delivered/Abnormal</div>
                    <div>({dataOrigin?.afterFinProportion}%)</div>
                  </div>
                );
              }
              if (rowIndex === 10) {
                return (
                  <BaseCell
                    data-title="Total"
                    style={{ backgroundColor: '#fafafa', fontWeight: 'bolder' }}
                  />
                );
              }
              return null;
            }}
          />
          <ColumnGroup key="AR Status" title="AR Status" align="center">
            <ColumnGroup key="Status" title="Status" align="center" rowSpan={2}>
              <Column
                rowSpan={0}
                fixed="left"
                width={70}
                onCell={(_record, rowIndex) => {
                  if (rowIndex === 0) {
                    return {
                      colSpan: 3,
                    };
                  }
                  if (rowIndex === 1) {
                    return {
                      rowSpan: 5,
                    };
                  }
                  if (rowIndex === 6) {
                    return {
                      rowSpan: 4,
                    };
                  }
                  return { rowSpan: 0, colSpan: 0 };
                }}
                render={(_value, _record, rowIndex) => {
                  if (rowIndex === 0) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#F0F5FF' }}
                        data-title="Pending Revenue"
                      />
                    );
                  }
                  if (rowIndex === 1) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Unbilled"
                      />
                    );
                  }
                  if (rowIndex === 6) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="Billed"
                      />
                    );
                  }
                  return null;
                }}
              />
              <Column
                rowSpan={0}
                fixed="left"
                width={220}
                onCell={(_record, rowIndex) => {
                  if (rowIndex === 1) {
                    return {
                      rowSpan: 3,
                    };
                  }
                  if (rowIndex === 4 || rowIndex === 5) {
                    return {
                      rowSpan: 1,
                      colSpan: 1,
                    };
                  }

                  if (rowIndex === 6 || rowIndex === 8) {
                    return {
                      rowSpan: 2,
                      colSpan: 1,
                    };
                  }

                  return { rowSpan: 0, colSpan: 0 };
                }}
                render={(_value, _record, rowIndex) => {
                  if (rowIndex === 1) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Under Billing Preparation"
                      />
                    );
                  }
                  if (rowIndex === 4) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Awaiting For Customer Confirmation"
                      />
                    );
                  }
                  if (rowIndex === 5) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Awaiting For Re-bill"
                      />
                    );
                  }
                  if (rowIndex === 6) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="UnCollected"
                      />
                    );
                  }

                  if (rowIndex === 8) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="Collected"
                      />
                    );
                  }
                  return null;
                }}
              />
              <Column
                rowSpan={0}
                fixed="left"
                width={154}
                onCell={(_record, rowIndex) => {
                  if (rowIndex === 0 || rowIndex === 10) {
                    return {
                      rowSpan: 0,
                      colSpan: 0,
                    };
                  }

                  return {};
                }}
                render={(_value, _record, rowIndex) => {
                  if (rowIndex === 1) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Under Documentation"
                      />
                    );
                  }
                  if (rowIndex === 2) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Under Pricing"
                      />
                    );
                  }
                  if (rowIndex === 3 || rowIndex === 4 || rowIndex === 5) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#FFCCC7' }}
                        data-title="Under Billing"
                      />
                    );
                  }
                  if (rowIndex === 6) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="Under Due"
                      />
                    );
                  }
                  if (rowIndex === 7) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="Over Due"
                      />
                    );
                  }
                  if (rowIndex === 8) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="Write off"
                      />
                    );
                  }
                  if (rowIndex === 9) {
                    return (
                      <BaseCell
                        style={{ backgroundColor: '#D9F7BE' }}
                        data-title="Collected"
                      />
                    );
                  }
                  return null;
                }}
              />
            </ColumnGroup>

            <Column
              key="numOfTrips"
              title="No. of Trips"
              align="center"
              width={80}
              dataIndex="numOfTrips"
              render={(value, record: IStatisticOverviewDataItem) => {
                if (record.key === 'total') {
                  return (
                    <span
                      style={{
                        fontWeight: 'bolder',
                      }}
                    >
                      {formatAmount(value)}
                    </span>
                  );
                }
                return (
                  <Button
                    color="primary"
                    variant="link"
                    loading={
                      recordDownloading && recordActive?.key === record.key
                    }
                    onClick={() => onNumOfTripsClick(record)}
                  >
                    {formatAmount(value)}
                  </Button>
                );
              }}
            />
            <Column
              key="amount"
              title={`Amount (${currencySymbol})`}
              align="right"
              width={100}
              dataIndex="amount"
              render={(value, record: IStatisticOverviewDataItem) => {
                if (record.key === 'total') {
                  return (
                    <span style={{ fontWeight: 'bolder' }}>
                      {format(value)}
                    </span>
                  );
                }
                return format(value);
              }}
            />
            <ColumnGroup key="Amount" title="Amount" align="center">
              <Column
                key="contractRevenue"
                title={`Contract Revenue (${currencySymbol})`}
                align="right"
                width={150}
                dataIndex="contractRevenue"
                render={(value, record: IStatisticOverviewDataItem) => {
                  if (record.key === 'total') {
                    return (
                      <span style={{ fontWeight: 'bolder' }}>
                        {format(value)}
                      </span>
                    );
                  }
                  return format(value);
                }}
              />
              <Column
                key="miscellaneousCharge"
                title={`Miscellaneous Charge (${currencySymbol})`}
                align="right"
                width={170}
                dataIndex="miscellaneousCharge"
                render={(value, record: IStatisticOverviewDataItem) => {
                  if (record.key === 'total') {
                    return (
                      <span style={{ fontWeight: 'bolder' }}>
                        {format(value)}
                      </span>
                    );
                  }
                  return format(value);
                }}
              />
              <Column
                key="vat"
                title={`VAT (${currencySymbol})`}
                align="right"
                width={80}
                dataIndex="vat"
                render={(value, record: IStatisticOverviewDataItem) => {
                  if (record.key === 'total') {
                    return (
                      <span style={{ fontWeight: 'bolder' }}>
                        {formatTax(value)}
                      </span>
                    );
                  }
                  return formatTax(value);
                }}
              />
              <Column
                key="wht"
                title={`WHT (${currencySymbol})`}
                align="right"
                width={80}
                dataIndex="wht"
                render={(value, record: IStatisticOverviewDataItem) => {
                  if (record.key === 'total') {
                    return (
                      <span style={{ fontWeight: 'bolder' }}>
                        {formatTax(value)}
                      </span>
                    );
                  }
                  return formatTax(value);
                }}
              />
              <Column
                key="claim"
                title={`Claim (${currencySymbol})`}
                align="right"
                width={80}
                dataIndex="claim"
                render={(value, record: IStatisticOverviewDataItem) => {
                  if (record.key === 'total') {
                    return (
                      <span style={{ fontWeight: 'bolder' }}>
                        {format(value)}
                      </span>
                    );
                  }
                  return format(value);
                }}
              />
              <Column
                key="reimbursementExpense"
                title={`Reimbursement Expense (${currencySymbol})`}
                align="right"
                width={200}
                dataIndex="reimbursementExpense"
                render={(value, record: IStatisticOverviewDataItem) => {
                  if (record.key === 'total') {
                    return (
                      <span style={{ fontWeight: 'bolder' }}>
                        {format(value)}
                      </span>
                    );
                  }
                  return format(value);
                }}
              />
            </ColumnGroup>
            <Column
              key="independentAmount"
              title={`Independent Statement Amount (${currencySymbol})`}
              align="right"
              width={100}
              dataIndex="independentAmount"
              render={(value, record: IStatisticOverviewDataItem) => {
                if (record.key === 'total') {
                  return (
                    <span style={{ fontWeight: 'bolder' }}>
                      {format(value)}
                    </span>
                  );
                }
                if (value === null) {
                  return '-';
                }
                return (
                  <Button
                    color="primary"
                    variant="link"
                    loading={
                      recordDownloading && recordActive?.key === record.key
                    }
                    onClick={() => onIndependentAmountClick(record)}
                  >
                    {format(value)}
                  </Button>
                );
              }}
            />
          </ColumnGroup>
        </Table>
      </div>
    </>
  );
};

export default Overview;
