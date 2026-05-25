import { Modal } from 'antd';
import { memo } from 'react';

export default memo(function LoadingConfirmModal(props: {
  hideModal: () => void;
  confirm: () => void;
  title: string;
  content: string;
  confirmText: string;
}) {
  const { hideModal, confirm, title, content, confirmText } = props;

  return (
    <Modal
      title={title}
      open={true}
      cancelButtonProps={{
        style: { display: 'none' },
      }}
      onCancel={hideModal}
      onOk={confirm}
      okText={confirmText}
      maskClosable={false}
    >
      <div
        style={{
          color: '#252525',
        }}
      >
        {content}
      </div>
    </Modal>
  );
});
