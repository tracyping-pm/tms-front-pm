import { updateWaybill } from '@/api/waybill';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { App } from 'antd';
import { useRef } from 'react';

type ICustomerModal = ModalFormProps & {
  waybillId: number;
  projectId: number;
  defaultRemark: string;
  hideModal: () => void;
  refresh: () => void;
};

const WaybillRemarkModal = ({
  width = 480,
  hideModal,
  refresh,
  waybillId,
  projectId,
  defaultRemark,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: { remark: string }) => {
    const res = await updateWaybill({
      id: waybillId,
      projectId: projectId,
      remark: params.remark,
    });
    if (res.code === 200) {
      message.success('Add successfully!');
      hideModal();
      refresh();
    }
  };

  return (
    <>
      <ModalForm
        name="waybill-remark"
        open={true}
        title={`Remark`}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
        }}
        initialValues={{
          remark: defaultRemark,
        }}
        onFinish={submit}
        {...restProps}
      >
        <ProFormTextArea
          name="remark"
          label="Remark"
          placeholder="Remark"
          fieldProps={{
            rows: 6,
          }}
          rules={[
            {
              required: true,
              message: 'Please enter remark',
            },
            {
              max: 5000,
              message: `Remark cannot exceed 5000 characters`,
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default WaybillRemarkModal;
