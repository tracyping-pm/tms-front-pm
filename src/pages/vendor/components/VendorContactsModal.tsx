import { getCountryPhone } from '@/api/customer';
import { IPhoneSelectOptionsItem } from '@/api/types/customer';
import { IVendorContactParams } from '@/api/types/vendor';
import { addVendorContact, editVendorContact } from '@/api/vendor';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  DEFAULT_COUNTRY_PHONE_CODE,
  MAX_LENGTH,
} from '@/constants';
import { formatString } from '@/utils/format';
import { useModel, useParams } from '@umijs/max';
import { App, Form, Input, Modal, Select } from 'antd';
import { memo, useEffect, useState } from 'react';

export default memo(function VendorContactsModal(props: {
  hideModal: () => void;
  defaultData: IVendorContactParams | null;
  refresh: () => void;
}) {
  const { initialState } = useModel('@@initialState') ?? {};
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const { id: vendorId } = useParams();
  const { message } = App.useApp();
  const { hideModal, defaultData, refresh } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [codeOption, setCodeOption] = useState<any>(null);

  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      if (defaultData?.phoneCodeId) {
        const findOption = res.data?.find(
          (item) => item.value === defaultData.phoneCodeId,
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

  const submit = async (params: IVendorContactParams) => {
    if (!Number(vendorId)) {
      message.error('vendorId is undefined');
      return;
    }
    setLoading(true);
    const { contactName, email, notes, phoneNumber, title } = params;
    let res;
    if (defaultData?.id) {
      res = await editVendorContact({
        vendorId: Number(vendorId),
        id: defaultData.id,
        contactName: contactName ? formatString(contactName) : '',
        title,
        phoneNumber,
        email,
        notes,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
      });
    } else {
      res = await addVendorContact({
        vendorId: Number(vendorId),
        contactName: contactName ? formatString(contactName) : '',
        title,
        phoneNumber,
        email,
        notes,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
      });
    }
    setLoading(false);
    if (res?.code === 200) {
      hideModal();
      message.success(`${defaultData?.id ? 'Edit' : 'Add'} successfully!`);
      refresh();
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
      title={`${defaultData?.id ? 'Edit' : 'Add'} Contact`}
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
        name="contact-modal"
        form={form}
        layout="vertical"
        initialValues={{
          contactName: defaultData?.contactName ?? '',
          title: defaultData?.title ?? '',
          phoneNumber: defaultData?.phoneNumber ?? '',
          email: defaultData?.email ?? '',
          notes: defaultData?.notes ?? '',
        }}
        autoComplete="off"
        style={{ marginTop: '12px' }}
        onFinish={submit}
      >
        {/*名称*/}
        <Form.Item
          name="contactName"
          label="Name"
          style={{ fontSize: '14px' }}
          rules={[
            { required: true, message: 'Please enter name' },
            {
              max: 50,
              message: `Name cannot exceed 50 characters`,
            },
          ]}
        >
          <Input style={{ fontSize: '14px' }} placeholder="Please enter name" />
        </Form.Item>
        {/*标题*/}
        <Form.Item
          name="title"
          style={{ fontSize: '14px' }}
          label="Title"
          rules={[
            {
              max: MAX_LENGTH.LONG_NAME,
              message: `Title cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
          ]}
        >
          <Input
            style={{ fontSize: '14px' }}
            placeholder="Please enter title"
          />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Number"
          rules={[
            { required: true },
            {
              max: 30,
              message: `Number cannot exceed 30 characters`,
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
            placeholder="Please enter phone number"
          />
        </Form.Item>
        {/*邮箱*/}
        <Form.Item
          name="email"
          style={{ fontSize: '14px' }}
          label="Email"
          rules={[
            { type: 'email' },
            {
              max: MAX_LENGTH.LONG_NAME,
              message: `Email cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
          ]}
        >
          <Input
            style={{ fontSize: '14px' }}
            placeholder="Please enter email"
          />
        </Form.Item>
        {/*批注*/}
        <Form.Item
          name="notes"
          style={{ fontSize: '14px' }}
          label="Notes"
          rules={[
            {
              max: MAX_LENGTH.LONG_NAME,
              message: `Notes cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
          ]}
        >
          <Input
            style={{ fontSize: '14px' }}
            placeholder="Please enter notes"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});
