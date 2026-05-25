import { checkUnderReview } from '@/api/application';
import {
  checkTruckDeactivate,
  getTruckDetail,
  getTruckVendors,
  truckActivate,
  truckApproval,
  truckDeactivate,
} from '@/api/truck';
import {
  IAddTruckParams,
  ITruckDetailData,
  ITruckVendorListItem,
} from '@/api/types/truck';
import { procurementLog } from '@/api/vendor';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import OperationLogModal, {
  initialOperationLogModalState,
  IOperationLogModalState,
} from '@/components/OperationLogModal';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import {
  ApplicationTypeEnum,
  TruckTransportationStatusEnum,
  TruckTransportationStatusEnumColor,
  VendorTruckStatusEnum,
  VendorTruckStatusEnumColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import TruckAttributionModal from '@/pages/vendor/components/TruckAttributionModal';
import TruckModal from '@/pages/vendor/components/TruckModal';
import styles from '@/pages/vendor/components/VendorTruckDetailHeader/styles.less';
import { formatAmount, openNewTag } from '@/utils/utils';
import {
  ArrowLeftOutlined,
  ExclamationCircleFilled,
  ShopOutlined,
} from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { useSetState } from 'ahooks';
import { Affix, App, Badge, Button, Col, Row, Spin } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import ApprovalMarkModal from './ApprovalMarkModal';

export default memo(function VendorTruckDetailHeader(props: {
  detailRefresh: boolean;
}) {
  const { detailRefresh } = props;
  const { message, modal } = App.useApp();
  const access = useAccess();
  const [searchParams] = useSearchParams();
  const { id: truckId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showApprovalOpen, setShowApprovalOpen] = useState<boolean>(false);
  const [deactivateLoading, setDeactivateLoading] = useState<boolean>(false);
  const [showApprovalLoading, setShowApprovalLoading] =
    useState<boolean>(false);
  const [showAttributionModal, setShowAttributionModal] =
    useState<boolean>(false);
  const [formDefaultValue, setFormDefaultValue] =
    useState<IAddTruckParams | null>(null);
  const [detail, setDetail] = useState<ITruckDetailData>(
    {} as ITruckDetailData,
  );
  const [vendorList, setVendorList] = useState<ITruckVendorListItem[]>([]);
  const [approvalRecord, setApprovalRecord] = useState<{
    id: number;
    number: string;
    type: string;
  }>();

  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const getDetail = async () => {
    setLoading(true);
    const [res, bindRes] = await Promise.all([
      getTruckDetail({
        id: Number(truckId),
      }),
      getTruckVendors({
        id: Number(truckId),
      }),
    ]);
    setLoading(false);
    if (res.code === 200) {
      setDetail(res.data);
    }
    if (bindRes.code === 200) {
      setVendorList(bindRes.data);
    }
  };

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await procurementLog({
      entityId: Number(truckId),
      entityType: ApplicationTypeEnum.TRUCK,
    }).finally(() => {
      setOperationLogModalState({ loading: false });
    });
    if (res.code === 200) {
      const list =
        res.data?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          description: item.description,
          operator: item.operator,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, [truckId]);

  useEffect(() => {
    getDetail();
  }, [detailRefresh]);

  const editHandle = () => {
    setFormDefaultValue({
      id: detail.id,
      plateNumber: detail.plateNumber,
      truckType: detail.truckType,
      vanType: detail.vanType,
      registrationNumber: detail.registrationNumber,
      grossCapacity: detail.grossCapacity,
      netCapacity: detail.netCapacity,
      volume: detail.volume,
      model: detail.model,
      vendorId: detail.vendorId,
      vendorName: detail.vendorName,
      codingDay: detail.codingDay,
      ownership: detail.ownership,
    });
    setShowAddModal(true);
  };

  const attributionHandle = () => {
    setShowAttributionModal(true);
  };

  const deactivateHandle = async () => {
    setDeactivateLoading(true);
    const check = await checkTruckDeactivate({ id: Number(truckId) });
    setDeactivateLoading(false);
    let str = '';
    if (check.code === 200) {
      if (check.data) {
        str = 'Confirm to deactivate this truck!';
      } else {
        str =
          'Confirm to deactivate the truck which participated in the active project!';
      }
    }
    modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleFilled />,
      content: str,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await truckDeactivate({
          id: Number(truckId),
        });
        if (res.code === 200) {
          message.success(`Deactivate successfully!`);
          getDetail();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  };

  const handleActivateOrApproval = async (type: 'Activate' | 'Approval') => {
    setShowApprovalLoading(true);
    const res = await checkUnderReview({
      type: ApplicationTypeEnum.TRUCK,
      bizIdentifier: detail.plateNumber,
    });

    if (res.code === 200) {
      const record = res.data;
      if (record) {
        setShowApprovalOpen(true);
        setApprovalRecord({ ...record, type });
        setShowApprovalLoading(false);
      } else {
        const approvalRes =
          type === 'Approval'
            ? await truckApproval({
                id: Number(truckId),
              })
            : await truckActivate({ id: Number(truckId) });
        setShowApprovalLoading(false);
        if (approvalRes.code === 200) {
          message.success(`${type} successfully!`);
          getDetail();
        }
      }
    } else {
      setShowApprovalLoading(false);
    }
  };

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            {/*top function btn*/}
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
              <div className={styles.header_top_right}>
                <Button
                  onClick={fetchLogList}
                  loading={operationLogModalState.loading}
                >
                  Operation Log
                </Button>
                <Access
                  key="Deactivate"
                  accessible={access[PermissionEnum.TRUCK_DETAIL_DEACTIVATE]}
                >
                  {detail.status === VendorTruckStatusEnum.ACCREDITED ? (
                    <Button
                      style={{ color: '#000', borderColor: '#D9D9D9' }}
                      onClick={deactivateHandle}
                      loading={deactivateLoading}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                </Access>

                <Access
                  key="Activate"
                  accessible={access[PermissionEnum.TRUCK_DETAIL_ACTIVATE]}
                >
                  {detail.status === VendorTruckStatusEnum.INACTIVE ? (
                    <Button
                      onClick={() => {
                        handleActivateOrApproval('Activate');
                      }}
                      type="primary"
                      loading={showApprovalLoading}
                    >
                      Activate
                    </Button>
                  ) : null}
                </Access>

                <Access
                  key="Attribution"
                  accessible={access[PermissionEnum.TRUCK_DETAIL_ATTRIBUTION]}
                >
                  <Button
                    onClick={attributionHandle}
                    style={{ color: '#009688', borderColor: '#009688' }}
                  >
                    Attribution
                  </Button>
                </Access>

                <Access
                  key="AccreditationApproval"
                  accessible={
                    access[PermissionEnum.TRUCK_DETAIL_ATTRIBUTION_APPROVAL]
                  }
                >
                  {detail.status === VendorTruckStatusEnum.UNACCREDITED ? (
                    <Button
                      onClick={() => {
                        handleActivateOrApproval('Approval');
                      }}
                      type="primary"
                      loading={showApprovalLoading}
                    >
                      Accreditation Approval
                    </Button>
                  ) : null}
                </Access>
              </div>
            </div>
          </Affix>

          <CustomDetailHeader
            defaultExpand={true}
            titleList={[{ label: 'Plate Number', value: detail.plateNumber }]}
            titleExtra={
              <Access accessible={access[PermissionEnum.TRUCK_DETAIL_EDIT]}>
                <Button type="link" onClick={() => editHandle()}>
                  Edit
                </Button>
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Accreditation Status"
                      value={
                        <Badge
                          color={
                            VendorTruckStatusEnumColor[
                              detail.status as VendorTruckStatusEnum
                            ]
                          }
                          text={detail.status}
                        />
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Transportation Status"
                      value={
                        detail.transportationStatus ? (
                          <Badge
                            color={
                              TruckTransportationStatusEnumColor[
                                detail.transportationStatus as TruckTransportationStatusEnum
                              ]
                            }
                            text={detail.transportationStatus}
                          />
                        ) : (
                          '-'
                        )
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Truck Type" value={detail.truckTypeName} />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Van Type" value={detail.vanType} />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Registration Number"
                      value={
                        detail.registrationNumber
                          ? detail.registrationNumber
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Model" value={detail.model} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Gross Capacity"
                      value={
                        detail.grossCapacity
                          ? `${formatAmount(detail.grossCapacity)}MT`
                          : 0
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Net Capacity"
                      value={
                        detail.netCapacity
                          ? `${formatAmount(detail.netCapacity)}MT`
                          : 0
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <ColCell
                      label="Volume"
                      value={
                        detail.volume ? `${formatAmount(detail.volume)}CBM` : 0
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <ColCell label="Creation time" value={detail.createdAt} />
                  </Col>
                </Row>
              </>
            }
          />
        </div>

        {vendorList.length ? (
          <>
            <div className={styles.vendor}>
              <ShopOutlined className={styles.vendorIcon} />
              <div className={styles.vendorContent}>
                <div className={styles.vendorItem}>
                  <div className={styles.vendorLabel}>Vendor Name</div>
                  <div className={styles.vendorLabel}>Vendor Tag</div>
                  <div className={styles.vendorLabel}>Ownership</div>
                </div>
                {vendorList.map((v: any) => (
                  <div key={v.id} className={styles.vendorItem}>
                    <div
                      className={styles.vendorItemName}
                      title={v?.vendorName}
                      onClick={() => {
                        openNewTag(`${PATHS.VENDOR_DETAIL}/${v.vendorId}`);
                      }}
                    >
                      <a>{v?.vendorName}</a>
                    </div>
                    <div className={styles.vendorItemName} title={v.vendorTag}>
                      {v?.vendorTag}
                    </div>
                    <div className={styles.vendorItemName} title={v.ownership}>
                      {v?.ownership}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {showApprovalOpen ? (
          <ApprovalMarkModal
            id={Number(truckId)}
            record={approvalRecord!}
            hideModal={() => {
              setShowApprovalOpen(false);
            }}
            refresh={getDetail}
          />
        ) : null}
        {showAddModal ? (
          <TruckModal
            formDefaultValue={formDefaultValue}
            hideModal={() => {
              setShowAddModal(false);
              setFormDefaultValue(null);
            }}
            refresh={getDetail}
          />
        ) : null}
        {showAttributionModal ? (
          <TruckAttributionModal
            vendorList={vendorList}
            hideModal={() => setShowAttributionModal(false)}
            refreshList={() => getDetail()}
          />
        ) : null}
        <OperationLogModal
          showOperator={true}
          list={operationLogModalState.list}
          open={operationLogModalState.open}
          onConfirm={() => setOperationLogModalState({ open: false })}
          onCancel={() => setOperationLogModalState({ open: false })}
        />
      </Spin>
    </>
  );
});
