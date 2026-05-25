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
  vendorName: '',
  vendorId: undefined,
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
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const formRef = useRef<ProFormInstance>();

  const handleOk = useCallback(async () => {
    const values = formRef?.current?.getFieldsValue?.();
    const payload = {
      email: values?.email,
      vendorId: values?.vendorName?.id,
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
          name="vendorName"
          label="Vendor"
          placeholder="Vendor Name"
          rules={[
            {
              required: true,
              message: 'Please enter vendor name',
            },
          ]}
          valuePropName="name"
          fieldProps={{
            ...vendorNameDefaultFieldProps,
            onSearch: vendorNameSearch,
            defaultActiveFirstOption: false,
            suffixIcon: null,
            filterOption: false,
            options: vendorNameOptions,
          }}
        />
      </ModalForm>
    </>
  );
};

export default AccountCreateModal;
