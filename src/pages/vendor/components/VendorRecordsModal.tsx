import { getImageSource } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import { addVendorRecord, changeVendorRecord } from '@/api/vendor';
import CommonFileItem from '@/components/CommonFileItem';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import { formatBytes, getExts } from '@/components/CustomUpload/fileSupport';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import {
  BELONG_IMG_EXTS,
  IMAGE_TYPE,
  initialImageState,
  MAX_LENGTH,
  TOTAL_LIMIT_SIZE,
} from '@/constants';
import styles from '@/pages/customer/components/CustomerDetailTimeline/styles.less';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, DatePicker, Form, Input, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';

const { TextArea } = Input;

export default memo(function VendorRecordsModal(props: {
  defaultData: any;
  tabKey: string;
  hideModal: () => void;
  refreshList: () => void;
}) {
  const { id: vendorId } = useParams();
  const { message } = App.useApp();
  const { defaultData, hideModal, refreshList } = props;
  const [form] = Form.useForm();
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [deletedFileIdList, setDeletedFileIdList] = useState<number[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const initPreview = useCallback(async () => {
    const allMaterialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    defaultData?.materialList?.forEach((material: ICommonMaterial) => {
      if (IMAGE_TYPE.includes(material.fileType)) {
        allMaterialList.push(material);
      }
    });

    setImageState({
      pending: true,
    });
    allMaterialList.forEach((material) => {
      allSettled.push(getImageSource(material));
    });

    Promise.allSettled(allSettled)
      .then((values) => {
        const sourceImages: ISourceImage[] = [];
        values?.forEach((value) => {
          if (value.status === 'fulfilled') {
            sourceImages.push(value.value);
          }
        });

        noRequestFiles.forEach((file) => {
          const fileType = getExts(file);
          const isBelongImg = BELONG_IMG_EXTS.includes(fileType);
          if (isBelongImg) {
            const src = URL.createObjectURL(file);
            sourceImages.push({ src, material: file.name });
          }
        });
        setImageState({
          sourceImages,
        });
      })
      .finally(() => {
        setImageState({
          pending: false,
        });
      });
  }, [defaultData, noRequestFiles]);

  const onCustomPreview = useCallback(
    (material: ICommonMaterial) => {
      const index = _.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState],
  );

  const onCustomNoRequestPreview = (file: File) => {
    const index = _.findIndex(
      imageState.sourceImages,
      (v) => v.material === file.name,
    );
    setImageState({
      index,
      visible: true,
    });
  };

  const submit = async (params: any) => {
    if (noRequestFiles) {
      const totalSize = noRequestFiles?.reduce?.(
        (acc: number, cur: File) => acc + cur.size,
        0,
      );
      if (totalSize > TOTAL_LIMIT_SIZE) {
        const formatStr = formatBytes(TOTAL_LIMIT_SIZE);
        message.error(`The total file size cannot exceed ${formatStr}`);
        return;
      }
    }
    setPending(true);
    const controller = new AbortController();
    const signal = controller.signal;
    const formData = new FormData();
    noRequestFiles.forEach((item: File) => {
      formData.append('files', item);
    });
    let res;
    if (defaultData?.followRecordId) {
      const blob = new Blob(
        [
          JSON.stringify({
            vendorId: Number(vendorId),
            followRecordId: Number(defaultData.followRecordId),
            generateType: defaultData.generateType,
            followTime: dayjs(params.followTime).format('YYYY-MM-DD HH:mm:ss'),
            description: params.description,
            deletedFileIdList,
          }),
        ],
        {
          type: 'application/json',
        },
      );
      formData.append('dto', blob);
      res = await changeVendorRecord({
        data: formData,
        signal,
      });
    } else {
      const blob = new Blob(
        [
          JSON.stringify({
            vendorId: Number(vendorId),
            followTime: dayjs(params.followTime).format('YYYY-MM-DD HH:mm:ss'),
            description: params.description,
          }),
        ],
        {
          type: 'application/json',
        },
      );
      formData.append('dto', blob);
      res = await addVendorRecord({
        data: formData,
        signal,
      });
    }
    setPending(false);
    if (res.code === 200) {
      message.success(
        `${defaultData?.followRecordId ? 'edit' : 'add'} success!`,
      );
      refreshList();
      hideModal();
    }
  };

  const onFulfilled = (file: File) => {
    noRequestFiles.push(file);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteNoRequestFile = (index: number) => {
    noRequestFiles.splice(index, 1);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteDefaultFile = (item: ICommonMaterial) => {
    deletedFileIdList.push(item.fileMaterialId);
    setDeletedFileIdList([...deletedFileIdList]);
  };

  useEffect(() => {
    // initPreview
    initPreview();
  }, [defaultData, noRequestFiles]);

  return (
    <>
      <Modal
        title={`${defaultData?.followRecordId ? 'Edit' : 'Add'} Record`}
        open={true}
        okText="Confirm"
        okButtonProps={{
          htmlType: 'submit',
          loading: pending,
          onClick: () => form.submit(),
        }}
        onCancel={hideModal}
        maskClosable={false}
        width={480}
      >
        <Form
          name="record-modal"
          form={form}
          layout="vertical"
          autoComplete="off"
          initialValues={{
            followTime: defaultData?.followTime
              ? dayjs(defaultData.followTime)
              : '',
            description: defaultData?.description || '',
          }}
          style={{ marginTop: '12px' }}
          onFinish={submit}
        >
          {/*名称*/}
          <Form.Item
            name="followTime"
            style={{ fontSize: '14px' }}
            label="Time"
            rules={[{ required: true, message: 'Please enter followTime' }]}
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
            <Spin spinning={imageState.pending} tip="All Images Fetching...">
              <div
                style={{ display: 'flex', columnGap: '8px', flexWrap: 'wrap' }}
              >
                {defaultData?.materialList?.map((item: ICommonMaterial) => {
                  if (deletedFileIdList.includes(item.fileMaterialId)) {
                    return null;
                  } else {
                    return (
                      <CommonFileItem
                        className={styles.file_item}
                        key={item.fileMaterialId}
                        thumbnail={item.fileThumbnailUrl}
                        fileType={item.fileType}
                        fileName={item.fileName}
                        materialId={item.fileMaterialId}
                        driveFileId={item.fileDriveId}
                        fileMimeType={item.fileMimeType}
                        showDelete
                        onDeleteTrigger={() => handleDeleteDefaultFile(item)}
                        onCustomPreview={() => onCustomPreview(item)}
                      />
                    );
                  }
                })}
                {noRequestFiles?.map((item: File, index: number) => (
                  <NoRequestFileItem
                    key={index}
                    className={styles.file_item}
                    file={item}
                    showDelete
                    onDeleteTrigger={() => handleDeleteNoRequestFile(index)}
                    onCustomPreview={() => onCustomNoRequestPreview(item)}
                  />
                ))}
                <div className={styles.file_item}>
                  <NoRequestUpload onFulfilled={onFulfilled} />
                  <div className={styles.itemDesc}>
                    A single file cannot exceed 50 MB
                  </div>
                </div>
              </div>
            </Spin>
          </Form.Item>
        </Form>
      </Modal>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
});
