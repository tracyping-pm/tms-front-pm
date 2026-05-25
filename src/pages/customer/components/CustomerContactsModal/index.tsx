import {
  customerAddContact,
  editContact,
  getCountryPhone,
} from '@/api/customer';
import {
  ICustomerContactsForm,
  ICustomerContactsListItem,
  IPhoneSelectOptionsItem,
} from '@/api/types/customer';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  DEFAULT_COUNTRY_PHONE_CODE,
  MAX_LENGTH,
} from '@/constants';
import { formatString } from '@/utils/format';
import { useModel, useParams } from '@umijs/max';
import { Form, Input, Modal, Select, message } from 'antd';
import { memo, useEffect, useState } from 'react';

export default memo(function CustomerContactsModal(props: {
  hideModal: () => void;
  refreshList: () => void;
  defaultData: ICustomerContactsListItem;
}) {
  const { initialState } = useModel('@@initialState') ?? {};
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const { hideModal, refreshList, defaultData } = props;
  const { id: customerId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [codeOption, setCodeOption] = useState<any>(null);

  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      if (defaultData.phoneCodeId !== null) {
        const findOption = res.data?.find(
          (item) => item.value === defaultData.phoneCodeId,
        );
        form.setFieldValue('areaCode', findOption?.value);
        setCodeOption(findOption);
      } else {
        form.setFieldValue(
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

  const submit = async (params: ICustomerContactsForm) => {
    if (!Number(customerId)) {
      message.error('customerId is undefined');
      return;
    }
    setLoading(true);
    if (defaultData.contactId) {
      const res = await editContact({
        customerId: Number(customerId),
        contactId: defaultData.contactId,
        contactName: params?.name ? formatString(params.name) : '',
        phoneNumber: params.number,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
        title: params.title || '',
        email: params.email || '',
        notes: params.notes || '',
      });
      if (res?.code === 200) {
        message.success('Edit success!');
        refreshList();
      } else {
        message.error('Edit fail!');
      }
    } else {
      const res = await customerAddContact({
        customerId: Number(customerId),
        contactName: params.name,
        phoneNumber: params.number,
        phoneCode: codeOption.show,
        phoneCodeId: codeOption.value,
        title: params.title || '',
        email: params.email || '',
        notes: params.notes || '',
      });
      if (res?.code === 200) {
        message.success('add success!');
        refreshList();
      } else {
        message.error('add fail!');
      }
    }
    setLoading(false);
    hideModal();
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
      width={480}
      title={`${defaultData.contactId ? 'Edit' : 'Add'} Contact`}
      open={true}
      onCancel={hideModal}
      okButtonProps={{
        loading: loading,
        onClick: () => form?.submit?.(),
      }}
      okText="Confirm"
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: defaultData.contactName,
          title: defaultData.title,
          number: defaultData.phoneNumber,
          email: defaultData.email,
          notes: defaultData.notes,
        }}
        autoComplete="off"
        style={{ marginTop: '12px' }}
        onFinish={submit}
      >
        {/*名称*/}
        <Form.Item
          name="name"
          label="Name"
          style={{ fontSize: '14px' }}
          rules={[
            { required: true, message: 'Please enter name' },
            {
              max: MAX_LENGTH.NAME,
              message: `Name cannot exceed ${MAX_LENGTH.NAME} characters`,
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
          name="number"
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
            style={{ width: '100%' }}
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
