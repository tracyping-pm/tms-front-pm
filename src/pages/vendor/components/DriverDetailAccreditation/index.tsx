import { getImageSource } from '@/api/common';
import {
  addDriverCategory,
  deleteDriverCategory,
  deleteDriverMaterial,
  driverAccreditationList,
} from '@/api/truck';
import { IImageState, ISourceImage } from '@/api/types/common';
import {
  IDriverAccreditationDataItem,
  IDriverAccreditationMaterialListItem,
} from '@/api/types/truck';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, List, Spin } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import styles from './styles.less';

interface ItemProps extends IDriverAccreditationDataItem {
  driverId: number;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}

const Item = memo(function ({
  driverId,
  reload,
  required,
  defaultCategory,
  categoryAccreditationId,
  fileCategory,
  accreditationMaterialList = [],
  categoryMaterialId,
  imageState,
  setImageState,
}: ItemProps) {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const url = `/api/driver/accreditation/material/add`;
  const dto = {
    id: driverId,
    fileCategory,
    defaultCategory,
    required,
  };

  const handleDeleteItem = async () => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm delete Category',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await deleteDriverCategory({
          id: driverId,
          categoryAccreditationId,
          fileCategory,
          defaultCategory,
          deletedFileIdList: accreditationMaterialList.map(
            (m) => m.fileAccreditationId,
          ),
        });
        if (res.code === 200) {
          message.success('Delete category successfully');
          reload();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  };

  const handleDeleteMaterial = async (
    fileItem: IDriverAccreditationMaterialListItem,
  ) => {
    const res = await deleteDriverMaterial({
      id: driverId,
      fileAccreditationId: fileItem.fileAccreditationId,
      fileMaterialId: fileItem.fileMaterialId,
      defaultCategory,
      required,
    });
    if (res.code === 200) {
      message.success('Delete material successfully');
      reload();
    }
  };

  const onCustomPreview = useCallback(
    (material: IDriverAccreditationMaterialListItem) => {
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
          {fileCategory.includes('*') ? (
            <div>
              <span style={{ color: '#ff4d4f' }}>*</span>
              {fileCategory.substring(1)}
            </div>
          ) : (
            <span>{fileCategory}</span>
          )}
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
          {accreditationMaterialList?.map(
            (fileItem: IDriverAccreditationMaterialListItem) => (
              <CommonFileItem
                key={fileItem.fileAccreditationId}
                className={styles.file_item}
                thumbnail={fileItem.fileThumbnailUrl}
                fileType={fileItem.fileType}
                fileName={fileItem.fileName}
                materialId={categoryMaterialId}
                driveFileId={fileItem.fileDriveId}
                fileMimeType={fileItem.fileMimeType}
                showDelete={
                  access[PermissionEnum.DRIVER_DETAIL_ACCREDITATION_EDIT]
                }
                onDeleteTrigger={() => handleDeleteMaterial(fileItem)}
                onCustomPreview={() => onCustomPreview(fileItem)}
              />
            ),
          )}
          <div className={styles.file_item}>
            {access[PermissionEnum.DRIVER_DETAIL_ACCREDITATION_EDIT] && (
              <NormalUpload url={url} dto={dto} onFulfilled={reload} />
            )}
            <div className={styles.item_content_desc}>
              A single file cannot exceed 50 MB
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default memo(function DriverDetailAccreditation(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  refresh: () => void;
}) {
  const { showModal = false, setShowModal, refresh } = props;
  // const access = useAccess();
  const { message } = App.useApp();
  const { id: driverId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<IDriverAccreditationDataItem[]>([]);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setLoading(true);
    const res = await driverAccreditationList({ id: Number(driverId) });
    setLoading(false);
    if (res.code === 200) {
      const font = res.data?.accreditationCategoryList?.filter(
        (item) => item.required === 1,
      );
      const end = res.data?.accreditationCategoryList?.filter(
        (item) => item.required === 0,
      );
      setList([...font, ...end]);
      refresh();
    }
  };

  const addModalFinish = async (params: any) => {
    setLoading(true);
    const res = await addDriverCategory({
      id: Number(driverId),
      fileCategory: params.fileCategory,
      required: 0,
    });
    setLoading(false);
    if (res.code === 200) {
      message.success('Add successfully');
      setShowModal(false);
      fetchData();
    }
  };

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    list?.forEach((item) => {
      item.accreditationMaterialList?.forEach(
        (material: IDriverAccreditationMaterialListItem) => {
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
    if (driverId) {
      fetchData();
    }
  }, [driverId]);

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
            renderItem={(item: IDriverAccreditationDataItem) => (
              <List.Item
                key={item.categoryAccreditationId}
                style={{ padding: 0 }}
              >
                <Item
                  {...item}
                  driverId={Number(driverId)}
                  imageState={imageState}
                  setImageState={setImageState}
                  reload={fetchData}
                />
              </List.Item>
            )}
          ></List>
          {/* <div className={styles.add}>
            <Access
              key="materialType"
              accessible={
                access[PermissionEnum.DRIVER_DETAIL_ACCREDITATION_EDIT]
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
