import { placeGeoProvince, placeGeoRegion, placeLeoCity } from '@/api/place';
import { addChangeLibraryRoute } from '@/api/project';
import { IPlaceGeoRecord } from '@/api/types/place';
import { IAddChangeLibraryRouteParams } from '@/api/types/project';
import { waybillRouteAddressCheck } from '@/api/waybill';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import CustomFormInput from '@/components/CustomFormInput';
import { IMeta } from '@/components/LocatorModal';
import { MAX_LENGTH } from '@/constants';
import { CountryEnumLabelListMap } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { App, Col, Form, Row, Spin } from 'antd';
import _ from 'lodash';
import { useRef, useState } from 'react';

type ICustomerModal = ModalFormProps & {
  formDefaultValue?: IAddChangeLibraryRouteParams;
  hideModal: () => void;
  refresh: () => void;
  doNotify?: () => void;
};

const LabelTitle = (props: { title: string; required?: boolean }) => {
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '10px',
        fontSize: '16px',
        color: '#1F1F1F',
        fontWeight: 700,
      }}
    >
      {props.title}
      {props?.required ? (
        <p style={{ margin: 0, color: '#FF4D4F' }}>*</p>
      ) : null}
    </div>
  );
};

const RouteModal = ({
  formDefaultValue,
  width = 913,
  refresh,
  hideModal,
  doNotify,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { id: libraryId } = useParams();
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const formRef = useRef<ProFormInstance>();
  const [destinationCity, setDestinationCity] = useState<
    null | IPlaceGeoRecord[]
  >([]);
  const [originCity, setOriginCity] = useState<null | IPlaceGeoRecord[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [isOriginMatched, setIsOriginMatched] = useState<boolean>(true);
  const [isDestinationMatched, setIsDestinationMatched] =
    useState<boolean>(true);

  const countryId = initialState?.currentUser?.countryId;

  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];

  const submit = async () => {
    const FieldError = await formRef?.current?.getFieldsError?.();
    const hasError = FieldError?.some((item) => item.errors?.length);
    if (hasError) {
      return;
    }
    setPageLoading(true);
    const values = formRef?.current?.getFieldsValue?.(true);
    let payload, res;
    if (formDefaultValue?.id) {
      payload = {
        id: formDefaultValue.id,
        routeLibraryId: Number(libraryId),
        ...values,
      };
      res = await addChangeLibraryRoute(payload);
    } else {
      payload = {
        routeLibraryId: Number(libraryId),
        ...values,
      };
      res = await addChangeLibraryRoute(payload);
    }
    setPageLoading(false);
    if (res.code === 200) {
      refresh();
      hideModal();
      message.success(`${formDefaultValue?.id ? 'Edit' : 'Add'} successfully!`);
    }
  };

  const validatorRule = () => {
    const {
      originPad,
      originSad,
      originTad,
      destinationPad,
      destinationSad,
      destinationTad,
    } = formRef?.current?.getFieldsValue([
      'originPad',
      'originSad',
      'originTad',
      'destinationPad',
      'destinationSad',
      'destinationTad',
    ]);
    if (
      originPad &&
      originSad &&
      originTad &&
      destinationPad &&
      destinationSad &&
      destinationTad &&
      originPad === destinationPad &&
      originSad === destinationSad &&
      originTad === destinationTad
    ) {
      return Promise.resolve();
      // return Promise.reject(
      //   new Error('Origin and Destination cannot be the same location'),
      // );
    } else {
      return Promise.resolve();
    }
  };

  const resetAddress = (type: 'origin' | 'destination') => {
    formRef?.current?.setFieldsValue({
      [`${type}Lat`]: undefined,
      [`${type}Lng`]: undefined,
    });
    formRef?.current?.setFields([
      {
        name: `${type}Address`,
        value: undefined,
        errors: [],
      },
    ]);
    if (type === 'origin') {
      setIsOriginMatched(true);
    } else {
      setIsDestinationMatched(true);
    }
  };

  const onAddressSelect = async (
    meta: IMeta,
    type: 'origin' | 'destination',
  ) => {
    if (!_.isEmpty(meta)) {
      const { lat, lng } = meta;
      const values = formRef?.current?.getFieldsValue?.();
      const payload = {
        pad: values?.[`${type}Pad`],
        sad: values?.[`${type}Sad`],
        tad: values?.[`${type}Tad`],
        lat,
        lng,
      };

      const fieldName = `${type}Address`;
      setPageLoading(true);
      const res = await waybillRouteAddressCheck(payload, true);
      setPageLoading(false);

      if (res.code === 200) {
        const { matched, toAdd } = res.data;
        if (type === 'origin') {
          setIsOriginMatched(matched);
        } else {
          setIsDestinationMatched(matched);
        }

        if (matched) {
          formRef?.current?.setFieldsValue({
            [`${type}Lat`]: lat,
            [`${type}Lng`]: lng,
          });
          formRef?.current?.setFields([
            {
              name: fieldName,
              // value: undefined,
              errors: [],
            },
          ]);
        } else {
          if (toAdd) {
            doNotify?.();
          } else {
            formRef?.current?.setFields([
              {
                name: fieldName,
                // value: undefined,
                errors: ['The address does not match the region range'],
              },
            ]);
          }
        }
      } else {
        if (type === 'origin') {
          setIsOriginMatched(false);
        } else {
          setIsDestinationMatched(false);
        }
        formRef?.current?.setFields([
          {
            name: fieldName,
            // value: undefined,
            errors: ['The address does not match the region range'],
          },
        ]);
      }
    } else {
      console.error('placeDetail: ', meta);
    }
  };

  return (
    <>
      <ModalForm
        name="route-modal-form"
        open={true}
        title={`${formDefaultValue?.id ? 'Modify' : 'Add'} Route`}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
        }}
        initialValues={{
          originPad: formDefaultValue?.originPad || null,
          originSad: formDefaultValue?.originSad || null,
          originTad: formDefaultValue?.originTad || null,
          originAddress: formDefaultValue?.originAddress || null,
          originLat: formDefaultValue?.originLat || null,
          originLng: formDefaultValue?.originLng || null,
          originLabel: formDefaultValue?.originLabel || null,
          wayPoint: formDefaultValue?.wayPoint || null,
          destinationPad: formDefaultValue?.destinationPad || null,
          destinationSad: formDefaultValue?.destinationSad || null,
          destinationTad: formDefaultValue?.destinationTad || null,
          destinationAddress: formDefaultValue?.destinationAddress || null,
          destinationLat: formDefaultValue?.destinationLat || null,
          destinationLng: formDefaultValue?.destinationLng || null,
          destinationLabel: formDefaultValue?.destinationLabel || null,
          routeCode: formDefaultValue?.routeCode || null,
        }}
        onFinish={submit}
        loading={pageLoading}
        {...restProps}
      >
        <LabelTitle title="Origin" required />
        <Spin spinning={pageLoading}>
          <Row gutter={[12, 0]}>
            <Col span={8}>
              <ProFormSelect
                name="originPad"
                label={labelLevelList?.[1]}
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                rules={[
                  {
                    required: true,
                    message: `Please select at least one administrative region`,
                  },
                  {
                    validator: () => validatorRule(),
                  },
                ]}
                request={async () => {
                  setOriginCity(null);
                  const payload = {
                    country: countryId!,
                    noAllRegion: true,
                  };
                  const res = await placeGeoRegion(payload);
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
                  resetAddress('origin');
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="originSad"
                label={labelLevelList?.[2]}
                placeholder={labelLevelList?.[2]}
                dependencies={['originPad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  setOriginCity(null);
                  if (!params.originPad) {
                    return [];
                  }
                  const payload = {
                    region: params.originPad,
                  };
                  const res = await placeGeoProvince(payload);
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
                rules={[
                  {
                    validator: () => validatorRule(),
                  },
                ]}
                onChange={() => {
                  formRef.current?.setFieldValue('originTad', undefined);
                  resetAddress('origin');
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="originTad"
                label={labelLevelList?.[3]}
                disabled={Array.isArray(originCity) && !originCity.length}
                placeholder={labelLevelList?.[3]}
                dependencies={['originPad', 'originSad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                rules={[
                  {
                    validator: () => validatorRule(),
                  },
                ]}
                request={async (params) => {
                  if (!params.originPad || !params.originSad) {
                    return [];
                  }
                  const payload = {
                    province: params.originSad,
                  };
                  const res = await placeLeoCity(payload);
                  if (res.code === 200) {
                    setOriginCity(res.data);
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
                  resetAddress('origin');
                }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={8}>
              <Form.Item
                name="originLabel"
                label="Origin Label"
                rules={[
                  {
                    whitespace: true,
                    message: 'Cannot only contain spaces',
                  },
                  {
                    max: MAX_LENGTH.MAX_1000,
                    message: `Origin Label cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
                  },
                ]}
              >
                <CustomFormInput placeholder="Origin Label" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <ProFormDependency name={['originPad']}>
                {({ originPad }) => {
                  return (
                    <Form.Item
                      name={'originAddress'}
                      label={'Address'}
                      trigger="onChange"
                      rules={[
                        {
                          validator: () => {
                            if (!isOriginMatched) {
                              return Promise.reject(
                                new Error(
                                  'The address does not match the region range',
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <AutoCompleteSelectNew
                        defaultMeta={
                          formDefaultValue
                            ? {
                                address: formDefaultValue?.originAddress,
                                lat: formDefaultValue?.originLat,
                                lng: formDefaultValue?.originLng,
                              }
                            : undefined
                        }
                        showLocator
                        disabled={!originPad}
                        placeholder="Address"
                        onSelect={(meta: IMeta) =>
                          onAddressSelect(meta, 'origin')
                        }
                        onClear={() => {
                          resetAddress('origin');
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </ProFormDependency>
            </Col>
          </Row>

          <LabelTitle title="Destination" required />
          <Row gutter={[12, 0]}>
            <Col span={8}>
              <ProFormSelect
                name="destinationPad"
                label={labelLevelList?.[1]}
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                rules={[
                  {
                    required: true,
                    message: `Please select at least one administrative region`,
                  },
                  {
                    validator: () => validatorRule(),
                  },
                ]}
                request={async () => {
                  setDestinationCity(null);
                  const payload = {
                    country: countryId!,
                    noAllRegion: false,
                  };
                  const res = await placeGeoRegion(payload);
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
                  resetAddress('destination');
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="destinationSad"
                label={labelLevelList?.[2]}
                placeholder={labelLevelList?.[2]}
                dependencies={['destinationPad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  setDestinationCity(null);
                  if (!params.destinationPad) {
                    return [];
                  }
                  const payload = {
                    region: params.destinationPad,
                  };
                  const res = await placeGeoProvince(payload);
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
                rules={[
                  {
                    validator: () => validatorRule(),
                  },
                ]}
                onChange={() => {
                  formRef.current?.setFieldValue('destinationTad', undefined);
                  resetAddress('destination');
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="destinationTad"
                disabled={
                  Array.isArray(destinationCity) && !destinationCity.length
                }
                label={labelLevelList?.[3]}
                placeholder={labelLevelList?.[3]}
                dependencies={['destinationPad', 'destinationSad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                rules={[
                  {
                    validator: () => validatorRule(),
                  },
                ]}
                request={async (params) => {
                  if (!params.destinationPad || !params.destinationSad) {
                    return [];
                  }
                  const payload = {
                    province: params.destinationSad,
                  };
                  const res = await placeLeoCity(payload);
                  if (res.code === 200) {
                    setDestinationCity(res.data);
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
                  resetAddress('destination');
                }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={8}>
              <Form.Item
                name="destinationLabel"
                label="Destination Label"
                rules={[
                  {
                    whitespace: true,
                    message: 'Cannot only contain spaces',
                  },
                  {
                    max: MAX_LENGTH.MAX_1000,
                    message: `Destination Label cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
                  },
                ]}
              >
                <CustomFormInput placeholder="Destination Label" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <ProFormDependency name={['destinationPad']}>
                {({ destinationPad }) => {
                  return (
                    <Form.Item
                      name={'destinationAddress'}
                      label={'Address'}
                      trigger="onChange"
                      rules={[
                        {
                          validator: () => {
                            if (!isDestinationMatched) {
                              return Promise.reject(
                                new Error(
                                  'The address does not match the region range',
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <AutoCompleteSelectNew
                        defaultMeta={
                          formDefaultValue
                            ? {
                                address: formDefaultValue?.destinationAddress,
                                lat: formDefaultValue?.destinationLat,
                                lng: formDefaultValue?.destinationLng,
                              }
                            : undefined
                        }
                        showLocator
                        disabled={!destinationPad}
                        placeholder="Address"
                        onSelect={(meta: IMeta) =>
                          onAddressSelect(meta, 'destination')
                        }
                        onClear={() => {
                          resetAddress('destination');
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </ProFormDependency>
            </Col>
          </Row>

          <LabelTitle title="Waypoint" />
          <ProFormText
            name="wayPoint"
            placeholder="Waypoint"
            rules={[
              {
                whitespace: true,
                message: 'Cannot only contain spaces',
              },
              {
                max: MAX_LENGTH.LONG_NAME,
                message: `Waypoint cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
              },
            ]}
          />

          <LabelTitle title="Route Code" />
          <Form.Item
            name="routeCode"
            rules={[
              {
                whitespace: true,
                message: 'Cannot only contain spaces',
              },
              {
                max: MAX_LENGTH.LONG_NAME,
                message: `Route Code cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
              },
            ]}
          >
            <CustomFormInput placeholder="Route Code" />
          </Form.Item>
        </Spin>
      </ModalForm>
    </>
  );
};

export default RouteModal;
