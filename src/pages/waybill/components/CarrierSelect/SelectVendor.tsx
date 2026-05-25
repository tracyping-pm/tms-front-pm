import {
  IWaybillVendorListItem,
  IWaybillVendorListParams,
} from '@/api/types/waybill';
import { getWaybillVendorList } from '@/api/waybill';
import CustomTooltip from '@/components/CustomTooltip';
import {
  VendorStatusEnum,
  VendorStatusEnumColor,
  VendorStatusEnumText,
  WaybillDispatchTypeEnum,
} from '@/enums';
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
  ProFormText,
} from '@ant-design/pro-components';
import { Badge, Button, Col, Row } from 'antd';
import cls from 'classnames';
import { debounce } from 'lodash';
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
          <Col span={4} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Vendor Name
            </span>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <CustomTooltip title={'Vendor Access Status'}>
              <span className={cls('tableHeaderSpan', styles.tableHeaderName)}>
                Vendor Access Status
              </span>
            </CustomTooltip>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <CustomTooltip title={'Accreditation Status'}>
              <span className={cls('tableHeaderSpan', styles.tableHeaderName)}>
                Accreditation Status
              </span>
            </CustomTooltip>
          </Col>
          <Col span={3} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>Trucks</span>
          </Col>
          <Col span={4} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Contacts
            </span>
          </Col>
          <Col span={5} className={styles.tableHeaderItem}>
            <CustomTooltip title={'Truck Type Consistency'}>
              <span className={cls('tableHeaderSpan', styles.tableHeaderName)}>
                Truck Type Consistency
              </span>
            </CustomTooltip>
          </Col>
        </Row>
      </div>
    </>
  );
};

const CheckItemView = (props: {
  vendorStatus: VendorStatusEnum;
  [key: string]: any;
}) => {
  const {
    trucks,
    vendorName,
    truckTypeConsistency,
    vendorAccessStatus,
    vendorStatus,

    vendorContactPhoneNumber,
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
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={vendorName}>
                <span>{vendorName}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={vendorAccessStatus}>
                {vendorAccessStatus === 'Approved' ? (
                  <span className={styles.truckTrue}>Approved</span>
                ) : (
                  <span className={styles.truckFalse}>Not Approved</span>
                )}
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip
                title={
                  <Badge
                    color={VendorStatusEnumColor[vendorStatus]}
                    text={VendorStatusEnumText[vendorStatus]}
                  />
                }
              >
                <Badge
                  color={VendorStatusEnumColor[vendorStatus]}
                  text={VendorStatusEnumText[vendorStatus]}
                />
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={3} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={trucks}>{trucks}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={4} style={{ height: '100%', paddingRight: '10px' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={vendorContactPhoneNumber}>
                {vendorContactPhoneNumber}
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={5} style={{ height: '100%', paddingRight: '10px' }}>
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

export default function SelectVendor(props: {
  waybillId: number;
  projectId: number;
  requireTruck: string;
  requireTruckId: number;
  vendorIdOrigin: number;
  dispatchType: WaybillDispatchTypeEnum;
}) {
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const carrierSelect = state?.carrierSelect || {};
  const {
    waybillId,
    projectId,
    requireTruck,
    requireTruckId,
    vendorIdOrigin,
    dispatchType,
  } = props;

  const [page, setPage] = useState<number>(1);
  const [vendorLoading, setVendorLoading] = useState<boolean>(true);
  const [finished, setFinished] = useState<boolean>(false);
  const [vendorList, setVendorList] = useState<IWaybillVendorListItem[]>([]);
  const filterFormRefForOrigin = useRef<ProFormInstance>();
  const scrollLockRef = useRef<boolean>(false);

  const getList = async (params: IWaybillVendorListParams, refresh = false) => {
    if (refresh) {
      setFinished(false);
    }
    setVendorLoading(true);
    const res = await getWaybillVendorList(params);
    scrollLockRef.current = false;
    setVendorLoading(false);
    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      if (refresh) {
        if (Number(res?.data?.total) <= list.length) {
          setFinished(true);
        }
        setVendorList(list);
        setPage(2);
      } else {
        const newList = vendorList.slice().concat(list);
        if (Number(res?.data?.total) <= newList.length) {
          setFinished(true);
        }
        setVendorList(newList);
        setPage(page + 1);
      }
    }
  };

  useEffect(() => {
    if (waybillId) {
      getList({
        pageNum: page,
        pageSize: PAGE_SIZE,
        projectId: projectId,
        vendorName: undefined,
        standardOrNot:
          dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
        requiredTruckType: requireTruckId,
        vendorIdOrigin: vendorIdOrigin,
      });
    }
  }, [waybillId]);

  const onSearch = () => {
    const values = filterFormRefForOrigin.current?.getFieldsValue();
    getList(
      {
        pageNum: 1,
        pageSize: PAGE_SIZE,
        projectId: projectId,
        vendorName: values.vendorName ?? undefined,
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
        vendorName: undefined,
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
          vendorName: values.vendorName ?? undefined,
          standardOrNot:
            dispatchType === WaybillDispatchTypeEnum.STANDARD_DISPATCH,
          requiredTruckType: requireTruckId,
        });
      }
    },
    [page, vendorList, finished],
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
              <Col span={24}>
                <ProFormText
                  name="vendorName"
                  label={null}
                  placeholder="Vendor Name"
                  fieldProps={{
                    onChange: debounce(onSearch, 600),
                    style: {
                      width: '210px',
                    },
                  }}
                />
              </Col>
            </Row>
          </div>
          <Button onClick={doResetFormOrigin}>Reset</Button>
        </div>
      </ProForm>
      <TableHeader />
      <div className={styles.tableList} onScroll={truckScroll}>
        {vendorList?.map((item: IWaybillVendorListItem) => (
          <CheckItemView
            key={item.id}
            {...item}
            isActive={item.id === carrierSelect?.vendor?.id}
            onClick={() => {
              dispatch({
                type: OPS_TYPE.CARRIER_SELECT,
                payload: {
                  data: {
                    ...carrierSelect,
                    truck:
                      carrierSelect?.vendor?.id === item.id
                        ? carrierSelect?.truck
                        : null,
                    driver:
                      carrierSelect?.vendor?.id === item.id
                        ? carrierSelect?.driver
                        : null,
                    helpers:
                      carrierSelect?.vendor?.id === item.id
                        ? carrierSelect?.helpers
                        : [],
                    vendor: item,
                  },
                },
              });
            }}
          />
        ))}
        {vendorLoading ? <StatusText>Loading...</StatusText> : null}
        {finished ? <StatusText>No more data</StatusText> : null}
      </div>
    </div>
  );
}
