import { vendorDetailBlockUnblock } from '@/api/vendor';
import { MAX_LENGTH } from '@/constants';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { App } from 'antd';
import cls from 'classnames';
import { useRef } from 'react';
import styles from './common.less';

type ICustomerModal = ModalFormProps & {
  tagText: string;
  blockEnable: boolean;
  hideModal: () => void;
  vendorId: number;
  refresh: () => void;
};

const MarkModal = ({
  width = 600,
  tagText,
  blockEnable,
  hideModal,
  vendorId,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: any) => {
    const res = await vendorDetailBlockUnblock({
      id: Number(vendorId),
      enable: blockEnable,
      reason: params.reason,
    });
    if (res.code === 200) {
      message.success(`${blockEnable ? 'block' : 'unblock'} success!`);
      refresh();
      hideModal();
    }
  };

  return (
    <>
      <ModalForm
        name="block-mark-modal"
        open={true}
        title={`${blockEnable ? 'Block' : 'Unblock'} Confirm`}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={{
          driverName: '',
        }}
        modalProps={{
          ...modalProps,
          className: cls(styles.blockVendor),
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          okText: `Confirm ${blockEnable ? 'Block' : 'Unblock'}`,
        }}
        onFinish={submit}
        {...restProps}
      >
        <div className={styles.blockVendorTag}>{tagText}</div>
        <ProFormTextArea
          name="reason"
          label="Reason:"
          placeholder="Reason"
          rules={[
            {
              required: true,
              message: 'Please enter reason',
            },
            {
              max: MAX_LENGTH.MAX_2000,
              message: `Reason cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default MarkModal;
