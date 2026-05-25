import { IShippingRecordVoListItem } from '@/api/types/waybill';
import {
  Overlay,
  dashSymbol,
  dashSymbolRepeat,
  defaultStrokeOpacity,
  fitPadding,
  highlightStrokeOpacity,
  polylineMainColor,
  useGoogleMap,
} from '@/hooks/useGoogleMap';
import {
  getDirectionsServiceParamsByPointList,
  getGoogleMapRoute,
} from '@/utils/map';
import { SplitMapPoints } from '@/utils/splitMapPoints';
import { Alert, Spin, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import destinationUrl from '../../../../../public/svg/map/destination.svg';
import originUrl from '../../../../../public/svg/map/origin.svg';
import { ReactComponent as IconPosition } from '../../../../../public/svg/map/position.svg';
// import stopPointUrl from '../../../../../public/svg/map/stop-point.svg';
import { ReactComponent as IconTime } from '../../../../../public/svg/map/time.svg';
import truckUrl from '../../../../../public/svg/map/truck.svg';
import styles from './styles.less';

const overlay = new Overlay();

const markerZIndex = 1;
const polylineZIndex = 1;
const infoWindowZIndex = 3;
const activeZIndex = 4;

type IShippingRecordMap = {
  loading?: boolean;
  hasError: boolean;
  actualPoints: IShippingRecordVoListItem[];
  googleMapPoints: google.maps.LatLngLiteral[];
  originList: any[];
  destinationList: any[];
};

const ShippingRecordMap = ({
  loading = false,
  hasError = false,
  actualPoints = [],
  googleMapPoints = [],
  originList = [],
  destinationList = [],
}: IShippingRecordMap) => {
  const { map, initMap, mapLoading } = useGoogleMap();

  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement>();
  const actualPolylineRef = useRef<google.maps.Polyline>();
  const googleMapPolylineRef = useRef<google.maps.Polyline>();
  const infoWindowRef = useRef<google.maps.InfoWindow>();
  const [lastPointInfo, setLastPointInfo] = useState({ address: '', time: '' });

  const reset = () => {
    if (markerRef.current) {
      markerRef.current.map = null;
    }
    actualPolylineRef.current?.setMap(null);
    googleMapPolylineRef.current?.setMap(null);
    infoWindowRef.current?.close?.();
    overlay?.clearOverlays?.();
    setLastPointInfo({ address: '', time: '' });
  };

  useEffect(() => {
    if (map) {
      reset();

      // 根据googleMapPoints 和 actualPoints 计算出最佳视野
      const bounds = new google.maps.LatLngBounds();
      if (googleMapPoints?.length > 0) {
        googleMapPoints?.forEach((point) => {
          bounds.extend(point);
        });
      }

      if (actualPoints?.length > 0) {
        actualPoints?.forEach((point) => {
          if (point.lat && point.lng) {
            bounds.extend(point);
          }
        });
      }
      if (!bounds.isEmpty()) {
        fitPadding(bounds);
        map.panToBounds(bounds);
        map.fitBounds(bounds);
      }

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
            item.action !== 'Pre-position' &&
            item.action !== 'Pick up(CY empty)' &&
            item.action !== 'Pick up(CY loaded)' &&
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
                  icons: [
                    {
                      icon: dashSymbol,
                      offset: '0',
                      repeat: dashSymbolRepeat,
                    },
                  ],
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

          markerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: lastPoint?.lat, lng: lastPoint?.lng },
            content,
            zIndex: markerZIndex,
          });
        }
        overlay?.addOverlay?.(markerRef.current);

        // 点击markerRef的时候fitBounds
        markerRef.current?.addListener('click', () => {
          // 定位到 lastPoint
          map.panTo(lastPoint);
        });

        setLastPointInfo({
          address: lastPoint?.mapAddress || '',
          time: lastPoint?.time,
        });
        markerRef.current?.content?.addEventListener('mouseover', () => {
          if (markerRef.current && markerRef.current.zIndex) {
            markerRef.current.zIndex = activeZIndex;
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
          infoWindowRef.current?.open?.({ map, anchor: markerRef.current });
        });
      }

      markerRef.current?.content?.addEventListener('mouseout', () => {
        if (markerRef.current && markerRef.current.zIndex) {
          markerRef.current.zIndex = markerZIndex;
        }

        infoWindowRef.current?.close?.();
      });
    }
  }, [map, actualPoints, googleMapPoints, originList, destinationList]);

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current, {
        mapTypeControl: true,
        scrollwheel: false,
        disableDoubleClickZoom: false,
      });
    }
  }, [mapRef]);

  return (
    <>
      <Spin
        spinning={loading || mapLoading}
        tip={mapLoading ? 'Map Loading...' : 'Fetching Data...'}
      >
        <div className={styles.shippingRecordMap}>
          <div
            ref={mapRef}
            className="mapContainer"
            style={{ width: '100%', height: '690px', position: 'relative' }}
          ></div>
          {hasError ? (
            <div className="errorCase">
              <Alert
                type="error"
                message="The current time is too long since the event occurred and GPS information cannot be obtained."
              />
            </div>
          ) : (
            <div className="curPosition">
              <div className="positionTime">
                <span className="icon">
                  <IconTime />
                </span>
                <span className="font" title={lastPointInfo?.time}>
                  Positioning time {lastPointInfo?.time}
                </span>
              </div>
              <div className="positionAddress">
                <span className="icon">
                  <IconPosition />
                </span>
                <span className="font" title={lastPointInfo?.address}>
                  {lastPointInfo?.address}
                </span>
              </div>
            </div>
          )}
        </div>
      </Spin>
    </>
  );
};

export default ShippingRecordMap;
