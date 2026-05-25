import { claimEditOcStatus } from '@/api/claim';
import { IClaimDetail } from '@/api/types/claims';
import { EnumClaimOcStatus, ocStatusOptions } from '@/enums/claim';
import { App, Button, Flex, Form, Modal, ModalProps, Select } from 'antd';
import { FC, useEffect, useState } from 'react';

export interface IProps extends ModalProps {
  detail: IClaimDetail;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const OcStatusModal: FC<IProps> = ({
  detail,
  open,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const fieldError = await form?.getFieldsError?.();
    const hasErrorFields = fieldError?.filter((item) => item.errors?.length);

    if (hasErrorFields?.length > 0) {
      return;
    }
    await form.validateFields();
    const values = form.getFieldsValue();
    const payload = {
      id: detail.id,
      ocStatus: values.ocStatus,
    };

    setSubmitting(true);
    const res = await claimEditOcStatus(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      message.success('Edit OC Status Successful!');
      onSuccess?.();
    }
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ocStatus: detail.ocStatus,
      });
    } else {
      form.resetFields();
    }
  }, [open, detail]);

  const validateDescription = async () => {
    const { totalAmount } = detail;

    if (totalAmount === 0) {
      setDisabled(true);
      form?.setFields([
        {
          name: 'ocStatus',
          value: EnumClaimOcStatus.Not_Chargeable,
          errors: [
            'Total Claim Amount = 0. Update to non-zero first to modify OC Status.',
          ],
        },
      ]);
    } else {
      setDisabled(false);
      form?.setFields([
        {
          name: 'ocStatus',
          errors: [],
        },
      ]);
    }
  };

  useEffect(() => {
    validateDescription();
  }, [detail.itemList, detail.totalAmount]);

  return (
    <Modal
      title="OC Status"
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
              loading={submitting}
              onClick={() => onSubmit()}
            >
              OK
            </Button>
          </Flex>
        </>
      }
      {...restProps}
    >
      <Form name="edit-oc-status-form" form={form} layout="vertical">
        <Form.Item
          label="OC Status"
          name="ocStatus"
          rules={[{ required: true, message: 'Please select OC Status' }]}
        >
          <Select
            placeholder="OC Status"
            options={ocStatusOptions}
            disabled={disabled}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OcStatusModal;
