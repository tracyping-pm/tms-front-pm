import { approvalDriver, blockUnblockDriver } from '@/api/truck';
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
  driverAccredited: boolean;
  enable: boolean;
  hideModal: () => void;
  detailId: number;
  refresh: () => void;
};

const DriverMarkModal = ({
  width = 600,
  tagText,
  enable,
  driverAccredited,
  hideModal,
  detailId,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: any) => {
    let res;
    if (driverAccredited) {
      res = await approvalDriver({
        id: detailId,
        reason: params.reason,
        enable: true,
      });
    } else {
      res = await blockUnblockDriver({
        id: detailId,
        reason: params.reason,
        enable,
      });
    }

    if (res.code === 200) {
      message.success(
        `${driverAccredited ? 'Approval' : enable ? 'Unblock' : 'Block'} successfully!`,
      );
      refresh();
      hideModal();
    }
  };

  return (
    <>
      <ModalForm
        name="driver-mark-modal"
        open={true}
        title={`${enable ? 'Unblock' : 'Block'} Confirm`}
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
          okText: `Confirm`,
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

export default DriverMarkModal;
