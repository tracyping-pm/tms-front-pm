import { statementReject } from '@/api/billing';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { UploadPathTypeEnum } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Form } from 'antd';
import { useCallback, useContext } from 'react';
import { EVENT_BILLING_STATEMENT_DETAIL_RELOAD } from '../event';

interface IState {
  loading: boolean;
}

const initialState: IState = {
  loading: false,
};

type IEditInvoiceModal = ModalFormProps & {
  onCancel: () => void;
};

const RejectStatementModal = ({
  open,
  modalProps,
  onCancel,
  ...restProps
}: IEditInvoiceModal) => {
  const { message } = App.useApp();
  const { id: statementId } = useParams();
  const { publish } = useContext(PubSubContext);
  const [form] = Form.useForm();
  const [state, setState] = useSetState<IState>(initialState);

  const submit = async () => {
    await form?.validateFields();
    const values = form?.getFieldsValue();
    setState({ loading: true });
    const payload = {
      statementId: +statementId!,
      reason: values.reason,
      materialIds: values.rejectProof,
    };
    const res = await statementReject(payload);
    setState({ loading: false });
    if (res?.code === 200) {
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      message.success('Reject Statement successfully!');
      onCancel();
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setState({ loading: true });
    } else {
      setState({ loading: false });
    }
  }, []);

  return (
    <>
      <ModalForm
        name="Vendor-Reject-Statement"
        open={open}
        title="Vendor Reject Statement"
        width={562}
        form={form}
        modalProps={{
          ...modalProps,
          onCancel,
          okText: 'Ok',
          forceRender: true,
          maskClosable: false,
        }}
        onFinish={submit}
        submitter={{
          submitButtonProps: {
            loading: state.loading,
          },
        }}
        {...restProps}
      >
        <ProFormTextArea
          name="reason"
          label="Reject Reason"
          placeholder="Please enter Reject Reason"
          rules={[
            {
              required: true,
              message: 'Please enter Reject Reason',
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
          name="rejectProof"
          label="Reject Proof"
          rules={[{ required: true, message: 'Please upload Reject Proof' }]}
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
      </ModalForm>
    </>
  );
};

export default RejectStatementModal;
