import {
  addFinancialType,
  deleteFinancialDocMaterial,
  deleteFinancialType,
  getFinancialDocumentList,
} from '@/api/accreditation';
import { getImageSource } from '@/api/common';
import {
  IAccreditationCategoryItem,
  IAccreditationFileItem,
} from '@/api/types/accreditation';
import { IImageState, ISourceImage } from '@/api/types/common';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import {
  CUSTOMER_LEADS_POOL,
  IMAGE_TYPE,
  initialImageState,
} from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import { formatString } from '@/utils/format';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Access, useAccess, useParams, useSearchParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Empty, List, Spin } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import styles from './styles.less';

interface ItemProps extends IAccreditationCategoryItem {
  customerId: number;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}

const Item = memo(function ({
  customerId,
  defaultCategory,
  accreditationId,
  fileCategory,
  materialId,
  fileList = [],
  imageState,
  setImageState,
  reload,
}: ItemProps) {
  const access = useAccess();
  const [searchParams] = useSearchParams();
  const { message, modal } = App.useApp();
  const url = `/api/customer/financial-document/material/add`;
  const dto = {
    id: customerId,
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
        const res = await deleteFinancialType({
          id: customerId,
          categoryAccreditationId: Number(accreditationId),
          fileCategory: fileCategory,
          defaultCategory: !!defaultCategory,
          deletedFileIdList: fileList.map((m) => Number(m.fileAccreditationId)),
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

  const handleDeleteMaterial = async (fileItem: IAccreditationFileItem) => {
    const res = await deleteFinancialDocMaterial({
      id: customerId,
      fileAccreditationId: Number(fileItem.fileAccreditationId),
      fileMaterialId: Number(materialId),
      defaultCategory: !!defaultCategory,
      driveFileId: fileItem.fileDriveId,
    });
    if (res.code === 200) {
      message.success('Delete material successfully!');
      reload();
    }
  };

  const onCustomPreview = useCallback(
    (material: IAccreditationFileItem) => {
      const index = _.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileId === material.fileId,
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
          {defaultCategory !== 1 &&
            searchParams.get('from') !== CUSTOMER_LEADS_POOL &&
            access[PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC_EDIT] && (
              <span
                className={styles.item_title_deleteIcon}
                onClick={handleDeleteItem}
              >
                <DeleteOutlined />
              </span>
            )}
        </div>
        <div className={styles.item_content}>
          {fileList?.map((fileItem: IAccreditationFileItem) => (
            <CommonFileItem
              key={fileItem.fileId}
              className={styles.file_item}
              thumbnail={fileItem.fileThumbnailString}
              fileType={fileItem.fileType}
              fileName={fileItem.fileName}
              materialId={materialId}
              driveFileId={fileItem.fileDriveId}
              fileMimeType={fileItem.fileMimeType}
              showDelete={
                access[PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC_EDIT] &&
                searchParams.get('from') !== CUSTOMER_LEADS_POOL
              }
              onDeleteTrigger={() => handleDeleteMaterial(fileItem)}
              onCustomPreview={() => onCustomPreview(fileItem)}
            />
          ))}
          <div className={styles.file_item}>
            <Access
              accessible={
                access[PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC_EDIT] &&
                searchParams.get('from') !== CUSTOMER_LEADS_POOL
              }
            >
              <NormalUpload url={url} dto={dto} onFulfilled={reload} />
            </Access>
            <div className={styles.item_content_desc}>
              A single file cannot exceed 50 MB
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default memo(function CustomerDetailAccreditation(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
}) {
  const { showModal = false, setShowModal } = props;
  // const access = useAccess();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<IAccreditationCategoryItem[]>([]);
  // const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setLoading(true);
    const res = await getFinancialDocumentList({ id: +pageId! });
    setLoading(false);
    if (res.code === 200) {
      if (searchParams.get('from') === CUSTOMER_LEADS_POOL) {
        const filters = res.data?.accreditationCategoryList?.filter(
          (item) => item.fileList.length,
        );
        setList(filters);
      } else {
        setList(res.data?.accreditationCategoryList ?? []);
      }
    }
  };

  const addModalFinish = async (values: any) => {
    const options = {
      id: +pageId!,
      fileCategory: values?.fileCategory
        ? formatString(values?.fileCategory)
        : '',
    };
    setLoading(true);
    const res = await addFinancialType(options);
    setLoading(false);
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
      item.fileList?.forEach((material: IAccreditationFileItem) => {
        if (IMAGE_TYPE.includes(material.fileType)) {
          if (material.fileId) {
            material.fileMaterialId = material.fileId;
          }
          materialList.push(material);
        }
      });
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
            locale={{
              emptyText: (
                <div className={styles.empty}>
                  {!loading && !list.length ? (
                    <Empty
                      description="no data"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : null}
                </div>
              ),
            }}
            renderItem={(item: IAccreditationCategoryItem) => (
              <List.Item key={item.accreditationId} style={{ padding: 0 }}>
                <Item
                  {...item}
                  customerId={+pageId!}
                  imageState={imageState}
                  setImageState={setImageState}
                  reload={fetchData}
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
