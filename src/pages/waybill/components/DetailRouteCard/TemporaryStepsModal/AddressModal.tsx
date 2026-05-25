import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { IPlaceGeoRecord } from '@/api/types/place';
import { IRouteOriginAndDestinationListItem } from '@/api/types/waybill';
import { waybillRouteAddressCheck } from '@/api/waybill';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import { IMeta } from '@/components/LocatorModal';
import { CountryEnumLabelListMap } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Form, FormInstance, ModalProps, Spin, message } from 'antd';
import { default as lodash } from 'lodash';
import { FC, useEffect, useRef, useState } from 'react';

enum RegionTypeEnum {
  PAD = 'PAD',
  SAD = 'SAD',
  TAD = 'TAD',
}

type IAddressModal = ModalFormProps & {
  open: boolean;
  noAllRegion?: boolean;
  formDefaultValue: Partial<IRouteOriginAndDestinationListItem>;
  modalProps: ModalProps;
  onConfrim: (values: any) => void;
  doNotify?: () => void;
};
const AddressModal: FC<IAddressModal> = ({
  open,
  noAllRegion = false,
  title,
  formDefaultValue,
  modalProps,
  onConfrim,
  doNotify,
  ...restProps
}) => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const formRef = useRef<FormInstance>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const curSelectedAddress = useRef<IMeta>();

  const handleAddressSelect = async (meta: IMeta) => {
    if (!lodash.isEmpty(meta)) {
      curSelectedAddress.current = meta;
      formRef.current?.setFieldsValue({
        lat: meta.lat,
        lng: meta.lng,
        address: meta.address,
      });
    }
  };

  const handleResolve = async (meta?: IMeta) => {
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
    setLoading(true);
    const res = await placeGeoResolveAddressResult(params);
    setLoading(false);
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        padId: res.data.pad,
        padName: res.data.padName,
        sadId: res.data.sad,
        sadName: res.data.sadName,
        tadId: res.data.tad,
        tadName: res.data.tadName,
      });
    }
  };

  const checkAddress = async () => {
    if (!curSelectedAddress.current) {
      message.warning('Please select a address fist');
      return false;
    }

    const values = formRef?.current?.getFieldsValue(true);
    const { padId: pad, sadId: sad, tadId: tad } = values;

    const { lat, lng } = curSelectedAddress.current;
    const payload = {
      pad,
      sad,
      tad,
      lat,
      lng,
    };
    setLoading(true);
    const res = await waybillRouteAddressCheck(payload);
    setLoading(false);
    if (res.code === 200) {
      const { matched, toAdd } = res.data;
      if (matched) {
        onConfrim?.(values);
      } else {
        if (toAdd) {
          doNotify?.();
        } else {
          message.error('Address does not match Region');
        }
      }
    }
  };

  const regionChange = (regionType: RegionTypeEnum, option: any) => {
    const { value } = option ?? { title: null, value: null };
    switch (regionType) {
      case RegionTypeEnum.PAD:
        formRef.current?.setFieldValue('padName', option.title || null);
        formRef.current?.setFieldValue('padId', value);
        break;
      case RegionTypeEnum.SAD:
        formRef.current?.setFieldValue('sadName', option.title || null);
        formRef.current?.setFieldValue('sadId', value);
        break;
      case RegionTypeEnum.TAD:
        formRef.current?.setFieldValue('tadName', option.title || null);
        formRef.current?.setFieldValue('tadId', value);
        break;
      default:
        break;
    }
  };

  const submit = async () => {
    checkAddress();
  };

  const reset = () => {
    formRef.current?.resetFields();
    curSelectedAddress.current = undefined;
  };

  useEffect(() => {
    if (open) {
      formRef.current?.setFieldsValue(formDefaultValue);
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="temporary-address-modal"
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        width={480}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: false,
          destroyOnClose: true,
          maskClosable: false,
        }}
        submitter={{
          submitButtonProps: {
            disabled: loading,
          },
        }}
        initialValues={formDefaultValue}
        onFinish={submit}
        {...restProps}
      >
        <Spin spinning={loading}>
          <Form.Item
            label={'Address'}
            name={'address'}
            shouldUpdate
            rules={[
              {
                required: true,
                message: 'Please complete the detailed address of the Point',
              },
            ]}
          >
            <AutoCompleteSelectNew
              showLocator
              showResolve
              onSelect={(meta) => handleAddressSelect(meta)}
              onResolve={handleResolve}
              defaultMeta={
                formDefaultValue.address
                  ? {
                      address: formDefaultValue.address!,
                      lat: formDefaultValue.lat!,
                      lng: formDefaultValue.lng!,
                    }
                  : undefined
              }
            />
          </Form.Item>
          <ProFormSelect
            name="padId"
            label={labelLevelList?.[1]}
            placeholder={labelLevelList?.[1]}
            showSearch
            rules={[
              {
                required: true,
                message: `Please select at least one administrative division`,
              },
            ]}
            request={async () => {
              const payload = {
                country: countryId!,
                noAllRegion: noAllRegion,
              };
              setLoading(true);
              const res = await placeGeoRegion(payload);
              setLoading(false);
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
            fieldProps={{
              filterOption: true,
              onChange: (_, option) => regionChange(RegionTypeEnum.PAD, option),
            }}
            onChange={() => {
              formRef.current?.setFieldValue('sadId', undefined);
              formRef.current?.setFieldValue('tadId', undefined);
            }}
          />
          <ProFormSelect
            name="sadId"
            label={labelLevelList?.[2]}
            placeholder={labelLevelList?.[2]}
            dependencies={['padId']}
            showSearch
            request={async (params) => {
              if (!params.padId) {
                return [];
              }
              const payload = {
                region: params.padId,
              };
              setLoading(true);
              const res = await placeGeoProvince(payload);
              setLoading(false);
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
            fieldProps={{
              filterOption: true,
              onChange: (_, option) => regionChange(RegionTypeEnum.SAD, option),
            }}
            onChange={() => formRef.current?.setFieldValue('tadId', undefined)}
          />
          <ProFormSelect
            name="tadId"
            label={labelLevelList?.[3]}
            placeholder={labelLevelList?.[3]}
            dependencies={['padId', 'sadId']}
            showSearch
            request={async (params) => {
              if (!params.padId || !params.sadId) {
                return [];
              }
              const payload = {
                province: params.sadId,
              };
              setLoading(true);
              const res = await placeLeoCity(payload);
              setLoading(false);
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
            fieldProps={{
              filterOption: true,
              onChange: (_, option) => regionChange(RegionTypeEnum.TAD, option),
            }}
          />
        </Spin>
      </ModalForm>
    </>
  );
};

export default AddressModal;
