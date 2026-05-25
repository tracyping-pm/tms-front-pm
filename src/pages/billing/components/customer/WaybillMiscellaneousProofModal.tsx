import { miscellaneousChangeWaybillSave } from '@/api/billing';
import { IMiscellaneousChargeList } from '@/api/types/billing';
import OssUpload from '@/components/OssUpload';
import {
  ENUM_OSS_MENU_DIRECTORY,
  IOssFile,
} from '@/components/OssUpload/types';
import PubSubContext from '@/context/pubsub';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
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

type IWaybillMiscellaneousProofModal = ModalFormProps & {
  onCancel: () => void;
  onRefresh: () => void;
  miscellaneousChargeList: IMiscellaneousChargeList[];
  materialList: IOssFile[];
};

const WaybillMiscellaneousProofModal = ({
  open,
  miscellaneousChargeList,
  materialList,
  modalProps,
  onCancel,
  onRefresh,
  ...restProps
}: IWaybillMiscellaneousProofModal) => {
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
      documentIds: values.documentIds,
      details: miscellaneousChargeList.map((item) => {
        const { id, waybillNumber, symbol, miscellaneous } = item;
        return {
          statementWaybillId: id,
          waybillNumber: waybillNumber,
          miscellaneousCharge:
            symbol === '+' ? miscellaneous : Number(`-${miscellaneous}`),
        };
      }),
    };

    const res = await miscellaneousChangeWaybillSave(payload);

    setState({ loading: false });
    if (res?.code === 200) {
      onRefresh?.();
      onCancel?.();
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      message.success('Edit Miscellaneous Charge successfully!');
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
        name="Miscellaneous-Proof-Modal"
        open={open}
        title="Edit Miscellaneous Charge"
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
        <div style={{ marginBottom: 10 }}>
          Please Upload relevant documentation before confirming the
          Miscellaneous Charge
        </div>
        <Form.Item
          name="documentIds"
          label="Proof"
          rules={[{ required: true, message: 'Please upload Proof' }]}
        >
          <OssUpload
            dir={ENUM_OSS_MENU_DIRECTORY.AR_AP}
            fileList={materialList}
            showModeBar={true}
            scrollHeight={200}
            getUploadingSize={getUploadingSize}
          />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default WaybillMiscellaneousProofModal;
