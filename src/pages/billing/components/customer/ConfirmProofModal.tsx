import { statementCustomerConfirm } from '@/api/billing';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { UploadPathTypeEnum } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Form } from 'antd';
import { FC, useCallback, useContext, useEffect } from 'react';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_PROOF_LIST_RELOAD,
} from '../event';

interface IState {
  isEdit: boolean;
  deletedMaterialIdList: number[];
  loading: boolean;
}

const initialState: IState = {
  isEdit: false,
  deletedMaterialIdList: [],
  loading: false,
};

interface IProps extends ModalFormProps {
  onCancel: () => void;
}

const ConfirmProofModal: FC<IProps> = ({
  open,
  modalProps,
  onCancel,
  ...rest
}) => {
  const { message } = App.useApp();
  const { publish } = useContext(PubSubContext);
  const [form] = Form.useForm();
  const { id: statementId } = useParams();
  const [state, setState] = useSetState<IState>(initialState);

  const submit = useCallback(async () => {
    await form?.validateFields?.();
    const values = form?.getFieldsValue?.();
    setState({ loading: true });
    const payload = {
      id: +statementId!,
      bindIds: values.proofIds,
    };
    setState({ loading: true });
    const res = await statementCustomerConfirm(payload);
    setState({ loading: false });
    if (res.code === 200) {
      if (res.data && res.data?.length !== 0) {
        message.error({
          content: (
            <div>
              There is an ongoing Claim Request
              {res.data.map((item) => {
                return (
                  <a
                    key={item.id}
                    onClick={() => {
                      openNewTag(
                        `${PATHS.CLAIM_TICKET_LIST}?type=claimRequest&id=${item?.id}&claimRequestNo=${item?.claimRequestNo}`,
                      );
                    }}
                  >
                    {' '}
                    {item?.claimRequestNo}
                  </a>
                );
              })}
              being split. Please confirm later.
            </div>
          ),
          duration: 3,
        });
        return;
      }
      message.success('confirm success');
      publish(EVENT_PROOF_LIST_RELOAD);
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      onCancel();
    }
  }, [state]);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setState({ loading: true });
    } else {
      setState({ loading: false });
    }
  }, []);

  const getDeleteMaterialId = (v: number) => {
    const idList = [...state.deletedMaterialIdList];
    idList.push(v);
    setState({ deletedMaterialIdList: idList });
  };

  useEffect(() => {
    if (open) {
      setState({
        loading: false,
      });

      setState({ isEdit: false });
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="customer-confirm-modal"
        title={`Customer Confirm Proof`}
        open={open}
        form={form}
        width={480}
        modalProps={{
          ...modalProps,
          destroyOnClose: false,
          maskClosable: false,
          onCancel: onCancel,
          okText: 'Ok',
        }}
        onFinish={submit}
        submitter={{
          submitButtonProps: {
            loading: state.loading,
          },
        }}
        {...rest}
      >
        <Form.Item
          name="proofIds"
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
            getDeleteMaterialId={getDeleteMaterialId}
          />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default ConfirmProofModal;
