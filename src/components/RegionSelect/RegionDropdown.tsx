import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { IPlaceGeoRecord } from '@/api/types/place';
import { CountryEnumLabelListMap } from '@/enums';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Button, Form, FormInstance, Spin } from 'antd';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import { FC, useEffect, useRef } from 'react';
import AutoCompleteSelectNew from '../AutoCompleteSelectNew';
import { IMeta } from '../LocatorModal';
import styles from './index.less';

enum RegionTypeEnum {
  PAD = 'PAD',
  SAD = 'SAD',
  TAD = 'TAD',
}

interface IState {
  pending: boolean;
}

const defaultState: IState = {
  pending: false,
};

interface IProps {
  value?: any;
  width?: number;
  noAllRegion?: boolean;
  showAddress?: boolean;
  onCancel?: () => void;
  onConfirm?: (values: any) => void;
}

const RegionDropdown: FC<IProps> = ({
  value,
  width = 216,
  noAllRegion = false,
  showAddress = true,
  onCancel,
  onConfirm,
}) => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const formRef = useRef<FormInstance>(null);

  const [state, setState] = useSetState<IState>(defaultState);
  const curSelectedAddress = useRef<any>(null);

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
    const address = formRef.current?.getFieldValue('address');
    if (!address) {
      formRef.current?.setFields([
        {
          name: `address`,
          errors: ['Please complete the detailed address of the Point'],
        },
      ]);
      return;
    }
    if (!meta?.lat || !meta?.lng) {
      formRef.current?.setFields([
        {
          name: `address`,
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }
    await formRef.current?.validateFields(['address']);
    const { lat, lng } = curSelectedAddress.current ?? {};

    const params = {
      level: 3,
      lat,
      lng,
    };
    setState({ pending: true });
    const res = await placeGeoResolveAddressResult(params);
    setState({ pending: false });
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        padName: res.data.padName,
        padId: res.data.pad,
        sadName: res.data.sadName,
        sadId: res.data.sad,
        tadName: res.data.tadName,
        tadId: res.data.tad,
      });
    }
  };

  const regionChange = (regionType: RegionTypeEnum, option: any) => {
    const { title, value: _value } = { title: null, value: null, ...option };
    switch (regionType) {
      case RegionTypeEnum.PAD:
        formRef.current?.setFieldValue('padName', title);
        formRef.current?.setFieldValue('padId', _value);
        break;
      case RegionTypeEnum.SAD:
        formRef.current?.setFieldValue('sadName', title);
        formRef.current?.setFieldValue('sadId', _value);
        break;
      case RegionTypeEnum.TAD:
        formRef.current?.setFieldValue('tadName', title);
        formRef.current?.setFieldValue('tadId', _value);
        break;
      default:
        break;
    }
  };

  const handleConfirm = () => {
    formRef.current?.validateFields().then(() => {
      const values = formRef.current?.getFieldsValue(true);
      onConfirm?.(values);
    });
  };

  const handleCancel = () => {
    formRef.current?.resetFields();
    onCancel?.();
  };

  useEffect(() => {
    if (!value) {
      formRef.current?.resetFields();
    }
  }, [value]);

  return (
    <>
      <div
        className={cls(styles.dropForm, 'dropForm')}
        style={{ width: `${width + 200}px` }}
      >
        <div className="formWrap">
          <ProForm
            formRef={formRef}
            initialValues={{
              padName: value?.padName,
              padId: value?.padId,
              sadName: value?.sadName,
              sadId: value?.sadId,
              tadName: value?.tadName,
              tadId: value?.tadId,
              address: value?.address,
            }}
            submitter={false}
          >
            <Spin spinning={state.pending}>
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
                  setState({ pending: true });
                  const res = await placeGeoRegion(payload);
                  setState({ pending: false });
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
                  onChange: (_, option) =>
                    regionChange(RegionTypeEnum.PAD, option),
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
                  setState({ pending: true });
                  const res = await placeGeoProvince(payload);
                  setState({ pending: false });
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
                  onChange: (_, option) =>
                    regionChange(RegionTypeEnum.SAD, option),
                }}
                onChange={() =>
                  formRef.current?.setFieldValue('tadId', undefined)
                }
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
                  setState({ pending: true });
                  const res = await placeLeoCity(payload);
                  setState({ pending: false });
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
                  onChange: (_, option) =>
                    regionChange(RegionTypeEnum.TAD, option),
                }}
              />
              {showAddress ? (
                <Form.Item
                  label={'Address'}
                  name={'address'}
                  shouldUpdate
                  rules={[
                    {
                      required: false,
                      message:
                        'Please complete the detailed address of the Point',
                    },
                  ]}
                >
                  <AutoCompleteSelectNew
                    showResolve
                    onSelect={(meta) => handleAddressSelect(meta)}
                    onResolve={handleResolve}
                  />
                </Form.Item>
              ) : null}
            </Spin>
          </ProForm>
        </div>
        <div className="btns">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </>
  );
};

export default RegionDropdown;
