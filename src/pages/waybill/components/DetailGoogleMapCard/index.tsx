import {
  IListShippingRecordResponse,
  IShippingRecordVoListItem,
} from '@/api/types/waybill';
import { listShippingRecord } from '@/api/waybill';
import {
  IMAGE_TYPE,
  WAYBILL_DETAIL_ANCHOR_ID_MAP,
  initialImageState,
} from '@/constants';
import {
  GPS_STATUS_ENUM,
  GPS_STATUS_ENUM_TEXT,
  METHOD_OBTAIN_ENUM,
  SHOW_SHIPPING_RECORD_CARD,
  WaybillFinancialStatusEnum,
  WaybillStatusEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';

import { getImageSource } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import CustomStatusButton from '@/components/CustomStatusButton';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { getPathByRoute, getSortRoutes, unzip } from '@/utils/map';
import { Access, useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Badge, Collapse, Radio, RadioChangeEvent, Spin, Timeline } from 'antd';
import _, { cloneDeep } from 'lodash';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import BottomIcon from '../../../../../public/img/bottom_icon.png';
import { OPS_TYPE, StateContext } from '../../WaybillDetail/store';
import ShippingRecordTimelineItem from '../ShippingRecordListTimeline';
import WaybillAddRecordModal from '../WaybillAddRecordModal';
import ShippingRecordMap from './ShippingRecordMap';
import styles from './styles.less';

export default memo(function DetailGoogleMapCard(props: {
  isStandardWaybill: boolean;
}) {
  const access = useAccess();
  const { id: waybillId } = useParams();
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { waybillBasicInfo, refreshBasicInfo } = state;
  const { isStandardWaybill } = props;

  const [shippingRecordData, setShippingRecordData] =
    useState<IListShippingRecordResponse>();
  const [shippingRecordMore, setShippingRecordMore] = useState<boolean>(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState<boolean>(false);
  const [shippingRecordLoading, setShippingRecordLoading] =
    useState<boolean>(false);
  const [googleMapPoints, setGoogleMapPoints] = useState<
    google.maps.LatLngLiteral[]
  >([]);
  const [actualPoints, setActualPoints] = useState<IShippingRecordVoListItem[]>(
    [],
  );
  const [originList, setOriginList] = useState<
    Array<google.maps.LatLngLiteral & { address: string; isStop: boolean }>
  >([]);
  const [destinationList, setDestinationList] = useState<
    Array<google.maps.LatLngLiteral & { address: string; isStop: boolean }>
  >([]);

  const [methodObtain, setMethodObtain] = useState<METHOD_OBTAIN_ENUM>(
    METHOD_OBTAIN_ENUM.MANUAL_OBTAIN,
  );

  const onMethodObtainChange = useCallback(
    (_methodObtain: METHOD_OBTAIN_ENUM) => {
      setMethodObtain(_methodObtain);
    },
    [],
  );

  const getPointsByRecord = (list: IShippingRecordVoListItem[] = []) => {
    const newList = cloneDeep(list);
    return newList?.reverse();
  };

  const getPointsBySelect = (mapJsonStr: string) => {
    try {
      const mapJson: any = unzip(mapJsonStr);
      const { routes, activeRouteIndex } = mapJson;
      setOriginList(mapJson.originList);
      setDestinationList(mapJson.destinationList);

      const _routeList = getSortRoutes(routes);
      const activeRoute = _routeList[activeRouteIndex];
      const pathList = getPathByRoute(activeRoute);

      return pathList;
    } catch (e) {
      return [];
    }
  };

  const formatMapData = (data: IListShippingRecordResponse) => {
    const curActualPoints = getPointsByRecord(data?.shippingRecordVoList ?? []);
    setActualPoints(curActualPoints);

    const curGoogleMapPoints = getPointsBySelect(data?.mapJsonStr);
    setGoogleMapPoints(curGoogleMapPoints);
  };

  const fetchShippingRecordList = useCallback(async () => {
    setShippingRecordLoading(true);
    const { plateNumber, hasGps } = waybillBasicInfo;
    const res = await listShippingRecord({
      hasGps,
      waybillId: Number(waybillId),
      plateNumber: plateNumber, // IOE691,
    }).finally(() => {
      setShippingRecordLoading(false);
    });

    if (res.code === 200) {
      setShippingRecordData(res.data);
      formatMapData(res.data);
    }
  }, [waybillBasicInfo]);

  const updateBasicInfo = () => {
    // 更新basicInfo
    dispatch({
      type: OPS_TYPE.REFRESH_BASIC_INFO,
      payload: {
        data: !refreshBasicInfo,
      },
    });
  };

  const shippingRecordList = useMemo(() => {
    if (shippingRecordMore) {
      return shippingRecordData?.shippingRecordVoList || [];
    } else {
      return shippingRecordData?.shippingRecordVoList?.slice(0, 3) || [];
    }
  }, [shippingRecordData, shippingRecordMore]);

  const initPreview = useCallback(async () => {
    const allMaterialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    shippingRecordList?.forEach((item) => {
      item?.onSiteMaterialList?.forEach((material) => {
        if (IMAGE_TYPE.includes(material.fileType)) {
          allMaterialList.push(material);
        }
      });
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

        setImageState({
          sourceImages,
        });
      })
      .finally(() => {
        setImageState({
          pending: false,
        });
      });
  }, [shippingRecordList]);

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

  useEffect(() => {
    if (
      SHOW_SHIPPING_RECORD_CARD.includes(waybillBasicInfo.status) ||
      (waybillBasicInfo?.status === WaybillStatusEnum.CANCELED &&
        waybillBasicInfo?.preStatus !== WaybillStatusEnum.PENDING &&
        waybillBasicInfo?.preStatus !== WaybillStatusEnum.PLANNING)
    ) {
      fetchShippingRecordList();
    }
  }, [waybillBasicInfo]);

  useEffect(() => {
    setMethodObtain(METHOD_OBTAIN_ENUM.MANUAL_OBTAIN);
  }, [waybillBasicInfo]);

  useEffect(() => {
    initPreview();
  }, [shippingRecordList]);

  return (
    <>
      <div className={styles.card}>
        <div
          id={WAYBILL_DETAIL_ANCHOR_ID_MAP.TRACKS}
          className={styles.card_header}
        >
          <div className={styles.card_header_title}>Tracks</div>
          {(isStandardWaybill
            ? access[PermissionEnum.STANDARD_WAYBILL_ADD_RECORD]
            : access[PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD]) &&
          waybillBasicInfo?.financialStatus ===
            WaybillFinancialStatusEnum.NOT_STARTED &&
          waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT ? (
            <CustomStatusButton
              onClick={() => setAddRecordModalOpen(true)}
              noStyle
            >
              Add Record
            </CustomStatusButton>
          ) : null}
        </div>

        <div
          id={WAYBILL_DETAIL_ANCHOR_ID_MAP.TRACKS}
          className={styles.card_content}
        >
          {/*google map*/}
          <div className={styles.card_content_map}>
            <div className={styles.card_content_map_gpsstatus}>
              <span className="gps-status">
                <span>GPS status: </span>
                <span>
                  {waybillBasicInfo?.hasGps === 1 ? (
                    <span className="status-item">
                      <Badge status="success" />
                      {GPS_STATUS_ENUM_TEXT[GPS_STATUS_ENUM.WITH_GPS]}
                    </span>
                  ) : (
                    <span className="status-item">
                      <Badge status="error" />
                      {GPS_STATUS_ENUM_TEXT[GPS_STATUS_ENUM.NO_GPS]}
                    </span>
                  )}
                </span>
              </span>

              {waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT ||
              waybillBasicInfo?.status === WaybillStatusEnum.DELIVERED ? (
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[PermissionEnum.STANDARD_WAYBILL_ADD_RECORD]
                      : access[PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD]
                  }
                >
                  <span className="obtain">
                    <span>
                      Method of obtaining location for shipping records
                    </span>
                    <span>
                      <Radio.Group
                        value={methodObtain}
                        onChange={(e: RadioChangeEvent) =>
                          onMethodObtainChange(e.target.value)
                        }
                      >
                        <Radio
                          value={METHOD_OBTAIN_ENUM.GPS_OBTAIN}
                          disabled={waybillBasicInfo?.hasGps === 0}
                        >
                          GPS obtain
                        </Radio>
                        <Radio value={METHOD_OBTAIN_ENUM.MANUAL_OBTAIN}>
                          Manual obtain
                        </Radio>
                      </Radio.Group>
                    </span>
                  </span>
                </Access>
              ) : null}
            </div>
            <Collapse
              items={[
                {
                  key: 'shippingRecordMap',
                  label: 'Tracks Map',
                  children: (
                    <ShippingRecordMap
                      loading={shippingRecordLoading}
                      hasError={!!shippingRecordData?.callFmsFailed}
                      actualPoints={actualPoints}
                      googleMapPoints={googleMapPoints}
                      originList={originList}
                      destinationList={destinationList}
                    />
                  ),
                },
              ]}
            />
          </div>
          {/*timeline*/}
          <Spin spinning={shippingRecordLoading} tip="Fetching Data...">
            {shippingRecordList?.length > 0 ? (
              <div className="list-record">
                <Timeline
                  items={shippingRecordList?.map((item, index) => ({
                    children: (
                      <ShippingRecordTimelineItem
                        isStandardWaybill={isStandardWaybill}
                        data={item}
                        onCustomPreview={onCustomPreview}
                        hasMore={
                          index === 2 &&
                          !shippingRecordMore &&
                          Number(
                            shippingRecordData?.shippingRecordVoList?.length,
                          ) > 3
                        }
                      />
                    ),
                  }))}
                />
                {!shippingRecordMore &&
                Number(shippingRecordData?.shippingRecordVoList?.length) > 3 ? (
                  <div
                    className={styles.card_content_more}
                    onClick={() => setShippingRecordMore(true)}
                  >
                    <img
                      src={BottomIcon}
                      className={styles.card_content_more_icon}
                    />
                    more
                    <img
                      src={BottomIcon}
                      className={styles.card_content_more_icon}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </Spin>
        </div>
      </div>
      {addRecordModalOpen && (
        <WaybillAddRecordModal
          open={addRecordModalOpen}
          isGpsObtain={methodObtain === METHOD_OBTAIN_ENUM.GPS_OBTAIN}
          projectId={waybillBasicInfo?.projectId}
          waybillId={waybillBasicInfo?.id}
          destinationTime={waybillBasicInfo?.destinationTime}
          actualPoints={actualPoints}
          googleMapPoints={googleMapPoints}
          originList={originList}
          destinationList={destinationList}
          plateNumber={waybillBasicInfo?.plateNumber}
          onCancel={() => setAddRecordModalOpen(false)}
          onConfirm={() => {
            setAddRecordModalOpen(false);
            updateBasicInfo();
          }}
        />
      )}
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
});
