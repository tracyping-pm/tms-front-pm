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
} from '@/enums';
import { ProFormSelect } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  App,
  Button,
  Col,
  DatePicker,
  Form,
  Radio,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getUserGuidanceUpdate } from '@/api-uam/common';
import { priceWaybillExportV2 } from '@/api/tool';
import { waybillRouteAddressCheck } from '@/api/waybill';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';

const { RangePicker } = DatePicker;
interface IProps {
  onSearchHandle: (v?: any) => void;
  setSelectedTruck: (v?: any) => void;
}

export default function Header({ onSearchHandle, setSelectedTruck }: IProps) {
  const { message } = App.useApp();
  const { initialState: userInfo, setInitialState: setUserInfo } =
    useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId ?? 1;

  const completedGuidance =
    userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;

  //@ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];

  const [form] = Form.useForm();

  const destinationPadIdValue = Form.useWatch('destinationPadId', form);
  const originTadIdValue = Form.useWatch('originTadId', form);
  const destinationTadIdValue = Form.useWatch('destinationTadId', form);

  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [truckTypeList, setTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  const [originLoading, setOriginLoading] = useState<boolean>(false);
  const [destinationLoading, setDestinationLoading] = useState<boolean>(false);

  const [industryList, setIndustryList] = useState<IIndustryRecord[]>([]);

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
    const res = await priceWaybillExportV2(searchRef.current).finally(() => {
      setExportLoading(false);
    });
    if (res.code === 200) {
      message.success('Export successfully');
      doDownloadCenterAnimate();
    }
  }, [searchRef.current]);

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
  }, [completedGuidance]);

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

  const onSearch = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
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
    ]);
    if (!check1?.data?.matched || !check2?.data?.matched) {
      message.error(`The address does not match the region range`);
      return;
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
      customerOrVendor: values?.customerOrVendor,
      originAddressLat: curSelectedOriginAddress.current?.lat,
      originAddressLng: curSelectedOriginAddress.current?.lng,
      destinationAddressLat: curSelectedDestinationAddress.current?.lat,
      destinationAddressLng: curSelectedDestinationAddress.current?.lng,
    };
    delete payload.destinationAddress;
    delete payload.originAddress;
    searchRef.current = { ...payload };
    setSelectedTruck(selected);
    onSearchHandle?.(payload);
  };
  const onReset = () => {
    form.resetFields();
    onSearchHandle?.();
    searchRef.current = undefined;
  };

  useEffect(() => {
    getTruckTypeListHandle();
    getIndustryListHandle();
  }, []);

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
          <Col span={12}>
            <Form.Item
              name={'truckTypeIdList'}
              label="Truck Type"
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
                maxTagCount={16}
                options={[{ label: 'ALL', value: -1 }, ...truckTypeList]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
        </Row>
        <Row gutter={16}>
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
          <Col span={8}>
            <Form.Item
              name={'customerOrVendor'}
              label="Customer / Vendor"
              rules={[{ required: true, message: 'Please select' }]}
            >
              <Select
                style={{ width: '100%' }}
                placeholder="Customer / Vendor"
                options={[
                  { label: 'Customer', value: true },
                  { label: 'Vendor', value: false },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'effectiveTime'} label="Effective Time">
              <RangePicker style={{ width: '100%' }} />
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
                  rules={[{ required: true, message: 'Please select' }]}
                >
                  <AutoCompleteSelectNew
                    showLocator
                    showReset
                    placeholder="Enter origin detailed address"
                    onSelect={(meta: IMeta) => {
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
                  rules={[{ required: true, message: 'Please select' }]}
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

        <Space>
          <Button type="primary" onClick={onSearch}>
            Search
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
