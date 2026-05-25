import { ticketProofAdd } from '@/api/claim';
import { IClaimDetail } from '@/api/types/claims';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import { App, Button, Flex, Form, Modal, ModalProps } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

export interface IProps extends ModalProps {
  detail: IClaimDetail;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const AddProofModal: FC<IProps> = ({
  detail,
  open,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setUploadLoading(true);
    } else {
      setUploadLoading(false);
    }
  }, []);

  const onSubmit = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const payload = {
      ticketId: detail.id,
      documentIdList: values.documentIdList,
    };

    setSubmitting(true);
    const res = await ticketProofAdd(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      message.success('Add Proof Successful!');
      onSuccess?.();
    }
  };

  useEffect(() => {
    if (open) {
    } else {
      form.resetFields();
    }
  }, [open]);

  return (
    <Modal
      title="Add Proof"
      open={open}
      width={500}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onCancel?.()}
      footer={
        <>
          <Flex justify="end" gap={8}>
            <Button onClick={() => onCancel?.()}>Cancel</Button>
            <Button
              type="primary"
              loading={uploadLoading || submitting}
              onClick={() => onSubmit()}
            >
              {uploadLoading ? 'Proof Uploading...' : 'OK'}
            </Button>
          </Flex>
        </>
      }
      {...restProps}
    >
      <Form name="add-proof-form" form={form} layout="vertical">
        <Form.Item
          name="documentIdList"
          label="Proof"
          rules={[
            {
              required: true,
              message: 'Please upload Proof',
            },
          ]}
        >
          <OssUpload
            dir={ENUM_OSS_MENU_DIRECTORY.PROJECT}
            showModeBar={true}
            scrollHeight={200}
            getUploadingSize={getUploadingSize}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProofModal;
