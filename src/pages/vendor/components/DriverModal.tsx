import { getCountryPhone } from '@/api/customer';
import { addDriver, editDriver } from '@/api/truck';
import { IPhoneSelectOptionsItem } from '@/api/types/customer';
import { IAddDriverParams, IDriverListItem } from '@/api/types/truck';
import { IVendorDetail } from '@/api/types/vendor';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  DEFAULT_COUNTRY_PHONE_CODE,
  ES_DTO_CLASS,
  MAX_LENGTH,
} from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { formatString } from '@/utils/format';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { App, Form, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';

type ICustomerModal = ModalFormProps & {
  formDefaultValue?: IAddDriverParams;
  vendorDetail?: IDriverListItem | IVendorDetail;
  hideModal: () => void;
  refresh: () => void;
};

const DriverModal = ({
  width = 480,
  formDefaultValue,
  vendorDetail,
  hideModal,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const formRef = useRef<ProFormInstance>();

  const countryId = initialState?.currentUser?.countryId ?? 1;

  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [codeOption, setCodeOption] = useState<any>(null);

  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      if (formDefaultValue?.phoneCodeId) {
        const findOption = res.data?.find(
          (item) => item.value === formDefaultValue.phoneCodeId,
        );
        formRef?.current?.setFieldValue('areaCode', findOption?.value);
        setCodeOption(findOption);
      } else {
        formRef?.current?.setFieldValue(
          'areaCode',
          DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
        );
        setCodeOption(DEFAULT_COUNTRY_PHONE_CODE[countryId]);
      }
    }
  };

  useEffect(() => {
    getCityCode();
  }, []);

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const submit = async (params: any) => {
    let res;
    if (formDefaultValue?.id) {
      res = await editDriver({
        id: formDefaultValue.id,
        driverName: params.driverName ? formatString(params.driverName) : '',
        licenseNumber: params.licenseNumber,
        contactPhoneNum: params.contactPhoneNum,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
        countryId: Number(countryId),
        vendorId: params?.vendorName?.id || formDefaultValue?.vendorId || null,
        reason: params.reason,
      });
    } else {
      res = await addDriver({
        driverName: params.driverName ? formatString(params.driverName) : '',
        licenseNumber: params.licenseNumber,
        contactPhoneNum: params.contactPhoneNum,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
        countryId: Number(countryId),
        vendorId: params?.vendorName?.id || null,
      });
    }
    if (res.code === 200) {
      message.success(`${formDefaultValue?.id ? 'Edit' : 'Add'} successfully`);
      refresh();
      hideModal();
    }
  };

  const prefixSelector = (
    <Form.Item name="areaCode" noStyle>
      <Select
        style={{ width: 92, textAlign: 'left' }}
        options={codeList}
        optionLabelProp="show"
        popupMatchSelectWidth={false}
        onChange={(value, option) => setCodeOption(option)}
      ></Select>
    </Form.Item>
  );

  return (
    <>
      <ModalForm
        name="driver-modal"
        open={true}
        title={`${formDefaultValue?.id ? 'Edit' : 'Create'} Driver`}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={{
          driverName: formDefaultValue?.driverName || '',
          licenseNumber: formDefaultValue?.licenseNumber || '',
          contactPhoneNum: formDefaultValue?.contactPhoneNum || '',
          reason: formDefaultValue?.reason,
          vendorName: {
            id: formDefaultValue?.vendorId || vendorDetail?.id || null,
            value:
              formDefaultValue?.vendorName || vendorDetail?.vendorName || null,
            label:
              formDefaultValue?.vendorName || vendorDetail?.vendorName || null,
          },
        }}
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
          name="driverName"
          label="Driver Name"
          placeholder="Driver Name"
          rules={[
            {
              required: true,
              message: 'Please enter driver name',
            },
            {
              max: MAX_LENGTH.LONG_NAME,
              message: `Driver name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
          ]}
        />

        <ProFormText
          name="licenseNumber"
          label="License"
          placeholder="License"
          rules={[
            {
              max: MAX_LENGTH.LONG_NAME,
              message: `License cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
          ]}
        />

        <ProFormText
          name="contactPhoneNum"
          label="Contact"
          placeholder="Contact"
          fieldProps={{
            addonBefore: prefixSelector,
          }}
          rules={[
            {
              required: true,
              message: 'Please enter contact',
            },
            {
              max: MAX_LENGTH.PASSWORD,
              message: `Contact cannot exceed ${MAX_LENGTH.PASSWORD} characters`,
            },
            {
              validator: (rule, value) => {
                const areaCode = formRef?.current?.getFieldValue('areaCode');
                if (areaCode !== 167 && areaCode !== 214) {
                  return Promise.resolve();
                }
                const findOption = codeList?.find(
                  (item) => item.value === areaCode,
                );
                const phoneNumber = findOption?.show + value;
                const mobileReg =
                  COUNTRY_PHONE_REGULAR_EXPRESSION[countryId].mobile;
                const phoneReg =
                  COUNTRY_PHONE_REGULAR_EXPRESSION[countryId].phone;
                if (mobileReg.test(phoneNumber) || phoneReg.test(phoneNumber)) {
                  return Promise.resolve();
                } else {
                  return Promise.reject(
                    'Please enter the correct phone number',
                  );
                }
              },
            },
          ]}
        />

        <ProFormSelect
          name="vendorName"
          label="Vendor"
          placeholder="Vendor Name"
          rules={
            vendorDetail?.id
              ? [
                  {
                    required: true,
                    message: 'Please enter vendor name',
                  },
                ]
              : []
          }
          disabled={!!vendorDetail?.id}
          fieldProps={{
            ...vendorNameDefaultFieldProps,
            onSearch: vendorNameSearch,
            defaultActiveFirstOption: false,
            suffixIcon: null,
            filterOption: false,
            // @ts-ignore
            options: vendorNameOptions,
          }}
        />

        {formDefaultValue?.id ? (
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
        ) : null}
      </ModalForm>
    </>
  );
};

export default DriverModal;
