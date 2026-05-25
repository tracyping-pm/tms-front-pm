import { MAX_LENGTH, REGEXP } from '@/constants';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { useCallback, useEffect, useRef } from 'react';
import styles from './common.less';

type ITerminateOrCompleteModal = ModalFormProps & {
  open: boolean;
  font?: string;
  onConfirm?: (values: any) => void;
};

const TerminateOrCompleteModal = ({
  open,
  font,
  onConfirm,
  width = 480,
  modalProps,
  ...restProps
}: ITerminateOrCompleteModal) => {
  const formRef = useRef<ProFormInstance>();
  const DEFAULT_VALUES = {
    email: '',
  };

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const handleOk = useCallback(async () => {
    const values = formRef?.current?.getFieldsValue?.();
    onConfirm?.(values);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="terminate-complete-modal-form"
        open={open}
        title={null}
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
        <div style={{ textAlign: 'center' }}>
          <ExclamationCircleFilled
            style={{ color: '#F28532', fontSize: '64px' }}
          />
        </div>
        <div className={styles.warnModalTitle}>Warning</div>
        <p className={styles.warnModalFont}>{font}</p>
        <ProFormText
          name="email"
          label={'Email Address'}
          placeholder={'Email Address'}
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
      </ModalForm>
    </>
  );
};

export default TerminateOrCompleteModal;
