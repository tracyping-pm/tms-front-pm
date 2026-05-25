import { ExclamationCircleFilled } from '@ant-design/icons';
import { App, ModalFuncProps } from 'antd';

import React, { FC } from 'react';

export interface ICustomConfirmModal extends ModalFuncProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const CustomConfirmModal: FC<ICustomConfirmModal> = ({
  title,
  content,
  children,
  disabled,
  style,
  ...rest
}) => {
  const { modal } = App.useApp();

  const doConfirmModal = () => {
    if (disabled) {
      return;
    }
    modal.confirm({
      title: title,
      icon: <ExclamationCircleFilled />,
      content: content,
      okText: 'Confirm',
      cancelText: 'Cancel',
      autoFocusButton: null,
      ...rest,
    });
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', ...style }}
      onClick={doConfirmModal}
    >
      {children}
    </div>
  );
};
export default CustomConfirmModal;
