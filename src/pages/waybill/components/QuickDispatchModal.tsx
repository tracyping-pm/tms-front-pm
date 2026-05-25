import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { IPlaceGeoRecord } from '@/api/types/place';
import { IProjectRecord } from '@/api/types/project';
import { IQuickDispatchParams } from '@/api/types/waybill';
import {
  checkCreateDispatch,
  createQuickDispatch,
  getWaybillRouteByCode,
  waybillRouteAddressLatLngFill,
} from '@/api/waybill';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import { IMeta } from '@/components/LocatorModal';
import { ES_DTO_CLASS, MAX_LENGTH, PATHS } from '@/constants';
import {
  CountryEnumLabelListMap,
  CountryRegionNameText,
  FieldQueryHighlightTypeEnum,
  WaybillDispatchTypeEnum,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { QuickDispatchMapClass } from '@/utils/quickDispatchMap';
import { openNewTag } from '@/utils/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { App, Button, Checkbox, Col, Form, Row, Spin } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import { useCallback, useRef, useState } from 'react';
import styles from './common.less';

type IWaybillModal = ModalFormProps & {
  projectDetail?: IProjectRecord;
  hideModal?: () => void;
};

export default function QuickDispatchModal({
  width = 480,
  hideModal,
  projectDetail,
  modalProps,
  ...restProps
}: IWaybillModal) {
  const { message, modal } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const [checked, setChecked] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [originLoading, setOriginLoading] = useState<boolean>(false);
  const [destinationLoading, setDestinationLoading] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const formParams = useRef<any>({});
  const { ready, region } = useGoogleMap();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];

  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const {
    options: routeCodeOptions,
    onSearch: routeCodeSearch,
    defaultFieldProps: routeCodeDefaultFieldProps,
  } = useFieldQuery({
    field: 'routeCode',
    esDtoClass: ES_DTO_CLASS.ROUTE,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
    projectId: projectDetail ? projectDetail.id : undefined,
    approved: 1,
  });

  const projectNameChange = () => {
    formRef.current?.resetFields?.(['routeCode']);
  };

  // const switchAddress = () => {
  //   const values = formRef.current?.getFieldsValue();
  //   const address = curOriginAddress.current;
  //   curOriginAddress.current = curDestinationAddress.current;
  //   curDestinationAddress.current = address;
  //   const origin = {
  //     originPad: values.originPad,
  //     originSad: values.originSad,
  //     originTad: values.originTad,
  //     originAddress: values.originAddress,
  //     originLat: formParams.current?.originLat,
  //     originLng: formParams.current?.originLng,
  //     destinationLat: formParams.current?.destinationLat,
  //     destinationLng: formParams.current?.destinationLng,
  //   };
  //   formRef.current?.setFieldsValue({
  //     originPad: values.destinationPad,
  //     originSad: values.destinationSad,
  //     originTad: values.destinationTad,
  //     originAddress: values.destinationAddress,
  //     destinationPad: origin.originPad,
  //     destinationSad: origin.originSad,
  //     destinationTad: origin.originTad,
  //     destinationAddress: origin.originAddress,
  //   });
  //   formParams.current = {
  //     ...formParams.current,
  //     originLat: origin.destinationLat,
  //     originLng: origin.destinationLng,
  //     destinationLat: origin.originLat,
  //     destinationLng: origin.originLng,
  //   };
  // };

  const checkChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  const selectOriAddress = async (meta: IMeta) => {
    if (!lodash.isEmpty(meta)) {
      formParams.current = {
        ...formParams.current,
        originLat: meta.lat,
        originLng: meta.lng,
      };
    }
  };

  const selectDesAddress = async (meta: IMeta) => {
    if (!lodash.isEmpty(meta)) {
      formParams.current = {
        ...formParams.current,
        destinationLat: meta.lat,
        destinationLng: meta.lng,
      };
    }
  };

  const onRouteCodeSearch = async () => {
    await formRef.current?.validateFields(['routeCode']);
    const project = formRef.current?.getFieldValue('projectName');
    const routeCode = formRef.current?.getFieldValue('routeCode');
    // if (!value?.trim?.()) {
    //   message.warning('Please enter information first');
    //   return;
    // }
    if (!project?.id) {
      message.warning('Please enter the project name first');
      return;
    }
    const resetFields = [
      'originPad',
      'originSad',
      'originTad',
      'originAddress',
      'destinationPad',
      'destinationSad',
      'destinationTad',
      'destinationAddress',
    ];
    formRef.current?.resetFields(resetFields);
    setSearchLoading(true);
    setOriginLoading(true);
    setDestinationLoading(true);
    const res = await getWaybillRouteByCode({
      routeCode: routeCode.name,
      projectId: project.id,
    });
    if (res.code === 200) {
      if (res.data?.origin) {
        message.success('Route has been found and selected');
        formRef.current?.setFieldsValue({
          originPad: res.data?.origin?.padId,
          originSad: res.data?.origin?.sadId,
          originTad: res.data?.origin?.tadId,
          originAddress: res.data?.origin?.address,
          destinationPad: res.data?.destination?.padId,
          destinationSad: res.data?.destination?.sadId,
          destinationTad: res.data?.destination?.tadId,
          destinationAddress: res.data?.destination?.address,
        });
        formParams.current = {
          ...formParams.current,
          originLat: res.data?.origin?.lat,
          originLng: res.data?.origin?.lng,
          destinationLat: res.data?.destination?.lat,
          destinationLng: res.data?.destination?.lng,
        };
      } else {
        message.warning('Unable to find related Route');
      }
    }
    setSearchLoading(false);
    setOriginLoading(false);
    setDestinationLoading(false);
  };

  const continueReset = () => {
    formRef.current?.setFieldsValue({
      externalCode: undefined,
      destinationPad: undefined,
      destinationSad: undefined,
      destinationTad: undefined,
      destinationAddress: undefined,
      destinationTime: undefined,
      routeCode: undefined,
    });
  };

  const checkLatLng = async (type: 'origin' | 'destination') => {
    return new Promise((resolve, reject) => {
      const isEmpty = (val: any) => {
        return val === null || val === undefined || val === '';
      };

      const _check = (item: any) => {
        return item.address && (isEmpty(item.lat) || isEmpty(item.lng));
      };
      const noLatLngList: any[] = [];
      const values = formRef.current?.getFieldsValue();
      const padId = values[`${type}Pad`];
      const sadId = values[`${type}Sad`];
      const tadId = values[`${type}Tad`];
      const address = values[`${type}Address`];

      const lat = formParams.current[`${type}Lat`];
      const lng = formParams.current[`${type}Lng`];

      const vidSymbol = type === 'origin' ? 'O' : 'D';
      const vid = `${vidSymbol}${padId}${sadId}${tadId}`;

      const obj = {
        type,
        vid,
        padId,
        sadId,
        tadId,
        address,
        lat,
        lng,
      };
      const noLatLng = _check(obj);
      if (noLatLng) {
        noLatLngList.push(obj);
      }

      if (noLatLngList?.length > 0) {
        const latLngList = lodash.map(noLatLngList, (item) =>
          lodash.pick(item, ['vid', 'padId', 'sadId', 'tadId', 'address']),
        );
        const payload = {
          latLngList: latLngList,
        };
        if (type === 'origin') {
          setOriginLoading(true);
        } else {
          setDestinationLoading(true);
        }
        waybillRouteAddressLatLngFill(payload)
          .then((res) => {
            if (res.code === 200) {
              if (res.data?.length > 0) {
                noLatLngList.forEach((item) => {
                  const activeItem = res.data?.find(
                    (resItem) => resItem.vid === item.vid,
                  );
                  if (activeItem) {
                    const mergeItem = lodash.merge({}, item, activeItem);
                    const itemType = mergeItem.type;

                    if (mergeItem.mateSuccess) {
                      formParams.current = {
                        ...formParams.current,
                        [`${itemType}Lat`]: mergeItem.lat,
                        [`${itemType}Lng`]: mergeItem.lng,
                      };
                      resolve(true);
                    } else {
                      const fieldName = `${itemType}Address`;
                      formRef?.current?.setFields([
                        {
                          name: fieldName,
                          // value: undefined,
                          errors: [
                            'The address does not match the region range',
                          ],
                        },
                      ]);
                      reject();
                    }
                  } else {
                    console.error('api error');
                    reject();
                  }
                });
              } else {
                console.error('api error');
                reject();
              }
            } else {
              reject();
            }
          })
          .catch(() => {
            reject();
          })
          .finally(() => {
            if (type === 'origin') {
              setOriginLoading(false);
            } else {
              setDestinationLoading(false);
            }
          });
      } else {
        resolve(true);
      }
    });
  };

  const handleResolve = async (
    name: 'origin' | 'destination',
    meta?: IMeta,
  ) => {
    const nameAddress = `${name}Address`;
    await formRef.current?.validateFields([nameAddress]);
    if (!meta?.lat || !meta?.lng) {
      formRef.current?.setFields([
        {
          name: [nameAddress],
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }
    if (name === 'origin') {
      setOriginLoading(true);
    } else {
      setDestinationLoading(true);
    }
    await checkLatLng(name);
    if (name === 'origin') {
      setOriginLoading(false);
    } else {
      setDestinationLoading(false);
    }
    const params = {
      level: 3,
      lat: formParams.current[`${name}Lat`],
      lng: formParams.current[`${name}Lng`],
    };
    if (name === 'origin') {
      setOriginLoading(true);
    } else {
      setDestinationLoading(true);
    }
    const res = await placeGeoResolveAddressResult(params);
    if (name === 'origin') {
      setOriginLoading(false);
    } else {
      setDestinationLoading(false);
    }
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        [`${name}Pad`]: res.data.pad,
        [`${name}Sad`]: res.data.sad,
        [`${name}Tad`]: res.data.tad,
      });
    }
  };

  const submit = useCallback(async () => {
    if (!ready) {
      console.error('map loader not ready');
      return;
    }
    const errors = formRef.current?.getFieldsError?.();
    const hasError = errors?.some((item: any) => item.errors?.length);

    if (hasError) {
      return;
    }
    await formRef.current?.validateFields?.();

    const values = formRef.current?.getFieldsValue?.();

    try {
      setSubmitLoading(true);
      // 校验有address的情况下，是否有lat lng
      await Promise.all([checkLatLng('origin'), checkLatLng('destination')]);
      let payload = {
        externalCode: values?.externalCode,
        projectId: values.projectName.id,
        positionTime: values.positionTime
          ? dayjs(values.positionTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        destinationTime: values.destinationTime
          ? dayjs(values.destinationTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        routeCode: values.routeCode?.name ?? undefined,
        originPad: values.originPad,
        originSad: values.originSad ?? undefined,
        originTad: values.originTad ?? undefined,
        originLat: formParams.current.originLat,
        originLng: formParams.current.originLng,
        originAddress: values.originAddress,
        destinationPad: values.destinationPad,
        destinationSad: values.destinationSad ?? undefined,
        destinationTad: values.destinationTad ?? undefined,
        destinationLat: formParams.current.destinationLat,
        destinationLng: formParams.current.destinationLng,
        destinationAddress: values.destinationAddress,
      };

      const pointList = [
        {
          lat: payload.originLat,
          lng: payload.originLng,
          address: payload.originAddress,
        },
        {
          lat: payload.destinationLat,
          lng: payload.destinationLng,
          address: payload.destinationAddress,
        },
      ];
      setSubmitLoading(true);
      const instance = new QuickDispatchMapClass(pointList, region);
      const res = await instance.getResult();
      payload = {
        ...payload,
        //@ts-ignore
        mapJsonStr: res?.mapJsonStr,
        distance: res?.distance,
        duration: res?.duration,
      };
      const check = await checkCreateDispatch(payload as IQuickDispatchParams);
      setSubmitLoading(false);
      if (check.code === 200) {
        modal.confirm({
          title: 'Confirm',
          icon: <ExclamationCircleFilled />,
          content:
            check.data === WaybillDispatchTypeEnum.STANDARD_DISPATCH
              ? 'Confirm creation of Standard Waybill'
              : 'Confirm creation of Temporary Waybill',
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            const create = await createQuickDispatch(
              payload as IQuickDispatchParams,
            );
            if (create.code === 200) {
              message.success('Quick dispatch successfully!');
              if (checked) {
                continueReset();
              } else {
                openNewTag(
                  `${PATHS.WAYBILL_LIST_DETAIL}/${create.data}?type=blank`,
                );
                hideModal?.();
              }
            }
          },
        });
      }
    } catch (e) {
      setSubmitLoading(false);
    }
  }, [ready, checked]);

  return (
    <ModalForm
      name="quicky-disaptch-modal"
      open={true}
      title={'Quick Dispatch'}
      width={width}
      formRef={formRef}
      modalProps={{
        ...modalProps,
        okText: 'Confirm',
        forceRender: true,
        onCancel: hideModal,
        maskClosable: false,
        className: styles.quick,
      }}
      initialValues={{
        projectName: projectDetail
          ? {
              id: projectDetail.id,
              value: projectDetail.id,
              label: projectDetail.projectName,
            }
          : undefined,
        positionTime: dayjs().startOf('hour'),
      }}
      submitter={{
        render: () => (
          <div className={styles.quick_footer}>
            <Checkbox checked={checked} onChange={checkChange}>
              Create another Waybill
            </Checkbox>
            <div>
              <Button
                key="rest"
                onClick={() => {
                  hideModal?.();
                }}
              >
                Cancel
              </Button>
              <Button
                key="submit"
                type="primary"
                loading={submitLoading}
                onClick={() => submit()}
              >
                Create
              </Button>
            </div>
          </div>
        ),
      }}
      {...restProps}
    >
      {/*<div>*/}
      {/*  <div className={styles.quick_title}>*/}
      {/*    <div className={styles.quick_title_left}>Transportation Needs</div>*/}
      {/*    <Button>Resolve</Button>*/}
      {/*  </div>*/}
      {/*  <ProFormTextArea*/}
      {/*    placeholder="Please enter the customer's transportation requirements and click Resolve after completing the input"*/}
      {/*    name="transportationNeeds"*/}
      {/*    rules={[*/}
      {/*      {*/}
      {/*        max: MAX_LENGTH.NOTE,*/}
      {/*        message: 'Maximum input length is 500 characters',*/}
      {/*      },*/}
      {/*    ]}*/}
      {/*  />*/}
      {/*</div>*/}
      <div>
        <div className={styles.quick_title}>
          <div className={styles.quick_title_left}>Waybill Information</div>
        </div>
        <Row gutter={[60, 0]}>
          <Col span={12}>
            <ProFormSelect
              label="Project name"
              name="projectName"
              placeholder="Project name"
              rules={[
                {
                  required: true,
                  message:
                    'Please select the project corresponding to the waybill',
                },
              ]}
              valuePropName={!!projectDetail ? 'value' : 'name'}
              disabled={!!projectDetail}
              fieldProps={{
                ...projectNameDefaultFieldProps,
                onSearch: projectNameSearch,
                defaultActiveFirstOption: false,
                filterOption: false,
                options: projectNameOptions,
                onChange: projectNameChange,
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              label="External Code"
              name="externalCode"
              placeholder="External Code"
              rules={[
                {
                  max: MAX_LENGTH.NAME,
                  message: `External code cannot exceed ${MAX_LENGTH.NAME} characters`,
                },
              ]}
            />
          </Col>
        </Row>
      </div>
      <div>
        <div className={styles.quick_title}>
          <div className={styles.quick_title_left}>Time</div>
        </div>
        <Row gutter={[60, 0]}>
          <Col span={12}>
            <ProFormDateTimePicker
              name="positionTime"
              label="Position Time"
              rules={[
                { required: true, message: 'Please set the position time' },
              ]}
              placeholder="Position Time"
              fieldProps={{
                style: { width: '100%' },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormDateTimePicker
              name="destinationTime"
              label="Required Delivery Time"
              placeholder="Required Delivery Time"
              rules={[
                {
                  validator: (rule, value) => {
                    if (!value) {
                      return Promise.resolve();
                    } else {
                      const positionTime =
                        formRef.current?.getFieldValue('positionTime');
                      if (dayjs(value).isAfter(dayjs(positionTime), 's')) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          'Required Delivery Time needs to be later than position time',
                        );
                      }
                    }
                  },
                },
              ]}
              fieldProps={{
                style: { width: '100%' },
                showTime: { defaultValue: dayjs().startOf('hour') },
              }}
            />
          </Col>
        </Row>
      </div>
      <div className={styles.quick_search}>
        <div className={styles.quick_title}>
          <div className={styles.quick_title_left}>Route Code</div>
        </div>
        <div className={styles.quick_search_input_wrap}>
          <ProFormDependency name={['projectName']}>
            {({ projectName }) => {
              return (
                <>
                  <div className={styles.quick_search_input_wrap_input}>
                    <ProFormSelect
                      name="routeCode"
                      label={null}
                      placeholder="Please enter route code"
                      disabled={!projectName?.id}
                      valuePropName={'name'}
                      rules={[
                        {
                          required: true,
                          message: 'Please enter information first',
                        },
                      ]}
                      fieldProps={{
                        ...routeCodeDefaultFieldProps,
                        onSearch: (keywords) =>
                          routeCodeSearch(keywords, {
                            projectId: Number(projectName.id),
                          }),
                        options: routeCodeOptions,
                      }}
                    />
                  </div>
                  <Button
                    disabled={!projectName?.id}
                    loading={searchLoading}
                    onClick={() => onRouteCodeSearch()}
                  >
                    Search
                  </Button>
                </>
              );
            }}
          </ProFormDependency>
        </div>
      </div>
      <div>
        <Row>
          <Col span={11}>
            <Spin spinning={originLoading}>
              <div className={styles.quick_label}>Origin</div>
              <ProFormSelect
                name="originPad"
                label={CountryRegionNameText[countryId as number][0]}
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{ style: { width: '280px' }, filterOption: true }}
                rules={[
                  {
                    required: true,
                    message: 'Please complete the Origin information',
                  },
                ]}
                request={async () => {
                  const payload = {
                    country: countryId!,
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
                  formRef.current?.setFieldValue('originSad', undefined);
                  formRef.current?.setFieldValue('originTad', undefined);
                  // formRef.current?.setFieldValue('originAddress', undefined);
                }}
              />
              <ProFormSelect
                name="originSad"
                label={CountryRegionNameText[countryId as number][1]}
                dependencies={['originPad']}
                showSearch
                fieldProps={{ style: { width: '280px' }, filterOption: true }}
                placeholder={labelLevelList?.[2]}
                request={async (params) => {
                  if (!params.originPad) {
                    return [];
                  }
                  const payload = {
                    region: params.originPad,
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
                  formRef.current?.setFieldValue('originTad', undefined);
                  // formRef.current?.setFieldValue('originAddress', undefined);
                }}
              />
              <ProFormSelect
                name="originTad"
                label={CountryRegionNameText[countryId as number][2]}
                dependencies={['originPad', 'originSad']}
                showSearch
                fieldProps={{ style: { width: '280px' }, filterOption: true }}
                placeholder={labelLevelList?.[3]}
                request={async (params) => {
                  if (!params.originPad || !params.originSad) {
                    return [];
                  }
                  const payload = {
                    province: params.originSad,
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
                onChange={() => {
                  // formRef.current?.setFieldValue('originAddress', undefined);
                }}
              />
              <Form.Item
                label={'Address'}
                name={'originAddress'}
                shouldUpdate
                rules={[{ required: true }]}
              >
                <AutoCompleteSelectNew
                  showResolve
                  onSelect={(meta) => selectOriAddress(meta)}
                  onResolve={(meta) => handleResolve('origin', meta)}
                />
              </Form.Item>
            </Spin>
          </Col>
          <Col
            span={2}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/*<DispatchSwitchIcon*/}
            {/*  onClick={switchAddress}*/}
            {/*  style={{ cursor: 'pointer', marginTop: '12px' }}*/}
            {/*/>*/}
          </Col>
          <Col
            span={11}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'end',
            }}
          >
            <Spin spinning={destinationLoading}>
              <div className={styles.quick_label}>Destination</div>
              <ProFormSelect
                name="destinationPad"
                label={CountryRegionNameText[countryId as number][0]}
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{ style: { width: '280px' }, filterOption: true }}
                rules={[
                  {
                    required: true,
                    message: 'Please complete the Destination information',
                  },
                ]}
                request={async () => {
                  const payload = {
                    country: countryId!,
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
                  formRef.current?.setFieldValue('destinationSad', undefined);
                  formRef.current?.setFieldValue('destinationTad', undefined);
                  // formRef.current?.setFieldValue('destinationAddress', undefined);
                }}
              />
              <ProFormSelect
                name="destinationSad"
                label={CountryRegionNameText[countryId as number][1]}
                dependencies={['destinationPad']}
                showSearch
                fieldProps={{ style: { width: '280px' }, filterOption: true }}
                placeholder={labelLevelList?.[2]}
                request={async (params) => {
                  if (!params.destinationPad) {
                    return [];
                  }
                  const payload = {
                    region: params.destinationPad,
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
                  formRef.current?.setFieldValue('destinationTad', undefined);
                  // formRef.current?.setFieldValue('destinationAddress', undefined);
                }}
              />
              <ProFormSelect
                name="destinationTad"
                label={CountryRegionNameText[countryId as number][2]}
                dependencies={['destinationPad', 'destinationSad']}
                showSearch
                fieldProps={{ style: { width: '280px' }, filterOption: true }}
                placeholder={labelLevelList?.[3]}
                request={async (params) => {
                  if (!params.destinationPad || !params.destinationSad) {
                    return [];
                  }
                  const payload = {
                    province: params.destinationSad,
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
                onChange={() => {
                  // formRef.current?.setFieldValue('destinationAddress', undefined);
                }}
              />
              <Form.Item
                label={'Address'}
                name={'destinationAddress'}
                shouldUpdate
                rules={[{ required: true }]}
              >
                <AutoCompleteSelectNew
                  showResolve
                  onSelect={(meta) => selectDesAddress(meta)}
                  onResolve={(meta) => handleResolve('destination', meta)}
                />
              </Form.Item>
            </Spin>
          </Col>
        </Row>
      </div>
    </ModalForm>
  );
}
