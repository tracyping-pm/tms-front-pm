import {
  IWaybillDriverListItem,
  IWaybillDriverListParams,
} from '@/api/types/waybill';
import { getWaybillDriverList } from '@/api/waybill';
import CustomTooltip from '@/components/CustomTooltip';
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
import { Button, Col, message, Row } from 'antd';
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

const TableHeader: FC = () => {
  return (
    <>
      <div className={styles.tableHeader}>
        <Row>
          <Col span={6} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Driver Name
            </span>
          </Col>
          <Col span={6} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              Access Status
            </span>
          </Col>
          <Col span={6} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>
              License Number
            </span>
          </Col>
          <Col span={6} className={styles.tableHeaderItem}>
            <span className={cls('tableHeaderSpan', styles.city)}>Contact</span>
          </Col>
        </Row>
      </div>
    </>
  );
};

const CheckItemView = (props: any) => {
  const {
    name,
    accessStatus,
    licenseNumber,
    phoneNum,
    // mark,
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
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $isCheck $disabled={disabled} title={name}>
              <CustomTooltip title={name}>
                <span>{name}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} title={accessStatus}>
              <CustomTooltip title={accessStatus}>{accessStatus}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} title={licenseNumber}>
              <CustomTooltip title={licenseNumber}>
                {licenseNumber}
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} $isRight title={phoneNum}>
              <CustomTooltip title={phoneNum}>{phoneNum}</CustomTooltip>
            </BaseSpan>
          </Col>
          {/* <Col span={4} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip placement="left" title={mark}>
                {mark ? mark : '-'}
              </CustomTooltip>
            </BaseSpan>
          </Col> */}
        </Row>
      </CheckItemWrap>
    </Label>
  );
};

export default function SelectDriver(props: { waybillId: number }) {
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const carrierSelect = state?.carrierSelect || {};
  const { waybillId } = props;

  const [truckLoading, setTruckLoading] = useState<boolean>(true);
  const [driverList, setDriverList] = useState<IWaybillDriverListItem[]>([]);
  const filterFormRefForOrigin = useRef<ProFormInstance>();

  const getList = async (params: IWaybillDriverListParams) => {
    setTruckLoading(true);
    const res = await getWaybillDriverList(params);
    setTruckLoading(false);
    if (res.code === 200) {
      const list = res?.data ?? [];
      setDriverList(list);
    }
  };

  useEffect(() => {
    if (waybillId) {
      getList({
        waybillId,
        vendorId: carrierSelect?.vendor?.id,
      });
    }
  }, [waybillId]);

  const onSearch = useCallback(
    debounce(() => {
      const values = filterFormRefForOrigin.current?.getFieldsValue();
      getList({
        waybillId,

        vendorId: carrierSelect?.vendor?.id,
        name: values?.driverName ?? undefined,
      });
    }, 500),
    [],
  );

  const doResetFormOrigin = useCallback(() => {
    filterFormRefForOrigin.current?.resetFields();
    getList({
      waybillId,
      vendorId: carrierSelect?.vendor?.id,
    });
  }, []);

  return (
    <div className={styles.selectTruck}>
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
                  name="driverName"
                  label={null}
                  placeholder="Driver Name"
                  fieldProps={{
                    onChange: onSearch,
                  }}
                />
              </Col>
            </Row>
          </div>
          <Button onClick={doResetFormOrigin}>Reset</Button>
        </div>
      </ProForm>
      <TableHeader />
      <div className={styles.tableList}>
        {driverList?.map((item: IWaybillDriverListItem) => (
          <CheckItemView
            key={item.id}
            {...item}
            isActive={item.id === carrierSelect?.driver?.id}
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
                    driver: item,
                    helpers: [],
                  },
                },
              });
            }}
          />
        ))}
        <StatusText>{truckLoading ? 'Loading...' : 'No more data'}</StatusText>
      </div>
    </div>
  );
}
