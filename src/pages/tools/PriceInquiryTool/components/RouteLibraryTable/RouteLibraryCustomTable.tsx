import BaseCell from '@/pages/billing/ar-dashboard/components/BaseCell';
import { DeleteOutlined, PushpinOutlined } from '@ant-design/icons';
import { Badge, Select, Table } from 'antd';
import Column from 'antd/es/table/Column';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import {
  IPriceVersionList,
  IQuotedPriceListCustomerAndVendor,
  IQuotedPriceListDataByRoute,
  IQuotedPriceListRecord,
} from '@/api/types/tool';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import {
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
  RouteBillingModeEnum,
} from '@/enums';
import { formatAmount, openNewTag } from '@/utils/utils';
import styles from './index.less';

interface IRouteLibraryCustomTable {
  sourceData: IQuotedPriceListRecord;
  pricingMode: RouteBillingModeEnum;
}

export default function RouteLibraryCustomTable({
  sourceData,
  pricingMode,
}: IRouteLibraryCustomTable) {
  const [originData, setOriginData] = useState<{ [key: string]: any }[]>();
  const [vendorOptions, setVendorOptions] = useState<
    {
      label: string;
      value: number;
    }[]
  >();
  const [vendorList, setVendorList] = useState<
    {
      id: number;
      name: string;
      priceVersionList: IPriceVersionList[];
    }[]
  >([]);
  const [targetVendorId, setTargetVendorId] = useState<number>();
  const [showVendorIds, setShowVendorIds] = useState<number[]>([]);
  const [newVendorIndex, setNewVendorIndex] = useState<number>(0);

  const flattenTruckData = (sourceList: IQuotedPriceListRecord[]) => {
    let list: { [key: string]: any }[] = [];
    // 日期与状态值
    const VALIDITY_PERIOD_AND_STATUS_VALUE = [
      {
        key: 'validityPeriod',
        truckTypeId: 'validityPeriod',
        truckTypeName: 'Validity Period',
        versionPrice: 'Validity Period',
        deliveredTrips: 'Validity Period',
      },
      {
        key: 'priceVersionStatus',
        truckTypeId: 'priceVersionStatus',
        truckTypeName: 'Price Version Status',
        versionPrice: 'Price Version Status',
        deliveredTrips: 'Price Version Status',
      },
    ];

    sourceList.forEach((item: IQuotedPriceListRecord) => {
      let _routeLibraryList: any = [];
      const {
        projectId,
        customerId,
        projectName,
        projectStatus,
        industryId,
        industryName,
        routeLibraryId,
        routeLibraryName,
        routeIds,
        routeNum,
        mileage,
        requirementFrequency,
        routeLibraryCreateTime,
        dataByRoute,
      } = item;

      dataByRoute.forEach((routeLibrary: IQuotedPriceListDataByRoute) => {
        const result: any = [];
        const {
          customerData,
          originAddress,
          destinationAddress,
          originLabel,
          destinationLabel,
          routeCode,
          routeMileage,
          totalDeliveryTrips,
        } = routeLibrary;
        const vendorDataList = routeLibrary?.vendorData ?? [];
        // const customerName = customerData.merchantName;
        const customerPriceVersionList = customerData?.priceVersionList ?? [];
        const customerTotalRouteDeliveredTrips =
          customerData.totalRouteDeliveredTrips
            ? formatAmount(customerData.totalRouteDeliveredTrips)
            : '';
        let obj: any = {
          projectId,
          customerId,
          industryId,
          routeLibraryId,
          routeIds,
          mileage: formatAmount(mileage),
          projectName: projectName,
          projectStatus: projectStatus,
          industryName: industryName,
          routeLibraryName: routeLibraryName,
          routeCode: routeCode,
          totalDeliveryTrips: formatAmount(totalDeliveryTrips),
          routeMileage: routeMileage,
          originAddress: originAddress,
          originLabel: originLabel,
          destinationAddress: destinationAddress,
          destinationLabel: destinationLabel,
          requirementFrequency: requirementFrequency,
          customerTotalRouteDeliveredTrips: customerTotalRouteDeliveredTrips,
        };
        // 处理customer 数据
        if (customerPriceVersionList.length) {
          customerPriceVersionList?.forEach(
            (version: IPriceVersionList, index: number) => {
              const { priceVersionId, validityPeriod, priceVersionStatus } =
                version;
              const truckTypeList = version?.truckTypeList ?? [];
              const _truckTypeList = [
                ...VALIDITY_PERIOD_AND_STATUS_VALUE,
                ...truckTypeList,
              ];

              _truckTypeList?.forEach((truck, _truckIndex: number) => {
                const _findIndex = result.findIndex((_truck: any) => {
                  return _truck.truckTypeId === truck.truckTypeId;
                });
                if (_findIndex !== -1) {
                  // 多个价格版本时versionPrice列前两行需要展示validityPeriod与priceVersionStatus数据
                  result[_findIndex][`versionPrice_${index}`] =
                    truck.key === 'validityPeriod'
                      ? validityPeriod.trim()
                      : truck.key === 'priceVersionStatus'
                        ? priceVersionStatus
                        : truck.versionPrice;
                  // 多个价格版本时deliveredTrips列第一行行需要展示空数据
                  result[_findIndex][`deliveredTrips_${index}`] =
                    _truckIndex === 0 || _truckIndex === 1
                      ? ''
                      : formatAmount(+truck.deliveredTrips);
                } else {
                  obj = {
                    ...obj,
                    priceVersionId: priceVersionId,
                    truckTypeId: truck.truckTypeId,
                    truckTypeName: truck.truckTypeName,
                    projectName: _truckIndex === 0 ? projectName : '',
                    projectStatus: _truckIndex === 0 ? projectStatus : '',
                    industryName: _truckIndex === 0 ? industryName : '',
                    routeLibraryName: _truckIndex === 0 ? routeLibraryName : '',
                    routeNum: _truckIndex === 0 ? routeNum : '',
                    originAddress: _truckIndex === 0 ? originAddress : '',
                    originLabel: _truckIndex === 0 ? originLabel : '',
                    destinationAddress:
                      _truckIndex === 0 ? destinationAddress : '',
                    destinationLabel: _truckIndex === 0 ? destinationLabel : '',
                    routeCode: _truckIndex === 0 ? routeCode : '',
                    totalDeliveryTrips:
                      _truckIndex === 0 ? formatAmount(totalDeliveryTrips) : '',
                    routeMileage: _truckIndex === 0 ? routeMileage : '',
                    requirementFrequency:
                      _truckIndex === 0 ? requirementFrequency : '',
                    routeLibraryCreateTime:
                      _truckIndex === 0 ? routeLibraryCreateTime : '',
                    customerTotalRouteDeliveredTrips:
                      _truckIndex === 0 ? customerTotalRouteDeliveredTrips : '',
                  };
                  // validityPeriod与priceVersionStatus数据处理
                  result.push({
                    ...obj,
                    // versionPrice列前两行需要展示validityPeriod与priceVersionStatus数据
                    [`versionPrice_${index}`]:
                      truck.key === 'validityPeriod'
                        ? validityPeriod.trim()
                        : truck.key === 'priceVersionStatus'
                          ? priceVersionStatus
                          : truck.versionPrice,
                    // deliveredTrips列第一行行需要展示空数据
                    [`deliveredTrips_${index}`]:
                      _truckIndex === 0 || _truckIndex === 1
                        ? ''
                        : formatAmount(+truck.deliveredTrips),
                  });
                }
              });
            },
          );
        } else {
          if (!vendorDataList.length) {
            result.push(obj);
          }
        }

        vendorDataList?.forEach(
          (
            _vendor: IQuotedPriceListCustomerAndVendor,
            _vendorIndex: number,
          ) => {
            const vendorPriceVersionList = _vendor?.priceVersionList ?? [];
            const vendorRouteDeliveredTrips = _vendor?.totalRouteDeliveredTrips
              ? formatAmount(_vendor?.totalRouteDeliveredTrips)
              : '';
            vendorPriceVersionList?.forEach(
              (version: IPriceVersionList, index: number) => {
                const { validityPeriod, priceVersionStatus } = version;
                const truckTypeList = version?.truckTypeList ?? [];
                const _truckTypeList = [
                  ...VALIDITY_PERIOD_AND_STATUS_VALUE,
                  ...truckTypeList,
                ];

                _truckTypeList?.forEach((truck, _truckIndex) => {
                  const _findIndex = result.findIndex((_truck: any) => {
                    return _truck.truckTypeId === truck.truckTypeId;
                  });

                  if (_findIndex !== -1) {
                    // versionPrice列前两行需要展示validityPeriod与priceVersionStatus数据
                    result[_findIndex][
                      `versionPriceVendor_${_vendorIndex}_${index}`
                    ] =
                      truck.key === 'validityPeriod'
                        ? validityPeriod.trim()
                        : truck.key === 'priceVersionStatus'
                          ? priceVersionStatus
                          : truck.versionPrice;
                    result[_findIndex][`type`] = truck.key;
                    // deliveredTrips列第一行行需要展示空数据
                    result[_findIndex][
                      `deliveredTripsVendor_${_vendorIndex}_${index}`
                    ] =
                      _truckIndex === 0 || _truckIndex === 1
                        ? ''
                        : formatAmount(+truck.deliveredTrips);
                    // 每个vendor total delivered Trip
                    result[_findIndex][
                      `vendorRouteDeliveredTrips_${_vendorIndex}`
                    ] = _truckIndex !== 0 ? '' : vendorRouteDeliveredTrips;
                  } else {
                    obj = {
                      ...obj,

                      truckTypeId: truck.truckTypeId,
                      truckTypeName: truck.truckTypeName,
                      projectName: _truckIndex === 0 ? projectName : '',
                      projectStatus: _truckIndex === 0 ? projectStatus : '',
                      industryName: _truckIndex === 0 ? industryName : '',
                      routeLibraryName:
                        _truckIndex === 0 ? routeLibraryName : '',
                      routeNum: _truckIndex === 0 ? routeNum : '',
                      originAddress: _truckIndex === 0 ? originAddress : '',
                      originLabel: _truckIndex === 0 ? originLabel : '',
                      destinationAddress:
                        _truckIndex === 0 ? destinationAddress : '',
                      destinationLabel:
                        _truckIndex === 0 ? destinationLabel : '',
                      routeCode: _truckIndex === 0 ? routeCode : '',
                      totalDeliveryTrips:
                        _truckIndex === 0
                          ? formatAmount(totalDeliveryTrips)
                          : '',
                      routeMileage: _truckIndex === 0 ? routeMileage : '',
                      requirementFrequency:
                        _truckIndex === 0 ? requirementFrequency : '',
                      routeLibraryCreateTime:
                        _truckIndex === 0 ? routeLibraryCreateTime : '',
                      customerTotalRouteDeliveredTrips:
                        _truckIndex === 0
                          ? customerTotalRouteDeliveredTrips
                          : '',
                    };
                    result.push({
                      ...obj,
                      [`versionPriceVendor_${_vendorIndex}_${index}`]:
                        truck.key === 'validityPeriod'
                          ? validityPeriod.trim()
                          : truck.key === 'priceVersionStatus'
                            ? priceVersionStatus
                            : truck.versionPrice,
                      [`deliveredTripsVendor_${_vendorIndex}_${index}`]:
                        _truckIndex === 0 || _truckIndex === 1
                          ? ''
                          : formatAmount(+truck.deliveredTrips),
                      [`vendorRouteDeliveredTrips_${_vendorIndex}`]:
                        vendorRouteDeliveredTrips,
                    });
                  }
                });
              },
            );
          },
        );

        const _list = [..._routeLibraryList, ...result];
        _routeLibraryList = _list;
      });

      list = _routeLibraryList;
    });

    return list;
  };

  const onVendorChange = (value: number) => {
    setTargetVendorId(value);
    setNewVendorIndex(
      vendorList.findIndex((item: { id: number }) => item.id === value),
    );
  };

  const onDelete = (id: number) => {
    const _showVendorIds = showVendorIds.filter((item) => item !== id);

    setShowVendorIds(_showVendorIds);

    const obj = vendorList.find(
      (item: { id: number }) => !_showVendorIds.includes(item.id),
    );

    if (!targetVendorId) {
      const index = vendorList.findIndex(
        (item: { id: number }) => item.id === obj?.id,
      );
      setNewVendorIndex(index);
      setTargetVendorId(obj?.id);
    }
  };

  const onPushPin = () => {
    const _showVendorIds = [...showVendorIds, targetVendorId!];
    setShowVendorIds(_showVendorIds);
    const obj = vendorList.find(
      (item: { id: number }) => !_showVendorIds.includes(item.id),
    );
    const index = vendorList.findIndex(
      (item: { id: number }) => item.id === obj?.id,
    );
    setNewVendorIndex(index);
    setTargetVendorId(obj?.id);
  };

  const initial = (data: IQuotedPriceListRecord) => {
    // vendor筛选器数据列表
    const options = data?.dataByRoute[0]?.vendorData?.map(
      (_item: IQuotedPriceListCustomerAndVendor) => {
        return {
          label: _item.merchantName,
          value: _item.merchantId,
        };
      },
    );

    setVendorOptions(options);
    // 循环表格中的vendor
    const _vendorList = sourceData?.dataByRoute[0]?.vendorData.map(
      (_vendor: IQuotedPriceListCustomerAndVendor) => {
        return {
          id: _vendor.merchantId,
          name: _vendor.merchantName,
          priceVersionList: _vendor.priceVersionList,
        };
      },
    );
    // 用于控制展示表格被选中的vendor
    const _showVendorIds = _vendorList
      .slice(0, 2)
      .map(
        (_item: {
          id: number;
          name: string;
          priceVersionList: IPriceVersionList[];
        }) => _item.id,
      );
    setShowVendorIds(_showVendorIds);
    // const _showVendorIds: number[] = [];
    const _targetVendorId = _vendorList.find(
      (item: { id: number }) => !_showVendorIds.includes(item.id),
    )?.id;

    const index = _vendorList.findIndex(
      (item: { id: number }) => item.id === _targetVendorId,
    );
    setNewVendorIndex(index);
    setTargetVendorId(_targetVendorId);
    setVendorList(_vendorList);
  };

  useEffect(() => {
    if (!sourceData) return;

    initial(sourceData);
    const _data = flattenTruckData([sourceData]);
    setOriginData(_data);
  }, [sourceData]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div>
        <p className={styles.billingMode}>
          * This route library contains {vendorList.length} vendors.
        </p>

        {sourceData?.dataByRoute[0]?.customerData?.priceVersionList?.length ||
        vendorList.some((item) => item?.priceVersionList?.length) ? null : (
          <p className={styles.billingMode}>
            * No price version exists within the Effective Time range
          </p>
        )}
      </div>

      <Table<any>
        dataSource={originData}
        bordered
        scroll={{ x: 'max-content' }}
        size="small"
        pagination={false}
      >
        <Column
          key="projectName"
          title="Project Name"
          ellipsis={true}
          width={140}
          align="center"
          fixed="left"
          dataIndex="projectName"
          render={(value, _record) => {
            const projectStatus = _record.projectStatus as ProjectStatusEnum;
            return value ? (
              <>
                <CustomTooltip title={value}>{value}</CustomTooltip>
                <div>
                  <Badge
                    color={ProjectStatusEnumColor[projectStatus]}
                    text={ProjectStatusEnumText[projectStatus]}
                  />
                </div>
              </>
            ) : null;
          }}
        />
        <Column
          key="industryName"
          title="Industry Name"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="industryName"
        />
        <Column
          key="routeLibraryName"
          title="Route Library Name"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="routeLibraryName"
        />
        <Column
          key="routeCode"
          title="Route Code"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="routeCode"
        />

        <Column
          key="originLabel"
          title="Origin Label"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="originLabel"
        />
        <Column
          key="originAddress"
          title="Origin"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="originAddress"
        />
        <Column
          key="destinationLabel"
          title="Destination Label"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="destinationLabel"
        />
        <Column
          key="destinationAddress"
          title="Destination"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="destinationAddress"
        />
        {/* Pricing Mode 为 Mileage Pricing(By Distance)展示 */}
        {pricingMode === RouteBillingModeEnum.MILEAGE_BILLING && (
          <Column
            key="routeMileage"
            title="Mileage"
            width={140}
            ellipsis={true}
            align="center"
            dataIndex="routeMileage"
          />
        )}
        <Column
          key="requirementFrequency"
          title="Requirement Frequency"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="requirementFrequency"
        />
        <Column
          key="totalDeliveryTrips"
          title="Total Delivery Trips"
          width={140}
          ellipsis={true}
          align="center"
          dataIndex="totalDeliveryTrips"
        />
        {/* customer vendorList 为空时屏蔽 */}
        {(!!sourceData?.dataByRoute[0]?.customerData?.priceVersionList
          ?.length ||
          !!vendorList?.length) && (
          <ColumnGroup
            key="Customer"
            title={
              <BaseCell
                style={{ backgroundColor: '#d9d9d9' }}
                data-title={''}
              />
            }
            align="center"
          >
            <ColumnGroup
              title={
                <BaseCell
                  style={{ backgroundColor: '#d9d9d9' }}
                  data-title=""
                />
              }
              align="center"
              key={uuidV4()}
            >
              <Column
                key={uuidV4()}
                rowSpan={0}
                width={180}
                dataIndex={'truckTypeName'}
                fixed="left"
                render={(value) => {
                  return (
                    <BaseCell
                      style={{ backgroundColor: '#d9d9d9' }}
                      data-title={value}
                    />
                  );
                }}
              />
            </ColumnGroup>
          </ColumnGroup>
        )}
        {sourceData?.dataByRoute[0]?.customerData?.merchantName && (
          <ColumnGroup
            key="Customer"
            title={
              <BaseCell
                style={{ backgroundColor: '#d9d9d9' }}
                data-title={`[Customer] ${sourceData?.dataByRoute[0]?.customerData?.merchantName}`}
              />
            }
            align="center"
          >
            <>
              {sourceData?.dataByRoute[0]?.customerData?.priceVersionList?.map(
                (_: IPriceVersionList, index: number) => {
                  return (
                    <>
                      <ColumnGroup
                        key={uuidV4()}
                        title={
                          <BaseCell
                            style={{ backgroundColor: '#d9d9d9' }}
                            data-title=""
                          />
                        }
                        align="center"
                      >
                        <Column
                          key={uuidV4()}
                          rowSpan={0}
                          width={180}
                          dataIndex={'versionPrice_' + index}
                          render={(value, _record) => {
                            if (_record.type === 'validityPeriod') {
                              return (
                                <div
                                  onClick={() => {
                                    const url = `${PATHS.ROUTE_LIBRARY_PRICE}/${_record.routeLibraryId}?mode=${
                                      pricingMode ===
                                      RouteBillingModeEnum.ROUTE_BILLING
                                        ? 'byRoute'
                                        : 'byDistance'
                                    }&identity=customer&versionId=${_record.priceVersionId}`;

                                    openNewTag(url);
                                  }}
                                >
                                  <BaseCell
                                    style={{
                                      color: '#009688',
                                      cursor: 'pointer',
                                    }}
                                    data-title={value}
                                  />
                                </div>
                              );
                            }
                            return <BaseCell data-title={value} />;
                          }}
                        />
                      </ColumnGroup>
                      <ColumnGroup
                        title={
                          <BaseCell
                            style={{ backgroundColor: '#d9d9d9' }}
                            data-title="Delivered Trips"
                          />
                        }
                        align="center"
                        key={uuidV4()}
                      >
                        <Column
                          key={uuidV4()}
                          rowSpan={0}
                          width={120}
                          dataIndex={'deliveredTrips_' + index}
                          render={(value) => {
                            return <BaseCell data-title={value} />;
                          }}
                        />
                      </ColumnGroup>
                    </>
                  );
                },
              )}
              <ColumnGroup
                title={
                  <BaseCell
                    style={{ backgroundColor: '#d9d9d9' }}
                    data-title="Total Delivered Trips"
                  />
                }
                align="center"
                key={uuidV4()}
              >
                <Column
                  key={uuidV4()}
                  rowSpan={0}
                  width={180}
                  dataIndex={'customerTotalRouteDeliveredTrips'}
                  render={(value) => {
                    return <BaseCell data-title={value} />;
                  }}
                />
              </ColumnGroup>
            </>
          </ColumnGroup>
        )}

        {vendorList?.map(
          (
            _vendor: {
              id: number;
              name: string;
              priceVersionList: IPriceVersionList[];
            },
            _vendorIndex: number,
          ) => {
            return showVendorIds.includes(_vendor.id) ? (
              <ColumnGroup
                key={`Vendor ${_vendor.id}`}
                title={
                  <div
                    className={styles.vendorList}
                    style={{ backgroundColor: '#b0e7e7' }}
                  >
                    <div
                      style={{ width: vendorList.length > 2 ? '70%' : '100%' }}
                    >{`[Vendor] ${_vendor.name}`}</div>
                    {vendorList.length > 2 &&
                    showVendorIds.includes(_vendor.id!) ? (
                      <div style={{ width: '10%' }}>
                        <DeleteOutlined
                          onClick={() => {
                            onDelete(_vendor.id);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                }
                align="center"
              >
                <>
                  {_vendor?.priceVersionList.map(
                    (item: IPriceVersionList, index: number) => {
                      return (
                        <>
                          <ColumnGroup
                            key={uuidV4()}
                            title={
                              <BaseCell
                                style={{ backgroundColor: '#b0e7e7' }}
                                data-title=""
                              />
                            }
                            align="center"
                          >
                            <Column
                              rowSpan={0}
                              width={180}
                              dataIndex={`versionPriceVendor_${_vendorIndex}_${index}`}
                              render={(value, _record) => {
                                if (_record.type === 'validityPeriod') {
                                  return (
                                    <div
                                      onClick={() => {
                                        const url = `${PATHS.ROUTE_LIBRARY_PRICE}/${_record.routeLibraryId}?mode=${
                                          pricingMode ===
                                          RouteBillingModeEnum.ROUTE_BILLING
                                            ? 'byRoute'
                                            : 'byDistance'
                                        }&identity=vendor&versionId=${item.priceVersionId}&vendorId=${_vendor.id}`;
                                        openNewTag(url);
                                      }}
                                    >
                                      <BaseCell
                                        style={{
                                          color: '#009688',
                                          cursor: 'pointer',
                                        }}
                                        data-title={value}
                                      />
                                    </div>
                                  );
                                }
                                return <BaseCell data-title={value} />;
                              }}
                            />
                          </ColumnGroup>
                          <ColumnGroup
                            key={uuidV4()}
                            title={
                              <BaseCell
                                style={{ backgroundColor: '#b0e7e7' }}
                                data-title="Delivered Trips"
                              />
                            }
                            align="center"
                          >
                            <Column
                              rowSpan={0}
                              width={120}
                              dataIndex={`deliveredTripsVendor_${_vendorIndex}_${index}`}
                              render={(value) => {
                                return <BaseCell data-title={value} />;
                              }}
                            />
                          </ColumnGroup>
                        </>
                      );
                    },
                  )}
                </>
                <ColumnGroup
                  key={uuidV4()}
                  title={
                    <BaseCell
                      style={{ backgroundColor: '#b0e7e7' }}
                      data-title="Total Delivered Trips"
                    />
                  }
                  align="center"
                >
                  <Column
                    rowSpan={0}
                    width={180}
                    dataIndex={`vendorRouteDeliveredTrips_${_vendorIndex}`}
                    render={(value) => {
                      return <BaseCell data-title={value} />;
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            ) : null;
          },
        )}
        {/* vendor添加选择器 */}
        {newVendorIndex !== -1 &&
          [vendorList[newVendorIndex]]?.map(
            (_vendor: {
              id: number;
              name: string;
              priceVersionList: IPriceVersionList[];
            }) => {
              return (
                <ColumnGroup
                  key={`Vendor ${newVendorIndex}`}
                  title={
                    <div
                      className={styles.vendorList}
                      style={{ backgroundColor: '#ff9900' }}
                    >
                      <Select
                        className={styles.toolsSelect}
                        style={{ width: '70%', backgroundColor: 'transparent' }}
                        value={targetVendorId ?? _vendor?.id}
                        options={vendorOptions?.map((option: any) => {
                          return {
                            value: option.value,
                            label: option.label,
                            disabled: showVendorIds.includes(option?.value),
                          };
                        })}
                        onChange={onVendorChange}
                      />

                      <div style={{ width: '10%' }}>
                        <PushpinOutlined
                          onClick={() => {
                            onPushPin();
                          }}
                        />
                      </div>
                    </div>
                  }
                  align="center"
                >
                  <>
                    {_vendor?.priceVersionList.map(
                      (item: IPriceVersionList, index: number) => {
                        return (
                          <>
                            <ColumnGroup
                              key={uuidV4()}
                              title={
                                <BaseCell
                                  style={{ backgroundColor: '#ff9900' }}
                                  data-title=""
                                />
                              }
                              align="center"
                            >
                              <Column
                                rowSpan={0}
                                width={180}
                                dataIndex={`versionPriceVendor_${newVendorIndex}_${index}`}
                                render={(value, _record) => {
                                  if (_record.type === 'validityPeriod') {
                                    return (
                                      <div
                                        onClick={() => {
                                          const url = `${PATHS.ROUTE_LIBRARY_PRICE}/${_record.routeLibraryId}?mode=${
                                            pricingMode ===
                                            RouteBillingModeEnum.ROUTE_BILLING
                                              ? 'byRoute'
                                              : 'byDistance'
                                          }&identity=vendor&versionId=${item.priceVersionId}&vendorId=${_vendor.id}`;
                                          openNewTag(url);
                                        }}
                                      >
                                        <BaseCell
                                          style={{
                                            color: '#009688',
                                            cursor: 'pointer',
                                          }}
                                          data-title={value}
                                        />
                                      </div>
                                    );
                                  }
                                  return <BaseCell data-title={value} />;
                                }}
                              />
                            </ColumnGroup>
                            <ColumnGroup
                              key={uuidV4()}
                              title={
                                <BaseCell
                                  style={{ backgroundColor: '#ff9900' }}
                                  data-title="Delivered Trips"
                                />
                              }
                              align="center"
                            >
                              <Column
                                rowSpan={0}
                                width={120}
                                dataIndex={`deliveredTripsVendor_${newVendorIndex}_${index}`}
                                render={(value) => {
                                  return <BaseCell data-title={value} />;
                                }}
                              />
                            </ColumnGroup>
                          </>
                        );
                      },
                    )}
                  </>

                  <ColumnGroup
                    key={uuidV4()}
                    title={
                      <BaseCell
                        style={{ backgroundColor: '#ff9900' }}
                        data-title="Total Delivered Trips"
                      />
                    }
                    align="center"
                  >
                    <Column
                      rowSpan={0}
                      width={180}
                      dataIndex={`vendorRouteDeliveredTrips_${newVendorIndex}`}
                      render={(value) => {
                        return <BaseCell data-title={value} />;
                      }}
                    />
                  </ColumnGroup>
                </ColumnGroup>
              );
            },
          )}
      </Table>
    </div>
  );
}
