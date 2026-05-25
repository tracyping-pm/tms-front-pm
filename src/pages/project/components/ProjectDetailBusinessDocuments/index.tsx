import { getImageSource } from '@/api/common';
import {
  addBusinessDocumentsCategory,
  businessDocumentsList,
  deleteBusinessDocumentsCategory,
  deleteBusinessDocumentsMaterial,
} from '@/api/project';
import { IImageState, ISourceImage } from '@/api/types/common';
import {
  IBusinessDocumentCategoryItem,
  IBusinessDocumentMaterialItem,
} from '@/api/types/project';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Access, useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, List, Spin } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import styles from './styles.less';

interface ItemProps extends IBusinessDocumentCategoryItem {
  projectId: number;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}

const Item = memo(function ({
  projectId,
  defaultCategory,
  categoryBusinessDocumentId,
  fileCategory,
  businessDocumentMaterialList = [],
  categoryMaterialId,
  imageState,
  setImageState,
  reload,
}: ItemProps) {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const url = `/api/project/businessDocument/material/add`;
  const dto = {
    id: projectId,
    fileCategory,
    defaultCategory,
  };

  const handleDeleteItem = async () => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm delete Category',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await deleteBusinessDocumentsCategory({
          id: projectId,
          categoryBusinessDocumentId,
          fileCategory,
          defaultCategory,
          deletedFileIdList: businessDocumentMaterialList.map(
            (m) => m.fileBusinessDocumentId,
          ),
        });
        if (res.code === 200) {
          message.success('Delete category successfully!');
          reload();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  };

  const handleDeleteMaterial = async (
    fileItem: IBusinessDocumentMaterialItem,
  ) => {
    const res = await deleteBusinessDocumentsMaterial({
      id: projectId,
      fileBusinessDocumentId: fileItem.fileBusinessDocumentId,
      fileMaterialId: fileItem.fileMaterialId,
      defaultCategory,
    });
    if (res.code === 200) {
      message.success('Delete material success');
      reload();
    }
  };

  const onFulfilled = async () => {
    reload();
  };

  const onCustomPreview = useCallback(
    (material: IBusinessDocumentMaterialItem) => {
      const index = _.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState, setImageState],
  );

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_title}>
          {fileCategory}
          {defaultCategory !== 1 && (
            <span
              className={styles.item_title_deleteIcon}
              onClick={handleDeleteItem}
            >
              <DeleteOutlined />
            </span>
          )}
        </div>
        <div className={styles.item_content}>
          {businessDocumentMaterialList?.map(
            (fileItem: IBusinessDocumentMaterialItem) => (
              <CommonFileItem
                key={fileItem.fileBusinessDocumentId}
                className={styles.file_item}
                thumbnail={fileItem.fileThumbnailUrl}
                fileType={fileItem.fileType}
                fileName={fileItem.fileName}
                materialId={categoryMaterialId}
                driveFileId={fileItem.fileDriveId}
                fileMimeType={fileItem.fileMimeType}
                showDelete={
                  access[PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS_EDIT]
                }
                onDeleteTrigger={() => handleDeleteMaterial(fileItem)}
                onCustomPreview={() => onCustomPreview(fileItem)}
              />
            ),
          )}
          <Access
            accessible={
              access[PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS_EDIT]
            }
          >
            <div className={styles.file_item}>
              <NormalUpload url={url} dto={dto} onFulfilled={onFulfilled} />
              <div className={styles.item_content_desc}>
                A single file cannot exceed 50 MB
              </div>
            </div>
          </Access>
        </div>
      </div>
    </>
  );
});

export default memo(function ProjectDetailBusinessDocuments(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
}) {
  const { showModal = false, setShowModal } = props;
  // const access = useAccess();
  const { message } = App.useApp();
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<IBusinessDocumentCategoryItem[]>([]);
  // const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setLoading(true);
    const res = await businessDocumentsList({ id: +pageId! });
    setLoading(false);
    if (res.code === 200) {
      setList(res.data?.businessDocumentCategoryList ?? []);
    }
  };

  const addModalFinish = async (values: any) => {
    const options = {
      id: +pageId!,
      fileCategory: values?.fileCategory,
    };
    setLoading(true);
    const res = await addBusinessDocumentsCategory(options);
    setLoading(false);
    if (res.code === 200) {
      message.success('Add success');
      setShowModal(false);
      fetchData();
    }
  };

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    list?.forEach((item) => {
      item.businessDocumentMaterialList?.forEach(
        (material: IBusinessDocumentMaterialItem) => {
          if (IMAGE_TYPE.includes(material.fileType)) {
            materialList.push(material);
          }
        },
      );
    });

    setImageState({
      pending: true,
    });
    materialList.forEach((material) => {
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
        setImageState({
          sourceImages,
        });
      })
      .finally(() => {
        setImageState({
          pending: false,
        });
      });
  }, [list]);

  useEffect(() => {
    if (pageId) {
      fetchData();
    } else {
      // TODO: error page?
    }
  }, [pageId]);

  useEffect(() => {
    // initPreview
    initPreview();
  }, [list]);

  return (
    <>
      <Spin spinning={loading || imageState.pending}>
        <div className={styles.accreditation}>
          <List
            size="large"
            split={false}
            dataSource={list}
            renderItem={(item: IBusinessDocumentCategoryItem) => (
              <List.Item
                key={item.categoryBusinessDocumentId}
                style={{ padding: 0 }}
              >
                <Item
                  {...item}
                  projectId={+pageId!}
                  imageState={imageState}
                  setImageState={setImageState}
                  reload={fetchData}
                />
              </List.Item>
            )}
          ></List>
          {/* <div className={styles.add}>
            <Access
              accessible={
                access[PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS_EDIT]
              }
            >
              <Button onClick={() => setShowModal(true)}>
                Add material type
              </Button>
            </Access>
          </div> */}
        </div>
        {showModal && (
          <AddCategoryModal
            title={'Add New Category'}
            open={showModal}
            onFinish={addModalFinish}
            modalProps={{
              okText: 'Confirm',
              onCancel: () => setShowModal(false),
            }}
            submitter={{
              submitButtonProps: {
                loading: loading,
              },
            }}
          />
        )}
      </Spin>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
});
