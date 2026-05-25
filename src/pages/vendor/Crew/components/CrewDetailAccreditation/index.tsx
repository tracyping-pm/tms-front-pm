import { getImageSource } from '@/api/common';
import { addCrewCategory, crewAccreditationList } from '@/api/crew';
import { IImageState, ISourceImage } from '@/api/types/common';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
} from '@/api/types/vendor';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, List, Spin } from 'antd';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import ListItem from './ListItem';
import styles from './styles.less';

export default memo(function CrewDetailAccreditation(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  setDetailRefresh: (b: boolean) => void;
  detailRefresh: boolean;
}) {
  const {
    detailRefresh,
    setDetailRefresh,
    showModal = false,
    setShowModal,
  } = props;
  // const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { message } = App.useApp();
  const { id: crewId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<IAccreditationCategoryListItem[]>([]);

  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const fetchData = async () => {
    setLoading(true);
    const res = await crewAccreditationList({ id: Number(crewId) });
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
    setLoading(true);
    const res = await addCrewCategory({
      id: Number(crewId),
      fileCategory: params.fileCategory,
    });
    setLoading(false);
    if (res.code === 200) {
      message.success('Add successfully!');
      setShowModal(false);
      fetchData();
      setDetailRefresh(!detailRefresh);
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
    if (crewId) {
      fetchData();
    }
  }, [crewId]);

  useEffect(() => {
    // initPreview
    initPreview();
  }, [list]);

  useEffect(() => {
    const unsubscribe = subscribe('EVENT_ACCREDITATION_CREW_RELOAD', () => {
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
                  crewId={Number(crewId)}
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
