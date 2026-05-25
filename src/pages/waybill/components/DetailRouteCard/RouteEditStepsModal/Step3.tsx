import { waybillRouteAdd } from '@/api/waybill';
import PubSubContext from '@/context/pubsub';
import {
  IFormatRoutesItem,
  Overlay,
  formatServiceRoutes,
  highlightRouteByIndex,
  launchRender,
  useGoogleMap,
} from '@/hooks/useGoogleMap';
import { zip } from '@/utils/map';
import { App, Button, Col, Row, Skeleton } from 'antd';
import cls from 'classnames';
import { cloneDeep } from 'lodash';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import RouteFilter from '../RouteFilter';
import styles from './styles.less';
import { STEP_EVENTS } from './support';
// const pako = require('pako');
const overlay = new Overlay();

interface IStep3 {
  waybillId: number;
  doPrev: () => Promise<unknown>;
  doCancel: () => Promise<unknown>;
  onConfirm: () => void;
}
const Step3: FC<IStep3> = ({ waybillId, doPrev, doCancel, onConfirm }) => {
  const { modal } = App.useApp();
  const { map, initMap, region } = useGoogleMap();
  const { subscribe } = useContext(PubSubContext);
  const [routeList, setRouteList] = useState<IFormatRoutesItem[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);

  const step2DataRef = useRef<any>({});
  const mapRef = useRef<HTMLDivElement>(null);
  const serviceResRoutes = useRef<google.maps.DirectionsRoute[]>([]);
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [filterState, setFilterState] = useState<any>({});
  const retryTimes = useRef<number>(0);

  const clearOverlay = useCallback(() => {
    if (map) {
      setRouteList([]);
      overlay?.clearOverlays?.();
    }
  }, [map, overlay]);

  const doReset = useCallback(() => {
    setActiveRouteIndex(0);
    setRouteList([]);
    step2DataRef.current = {};
    serviceResRoutes.current = [];
    retryTimes.current = 0;
    setMapVisible(false);
    setPageLoading(true);
  }, []);

  const handleCancel = useCallback(() => {
    doCancel?.();
  }, []);

  const handlePrev = useCallback(() => {
    doPrev().then(() => {
      doReset();
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    modal.confirm({
      title: 'Operation Confirm',
      content: `Confirm to modify the route information of waybill`,
      okText: 'Confirm',
      onOk: async () => {
        const { originList, destinationList } = step2DataRef.current;
        const activeRoute = routeList[activeRouteIndex];

        const routes = serviceResRoutes.current?.map((item) => {
          return {
            bounds: item.bounds,
            legs: item.legs,
            summary: item.summary,
          };
        });
        const obj = {
          routeFilter: filterState,
          routes: routes,
          activeRouteIndex,
          originList,
          destinationList,
        };

        const compressed = zip(obj);

        const payload = {
          waybillId,
          mapJsonStr: compressed,
          distance: activeRoute.distance,
          duration: activeRoute.duration,
          origins: originList,
          destinations: destinationList,
        };

        setConfirmLoading(true);
        const res = await waybillRouteAdd(payload);
        setConfirmLoading(false);
        if (res.code === 200) {
          onConfirm?.();
          doReset();

          if (res.data?.code === 1) {
            modal.warning({
              title: 'Warning',
              content: res.data?.msg,
              cancelButtonProps: {
                style: { display: 'none' },
              },
            });
          }
        }
      },
    });
  }, [activeRouteIndex, routeList, filterState]);

  const activeRouteIndexChange = useCallback(
    (idx: number) => {
      if (!map || activeRouteIndex === idx) {
        return;
      }

      setActiveRouteIndex(idx);
      highlightRouteByIndex({
        routeList: routeList,
        index: idx,
        map: map,
      });
    },
    [map, routeList, activeRouteIndex],
  );

  const onFilterChange = (values: any) => {
    setFilterState(values);
  };

  useEffect(() => {
    if (map) {
      const doDirectionsService = (travelMode: google.maps.TravelMode) => {
        if (retryTimes.current > 1) {
          return;
        }
        const { originList, destinationList } = step2DataRef.current;
        const pointList = [...originList, ...destinationList];
        if (pointList?.length === 0) {
          return;
        }
        clearOverlay();
        const originPoint = pointList[0];
        const destinationPoint = pointList[pointList.length - 1];
        const waypoints = pointList.slice(1, pointList.length - 1);
        const directionsService = new window.google.maps.DirectionsService();

        const params: google.maps.DirectionsRequest = {
          origin: {
            lat: originPoint.lat,
            lng: originPoint.lng,
          },
          destination: {
            lat: destinationPoint.lat,
            lng: destinationPoint.lng,
          },
          waypoints: waypoints.map((n) => {
            return { stopover: true, location: { lat: n.lat, lng: n.lng } };
          }),
          travelMode: travelMode,
          provideRouteAlternatives: true,
          region: region,
          // language: language,
          avoidHighways: filterState.highways === 'Avoid',
          avoidFerries: filterState.ferries === 'Avoid',
          avoidTolls: filterState.tolls === 'Avoid',
        };
        setPageLoading(true);

        directionsService
          .route(params)
          .then((res: google.maps.DirectionsResult) => {
            const { routes } = res;
            serviceResRoutes.current = routes;
            const _routeList = formatServiceRoutes({ routes, map, overlay });
            setRouteList(_routeList);
            setActiveRouteIndex(0);
            launchRender({
              routeList: _routeList,
              originList,
              destinationList,
              map,
              overlay,
            });
          })
          .catch((err: google.maps.MapsRequestError) => {
            const { code } = err;
            if (code === google.maps.DirectionsStatus.ZERO_RESULTS) {
              console.warn('🧪🧪🧪 Changed Travel Mode Try Again, By Walking');
              retryTimes.current += 1;
              doDirectionsService(window.google.maps.TravelMode.WALKING);
            }
          })
          .finally(() => {
            setPageLoading(false);
          });
      };
      doDirectionsService(window.google.maps.TravelMode.DRIVING);
    }
  }, [map, filterState]);

  useEffect(() => {
    if (mapRef.current && mapVisible) {
      initMap(mapRef.current);
    }
  }, [mapRef, mapVisible]);

  useEffect(() => {
    const unsubscribe = subscribe(STEP_EVENTS.STEP2_NEXT_TRIGGER, (payload) => {
      doReset();
      const copiedPayload = cloneDeep(payload);
      step2DataRef.current = copiedPayload;
      setMapVisible(true);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <div className={cls(styles.step3, 'step3')}>
        <div className={styles.routesMap}>
          <Row gutter={0}>
            <Col span={5}>
              <div className="routeListWrap">
                <RouteFilter onChange={onFilterChange} />
                <div className="routeListContent">
                  <div className="routeListCase">
                    {routeList?.length > 0 ? (
                      routeList.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className={cls(
                              'routeItem',
                              activeRouteIndex === idx && 'active',
                            )}
                            onClick={() => activeRouteIndexChange(idx)}
                          >
                            <div className="alternative">
                              <span className="alternativeTitle">{`Alternative route ${
                                idx + 1
                              }`}</span>
                              <span className="alternativeDistance">{`${(
                                item.distance / 1000
                              ).toFixed(2)}KM`}</span>
                            </div>
                            <div className="routeInfo">{item.summary}</div>
                          </div>
                        );
                      })
                    ) : pageLoading ? (
                      <Skeleton loading={true} active></Skeleton>
                    ) : (
                      <div style={{ padding: '10px' }}>
                        Unable to generate preset route, please check if the
                        address is correct and specific.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={19}>
              <div
                className="mapWrap"
                style={{ width: '100%', height: '600px' }}
              >
                {mapVisible && (
                  <div
                    id="map"
                    ref={mapRef}
                    className="mapContainer"
                    style={{ width: '100%', height: '600px' }}
                  ></div>
                )}
              </div>
            </Col>
          </Row>
        </div>
        <div className={cls(styles.footer, styles.footerStep3)}>
          <div className={styles.btns}>
            <Button onClick={() => handlePrev()}>Previous</Button>
            <Button onClick={() => handleCancel()}>Cancel</Button>
            <Button
              type="primary"
              disabled={routeList?.length === 0}
              loading={confirmLoading}
              onClick={() => handleConfirm()}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step3;
