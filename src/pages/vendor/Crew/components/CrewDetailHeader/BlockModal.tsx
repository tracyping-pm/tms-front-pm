import { crewBlock } from '@/api/crew';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import { EnumCrewBlockReasonType } from '@/enums';
import { useParams } from '@umijs/max';
import {
  App,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  ModalProps,
  Row,
  Select,
} from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

const reasonTypeOptions = [
  {
    label: EnumCrewBlockReasonType.THEFT,
    value: EnumCrewBlockReasonType.THEFT,
  },
  {
    label: EnumCrewBlockReasonType.PILFERAGE,
    value: EnumCrewBlockReasonType.PILFERAGE,
  },
  {
    label: EnumCrewBlockReasonType.TAMPERING_FALSIFICATION,
    value: EnumCrewBlockReasonType.TAMPERING_FALSIFICATION,
  },
  {
    label: EnumCrewBlockReasonType.POSITIVE_IN_DRUG_TEST,
    value: EnumCrewBlockReasonType.POSITIVE_IN_DRUG_TEST,
  },
  {
    label: EnumCrewBlockReasonType.MISCONDUCT_IMPROPER_BEHAVIOR,
    value: EnumCrewBlockReasonType.MISCONDUCT_IMPROPER_BEHAVIOR,
  },
  {
    label: EnumCrewBlockReasonType.OTHERS,
    value: EnumCrewBlockReasonType.OTHERS,
  },
];

export interface IProps extends ModalProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const BlockModal: FC<IProps> = ({
  open,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { id: crewId } = useParams();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const reason = Form.useWatch('reason', form);
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
      id: Number(crewId),
      reason: values.reason,
      remark: values.remark,
      documentIdList: values.documentIdList,
    };

    setSubmitting(true);
    const res = await crewBlock(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      message.success('Crew Blocked Successful!');
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
      title="Block Crew"
      open={open}
      width={600}
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
      <Form name="block-crew-form" form={form} layout="vertical">
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              name="reason"
              label="Reason"
              rules={[
                {
                  required: true,
                  message: 'Please select Reason',
                },
              ]}
            >
              <Select placeholder="Reason Type" options={reasonTypeOptions} />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              name="remark"
              label=" "
              required={false}
              dependencies={['reason']}
              rules={[
                {
                  required: reason === EnumCrewBlockReasonType.OTHERS,
                  message: 'Please enter Remark',
                },
              ]}
            >
              <Input.TextArea
                placeholder="Remark"
                rows={1}
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
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
            dir={ENUM_OSS_MENU_DIRECTORY.CREW}
            showModeBar={true}
            scrollHeight={200}
            getUploadingSize={getUploadingSize}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BlockModal;
