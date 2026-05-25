import { Modal, Spin } from 'antd';
import { memo } from 'react';

export default memo(function LoadingModal() {
  return (
    <Modal
      title={``}
      open={true}
      footer={null}
      closeIcon={null}
      maskClosable={false}
    >
      <div
        style={{
          height: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: '24px', fontSize: '14px', color: '#252525' }}>
          System data is being synchronized to the bound Sheet, please wait.
        </div>
      </div>
    </Modal>
  );
});
