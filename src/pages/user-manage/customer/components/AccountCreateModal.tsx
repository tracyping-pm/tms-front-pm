import { ES_DTO_CLASS, MAX_LENGTH, REGEXP } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useCallback, useRef } from 'react';

const DEFAULT_VALUES = {
  email: '',
  customerName: '',
  customerId: undefined,
};

type IAccountCreateModal = ModalFormProps & {
  open: boolean;
};

const AccountCreateModal = ({
  title,
  open,
  onFinish,
  width = 480,
  modalProps,
  ...restProps
}: IAccountCreateModal) => {
  const {
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const formRef = useRef<ProFormInstance>();

  const handleOk = useCallback(async () => {
    const values = formRef?.current?.getFieldsValue?.();
    const payload = {
      email: values?.email,
      customerId: values?.customerName?.id,
    };
    onFinish?.(payload);
  }, []);

  return (
    <>
      <ModalForm
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={DEFAULT_VALUES}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: false,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <ProFormText
          name="email"
          label="Email"
          placeholder="Email"
          rules={[
            {
              required: true,
              message: 'Please enter email',
            },
            {
              pattern: REGEXP.WHITESPACE,
              message: 'Cannot contain spaces',
            },
            {
              pattern: REGEXP.EMAIL,
              message: 'Please enter valid email',
            },
            {
              max: MAX_LENGTH.EMAIL,
              message: `Email cannot exceed ${MAX_LENGTH.EMAIL} characters`,
            },
          ]}
        />
        <ProFormSelect
          name="customerName"
          label="Customer"
          placeholder="Customer Name"
          rules={[
            {
              required: true,
              message: 'Please enter customer name',
            },
          ]}
          valuePropName="name"
          fieldProps={{
            ...customerNameDefaultFieldProps,
            onSearch: customerNameSearch,
            defaultActiveFirstOption: false,
            suffixIcon: null,
            filterOption: false,
            options: customerNameOptions,
          }}
        />
      </ModalForm>
    </>
  );
};

export default AccountCreateModal;
