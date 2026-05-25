import { crewAccreditationVersionHistory } from '@/api/crew';
import { truckAccreditationVersionHistory } from '@/api/truck';
import { IAccreditationVersionHistoryRecord } from '@/api/types/vendor';
import { vendorAccreditationVersionHistory } from '@/api/vendor';
import { ApplicationTypeEnum } from '@/enums';
import { useParams } from '@umijs/max';
import { Drawer, Empty, Spin, Timeline } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import TimeLineItem from './TimeLineItem';

interface IAccreditationVersionDrawer {
  type: ApplicationTypeEnum;
  fileCategory: string;
  hideDrawer: () => void;
}
const AccreditationVersionDrawer = ({
  type,
  fileCategory,
  hideDrawer,
}: IAccreditationVersionDrawer) => {
  const { id: detailId } = useParams();
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [recordList, setRecordList] = useState<
    IAccreditationVersionHistoryRecord[]
  >([]);

  const getList = async () => {
    setFetchLoading(true);

    const payload = {
      id: Number(detailId),
      fileCategory: fileCategory,
    };

    let fetchFuc;

    switch (type) {
      case ApplicationTypeEnum.VENDOR:
        fetchFuc = vendorAccreditationVersionHistory(payload);
        break;
      case ApplicationTypeEnum.TRUCK:
        fetchFuc = truckAccreditationVersionHistory(payload);
        break;
      case ApplicationTypeEnum.CREW:
        fetchFuc = crewAccreditationVersionHistory(payload);
        break;
    }

    const res = await fetchFuc?.finally(() => setFetchLoading(false));
    if (res?.code === 200) {
      setRecordList(res?.data || []);
    }
  };

  const TimelineItems = useMemo(() => {
    return recordList.map((item, index) => ({
      children: (
        <TimeLineItem
          key={index}
          record={item}
          fileList={item?.accreditationMaterialList || []}
        />
      ),
    }));
  }, [recordList]);

  useEffect(() => {
    getList();
  }, []);

  return (
    <Drawer
      title={`${fileCategory} Accreditation Version`}
      placement="right"
      destroyOnClose={true}
      maskClosable={false}
      className={styles.versionDrawer}
      width={844}
      onClose={hideDrawer}
      open={true}
    >
      <div>
        <Spin spinning={fetchLoading}>
          {recordList.length ? (
            <Timeline items={TimelineItems} />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
          )}
        </Spin>

        {/* <ImagePreviewGroup
          visible={imagePreviewGroupState.visible}
          items={imagePreviewGroupState.sourceImageList?.map(
            (item: ISourceImage) => item.src,
          )}
          index={imagePreviewGroupState.index}
          onClose={() => setImagePreviewGroupState({ visible: false })}
        /> */}
      </div>
    </Drawer>
  );
};

export default AccreditationVersionDrawer;
