import { addPerception, editPerception } from '@/api/customer';
import {
  ICustomerPerceptionForm,
  ICustomerRecordsListItemChild,
} from '@/api/types/customer';
import CommonFileItem from '@/components/CommonFileItem';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import { MAX_LENGTH } from '@/constants';
import styles from '@/pages/customer/components/CustomerDetailTimeline/styles.less';
import { useParams } from '@umijs/max';
import { App, DatePicker, Form, Input, Modal } from 'antd';
import dayjs from 'dayjs';
import { memo, useState } from 'react';

const { TextArea } = Input;
export default memo(function CustomerRecordsModal(props: {
  defaultData: ICustomerPerceptionForm;
  tabKey: string;
  hideModal: () => void;
  refreshList: () => void;
}) {
  const { message } = App.useApp();
  const { defaultData, hideModal, refreshList } = props;
  const { id: customerId } = useParams();
  const [form] = Form.useForm();
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [deletedFileIdList, setDeletedFileIdList] = useState<string[]>([]);
  const [pending, setPending] = useState<boolean>(false);

  const submit = async (params: any) => {
    if (!Number(customerId)) {
      message.error('customerId is undefined');
      return;
    }
    setPending(true);
    if (defaultData.perceptionId) {
      const formData = new FormData();
      noRequestFiles.forEach((item: File) => {
        formData.append('newFiles', item);
      });
      const res = await editPerception({
        customerId: Number(customerId),
        perceptionId: Number(defaultData.perceptionId),
        addTime: dayjs(params.addTime).format('YYYY-MM-DD HH:mm:ss'),
        description: params.description,
        deletedFileIdList,
        data: formData,
      });
      setPending(false);
      if (res?.code === 200) {
        message.success('Edit successfully!');
        refreshList();
      } else {
        message.error('Edit fail!');
      }
    } else {
      const formData = new FormData();
      noRequestFiles.forEach((item: File) => {
        formData.append('files', item);
      });
      const res = await addPerception({
        customerId: Number(customerId),
        addTime: dayjs(params.addTime).format('YYYY-MM-DD HH:mm:ss'),
        description: params.description,
        data: formData,
      });
      setPending(false);
      if (res?.code === 200) {
        message.success('Add successfully!');
        refreshList();
      } else {
        message.error('Add fail!');
      }
    }
    hideModal();
  };

  const onFulfilled = (file: File) => {
    noRequestFiles.push(file);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteNoRequestFile = (index: number) => {
    noRequestFiles.splice(index, 1);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteDefaultFile = (item: ICustomerRecordsListItemChild) => {
    deletedFileIdList.push(item.fileId);
    setDeletedFileIdList([...deletedFileIdList]);
  };

  return (
    <Modal
      width={480}
      title={`${defaultData.perceptionId ? 'Edit' : 'Add'} Perception`}
      open={true}
      onCancel={hideModal}
      okButtonProps={{
        loading: pending,
        onClick: () => form.submit(),
      }}
      okText="Confirm"
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{
          addTime: defaultData.addTime ? dayjs(defaultData.addTime) : '',
          description: defaultData.description,
        }}
        style={{ marginTop: '12px' }}
        onFinish={submit}
      >
        {/*名称*/}
        <Form.Item
          name="addTime"
          style={{ fontSize: '14px' }}
          label="Time"
          rules={[{ required: true, message: 'Please enter time' }]}
        >
          <DatePicker showTime style={{ width: '100%', fontSize: '14px' }} />
        </Form.Item>
        {/*标题*/}
        <Form.Item
          name="description"
          label="Description"
          style={{ fontSize: '14px' }}
          rules={[
            { required: true, message: 'Please enter a description' },
            {
              max: MAX_LENGTH.LONGEST_NAME,
              message: `Description cannot exceed ${MAX_LENGTH.LONGEST_NAME} characters`,
            },
          ]}
        >
          <TextArea
            style={{ fontSize: '14px' }}
            placeholder="Please enter a description"
            rows={4}
          />
        </Form.Item>

        <Form.Item name="material" label="Material">
          <div style={{ display: 'flex', columnGap: '8px', flexWrap: 'wrap' }}>
            {defaultData?.materialList?.map(
              (item: ICustomerRecordsListItemChild) => {
                if (deletedFileIdList.includes(item.fileId)) {
                  return null;
                } else {
                  return (
                    <CommonFileItem
                      className={styles.file_item}
                      key={item.fileId}
                      thumbnail={item.fileBase64String}
                      fileType={item.fileType}
                      fileName={item.fileName}
                      materialId={item.fileId}
                      driveFileId={item.fileDriveId}
                      fileMimeType={item.fileMimeType}
                      showDelete
                      onDeleteTrigger={() => handleDeleteDefaultFile(item)}
                    />
                  );
                }
              },
            )}
            {noRequestFiles?.map((item: File, index: number) => (
              <NoRequestFileItem
                key={index}
                className={styles.file_item}
                file={item}
                showDelete
                onDeleteTrigger={() => handleDeleteNoRequestFile(index)}
              />
            ))}
            <div className={styles.file_item}>
              <NoRequestUpload onFulfilled={onFulfilled} />
              <div className={styles.itemDesc}>
                A single file cannot exceed 50 MB
              </div>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
});
