import { MAX_LENGTH } from '@/constants';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { useRef } from 'react';

type IRejectModal = ModalFormProps;

const RejectModal = ({
  title = 'Reject Reason',
  open,
  width = 817,
  modalProps,
  ...restProps
}: IRejectModal) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <>
      <ModalForm
        name="reject-category-modal"
        open={open}
        title={title}
        width={width}
        style={{ marginTop: '14px' }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
          okText: 'Ok',
        }}
        {...restProps}
      >
        <Form.Item
          name="reason"
          label="Reject Reason"
          rules={[
            {
              required: true,
              message: 'Please enter Reject Reason',
            },
            {
              whitespace: true,
              message: 'Cannot only contain spaces',
            },
            {
              max: MAX_LENGTH.NOTE,
              message: `Reason cannot exceed ${MAX_LENGTH.NOTE} characters`,
            },
          ]}
        >
          <Input.TextArea
            placeholder="Please enter Reject Reason"
            showCount
            maxLength={MAX_LENGTH.NOTE}
          />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default RejectModal;
