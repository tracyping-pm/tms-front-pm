import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';

import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { IPlaceGeoRecord } from '@/api/types/place';
import { waybillRouteAddressCheck } from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import { MAX_LENGTH } from '@/constants';
import { CountryEnumLabelListMap } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Col, Form, Row, Spin, message } from 'antd';
import { default as lodash } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import CustomFormInput from '../CustomFormInput';
import { IMeta } from '../LocatorModal';
import styles from './index.less';
type IAddCategoryModal = ModalFormProps & {
  record?: any;
  onConfirm: (value: any) => void;
};

const AddStopPointsModal = ({
  title,
  open,
  width = 906,
  modalProps,
  record,
  onConfirm,
  ...restProps
}: IAddCategoryModal) => {
  const formRef = useRef<ProFormInstance>();
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [isMatched, setIsMatched] = useState<boolean>(true);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  //@ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const curSelectedAddress = useRef<IMeta | undefined>();

  const resetAddress = () => {
    curSelectedAddress.current = undefined;
    formRef?.current?.setFields([
      {
        name: `address`,
        value: undefined,
        errors: [],
      },
    ]);
  };

  const handleOk = async (values: any) => {
    if (!isMatched) {
      formRef?.current?.setFields([
        {
          name: 'address',
          errors: ['The address does not match the region range'],
        },
      ]);
      return;
    }
    const { address, lat, lng } = curSelectedAddress.current!;
    const payload = {
      ...values,
      label: values.label,
      id: record?.id,
      address,
      lat,
      lng,
    };
    onConfirm?.(payload);
  };
  const onAddressSelect = async () => {
    const values = formRef?.current?.getFieldsValue?.();
    if (!lodash.isEmpty(curSelectedAddress.current) && values?.tadId) {
      const { lat, lng } = curSelectedAddress.current;

      const payload = {
        pad: values?.padId,
        sad: values?.asdId,
        tad: values?.tadId,
        lat,
        lng,
      };
      setFormLoading(true);
      const res = await waybillRouteAddressCheck(payload);
      setFormLoading(false);
      if (res.code === 200) {
        const { matched } = res.data;
        setIsMatched(matched);
        if (matched) {
          formRef?.current?.setFields([
            {
              name: 'address',
              errors: [],
            },
          ]);
        } else {
          formRef?.current?.setFields([
            {
              name: 'address',
              errors: ['The address does not match the region range'],
            },
          ]);
        }
      }
    } else {
    }
  };

  const handleAddressSelect = async (meta: IMeta) => {
    if (!lodash.isEmpty(meta)) {
      curSelectedAddress.current = meta;
      onAddressSelect();
    }
  };

  const handleResolve = async (meta?: IMeta) => {
    setIsMatched(true);
    await formRef.current?.validateFields(['address']);
    if (!meta?.lat || !meta?.lng) {
      formRef.current?.setFields([
        {
          name: 'address',
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }

    if (!curSelectedAddress.current) {
      message.warning('Please select a address fist');
      return false;
    }
    const { lat, lng } = curSelectedAddress.current;

    const params = {
      level: 3,
      lat,
      lng,
    };
    setFormLoading(true);
    const res = await placeGeoResolveAddressResult(params);
    setFormLoading(false);
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        padId: res.data.pad,
        sadId: res.data.sad,
        tadId: res.data.tad,
      });
    }
  };

  const validatorRule = (value: any) => {
    if (!value) {
      return Promise.reject(new Error('Please select'));
    }
    if (!isMatched) {
      return Promise.reject(
        new Error('The address does not match the region range'),
      );
    }
    return Promise.resolve();
  };
  const doResetFormOrigin = useCallback(() => {
    formRef.current?.resetFields(['padId', 'sadId', 'tadId']);
    formRef?.current?.setFields([
      {
        name: 'address',
        // value: undefined,
        errors: [],
      },
    ]);
  }, []);

  const onPadChangeForOrigin = useCallback(() => {
    formRef.current?.setFieldValue('sadId', undefined);
    formRef.current?.setFieldValue('tadId', undefined);
  }, []);

  const onSadChangeForOrigin = useCallback(() => {
    formRef.current?.setFieldValue('tadId', undefined);
  }, []);

  const onFill = useCallback((values: any) => {
    formRef?.current?.setFieldsValue(values);
    curSelectedAddress.current = {
      lat: values.lat,
      lng: values.lng,
      address: values.address,
    };
  }, []);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const init = useCallback(async () => {
    if (record?.id) {
      onFill(record);
    } else {
      reset();
    }
  }, [record]);

  useEffect(() => {
    if (open) {
      init();
    } else {
      reset();
    }
  }, [open]);
  return (
    <>
      <ModalForm
        open={open}
        title={title}
        width={width}
        style={{ marginTop: '14px' }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Spin spinning={formLoading}>
          <Form.Item
            name={'address'}
            label={
              <>
                <span style={{ color: '#ff4d4f' }}>*</span> Address
              </>
            }
            trigger="onChange"
            rules={[
              {
                validator: (_, value) => validatorRule(value),
              },
            ]}
          >
            <AutoCompleteSelectNew
              defaultMeta={
                record
                  ? {
                      address: record?.address,
                      lat: record?.lat,
                      lng: record?.lng,
                    }
                  : undefined
              }
              showLocator
              showResolve
              placeholder="Address"
              onSelect={(meta: IMeta) => handleAddressSelect(meta)}
              onResolve={handleResolve}
              onClear={() => {
                resetAddress();
              }}
            />
          </Form.Item>

          <div className={styles.customLabel}>
            <p>
              <span style={{ color: '#ff4d4f' }}>*</span> Stop Point Region
            </p>
            <CustomStatusButton noStyle onClick={doResetFormOrigin}>
              Reset
            </CustomStatusButton>
          </div>

          <Row gutter={24}>
            <Col span={8}>
              <ProFormSelect
                name={'padId'}
                label={null}
                placeholder={labelLevelList?.[1]}
                showSearch
                rules={[
                  {
                    required: true,
                    message: 'Please select',
                  },
                ]}
                fieldProps={{
                  filterOption: true,
                }}
                request={async () => {
                  const payload = {
                    country: countryId!,
                    noAllRegion: true,
                  };
                  setFormLoading(true);
                  const res = await placeGeoRegion(payload);
                  setFormLoading(false);
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
                onChange={onPadChangeForOrigin}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name={'sadId'}
                label={null}
                placeholder={labelLevelList?.[2]}
                dependencies={['padId']}
                showSearch
                rules={[
                  {
                    required: true,
                    message: 'Please select',
                  },
                ]}
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  if (!params.padId) {
                    return [];
                  }
                  const payload = {
                    region: params.padId,
                  };
                  setFormLoading(true);
                  const res = await placeGeoProvince(payload);
                  setFormLoading(false);
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
                onChange={onSadChangeForOrigin}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name={'tadId'}
                label={null}
                placeholder={labelLevelList?.[3]}
                dependencies={['padId', 'sadId']}
                showSearch
                rules={[
                  {
                    required: true,
                    message: 'Please select',
                  },
                ]}
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  if (!params.padId || !params.sadId) {
                    return [];
                  }
                  const payload = {
                    province: params.sadId,
                  };
                  setFormLoading(true);
                  const res = await placeLeoCity(payload);
                  setFormLoading(false);
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
                  onAddressSelect();
                }}
              />
            </Col>
          </Row>

          <Form.Item
            name="label"
            label="Stop Point Label"
            rules={[
              {
                required: true,
                message: 'Please enter Stop Point Label',
              },
              {
                whitespace: true,
                message: 'Cannot only contain spaces',
              },
              {
                max: MAX_LENGTH.MAX_1000,
                message: `Name cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
              },
            ]}
          >
            <CustomFormInput placeholder="Stop Point Label" />
          </Form.Item>
        </Spin>
      </ModalForm>
    </>
  );
};

export default AddStopPointsModal;
