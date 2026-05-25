import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  arStatisticUncollectedBreakdown,
  arStatisticUncollectedBreakdownDownload,
  arStatisticUncollectedBreakdownTripsNumDownload,
} from '@/api/billing';
import { IStatisticUncollectedBreakdownDataItem } from '@/api/types/billing';
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
import { Button, Divider, Space, Table } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import BaseCell from '../components/BaseCell';
import styles from './index.less';

const { Column, ColumnGroup } = Table;

const UnCollectedBreakdownByCustomer: FC = () => {
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
  const [customerObj, setCustomerObj] = useState<I_FUZZY_API_RESPONSE>();
  const [dataSource, setDataSource] = useState<
    IStatisticUncollectedBreakdownDataItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [recordDownloading, setRecordDownloading] = useState<boolean>(false);
  const [recordActive, setRecordActive] =
    useState<IStatisticUncollectedBreakdownDataItem>();
  const [recordActiveKey, setRecordActiveKey] = useState<string>();
  const [totalUnderDueExpand, setTotalUnderDueExpand] = useState<boolean>(true);
  const [totalOverDueExpand, setTotalOverDueExpand] = useState<boolean>(true);
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

  const doDownload = useCallback(
    async (payload: { customerId?: number }) => {
      setDownloading(true);
      const res = await arStatisticUncollectedBreakdownDownload(
        payload,
      ).finally(() => {
        setDownloading(false);
      });
      if (res.code === 200) {
        doDownloadCenterAnimate();
      }
    },
    [customerObj],
  );

  const goDownloadCenter = useCallback(() => {
    const payload = {
      customerId: customerObj?.id,
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
  }, [completedGuidance, customerObj]);

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
    async (record: IStatisticUncollectedBreakdownDataItem, key: string) => {
      setRecordActive(record);
      setRecordActiveKey(key);

      const payload = {
        key,
        customerId: record.customerId,
      };
      setRecordDownloading(true);
      const res = await arStatisticUncollectedBreakdownTripsNumDownload(
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

  const onAllToggle = useCallback((isExpand: boolean) => {
    setIsAllExpand(isExpand);
    setTotalUnderDueExpand(isExpand);
    setTotalOverDueExpand(isExpand);
  }, []);

  const fetchData = async (payload?: any) => {
    setLoading(true);
    const res = await arStatisticUncollectedBreakdown({
      ...payload,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const dataList = res.data;
      if (dataList?.length > 1) {
        setDataSource(dataList);
      } else {
        setDataSource([]);
      }
    }
  };

  const fetchDataByCustomer = useCallback(() => {
    const payload = {
      customerId: customerObj?.id,
    };
    fetchData(payload);
  }, [customerObj]);

  const onCustomerChange = useCallback(
    (obj?: I_FUZZY_API_RESPONSE) => {
      setCustomerObj(obj);
    },
    [customerObj],
  );

  useEffect(() => {
    fetchDataByCustomer();
  }, [customerObj]);

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <div
        className={cls(
          'uncollected-breakdown-by-customer',
          styles.uncollectedBreakdownByCustomer,
        )}
        ref={containerRef}
      >
        <Table<IStatisticUncollectedBreakdownDataItem>
          title={() => (
            <div className="table-title">
              <div className="table-title-main">
                <h3>AR UnCollected Breakdown by Customer</h3>
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
                  <Space size={0} split={<Divider type="vertical" />}>
                    <Access
                      accessible={
                        access[
                          PermissionEnum
                            .AR_STATEMENT_STATISTIC_UN_COLLECTED_BREAKDOWN_BY_CUSTOMER_DOWNLOAD
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
                      onClick={() => fetchDataByCustomer()}
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
          className="uncollected-breakdown-by-customer-table"
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
            width={120}
            fixed="left"
            dataIndex={'customerName'}
            onCell={(_record, rowIndex) => {
              if (rowIndex === 0) {
                return {
                  colSpan: 0,
                };
              }
              return { rowSpan: 1, colSpan: 1 };
            }}
          />

          <ColumnGroup title={<BaseCell data-title="UnCollected" />}>
            <ColumnGroup
              title={<BaseCell data-title="Total UnCollected" />}
              rowSpan={2}
            >
              <ColumnGroup rowSpan={0}>
                <Column
                  title="No. of Trips"
                  dataIndex={'tripNum'}
                  width={100}
                  align="center"
                  render={(
                    value,
                    record: IStatisticUncollectedBreakdownDataItem,
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
                          recordActive?.customerId === record.customerId &&
                          recordActiveKey === 'unCollected'
                        }
                        onClick={() => onNumOfTripsClick(record, 'unCollected')}
                      >
                        {formatAmount(value)}
                      </Button>
                    );
                  }}
                />
                <Column
                  title={`Amount (${currencySymbol})`}
                  dataIndex={'amount'}
                  width={120}
                  align="right"
                  render={(
                    value,
                    record: IStatisticUncollectedBreakdownDataItem,
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

            <Column
              title="Percentage of UnCollected Amount"
              width={160}
              align="center"
              dataIndex={'percentageOfUnCollected'}
              render={(value) => {
                return formatAmountPercentage(value) + '%';
              }}
            />

            <ColumnGroup
              title={
                <BaseCell
                  data-title="Under Due"
                  style={{ backgroundColor: '#D9F7BE' }}
                />
              }
            >
              <ColumnGroup
                title={
                  <BaseCell
                    data-title="Total Under Due"
                    style={{ backgroundColor: '#D9F7BE' }}
                    showToggle
                    isExpand={totalUnderDueExpand}
                    onClick={() => setTotalUnderDueExpand(!totalUnderDueExpand)}
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    title="No. of Trips"
                    dataIndex={'underDueTripNum'}
                    width={100}
                    align="center"
                    render={(
                      value,
                      record: IStatisticUncollectedBreakdownDataItem,
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
                            recordActive?.customerId === record.customerId &&
                            recordActiveKey === 'underDue'
                          }
                          onClick={() => onNumOfTripsClick(record, 'underDue')}
                        >
                          {formatAmount(value)}
                        </Button>
                      );
                    }}
                  />
                  <Column
                    title={`Amount (${currencySymbol})`}
                    dataIndex={'underDueAmount'}
                    width={120}
                    align="right"
                    render={(
                      value,
                      record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`0-7 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underZeroToSevenDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`8-15 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underEightToFifteenDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`16-30 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underSixteenToThirtyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`31-45 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underThirtyOneToFortyFiveDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`46-60 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underFortySixToSixtyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`61-90 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underSixtyOneToNinetyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalUnderDueExpand}
                title={
                  <BaseCell
                    data-title={`90+ Days (${currencySymbol})`}
                    style={{ backgroundColor: '#D9F7BE' }}
                  />
                }
                dataIndex={'underNinetyPlusDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

            <ColumnGroup
              title={
                <BaseCell
                  data-title="Over Due"
                  style={{ backgroundColor: '#FFCCC7' }}
                />
              }
            >
              <ColumnGroup
                title={
                  <BaseCell
                    data-title="Total Over Due"
                    style={{ backgroundColor: '#FFCCC7' }}
                    showToggle
                    isExpand={totalOverDueExpand}
                    onClick={() => setTotalOverDueExpand(!totalOverDueExpand)}
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    title="No. of Trips"
                    dataIndex={'overDueTripNum'}
                    width={100}
                    align="center"
                    render={(
                      value,
                      record: IStatisticUncollectedBreakdownDataItem,
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
                            recordActive?.customerId === record.customerId &&
                            recordActiveKey === 'overDue'
                          }
                          onClick={() => onNumOfTripsClick(record, 'overDue')}
                        >
                          {formatAmount(value)}
                        </Button>
                      );
                    }}
                  />
                  <Column
                    title={`Amount (${currencySymbol})`}
                    dataIndex={'overDueAmount'}
                    width={120}
                    align="right"
                    render={(
                      value,
                      record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`1-15 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overOneToFifteenDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`16-30 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overSixteenToThirtyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`31-45 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overThirtyOneToFortyFiveDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`46-60 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overFortySixToSixtyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`61-90 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overSixtyOneToNinetyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`91-120 Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overNinetyOneToHundredTwentyDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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

              <Column
                hidden={!totalOverDueExpand}
                title={
                  <BaseCell
                    data-title={`120+ Days (${currencySymbol})`}
                    style={{ backgroundColor: '#FFCCC7' }}
                  />
                }
                dataIndex={'overHundredTwentyPlusDays'}
                width={120}
                align="right"
                render={(
                  value,
                  record: IStatisticUncollectedBreakdownDataItem,
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
        </Table>
      </div>
    </>
  );
};

export default UnCollectedBreakdownByCustomer;
