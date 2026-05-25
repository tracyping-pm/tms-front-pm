import { crewDeactivate } from '@/api/crew';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { EVENT_STATUS_CHANGE_RECORD_RELOAD } from '@/pages/vendor/event';
import {
  ModalForm,
  ModalFormProps,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { App, Form } from 'antd';
import { useCallback, useContext, useState } from 'react';

type IDeactivateModal = ModalFormProps & {
  onCancel: () => void;
  onRefresh: () => void;
};

const DeactivateModal = ({
  open,
  modalProps,
  onCancel,
  onRefresh,
  ...restProps
}: IDeactivateModal) => {
  const { message } = App.useApp();
  const { id: crewId } = useParams();
  const { publish } = useContext(PubSubContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const submit = async () => {
    await form?.validateFields();
    const values = form?.getFieldsValue();
    setLoading(true);
    const payload = {
      id: +crewId!,
      reason: values.reason,
      documentIdList: values.proof,
    };

    const res = await crewDeactivate(payload).finally(() => {
      setLoading(false);
    });

    if (res?.code === 200) {
      message.success('Deactivate successfully!');
      publish(EVENT_STATUS_CHANGE_RECORD_RELOAD);
      onRefresh();
      onCancel();
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <ModalForm
        name="deactivate-crew"
        open={open}
        title="Deactivate Crew"
        width={562}
        form={form}
        modalProps={{
          ...modalProps,
          onCancel,
          okText: 'Deactivate',
          forceRender: true,
          maskClosable: false,
        }}
        onFinish={submit}
        submitter={{
          submitButtonProps: {
            loading: loading,
          },
        }}
        {...restProps}
      >
        <ProFormTextArea
          name="reason"
          label="Reason"
          placeholder="Please enter Deactivate Reason"
          rules={[
            {
              required: true,
              message: 'Please enter Deactivate Reason',
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
          name="proof"
          label="Proof"
          rules={[
            { required: true, message: 'Please upload Deactivate Proof' },
          ]}
        >
          <OssUpload
            dir={ENUM_OSS_MENU_DIRECTORY.CREW}
            fileList={[]}
            showModeBar={false}
            scrollHeight={150}
            getUploadingSize={getUploadingSize}
          />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default DeactivateModal;
