import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import { transmittalConfirm } from '@/api/transmittal';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { MAX_LENGTH } from '@/constants';
import { UploadPathTypeEnum } from '@/enums';
import styles from './common.less';

interface IConfirmReceivedModal extends ModalFormProps {
  open: boolean;
  transmittalId: number;
  onConfirm?: (b?: boolean) => void;
}

const { TextArea } = Input;

const ConfirmReceivedModal = ({
  open,
  transmittalId,
  onConfirm,
  width = 480,
  modalProps,
  ...restProps
}: IConfirmReceivedModal) => {
  const formRef = useRef<ProFormInstance>();
  const [description, setDescription] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setFileUploading(true);
    } else {
      setFileUploading(false);
    }
  }, []);

  const handleOk = async () => {
    const values = formRef.current?.getFieldsValue?.();

    setConfirmLoading(true);
    const res = await transmittalConfirm({
      id: transmittalId,
      materialIds: values.materialIds,
      description: values.description || undefined,
    }).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      message.success('Confirm transmittal successfully!');
      onConfirm?.();
    }
  };

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  useEffect(() => {
    if (open) {
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="confirm-received-modal"
        open={open}
        title={'Confirm Received'}
        width={width}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        submitter={{
          searchConfig: {
            submitText: fileUploading ? 'Waiting File Uploading' : 'confirm',
          },
          submitButtonProps: {
            loading: fileUploading || confirmLoading,
          },
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Form.Item
          name={'materialIds'}
          label={'Upload'}
          trigger="onChange"
          rules={[
            {
              required: true,
              message: 'Please upload at least one file',
            },
          ]}
        >
          <DraggerUpload
            dto={{ entityId: 73, pathType: UploadPathTypeEnum.TRANSMITTAL }}
            getUploadingSize={getUploadingSize}
          />
        </Form.Item>
        <Form.Item
          name={'description'}
          label={'Description'}
          trigger="onChange"
          style={{ paddingBottom: 12 }}
          rules={[
            {
              max: MAX_LENGTH.MAX_2000,
              message: `Description must not exceed ${MAX_LENGTH.MAX_2000} characters in length`,
            },
          ]}
        >
          <div style={{ position: 'relative' }}>
            <TextArea
              rows={2}
              value={description}
              maxLength={MAX_LENGTH.MAX_2000}
              className={styles.textarea}
              placeholder="Description"
              onChange={(val) => {
                setDescription(val.target.value);
              }}
            />
            <div className={styles.textLength}>{description.length}/2000</div>
          </div>
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default ConfirmReceivedModal;
