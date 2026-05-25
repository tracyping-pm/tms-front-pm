import { Modal, ModalProps, Spin } from 'antd';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';
import styles from './index.less';

type IframeModalProps = ModalProps & {
  url: string;
};

export interface IIFrameModalState {
  pending: boolean;
  url: string;
  open: boolean;
}

export const initialIframeModalState: IIFrameModalState = {
  pending: false,
  url: '',
  open: false,
};

const IframeModal: FC<IframeModalProps> = ({ url, open = false, ...rest }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [open]);

  return (
    <Modal
      className="iframe-modal"
      //   zIndex={10002}
      width="80%"
      title={'Preview'}
      footer={null}
      open={open}
      keyboard={false}
      maskClosable={false}
      centered
      destroyOnClose
      {...rest}
    >
      <Spin spinning={loading} tip="loading...">
        <div className={cls(styles.contentWrap, 'contentWrap')}>
          <iframe className="iframe" src={url} onLoad={onLoad}></iframe>
        </div>
      </Spin>
    </Modal>
  );
};

export default IframeModal;
