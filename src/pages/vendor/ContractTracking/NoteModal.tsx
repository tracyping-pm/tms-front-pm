import { contractAddNote } from '@/api/contract';
import { App, Form, Input, Modal, ModalProps } from 'antd';
import { FC, useState } from 'react';

interface INoteModalProps extends Omit<ModalProps, 'onClose'> {
  contractId?: number;
  onCancel?: () => void;
  onSubmit?: () => void;
}

const NoteModal: FC<INoteModalProps> = ({
  contractId,
  onCancel,
  onSubmit,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [okLoading, setOkLoading] = useState(false);

  const onOk = async () => {
    if (!contractId) {
      console.error('contractId is required');
      return;
    }

    await form.validateFields();
    const { note } = await form.getFieldsValue();

    setOkLoading(true);
    const res = await contractAddNote({
      contractId,
      note,
    }).finally(() => setOkLoading(false));

    if (res.code === 200) {
      message.success('Note added successfully');
      form.resetFields();
      onSubmit?.();
    }
  };

  return (
    <Modal
      title="Add Note"
      destroyOnClose
      maskClosable={false}
      onOk={onOk}
      onCancel={() => onCancel?.()}
      onClose={() => onCancel?.()}
      okButtonProps={{ loading: okLoading }}
      {...restProps}
    >
      <Form form={form} name="note-form" layout="vertical">
        <Form.Item
          name="note"
          label="Note"
          rules={[{ required: true, message: 'Please enter Note.' }]}
        >
          <Input.TextArea
            placeholder="Please enter Note"
            rows={4}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NoteModal;
