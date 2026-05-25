import { getCountryPhone } from '@/api/customer';
import { IPhoneSelectOptionsItem } from '@/api/types/customer';
import { IVendorDetailHelperForm } from '@/api/types/vendor';
import { addVendorHelper, changeVendorHelper } from '@/api/vendor';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  DEFAULT_COUNTRY_PHONE_CODE,
} from '@/constants';
import { formatString } from '@/utils/format';
import { useModel, useParams } from '@umijs/max';
import { App, Form, Input, Modal, Select } from 'antd';
import { memo, useEffect, useState } from 'react';

export default memo(function VendorHelpersModal(props: {
  formDefaultValue?: IVendorDetailHelperForm | null;
  hideModal: () => void;
  refresh: () => void;
}) {
  const { id: vendorId } = useParams();
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const { hideModal, refresh, formDefaultValue } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
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
        form?.setFieldValue('areaCode', findOption?.value);
        setCodeOption(findOption);
      } else {
        form?.setFieldValue(
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

  const submit = async (params: any) => {
    setLoading(true);
    let res;
    if (formDefaultValue?.id) {
      res = await changeVendorHelper({
        id: formDefaultValue.id,
        helperName: params.helperName ? formatString(params.helperName) : '',
        contactPhoneNum: params.contactPhoneNum,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
        vendorId: Number(vendorId),
      });
    } else {
      res = await addVendorHelper({
        helperName: params.helperName,
        contactPhoneNum: params.contactPhoneNum,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
        vendorId: Number(vendorId),
        countryId: Number(countryId),
      });
    }
    setLoading(false);
    if (res.code === 200) {
      message.success(`${formDefaultValue?.id ? 'Edit' : 'Add'} successfully!`);
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
    <Modal
      title={`${formDefaultValue?.id ? 'Edit' : 'Add'} Helper`}
      open={true}
      okText="Confirm"
      okButtonProps={{
        htmlType: 'submit',
        loading: loading,
        onClick: () => form.submit(),
      }}
      onCancel={hideModal}
      maskClosable={false}
      width={480}
    >
      <Form
        name="helper-modal"
        form={form}
        layout="vertical"
        initialValues={{
          helperName: formDefaultValue?.helperName || '',
          contactPhoneNum: formDefaultValue?.contactPhoneNum || '',
        }}
        autoComplete="off"
        style={{ marginTop: '12px' }}
        onFinish={submit}
      >
        {/*名称*/}
        <Form.Item
          name="helperName"
          label="Name"
          style={{ fontSize: '14px' }}
          rules={[
            { required: true, message: 'Please enter name' },
            {
              max: 50,
              message: `name cannot exceed 50 characters`,
            },
          ]}
        >
          <Input style={{ fontSize: '14px' }} placeholder="Please enter name" />
        </Form.Item>
        <Form.Item
          name="contactPhoneNum"
          label="Contact"
          rules={[
            {
              max: 30,
              message: `Contact cannot exceed 30 characters`,
            },
            {
              validator: (rule, value) => {
                const areaCode = form.getFieldValue('areaCode');
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
        >
          <Input
            addonBefore={prefixSelector}
            style={{ width: '100%', fontSize: '14px' }}
            placeholder="Please enter contact"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});
