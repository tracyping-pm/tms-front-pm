import { ticketRemarkAdd } from '@/api/claim';
import { IRefundDetail } from '@/api/types/claims';
import { MAX_LENGTH } from '@/constants';
import { App, Button, Flex, Form, Input, Modal, ModalProps } from 'antd';
import { FC, useEffect, useState } from 'react';

export interface IProps extends ModalProps {
  detail: IRefundDetail;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const AddRemarkModal: FC<IProps> = ({
  detail,
  open,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const payload = {
      ticketId: detail.id,
      remark: values.remark,
    };

    setSubmitting(true);
    const res = await ticketRemarkAdd(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      message.success('Add Remark Successful!');
      onSuccess?.();
    }
  };

  useEffect(() => {
    if (open) {
    } else {
      form.resetFields();
    }
  }, [open]);

  return (
    <Modal
      title="Add Remark"
      open={open}
      width={500}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onCancel?.()}
      footer={
        <>
          <Flex justify="end" gap={8}>
            <Button onClick={() => onCancel?.()}>Cancel</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => onSubmit()}
            >
              OK
            </Button>
          </Flex>
        </>
      }
      {...restProps}
    >
      <Form name="add-remark-form" form={form} layout="vertical">
        <Form.Item
          label="Remark"
          name="remark"
          rules={[
            {
              required: true,
              message: 'Please enter Remark',
            },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Remark"
            showCount
            maxLength={MAX_LENGTH.MAX_1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRemarkModal;
