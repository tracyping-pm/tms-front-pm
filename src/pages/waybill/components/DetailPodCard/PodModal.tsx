import { ICommonMaterial } from '@/api/types/common';
import { IPodItem } from '@/api/types/waybill';
import { addPod, editPod, waybillListPodNumberType } from '@/api/waybill';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { MAX_LENGTH } from '@/constants';
import { UploadPathTypeEnum } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { App, Button, Form } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

interface IState {
  isEdit: boolean;
  pending: boolean;
  podTypeOptions: any[];
}

const initialState: IState = {
  isEdit: false,
  pending: false,
  podTypeOptions: [],
};

interface IProps extends ModalFormProps {
  onlyShowUpload?: boolean;
  defaultData?: IPodItem;
  waybillId: number;
  projectId: number;
  materialList: ICommonMaterial[];
  hideModal: () => void;
  refresh: () => void;
}

const PodModal: FC<IProps> = ({
  open,
  onlyShowUpload = false,
  defaultData,
  waybillId,
  projectId,
  hideModal,
  refresh,
  materialList,
  ...rest
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [state, setState] = useSetState<IState>(initialState);
  const [fileUploading, setFileUploading] = useState(false);

  const submit = useCallback(async () => {
    await form?.validateFields?.();
    const values = form?.getFieldsValue?.();
    if (state.isEdit && defaultData) {
      const payload = onlyShowUpload
        ? {
            projectId,
            waybillId,
            waybillPodId: defaultData.waybillPodId,
            podType: defaultData.podType,
            description: defaultData.description,
            materialIds: values.materialIds,
          }
        : {
            projectId,
            waybillId,
            waybillPodId: defaultData.waybillPodId,
            podType: values.podType,
            description: values.description,
            materialIds: defaultData.materialVoList.map(
              (material) => material.fileMaterialId,
            ),
          };

      setState({ pending: true });
      const res = await editPod(payload).finally(() => {
        setState({ pending: false });
      });
      if (res?.code === 200) {
        message.success('Edit successfully!');
        refresh();
      } else {
        message.error('Edit fail!');
      }
    } else {
      const payload = {
        projectId,
        waybillId,
        podType: values.podType,
        description: values.description,
        materialIds: values.materialIds,
      };
      setState({ pending: true });
      const res = await addPod(payload).finally(() => {
        setState({ pending: false });
      });

      if (res?.code === 200) {
        message.success('Add successfully!');
        refresh();
      } else {
        message.error('Add fail!');
      }
    }
    hideModal();
  }, [state, defaultData, onlyShowUpload]);

  const getAllPodType = useCallback(async () => {
    const res = await waybillListPodNumberType();
    if (res.code === 200) {
      const options = res?.data?.map((item) => {
        return {
          label: item.name,
          value: item.name,
        };
      });
      setState({ podTypeOptions: options });
    }
  }, []);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setFileUploading(true);
    } else {
      setFileUploading(false);
    }
  }, []);

  useEffect(() => {
    getAllPodType();
  }, []);

  useEffect(() => {
    if (open) {
      setState({
        pending: false,
      });
      if (defaultData?.waybillPodId) {
        setState({ isEdit: true });
      } else {
        setState({ isEdit: false });
      }
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="pod-modal"
        title={`${state.isEdit ? 'Edit' : 'Add'} POD`}
        open={open}
        form={form}
        width={490}
        initialValues={{
          podType: defaultData?.podType,
          description: defaultData?.description,
        }}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: hideModal,
        }}
        submitter={{
          render: () => {
            return [
              <Button key={'cancel'} onClick={hideModal}>
                Cancel
              </Button>,
              <Button
                key={'submit'}
                type="primary"
                onClick={() => {
                  submit();
                }}
                loading={fileUploading || state.pending}
              >
                {fileUploading ? 'Waiting Document Uploading' : 'Confirm'}
              </Button>,
            ];
          },
        }}
        {...rest}
      >
        {onlyShowUpload ? (
          <Form.Item
            name="materialIds"
            label="Document"
            rules={[{ required: true, message: 'Please upload material' }]}
          >
            <DraggerUpload
              materialList={materialList}
              dto={{
                entityId: waybillId,
                pathType: UploadPathTypeEnum.WAYBILL_POD,
              }}
              getUploadingSize={getUploadingSize}
            />
          </Form.Item>
        ) : (
          <>
            <ProFormSelect
              name={'podType'}
              label={'type'}
              placeholder={'Please select type'}
              rules={[{ required: true, message: 'Please select type' }]}
              disabled={defaultData?.defaultPod}
              fieldProps={{
                title: '',
                showSearch: true,
                filterOption: true,
                options: state.podTypeOptions,
              }}
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
          </>
        )}
      </ModalForm>
    </>
  );
};

export default PodModal;
