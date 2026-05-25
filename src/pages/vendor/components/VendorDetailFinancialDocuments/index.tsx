import { getImageSource } from '@/api/common';
import { IDriverAccreditationMaterialListItem } from '@/api/types/truck';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
} from '@/api/types/vendor';
import {
  addVendorFinancial,
  deleteVendorFinancialCategory,
  deleteVendorFinancialMaterial,
  getVendorFinancialList,
} from '@/api/vendor';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE } from '@/constants';
import { VendorStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatString } from '@/utils/format';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, List, Spin } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import styles from './styles.less';

interface ISourceImage {
  material: IAccreditationMaterialListItem;
  src: string;
}

interface IImageState {
  pending: boolean;
  visible: boolean;
  index: number;
  sourceImages: ISourceImage[];
}

const initialImageState: IImageState = {
  pending: false,
  visible: false,
  index: 0,
  sourceImages: [],
};

interface ItemProps extends IAccreditationCategoryListItem {
  vendorId: number;
  vendorStatus: string;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}

const Item = memo(function ({
  vendorId,
  reload,
  defaultCategory,
  vendorStatus,
  fileCategory,
  accreditationMaterialList = [],
  categoryMaterialId,
  imageState,
  setImageState,
}: ItemProps) {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const url = `/api/vendor/financial-document/material/add`;
  const dto = {
    id: vendorId,
    fileCategory,
  };

  const handleDeleteItem = async () => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm delete Category',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await deleteVendorFinancialCategory({
          id: vendorId,
          fileCategory,
        });
        if (res.code === 200) {
          message.success('Delete category successfully');
          reload();
        }
      },
    });
  };

  const handleDeleteMaterial = async (
    fileItem: IAccreditationMaterialListItem,
  ) => {
    const res = await deleteVendorFinancialMaterial({
      id: vendorId,
      fileAccreditationId: fileItem.fileAccreditationId,
      fileMaterialId: fileItem.fileMaterialId,
      fileCategory,
    });
    if (res.code === 200) {
      message.success('Delete material successfully');
      reload();
    }
  };

  const onCustomPreview = useCallback(
    (material: IAccreditationMaterialListItem) => {
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
          {!defaultCategory &&
          access[PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC_EDIT] ? (
            <span
              className={styles.item_title_deleteIcon}
              onClick={handleDeleteItem}
            >
              <DeleteOutlined />
            </span>
          ) : null}
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
                confirmContent={'Confirm delete the file?'}
                showDelete={
                  access[PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC_EDIT] &&
                  (vendorStatus === VendorStatusEnum.ACCREDITED ||
                    vendorStatus === VendorStatusEnum.UNACCREDITED)
                }
                onDeleteTrigger={() => handleDeleteMaterial(fileItem)}
                onCustomPreview={() => onCustomPreview(fileItem)}
              />
            ),
          )}
          {access[PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC_EDIT] ? (
            <div className={styles.file_item}>
              <NormalUpload url={url} dto={dto} onFulfilled={reload} />
              <div className={styles.item_content_desc}>
                A single file cannot exceed 50 MB
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
});

export default memo(function VendorDetailFinancialDocuments(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  vendorStatus: string;
  detailRefresh: boolean;
  setDetailRefresh: (b: boolean) => void;
}) {
  // const access = useAccess();
  const {
    vendorStatus,
    detailRefresh,
    setDetailRefresh,
    showModal = false,
    setShowModal,
  } = props;
  const { message } = App.useApp();
  const { id: vendorId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [list, setList] = useState<IAccreditationCategoryListItem[]>([]);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setLoading(true);
    const res = await getVendorFinancialList({ id: Number(vendorId) }).finally(
      () => {
        setLoading(false);
      },
    );
    setDetailRefresh(!detailRefresh);
    if (res.code === 200) {
      setList(res.data?.accreditationCategoryList);
    }
  };

  const addModalFinish = async (params: any) => {
    setCategoryLoading(true);
    const res = await addVendorFinancial({
      id: Number(vendorId),
      fileCategory: params.fileCategory
        ? formatString(params.fileCategory)
        : '',
    });
    setCategoryLoading(false);
    if (res.code === 200) {
      message.success('Add successfully!');
      setShowModal(false);
      fetchData();
    }
  };

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    list?.forEach((item) => {
      item.accreditationMaterialList?.forEach(
        (material: IAccreditationMaterialListItem) => {
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
    fetchData();
  }, []);

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
            renderItem={(item: IAccreditationCategoryListItem) => (
              <List.Item
                key={item.categoryAccreditationId}
                style={{ padding: 0 }}
              >
                <Item
                  {...item}
                  vendorId={Number(vendorId)}
                  imageState={imageState}
                  setImageState={setImageState}
                  reload={fetchData}
                  vendorStatus={vendorStatus}
                />
              </List.Item>
            )}
          ></List>
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
                loading: categoryLoading,
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
