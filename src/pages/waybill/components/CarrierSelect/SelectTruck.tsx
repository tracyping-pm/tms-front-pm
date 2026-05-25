import { getTruckTypeList } from '@/api/truck';
import { ITruckTypeListItem } from '@/api/types/truck';
import {
  IWaybillTruckListItem,
  IWaybillTruckListParams,
} from '@/api/types/waybill';
import { getWaybillTruckList } from '@/api/waybill';
import CustomTooltip from '@/components/CustomTooltip';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum, WaybillDispatchTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { OPS_TYPE, StateContext } from '@/pages/waybill/WaybillDetail/store';
import {
  BaseSpan,
  CheckItemWrap,
  Label,
  StatusText,
} from '@/pages/waybill/components/DetailRouteCard/RouteEditStepsModal/StatusView';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { App, Button, Col, Row } from 'antd';
import cls from 'classnames';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './styles.less';

// 给个大一点的 pageSize 用来处理屏幕比较高的情况，没有出现滚动条，导致触发不了滚动加载更多的功能
const PAGE_SIZE = 30;

const TableHeader: FC = () => {
  return (
    <>
      <div className={styles.tableHeader}>
        <Row>
          {/* <Col span={3}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Access Status
            </span>
          </Col> */}
          <Col span={4} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Truck Type
            </span>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Plate Number
            </span>
          </Col>
          <Col span={2} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Capacity
            </span>
          </Col>
          <Col span={2} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>Garage</span>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Vendor Tag
            </span>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Ownership
            </span>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <CustomTooltip title={'Truck Type Consistency'}>
              <span className={cls('tableHeaderSpan', styles.tableHeaderName)}>
                Truck Type Consistency
              </span>
            </CustomTooltip>
          </Col>
          {/* <Col span={2} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>Mark</span>
          </Col> */}
        </Row>
      </div>
    </>
  );
};

const CheckItemView = (props: any) => {
  const {
    // capacityPoolTruckStatus,
    truckTypeName,
    plateNumber,
    capacity,
    garage,

    truckTypeConsistency,
    vendorTag,
    ownership,
    isActive = false,
    disabled = false,
    onClick,
  } = props;

  return (
    <Label>
      <CheckItemWrap
        $isActive={isActive}
        $disabled={disabled}
        onClick={onClick}
      >
        <Row style={{ height: '100%' }}>
          {/* <Col span={3} style={{ height: '100%' }}>
            <BaseSpan $isCheck $disabled={disabled}>
              <CustomTooltip title={capacityPoolTruckStatus}>
                {capacityPoolTruckStatus === 'Approved' ? (
                  <span className={styles.truckTrue}>Approved</span>
                ) : (
                  <span className={styles.truckFalse}>Not Approved</span>
                )}
              </CustomTooltip>
            </BaseSpan>
          </Col> */}
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $isCheck $disabled={disabled}>
              <CustomTooltip title={truckTypeName}>
                {truckTypeName}
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={plateNumber}>{plateNumber}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={2} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={capacity}>{capacity}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={2} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={garage}>{garage}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={vendorTag}>{vendorTag}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={ownership}>{ownership}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip
                title={truckTypeConsistency ? 'Consistent' : 'Inconsistent'}
              >
                {truckTypeConsistency ? (
                  <span className={styles.truckTrue}>Consistent</span>
                ) : (
                  <span className={styles.truckFalse}>Inconsistent</span>
                )}
              </CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </CheckItemWrap>
    </Label>
  );
};

export default function SelectTruck(props: {
  waybillId: number;
  projectId: number;
  requireTruck: string;
  requireTruckId: number;
  truckIdOriginal: number;
  dispatchType: WaybillDispatchTypeEnum;
}) {
  const { message } = App.useApp();
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const carrierSelect = state?.carrierSelect || {};
  const {
    waybillId,
    projectId,
    requireTruck,
    requireTruckId,
    truckIdOriginal,
    dispatchType,
  } = props;

  const [page, setPage] = useState<number>(1);
  const [truckLoading, setTruckLoading] = useState<boolean>(true);
  const [finished, setFinished] = useState<boolean>(false);
  const [truckList, setTruckList] = useState<IWaybillTruckListItem[]>([]);
  const filterFormRefForOrigin = useRef<ProFormInstance>();
  const scrollLockRef = useRef<boolean>(false);

  const getList = async (params: IWaybillTruckListParams, refresh = false) => {
    if (refresh) {
      setFinished(false);
    }
    setTruckLoading(true);
    const res = await getWaybillTruckList(params);
    scrollLockRef.current = false;
    setTruckLoading(false);
    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      if (refresh) {
        if (Number(res?.data?.total) <= list.length) {
          setFinished(true);
        }
        setTruckList(list);
        setPage(2);
      } else {
        const newList = truckList.slice().concat(list);
        if (Number(res?.data?.total) <= newList.length) {
          setFinished(true);
        }
        setTruckList(newList);
        setPage(page + 1);
      }
    }
  };

  useEffect(() => {
    if (waybillId && carrierSelect?.vendor?.id) {
      getList({
        pageNum: page,
        pageSize: PAGE_SIZE,
        projectId: projectId,
        truckTypeId: undefined,
        truckId: undefined,
        vendorId: carrierSelect?.vendor?.id,
        standardOrNot:
          dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
        requiredTruckType: requireTruckId,
        truckIdOriginal: truckIdOriginal,
      });
    }
  }, [waybillId]);

  const {
    options: plateNumberOptions,
    onSearch: plateNumberSearch,
    defaultFieldProps: plateNumberDefaultFieldProps,
  } = useFieldQuery({
    field: 'plateNumber',
    esDtoClass: ES_DTO_CLASS.TRUCK,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const onSearch = () => {
    const values = filterFormRefForOrigin.current?.getFieldsValue();
    getList(
      {
        pageNum: 1,
        pageSize: PAGE_SIZE,
        projectId: projectId,
        truckTypeId: values.truckType ?? undefined,
        truckId: values.plateNumber?.id ?? undefined,
        vendorId: carrierSelect?.vendor?.id,
        standardOrNot:
          dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
        requiredTruckType: requireTruckId,
      },
      true,
    );
  };

  const doResetFormOrigin = useCallback(() => {
    filterFormRefForOrigin.current?.resetFields();
    getList(
      {
        pageNum: 1,
        pageSize: PAGE_SIZE,
        projectId: projectId,
        truckTypeId: undefined,
        truckId: undefined,
        vendorId: carrierSelect?.vendor?.id,
        standardOrNot:
          dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
        requiredTruckType: requireTruckId,
      },
      true,
    );
  }, []);

  const truckScroll = useCallback(
    (e: React.UIEvent<HTMLElement, UIEvent>) => {
      if (finished || scrollLockRef.current) return;
      if (
        e.currentTarget.clientHeight + e.currentTarget.scrollTop >=
        56 * 15 * (page - 1)
      ) {
        scrollLockRef.current = true; // 加锁
        const values = filterFormRefForOrigin.current?.getFieldsValue();
        getList({
          pageNum: page,
          pageSize: PAGE_SIZE,
          projectId: projectId,
          truckTypeId: values.truckType ?? undefined,
          truckId: values.plateNumber?.id ?? undefined,
          vendorId: carrierSelect?.vendor?.id,
          standardOrNot:
            dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
          requiredTruckType: requireTruckId,
        });
      }
    },
    [page, truckList, finished],
  );

  return (
    <div className={styles.selectTruck}>
      <div className={styles.requireType}>
        Require Truck Type: {requireTruck}
      </div>
      <ProForm
        style={{ height: '52px' }}
        submitter={false}
        formRef={filterFormRefForOrigin}
      >
        <div className={cls('filters', styles.filters)}>
          <div className={styles.formItems}>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  name={'truckType'}
                  showSearch
                  fieldProps={{
                    filterOption: true,
                    style: {
                      width: '210px',
                    },
                  }}
                  label={null}
                  placeholder={'Truck Type'}
                  request={async () => {
                    const res = await getTruckTypeList();
                    if (res.code === 200) {
                      return res?.data?.map((item: ITruckTypeListItem) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                    }
                    return [];
                  }}
                  onChange={onSearch}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name="plateNumber"
                  label={null}
                  placeholder="Plate Number"
                  valuePropName="name"
                  fieldProps={{
                    ...plateNumberDefaultFieldProps,
                    style: {
                      width: '210px',
                    },
                    placeholder: 'Plate Number',
                    options: plateNumberOptions,
                    onSearch: plateNumberSearch,
                  }}
                  onChange={onSearch}
                />
              </Col>
            </Row>
          </div>
          <Button onClick={doResetFormOrigin}>Reset</Button>
        </div>
      </ProForm>
      <TableHeader />
      <div className={styles.tableList} onScroll={truckScroll}>
        {truckList?.map((item: IWaybillTruckListItem) => (
          <CheckItemView
            key={item.id}
            {...item}
            isActive={
              item.vendorTruckId === carrierSelect?.truck?.vendorTruckId
            }
            onClick={() => {
              if (item.disabled) {
                message.error(item.disabledTip);
                return;
              }
              dispatch({
                type: OPS_TYPE.CARRIER_SELECT,
                payload: {
                  data: {
                    ...carrierSelect,
                    driver:
                      carrierSelect?.truck?.vendorTruckId === item.vendorTruckId
                        ? carrierSelect?.driver
                        : null,
                    helpers:
                      carrierSelect?.truck?.vendorTruckId === item.vendorTruckId
                        ? carrierSelect?.helpers
                        : [],
                    truck: item,
                  },
                },
              });
            }}
          />
        ))}
        {truckLoading ? <StatusText>Loading...</StatusText> : null}
        {finished ? <StatusText>No more data</StatusText> : null}
      </div>
    </div>
  );
}
