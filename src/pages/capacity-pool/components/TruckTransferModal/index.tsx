import {
  capacityPoolBind,
  capacityPoolTruckList,
  truckVendorRef,
} from '@/api/capacity';
import { getTruckTypeList } from '@/api/truck';
import {
  ICapacityPoolTruckRecord,
  ITruckVendorRefRecord,
} from '@/api/types/capacity';
import { ITruckTypeListItem } from '@/api/types/truck';
import { ES_DTO_CLASS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { isSameList } from '@/utils/utils';
import {
  ProForm,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { App, Button, Checkbox, Col, Modal, ModalProps, Row } from 'antd';
import cls from 'classnames';
import { debounce } from 'lodash';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ReactComponent as IconLeftActive } from '../../../../../public/svg/capacity/transfer/leftActive.svg';
import { ReactComponent as IconLeftDisable } from '../../../../../public/svg/capacity/transfer/leftDisable.svg';
import { ReactComponent as IconRightActive } from '../../../../../public/svg/capacity/transfer/rightActive.svg';
import { ReactComponent as IconRightDisable } from '../../../../../public/svg/capacity/transfer/rightDisable.svg';
import {
  EVENT_CAPACITY_DETAIL_RELOAD,
  EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD,
} from '../../Detail/events';
import { OPS_TYPE, StateContext } from '../../Detail/store';
import { CheckboxItemView, StatusText } from './StatusView';
import styles from './styles.less';

const CONTAINER_HEIGHT = 56 * 7;
const CONTAINER_HEIGHT_PRIVATE = 56 * 8;

type ITruckTransferModal = ModalProps;

const TableHeader = () => {
  return (
    <>
      <div className={styles.tableHeader}>
        <Row gutter={16}>
          <Col span={8}>
            <span className={cls('tableHeaderSpan', styles.plateNumber)}>
              Plate Number
            </span>
          </Col>
          <Col span={8}>
            <span className={cls('tableHeaderSpan', styles.truckType)}>
              Truck Type
            </span>
          </Col>
          <Col span={8}>
            <span className={cls('tableHeaderSpan', styles.vendorTag)}>
              Vendor Tag
            </span>
          </Col>
        </Row>
      </div>
    </>
  );
};

const TruckTransferModal = ({
  // width = 1680,
  width = '90%',
  ...restProps
}: ITruckTransferModal) => {
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { publish } = useContext(PubSubContext);
  const open = state?.truckTransferModal?.open ?? false;
  const { id: capacityPoolId } = useParams();
  const { message, modal } = App.useApp();
  const filterFormRef1 = useRef<ProFormInstance>();

  // list1 options
  const [loading1, setLoading1] = useState<boolean>(false);
  const [list1, setList1] = useState<ITruckVendorRefRecord[]>([]);
  const [originData1, setOriginData1] = useState<
    PaginationResponse<ITruckVendorRefRecord>
  >({});
  const [checkedList1, setCheckedList1] = useState<number[]>([]);
  const pageNumRef1 = useRef<number>(1);

  // list2 options
  const [loading2, setLoading2] = useState<boolean>(false);
  const [list2, setList2] = useState<ICapacityPoolTruckRecord[]>([]);
  const [originData2, setOriginData2] = useState<
    PaginationResponse<ICapacityPoolTruckRecord>
  >({});
  const [checkedList2, setCheckedList2] = useState<number[]>([]);
  const pageNumRef2 = useRef<number>(1);

  const {
    options: vendorTagOptions,
    onSearch: vendorTagSearch,
    defaultFieldProps: vendorTagDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorTag',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const reset = useCallback(() => {
    setCheckedList1([]);
    setList1([]);
    setOriginData1({});
    pageNumRef1.current = 1;

    setCheckedList2([]);
    setList2([]);
    setOriginData2({});
    pageNumRef2.current = 1;
  }, []);

  const doCloseModal = useCallback(() => {
    reset();
    dispatch({
      type: OPS_TYPE.TRUCK_TRANSFER_MODAL,
      payload: {
        ...state?.truckTransferModal,
        open: false,
      },
    });
  }, []);

  // const doNoticeOut = useCallback(() => {
  // dispatch({
  //   type: OPS_TYPE.RELOAD_ALL,
  //   payload: {
  //     reloadAll: true,
  //   },
  // });

  // // reset state
  // setTimeout(() => {
  //   dispatch({
  //     type: OPS_TYPE.RELOAD_ALL,
  //     payload: {
  //       reloadAll: false,
  //     },
  //   });
  // }, 0);
  // }, []);

  const handleCheckChange1 = (checkedValue: number[]) => {
    setCheckedList1(checkedValue);
  };

  const fetchData1 = async () => {
    if (loading1 || originData1?.hasNextPage === false) {
      return;
    }
    setLoading1(true);
    const values = filterFormRef1.current?.getFieldsValue();
    const { plateNumber, truckTypeId, vendorTagObj } = values ?? {};
    const filters = {
      plateNumber,
      truckTypeId,
      vendorId: vendorTagObj?.id,
    };

    const payload = {
      pageNum: pageNumRef1.current,
      pageSize: 10,
      ...filters,
    };
    const res = await truckVendorRef(payload);
    setLoading1(false);
    pageNumRef1.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = list1.concat(list);
      setList1(newData);
      setOriginData1(res.data);
    }
  };

  const onScroll1 = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      CONTAINER_HEIGHT
    ) {
      fetchData1();
    }
  };

  const doSearch1 = async (params?: {
    plateNumber?: string;
    truckTypeId?: number;
    vendorId?: number;
  }) => {
    pageNumRef1.current = 1;

    setLoading1(true);
    setList1([]);
    const payload = {
      ...params,
      pageNum: 1,
      pageSize: 10,
    };
    const res = await truckVendorRef(payload);
    setLoading1(false);
    pageNumRef1.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      setList1(list);
      setOriginData1(res.data);
    }
  };

  const doResetForm1 = useCallback(() => {
    filterFormRef1.current?.resetFields();
    doSearch1();
  }, []);

  const onFilterSelect1 = useCallback(() => {
    const values = filterFormRef1.current?.getFieldsValue();
    const { plateNumber, truckTypeId, vendorTagObj } = values;
    const params = {
      plateNumber,
      truckTypeId,
      vendorId: vendorTagObj?.id,
    };
    doSearch1(params);
  }, []);

  const onPlatNumber1Change = useCallback(() => {
    onFilterSelect1();
  }, []);

  const handleCheckChange2 = (checkedValue: number[]) => {
    setCheckedList2(checkedValue);
  };

  const fetchData2 = async () => {
    if (loading2 || originData2?.hasNextPage === false) {
      return;
    }
    setLoading2(true);
    const payload = {
      capacityPoolId: Number(capacityPoolId),
      pageNum: pageNumRef2.current,
      pageSize: 300, // hack, load all data
    };
    const res = await capacityPoolTruckList(payload);
    setLoading2(false);
    pageNumRef2.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = list2.concat(list);
      setList2(newData);
      setOriginData2(res.data);
    }
  };

  const onScroll2 = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      CONTAINER_HEIGHT
    ) {
      fetchData2();
    }
  };

  const disabledFn = useCallback(
    (item: ITruckVendorRefRecord) => {
      const { vendorTruckId } = item;
      const isExist = list2?.some(
        (item: ICapacityPoolTruckRecord) =>
          item.vendorTruckId === vendorTruckId,
      );
      return isExist;
    },
    [list2],
  );

  const doResetCheckedList1 = useCallback(() => {
    setCheckedList1([]);
  }, []);

  const doTransfer = useCallback(() => {
    const newList2 = list1.filter((item: ITruckVendorRefRecord) =>
      checkedList1.includes(item.vendorTruckId),
    );

    // @ts-ignore
    setList2([...list2, ...newList2]);
    doResetCheckedList1();
  }, [list1, list2, checkedList1]);

  const doResetCheckedList2 = useCallback(() => {
    setCheckedList2([]);
  }, []);

  const doRevert = useCallback(() => {
    const newList2 = list2.filter(
      (item: ICapacityPoolTruckRecord) =>
        !checkedList2.includes(item.vendorTruckId),
    );
    setList2(newList2);
    doResetCheckedList2();
  }, [list2, checkedList2]);

  const onOk = useCallback(() => {
    const originList2 = originData2?.list ?? [];
    if (isSameList(originList2, list2, 'vendorTruckId')) {
      // 如本次操作无改动，则直接关闭。
      doCloseModal();
    } else {
      // 如本次操作有改动，则需要二次弹窗确认，
      modal.confirm({
        title: 'Change Confirm',
        content: `Confirm that the selected vehicle enters the capacity pool of Opportunity?`,
        okText: 'Confirm',
        onOk: async () => {
          const params = {
            id: Number(capacityPoolId),
            bindIds: list2.map(
              (item: ICapacityPoolTruckRecord) => item.vendorTruckId,
            ),
          };
          const res = await capacityPoolBind(params);
          if (res?.code === 200) {
            message.success('Change successfully!');
            doCloseModal();
            publish(EVENT_CAPACITY_DETAIL_RELOAD);
            publish(EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD);
            // doNoticeOut();
          }
        },
      });
    }
  }, [originData2, list2]);

  const onCancel = useCallback(() => {
    const originList2 = originData2?.list ?? [];
    if (isSameList(originList2, list2, 'vendorTruckId')) {
      // 如本次操作无改动，则直接关闭。
      doCloseModal();
    } else {
      // 如本次操作有改动，则需要二次弹窗确认，
      modal.confirm({
        title: 'Cancel Confirm',
        content: `Confirm to cancel this operation?`,
        okText: 'Confirm',
        onOk: async () => {
          doCloseModal();
        },
      });
    }
  }, [originData2, list2]);

  useEffect(() => {
    if (open) {
      fetchData1();
      fetchData2();
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <Modal
        centered
        title="Edit Capacity"
        open={open}
        width={width}
        okText="Confirm"
        destroyOnClose
        onOk={onOk}
        onCancel={onCancel}
        {...restProps}
      >
        <div className={cls('transferWrap', styles.transferWrap)}>
          <section className={styles.transferItem}>
            <div className={styles.transferTitle}>Inteluck Capacity pool</div>
            <ProForm submitter={false} formRef={filterFormRef1}>
              <div className={cls('filters', styles.filters)}>
                <div className={styles.formItems}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <ProFormDependency name={['plateNumber']}>
                        {() => {
                          return (
                            <ProFormText
                              name={'plateNumber'}
                              label={null}
                              placeholder={'Plate Number'}
                              // @ts-ignore
                              onChange={debounce(onPlatNumber1Change, 500)}
                            />
                          );
                        }}
                      </ProFormDependency>
                    </Col>
                    <Col span={8}>
                      <ProFormSelect
                        name={'truckTypeId'}
                        label={null}
                        placeholder={'Truck Type'}
                        request={async () => {
                          const res = await getTruckTypeList();
                          if (res.code === 200) {
                            return res?.data?.map(
                              (item: ITruckTypeListItem) => {
                                return {
                                  ...item,
                                  label: item.name,
                                  value: item.id,
                                };
                              },
                            );
                          }
                          return [];
                        }}
                        fieldProps={{
                          onChange: onFilterSelect1,
                        }}
                      />
                    </Col>
                    <Col span={8}>
                      <ProFormSelect
                        name={'vendorTagObj'}
                        label={null}
                        valuePropName="name"
                        fieldProps={{
                          ...vendorTagDefaultFieldProps,
                          placeholder: 'Vendor Tag',
                          options: vendorTagOptions,
                          onSearch: vendorTagSearch,
                          onChange: onFilterSelect1,
                        }}
                      />
                    </Col>
                  </Row>
                </div>
                <Button onClick={doResetForm1}>Reset</Button>
              </div>
            </ProForm>
            <TableHeader />
            <div className={styles.tableList}>
              <Checkbox.Group
                style={{ width: '100%', fontSize: 14 }}
                // @ts-ignore
                onChange={handleCheckChange1}
                value={checkedList1}
              >
                <div
                  style={{
                    height: `${CONTAINER_HEIGHT}px`,
                    overflow: 'auto',
                    width: '100%',
                  }}
                  onScroll={onScroll1}
                >
                  {list1?.map((item: ITruckVendorRefRecord) => (
                    <CheckboxItemView
                      key={item.vendorTruckId}
                      {...item}
                      isActive={checkedList1?.includes(item.vendorTruckId)}
                      disabled={disabledFn(item)}
                    />
                  ))}
                  <StatusText>
                    {loading1 ? 'Loading...' : 'No more data'}
                  </StatusText>
                </div>
              </Checkbox.Group>
            </div>
          </section>

          <section className={styles.transferBtns}>
            {checkedList1?.length > 0 ? (
              <IconRightActive
                className={styles.iconActive}
                onClick={doTransfer}
              />
            ) : (
              <IconRightDisable className={styles.iconDisable} />
            )}
            {checkedList2?.length > 0 ? (
              <IconLeftActive
                className={styles.iconActive}
                onClick={doRevert}
              />
            ) : (
              <IconLeftDisable className={styles.iconDisable} />
            )}
          </section>

          <section className={cls(styles.transferItem, styles.specialTransfer)}>
            <div className={cls(styles.transferTitle, 'transferTitle')}>
              Private Capacity pool
            </div>
            <TableHeader />
            <div className={cls(styles.tableList, 'tableList')}>
              <Checkbox.Group
                style={{ width: '100%', fontSize: 14 }}
                // @ts-ignore
                onChange={handleCheckChange2}
                value={checkedList2}
              >
                <div
                  style={{
                    height: `${CONTAINER_HEIGHT_PRIVATE}px`,
                    overflow: 'auto',
                    width: '100%',
                  }}
                  onScroll={onScroll2}
                >
                  {list2?.map((item: ICapacityPoolTruckRecord) => (
                    <CheckboxItemView
                      key={item.vendorTruckId}
                      {...item}
                      isActive={checkedList2?.includes(item.vendorTruckId)}
                    />
                  ))}
                  <StatusText>
                    {loading2 ? 'Loading...' : 'No more data'}
                  </StatusText>
                </div>
              </Checkbox.Group>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
};

export default TruckTransferModal;
