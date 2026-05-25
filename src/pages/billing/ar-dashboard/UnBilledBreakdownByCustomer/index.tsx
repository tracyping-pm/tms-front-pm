import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  arStatisticUnBilledByCustomer,
  arStatisticUnBilledByCustomerDownload,
  arStatisticUnBilledByCustomerTripsNumDownload,
} from '@/api/billing';
import {
  IDataByMonthItem,
  IStatisticUnBilledByCustomerDataItem,
} from '@/api/types/billing';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import { CURRENCY_SYMBOL, ES_DTO_CLASS } from '@/constants';
import {
  CountryMapEnum,
  CurrencyNameEnum,
  FieldQueryHighlightTypeEnum,
  GetUserGuidanceEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { formatAmount, formatAmountPercentage } from '@/utils/utils';
import {
  ArrowsAltOutlined,
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ShrinkOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Access, useAccess, useModel } from '@umijs/max';
import { useFullscreen } from 'ahooks';
import { Button, DatePicker, Divider, Space, Table } from 'antd';
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

interface IMonth extends IDataByMonthItem {
  isExpand: boolean;
}

const UnBilledBreakdownByCustomer: FC = () => {
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
  const [customerObj, setCustomerObj] = useState<I_FUZZY_API_RESPONSE>();
  const [dataSource, setDataSource] = useState<
    IStatisticUnBilledByCustomerDataItem[]
  >([]);
  const [monthList, setMonthList] = useState<IMonth[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [recordDownloading, setRecordDownloading] = useState<boolean>(false);
  const [recordActive, setRecordActive] =
    useState<IStatisticUnBilledByCustomerDataItem>();
  const [recordActiveKey, setRecordActiveKey] = useState<string>();
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

  const onCustomerChange = useCallback(
    (obj?: I_FUZZY_API_RESPONSE) => {
      setCustomerObj(obj);
    },
    [customerObj],
  );

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

  const onToggleMonth = useCallback(
    (index: number) => {
      const isExpand = monthList[index].isExpand;
      monthList[index].isExpand = !isExpand;
      setMonthList([...monthList]);
    },
    [monthList],
  );

  const doDownload = useCallback(
    async (payload: { year: string; customerId?: number }) => {
      setDownloading(true);
      const res = await arStatisticUnBilledByCustomerDownload(payload).finally(
        () => {
          setDownloading(false);
        },
      );
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [],
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
    async (
      record: IStatisticUnBilledByCustomerDataItem,
      month: IDataByMonthItem,
      key: string,
    ) => {
      setRecordActive(record);
      setRecordActiveKey(key);
      if (!dateValue) {
        return;
      }
      const payload = {
        statDate: month.statDate,
        key,
        customerId: record.customerId,
      };
      setRecordDownloading(true);
      const res = await arStatisticUnBilledByCustomerTripsNumDownload(
        payload,
      ).finally(() => {
        setRecordDownloading(false);
      });
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [],
  );

  const onAllToggle = useCallback(
    (isExpand: boolean) => {
      setIsAllExpand(isExpand);
      const newMonthList = monthList.map((item) => {
        return {
          ...item,
          isExpand: isExpand,
        };
      });
      setMonthList(newMonthList);
    },
    [monthList],
  );

  const fetchData = useCallback(
    async (payload?: any) => {
      setLoading(true);
      const res = await arStatisticUnBilledByCustomer({
        ...defaultDate,
        ...payload,
      }).finally(() => {
        setLoading(false);
      });
      if (res.code === 200) {
        const { dataList, totalData } = res.data;
        if (dataList?.length > 0) {
          setDataSource([totalData, ...dataList]);
          setMonthList(
            totalData.dataByMonthList?.map((item, index) => {
              return {
                ...item,
                // 如果 monthList 为空，则默认展开,
                isExpand:
                  monthList.length === 0
                    ? true
                    : Boolean(monthList[index]?.isExpand),
              };
            }),
          );
        } else {
          setDataSource([]);
          setMonthList([]);
        }
      }
    },
    [monthList],
  );

  const fetchDataByDateValueOrCustomer = useCallback(() => {
    const payload = {
      year: dateValue?.format(dateFormat),
      customerId: customerObj?.id,
    };
    fetchData(payload);
  }, [dateValue, customerObj]);

  useEffect(() => {
    fetchDataByDateValueOrCustomer();
  }, [dateValue, customerObj]);

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <div
        className={cls(
          'unbilled-breakdown-by-customer',
          styles.unbilledBreakdownByCustomer,
        )}
        ref={containerRef}
      >
        <Table<IStatisticUnBilledByCustomerDataItem>
          title={() => (
            <div className="table-title">
              <div className="table-title-main">
                <h3>AR UnBilled Breakdown by Customer</h3>
                <Space>
                  <FuzzySelector
                    fieldProps={{
                      placeholder: 'Customer Name',
                      style: { width: 200 },
                    }}
                    request={{
                      field: 'customerName',
                      esDtoClass: ES_DTO_CLASS.CUSTOMER,
                      type: FieldQueryHighlightTypeEnum.COUNTRY,
                    }}
                    value={customerObj}
                    onChange={(obj: any) => onCustomerChange(obj)}
                  />
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
                            .AR_STATEMENT_STATISTIC_UN_BILLED_BREAKDOWN_BY_CUSTOMER_DOWNLOAD
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
                      onClick={() => fetchDataByDateValueOrCustomer()}
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
          className="unbilled-breakdown-by-customer-table"
          rowClassName={(record, index) => {
            if (!record.customerId && index === 0) {
              return 'total-row';
            }
            return '';
          }}
        >
          <Column
            title={<BaseCell data-title="No." />}
            width={60}
            fixed="left"
            align="center"
            onCell={(_record, rowIndex) => {
              if (rowIndex === 0) {
                return {
                  colSpan: 2,
                };
              }
              return { rowSpan: 1, colSpan: 1 };
            }}
            render={(_value, _record, rowIndex) => {
              if (rowIndex === 0) {
                return <span style={{ fontWeight: 'bolder' }}>Total</span>;
              }
              return rowIndex;
            }}
          />

          <Column
            title={<BaseCell data-title="Customer Name" />}
            dataIndex={'customerName'}
            width={150}
            fixed="left"
            onCell={(_record, rowIndex) => {
              if (rowIndex === 0) {
                return {
                  colSpan: 0,
                };
              }
              return { rowSpan: 1, colSpan: 1 };
            }}
          />

          <Column
            title={
              <BaseCell
                data-title={`Total UnBilled Amount (${dateValue?.format?.(dateFormat)}) (${currencySymbol})`}
              />
            }
            dataIndex={'unBilledAmount'}
            width={120}
            align="right"
            fixed="left"
            render={(
              value,
              record: IStatisticUnBilledByCustomerDataItem,
              rowIndex,
            ) => {
              if (!record.customerId && rowIndex === 0) {
                return (
                  <span style={{ fontWeight: 'bolder' }}>{format(value)}</span>
                );
              }
              return format(value);
            }}
          />

          <Column
            title="Percentage of UnBilled Amount"
            dataIndex={'unBilledProportion'}
            width={120}
            fixed="left"
            align="center"
            render={(value) => {
              return formatAmountPercentage(value) + '%';
            }}
          />

          {monthList.map((month, index) => {
            const m = dayjs(month.statDate).format('MM');
            return (
              <>
                <Column
                  key={`${month.statDate}_${index}`}
                  title={
                    <BaseCell
                      data-title={`UnBilled Amount (${m}) (${currencySymbol})`}
                      showToggle={true}
                      isExpand={month.isExpand}
                      onClick={() => onToggleMonth(index)}
                    />
                  }
                  dataIndex={['dataByMonthList', index, 'unBilledAmount']}
                  align="right"
                  width={120}
                  render={(
                    value,
                    record: IStatisticUnBilledByCustomerDataItem,
                    rowIndex,
                  ) => {
                    if (!record.customerId && rowIndex === 0) {
                      return (
                        <span style={{ fontWeight: 'bolder' }}>
                          {format(value)}
                        </span>
                      );
                    }
                    return format(value);
                  }}
                />

                <ColumnGroup
                  key={`${month.statDate}_${index}`}
                  hidden={month.isExpand === false}
                  title={<BaseCell data-title={`${m}-Details`} />}
                >
                  <ColumnGroup
                    title={<BaseCell data-title="Under Billing Preparation" />}
                  >
                    <ColumnGroup
                      title={<BaseCell data-title="Under Documentation" />}
                    >
                      <ColumnGroup rowSpan={0}>
                        <Column
                          title="No. of Trips"
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'underDocTripNum',
                          ]}
                          width={100}
                          align="center"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
                              return formatAmount(value);
                            }
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.customerId ===
                                    record.customerId &&
                                  recordActiveKey === 'underDoc'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(record, month, 'underDoc')
                                }
                                style={{ padding: 0 }}
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                        <Column
                          title={`Amount (${currencySymbol})`}
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'underDocAmount',
                          ]}
                          width={120}
                          align="right"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
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
                    </ColumnGroup>

                    <ColumnGroup
                      title={<BaseCell data-title="Under Pricing" />}
                    >
                      <ColumnGroup rowSpan={0}>
                        <Column
                          title="No. of Trips"
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'underPriceTripNum',
                          ]}
                          width={100}
                          align="center"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
                              return (
                                <span style={{ fontWeight: 'bolder' }}>
                                  {formatAmount(value)}
                                </span>
                              );
                            }
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.customerId ===
                                    record.customerId &&
                                  recordActiveKey === 'underPrice'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(record, month, 'underPrice')
                                }
                                style={{ padding: 0 }}
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                        <Column
                          title={`Amount (${currencySymbol})`}
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'underPriceAmount',
                          ]}
                          width={120}
                          align="right"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
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
                    </ColumnGroup>

                    <ColumnGroup
                      title={<BaseCell data-title="Under Billing" />}
                    >
                      <ColumnGroup rowSpan={0}>
                        <Column
                          title="No. of Trips"
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'ubpUnderBillTripNum',
                          ]}
                          width={150}
                          align="center"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
                              return (
                                <span style={{ fontWeight: 'bolder' }}>
                                  {formatAmount(value)}
                                </span>
                              );
                            }
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.customerId ===
                                    record.customerId &&
                                  recordActiveKey === 'ubpUnderBill'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(
                                    record,
                                    month,
                                    'ubpUnderBill',
                                  )
                                }
                                style={{ padding: 0 }}
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                        <Column
                          title={`Amount (${currencySymbol})`}
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'ubpUnderBillAmount',
                          ]}
                          width={120}
                          align="right"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
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
                    </ColumnGroup>
                  </ColumnGroup>

                  <ColumnGroup
                    title={
                      <BaseCell data-title="Awaiting For Customer Confirmation" />
                    }
                  >
                    <ColumnGroup
                      title={<BaseCell data-title="Under Billing" />}
                    >
                      <ColumnGroup rowSpan={0}>
                        <Column
                          title="No. of Trips"
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'accUnderBillTripNum',
                          ]}
                          width={100}
                          align="center"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
                              return (
                                <span style={{ fontWeight: 'bolder' }}>
                                  {formatAmount(value)}
                                </span>
                              );
                            }
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.customerId ===
                                    record.customerId &&
                                  recordActiveKey === 'accUnderBill'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(
                                    record,
                                    month,
                                    'accUnderBill',
                                  )
                                }
                                style={{ padding: 0 }}
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                        <Column
                          title={`Amount (${currencySymbol})`}
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'accUnderBillAmount',
                          ]}
                          width={120}
                          align="right"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
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
                    </ColumnGroup>
                  </ColumnGroup>

                  <ColumnGroup
                    title={<BaseCell data-title="Awaiting For Re-bill" />}
                  >
                    <ColumnGroup
                      title={<BaseCell data-title="Under Billing" />}
                    >
                      <ColumnGroup rowSpan={0}>
                        <Column
                          title="No. of Trips"
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'afrUnderBillTripNum',
                          ]}
                          width={100}
                          align="center"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
                              return (
                                <span style={{ fontWeight: 'bolder' }}>
                                  {formatAmount(value)}
                                </span>
                              );
                            }
                            return (
                              <Button
                                color="primary"
                                variant="link"
                                loading={
                                  recordDownloading &&
                                  recordActive?.customerId ===
                                    record.customerId &&
                                  recordActiveKey === 'afrUnderBill'
                                }
                                onClick={() =>
                                  onNumOfTripsClick(
                                    record,
                                    month,
                                    'afrUnderBill',
                                  )
                                }
                                style={{ padding: 0 }}
                              >
                                {formatAmount(value)}
                              </Button>
                            );
                          }}
                        />
                        <Column
                          title={`Amount (${currencySymbol})`}
                          dataIndex={[
                            'dataByMonthList',
                            index,
                            'afrUnderBillAmount',
                          ]}
                          width={120}
                          align="right"
                          render={(
                            value,
                            record: IStatisticUnBilledByCustomerDataItem,
                            rowIndex: number,
                          ) => {
                            if (!record.customerId && rowIndex === 0) {
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
                    </ColumnGroup>
                  </ColumnGroup>
                </ColumnGroup>
              </>
            );
          })}
        </Table>
      </div>
    </>
  );
};

export default UnBilledBreakdownByCustomer;
