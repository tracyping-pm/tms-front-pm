import {
  IWaybillHelperListItem,
  IWaybillHelperListParams,
} from '@/api/types/waybill';
import { getWaybillHelperList } from '@/api/waybill';
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
              Helper Name
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
    phoneNum,
    licenseNumber,
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
            <BaseSpan $isCheck $disabled={disabled} title={accessStatus}>
              <CustomTooltip title={accessStatus}>
                <span>{accessStatus}</span>
              </CustomTooltip>
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
            <BaseSpan $disabled={disabled} title={phoneNum}>
              <CustomTooltip title={phoneNum}>{phoneNum}</CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </CheckItemWrap>
    </Label>
  );
};

export default function SelectHelper(props: { waybillId: number }) {
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const carrierSelect = state?.carrierSelect || {};
  const { waybillId } = props;

  const [truckLoading, setTruckLoading] = useState<boolean>(true);
  const [driverList, setDriverList] = useState<IWaybillHelperListItem[]>([]);
  const filterFormRefForOrigin = useRef<ProFormInstance>();

  const getList = async (params: IWaybillHelperListParams) => {
    setTruckLoading(true);
    const res = await getWaybillHelperList(params);
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

        vendorId: carrierSelect.truck?.vendorId,
      });
    }
  }, [waybillId]);

  const onSearch = useCallback(
    debounce(() => {
      const values = filterFormRefForOrigin.current?.getFieldsValue();
      getList({
        waybillId,

        vendorId: carrierSelect.truck?.vendorId,
        name: values?.helpersName,
      });
    }, 500),
    [],
  );

  const doResetFormOrigin = useCallback(() => {
    filterFormRefForOrigin.current?.resetFields();
    getList({
      waybillId,

      vendorId: carrierSelect.truck?.vendorId,
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
                  name="helpersName"
                  label={null}
                  placeholder="Helpers Name"
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
        {driverList?.map((item: IWaybillHelperListItem) => (
          <CheckItemView
            key={item.id}
            {...item}
            isActive={carrierSelect.helpers.includes(item.id)}
            onClick={() => {
              if (item.disabled) {
                message.error(item.disabledTip);
                return;
              }
              if (!carrierSelect.helpers.includes(item.id)) {
                // 没有则直接添加
                const arr = carrierSelect.helpers;
                arr.push(item.id);
                dispatch({
                  type: OPS_TYPE.CARRIER_SELECT,
                  payload: {
                    data: {
                      ...carrierSelect,
                      helpers: arr,
                    },
                  },
                });
              } else {
                // 存在则取消
                const list = carrierSelect.helpers;
                const findIndex = list.findIndex((l: number) => l === item.id);
                list.splice(findIndex, 1);
                dispatch({
                  type: OPS_TYPE.CARRIER_SELECT,
                  payload: {
                    data: {
                      ...carrierSelect,
                      helpers: list,
                    },
                  },
                });
              }
            }}
          />
        ))}
        <StatusText>{truckLoading ? 'Loading...' : 'No more data'}</StatusText>
      </div>
    </div>
  );
}
