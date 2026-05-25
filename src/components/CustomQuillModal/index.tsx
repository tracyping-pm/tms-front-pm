import { getImageSource } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import {
  BELONG_IMG_EXTS,
  IMAGE_TYPE,
  initialImageState,
  MAX_LENGTH,
} from '@/constants';
import styles from '@/pages/customer/components/CustomerDetailTimeline/styles.less';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { Form, Spin } from 'antd';
import { default as lodash } from 'lodash';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import CommonFileItem from '../CommonFileItem';
import NoRequestFileItem from '../CommonFileItem/NoRequestFileItem';
import CustomQuillFormItem from '../CustomQuillFormItem';
import { getExts } from '../CustomUpload/fileSupport';
import NoRequestUpload from '../CustomUpload/NoRequestUpload';
import ImagePreviewGroup from '../ImagePreviewGroup';

type IProps = ModalFormProps & {
  description?: string;
  materialList?: ICommonMaterial[];
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: (v: any) => void;
};

const CustomQuillModal: FC<IProps> = ({
  title,
  open,
  width = 1280,
  modalProps,
  description,
  materialList = [],
  loading,
  onCancel,
  onConfirm,
  ...restProps
}) => {
  const formRef = useRef<ProFormInstance>();
  const [deletedFileIdList, setDeletedFileIdList] = useState<string[]>([]);
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const onFinish = async () => {
    await formRef.current?.validateFields();
    const describe = formRef.current?.getFieldValue('description');
    const values = {
      description: describe,
      deletedFileIdList,
      noRequestFiles,
    };
    onConfirm?.(values);
  };

  const handleDeleteNoRequestFile = (index: number) => {
    noRequestFiles.splice(index, 1);
    setNoRequestFiles([...noRequestFiles]);
  };

  const onFulfilled = (file: File) => {
    noRequestFiles.push(file);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteDefaultFile = (item: any) => {
    deletedFileIdList.push(item.fileMaterialId);
    setDeletedFileIdList([...deletedFileIdList]);
  };

  const initPreview = useCallback(async () => {
    const allMaterialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    materialList?.forEach((material) => {
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
  }, [materialList, noRequestFiles]);

  const onCustomPreview = useCallback(
    (material: ICommonMaterial) => {
      const index = lodash.findIndex(
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
    const index = lodash.findIndex(
      imageState.sourceImages,
      (v) => v.material === file.name,
    );
    setImageState({
      index,
      visible: true,
    });
  };

  const onFill = useCallback((values: any) => {
    formRef?.current?.setFieldsValue(values);
  }, []);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  useEffect(() => {
    if (open) {
      if (description) {
        onFill({ description: description });
      }
    } else {
      reset();
    }
  }, [open, description]);

  useEffect(() => {
    initPreview();
  }, [materialList, noRequestFiles]);

  return (
    <>
      <ModalForm
        open={open}
        title={title}
        width={width}
        formRef={formRef}
        modalProps={{
          okText: 'Confirm',
          destroyOnClose: true,
          maskClosable: false,
          confirmLoading: loading,
          onCancel: () => onCancel?.(),
          ...modalProps,
        }}
        onFinish={onFinish}
        {...restProps}
      >
        <Spin spinning={loading}>
          <CustomQuillFormItem
            readonly={false}
            name={'description'}
            label={'Description'}
            rules={[
              {
                required: true,
                message: 'Please enter description',
              },
              {
                validator: (_, value) => {
                  if (value?.length >= MAX_LENGTH.MAX_5000) {
                    return Promise.reject(
                      `Description cannot exceed ${MAX_LENGTH.MAX_5000} characters`,
                    );
                  } else {
                    return Promise.resolve();
                  }
                },
              },
            ]}
          />
          <Form.Item name="material" label="Material">
            <Spin spinning={imageState.pending} tip="All Images Fetching...">
              <div
                style={{ display: 'flex', columnGap: '8px', flexWrap: 'wrap' }}
              >
                {materialList?.map((material: any) => {
                  if (
                    deletedFileIdList.includes(
                      material.fileMaterialId || material.fileMaterialId,
                    )
                  ) {
                    return null;
                  } else {
                    return (
                      <CommonFileItem
                        className={styles.file_item}
                        key={material.fileMaterialId}
                        thumbnail={material.fileThumbnailUrl}
                        fileType={material.fileType}
                        fileName={material.fileName}
                        materialId={material.fileMaterialId}
                        driveFileId={material.fileDriveId}
                        fileMimeType={material.fileMimeType}
                        showDelete
                        onDeleteTrigger={() =>
                          handleDeleteDefaultFile(material)
                        }
                        onCustomPreview={() => onCustomPreview(material)}
                      />
                    );
                  }
                })}
                {noRequestFiles?.map((file: File, index: number) => (
                  <NoRequestFileItem
                    key={index}
                    className={styles.file_item}
                    file={file}
                    showDelete
                    onDeleteTrigger={() => handleDeleteNoRequestFile(index)}
                    onCustomPreview={() => onCustomNoRequestPreview(file)}
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
        </Spin>
      </ModalForm>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
};

export default CustomQuillModal;
