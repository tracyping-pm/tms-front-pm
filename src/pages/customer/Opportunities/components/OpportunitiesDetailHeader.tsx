import {
  opportunityDetail,
  opportunityDetailRecord,
  opportunityEdit,
} from '@/api/opportunity';
import { IFollowUpListVisitRecordReq } from '@/api/types/followUp';
import {
  IOpportunityDetailData,
  IOpportunityDetailRecord,
  IOpportunityDetailRecordItem,
  IOpportunityRecord,
} from '@/api/types/opportunity';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import {
  FollowUpCheckEnum,
  OpportunitiesStatusEnum,
  OpportunitiesStatusEnumColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { formatAmount, openNewTag } from '@/utils/utils';
import {
  AlertOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Access, history, useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Badge, Button, Col, Row, Spin, Steps, message } from 'antd';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EVENT_OPPORTUNITY_RECORD_RELOAD } from '../event';
import { OPS_TYPE, StateContext } from '../store';
import OpportunitiesAddModal from './OpportunitiesAddModal';
import FollowingUpModal from './followingUp/FollowingUpModal';
import { SHOW_OPPORTUNITY_DETAIL_FOLLOW_UP_STATUS_LIST } from './followingUp/support';
import styles from './styles.less';
import VisitDetailModal from './visitDetail/VisitDetailModal';

interface IVisitDetailModalState {
  open: boolean;
  record: IFollowUpListVisitRecordReq;
}

const DEFAULT_VISIT_MODAL_STATE: IVisitDetailModalState = {
  open: false,
  record: {} as IFollowUpListVisitRecordReq,
};

export default memo(function OpportunitiesDetailHeader() {
  const access = useAccess();
  const { publish } = useContext(PubSubContext);
  const { id } = useParams();
  // @ts-ignore
  const { dispatch } = useContext(StateContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [followingUpModalOpen, setFollowingUpModalOpen] = useState(false);
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);
  const [confirmOpportunityLoading, setConfirmOpportunityLoading] =
    useState<boolean>(false);
  const [visitDetailModalState, setVisitDetailModalState] =
    useSetState<IVisitDetailModalState>(DEFAULT_VISIT_MODAL_STATE);
  const [recordTime, setRecordTime] = useState<IOpportunityDetailRecord>(
    {} as IOpportunityDetailRecord,
  );
  const [detail, setDetail] = useState<IOpportunityDetailData>(
    {} as IOpportunityDetailData,
  );

  const getRecordDetail = async () => {
    setLoading(true);
    const recordRes = await opportunityDetailRecord(Number(id)).finally(() => {
      setLoading(false);
    });
    if (recordRes.code === 200) {
      setRecordTime(recordRes.data);
    }
  };

  const getDetail = async () => {
    setLoading(true);
    setDetailLoading(true);
    const [recordRes, detailRes] = await Promise.all([
      opportunityDetailRecord(Number(id)),
      opportunityDetail(Number(id)),
    ]).finally(() => {
      setLoading(false);
      setDetailLoading(false);
    });
    if (recordRes.code === 200) {
      setRecordTime(recordRes.data);
    }
    if (detailRes.code === 200) {
      setDetail(detailRes.data);
      dispatch({
        type: OPS_TYPE.OPPORTUNITY_DETAIL,
        payload: {
          data: detailRes.data,
        },
      });
    }
  };

  const handleItemClick = useCallback(
    (item: IOpportunityDetailRecordItem) => {
      setVisitDetailModalState({
        open: true,
        record: {
          opportunityId: Number(id),
          opportunityStatus: item.opportunityStatus,
        },
      });
    },
    [id],
  );

  const StatusIcon = (status: any) => {
    switch (status) {
      case 'Normal':
        return (
          <div className={styles.header_process_finish}>
            <CheckOutlined style={{ fontSize: '16px' }} />
          </div>
        );
      case 'Cancelled':
        return (
          <div className={styles.header_process_cancel}>
            <CloseOutlined style={{ fontSize: '16px', color: '#fff' }} />
          </div>
        );
      case 'Overtime':
        return (
          <div className={styles.header_process_error}>
            <AlertOutlined style={{ fontSize: '16px', color: '#FFF' }} />
          </div>
        );
    }
  };

  const STEPS_ITEMS = useMemo(() => {
    return recordTime?.timeLineVos?.map((item) => {
      return {
        title: (
          <CustomTooltip title={item.opportunityStatus} placement="top">
            <div className={styles.header_process_title}>
              {item.opportunityStatus}
            </div>
          </CustomTooltip>
        ),
        status:
          item.followUpCheck === FollowUpCheckEnum.OVERTIME
            ? 'error'
            : 'finish',
        icon: StatusIcon(item.followUpCheck),
        description: (
          <div>
            <div className={styles.header_process_desc}>
              {item.latestFollowUpDate}
            </div>
            {!!item.visitRecordCount ? (
              <div
                className={styles.header_process_jump}
                onClick={() => handleItemClick(item)}
              >
                {`${item.visitRecordCount} Visit Record`}
                <RightOutlined />
              </div>
            ) : null}
          </div>
        ),
      };
    });
  }, [recordTime]);

  const onEditModalConfirm = async (values: IOpportunityRecord) => {
    setConfirmOpportunityLoading(true);
    const res = await opportunityEdit(values);
    setConfirmOpportunityLoading(false);
    if (res.code === 200) {
      message.success('Edit Opportunity successfully!');
      setOpportunityModalOpen(false);
      publish(EVENT_OPPORTUNITY_RECORD_RELOAD);
      getDetail();
    }
  };

  useEffect(() => {
    getDetail();
  }, []);

  return (
    <>
      <div className={styles.header}>
        {/* header btn */}
        <div className={styles.header_top}>
          <div className={styles.header_top_left}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => history.push(PATHS.OPPORTUNITIES_LIST)}
            >
              Back
            </Button>
          </div>
          <div className={styles.header_top_right}>
            <Access
              accessible={access[PermissionEnum.OPPORTUNITY_DETAIL_FOLLOW_UP]}
            >
              {SHOW_OPPORTUNITY_DETAIL_FOLLOW_UP_STATUS_LIST.includes(
                detail.opportunityStatus,
              ) && (
                <Button
                  onClick={() => {
                    setFollowingUpModalOpen(true);
                  }}
                >
                  Follow Up
                </Button>
              )}
            </Access>
            <Access
              accessible={
                access[PermissionEnum.OPPORTUNITY_DETAIL_ASSOCIATED_PROJECT]
              }
            >
              {!!recordTime.successfulClosed ? (
                <Button
                  type="primary"
                  onClick={() =>
                    openNewTag(
                      `${PATHS.PROJECT_DETAIL_BASE}/${recordTime.projectId}?type=blank`,
                    )
                  }
                >
                  Associated Project
                </Button>
              ) : null}
            </Access>
          </div>
        </div>
        {/* header progress */}
        <div className={styles.header_process}>
          <Spin spinning={loading}>
            <Steps
              style={{ width: '100%' }}
              current={recordTime?.timeLineVos?.length}
              // @ts-ignore
              items={STEPS_ITEMS}
            />
          </Spin>
        </div>
        {/* header info */}
        <div className={styles.header_info}>
          <DetailCard
            title="Opportunities Information"
            editCallback={() => {
              setOpportunityModalOpen(true);
            }}
            loading={detailLoading}
            showEditBtn={
              access[PermissionEnum.OPPORTUNITY_DETAIL_EDIT] &&
              ![
                OpportunitiesStatusEnum.SUCCESSFUL_CLOSED,
                OpportunitiesStatusEnum.LOST,
                OpportunitiesStatusEnum.CANCELED,
              ].includes(detail.opportunityStatus)
            }
            hideBorder={true}
            child={
              <div
                style={{
                  border: '0.5px solid #f0f0f0',
                  borderRight: 'none',
                  borderBottom: 'none',
                }}
              >
                <Row>
                  <Col span={6}>
                    <ColCell label="Project Name" value={detail.projectName} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="opportunity status"
                      value={
                        <Badge
                          color={
                            OpportunitiesStatusEnumColor[
                              detail.opportunityStatus
                            ]
                          }
                          text={detail.opportunityStatus}
                        />
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="BU" value={detail.bu} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Requirement Type"
                      value={detail.requirementType}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Current Requirement"
                      value={
                        detail?.currentRequirementList?.length > 0 ? (
                          <div>
                            {detail.currentRequirementList.map((item) => (
                              <div key={item}>{item}</div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Potential Requirement"
                      value={
                        detail?.potentialRequirementList?.length > 0 ? (
                          <div>
                            {detail.potentialRequirementList.map((item) => (
                              <div key={item}>{item}</div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Procurement PIC" value={detail.vdPic} />
                  </Col>

                  <Col span={6}>
                    <ColCell
                      label="Opportunity Content"
                      value={detail.opportunityContentList?.join(',') ?? '-'}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Requirement Frequency"
                      value={detail.requirementFrequency}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Distance" value={detail.distance} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Potential Volume"
                      value={
                        detail?.potentialVolumeQuantity
                          ? `${formatAmount(detail.potentialVolumeQuantity)} / ${
                              detail.potentialVolumeFrequency
                            }`
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Quotation Request Received Date"
                      value={detail.quotationRequestReceivedDate}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="RFQ submit date"
                      value={detail.quotationSubmittedDate}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="RFQ Deadline date"
                      value={detail.rfqBiddingDeadlineDate}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="PIC"
                      value={`${detail.picType}:${detail.picUserAliasName}`}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Strategy PIC" value={detail.pricingPic} />
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <ColCell
                      label="Service Truck"
                      value={detail.serviceTruckTypeNames}
                    />
                  </Col>
                </Row>
              </div>
            }
          />
        </div>
      </div>
      <FollowingUpModal
        open={followingUpModalOpen}
        id={Number(id)}
        onCancel={() => setFollowingUpModalOpen(false)}
        onConfirm={() => {
          setFollowingUpModalOpen(false);
          publish(EVENT_OPPORTUNITY_RECORD_RELOAD);
          getRecordDetail();
          getDetail();
        }}
      />
      <VisitDetailModal
        open={visitDetailModalState.open}
        record={visitDetailModalState.record}
        onCancel={() => setVisitDetailModalState({ open: false })}
      />
      {opportunityModalOpen ? (
        <OpportunitiesAddModal
          open={opportunityModalOpen}
          record={detail}
          onConfirm={onEditModalConfirm}
          modalProps={{
            maskClosable: false,
            okText: 'Confirm',
            onCancel: () => {
              setOpportunityModalOpen(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: confirmOpportunityLoading,
            },
          }}
        />
      ) : null}
    </>
  );
});
