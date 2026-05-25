import { statementProofCreate, statementProofEdit } from '@/api/billing';
import { ICommonMaterial } from '@/api/types/common';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { UploadPathTypeEnum } from '@/enums';
import { formatString } from '@/utils/format';
import {
  ModalForm,
  ModalFormProps,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Form } from 'antd';
import { FC, useCallback, useContext, useEffect } from 'react';
import { EVENT_PROOF_LIST_RELOAD } from '../../event';
import { IStatementMaterialListItem } from '../../FileMaterialList/ListItem';

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
  defaultData?: IStatementMaterialListItem;
  materialList: ICommonMaterial[];
  hideModal: () => void;
}

const ProofModal: FC<IProps> = ({
  open,
  defaultData,
  modalProps,
  materialList,
  hideModal,
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
    if (state.isEdit) {
      const payload = {
        statementProofId: defaultData?.id as number,
        deletedMaterialIdList: state.deletedMaterialIdList,
        proofType: values.proofType
          ? formatString(values.proofType)
          : 'Statement Proof',
        description: values.description
          ? formatString(values.description)
          : undefined,
        materialIds: values.proofIds,
      };

      const res = await statementProofEdit(payload);
      setState({ loading: false });
      if (res?.code === 200) {
        publish(EVENT_PROOF_LIST_RELOAD);
        message.success('Edit successfully!');
      }
    } else {
      const payload = {
        statementId: +statementId!,
        proofType: values.proofType || 'Statement Proof',
        description: values.description,
        materialIds: values.proofIds,
      };

      const res = await statementProofCreate(payload);
      setState({ loading: false });
      if (res?.code === 200) {
        publish(EVENT_PROOF_LIST_RELOAD);
        message.success('Add successfully!');
      }
    }
    hideModal();
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
        deletedMaterialIdList: [],
        loading: false,
      });
      const materialIds = defaultData?.materialVoList.map(
        (material) => material.fileMaterialId,
      );
      form.setFieldValue('proofIds', materialIds);
      if (defaultData?.id) {
        setState({ isEdit: true });
      } else {
        setState({ isEdit: false });
      }
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="proof-modal"
        title={`${state.isEdit ? 'Edit' : 'Add'} Proof`}
        open={open}
        form={form}
        width={480}
        initialValues={{
          proofType: defaultData?.proofType ?? 'Statement Proof',
          description: defaultData?.description,
        }}
        modalProps={{
          ...modalProps,
          destroyOnClose: false,
          maskClosable: false,
          onCancel: hideModal,
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
        <ProFormText
          name={'proofType'}
          label={'Proof Type'}
          placeholder={'Please enter Proof Type'}
          rules={[
            {
              whitespace: true,
              message: 'Cannot only contain spaces',
            },

            {
              max: MAX_LENGTH.MAX_128,
              message: `Proof Type cannot exceed ${MAX_LENGTH.MAX_128} characters`,
            },
          ]}
        />

        <ProFormTextArea
          name={'description'}
          label={'Description'}
          placeholder="Please enter a description"
          fieldProps={{ rows: 4 }}
          rules={[
            { required: false, message: 'Please enter a description' },
            {
              max: MAX_LENGTH.MAX_2000,
              message: `Description cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
            },
          ]}
        />

        <Form.Item
          name="proofIds"
          label="Proof"
          rules={[{ required: true, message: 'Please upload Proof' }]}
        >
          <DraggerUpload
            showModeBar={false}
            materialList={materialList}
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

export default ProofModal;
