import { IStopPointItem } from '@/api/types/project';
import { IRouteOriginAndDestinationListItem } from '@/api/types/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import { MAX_LENGTH } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { App, Button, Col, Empty, Form, Input, Row, Spin } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useContext, useRef, useState } from 'react';
import StopPointsModal from '../StopPointsModal';
import AddressModal from './AddressModal';
import AddressSortList from './AddressSortList';
import styles from './styles.less';
import { STEP_EVENTS, buildVid, checkListItemRepeat } from './support';

const defaultFormValue = {
  padId: undefined,
  sadId: undefined,
  tadId: undefined,
  address: undefined,
  label: undefined,
};

enum OperationTypeEnum {
  ORIGIN_ADD = 'ORIGIN_ADD',
  ORIGIN_MODIFY = 'ORIGIN_MODIFY',
  ORIGIN_DELETE = 'ORIGIN_DELETE',
  ORIGIN_STOP_POINT_ADD = 'ORIGIN_STOP_POINT_ADD',
  DESTINATION_ADD = 'DESTINATION_ADD',
  DESTINATION_MODIFY = 'DESTINATION_MODIFY',
  DESTINATION_DELETE = 'DESTINATION_DELETE',
  DESTINATION_STOP_POINT_ADD = 'DESTINATION_STOP_POINT_ADD',
}

interface IStopPointModalState {
  open: boolean;
}

type IFormDefaultValue =
  | IRouteOriginAndDestinationListItem
  | {
      padId?: number;
      sadId?: number;
      tadId?: number;
      address?: string;
      [key: string]: unknown;
    };

interface IStep1 {
  projectId: number;
  initialValue: {
    routeCode: string;
    selectedOrigins: IRouteOriginAndDestinationListItem[];
    selectedDestinations: IRouteOriginAndDestinationListItem[];
  };
  doNext: () => void;
  doCancel: () => Promise<unknown>;
}

const Step1: FC<IStep1> = ({ projectId, initialValue, doNext, doCancel }) => {
  const { message, modal } = App.useApp();
  const { publish } = useContext(PubSubContext);

  const [routeCodeForm] = Form.useForm();
  // 重新生成vid，保证前端数据纯性
  const pureSelectedOrigins = initialValue.selectedOrigins?.map?.(
    (item: IRouteOriginAndDestinationListItem) => {
      return {
        ...item,
        isStop: item.isStop ? true : false,
        vid: buildVid(item, 'O'),
      };
    },
  );
  const pureSelectedDestinations = initialValue.selectedDestinations?.map?.(
    (item: IRouteOriginAndDestinationListItem) => {
      return {
        ...item,
        isStop: item.isStop ? true : false,
        vid: buildVid(item, 'D'),
      };
    },
  );
  const [addressOriginList, setAddressOriginList] = useState<
    IRouteOriginAndDestinationListItem[]
  >(pureSelectedOrigins ?? []);
  const [addressDestinationList, setAddressDestinationList] = useState<
    IRouteOriginAndDestinationListItem[]
  >(pureSelectedDestinations ?? []);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  const originFormRef = useRef<any>();
  const destinationFormRef = useRef<any>();

  const [formDefaultValue, setFormDefaultValue] =
    useState<IFormDefaultValue>(defaultFormValue);
  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
  const [addressModalTitle, setAddressModalTitle] = useState<string>('');
  const curOperationTypeRef = useRef<OperationTypeEnum>(
    OperationTypeEnum.ORIGIN_ADD,
  );
  const [stopPointModalState, setStopPointModalState] =
    useSetState<IStopPointModalState>({ open: false });

  const handleCancel = useCallback(() => {
    doCancel?.();
  }, []);

  const handleNext = useCallback(async () => {
    if (
      addressOriginList?.length === 0 ||
      addressDestinationList?.length === 0
    ) {
      message.warning('Points cannot be empty');
      return;
    }
    const originFormValidate = originFormRef?.current?.validateFields?.();
    const destinationFormValidate =
      destinationFormRef?.current?.validateFields?.();

    Promise.all([originFormValidate, destinationFormValidate])
      .then(() => {
        const { pointList: _originList } =
          originFormRef?.current?.getFieldsValue?.();
        const { pointList: _destinationList } =
          destinationFormRef?.current?.getFieldsValue?.();

        if (!_originList?.length || !_destinationList?.length) {
          message.error('Please select at least one origin and destination');
          return;
        }

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

        const routeCode = routeCodeForm.getFieldValue('routeCode');

        const payload = {
          routeCode: routeCode,
          originList: originList,
          destinationList: destinationList,
        };
        publish(STEP_EVENTS.STEP1_NEXT_TRIGGER, payload);
        doNext?.();
      })
      .catch((err) => {
        console.log('err: ', err);
      });
  }, [addressOriginList, addressDestinationList]);

  const updateTrigger = (
    newList: IRouteOriginAndDestinationListItem[],
    type: 'origin' | 'destination',
  ) => {
    if (type === 'origin') {
      setAddressOriginList(newList);
    } else {
      setAddressDestinationList(newList);
    }
  };

  const addressOperation = (
    type: OperationTypeEnum,
    defaultValue: IFormDefaultValue,
  ) => {
    const value = { ...defaultValue };
    switch (type) {
      case OperationTypeEnum.ORIGIN_ADD:
        curOperationTypeRef.current = OperationTypeEnum.ORIGIN_ADD;
        setAddressModalTitle('Add Origin');
        setFormDefaultValue(value);
        setAddressModalOpen(true);
        break;
      case OperationTypeEnum.ORIGIN_MODIFY:
        curOperationTypeRef.current = OperationTypeEnum.ORIGIN_MODIFY;
        setAddressModalTitle('Modify Origin');
        setFormDefaultValue(value);
        setAddressModalOpen(true);
        break;
      case OperationTypeEnum.ORIGIN_DELETE: {
        curOperationTypeRef.current = OperationTypeEnum.ORIGIN_DELETE;
        const { vid } = value;
        const newList = addressOriginList.filter((item) => item.vid !== vid);
        setAddressOriginList(newList);
        break;
      }
      case OperationTypeEnum.ORIGIN_STOP_POINT_ADD: {
        curOperationTypeRef.current = OperationTypeEnum.ORIGIN_STOP_POINT_ADD;
        setStopPointModalState({ open: true });
        break;
      }
      case OperationTypeEnum.DESTINATION_ADD:
        curOperationTypeRef.current = OperationTypeEnum.DESTINATION_ADD;
        setAddressModalTitle('Add Destination');
        setFormDefaultValue(value);
        setAddressModalOpen(true);
        break;
      case OperationTypeEnum.DESTINATION_MODIFY:
        curOperationTypeRef.current = OperationTypeEnum.DESTINATION_MODIFY;
        setAddressModalTitle('Modify Destination');
        setFormDefaultValue(value);
        setAddressModalOpen(true);
        break;
      case OperationTypeEnum.DESTINATION_DELETE: {
        curOperationTypeRef.current = OperationTypeEnum.DESTINATION_DELETE;
        const { vid } = value;
        const newList = addressDestinationList.filter(
          (item) => item.vid !== vid,
        );
        setAddressDestinationList(newList);
        break;
      }
      case OperationTypeEnum.DESTINATION_STOP_POINT_ADD: {
        curOperationTypeRef.current =
          OperationTypeEnum.DESTINATION_STOP_POINT_ADD;
        setStopPointModalState({ open: true });
        break;
      }
      default:
        break;
    }
  };

  const addressModalConfirm = useCallback(
    (values: any) => {
      switch (curOperationTypeRef.current) {
        case OperationTypeEnum.ORIGIN_ADD: {
          const vid = buildVid(values, 'O');
          values.vid = vid;
          values.isStop = false;

          // addressOriginList追加一条数据
          const newAddressOriginList = [...addressOriginList, values];
          const isRepeat = checkListItemRepeat(newAddressOriginList, 'vid');
          if (isRepeat) {
            message.error('Point already exists');
          } else {
            setAddressOriginList(newAddressOriginList);
            setAddressModalOpen(false);
          }
          break;
        }
        case OperationTypeEnum.ORIGIN_MODIFY: {
          // addressOriginList修改一条数据
          const newAddressOriginList = addressOriginList.map((item) => {
            if (item.vid === values.vid) {
              return values;
            }
            return item;
          });
          setAddressOriginList(newAddressOriginList);
          setAddressModalOpen(false);
          break;
        }

        case OperationTypeEnum.DESTINATION_ADD: {
          const vid = buildVid(values, 'D');
          values.vid = vid;
          values.isStop = false;

          // addressDestinationList追加一条数据
          const newAddressDestinationList = [...addressDestinationList, values];
          const isRepeat = checkListItemRepeat(
            newAddressDestinationList,
            'vid',
          );
          if (isRepeat) {
            message.error('Point already exists');
          } else {
            setAddressDestinationList(newAddressDestinationList);
            setAddressModalOpen(false);
          }
          break;
        }
        case OperationTypeEnum.DESTINATION_MODIFY: {
          // addressDestinationList修改一条数据
          const newAddressDestinationList = addressDestinationList.map(
            (item) => {
              if (item.vid === values.vid) {
                return values;
              }
              return item;
            },
          );
          setAddressDestinationList(newAddressDestinationList);
          setAddressModalOpen(false);
          break;
        }
        default:
          break;
      }
    },
    [addressOriginList, addressDestinationList],
  );

  const doNotify = useCallback(() => {
    modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: 'Confirm',
      content:
        'The address triggers Region library update, please close this pop-up window and add it again.',
      okText: 'Close',
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
      onOk() {
        setAddressModalOpen(false);
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  const addStopPoint = useCallback(
    (list: any[]) => {
      switch (curOperationTypeRef.current) {
        case OperationTypeEnum.ORIGIN_STOP_POINT_ADD: {
          const newSelectedOrigins = [...addressOriginList, ...list];
          const isRepeat = checkListItemRepeat(newSelectedOrigins, 'vid');
          if (isRepeat) {
            message.error('Point already exists');
          } else {
            setAddressOriginList(newSelectedOrigins);
            setStopPointModalState({ open: false });
          }
          break;
        }
        case OperationTypeEnum.DESTINATION_STOP_POINT_ADD: {
          // addressDestinationList追加一条数据
          const newSelectedDestinations = [...addressDestinationList, ...list];
          const isRepeat = checkListItemRepeat(newSelectedDestinations, 'vid');
          if (isRepeat) {
            message.error('Point already exists');
          } else {
            setAddressDestinationList(newSelectedDestinations);
            setStopPointModalState({ open: false });
          }
          break;
        }
        default:
          break;
      }
    },
    [addressOriginList, addressDestinationList],
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

  return (
    <>
      <Spin spinning={pageLoading}>
        <div className={cls(styles.step2, 'step2')}>
          <div className={styles.selectAdress}>
            <Row gutter={32}>
              <Col span={12}>
                <div className="listWrap">
                  <div className="listHeader">
                    <span className="listTitle">Origin Point</span>
                    <span className="extra">
                      <CustomStatusButton
                        noStyle
                        icon={<PlusOutlined />}
                        onClick={() =>
                          addressOperation(
                            OperationTypeEnum.ORIGIN_ADD,
                            defaultFormValue,
                          )
                        }
                      >
                        Add Origin
                      </CustomStatusButton>
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
                    {addressOriginList?.length > 0 ? (
                      <AddressSortList
                        list={addressOriginList}
                        ref={originFormRef}
                        formName="originList"
                        setPageLoading={setPageLoading}
                        updateTrigger={(newList) =>
                          updateTrigger(newList, 'origin')
                        }
                        editTrigger={(item) =>
                          addressOperation(
                            OperationTypeEnum.ORIGIN_MODIFY,
                            item,
                          )
                        }
                        deleteTrigger={(item) =>
                          addressOperation(
                            OperationTypeEnum.ORIGIN_DELETE,
                            item,
                          )
                        }
                      />
                    ) : (
                      <Empty
                        className="empty"
                        description="no data"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="listWrap">
                  <div className="listHeader">
                    <span className="listTitle">Destination Point</span>
                    <span className="extra">
                      <CustomStatusButton
                        noStyle
                        icon={<PlusOutlined />}
                        onClick={() =>
                          addressOperation(
                            OperationTypeEnum.DESTINATION_ADD,
                            defaultFormValue,
                          )
                        }
                      >
                        Add Destination
                      </CustomStatusButton>
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
                    {addressDestinationList?.length > 0 ? (
                      <AddressSortList
                        list={addressDestinationList}
                        ref={destinationFormRef}
                        formName="destinationList"
                        setPageLoading={setPageLoading}
                        updateTrigger={(newList) =>
                          updateTrigger(newList, 'destination')
                        }
                        editTrigger={(item) =>
                          addressOperation(
                            OperationTypeEnum.DESTINATION_MODIFY,
                            item,
                          )
                        }
                        deleteTrigger={(item) =>
                          addressOperation(
                            OperationTypeEnum.DESTINATION_DELETE,
                            item,
                          )
                        }
                      />
                    ) : (
                      <Empty
                        className="empty"
                        description="no data"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            <div className="routeCodeWrap">
              <span className="routeCodeLabel">Route Code</span>
              <Form className="routeCodeInput" form={routeCodeForm}>
                <Form.Item
                  name="routeCode"
                  initialValue={initialValue.routeCode}
                  style={{ width: '100%' }}
                  rules={[
                    {
                      max: MAX_LENGTH.LONG_NAME,
                      message: `Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Form>
            </div>
          </div>
          <div
            className={cls(styles.footer, styles.footerStep2)}
            style={{ marginTop: '0' }}
          >
            <div className={styles.btns}>
              <Button onClick={() => handleCancel()}>Cancel</Button>
              <Button type="primary" onClick={() => handleNext()}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Spin>
      <AddressModal
        open={addressModalOpen}
        title={addressModalTitle}
        noAllRegion={curOperationTypeRef.current?.indexOf('ORIGIN') > -1}
        formDefaultValue={formDefaultValue}
        modalProps={{
          onCancel: () => setAddressModalOpen(false),
        }}
        onConfrim={addressModalConfirm}
        doNotify={doNotify}
      />
      <StopPointsModal
        isStandardWaybill={false}
        projectId={projectId}
        open={stopPointModalState.open}
        onConfirm={onStopPointChooseConfirm}
        onCancel={() => setStopPointModalState({ open: false })}
      />
    </>
  );
};

export default Step1;
