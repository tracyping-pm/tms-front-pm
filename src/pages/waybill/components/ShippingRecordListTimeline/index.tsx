import { ICommonMaterial } from '@/api/types/common';
import { IShippingRecordVoListItem } from '@/api/types/waybill';
import { editPosition } from '@/api/waybill';
import CommonFileItem from '@/components/CommonFileItem';
import LocatorModal, { IMeta } from '@/components/LocatorModal';
import { WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Spin, Tag } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useContext } from 'react';
import { OPS_TYPE, StateContext } from '../../WaybillDetail/store';
import styles from './index.less';

interface ILocator {
  open: boolean;
  loading: boolean;
}

const initialLocatorState: ILocator = {
  open: false,
  loading: false,
};

interface IProps {
  isStandardWaybill: boolean;
  data: IShippingRecordVoListItem;
  hasMore: boolean;
  onCustomPreview?: (m: ICommonMaterial) => void;
}

const ShippingRecordTimelineItem: FC<IProps> = ({
  isStandardWaybill,
  data,
  hasMore,
  onCustomPreview,
}) => {
  const { message } = App.useApp();
  const access = useAccess();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { waybillBasicInfo, refreshBasicInfo } = state;

  const [locatorState, setLocatorState] =
    useSetState<ILocator>(initialLocatorState);

  const updateBasicInfo = useCallback(() => {
    // 更新basicInfo
    dispatch({
      type: OPS_TYPE.REFRESH_BASIC_INFO,
      payload: {
        data: !refreshBasicInfo,
      },
    });
  }, [refreshBasicInfo]);

  const handleModifyLocation = useCallback(() => {
    setLocatorState({ open: true });
  }, []);

  const onLocatorConfirm = useCallback(
    async (meta: IMeta) => {
      setLocatorState({ open: false, loading: true });

      const payload = {
        projectId: waybillBasicInfo?.projectId,
        waybillId: waybillBasicInfo?.id,
        shippingRecordId: data.shippingRecordId,
        lat: meta.lat,
        lng: meta.lng,
        mapAddress: meta.address,
      };
      const res = await editPosition(payload);
      setLocatorState({ loading: false });

      if (res.code === 200) {
        message.success('Modify Position Success');
        updateBasicInfo();
      }
    },
    [waybillBasicInfo],
  );

  const renderTag = useCallback((data: IShippingRecordVoListItem) => {
    return data.obtainLocationWay === 'GPS' ? (
      <Tag
        icon={<EnvironmentOutlined />}
        color={'#E6F7FF'}
        style={{
          borderColor: '#91D5FF',
          color: '#1890FF',
          fontWeight: 'normal',
        }}
      >
        GPS acquisition
      </Tag>
    ) : (
      <Tag
        icon={<EnvironmentOutlined />}
        color={'#EEF6F4'}
        style={{
          borderColor: '#5BBDA9',
          color: '#009688',
          fontWeight: 'normal',
        }}
      >
        Manually added
      </Tag>
    );
  }, []);

  return (
    <>
      <Spin spinning={locatorState.loading}>
        <div className={cls(styles.item, hasMore && styles.dotHasMore)}>
          <div className={styles.item_title}>
            <span style={{ marginRight: '12px' }}>{data.action}</span>
            {renderTag(data)}
          </div>
          <div className={styles.item_time}>{data.time}</div>
          <div className={styles.item_line}>
            <div className={styles.item_line_label}>Position</div>
            <div className={styles.item_line_value}>
              <span>{data.mapAddress}</span>
              {(waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT ||
                waybillBasicInfo?.status === WaybillStatusEnum.DELIVERED) && (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[
                          PermissionEnum.STANDARD_WAYBILL_TRACKS_EDIT_POSITION
                        ]
                      : access[
                          PermissionEnum.TEMPORARY_WAYBILL_TRACKS_EDIT_POSITION
                        ]
                  }
                >
                  <span
                    className="modify-location"
                    onClick={handleModifyLocation}
                  >
                    <EnvironmentOutlined />
                  </span>
                </Access>
              )}
            </div>
          </div>
          <div className={styles.item_line}>
            <div className={styles.item_line_label}>Note</div>
            <div className={styles.item_line_value}>{data.note}</div>
          </div>
          <div className={styles.item_site}>
            <div className={styles.item_line_label}>On-Site</div>
            <div className={styles.item_site_list}>
              {data?.onSiteMaterialList?.map((m) => (
                <CommonFileItem
                  key={m.fileDriveId}
                  className={styles.item_site_list_item}
                  thumbnail={m.fileThumbnailUrl}
                  fileType={m.fileType}
                  fileName={m.fileName}
                  materialId={m.fileMaterialId}
                  driveFileId={m.fileDriveId}
                  fileMimeType={m.fileMimeType}
                  onCustomPreview={() => onCustomPreview?.(m)}
                />
              ))}
            </div>
          </div>
        </div>
      </Spin>
      {locatorState.open && (
        <LocatorModal
          open={locatorState.open}
          modalProps={{
            onCancel: () => setLocatorState({ open: false }),
          }}
          onConfirm={onLocatorConfirm}
          payload={{ lat: data.lat, lng: data.lng, address: data.mapAddress }}
        />
      )}
    </>
  );
};

export default ShippingRecordTimelineItem;
