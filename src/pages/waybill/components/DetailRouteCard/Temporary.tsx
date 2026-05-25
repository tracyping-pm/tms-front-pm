import {
  IRouteOriginAndDestinationListItem,
  IWaybillBaseInfoData,
} from '@/api/types/waybill';
import { waybillRouteTemporaryDetail } from '@/api/waybill';
import { WaybillFinancialStatusEnum, WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import styles from '@/pages/waybill/components/DetailRouteCard/styles.less';
import { useAccess, useParams } from '@umijs/max';
import { Col, Row } from 'antd';
import { FC, useContext, useEffect, useState } from 'react';
import { ReactComponent as DestinationIcon } from '../../../../../public/svg/destination_icon.svg';
import { ReactComponent as OriginIcon } from '../../../../../public/svg/origin_icon.svg';
import { ReactComponent as StopPointIcon } from '../../../../../public/svg/stop_point_icon.svg';
import { OPS_TYPE, StateContext } from '../../WaybillDetail/store';
import DetailCard from '../DetailCard';
import TemporaryStepsModal from './TemporaryStepsModal';
interface IRouteDetailCare {
  onSubmit?: () => void;
}

const DetailRouteCard: FC<IRouteDetailCare> = () => {
  const access = useAccess();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const refreshBasicInfo: boolean = state?.refreshBasicInfo;
  const refreshBilling: boolean = state?.refreshBasicInfo;
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};
  const { id: waybillId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialValue, setInitialValue] = useState<{
    routeCode: string;
    selectedOrigins: IRouteOriginAndDestinationListItem[];
    selectedDestinations: IRouteOriginAndDestinationListItem[];
  }>({
    routeCode: '',
    selectedOrigins: [],
    selectedDestinations: [],
  });

  const [routeEditStepsModalOpen, setRouteEditStepsModalOpen] =
    useState<boolean>(false);

  const handleEdit = () => {
    setRouteEditStepsModalOpen(true);
  };

  const fetchRoute = async () => {
    setLoading(true);
    const res = await waybillRouteTemporaryDetail({
      id: Number(waybillId),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const { routeCode, origins, destinations } = res.data;
      dispatch({
        type: OPS_TYPE.ROUTE_INFO,
        payload: {
          data: res.data || {},
        },
      });
      const selectedOrigins = origins?.map((item) => {
        return {
          ...item,
          vid: String(item.id),
        };
      });
      const selectedDestinations = destinations?.map((item) => {
        return {
          ...item,
          vid: String(item.id),
        };
      });
      setInitialValue({ routeCode, selectedOrigins, selectedDestinations });
    }
  };

  const handleConfirm = () => {
    setRouteEditStepsModalOpen(false);
    dispatch({
      type: OPS_TYPE.REFRESH_BASIC_INFO,
      payload: {
        data: !refreshBasicInfo,
      },
    });
    dispatch({
      type: OPS_TYPE.REFRESH_BILLING,
      payload: {
        data: !refreshBilling,
      },
    });
  };

  useEffect(() => {
    if (waybillId) {
      fetchRoute();
    }
  }, [waybillId, refreshBasicInfo]);

  return (
    <>
      <DetailCard
        title="Route"
        editCallback={handleEdit}
        showEditBtn={
          access[PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING] &&
          ((waybillBasicInfo?.financialStatus ===
            WaybillFinancialStatusEnum.NOT_STARTED &&
            waybillBasicInfo?.status === WaybillStatusEnum.PLANNING) ||
            (waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              waybillBasicInfo?.status === WaybillStatusEnum.PENDING) ||
            (waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT) ||
            waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY ||
            waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION)
        }
        loading={loading}
        child={
          <div className={styles.card}>
            <div className={styles.card_content}>
              <Row>
                <Col span={12}>
                  <div className={styles.card_content_left}>
                    <div className={styles.card_title}>Origin</div>

                    <div className={styles.card_content_item_gap}>
                      {initialValue?.selectedOrigins?.map((item) => {
                        const routeRegionList = [
                          item.padName,
                          item.sadName,
                          item.tadName,
                        ].filter(Boolean);
                        const routeRegion = routeRegionList.join(', ');

                        return (
                          <div
                            key={item.vid}
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <div className={styles.card_content_item}>
                              {item.isStop ? <StopPointIcon /> : <OriginIcon />}
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  {routeRegion}
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.address}
                                </div>
                              </div>
                            </div>
                            <div className={styles.card_content_label}>
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  Origin Label
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.label ?? '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.card_content_right}>
                    <div className={styles.card_title}>Destination</div>

                    <div className={styles.card_content_item_gap}>
                      {initialValue?.selectedDestinations?.map((item) => {
                        const routeRegionList = [
                          item.padName,
                          item.sadName,
                          item.tadName,
                        ].filter(Boolean);
                        const routeRegion = routeRegionList.join(', ');

                        return (
                          <div
                            key={item.vid}
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <div className={styles.card_content_item}>
                              {item.isStop ? (
                                <StopPointIcon />
                              ) : (
                                <DestinationIcon />
                              )}
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  {routeRegion}
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.address}
                                </div>
                              </div>
                            </div>
                            <div className={styles.card_content_label}>
                              <div className={styles.card_content_item_address}>
                                <div
                                  className={
                                    styles.card_content_item_address_name
                                  }
                                >
                                  Destination Label
                                </div>
                                <div
                                  className={
                                    styles.card_content_item_address_desc
                                  }
                                >
                                  {item.label ?? '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className={styles.card_footer}>
              Route Code:{initialValue?.routeCode}
            </div>
          </div>
        }
      />

      <TemporaryStepsModal
        open={routeEditStepsModalOpen}
        projectId={Number(waybillBasicInfo?.projectId)}
        waybillId={Number(waybillId)}
        onCancel={() => setRouteEditStepsModalOpen(false)}
        onConfirm={handleConfirm}
        initialValue={initialValue}
      />
    </>
  );
};

export default DetailRouteCard;
