import { IStopPointItem } from '@/api/types/project';
import { IRouteOriginAndDestinationListItem } from '@/api/types/waybill';
import {
  waybillRouteAddressLatLngFill,
  waybillRouteAddressReplace,
} from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import PubSubContext from '@/context/pubsub';
import { PlusOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { App, Button, Col, Row, Spin } from 'antd';
import cls from 'classnames';
import { cloneDeep, default as lodash } from 'lodash';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import StopPointsModal from '../StopPointsModal';
import AddressSortList from './AddressSortList';
import styles from './styles.less';
import {
  STEP_EVENTS,
  buildVid,
  checkListItemRepeat,
  deDuplication,
} from './support';

enum OperationTypeEnum {
  ORIGIN_STOP_POINT_ADD = 'ORIGIN_STOP_POINT_ADD',
  ORIGIN_STOP_POINT_DELETE = 'ORIGIN_STOP_POINT_DELETE',
  DESTINATION_STOP_POINT_ADD = 'DESTINATION_STOP_POINT_ADD',
  DESTINATION_STOP_POINT_DELETE = 'DESTINATION_STOP_POINT_DELETE',
}

interface IStopPointModalState {
  open: boolean;
}

interface IStep2 {
  projectId: number;
  waybillId: number;
  doPrev: () => Promise<unknown>;
  doNext: () => void;
  doCancel: () => Promise<unknown>;
}

const Step2: FC<IStep2> = ({
  projectId,
  waybillId,
  doPrev,
  doNext,
  doCancel,
}) => {
  const { message } = App.useApp();
  const { subscribe, publish } = useContext(PubSubContext);
  const [selectedOrigins, setSelectedOrigins] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);
  const [selectedDestinations, setSelectedDestinations] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  const originFormRef = useRef<any>();
  const destinationFormRef = useRef<any>();
  const curOperationTypeRef = useRef<OperationTypeEnum>(
    OperationTypeEnum.ORIGIN_STOP_POINT_ADD,
  );
  const [stopPointModalState, setStopPointModalState] =
    useSetState<IStopPointModalState>({ open: false });

  const addStopPoint = useCallback(
    (list: any[]) => {
      switch (curOperationTypeRef.current) {
        case OperationTypeEnum.ORIGIN_STOP_POINT_ADD: {
          const newSelectedOrigins = [...selectedOrigins, ...list];
          const isRepeat = checkListItemRepeat(newSelectedOrigins, 'vid');
          if (isRepeat) {
            message.error('Point already exists');
          } else {
            setSelectedOrigins(newSelectedOrigins);
            setStopPointModalState({ open: false });
          }
          break;
        }
        case OperationTypeEnum.DESTINATION_STOP_POINT_ADD: {
          // addressDestinationList追加一条数据
          const newSelectedDestinations = [...selectedDestinations, ...list];
          const isRepeat = checkListItemRepeat(newSelectedDestinations, 'vid');
          if (isRepeat) {
            message.error('Point already exists');
          } else {
            setSelectedDestinations(newSelectedDestinations);
            setStopPointModalState({ open: false });
          }
          break;
        }
        default:
          break;
      }
    },
    [selectedOrigins, selectedDestinations],
  );

  const onStopPointChooseConfirm = (list: IStopPointItem[]) => {
    let prefix = '';
    switch (curOperationTypeRef.current) {
      case OperationTypeEnum.ORIGIN_STOP_POINT_ADD: {
        prefix = 'O';
        break;
      }
      case OperationTypeEnum.DESTINATION_STOP_POINT_ADD: {
        prefix = 'D';
        break;
      }
      default:
        break;
    }
    const formatList = list?.map?.((item) => {
      const vid = buildVid(item, prefix);
      return {
        ...item,
        stopPointId: item.id,
        isStop: true,
        vid,
        // level: 1,
      };
    });
    addStopPoint(formatList);
  };

  const updateTrigger = (
    newList: IRouteOriginAndDestinationListItem[],
    type: 'origin' | 'destination',
  ) => {
    if (type === 'origin') {
      setSelectedOrigins(newList);
    } else {
      setSelectedDestinations(newList);
    }
  };

  const addressOperation = (type: OperationTypeEnum, defaultValue: any) => {
    const value = { ...defaultValue };
    switch (type) {
      case OperationTypeEnum.ORIGIN_STOP_POINT_ADD:
        curOperationTypeRef.current = OperationTypeEnum.ORIGIN_STOP_POINT_ADD;
        setStopPointModalState({ open: true });
        break;
      case OperationTypeEnum.ORIGIN_STOP_POINT_DELETE: {
        curOperationTypeRef.current =
          OperationTypeEnum.ORIGIN_STOP_POINT_DELETE;
        const { vid } = value;
        const newList = selectedOrigins.filter((item) => item.vid !== vid);
        setSelectedOrigins(newList);
        break;
      }
      case OperationTypeEnum.DESTINATION_STOP_POINT_ADD:
        curOperationTypeRef.current =
          OperationTypeEnum.DESTINATION_STOP_POINT_ADD;
        setStopPointModalState({ open: true });
        break;
      case OperationTypeEnum.DESTINATION_STOP_POINT_DELETE: {
        curOperationTypeRef.current =
          OperationTypeEnum.DESTINATION_STOP_POINT_DELETE;
        const { vid } = value;
        const newList = selectedDestinations.filter((item) => item.vid !== vid);
        setSelectedDestinations(newList);
        break;
      }
      default:
        break;
    }
  };

  const doReset = useCallback(() => {
    setSelectedOrigins([]);
    setSelectedDestinations([]);
  }, []);

  const handleCancel = useCallback(() => {
    doCancel?.();
  }, []);

  const handlePrev = useCallback(() => {
    doPrev?.()?.then(() => {
      doReset();
    });
  }, []);

  const handleNext = useCallback(async () => {
    await originFormRef?.current?.validateFields?.();
    await destinationFormRef?.current?.validateFields?.();

    const { pointList: _originList } =
      originFormRef?.current?.getFieldsValue?.();
    const { pointList: _destinationList } =
      destinationFormRef?.current?.getFieldsValue?.();

    const originList = _originList.map(
      (item: IRouteOriginAndDestinationListItem, i: number) => {
        return {
          ...item,
          stopPointId: item.isStop ? item.id : undefined,
          children: [],
          sort: i,
        };
      },
    );

    const destinationList = _destinationList.map(
      (item: IRouteOriginAndDestinationListItem, i: number) => {
        return {
          ...item,
          stopPointId: item.isStop ? item.id : undefined,
          children: [],
          sort: i,
        };
      },
    );

    let updateOriginList = cloneDeep(originList);
    let updateDestinationList = cloneDeep(destinationList);

    const _allList = [...originList, ...destinationList];

    const isEmpty = (val: any) => {
      return val === null || val === undefined || val === '';
    };

    const predicate = (item: IRouteOriginAndDestinationListItem) => {
      return item.address && (isEmpty(item?.lat) || isEmpty(item?.lng));
    };
    const noLatLngList = lodash.filter(_allList, predicate);
    if (noLatLngList?.length > 0) {
      const latLngList = lodash.map(noLatLngList, (item) =>
        lodash.pick(item, ['vid', 'padId', 'sadId', 'tadId', 'address']),
      );
      const payload = {
        latLngList,
      };
      setPageLoading(true);
      const res = await waybillRouteAddressLatLngFill(payload);
      setPageLoading(false);

      if (res.data?.length > 0) {
        updateOriginList = originList.map(
          (item: IRouteOriginAndDestinationListItem, idx: number) => {
            const updatedItem = res.data?.find((prop) => prop.vid === item.vid);
            if (updatedItem) {
              const mergeItem = lodash.merge({}, item, updatedItem);

              if (mergeItem.mateSuccess) {
                const { pointList } =
                  originFormRef?.current?.getFieldsValue(true);
                const newItem = {
                  ...pointList[idx],
                  lat: mergeItem.lat,
                  lng: mergeItem.lng,
                };
                const newList = [...pointList];
                newList.splice(idx, 1, newItem);
                originFormRef?.current?.update(newList);
              } else {
                const fieldName = ['list', idx, 'address'];
                originFormRef?.current?.setFields([
                  {
                    name: fieldName,
                    // value: undefined,
                    errors: ['The address does not match the region range'],
                  },
                ]);
              }

              return mergeItem;
            }
            return item;
          },
        );

        updateDestinationList = destinationList.map(
          (item: IRouteOriginAndDestinationListItem, idx: number) => {
            const updatedItem = res.data?.find((prop) => prop.vid === item.vid);
            if (updatedItem) {
              const mergeItem = lodash.merge({}, item, updatedItem);

              if (mergeItem.mateSuccess) {
                const { pointList } =
                  destinationFormRef?.current?.getFieldsValue(true);
                const newItem = {
                  ...pointList[idx],
                  lat: mergeItem.lat,
                  lng: mergeItem.lng,
                };
                const newList = [...pointList];
                newList.splice(idx, 1, newItem);
                destinationFormRef?.current?.update(newList);
              } else {
                const fieldName = ['list', idx, 'address'];
                destinationFormRef?.current?.setFields([
                  {
                    name: fieldName,
                    // value: undefined,
                    errors: ['The address does not match the region range'],
                  },
                ]);
              }

              return mergeItem;
            }
            return item;
          },
        );
      } else {
        console.error('system error');
        return;
      }
    }

    // 检查address项是否有经纬度
    const originFormErrors = originFormRef?.current?.getFieldsError?.();
    const destinationFormErrors =
      destinationFormRef?.current?.getFieldsError?.();
    const originHasError = originFormErrors?.some(
      (item: any) => item.errors?.length,
    );
    const destinationHasError = destinationFormErrors?.some(
      (item: any) => item.errors?.length,
    );

    if (originHasError || destinationHasError) {
      return;
    }

    const payload = {
      originList: updateOriginList,
      destinationList: updateDestinationList,
    };
    publish(STEP_EVENTS.STEP2_NEXT_TRIGGER, payload);
    doNext?.();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(
      STEP_EVENTS.STEP1_NEXT_TRIGGER,
      async (payload) => {
        const copiedPayload = cloneDeep(payload);
        // 重新生成vid，保证前端数据纯性
        const pureSelectedOrigins = copiedPayload.selectedOrigins?.map?.(
          (item: IRouteOriginAndDestinationListItem) => {
            return {
              ...item,
              isStop: item.isStop ? true : false,
              vid: buildVid(item, 'O'),
            };
          },
        );
        const pureSelectedDestinations =
          copiedPayload.selectedDestinations?.map?.(
            (item: IRouteOriginAndDestinationListItem) => {
              return {
                ...item,
                isStop: item.isStop ? true : false,
                vid: buildVid(item, 'D'),
              };
            },
          );
        // 根据 vid 去重
        const destinationUniqList = deDuplication(
          pureSelectedDestinations,
          'vid',
        );

        setSelectedOrigins(pureSelectedOrigins);
        setSelectedDestinations(destinationUniqList);

        // API拿数据
        try {
          const params = {
            waybillId: waybillId,
            selectedOrigins: pureSelectedOrigins,
            selectedDestinations: destinationUniqList,
          };

          setPageLoading(true);
          const resp = await waybillRouteAddressReplace(params);
          setPageLoading(false);
          if (resp.code === 200) {
            setSelectedOrigins(resp.data.selectedOrigins);
            setSelectedDestinations(resp.data.selectedDestinations);
          }
        } catch (err) {
          setPageLoading(false);
        }
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <Spin spinning={pageLoading}>
        <div className={cls(styles.step2, 'step2')}>
          <div className={styles.selectAdress}>
            <Row gutter={32}>
              <Col span={12}>
                <div className="listHeader">
                  <span className="listTitle">Origin Point</span>
                  <span className="extra">
                    <CustomStatusButton
                      noStyle
                      icon={<PlusOutlined />}
                      onClick={() =>
                        addressOperation(
                          OperationTypeEnum.ORIGIN_STOP_POINT_ADD,
                          {},
                        )
                      }
                    >
                      Add Stop Point
                    </CustomStatusButton>
                  </span>
                </div>
                <div className="listContent">
                  <AddressSortList
                    list={selectedOrigins}
                    ref={originFormRef}
                    formName="originList"
                    setPageLoading={setPageLoading}
                    updateTrigger={(newList) =>
                      updateTrigger(newList, 'origin')
                    }
                    deleteTrigger={(item) =>
                      addressOperation(
                        OperationTypeEnum.ORIGIN_STOP_POINT_DELETE,
                        item,
                      )
                    }
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="listHeader">
                  <span className="listTitle">Destination Point</span>
                  <span className="extra">
                    <CustomStatusButton
                      noStyle
                      icon={<PlusOutlined />}
                      onClick={() =>
                        addressOperation(
                          OperationTypeEnum.DESTINATION_STOP_POINT_ADD,
                          {},
                        )
                      }
                    >
                      Add Stop Point
                    </CustomStatusButton>
                  </span>
                </div>
                <div className="listContent">
                  <AddressSortList
                    list={selectedDestinations}
                    ref={destinationFormRef}
                    formName="destinationList"
                    setPageLoading={setPageLoading}
                    updateTrigger={(newList) =>
                      updateTrigger(newList, 'destination')
                    }
                    deleteTrigger={(item) =>
                      addressOperation(
                        OperationTypeEnum.DESTINATION_STOP_POINT_DELETE,
                        item,
                      )
                    }
                  />
                </div>
              </Col>
            </Row>
          </div>
          <div className={cls(styles.footer, styles.footerStep2)}>
            <div className={styles.btns}>
              <Button onClick={() => handlePrev()}>Previous</Button>
              <Button onClick={() => handleCancel()}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => handleNext()}
                loading={pageLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Spin>
      <StopPointsModal
        isStandardWaybill={true}
        projectId={projectId}
        open={stopPointModalState.open}
        onConfirm={onStopPointChooseConfirm}
        onCancel={() => setStopPointModalState({ open: false })}
      />
    </>
  );
};

export default Step2;
