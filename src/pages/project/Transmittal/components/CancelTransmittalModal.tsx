import { transmittalCancel } from '@/api/transmittal';
import { MAX_LENGTH } from '@/constants';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import { useState } from 'react';
import styles from './common.less';

interface ICancelTransmittalModal extends ModalFormProps {
  open: boolean;
  transmittalId: number;
  onConfirm?: (b?: boolean) => void;
}
const { TextArea } = Input;

const CancelTransmittalModal = ({
  open,
  transmittalId,
  onConfirm,
  width = 480,
  modalProps,
  ...restProps
}: ICancelTransmittalModal) => {
  const [reason, setReason] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    setConfirmLoading(true);
    const res = await transmittalCancel({ id: transmittalId, reason }).finally(
      () => {
        setConfirmLoading(false);
      },
    );
    if (res.code === 200) {
      message.success('Cancel transmittal successfully!');
      onConfirm?.(false);
    }
  };

  return (
    <>
      <ModalForm
        name="cancel-transmittal-modal"
        open={open}
        title={'Cancel Transmittal'}
        width={width}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
          },
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <div className={styles.cancelIntro}>Transmittal will be cancelled</div>
        <Form.Item
          name={'reason'}
          label={'Reason'}
          trigger="onChange"
          style={{ paddingBottom: 12 }}
          rules={[
            {
              max: MAX_LENGTH.MAX_2000,
              message: `Reason must not exceed ${MAX_LENGTH.MAX_2000} characters in length`,
            },
          ]}
        >
          <div style={{ position: 'relative' }}>
            <TextArea
              rows={2}
              value={reason}
              maxLength={MAX_LENGTH.MAX_2000}
              className={styles.textarea}
              placeholder="Reason"
              onChange={(val) => {
                setReason(val.target.value);
              }}
            />
            <div className={styles.textLength}>{reason.length}/2000</div>
          </div>
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default CancelTransmittalModal;
