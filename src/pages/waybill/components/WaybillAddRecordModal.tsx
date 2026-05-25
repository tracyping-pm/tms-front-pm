import { fmsVehicle } from '@/api/common';
import { IShippingRecordVoListItem } from '@/api/types/waybill';
import { addShippingRecord, waybillListAllAction } from '@/api/waybill';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMeta } from '@/components/LocatorModal';
import { BELONG_IMG_EXTS, initialImageState, MAX_LENGTH } from '@/constants';
import {
  dashSymbol,
  dashSymbolRepeat,
  defaultStrokeOpacity,
  fitPadding,
  highlightStrokeOpacity,
  Overlay,
  polylineMainColor,
  useGoogleMap,
} from '@/hooks/useGoogleMap';
import {
  getDirectionsServiceParamsByPointList,
  getGoogleMapRoute,
} from '@/utils/map';
import { SplitMapPoints } from '@/utils/splitMapPoints';
import { getNumberRangeList, isUndefinedOrNull } from '@/utils/utils';
import {
  ExclamationCircleFilled,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateTimePicker,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { App, Button, Col, Form, Popover, Row, Spin } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as IconAction } from '../../../../public/svg/action.svg';
import destinationUrl from '../../../../public/svg/map/destination.svg';
import originUrl from '../../../../public/svg/map/origin.svg';
// import stopPointUrl from '../../../../public/svg/map/stop-point.svg';
import { IImageState, ISourceImage } from '@/api/types/common';
import { getExts } from '@/components/CustomUpload/fileSupport';
import truckUrl from '../../../../public/svg/map/truck.svg';
import styles from './common.less';

const overlay = new Overlay();

const markerZIndex = 1;
const polylineZIndex = 1;
const infoWindowZIndex = 3;
const activeZIndex = 4;

type IWaybillAddRecordModal = ModalFormProps & {
  open: boolean;
  isGpsObtain: boolean;
  projectId: number;
  waybillId: number;
  destinationTime: string;
  actualPoints: IShippingRecordVoListItem[];
  googleMapPoints: google.maps.LatLngLiteral[];
  originList: any[];
  destinationList: any[];
  plateNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const WaybillAddRecordModal = ({
  width = 680,
  open,
  isGpsObtain = true,
  projectId,
  waybillId,
  destinationTime,
  actualPoints = [],
  googleMapPoints = [],
  originList = [],
  destinationList = [],
  plateNumber,
  modalProps,
  onCancel,
  onConfirm,
  ...restProps
}: IWaybillAddRecordModal) => {
  const { message, modal } = App.useApp();
  const { map, initMap, center, centerAddress } = useGoogleMap({
    tiltRotationControl: false,
  });

  const [actionOptions, setActionOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const formRef = useRef<ProFormInstance>();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement>();
  const submitLatLngRef = useRef<any>();
  const GPS_LOST = useRef<boolean>(false);

  const lastMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement>();
  const actualPolylineRef = useRef<google.maps.Polyline>();
  const googleMapPolylineRef = useRef<google.maps.Polyline>();
  const infoWindowRef = useRef<google.maps.InfoWindow>();

  const initialValues = {
    action: undefined,
    time: dayjs(),
    mapAddress: '',
    note: undefined,
  };

  const reset = () => {
    if (markerRef.current) {
      markerRef.current.map = null;
    }
    if (lastMarkerRef.current) {
      lastMarkerRef.current.map = null;
    }
    actualPolylineRef.current?.setMap(null);
    googleMapPolylineRef.current?.setMap(null);
    infoWindowRef.current?.close?.();
    overlay?.clearOverlays?.();
  };

  const onFulfilled = (file: File) => {
    noRequestFiles.push(file);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteNoRequestFile = (index: number) => {
    noRequestFiles.splice(index, 1);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleAddressSelect = (meta: IMeta) => {
    if (markerRef.current) {
      if (!_.isEmpty(meta)) {
        const { lat, lng } = meta;
        const latLng = new google.maps.LatLng(lat, lng);
        map?.setCenter(latLng);

        markerRef.current.map = map;
        markerRef.current.position = latLng;
        submitLatLngRef.current = {
          lat,
          lng,
        };
      } else {
        markerRef.current.map = null;
      }
    }
  };

  const getActionOptions = async () => {
    let options = [];
    const res = await waybillListAllAction();
    if (res.code === 200) {
      options = res?.data?.map((item: string) => {
        return {
          label: item,
          value: item,
        };
      });
      setActionOptions(options);
    }
  };

  const getGoogleMapAdress = useCallback(
    (latLng: google.maps.LatLng) => {
      map?.panTo(latLng);
      // 获取详细地址信息
      // geocode
      setLoading(true);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: latLng,
        },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus,
        ) => {
          setLoading(false);
          if (status === 'OK') {
            const address = results?.[0]?.formatted_address;
            formRef.current?.setFieldsValue({
              mapAddress: address,
            });
            submitLatLngRef.current = {
              lat: latLng.lat(),
              lng: latLng.lng(),
            };
          }
        },
      );
    },
    [map],
  );

  const getLatLngFromTime = async (time: string) => {
    setLoading(true);
    // const plateNumber = 'IOE691';

    const res = await fmsVehicle({ plateNumber: plateNumber, time: time });
    setLoading(false);
    if (res.code === 200) {
      const { latitude, longitude } = res.data ?? {};
      if (isUndefinedOrNull(latitude) || isUndefinedOrNull(longitude)) {
        GPS_LOST.current = true;
        submitLatLngRef.current = center;

        map?.setCenter(center);
        formRef.current?.setFields([
          {
            name: 'mapAddress',
            value: centerAddress,
            warnings: [
              'The GPS signal is lost and the system has defaulted to positioning.',
            ],
          },
        ]);
        return;
      }
      const latLng = new google.maps.LatLng(latitude, longitude);
      map?.setCenter(latLng);
      if (markerRef.current) {
        markerRef.current.map = map;
        markerRef.current.position = latLng;
      }
      getGoogleMapAdress(latLng);
    } else {
      formRef.current?.resetFields(['mapAddress']);
    }
  };

  const timeChange = (time: any) => {
    const timeStr = time?.format('YYYY-MM-DD HH:mm:ss');
    if (isGpsObtain && timeStr) {
      getLatLngFromTime(timeStr);
    }
  };

  const initPreview = useCallback(async () => {
    const sourceImages: ISourceImage[] = [];

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
  }, [noRequestFiles]);

  const onCustomNoRequestPreview = (file: File) => {
    const index = _.findIndex(
      imageState.sourceImages,
      (v) => v.material === file.name,
    );
    setImageState({
      index,
      visible: true,
    });
  };

  const doReset = () => {
    formRef.current?.resetFields(['mapAddress']);
    if (markerRef.current) {
      markerRef.current.map = null;
    }
    submitLatLngRef.current = null;
  };

  const submit = async () => {
    try {
      const values = await formRef.current?.validateFields();
      const { lat, lng } = submitLatLngRef.current ?? {};

      if (!lat || !lng) {
        formRef.current?.setFields([
          {
            name: 'mapAddress',
            // value: undefined,
            errors: ['Please enter the correct address'],
          },
        ]);
        // message.error('Please enter the correct address');
        return false;
      }
      const dto = {
        projectId,
        waybillId,
        action: values.action,
        time: dayjs(values.time).format('YYYY-MM-DD HH:mm:ss'),
        mapAddress: values.mapAddress,
        note: values.note,
        obtainLocationWay: isGpsObtain ? 'GPS' : 'Manual',
        ...submitLatLngRef.current,
      };

      const formData = new FormData();
      const blob = new Blob([JSON.stringify(dto)], {
        type: 'application/json',
      });
      formData.append('dto', blob);
      noRequestFiles.forEach((item: File) => {
        formData.append('files', item);
      });
      setLoading(true);
      let res;
      if (
        destinationTime &&
        values.action === 'Arrival at Destination' &&
        dayjs(values.time).isAfter(destinationTime, 's')
      ) {
        modal.confirm({
          title: 'Confirm',
          icon: <ExclamationCircleFilled />,
          content:
            'Confirm that the goods have been delivered later than the Required Delivery Time, and automatically add the corresponding Remark',
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            res = await addShippingRecord(formData);
            setLoading(false);
            if (res?.code === 200) {
              message.success('Add Shipping Records Successfully');
              onConfirm?.();
            }
          },
          onCancel: () => {
            setLoading(false);
          },
        });
      } else {
        res = await addShippingRecord(formData);
        setLoading(false);
        if (res?.code === 200) {
          message.success('Add Shipping Records Successfully');
          onConfirm?.();
        }
      }
    } catch (error) {
      if (GPS_LOST.current) {
        formRef.current?.setFields([
          {
            name: 'mapAddress',
            value: centerAddress,
            warnings: [
              'The GPS signal is lost and the system has defaulted to positioning.',
            ],
          },
        ]);
      }
    }
  };

  useEffect(() => {
    if (map) {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        gmpDraggable: !isGpsObtain,
      });
      overlay?.addOverlay?.(markerRef.current);
      if (isGpsObtain) {
        getLatLngFromTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      } else {
        markerRef.current?.addListener('dragend', (e: any) => {
          const latLng = e.latLng;
          getGoogleMapAdress(latLng);
        });
        map.addListener('click', (e: any) => {
          const latLng = e.latLng;
          if (markerRef.current) {
            markerRef.current.map = map;
            markerRef.current.position = latLng;
          }
          getGoogleMapAdress(latLng);
        });
      }
    }
  }, [map]);

  useEffect(() => {
    if (
      map &&
      googleMapPoints?.length > 0 &&
      googleMapPolylineRef &&
      actualPolylineRef &&
      infoWindowRef
    ) {
      reset();
      // 根据googleMapPoints 和 actualPoints 计算出最佳视野
      const bounds = new google.maps.LatLngBounds();
      googleMapPoints?.forEach((point) => {
        if (point.lat && point.lng) {
          bounds.extend(point);
        }
      });
      actualPoints?.forEach((point) => {
        if (point.lat && point.lng) {
          bounds.extend(point);
        }
      });

      fitPadding(bounds);
      map.panToBounds(bounds);
      map.fitBounds(bounds);

      // infoWindow
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 300,
        zIndex: infoWindowZIndex,
      });
      overlay?.addOverlay?.(infoWindowRef.current);

      if (googleMapPoints?.length > 0) {
        googleMapPolylineRef.current = new google.maps.Polyline({
          map,
          path: googleMapPoints,
          strokeColor: polylineMainColor,
          strokeWeight: 5,
          strokeOpacity: defaultStrokeOpacity,
          zIndex: polylineZIndex,
          clickable: false,
          icons: [
            {
              icon: dashSymbol,
              offset: '0',
              repeat: dashSymbolRepeat,
            },
          ],
        });

        overlay?.addOverlay?.(googleMapPolylineRef.current);

        let originListMarker: google.maps.marker.AdvancedMarkerElement[] = [];
        originList.forEach((origin) => {
          const content = document.createElement('img');
          // content.src = origin.isStop ? stopPointUrl : originUrl;
          content.src = originUrl;

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: origin,
            content,
            zIndex: markerZIndex,
          });
          overlay?.addOverlay?.(marker);
          originListMarker.push(marker);
        });

        let destinationListMarker: google.maps.marker.AdvancedMarkerElement[] =
          [];
        destinationList.forEach((destination) => {
          const content = document.createElement('img');
          // content.src = destination.isStop ? stopPointUrl : destinationUrl;
          content.src = destinationUrl;

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: destination,
            content,
            zIndex: markerZIndex,
          });
          overlay?.addOverlay?.(marker);
          destinationListMarker.push(marker);
        });

        const allMarker = [...originListMarker, ...destinationListMarker];
        const pointList = [...originList, ...destinationList];
        // allMarker绑定事件
        allMarker.forEach((marker, index) => {
          // https://stackoverflow.com/questions/76860379/google-maps-advancedmarker-hover-listener-function-not-working
          marker.addListener('click', () => {});
          marker.content?.addEventListener('mouseover', () => {
            marker.zIndex = activeZIndex;
            const point = pointList[index];
            const content = `
            <div style="background: white; padding: 4px">
              ${point?.address}
            </div>
      
            <style>
              .gm-ui-hover-effect {
                display: none !important;
              }
            </style>
            `;
            infoWindowRef.current?.setContent(content);
            infoWindowRef.current?.open({ map, anchor: marker });
          });

          marker.content?.addEventListener('mouseout', () => {
            marker.zIndex = markerZIndex;
            infoWindowRef.current?.close();
          });
        });
      }

      if (actualPoints?.length > 0) {
        // 先过滤掉 action 为 Departure to Origin 或者 Confirm Hardcopy of POD 的数据
        const filterList = actualPoints?.filter(
          (item) =>
            item.action !== 'Departure to Origin' &&
            item.action !== 'Confirm Hardcopy of POD' &&
            !!item.lat &&
            !!item.lng,
        );
        // actualPoints
        const points = filterList;
        if (points?.length >= 2) {
          if (points?.length > 20) {
            // 切片加载
            const instance = new SplitMapPoints(points);
            instance
              .getResult()
              .then((allPointList) => {
                overlay?.addOverlay?.(actualPolylineRef.current);
                actualPolylineRef.current = new google.maps.Polyline({
                  map,
                  path: allPointList,
                  strokeColor: polylineMainColor,
                  strokeWeight: 5,
                  strokeOpacity: highlightStrokeOpacity,
                  zIndex: polylineZIndex,
                  clickable: false,
                });
              })
              .catch((err) => {
                message.error(err?.message);
              });
          } else {
            // 调用Google Map API 获得路线
            const directionsServiceParams =
              getDirectionsServiceParamsByPointList(points);
            getGoogleMapRoute(directionsServiceParams)
              .then((pathList) => {
                overlay?.addOverlay?.(actualPolylineRef.current);
                actualPolylineRef.current = new google.maps.Polyline({
                  map,
                  path: pathList,
                  strokeColor: polylineMainColor,
                  strokeWeight: 5,
                  strokeOpacity: highlightStrokeOpacity,
                  zIndex: polylineZIndex,
                  clickable: false,
                });
              })
              .catch((err) => {
                message.error(err?.message);
              });
          }
        } else {
          console.warn('Points less than 2');
        }

        const lastPoint = filterList[filterList.length - 1];
        if (lastPoint) {
          const content = document.createElement('img');
          content.src = truckUrl;

          lastMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: lastPoint?.lat, lng: lastPoint?.lng },
            content,
            zIndex: markerZIndex,
          });
          overlay?.addOverlay?.(lastMarkerRef.current);
        }

        // 点击markerRef的时候fitBounds
        lastMarkerRef.current?.addListener('click', () => {
          // 定位到 lastPoint
          map.panTo(lastPoint);
        });

        lastMarkerRef.current?.addListener('mouseover', () => {
          if (lastMarkerRef.current && lastMarkerRef.current.zIndex) {
            lastMarkerRef.current.zIndex = activeZIndex;
          }
          const content = `
  <div style="background: white; padding: 4px">
    ${lastPoint?.mapAddress}
  </div>

  <style>
    .gm-ui-hover-effect {
      display: none !important;
    }
  </style>
  `;
          infoWindowRef.current?.setContent?.(content);
          infoWindowRef.current?.open?.({
            map,
            anchor: lastMarkerRef.current,
          });
        });

        lastMarkerRef.current?.addListener('mouseout', () => {
          if (lastMarkerRef.current && lastMarkerRef.current.zIndex) {
            lastMarkerRef.current.zIndex = markerZIndex;
          }
          infoWindowRef.current?.close?.();
        });
      }
    }
  }, [
    map,
    actualPoints,
    googleMapPoints,
    originList,
    destinationList,
    googleMapPolylineRef,
    actualPolylineRef,
    infoWindowRef,
    lastMarkerRef,
  ]);

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current);
    }
  }, [mapRef]);

  useEffect(() => {
    if (open) {
      getActionOptions();
    }
  }, [open]);

  useEffect(() => {
    initPreview();
  }, [noRequestFiles]);

  return (
    <>
      <ModalForm
        name="add-shipping-records"
        open={open}
        title={`Add Shipping Records`}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        loading={loading}
        initialValues={initialValues}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: false,
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => onCancel?.(),
        }}
        submitter={{
          render: () => {
            return [
              <Button key="cancel" onClick={() => onCancel()}>
                Cancel
              </Button>,
              <Button
                key="confirm"
                type="primary"
                loading={loading}
                onClick={() => submit()}
              >
                Confirm
              </Button>,
            ];
          },
        }}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div className={styles.shippingRecordModal}>
            <Row gutter={72}>
              <Col span={12}>
                <ProFormSelect
                  name={'action'}
                  label={
                    <div>
                      Action
                      <Popover
                        trigger={'click'}
                        placement="topLeft"
                        align={{ offset: [-13, -10] }}
                        content={
                          <div style={{ width: 350 }}>
                            The waybill can only be confirmed as delivered after
                            all actions with special marks have been added
                          </div>
                        }
                      >
                        <QuestionCircleOutlined
                          style={{ color: '#696969', marginLeft: 6 }}
                        />
                      </Popover>
                    </div>
                  }
                  placeholder={'Please select action'}
                  fieldProps={{
                    options: actionOptions,
                    optionItemRender: (option: any) => {
                      return (
                        <label
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          {option.label}
                          {[
                            'Arrival at Origin',
                            'Loading Completion',
                            'Arrival at Destination',
                            'Unloading Completion',
                          ].includes(option.label) && <IconAction></IconAction>}
                        </label>
                      );
                    },
                    optionLabelProp: 'value',
                    listHeight: 300,
                    showSearch: true,
                    filterOption: true,
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please choose an action',
                    },
                  ]}
                />
              </Col>
              <Col span={12}>
                <ProFormDateTimePicker
                  name="time"
                  label="Time"
                  placeholder="Please select time"
                  rules={[
                    {
                      required: true,
                      message: 'Please select time',
                    },
                  ]}
                  fieldProps={{
                    onChange: timeChange,
                    disabledDate: (currentDate) => {
                      return currentDate?.isAfter(dayjs(), 'day');
                    },
                    disabledTime: (currentDate: any) => {
                      const h = initialValues.time?.hour?.();
                      const m = initialValues.time?.minute?.();
                      const s = initialValues.time?.second?.();

                      const b = currentDate?.isBefore(dayjs(), 'day');

                      if (b) {
                        return {
                          disabledHours: () => [],
                          disabledMinutes: () => [],
                          disabledSeconds: () => [],
                        };
                      } else {
                        const curH = currentDate?.hour();
                        const curM = currentDate?.minute();

                        if (curH < h || curM < m) {
                          return {
                            disabledHours: () =>
                              getNumberRangeList(0, 24).splice(h + 1, 24),
                            disabledMinutes: () => [],
                            disabledSeconds: () => [],
                          };
                        }

                        return {
                          disabledHours: () =>
                            getNumberRangeList(0, 24).splice(h + 1, 24),
                          disabledMinutes: () =>
                            getNumberRangeList(0, 60).splice(m + 1, 60),
                          disabledSeconds: () =>
                            getNumberRangeList(0, 60).splice(s, 60),
                        };
                      }
                    },
                    style: { width: '100%' },
                  }}
                />
              </Col>
            </Row>

            <div className="addressBarWithBtns">
              <div className="addressBar">
                <Form.Item
                  name={'mapAddress'}
                  label={null}
                  shouldUpdate
                  style={{ width: '100%' }}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter address',
                    },
                  ]}
                  trigger="onChange"
                >
                  <AutoCompleteSelectNew
                    disabled={isGpsObtain}
                    onSelect={handleAddressSelect}
                  />
                </Form.Item>
              </div>
              <div className="btnBar">
                {/* <Button type="primary" disabled={isGpsObtain}>
                  Search
                </Button> */}
                <Button disabled={isGpsObtain} onClick={doReset}>
                  Reset
                </Button>
              </div>
            </div>
            <div
              ref={mapRef}
              className="mapContainer"
              style={{ width: '100%', height: '260px' }}
            ></div>
            <ProFormText
              name="note"
              label="Note"
              placeholder={'Note'}
              style={{ width: '100%' }}
              rules={[
                {
                  max: MAX_LENGTH.NOTE,
                  message: `Name cannot exceed ${MAX_LENGTH.NOTE} characters`,
                },
              ]}
            />
          </div>
          <Form.Item name="material" label="On-Site">
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              {noRequestFiles?.map((item: File, index: number) => (
                <NoRequestFileItem
                  key={index}
                  className={styles.file_item}
                  file={item}
                  showDelete
                  onDeleteTrigger={() => handleDeleteNoRequestFile(index)}
                  onCustomPreview={() => onCustomNoRequestPreview(item)}
                />
              ))}
              <div className={styles.file_item}>
                <NoRequestUpload onFulfilled={onFulfilled} />
                <div className={styles.file_item_desc}>
                  A single file cannot exceed 50 MB
                </div>
              </div>
            </div>
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

export default WaybillAddRecordModal;
