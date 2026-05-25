import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  arStatisticBreakdownByMonth,
  arStatisticBreakdownByMonthDownload,
  arStatisticBreakdownByMonthTripsNumDownload,
} from '@/api/billing';
import {
  IArStatisticBreakdownByMonthResp,
  IStatisticBreakdownByMonthDataItem,
} from '@/api/types/billing';
import { CURRENCY_SYMBOL } from '@/constants';
import { CountryMapEnum, CurrencyNameEnum, GetUserGuidanceEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { formatAmount, formatAmountPercentage } from '@/utils/utils';
import {
  ArrowsAltOutlined,
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  InfoCircleOutlined,
  ShrinkOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Access, useAccess, useModel } from '@umijs/max';
import { useFullscreen } from 'ahooks';
import { Button, DatePicker, Divider, Space, Table, Tooltip } from 'antd';
import cls from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import BaseCell from '../components/BaseCell';
import styles from './index.less';

const { Column, ColumnGroup } = Table;
const dateFormat = 'YYYY';
const defaultDayjsDate: Dayjs = dayjs().startOf('year');
const defaultDate = {
  year: defaultDayjsDate?.format(dateFormat),
};

const BreakdownByMonth: FC = () => {
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
  const [dateValue, setDateValue] = useState<Dayjs>(defaultDayjsDate);
  const [dataSource, setDataSource] = useState<
    IStatisticBreakdownByMonthDataItem[]
  >([]);
  const [dataOrigin, setDataOrigin] =
    useState<IArStatisticBreakdownByMonthResp>();
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [recordDownloading, setRecordDownloading] = useState<boolean>(false);
  const [recordActive, setRecordActive] =
    useState<IStatisticBreakdownByMonthDataItem>();
  const [recordActiveKey, setRecordActiveKey] = useState<string>();
  const [totalUnbilledExpand, setTotalUnbilledExpand] = useState<boolean>(true);
  const [totalBilledExpand, setTotalBilledExpand] = useState<boolean>(true);
  const [isAllExpand, setIsAllExpand] = useState<boolean>(true);

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

  const onDateChange = (date: Dayjs, dateString: string) => {
    if (date) {
      console.log('Date: ', date);
      console.log('Date: ', dateString);
      setDateValue(date);
    } else {
      console.log('Clear');
      setDateValue(defaultDayjsDate);
    }
  };

  const doDownload = useCallback(
    async (payload: { year: string }) => {
      setDownloading(true);
      const res = await arStatisticBreakdownByMonthDownload(payload).finally(
        () => {
          setDownloading(false);
        },
      );
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [dateValue],
  );

  const goDownloadCenter = useCallback(() => {
    if (!dateValue) {
      return;
    }

    const payload = {
      year: dateValue.format(dateFormat),
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
  }, [completedGuidance, dateValue]);

  const format = (value?: number | null) => {
    if (value === undefined) {
      return '';
    }
    if (value === null) {
      return '-';
    }
    return formatAmount(value);
  };

  const onNumOfTripsClick = useCallback(
    async (record: IStatisticBreakdownByMonthDataItem, key: string) => {
      setRecordActive(record);
      setRecordActiveKey(key);
      if (!dateValue) {
        return;
      }
      const payload = {
        statDate: record.statDate,
        key,
      };
      setRecordDownloading(true);
      const res = await arStatisticBreakdownByMonthTripsNumDownload(
        payload,
      ).finally(() => {
        setRecordDownloading(false);
      });
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [dateValue],
  );

  const onAllToggle = useCallback((isExpand: boolean) => {
    setIsAllExpand(isExpand);
    setTotalUnbilledExpand(isExpand);
    setTotalBilledExpand(isExpand);
  }, []);

  const fetchData = async (payload?: any) => {
    setLoading(true);
    const res = await arStatisticBreakdownByMonth({
      ...defaultDate,
      ...payload,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDataOrigin(res.data);
      const { dataList } = res.data;
      setDataSource(dataList ?? []);
    }
  };

  const fetchDataByDateValue = useCallback(() => {
    const payload = {
      year: dateValue?.format(dateFormat),
    };
    fetchData(payload);
  }, [dateValue]);

  useEffect(() => {
    fetchDataByDateValue();
  }, [dateValue]);

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <div
        className={cls('breakdown-by-month', styles.breakdownByMonth)}
        ref={containerRef}
      >
        <Table<IStatisticBreakdownByMonthDataItem>
          title={() => (
            <div className="table-title">
              <div className="table-title-main">
                <h3>
                  AR Breakdown by Month{' '}
                  <Tooltip
                    title={
                      <ul>
                        <li>
                          Receivable Trips = All Delivered + Abnormal Trips
                        </li>
                        <li>
                          Percentage of Billed Trips = Billed Trips / Booking
                          Trips
                        </li>
                      </ul>
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </h3>
                <Space>
                  <DatePicker
                    picker="year"
                    disabledDate={(currentDate) => {
                      return currentDate?.isAfter(dayjs(), 'year');
                    }}
                    value={dateValue}
                    // @ts-ignore
                    onChange={onDateChange}
                    allowClear={false}
                  />
                  <Space size={0} split={<Divider type="vertical" />}>
                    <Access
                      accessible={
                        access[
                          PermissionEnum
                            .AR_STATEMENT_STATISTIC_BREAKDOWN_BY_MONTH_DOWNLOAD
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
                      onClick={() => fetchDataByDateValue()}
                    />

                    <Button
                      icon={
                        isAllExpand ? (
                          <FullscreenExitOutlined />
                        ) : (
                          <FullscreenOutlined />
                        )
                      }
                      iconPosition="end"
                      color="default"
                      variant="link"
                      onClick={() => onAllToggle(isAllExpand ? false : true)}
                    >
                      {isAllExpand ? 'Collapse All' : 'Expand All'}
                    </Button>
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
          loading={loading}
          dataSource={dataSource}
          bordered
          scroll={{ x: 'max-content' }}
          size="small"
          pagination={false}
          className="breakdown-by-month-table"
        >
          <ColumnGroup title="Month" rowSpan={4}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="statDate"
                    title="Total"
                    width={62}
                    fixed="left"
                    dataIndex="statDate"
                    align="center"
                    render={(value) => {
                      return dayjs(value).format('M');
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup title="Receivable Trips" rowSpan={3}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup title="No. of Trips">
                  <ColumnGroup
                    title={() => (
                      <div className="total-cell">
                        {format(dataOrigin?.totalData?.receivableTripNum)}
                      </div>
                    )}
                  >
                    <Column
                      key="receivableTripNum"
                      dataIndex="receivableTripNum"
                      align="center"
                      width={100}
                      rowSpan={0}
                      render={(
                        value,
                        record: IStatisticBreakdownByMonthDataItem,
                      ) => {
                        return (
                          <Button
                            color="primary"
                            variant="link"
                            loading={
                              recordDownloading &&
                              recordActive?.statDate === record.statDate &&
                              recordActiveKey === 'receivable'
                            }
                            onClick={() =>
                              onNumOfTripsClick(record, 'receivable')
                            }
                          >
                            {formatAmount(value)}
                          </Button>
                        );
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup title={`Amount (${currencySymbol})`}>
                  <ColumnGroup
                    align="left"
                    title={() => (
                      <div
                        className="total-cell"
                        style={{ textAlign: 'right' }}
                      >
                        {format(dataOrigin?.totalData?.receivableAmount)}
                      </div>
                    )}
                  >
                    <Column
                      key="receivableAmount"
                      dataIndex="receivableAmount"
                      width={120}
                      align="right"
                      rowSpan={0}
                      render={(value) => {
                        return format(value);
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup
            title={
              <BaseCell
                style={{ backgroundColor: '#FFCCC7', justifyContent: 'center' }}
                data-title="Total Unbilled"
                showToggle
                isExpand={totalUnbilledExpand}
                onClick={() => setTotalUnbilledExpand(!totalUnbilledExpand)}
              />
            }
            rowSpan={3}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup title="No. of Trips">
                  <ColumnGroup
                    align="left"
                    title={() => (
                      <div className="total-cell">
                        {format(dataOrigin?.totalData?.unBilledTripNum)}
                      </div>
                    )}
                  >
                    <Column
                      key="unBilledTripNum"
                      align="center"
                      width={100}
                      dataIndex="unBilledTripNum"
                      rowSpan={0}
                      render={(
                        value,
                        record: IStatisticBreakdownByMonthDataItem,
                      ) => {
                        return (
                          <Button
                            color="primary"
                            variant="link"
                            loading={
                              recordDownloading &&
                              recordActive?.statDate === record.statDate &&
                              recordActiveKey === 'unBilled'
                            }
                            onClick={() =>
                              onNumOfTripsClick(record, 'unBilled')
                            }
                          >
                            {formatAmount(value)}
                          </Button>
                        );
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup title={`Amount (${currencySymbol})`}>
                  <ColumnGroup
                    align="left"
                    title={() => (
                      <div
                        className="total-cell"
                        style={{ textAlign: 'right' }}
                      >
                        {format(dataOrigin?.totalData?.unBilledAmount)}
                      </div>
                    )}
                  >
                    <Column
                      key="unBilledAmount"
                      dataIndex="unBilledAmount"
                      width={120}
                      align="right"
                      rowSpan={0}
                      render={(value) => {
                        return format(value);
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          {totalUnbilledExpand ? (
            <ColumnGroup
              title={
                <BaseCell
                  style={{
                    backgroundColor: '#FFCCC7',
                    justifyContent: 'center',
                  }}
                  data-title="Unbilled Details"
                />
              }
            >
              <ColumnGroup
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFCCC7',
                      justifyContent: 'center',
                    }}
                    data-title="Under Billing Preparation"
                  />
                }
              >
                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#FFCCC7',
                        justifyContent: 'center',
                      }}
                      data-title="Under Documentation"
                    />
                  }
                >
                  <ColumnGroup title="No. of Trips">
                    <ColumnGroup
                      align="left"
                      title={() => (
                        <div className="total-cell">
                          {format(dataOrigin?.totalData?.underDocTripNum)}
                        </div>
                      )}
                    >
                      <Column
                        key="underDocTripNum"
                        align="center"
                        width={100}
                        dataIndex="underDocTripNum"
                        rowSpan={0}
                        render={(
                          value,
                          record: IStatisticBreakdownByMonthDataItem,
                        ) => {
                          return (
                            <Button
                              color="primary"
                              variant="link"
                              loading={
                                recordDownloading &&
                                recordActive?.statDate === record.statDate &&
                                recordActiveKey === 'underDoc'
                              }
                              onClick={() =>
                                onNumOfTripsClick(record, 'underDoc')
                              }
                            >
                              {formatAmount(value)}
                            </Button>
                          );
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup title={`Amount (${currencySymbol})`}>
                    <ColumnGroup
                      align="left"
                      title={() => (
                        <div
                          className="total-cell"
                          style={{ textAlign: 'right' }}
                        >
                          {format(dataOrigin?.totalData?.underDocAmount)}
                        </div>
                      )}
                    >
                      <Column
                        key="underDocAmount"
                        dataIndex="underDocAmount"
                        width={120}
                        rowSpan={0}
                        align="right"
                        render={(value) => {
                          return format(value);
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>

                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#FFCCC7',
                        justifyContent: 'center',
                      }}
                      data-title="Under Pricing"
                    />
                  }
                >
                  <ColumnGroup title="No. of Trips">
                    <ColumnGroup
                      title={() => (
                        <div className="total-cell">
                          {format(dataOrigin?.totalData?.underPriceTripNum)}
                        </div>
                      )}
                    >
                      <Column
                        key="underPriceTripNum"
                        align="center"
                        width={100}
                        dataIndex="underPriceTripNum"
                        rowSpan={0}
                        render={(
                          value,
                          record: IStatisticBreakdownByMonthDataItem,
                        ) => {
                          return (
                            <Button
                              color="primary"
                              variant="link"
                              loading={
                                recordDownloading &&
                                recordActive?.statDate === record.statDate &&
                                recordActiveKey === 'underPrice'
                              }
                              onClick={() =>
                                onNumOfTripsClick(record, 'underPrice')
                              }
                            >
                              {formatAmount(value)}
                            </Button>
                          );
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup title={`Amount (${currencySymbol})`}>
                    <ColumnGroup
                      title={() => (
                        <div
                          className="total-cell"
                          style={{ textAlign: 'right' }}
                        >
                          {format(dataOrigin?.totalData?.underPriceAmount)}
                        </div>
                      )}
                    >
                      <Column
                        key="underPriceAmount"
                        dataIndex="underPriceAmount"
                        width={120}
                        rowSpan={0}
                        align="right"
                        render={(value) => {
                          return format(value);
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#FFCCC7',
                        justifyContent: 'center',
                      }}
                      data-title="Under Billing"
                    />
                  }
                >
                  <ColumnGroup title="No. of Trips">
                    <ColumnGroup
                      title={() => (
                        <div className="total-cell">
                          {format(dataOrigin?.totalData?.ubpUnderBillTripNum)}
                        </div>
                      )}
                    >
                      <Column
                        key="ubpUnderBillTripNum"
                        align="center"
                        width={100}
                        dataIndex="ubpUnderBillTripNum"
                        rowSpan={0}
                        render={(
                          value,
                          record: IStatisticBreakdownByMonthDataItem,
                        ) => {
                          return (
                            <Button
                              color="primary"
                              variant="link"
                              loading={
                                recordDownloading &&
                                recordActive?.statDate === record.statDate &&
                                recordActiveKey === 'ubpUnderBill'
                              }
                              onClick={() =>
                                onNumOfTripsClick(record, 'ubpUnderBill')
                              }
                            >
                              {formatAmount(value)}
                            </Button>
                          );
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup title={`Amount (${currencySymbol})`}>
                    <ColumnGroup
                      title={() => (
                        <div
                          className="total-cell"
                          style={{ textAlign: 'right' }}
                        >
                          {format(dataOrigin?.totalData?.ubpUnderBillAmount)}
                        </div>
                      )}
                    >
                      <Column
                        key="ubpUnderBillAmount"
                        dataIndex="ubpUnderBillAmount"
                        width={120}
                        align="right"
                        rowSpan={0}
                        render={(value) => {
                          return format(value);
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
              <ColumnGroup
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFCCC7',
                      justifyContent: 'center',
                    }}
                    data-title="Awaiting For Customer Confirmation"
                  />
                }
              >
                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#FFCCC7',
                        justifyContent: 'center',
                      }}
                      data-title="Under Billing"
                    />
                  }
                >
                  <ColumnGroup title="No. of Trips">
                    <ColumnGroup
                      title={() => (
                        <div className="total-cell">
                          {format(dataOrigin?.totalData?.accUnderBillTripNum)}
                        </div>
                      )}
                    >
                      <Column
                        key="accUnderBillTripNum"
                        align="center"
                        width={100}
                        dataIndex="accUnderBillTripNum"
                        rowSpan={0}
                        render={(
                          value,
                          record: IStatisticBreakdownByMonthDataItem,
                        ) => {
                          return (
                            <Button
                              color="primary"
                              variant="link"
                              loading={
                                recordDownloading &&
                                recordActive?.statDate === record.statDate &&
                                recordActiveKey === 'accUnderBill'
                              }
                              onClick={() =>
                                onNumOfTripsClick(record, 'accUnderBill')
                              }
                            >
                              {formatAmount(value)}
                            </Button>
                          );
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup title={`Amount (${currencySymbol})`}>
                    <ColumnGroup
                      title={() => (
                        <div
                          className="total-cell"
                          style={{ textAlign: 'right' }}
                        >
                          {format(dataOrigin?.totalData?.accUnderBillAmount)}
                        </div>
                      )}
                    >
                      <Column
                        key="accUnderBillAmount"
                        dataIndex="accUnderBillAmount"
                        width={140}
                        rowSpan={0}
                        align="right"
                        render={(value) => {
                          return format(value);
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
              <ColumnGroup
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFCCC7',
                      justifyContent: 'center',
                    }}
                    data-title="Awaiting For Re-bill"
                  />
                }
              >
                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#FFCCC7',
                        justifyContent: 'center',
                      }}
                      data-title=" Under Billing"
                    />
                  }
                >
                  <ColumnGroup title="No. of Trips">
                    <ColumnGroup
                      title={() => (
                        <div className="total-cell">
                          {format(dataOrigin?.totalData?.afrUnderBillTripNum)}
                        </div>
                      )}
                    >
                      <Column
                        key="afrUnderBillTripNum"
                        width={100}
                        dataIndex="afrUnderBillTripNum"
                        rowSpan={0}
                        align="center"
                        render={(
                          value,
                          record: IStatisticBreakdownByMonthDataItem,
                        ) => {
                          return (
                            <Button
                              color="primary"
                              variant="link"
                              loading={
                                recordDownloading &&
                                recordActive?.statDate === record.statDate &&
                                recordActiveKey === 'afrUnderBill'
                              }
                              onClick={() =>
                                onNumOfTripsClick(record, 'afrUnderBill')
                              }
                            >
                              {formatAmount(value)}
                            </Button>
                          );
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup title={`Amount (${currencySymbol})`}>
                    <ColumnGroup
                      title={() => (
                        <div
                          className="total-cell"
                          style={{ textAlign: 'right' }}
                        >
                          {format(dataOrigin?.totalData?.afrUnderBillAmount)}
                        </div>
                      )}
                    >
                      <Column
                        key="afrUnderBillAmount"
                        dataIndex="afrUnderBillAmount"
                        width={120}
                        align="right"
                        rowSpan={0}
                        render={(value) => {
                          return format(value);
                        }}
                      />
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          ) : null}

          <ColumnGroup
            title={
              <BaseCell
                style={{ backgroundColor: '#D9F7BE', justifyContent: 'center' }}
                data-title="Total Billed"
                showToggle
                isExpand={totalBilledExpand}
                onClick={() => setTotalBilledExpand(!totalBilledExpand)}
              />
            }
            rowSpan={3}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup title="No. of Trips">
                  <ColumnGroup
                    title={() => (
                      <div className="total-cell">
                        {format(dataOrigin?.totalData?.billedTripNum)}
                      </div>
                    )}
                  >
                    <Column
                      key="billedTripNum"
                      align="center"
                      width={100}
                      dataIndex="billedTripNum"
                      rowSpan={0}
                      render={(
                        value,
                        record: IStatisticBreakdownByMonthDataItem,
                      ) => {
                        return (
                          <Button
                            color="primary"
                            variant="link"
                            loading={
                              recordDownloading &&
                              recordActive?.statDate === record.statDate &&
                              recordActiveKey === 'billed'
                            }
                            onClick={() => onNumOfTripsClick(record, 'billed')}
                          >
                            {formatAmount(value)}
                          </Button>
                        );
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup title={`Amount (${currencySymbol})`}>
                  <ColumnGroup
                    width={120}
                    title={() => (
                      <div
                        className="total-cell"
                        style={{ textAlign: 'right' }}
                      >
                        {format(dataOrigin?.totalData?.billedAmount)}
                      </div>
                    )}
                  >
                    <Column
                      key="billedAmount"
                      dataIndex="billedAmount"
                      width={120}
                      rowSpan={0}
                      align="right"
                      render={(value) => {
                        return format(value);
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#D9F7BE',
                  justifyContent: 'center',
                }}
                data-title="Percentage of Billed Trips"
              />
            }
            rowSpan={4}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup rowSpan={0}>
                  <ColumnGroup
                    title={() => (
                      <div className="total-cell">
                        {formatAmountPercentage(
                          dataOrigin?.totalData?.billedTripProportion,
                        ) + '%'}
                      </div>
                    )}
                  >
                    <Column
                      key="billedTripProportion"
                      dataIndex="billedTripProportion"
                      width={100}
                      rowSpan={0}
                      align="center"
                      render={(value) => {
                        return formatAmountPercentage(value) + '%';
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          {totalBilledExpand ? (
            <>
              <ColumnGroup
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#D9F7BE',
                      justifyContent: 'center',
                    }}
                    data-title="Billed Details"
                  />
                }
              >
                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#D9F7BE',
                        justifyContent: 'center',
                      }}
                      data-title="Uncollected"
                    />
                  }
                >
                  <ColumnGroup
                    title={
                      <BaseCell
                        style={{
                          backgroundColor: '#D9F7BE',
                          justifyContent: 'center',
                        }}
                        data-title="Under Due"
                      />
                    }
                  >
                    <ColumnGroup title="No. of Trips">
                      <ColumnGroup
                        title={() => (
                          <div className="total-cell">
                            {format(dataOrigin?.totalData?.underDueTripNum)}
                          </div>
                        )}
                      >
                        <Column
                          key="underDueTripNum"
                          align="center"
                          width={100}
                          dataIndex="underDueTripNum"
                          rowSpan={0}
                          render={(
                            value,
                            record: IStatisticBreakdownByMonthDataItem,
                          ) => {
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.statDate === record.statDate &&
                                  recordActiveKey === 'underDue'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(record, 'underDue')
                                }
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                    <ColumnGroup title={`Amount (${currencySymbol})`}>
                      <ColumnGroup
                        title={() => (
                          <div
                            className="total-cell"
                            style={{ textAlign: 'right' }}
                          >
                            {format(dataOrigin?.totalData?.underDueAmount)}
                          </div>
                        )}
                      >
                        <Column
                          key="underDueAmount"
                          dataIndex="underDueAmount"
                          width={120}
                          align="right"
                          rowSpan={0}
                          render={(value) => {
                            return format(value);
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup
                    title={
                      <BaseCell
                        style={{
                          backgroundColor: '#D9F7BE',
                          justifyContent: 'center',
                        }}
                        data-title="Over Due"
                      />
                    }
                  >
                    <ColumnGroup title="No. of Trips">
                      <ColumnGroup
                        title={() => (
                          <div className="total-cell">
                            {format(dataOrigin?.totalData?.overDueTripNum)}
                          </div>
                        )}
                      >
                        <Column
                          key="overDueTripNum"
                          align="center"
                          width={100}
                          dataIndex="overDueTripNum"
                          rowSpan={0}
                          render={(
                            value,
                            record: IStatisticBreakdownByMonthDataItem,
                          ) => {
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.statDate === record.statDate &&
                                  recordActiveKey === 'overDue'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(record, 'overDue')
                                }
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                    <ColumnGroup title={`Amount (${currencySymbol})`}>
                      <ColumnGroup
                        title={() => (
                          <div
                            className="total-cell"
                            style={{ textAlign: 'right' }}
                          >
                            {format(dataOrigin?.totalData?.overDueAmount)}
                          </div>
                        )}
                      >
                        <Column
                          key="overDueAmount"
                          dataIndex="overDueAmount"
                          width={120}
                          align="right"
                          rowSpan={0}
                          render={(value) => {
                            return format(value);
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
                <ColumnGroup
                  title={
                    <BaseCell
                      style={{
                        backgroundColor: '#D9F7BE',
                        justifyContent: 'center',
                      }}
                      data-title="Collected"
                    />
                  }
                >
                  <ColumnGroup
                    title={
                      <BaseCell
                        style={{
                          backgroundColor: '#D9F7BE',
                          justifyContent: 'center',
                        }}
                        data-title="Collected"
                      />
                    }
                  >
                    <ColumnGroup title="No. of Trips">
                      <ColumnGroup
                        title={() => (
                          <div className="total-cell">
                            {format(dataOrigin?.totalData?.collectedTripNum)}
                          </div>
                        )}
                      >
                        <Column
                          key="collectedTripNum"
                          width={100}
                          align="center"
                          dataIndex="collectedTripNum"
                          rowSpan={0}
                          render={(
                            value,
                            record: IStatisticBreakdownByMonthDataItem,
                          ) => {
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.statDate === record.statDate &&
                                  recordActiveKey === 'collected'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(record, 'collected')
                                }
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                    <ColumnGroup title={`Amount (${currencySymbol})`}>
                      <ColumnGroup
                        title={() => (
                          <div
                            className="total-cell"
                            style={{ textAlign: 'right' }}
                          >
                            {format(dataOrigin?.totalData?.collectedAmount)}
                          </div>
                        )}
                      >
                        <Column
                          key="collectedAmount"
                          dataIndex="collectedAmount"
                          width={120}
                          align="right"
                          rowSpan={0}
                          render={(value) => {
                            return format(value);
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                  </ColumnGroup>
                  <ColumnGroup
                    title={
                      <BaseCell
                        style={{
                          backgroundColor: '#D9F7BE',
                          justifyContent: 'center',
                        }}
                        data-title="Write off"
                      />
                    }
                  >
                    <ColumnGroup title="No. of Trips">
                      <ColumnGroup
                        title={() => (
                          <div className="total-cell">
                            {format(dataOrigin?.totalData?.writeOffTripNum)}
                          </div>
                        )}
                      >
                        <Column
                          key="writeOffTripNum"
                          align="center"
                          width={100}
                          dataIndex="writeOffTripNum"
                          rowSpan={0}
                          render={(
                            value,
                            record: IStatisticBreakdownByMonthDataItem,
                          ) => {
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.statDate === record.statDate &&
                                  recordActiveKey === 'writeOff'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(record, 'writeOff')
                                }
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                    <ColumnGroup title={`Amount (${currencySymbol})`}>
                      <ColumnGroup
                        title={() => (
                          <div
                            className="total-cell"
                            style={{ textAlign: 'right' }}
                          >
                            {format(dataOrigin?.totalData?.writeOffAmount)}
                          </div>
                        )}
                      >
                        <Column
                          key="writeOffAmount"
                          dataIndex="writeOffAmount"
                          width={120}
                          align="right"
                          rowSpan={0}
                          render={(value) => {
                            return format(value);
                          }}
                        />
                      </ColumnGroup>
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
              </ColumnGroup>
            </>
          ) : null}
        </Table>
      </div>
    </>
  );
};

export default BreakdownByMonth;
