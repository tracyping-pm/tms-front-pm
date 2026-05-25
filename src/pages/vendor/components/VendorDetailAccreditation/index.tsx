import { getImageSource } from '@/api/common';
import { IImageState, ISourceImage } from '@/api/types/common';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
  IVendorDetail,
} from '@/api/types/vendor';
import { addVendorCategory, vendorAccreditationList } from '@/api/vendor';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { formatString } from '@/utils/format';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, List, Spin } from 'antd';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import ListItem from './ListItem';
import styles from './styles.less';

export default memo(function VendorDetailAccreditation(props: {
  venderData: IVendorDetail;
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  vendorStatus: string;
  detailRefresh: boolean;
  setDetailRefresh: (b: boolean) => void;
}) {
  // const access = useAccess();
  const {
    venderData,
    vendorStatus,
    detailRefresh,
    setDetailRefresh,
    showModal = false,
    setShowModal,
  } = props;
  const { message } = App.useApp();
  const { id: vendorId } = useParams();
  const { subscribe } = useContext(PubSubContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [list, setList] = useState<IAccreditationCategoryListItem[]>([]);
  // const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setLoading(true);
    const res = await vendorAccreditationList({ id: Number(vendorId) });
    setDetailRefresh(!detailRefresh);
    setLoading(false);
    if (res.code === 200) {
      const font =
        res.data?.accreditationCategoryList?.filter((item) => item.required) ??
        [];
      const end =
        res.data?.accreditationCategoryList?.filter((item) => !item.required) ??
        [];
      setList([...font, ...end]);
    }
  };

  const addModalFinish = async (params: any) => {
    setCategoryLoading(true);
    const res = await addVendorCategory({
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

  useEffect(() => {
    const unsubscribe = subscribe('EVENT_ACCREDITATION_VENDOR_RELOAD', () => {
      fetchData();
    });

    return unsubscribe;
  }, []);

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
                <ListItem
                  {...item}
                  vendorId={Number(vendorId)}
                  imageState={imageState}
                  setImageState={setImageState}
                  reload={fetchData}
                  vendorStatus={vendorStatus}
                  venderData={venderData}
                />
              </List.Item>
            )}
          />
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
