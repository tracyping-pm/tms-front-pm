import { capacityPoolChange, capacityPoolDetail } from '@/api/capacity';
import { ICapacityPoolDetail } from '@/api/types/capacity';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { PermissionEnum } from '@/enums/permission';
import PoolModal from '@/pages/project/components/PoolModal';
import { formatAmount } from '@/utils/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { Affix, App, Button, Col, Row, Spin } from 'antd';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { EVENT_CAPACITY_DETAIL_RELOAD } from '../../Detail/events';
import { OPS_TYPE, StateContext } from '../../Detail/store';
import TruckTransferModal from '../TruckTransferModal';
import styles from './styles.less';

export default memo(function CapacityPoolDetailHeader() {
  const access = useAccess();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { subscribe } = useContext(PubSubContext);
  const { id: capacityPoolId } = useParams();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [poolModalConfirmLoading, setPoolModalConfirmLoading] =
    useState<boolean>(false);
  const [detail, setDetail] = useState<ICapacityPoolDetail>(
    {} as ICapacityPoolDetail,
  );
  const [poolModalOpen, setPoolModalOpen] = useState<boolean>(false);

  const getDetail = useCallback(async () => {
    setLoading(true);
    const res = await capacityPoolDetail({ id: +capacityPoolId! });
    if (res.code === 200) {
      setDetail(res.data);
      dispatch({
        type: OPS_TYPE.CAPACITY_POOL_DETAIL,
        payload: {
          ...state?.capacityPoolDetail,
          data: res.data,
        },
      });
    }
    setLoading(false);
  }, [capacityPoolId]);

  const onPoolModalConfirm = useCallback(async (values: any) => {
    const { poolName } = values;
    const params = {
      id: +capacityPoolId!,
      poolName,
    };
    setPoolModalConfirmLoading(true);
    const res = await capacityPoolChange(params);
    setPoolModalConfirmLoading(false);
    if (res.code === 200) {
      setPoolModalOpen(false);
      message.success('Edit Pool successfully!');
      getDetail();
    }
  }, []);

  useEffect(() => {
    getDetail();
  }, [capacityPoolId]);

  // useEffect(() => {
  //   if (reloadAll) {
  //     getDetail();
  //   }
  // }, [reloadAll]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_CAPACITY_DETAIL_RELOAD, () => {
      getDetail();
    });

    return unsubscribe;
  }, []);
  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          {/*top function btn*/}
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  disabled={!!searchParams.get('type')}
                  onClick={() => history.back()}
                >
                  Back
                </Button>
              </div>
              {/* <div className={styles.header_top_right}>
                <Access
                  accessible={
                    access[
                      PermissionEnum.CAPACITY_POOL_DETAIL_EDIT_CAPACITY_POOL
                    ]
                  }
                >
                  <Button type="primary" onClick={handleEditCapcity}>
                    Edit Capacity
                  </Button>
                </Access>
              </div> */}
            </div>
          </Affix>
          {/*info detail*/}
          <CustomDetailHeader
            defaultExpand={true}
            titleList={[{ label: 'Pool Name', value: detail.poolName }]}
            titleExtra={
              <Access
                accessible={access[PermissionEnum.CAPACITY_POOL_DETAIL_EDIT]}
              >
                <Button
                  type="link"
                  onClick={() => {
                    setPoolModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={6}>
                    <ColCell label="Project Name" value={detail?.projectName} />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Customer" value={detail?.customerName} />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Tag" value={detail?.customerTag} />
                  </Col>

                  <Col span={6}>
                    <ColCell
                      label="Approved Vendors"
                      value={
                        formatAmount(detail?.approvedVendors)
                          ? formatAmount(detail?.approvedVendors)
                          : 0
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Approved Trucks"
                      value={
                        formatAmount(detail?.approvedTrucks)
                          ? formatAmount(detail?.approvedTrucks)
                          : 0
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Approved Crew"
                      value={
                        formatAmount(detail?.approvedCrews)
                          ? formatAmount(detail?.approvedCrews)
                          : 0
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <ColCell
                      label="Creation time"
                      value={detail?.creationTime}
                    />
                  </Col>
                </Row>
              </>
            }
          />
        </div>
      </Spin>
      <PoolModal
        title={'Edit Pool'}
        isEdit={true}
        record={{
          poolName: state?.capacityPoolDetail?.data?.poolName,
          projectId: state?.capacityPoolDetail?.data?.projectId,
          projectName: state?.capacityPoolDetail?.data?.projectName,
        }}
        open={poolModalOpen}
        onConfirm={onPoolModalConfirm}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            setPoolModalOpen(false);
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: poolModalConfirmLoading,
          },
        }}
      />
      <TruckTransferModal />
    </>
  );
});
