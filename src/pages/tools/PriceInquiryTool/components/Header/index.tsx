import { customerIndustryList } from '@/api/customer';
import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { getTruckTypeList } from '@/api/truck';
import { IIndustryRecord } from '@/api/types/customer';
import { IPlaceGeoRecord } from '@/api/types/place';
import { ITruckTypeListItem } from '@/api/types/truck';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import { IMeta } from '@/components/LocatorModal';
import {
  CountryEnumLabelListMap,
  GetUserGuidanceEnum,
  RequirementFrequencyEnumText,
  RouteBillingModeEnum,
  RouteBillingModeEnumText,
} from '@/enums';
import { ProFormSelect } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Form,
  message,
  Radio,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getUserGuidanceUpdate } from '@/api-uam/common';
import { quotedPriceWaybillExport } from '@/api/tool';
import {
  IQuotedPriceListParamsV2,
  IQuotedPriceStatisticsParams,
} from '@/api/types/tool';
import { waybillRouteAddressCheck } from '@/api/waybill';
import CustomTooltip from '@/components/CustomTooltip';
import { PAGE_NUMBER } from '@/constants';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import styles from './index.less';

const { RangePicker } = DatePicker;
interface IProps {
  paginationData: {
    pageSize: number;
    pageNum: number;
  };
  onDeliveredTripsSearchHandle: (v?: IQuotedPriceStatisticsParams) => void;
  onRouteLibrarySearchHandle: (v?: IQuotedPriceListParamsV2) => void;
}

export default function Header({
  paginationData,
  onDeliveredTripsSearchHandle,
  onRouteLibrarySearchHandle,
}: IProps) {
  const { initialState: userInfo, setInitialState: setUserInfo } =
    useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId ?? 1;

  const completedGuidance =
    userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;

  //@ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];

  const [form] = Form.useForm();

  const billingModeValue = Form.useWatch('billingMode', form);
  const destinationPadIdValue = Form.useWatch('destinationPadId', form);
  const originTadIdValue = Form.useWatch('originTadId', form);
  const destinationTadIdValue = Form.useWatch('destinationTadId', form);

  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [truckTypeList, setTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  const [originLoading, setOriginLoading] = useState<boolean>(false);
  const [destinationLoading, setDestinationLoading] = useState<boolean>(false);
  const [routeLibraryLoading, setRouteLibraryLoading] =
    useState<boolean>(false);

  const [industryList, setIndustryList] = useState<IIndustryRecord[]>([]);
  const [newPaginationData, setNewPaginationData] = useState<{
    pageSize: number;
    pageNum: number;
  }>();

  const searchVersionRef = useRef<string[]>([]);
  const curSelectedOriginAddress = useRef<IMeta | undefined>();
  const curSelectedDestinationAddress = useRef<IMeta | undefined>();

  // 用户引导
  const searchRef = useRef<any>(null);
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

  const doDownload = useCallback(async () => {
    setExportLoading(true);

    let _priceLevel = 'V0';
    if (searchVersionRef.current.length === 1) {
      _priceLevel = searchVersionRef.current[0];
    }
    // searchRef.current = {
    //   pageNum: 1,
    //   pageSize: 10,
    //   truckTypeIdList: [1, 2, 3, 4, 5],
    //   industryIdList: ['1'],
    //   originPadId: 4,
    //   originSadId: 368,
    //   originTadId: 2145,
    //   destinationPadId: 1,
    //   destinationSadId: null,
    //   destinationTadId: null,
    //   priceLevel: 'V0',
    //   addressMatchLevel: 'L2',
    //   requirementFrequencyList: [
    //     'Lock In',
    //     'On Call - Stable Volume',
    //     'On Call - On Demand Volume',
    //   ],
    //   billingMode: 'Route Pricing(By Route)',
    // };

    const res = await quotedPriceWaybillExport({
      priceLevel: _priceLevel,
      ...newPaginationData,
      ...searchRef.current,
    }).finally(() => {
      setExportLoading(false);
    });
    if (res.code === 200) {
      message.success('Export successfully');
      doDownloadCenterAnimate();
    }
  }, [searchRef.current, newPaginationData]);

  const onExportRecords = useCallback(() => {
    if (completedGuidance) {
      doDownload();
    } else {
      playAnimation();
      guidanceUpdateHandle();
      setTimeout(() => {
        doDownload();
      }, 3000);
    }
  }, [completedGuidance, newPaginationData]);

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: { label: string; value: number }[] = [];
    if (res.code === 200) {
      list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    }

    setTruckTypeList(list);
  };
  const getIndustryListHandle = async () => {
    const res = await customerIndustryList();
    if (res.code === 200) {
      setIndustryList(res.data);
    }
  };

  const resetAddress = (type: 'Origin' | 'Destination') => {
    form?.setFieldValue('addressMatchLevel', 'L2');
    if (type === 'Origin') {
      curSelectedOriginAddress.current = undefined;
      form?.resetFields(['originPadId', 'originSadId', 'originTadId']);
      form?.setFields([
        {
          name: 'originAddress',
          value: undefined,
          errors: [],
        },
      ]);
    } else {
      curSelectedDestinationAddress.current = undefined;
      form?.resetFields([
        'destinationPadId',
        'destinationSadId',
        'destinationTadId',
      ]);
      form?.setFields([
        {
          name: 'destinationAddress',
          value: undefined,
          errors: [],
        },
      ]);
    }
  };
  // 回填origin pad、sad、tad地址
  const handleOriginResolve = async (meta?: IMeta) => {
    try {
      await form?.validateFields(['originAddress']);
    } catch (error) {
      console.log('catch', error);
    }

    if (!meta?.lat || !meta?.lng) {
      form?.setFields([
        {
          name: 'originAddress',
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }

    if (!curSelectedOriginAddress.current) {
      message.warning('Please select a address fist');
      return false;
    }
    const { lat, lng } = curSelectedOriginAddress.current;

    const params = {
      level: 3,
      lat,
      lng,
    };
    setOriginLoading(true);
    const res = await placeGeoResolveAddressResult(params, true);
    setOriginLoading(false);
    if (res.code === 200) {
      form?.setFieldsValue({
        originPadId: res.data.pad,
        originSadId: res.data.sad,
        originTadId: res.data.tad,
      });
    }
  };
  // 回填destination pad、sad、tad地址
  const handleDestinationResolve = async (meta?: IMeta) => {
    try {
      await form?.validateFields(['destinationAddress']);
    } catch (error) {
      console.log('catch', error);
    }
    if (!meta?.lat || !meta?.lng) {
      form?.setFields([
        {
          name: 'destinationAddress',
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }

    if (!curSelectedDestinationAddress.current) {
      message.warning('Please select a address fist');
      return false;
    }
    const { lat, lng } = curSelectedDestinationAddress.current;

    const params = {
      level: 3,
      lat,
      lng,
    };
    setDestinationLoading(true);
    const res = await placeGeoResolveAddressResult(params, true);
    setDestinationLoading(false);
    if (res.code === 200) {
      form?.setFieldsValue({
        destinationPadId: res.data.pad,
        destinationSadId: res.data.sad,
        destinationTadId: res.data.tad,
      });
    }
  };

  const handleOriginSelect = async (
    meta: IMeta,
    type: 'Origin' | 'Destination',
  ) => {
    if (!lodash.isEmpty(meta)) {
      if (type === 'Origin') {
        curSelectedOriginAddress.current = meta;
        form?.setFieldsValue({
          originAddress: meta.address,
        });
        await handleOriginResolve(meta);
      } else {
        form?.setFieldsValue({
          destinationAddress: meta.address,
        });
        curSelectedDestinationAddress.current = meta;
        await handleDestinationResolve(meta);
      }
    }
  };

  const onPadChange = useCallback((sadType: string, tadType: string) => {
    form?.setFieldValue(sadType, undefined);
    form?.setFieldValue(tadType, undefined);
  }, []);

  const onSadChange = useCallback((tadType: string) => {
    form?.setFieldValue(tadType, undefined);
  }, []);

  const onTadChange = (tadType: string) => {
    if (tadType === undefined) {
      form?.setFieldValue('addressMatchLevel', 'L2');
    }
  };

  const onSearchDeliveredTrips = async () => {
    form.setFields([
      {
        name: `originAddress`,
        errors: [],
      },
      {
        name: `destinationAddress`,
        errors: [],
      },
    ]);
    await form.validateFields([
      'truckTypeIdList',
      'industryIdList',
      'requirementFrequencyList',
      'originPadId',
      'originSadId',
      'destinationPadId',
      'destinationSadId',
      'addressMatchLevel',
      // 'originAddress',
      // 'destinationAddress',
    ]);
    const values = form.getFieldsValue();

    const payload = {
      ...values,
      quotationStart: values?.effectiveTime
        ? dayjs(values?.effectiveTime?.[0]).format('YYYY-MM-DD')
        : undefined,
      quotationEnd: values?.effectiveTime
        ? dayjs(values?.effectiveTime?.[1]).format('YYYY-MM-DD')
        : undefined,
      originAddressLat: curSelectedOriginAddress.current?.lat,
      originAddressLng: curSelectedOriginAddress.current?.lng,
      destinationAddressLat: curSelectedDestinationAddress.current?.lat,
      destinationAddressLng: curSelectedDestinationAddress.current?.lng,
    };
    // delete payload.destinationAddress;
    // delete payload.originAddress;
    delete payload.effectiveTime;
    // delete payload.billingMode;
    // delete payload.effectiveTime;
    searchRef.current = { ...payload };
    searchVersionRef.current = [
      ...new Set([...searchVersionRef.current, 'V1']),
    ];
    onDeliveredTripsSearchHandle?.(payload);
  };
  const onSearchRouteLibrary = async () => {
    setNewPaginationData({
      pageNum: 1,
      pageSize: PAGE_NUMBER,
    });
    await form.validateFields([
      'truckTypeIdList',
      'industryIdList',
      'requirementFrequencyList',
      'originPadId',
      'originSadId',
      'destinationPadId',
      'destinationSadId',
      'addressMatchLevel',
      // 'originAddress',
      // 'destinationAddress',
    ]);
    const values = form.getFieldsValue();

    const pricingMode = values.billingMode;
    if (pricingMode === RouteBillingModeEnum.MILEAGE_BILLING) {
      await form.validateFields(['originAddress', 'destinationAddress']);

      setRouteLibraryLoading(true);
      const [check1, check2] = await Promise.all([
        waybillRouteAddressCheck({
          lat: curSelectedOriginAddress.current?.lat as number,
          lng: curSelectedOriginAddress.current?.lng as number,
          pad: values?.originPadId,
          tad: values?.originTadId,
          sad: values?.originSadId,
        }),
        waybillRouteAddressCheck({
          lat: curSelectedDestinationAddress.current?.lat as number,
          lng: curSelectedDestinationAddress.current?.lng as number,
          pad: values?.destinationPadId,
          tad: values?.destinationTadId,
          sad: values?.destinationSadId,
        }),
      ]).finally(() => {
        setRouteLibraryLoading(false);
      });

      if (!check1?.data?.matched || !check2?.data?.matched) {
        message.error(`The address does not match the region range`);
        return;
      }
    }
    let selected: any[] = [];
    truckTypeList.forEach((item) => {
      if (values?.truckTypeIdList?.includes(item.value)) {
        selected.push(item);
      }
    });
    const payload = {
      ...values,
      quotationStart: values?.effectiveTime
        ? dayjs(values?.effectiveTime?.[0]).format('YYYY-MM-DD')
        : undefined,
      quotationEnd: values?.effectiveTime
        ? dayjs(values?.effectiveTime?.[1]).format('YYYY-MM-DD')
        : undefined,

      originAddressLat: curSelectedOriginAddress.current?.lat,
      originAddressLng: curSelectedOriginAddress.current?.lng,
      destinationAddressLat: curSelectedDestinationAddress.current?.lat,
      destinationAddressLng: curSelectedDestinationAddress.current?.lng,
    };
    // delete payload.destinationAddress;
    // delete payload.originAddress;
    delete payload.effectiveTime;
    searchRef.current = { ...payload };
    searchVersionRef.current = [
      ...new Set([...searchVersionRef.current, 'V2']),
    ];
    onRouteLibrarySearchHandle?.(payload);
  };

  const onReset = () => {
    form.resetFields();
    onDeliveredTripsSearchHandle?.();
    onRouteLibrarySearchHandle?.();
    searchRef.current = undefined;
    searchVersionRef.current = [];
  };

  const handleSelectTruckAll = (value: number[]) => {
    let res: any[] = value;
    if (value.includes(-1)) {
      const hasAll = value.length === truckTypeList.length + 1;
      res = hasAll ? [] : truckTypeList?.map((item) => item.value); // 已选中全部则清空，否则选中全部
    }
    return res;
  };

  const handleSelectIndustryAll = (value: number[]) => {
    if (value.includes(-1)) {
      const hasAll = value.length === industryList.length + 1;
      return hasAll ? [] : industryList?.map((item) => item.value); // 已选中全部则清空，否则选中全部
    }
    return value;
  };

  useEffect(() => {
    getTruckTypeListHandle();
    getIndustryListHandle();
  }, []);

  useEffect(() => {
    setNewPaginationData(paginationData);
  }, [paginationData]);

  useEffect(() => {
    if (billingModeValue === RouteBillingModeEnum.ROUTE_BILLING) {
      form.setFields([
        {
          name: `originAddress`,
          errors: [],
        },
        {
          name: `destinationAddress`,
          errors: [],
        },
      ]);
    }
  }, [billingModeValue]);

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <Form
        name="price-inquiry-filter-form"
        form={form}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={'truckTypeIdList'}
              label={
                <>
                  Truck Type
                  <CustomTooltip
                    titleMaxWidth={350}
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div>
                          When searching for trips, it will match the truck type
                          requested by the customer.
                        </div>
                        <div>
                          When searching the route library, it will match the
                          truck type in the price database.
                        </div>
                      </div>
                    }
                    placement="right"
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </CustomTooltip>
                </>
              }
              rules={[{ required: true, message: 'Please select truck type' }]}
              getValueFromEvent={handleSelectTruckAll}
            >
              <Select
                style={{ width: '100%' }}
                mode="multiple"
                placeholder="Truck Type"
                showSearch
                filterOption={(input: string, option: any) => {
                  return (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
                maxTagCount={12}
                options={[{ label: 'ALL', value: -1 }, ...truckTypeList]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={'industryIdList'}
              label="Industry"
              rules={[{ required: true, message: 'Please select Industry' }]}
              getValueFromEvent={handleSelectIndustryAll}
            >
              <Select
                style={{ width: '100%' }}
                mode="multiple"
                placeholder="Industry"
                showSearch
                filterOption={(input: string, option: any) => {
                  return option?.label
                    ?.toLowerCase()
                    .includes(input?.toLowerCase());
                }}
                maxTagCount={16}
                options={[{ label: 'ALL', value: -1 }, ...industryList]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={'requirementFrequencyList'}
              label="Requirement Frequency"
            >
              <Select
                style={{ width: '100%' }}
                mode="multiple"
                placeholder="Requirement Frequency"
                showSearch
                filterOption={(input: string, option: any) => {
                  return option?.label
                    ?.toLowerCase()
                    .includes(input?.toLowerCase());
                }}
                options={Object.keys(RequirementFrequencyEnumText).map(
                  (key) => ({
                    value: key,
                    label: key,
                  }),
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Spin spinning={originLoading}>
              <Col span={24}>
                <Form.Item
                  name={'originAddress'}
                  label={'Origin'}
                  trigger="onChange"
                  rules={[
                    {
                      required:
                        billingModeValue ===
                        RouteBillingModeEnum.MILEAGE_BILLING,
                      message: 'Please select Origin',
                    },
                  ]}
                >
                  <AutoCompleteSelectNew
                    showLocator
                    showReset
                    placeholder="Enter origin detailed address"
                    onSelect={async (meta: IMeta) => {
                      handleOriginSelect(meta, 'Origin');
                    }}
                    onReset={() => {
                      resetAddress('Origin');
                    }}
                    onClear={() => {
                      resetAddress('Origin');
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={8}>
                    <ProFormSelect
                      name={'originPadId'}
                      label={null}
                      placeholder={labelLevelList?.[1]}
                      showSearch
                      fieldProps={{
                        filterOption: true,
                      }}
                      request={async () => {
                        const payload = {
                          country: countryId,
                          noAllRegion: true,
                        };
                        setOriginLoading(true);
                        const res = await placeGeoRegion(payload);
                        setOriginLoading(false);
                        if (res.code === 200) {
                          return res?.data?.map((item: IPlaceGeoRecord) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                        } else {
                          return [];
                        }
                      }}
                      onChange={() => {
                        onPadChange('originSadId', 'originTadId');
                      }}
                      rules={[
                        {
                          required: true,
                          message: `Please select ${labelLevelList?.[1]}`,
                        },
                      ]}
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSelect
                      name={'originSadId'}
                      label={null}
                      placeholder={labelLevelList?.[2]}
                      dependencies={['originPadId']}
                      showSearch
                      fieldProps={{
                        filterOption: true,
                      }}
                      rules={[
                        {
                          required: true,
                          message: `Please select ${labelLevelList?.[2]}`,
                        },
                      ]}
                      request={async (params) => {
                        if (!params.originPadId) {
                          return [];
                        }
                        const payload = {
                          region: params.originPadId,
                        };
                        setOriginLoading(true);
                        const res = await placeGeoProvince(payload);
                        setOriginLoading(false);
                        if (res.code === 200) {
                          return res?.data?.map((item: IPlaceGeoRecord) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                        } else {
                          return [];
                        }
                      }}
                      onChange={() => {
                        onSadChange('originTadId');
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSelect
                      name={'originTadId'}
                      label={null}
                      placeholder={labelLevelList?.[3]}
                      dependencies={['originPadId', 'originSadId']}
                      showSearch
                      fieldProps={{
                        filterOption: true,
                      }}
                      onChange={onTadChange}
                      request={async (params) => {
                        if (!params.originPadId || !params.originSadId) {
                          return [];
                        }
                        const payload = {
                          province: params.originSadId,
                        };
                        setOriginLoading(true);
                        const res = await placeLeoCity(payload);
                        setOriginLoading(false);
                        if (res.code === 200) {
                          return res?.data?.map((item: IPlaceGeoRecord) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                        } else {
                          return [];
                        }
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Spin>
          </Col>
          <Col span={12}>
            <Spin spinning={destinationLoading}>
              <Col span={24}>
                <Form.Item
                  name={'destinationAddress'}
                  label={'Destination'}
                  trigger="onChange"
                  rules={[
                    {
                      required:
                        billingModeValue ===
                        RouteBillingModeEnum.MILEAGE_BILLING,
                      message: 'Please select Destination',
                    },
                  ]}
                >
                  <AutoCompleteSelectNew
                    showLocator
                    showReset
                    placeholder="Enter origin detailed destination address"
                    onSelect={(meta: IMeta) => {
                      handleOriginSelect(meta, 'Destination');
                    }}
                    onReset={() => {
                      resetAddress('Destination');
                    }}
                    onClear={() => {
                      resetAddress('Destination');
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={8}>
                    <ProFormSelect
                      name={'destinationPadId'}
                      label={null}
                      placeholder={labelLevelList?.[1]}
                      showSearch
                      fieldProps={{
                        filterOption: true,
                      }}
                      rules={[
                        {
                          required: true,
                          message: `Please select ${labelLevelList?.[1]}`,
                        },
                      ]}
                      request={async () => {
                        const payload = {
                          country: countryId,
                          noAllRegion: false,
                        };
                        setDestinationLoading(true);
                        const res = await placeGeoRegion(payload);
                        setDestinationLoading(false);
                        if (res.code === 200) {
                          return res?.data?.map((item: IPlaceGeoRecord) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                        } else {
                          return [];
                        }
                      }}
                      onChange={() => {
                        onPadChange('destinationSadId', 'destinationTadId');
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSelect
                      name={'destinationSadId'}
                      label={null}
                      placeholder={labelLevelList?.[2]}
                      dependencies={['destinationPadId']}
                      showSearch
                      fieldProps={{
                        filterOption: true,
                      }}
                      rules={[
                        {
                          required:
                            destinationPadIdValue !== 1 &&
                            destinationPadIdValue !== 2,
                          message: `Please select ${labelLevelList?.[2]}`,
                        },
                      ]}
                      request={async (params) => {
                        if (!params.destinationPadId) {
                          return [];
                        }
                        const payload = {
                          region: params.destinationPadId,
                        };
                        setDestinationLoading(true);
                        const res = await placeGeoProvince(payload);
                        setDestinationLoading(false);
                        if (res.code === 200) {
                          return res?.data?.map((item: IPlaceGeoRecord) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                        } else {
                          return [];
                        }
                      }}
                      onChange={() => {
                        onSadChange('destinationTadId');
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSelect
                      name={'destinationTadId'}
                      label={null}
                      placeholder={labelLevelList?.[3]}
                      dependencies={['destinationPadId', 'destinationSadId']}
                      showSearch
                      fieldProps={{
                        filterOption: true,
                      }}
                      onChange={onTadChange}
                      request={async (params) => {
                        if (
                          !params.destinationPadId ||
                          !params.destinationSadId
                        ) {
                          return [];
                        }
                        const payload = {
                          province: params.destinationSadId,
                        };
                        setDestinationLoading(true);
                        const res = await placeLeoCity(payload);
                        setDestinationLoading(false);
                        if (res.code === 200) {
                          return res?.data?.map((item: IPlaceGeoRecord) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                        } else {
                          return [];
                        }
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Spin>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name={'addressMatchLevel'}
              label="Address Matching Level​"
              initialValue={'L2'}
              rules={[
                {
                  required: true,
                  message: 'Please select Address Matching Level',
                },
              ]}
            >
              <Radio.Group>
                <Radio value={'L2'}>L2: &nbsp;{labelLevelList?.[2]}</Radio>
                <Radio
                  value={'L3'}
                  disabled={!destinationTadIdValue || !originTadIdValue}
                >
                  L3: &nbsp;{labelLevelList?.[3]}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormSelect
              name="billingMode"
              initialValue={RouteBillingModeEnum.ROUTE_BILLING}
              label={
                <>
                  Pricing Mode
                  <span className={styles.billingMode}>
                    Applicable to search Route library
                  </span>
                </>
              }
              placeholder="Pricing Mode"
              valueEnum={RouteBillingModeEnumText}
              rules={[
                {
                  required: true,
                  message: 'Please select pricing mode',
                },
              ]}
            />
          </Col>
          <Col span={8}>
            <Form.Item
              name={'effectiveTime'}
              label={
                <>
                  Effective Time
                  <span className={styles.billingMode}>
                    Applicable to search Route library
                  </span>
                </>
              }
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button type="primary" onClick={onSearchDeliveredTrips}>
            Search Delivered Trips
          </Button>
          <Button
            type="primary"
            onClick={onSearchRouteLibrary}
            loading={routeLibraryLoading}
          >
            Search Route Library
          </Button>
          <Button onClick={onReset}>Reset</Button>
          <Button
            key="Export"
            ref={exportRef}
            disabled={!searchRef.current}
            onClick={() => onExportRecords()}
            type="primary"
            loading={exportLoading}
          >
            Export
          </Button>
        </Space>
      </Form>
    </>
  );
}
