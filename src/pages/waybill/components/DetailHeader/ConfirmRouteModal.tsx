import { ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Col, Modal, ModalProps, Row } from 'antd';
import cls from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import { waybillConfirmRoute } from '@/api/waybill';
import {
  IFormatRoutesItem,
  formatServiceRoutesInstantiated,
  highlightRouteByIndex,
  launchRender,
  useGoogleMap,
} from '@/hooks/useGoogleMap';
import { unzip, zip } from '@/utils/map';
import RouteFilter from '../DetailRouteCard/RouteFilter';
import styles from './styles.less';

type IConfirmRouteModal = ModalProps & {
  waybillId: number;
  mapJsonStr: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmRouteModal = ({
  // width = 1680,
  open = false,
  width = '90%',
  waybillId,
  mapJsonStr,
  onCancel,
  onConfirm,
  ...restProps
}: IConfirmRouteModal) => {
  const { modal } = App.useApp();
  const { map, initMap } = useGoogleMap();
  const [mapJson, setMapJson] = useState<{
    routeFilter: any;
    routes: any[];
    activeRouteIndex: number;
    originList: any[];
    destinationList: any[];
  }>({
    routeFilter: {},
    routes: [],
    activeRouteIndex: 0,
    originList: [],
    destinationList: [],
  });
  const [routeList, setRouteList] = useState<IFormatRoutesItem[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const doCancel = useCallback(() => {
    modal.confirm({
      title: 'Operation Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'The data of this operation will not be saved after canceling.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk() {
        onCancel?.();
      },
      onCancel() {
        // DO NOTHING
      },
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const { routeFilter, routes, originList, destinationList } = mapJson;
    const activeRoute = routeList[activeRouteIndex];
    const obj = {
      routeFilter: routeFilter,
      routes: routes,
      activeRouteIndex,
      originList,
      destinationList,
    };

    const compressed = zip(obj);

    const payload = {
      id: waybillId,
      mapJsonStr: compressed,
      distance: activeRoute.distance,
      duration: activeRoute.duration,
    };

    setConfirmLoading(true);
    const res = await waybillConfirmRoute(payload);
    setConfirmLoading(false);
    if (res.code === 200) {
      if (res.data?.code === 1) {
        modal.warning({
          title: 'Warning',
          content: res.data?.msg,
          cancelButtonProps: {
            style: { display: 'none' },
          },
        });
      }
      onConfirm?.();
    }
  }, [activeRouteIndex, mapJson]);

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

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current);
    }
  }, [mapRef]);

  useEffect(() => {
    if (open) {
      if (!map) {
        return;
      }
      try {
        const _mapJson: any = unzip(mapJsonStr);
        setMapJson(_mapJson);
        const { routes, activeRouteIndex, originList, destinationList } =
          _mapJson;
        const _routeList = formatServiceRoutesInstantiated({ routes, map });

        setRouteList(_routeList);
        setActiveRouteIndex(activeRouteIndex);
        launchRender({
          routeList: _routeList,
          activeRouteIndex: activeRouteIndex,
          originList,
          destinationList,
          map,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [open, map]);

  return (
    <>
      <Modal
        centered
        title={'Confirm Route'}
        open={open}
        width={width}
        okText="Confirm"
        maskClosable={false}
        destroyOnClose
        footer={null}
        onCancel={doCancel}
        {...restProps}
      >
        <div className={styles.mainContent}>
          <div className={styles.routesMap}>
            <Row gutter={0}>
              <Col span={5}>
                <div className="routeListWrap">
                  <RouteFilter
                    disabled={true}
                    defaultValue={mapJson.routeFilter}
                  />
                  <div className="routeListContent">
                    <div className="routeListCase">
                      {routeList?.map((item, idx) => {
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
                      })}
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={19}>
                <div
                  className="mapWrap"
                  style={{ width: '100%', height: '600px' }}
                >
                  <div
                    id="map"
                    ref={mapRef}
                    className="mapContainer"
                    style={{ width: '100%', height: '600px' }}
                  ></div>
                </div>
              </Col>
            </Row>
          </div>
          <div className={cls(styles.footer, styles.footerStep3)}>
            <div className={styles.btns}>
              <Button onClick={() => doCancel()}>Cancel</Button>
              <Button
                type="primary"
                loading={confirmLoading}
                onClick={() => handleConfirm()}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmRouteModal;
