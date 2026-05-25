import { MAX_LENGTH } from '@/constants';
import { Form, Input, Modal, ModalProps } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect } from 'react';
import styles from './index.less';

interface IProps extends ModalProps {
  onConfirm?: (values: any) => void;
}

const RejectContractModal: FC<IProps> = ({
  title = 'Reject Contract',
  open,
  onCancel,
  onConfirm,
  ...rest
}) => {
  const [form] = Form.useForm();

  const onOk = useCallback(async () => {
    const values = await form.validateFields();
    onConfirm?.(values);
  }, []);

  const resetAll = useCallback(() => {
    form.resetFields();
  }, []);

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open]);

  return (
    <>
      <Modal
        title={title}
        open={open}
        width={704}
        okText="Confirm"
        onCancel={onCancel}
        onOk={onOk}
        destroyOnClose
        forceRender
        maskClosable={false}
        {...rest}
      >
        <div className={cls('rejectContractModal', styles.rejectContractModal)}>
          <Form form={form} name="reject-contract" layout="vertical">
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter Description' },
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },
                {
                  max: MAX_LENGTH.MAX_2000,
                  message: `Cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
                },
              ]}
            >
              <Input.TextArea
                placeholder="Input more detail"
                showCount
                maxLength={2000}
                style={{ height: 384 }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default RejectContractModal;
