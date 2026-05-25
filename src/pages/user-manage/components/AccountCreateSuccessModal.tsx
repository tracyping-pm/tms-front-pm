import { IResetPasswordRes } from '@/api/types/account';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { styled } from '@umijs/max';
import { Button } from 'antd';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useRef } from 'react';

const ItemView = styled.div`
  height: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
`;

const Key = styled.div`
  width: 62px;
  color: #838ca1;
`;

const Value = styled.div`
  color: #262626;
`;

const DEFAULT_VALUES = {
  email: '',
  name: '',
  aliasName: '',
  password: '',
};

type IAccountCreateSuccessModal = ModalFormProps & {
  open: boolean;
  record: IResetPasswordRes;
  onCopyOk?: () => void;
};

const AccountCreateSuccessModal = ({
  title,
  open,
  record,
  onCopyOk,
  width = 410,
  modalProps,
  ...restProps
}: IAccountCreateSuccessModal) => {
  const formRef = useRef<ProFormInstance>();

  const onFill = useCallback((values: any) => {
    formRef?.current?.setFieldsValue(values);
  }, []);

  const reset = useCallback(() => {
    onFill(DEFAULT_VALUES);
  }, []);

  const init = useCallback(() => {
    onFill(record);
  }, [record]);

  const handleCopy = () => {
    const content = `Email: ${record.email}\nPassword: ${record.randomPassword}`;
    copy(content);
    onCopyOk?.();
  };

  useEffect(() => {
    if (open) {
      init();
    } else {
      reset();
    }
  }, [open, record]);

  return (
    <>
      <ModalForm
        open={open}
        title={title}
        width={width}
        layout="horizontal"
        formRef={formRef}
        initialValues={record}
        readonly={false}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: false,
        }}
        submitter={{
          render: () => {
            return [
              <Button key="copy" type="primary" onClick={handleCopy}>
                Copy and close
              </Button>,
            ];
          },
        }}
        {...restProps}
      >
        <ItemView style={{ marginBottom: '10px' }}>
          <Key>Email</Key>
          <Value>{record?.email}</Value>
        </ItemView>
        <ItemView style={{ marginBottom: '4px' }}>
          <Key>Password</Key>
          <Value>{record?.randomPassword}</Value>
        </ItemView>
      </ModalForm>
    </>
  );
};

export default AccountCreateSuccessModal;
