import { checkUnderReview } from '@/api/application';
import { crewActivateCheck, crewApproval, crewDetail } from '@/api/crew';
import { ICrewDetail, ICrewListVendorRecord } from '@/api/types/crew';
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
  CrewStatusEnum,
  CrewStatusEnumColor,
  CrewTypeEnum,
  TruckTransportationStatusEnum,
  TruckTransportationStatusEnumColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { openNewTag } from '@/utils/utils';
import { ArrowLeftOutlined, ShopOutlined } from '@ant-design/icons';
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
import CrewAttributionModal from '../CrewAttributionModal';
import CrewModal from '../CrewModal';
import ActivateModal from './ActivateModal';
import ApprovalMarkModal from './ApprovalMarkModal';
import BlockModal from './BlockModal';
import DeactivateModal from './DeactivateModal';
import styles from './styles.less';

export default memo(function VendorTruckDetailHeader(props: {
  detailRefresh: boolean;
  detailCallback: (detail: ICrewDetail) => void;
}) {
  const { detailRefresh, detailCallback } = props;
  const { message } = App.useApp();
  const access = useAccess();
  const [searchParams] = useSearchParams();
  const { id: crewId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showApprovalOpen, setShowApprovalOpen] = useState<boolean>(false);
  const [deactivateModalOpen, setDeactivateModalOpen] =
    useState<boolean>(false);
  const [activateModalOpen, setActivateModalOpen] = useState<boolean>(false);

  const [vendorList, setVendorList] = useState<ICrewListVendorRecord[]>([]);
  const [showApprovalLoading, setShowApprovalLoading] =
    useState<boolean>(false);
  const [showAttributionModal, setShowAttributionModal] =
    useState<boolean>(false);
  const [detail, setDetail] = useState<ICrewDetail>({} as ICrewDetail);
  const [approvalRecord, setApprovalRecord] = useState<{
    id: number;
    number: string;
    type: string;
  }>();

  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    const res = await crewDetail({
      id: Number(crewId),
    });
    setLoading(false);
    if (res.code === 200) {
      setDetail(res.data);
      detailCallback(res.data);
      setVendorList(res.data.vendorList);
    }
  };

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await procurementLog({
      entityId: Number(crewId),
      entityType: ApplicationTypeEnum.CREW,
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
  }, [crewId]);

  useEffect(() => {
    getDetail();
  }, [detailRefresh]);

  const editHandle = () => {
    setShowAddModal(true);
  };

  const attributionHandle = () => {
    setShowAttributionModal(true);
  };

  const deactivateHandle = () => {
    setDeactivateModalOpen(true);
  };
  const onActivateHandle = () => {
    setActivateModalOpen(true);
  };

  const handleActivateOrApproval = async (type: 'Activate' | 'Approval') => {
    setShowApprovalLoading(true);
    const res = await checkUnderReview({
      type: ApplicationTypeEnum.CREW,
      bizIdentifier: detail.idNumber,
    });

    if (res.code === 200) {
      const record = res.data;
      if (record) {
        setShowApprovalOpen(true);
        setApprovalRecord({ ...record, type });
        setShowApprovalLoading(false);
      } else {
        if (type === 'Approval') {
          const approvalRes = await crewApproval(Number(crewId)).finally(() => {
            setShowApprovalLoading(false);
          });
          if (approvalRes.code === 200) {
            message.success(`Approval successfully!`);
            getDetail();
          }
        } else if (type === 'Activate') {
          const activateRes = await crewActivateCheck(Number(crewId)).finally(
            () => {
              setShowApprovalLoading(false);
            },
          );
          if (activateRes.code === 200) {
            setActivateModalOpen(true);
          }
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
                  accessible={access[PermissionEnum.CREW_DETAIL_DEACTIVATE]}
                >
                  {detail.status === CrewStatusEnum.ACCREDITED ? (
                    <Button
                      style={{ color: '#000', borderColor: '#D9D9D9' }}
                      onClick={deactivateHandle}
                      // loading={deactivateLoading}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                </Access>

                <Access
                  key="Activate"
                  accessible={access[PermissionEnum.CREW_DETAIL_ACTIVATE]}
                >
                  {detail.status === CrewStatusEnum.INACTIVE ? (
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
                  key="Block"
                  accessible={access[PermissionEnum.CREW_DETAIL_BLOCK]}
                >
                  {detail?.status &&
                  detail?.status !== CrewStatusEnum.BLOCKED ? (
                    <Button
                      danger
                      onClick={() => {
                        setBlockModalOpen(true);
                      }}
                    >
                      Block
                    </Button>
                  ) : null}
                </Access>

                <Access
                  key="Attribution"
                  accessible={access[PermissionEnum.CREW_DETAIL_ATTRIBUTION]}
                >
                  {detail?.status !== CrewStatusEnum.BLOCKED ? (
                    <Button
                      onClick={attributionHandle}
                      style={{ color: '#009688', borderColor: '#009688' }}
                    >
                      Attribution
                    </Button>
                  ) : null}
                </Access>

                <Access
                  key="AccreditationApproval"
                  accessible={
                    access[PermissionEnum.CREW_DETAIL_ATTRIBUTION_APPROVAL]
                  }
                >
                  {detail.status === CrewStatusEnum.UNACCREDITED ? (
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
            titleList={[{ label: 'Crew Name', value: detail.name }]}
            titleExtra={
              <Access accessible={access[PermissionEnum.CREW_DETAIL_EDIT]}>
                {detail.status !== CrewStatusEnum.BLOCKED ? (
                  <Button type="link" onClick={() => editHandle()}>
                    Edit
                  </Button>
                ) : null}
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Accreditation Status"
                      value={
                        <Badge
                          color={
                            CrewStatusEnumColor[detail.status as CrewStatusEnum]
                          }
                          text={detail.status}
                        />
                      }
                    />
                  </Col>
                  <Col span={8}>
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
                  <Col span={8}>
                    <ColCell label="ID No." value={detail.idNumber} />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Type"
                      value={`${detail?.driverFlag ? CrewTypeEnum.DRIVER : ''} ${detail?.driverFlag && detail?.helperFlag ? ',' : ''} ${detail?.helperFlag ? CrewTypeEnum.HELPER : ''}`}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="License No." value={detail.licenseNumber} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Contact"
                      value={`${detail?.phoneCode} ${detail?.phoneNum}`}
                    />
                  </Col>
                </Row>
              </>
            }
          />
        </div>
        {detail?.vendorList?.length ? (
          <>
            <div className={styles.vendor}>
              <ShopOutlined className={styles.vendorIcon} />
              <div className={styles.vendorContent}>
                <div className={styles.vendorItem}>
                  <div className={styles.vendorLabel}>Vendor Name</div>
                  <div className={styles.vendorLabel}>Vendor Tag</div>
                </div>
                {detail?.vendorList?.map((v: any) => (
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
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {showApprovalOpen ? (
          <ApprovalMarkModal
            id={Number(crewId)}
            record={approvalRecord!}
            onActivateOpenHandle={() => {
              onActivateHandle();
            }}
            hideModal={() => {
              setShowApprovalOpen(false);
            }}
            refresh={getDetail}
          />
        ) : null}
        {showAddModal ? (
          <CrewModal
            record={detail}
            hideModal={() => {
              setShowAddModal(false);
            }}
            refresh={getDetail}
          />
        ) : null}
        {showAttributionModal ? (
          <CrewAttributionModal
            //@ts-ignore
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
        {deactivateModalOpen && (
          <DeactivateModal
            open={deactivateModalOpen}
            onCancel={() => setDeactivateModalOpen(false)}
            onRefresh={getDetail}
          />
        )}
        {activateModalOpen && (
          <ActivateModal
            open={activateModalOpen}
            onCancel={() => setActivateModalOpen(false)}
            onRefresh={() => {
              getDetail();
              setShowApprovalOpen(false);
            }}
          />
        )}
      </Spin>

      <BlockModal
        open={blockModalOpen}
        onCancel={() => setBlockModalOpen(false)}
        onSuccess={() => {
          setBlockModalOpen(false);
          getDetail();
        }}
      />
    </>
  );
});
