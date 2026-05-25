import { transmittalCancel } from '@/api/transmittal';
import { EditSettlementItemsEnumOptions } from '@/enums';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { Checkbox, Form, message } from 'antd';
import { useState } from 'react';

interface ISettlementItemsModal extends ModalFormProps {
  onCancel?: () => void;
}

const SettlementItemsModal = ({
  onCancel,
  width = 480,
  modalProps,
  ...restProps
}: ISettlementItemsModal) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    setConfirmLoading(true);
    const res = await transmittalCancel({ id: 1 }).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      message.success('Edit Settlement Items successfully!');
      onCancel?.();
    }
  };

  return (
    <>
      <ModalForm
        name="edit-settlement-modal"
        open={true}
        title={'Edit Settlement Items'}
        width={width}
        modalProps={{
          ...modalProps,
          onCancel,
          okText: 'Confirm',
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
        <Form.Item
          name="listOfServices"
          label="Edit Settlement Items"
          layout="horizontal"
        >
          <Checkbox.Group
            options={EditSettlementItemsEnumOptions}
            style={{ marginTop: 4, gap: 8 }}
          />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default SettlementItemsModal;
