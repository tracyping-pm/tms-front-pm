import { Alert, Modal, ModalProps } from 'antd';
import { FC } from 'react';
import { EnumBatchType } from './BatchLockModal';

interface IBatchSuccessModalProps extends ModalProps {
  type: EnumBatchType;
}

const BatchSuccessModal: FC<IBatchSuccessModalProps> = ({
  type,
  ...restProps
}) => {
  // const text = type === EnumBatchType.SUBMIT ? 'Submit' : 'Start ';
  const textObj = {
    [EnumBatchType.SUBMIT]: 'Submit',
    [EnumBatchType.START]: 'Start ',
    [EnumBatchType.CONFIRM_PRICE]: 'Confirm Price',
  };
  return (
    <Modal
      title={'Success Info'}
      width={500}
      centered
      destroyOnClose
      maskClosable={false}
      footer={null}
      {...restProps}
    >
      <Alert
        description={`The most recent batch ${textObj[type].toLocaleLowerCase()} all successful.`}
        type="success"
        showIcon
      />
    </Modal>
  );
};

export default BatchSuccessModal;
