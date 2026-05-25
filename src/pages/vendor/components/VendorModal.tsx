import { placeCity, placeProvince, placeRegion } from '@/api/place';
import { IPlaceRecord } from '@/api/types/place';
import { IAddVendorParams, IAddVendorRecord } from '@/api/types/vendor';
import { addVendor, editVendor, vendorCheckDuplicate } from '@/api/vendor';
import { MAX_LENGTH, REGEXP } from '@/constants';
import {
  CountryEnumLabelListMap,
  TaxTypeEnumText,
  VendorListServicesEnumOptions,
  VendorServicesArray,
  VendorTypeEnumText,
} from '@/enums';
import { formatString } from '@/utils/format';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { App, Checkbox, Col, Divider, Form, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import VendorCreatedSuccessModal from './VendorCreatedSuccessModal';

type ICustomerModal = ModalFormProps & {
  formDefaultValue: IAddVendorParams | null;
  hideModal: () => void;
  refresh: () => void;
};

const VendorModal = ({
  formDefaultValue,
  width = 680,
  hideModal,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const [vendorCreateRecord, setVendorCreateRecord] =
    useState<IAddVendorRecord | null>({} as IAddVendorRecord);
  const [vendorCreateOpen, setVendorCreateOpen] = useState<boolean>(false);
  const [vendorNameDuplicate, setVendorNameDuplicate] =
    useState<boolean>(false);
  const [vendorEmailDuplicate, setVendorEmailDuplicate] =
    useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  const countryId = initialState?.currentUser?.countryId;
  const countryName = initialState?.currentUser?.countryName;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];

  const DEFAULT_VALUES = {
    vendorName: '',
    vendorTag: '',
    vendorType: '',
    garageLocation: '',
    country: countryId,
    countryName: countryName,
    pad: '',
    sad: '',
    tad: '',
    taxMark: '',
    email: undefined,
  };

  // 清空指定的表单项
  const resetAreaFields = (fields?: string[]) => {
    formRef?.current?.resetFields?.(fields);
  };

  const checkVendorNameAndEmail = async (
    value: string,
    type: 'name' | 'email',
  ) => {
    if (!value) return;
    const payload = {
      id: formDefaultValue?.id,
      type: type,
      value: value,
    };
    if (type === 'name') {
      const nameFieldError =
        await formRef?.current?.getFieldError?.('vendorName');
      if (nameFieldError?.length) {
        return;
      }
      const res = await vendorCheckDuplicate(payload);
      if (res?.code === 200) {
        setVendorNameDuplicate(res.data);
        formRef?.current?.setFields([
          {
            name: 'vendorName',
            errors: res.data ? ['Existed Vendor'] : [],
          },
        ]);
      }
    } else {
      const emailFieldError = await formRef?.current?.getFieldError?.('email');
      if (emailFieldError?.length) {
        return;
      }
      const res = await vendorCheckDuplicate(payload);
      if (res?.code === 200) {
        setVendorEmailDuplicate(res.data);
        formRef?.current?.setFields([
          {
            name: 'email',
            errors: res.data ? ['Existed Email'] : [],
          },
        ]);
      }
    }
  };

  const submit = async (params: any) => {
    let str = '';
    for (let i of VendorServicesArray) {
      if (params?.listOfServices?.includes(i)) {
        str = !!str ? str + ',' + i : str + i;
      }
    }
    let payload, res;
    if (formDefaultValue?.id) {
      payload = {
        id: formDefaultValue.id,
        vendorTag: params.vendorTag ? formatString(params.vendorTag) : '',
        vendorType: params.vendorType,
        garageLocation: params.garageLocation,
        pad: params.pad,
        sad: params.sad,
        tad: params.tad,
        taxMark: params.taxMark,
        tinNumber: params.tinNumber,
        listOfServices: str,
        reason: params.reason,
        email: params.email,
      };
      res = await editVendor(payload);
    } else {
      payload = {
        vendorName: params.vendorName ? formatString(params.vendorName) : '',
        vendorTag: params.vendorTag ? formatString(params.vendorTag) : '',
        vendorType: params.vendorType,
        garageLocation: params.garageLocation,
        pad: params.pad,
        sad: params.sad,
        tad: params.tad,
        taxMark: params.taxMark,
        country: Number(countryId),
        tinNumber: params.tinNumber,
        listOfServices: str,
        email: params.email,
      };
      res = await addVendor(payload);
    }

    if (res?.code === 200) {
      if (
        !formDefaultValue?.id ||
        (!formDefaultValue?.email && params?.email)
      ) {
        setVendorCreateOpen(true);
        setVendorCreateRecord(res.data);
      } else {
        message.success(`Edit successfully!`);
        refresh();
        hideModal();
      }
    }
  };

  useEffect(() => {
    if (formDefaultValue?.id) {
      formRef?.current?.setFieldsValue({
        ...formDefaultValue,
        listOfServices: formDefaultValue?.listOfServices?.split(','),
      });
    } else {
      formRef?.current?.resetFields();
    }
  }, [formDefaultValue]);

  return (
    <>
      <ModalForm
        name="vendor-modal"
        open={true}
        title={`${formDefaultValue?.id ? 'Edit' : 'Create'} Vendor`}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={DEFAULT_VALUES}
        modalProps={{
          ...modalProps,
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          okText: 'Confirm',
        }}
        onFinish={submit}
        {...restProps}
      >
        <ProFormText
          name="vendorName"
          label="Name"
          placeholder="Name"
          disabled={!!formDefaultValue?.id}
          fieldProps={{
            onBlur: (e) => checkVendorNameAndEmail(e.target.value, 'name'),
            onChange: () => setVendorNameDuplicate(false),
          }}
          rules={[
            {
              required: true,
              message: 'Please enter name',
            },
            {
              min: MAX_LENGTH.SHORT_NAME,
              message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Name`,
            },
            {
              max: MAX_LENGTH.LONG_NAME,
              message: `Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
            {
              whitespace: true,
              message: 'Cannot only contain spaces',
            },
            {
              validator: () => {
                if (vendorNameDuplicate) {
                  return Promise.reject(new Error('Existed Vendor'));
                }
                return Promise.resolve();
              },
            },
          ]}
        />

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormText
              name="vendorTag"
              label="Tag"
              placeholder="Tag"
              rules={[
                {
                  required: true,
                  message: 'Please enter tag',
                },
                {
                  min: MAX_LENGTH.SHORT_NAME,
                  message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Tag`,
                },
                {
                  max: MAX_LENGTH.NAME,
                  message: `Tag cannot exceed ${MAX_LENGTH.NAME} characters`,
                },
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="vendorType"
              label="Vendor Type"
              placeholder="Please select vendor type"
              showSearch
              valueEnum={VendorTypeEnumText}
              fieldProps={{
                filterOption: true,
              }}
              disabled={!!formDefaultValue?.id}
              rules={[
                {
                  required: true,
                  message: `Please select the type of the vendor`,
                },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormText
              name="garageLocation"
              label="Garage Location"
              placeholder="Please enter garage location"
              rules={[
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Garage Location cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name="countryName"
              label={labelLevelList?.[0]}
              placeholder={labelLevelList?.[0]}
              disabled={true}
            />
          </Col>
        </Row>

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormSelect
              name="pad"
              label={labelLevelList?.[1]}
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
                };
                const res = await placeRegion(payload);
                if (res.code === 200) {
                  return res?.data?.map((item: IPlaceRecord) => {
                    return {
                      label: item.description,
                      value: item.id,
                    };
                  });
                } else {
                  return [];
                }
              }}
              onChange={() => resetAreaFields(['sad', 'tad'])}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="sad"
              label={labelLevelList?.[2]}
              placeholder={labelLevelList?.[2]}
              showSearch
              fieldProps={{
                filterOption: true,
              }}
              dependencies={['pad']}
              request={async (params) => {
                if (!params.pad) {
                  return [];
                }
                const payload = {
                  region: params.pad,
                };
                const res = await placeProvince(payload);
                if (res.code === 200) {
                  return res?.data?.map((item: IPlaceRecord) => {
                    return {
                      label: item.description,
                      value: item.id,
                    };
                  });
                } else {
                  return [];
                }
              }}
              onChange={() => resetAreaFields(['tad'])}
            />
          </Col>
        </Row>

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormSelect
              name="tad"
              label={labelLevelList?.[3]}
              placeholder={labelLevelList?.[3]}
              showSearch
              fieldProps={{
                filterOption: true,
              }}
              dependencies={['pad', 'sad']}
              request={async (params) => {
                if (!params.pad || !params.sad) {
                  return [];
                }
                const payload = {
                  province: params.sad,
                };
                const res = await placeCity(payload);
                if (res.code === 200) {
                  return res?.data?.map((item: IPlaceRecord) => {
                    return {
                      label: item.description,
                      value: item.id,
                    };
                  });
                } else {
                  return [];
                }
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="taxMark"
              label="Tax Mark"
              placeholder="taxMark"
              valueEnum={TaxTypeEnumText}
              rules={[{ required: true, message: 'Please select tax mark' }]}
            />
          </Col>
        </Row>

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormText
              name="tinNumber"
              label="Tin number"
              placeholder="Please enter tin number"
              fieldProps={{
                min: countryId === 1 ? 12 : 10,
                onBlur: () => {},
              }}
              validateTrigger="onBlur"
              rules={[
                {
                  pattern: /^\d+$/,
                  message: 'Please enter the correct Tin Number',
                },
                {
                  validator: (_, value) => {
                    const len = countryId === 1 ? 12 : 10;
                    if (value?.length > len) {
                      return Promise.reject(
                        new Error(
                          `Tin number cannot exceed ${
                            countryId === 1 ? 12 : 10
                          } characters`,
                        ),
                      );
                    }
                    if (value?.length < len && value?.length) {
                      return Promise.reject(
                        new Error(
                          `Please enter ${
                            countryId === 1 ? 12 : 10
                          } characters Tin Number`,
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </Col>
          {/* {formDefaultValue?.id ? (
            <Col span={12}>
              <ProFormTextArea
                name="reason"
                label="Mark"
                placeholder="Please enter mark"
                rules={[
                  {
                    max: MAX_LENGTH.MAX_2000,
                    message: `Mark cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
                  },
                ]}
              />
            </Col>
          ) : null} */}
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              name="listOfServices"
              label="List of Services"
              rules={[{ required: true, message: 'Please select services' }]}
            >
              <Checkbox.Group>
                <Row gutter={[72, 16]}>
                  <Col span={12}>
                    <Checkbox
                      key={VendorListServicesEnumOptions[0].value}
                      value={VendorListServicesEnumOptions[0].value}
                    >
                      {VendorListServicesEnumOptions[0].label}
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      key={VendorListServicesEnumOptions[1].value}
                      value={VendorListServicesEnumOptions[1].value}
                    >
                      {VendorListServicesEnumOptions[1].label}
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      key={VendorListServicesEnumOptions[2].value}
                      value={VendorListServicesEnumOptions[2].value}
                    >
                      {VendorListServicesEnumOptions[2].label}
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      key={VendorListServicesEnumOptions[3].value}
                      value={VendorListServicesEnumOptions[3].value}
                    >
                      {VendorListServicesEnumOptions[3].label}
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      key={VendorListServicesEnumOptions[4].value}
                      value={VendorListServicesEnumOptions[4].value}
                    >
                      {VendorListServicesEnumOptions[4].label}
                    </Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>
        </Row>

        <Divider plain>{'Vendor Account'}</Divider>
        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormText
              name="email"
              label="Email"
              placeholder="Email"
              fieldProps={{
                onBlur: (e) => checkVendorNameAndEmail(e.target.value, 'email'),
                onChange: () => setVendorEmailDuplicate(false),
              }}
              rules={[
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },
                {
                  pattern: REGEXP.EMAIL,
                  message: 'Please enter valid email',
                },
                {
                  max: MAX_LENGTH.EMAIL,
                  message: `Email cannot exceed ${MAX_LENGTH.EMAIL} characters`,
                },
                {
                  validator: () => {
                    if (vendorEmailDuplicate) {
                      return Promise.reject(new Error('Existed Email'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </Col>
        </Row>
      </ModalForm>
      {vendorCreateOpen && (
        <VendorCreatedSuccessModal
          open={vendorCreateOpen}
          record={vendorCreateRecord!}
          onCancel={() => {
            hideModal();
            refresh();
          }}
        />
      )}
    </>
  );
};

export default VendorModal;
