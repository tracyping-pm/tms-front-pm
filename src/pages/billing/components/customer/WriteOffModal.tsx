import { statementWrittenOffCreate } from '@/api/billing';
import CustomTooltip from '@/components/CustomTooltip';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { CountryCurrencyEnumText, UploadPathTypeEnum } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { App, Form, Modal } from 'antd';
import { memo, useCallback, useContext, useState } from 'react';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_PROOF_LIST_RELOAD,
} from '../event';

export default memo(function WriteOffModal({
  writeOffAmount,
  onCancel,
}: {
  writeOffAmount: number;
  onCancel: () => void;
}) {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const { id: statementId } = useParams();
  const { publish } = useContext(PubSubContext);
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const typeValue = Form.useWatch('type', form);
  const [pending, setPending] = useState<boolean>(false);

  const [fileUploading, setFileUploading] = useState(false);

  const submit = async () => {
    await form?.validateFields?.();
    const values = form?.getFieldsValue?.();
    setPending(true);
    const controller = new AbortController();
    const signal = controller.signal;

    const payload = {
      statementId: Number(statementId),
      materialIds: values.materialIds,
      type: values.type,
      reason: values.reason,
    };
    const res = await statementWrittenOffCreate({
      data: payload,
      signal,
    });
    setPending(false);
    if (res.code === 200) {
      message.success('Write Off Successfully');
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      publish(EVENT_PROOF_LIST_RELOAD);
      onCancel();
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setFileUploading(true);
    } else {
      setFileUploading(false);
    }
  }, []);

  return (
    <>
      <Modal
        title={
          <>
            Write Off
            <CustomTooltip
              placement="top"
              overlayStyle={{
                maxWidth: 470,
              }}
              title={
                'Write Off the Statement, no further collection will be made on the remaining amount, and all items within the statement will be marked as settled.'
              }
            >
              <InfoCircleOutlined style={{ marginLeft: 10 }} />
            </CustomTooltip>
          </>
        }
        open={true}
        okText="Confirm"
        okButtonProps={{
          htmlType: 'submit',
          loading: pending || fileUploading,
          onClick: () => form.submit(),
        }}
        // style={{ top: 200 }}
        onCancel={onCancel}
        maskClosable={false}
        width={492}
      >
        <Form
          name="Write-Off"
          form={form}
          layout="vertical"
          autoComplete="off"
          style={{ marginTop: '12px' }}
          onFinish={submit}
        >
          <div style={{ marginBottom: 12 }}>
            Write Off Amount： {CountryCurrencyEnumText[countryId as number]}
            &nbsp;
            {formatAmount(writeOffAmount)}
          </div>
          <ProFormSelect
            label="Write Off Reason"
            name="type"
            options={[
              { value: 'Customer', label: 'Customer Reason' },
              { value: 'Inteluck ', label: 'Inteluck  Reason' },
            ]}
            placeholder="Please select"
            rules={[
              {
                required: true,
                message: 'Please select Write Off Reason',
              },
            ]}
          />
          <ProFormTextArea
            name="reason"
            label={`${typeValue ?? ''} Reason`}
            placeholder={`Please enter ${typeValue ?? ''} Reason`}
            showCount
            maxLength={MAX_LENGTH.MAX_2000}
            rules={[
              {
                required: true,
                message: `Please enter ${typeValue ?? ''} Reason`,
              },
              {
                whitespace: true,
                message: 'Cannot only contain spaces',
              },
              {
                max: MAX_LENGTH.MAX_2000,
                message: `Reason cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
              },
            ]}
          />
          <Form.Item
            name="materialIds"
            label="Proof"
            rules={[{ required: true, message: 'Please upload Proof' }]}
          >
            <DraggerUpload
              showModeBar={false}
              materialList={[]}
              scrollHeight={150}
              dto={{
                entityId: statementId,
                pathType: UploadPathTypeEnum.STATEMENT_PROOF,
              }}
              getUploadingSize={getUploadingSize}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
