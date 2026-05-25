import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  claimCancel,
  claimComplete,
  claimConfirm,
  claimDetail,
  claimExportDM,
  claimOCConfirm,
  claimOngoingValidation,
  claimVendorDisputed,
} from '@/api/claim';
import { IClaimDetail, IClaimListRecord } from '@/api/types/claims';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { ClaimTicketTabKey, GetUserGuidanceEnum } from '@/enums';
import { EnumClaimOcStatus } from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { openNewTag } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { ProSkeleton } from '@ant-design/pro-components';
import { Access, useAccess, useModel } from '@umijs/max';
import { Affix, App, Button, Flex, Popconfirm, Typography } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import queryString from 'query-string';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import RefundTicketModal from '../../RefundTicket/components/RefundTicketModal';
import DetailBasicInfo from './components/DetailBasicInfo';
import DetailDescription from './components/DetailDescription';
import DetailList from './components/DetailList';
import DetailLog from './components/DetailLog';
import DetailStatusInfo from './components/DetailStatusInfo';
import { EventBus } from './eventBus';
import {
  linkedArOrAp,
  linkedClaimRequest,
  showCancelTicket,
  showCompleted,
  showConfirm,
  showCreateRefund,
  showExportDM,
  showOCConfirm,
  showOngoingValidation,
  showVendorDisputed,
} from './permission';

const { Text } = Typography;

let controller: AbortController | undefined;

const ClaimDetail: FC = () => {
  const access = useAccess();
  const { initialState, setInitialState } = useModel('@@initialState');
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const { subscribe, publish } = useContext(PubSubContext);
  const { message, modal } = App.useApp();
  const [, setUrlState] = useUrlState();
  const [detail, setDetail] = useState<IClaimDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [ticketNumberValue, setTicketNumberValue] =
    useState<DefaultOptionType>();
  const [createRefundTicketModalOpen, setCreateRefundTicketModalOpen] =
    useState<boolean>(false);
  const [canceling, setCanceling] = useState(false);
  const [ongoingValidating, setOngoingValidating] = useState(false);
  const [vendorDisputing, setVendorDisputing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);
  const playStar = useAddAnimation(playSrcRef, playTargetRef);

  const playAnimation = () => {
    playStar(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const guidanceUpdateHandle = async () => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const fetchDetail = async (initial?: boolean) => {
    const currentQuery = queryString.parse(location.search);
    const { id } = currentQuery;

    if (!id) {
      message.error('Claim Ticket ID is required');
    }

    if (controller) {
      controller?.abort?.();
    }
    controller = new AbortController();
    const { signal } = controller;

    setDetailLoading(true);
    const res = await claimDetail({ id: Number(id) }, signal).finally(() => {
      setDetailLoading(false);
    });

    if (res.code === 200) {
      setDetail(res.data);

      if (initial) {
        setTicketNumberValue({
          id: res.data.id,
          name: res.data.ticketNumber,
          value: res.data.ticketNumber,
        });
      }
    }
  };

  const onRecordClick = async (record: IClaimListRecord) => {
    setUrlState({ id: record.id });
    fetchDetail();
  };

  const reload = () => {
    publish(EventBus.EDIT_OC_STATUS_SUCCESS);
  };

  const doCancel = async () => {
    const currentQuery = queryString.parse(location.search);

    setCanceling(true);
    const res = await claimCancel({
      id: Number(currentQuery.id),
    }).finally(() => {
      setCanceling(false);
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        message.success('Claim Ticket Canceled Success');
        reload();
      } else if (res.data.code === 2) {
        const { refundList } = res.data.customParam ?? {};
        console.log({ refundList });

        modal.warning({
          title: 'The ticket cannot be canceled directly. ',
          content: (
            <>
              <div>
                <Text>This ticket is associated Refund Ticket</Text>
              </div>
              <div>
                <Text>
                  Please remove the association of this ticket from the refund
                  ticket, and then try to cancel it.
                </Text>
              </div>
              <div>
                {refundList?.map((item: any) => (
                  <div key={item.id}>
                    <Text
                      underline
                      style={{
                        color: 'var(--primary-color)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${item.id}`,
                        );
                      }}
                    >
                      {item.ticketNumber}
                    </Text>
                  </div>
                ))}
              </div>
            </>
          ),
        });
      } else {
        message.error(res.data.msg);
      }
    }
  };

  const doOngoingValidation = async () => {
    const currentQuery = queryString.parse(location.search);

    setOngoingValidating(true);
    const res = await claimOngoingValidation({
      id: Number(currentQuery.id),
    }).finally(() => {
      setOngoingValidating(false);
    });
    if (res.code === 200) {
      message.success('Claim Ticket Ongoing Validation Success');
      reload();
    }
  };

  const doVendorDisputed = async () => {
    const currentQuery = queryString.parse(location.search);

    setVendorDisputing(true);
    const res = await claimVendorDisputed({
      id: Number(currentQuery.id),
    }).finally(() => {
      setVendorDisputing(false);
    });
    if (res.code === 200) {
      message.success('Claim Ticket Vendor Disputed Success');
      reload();
    }
  };

  const doExportDM = async () => {
    const currentQuery = queryString.parse(location.search);

    setExporting(true);
    const res = await claimExportDM({ id: Number(currentQuery.id) }).finally(
      () => {
        setExporting(false);
      },
    );

    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  };

  const doConfirm = async () => {
    const currentQuery = queryString.parse(location.search);

    setConfirming(true);
    const res = await claimConfirm({
      id: Number(currentQuery.id),
    }).finally(() => {
      setConfirming(false);
    });
    if (res.code === 200) {
      message.success('Claim Ticket Confirmed Success');
      reload();
    }
  };

  const doOCConfirm = async () => {
    const currentQuery = queryString.parse(location.search);

    setConfirming(true);
    const res = await claimOCConfirm({
      id: Number(currentQuery.id),
    }).finally(() => {
      setConfirming(false);
    });
    if (res.code === 200) {
      message.success('Claim Ticket Confirmed Success');
      reload();
    }
  };

  const doCompleted = async () => {
    const currentQuery = queryString.parse(location.search);

    setCompleting(true);
    const res = await claimComplete({
      id: Number(currentQuery.id),
    }).finally(() => {
      setCompleting(false);
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        message.success('Claim Ticket Completed Success');
        reload();
      } else {
        message.error(res.data.msg);
      }
    }
  };

  useEffect(() => {
    fetchDetail(true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(EventBus.EDIT_OC_STATUS_SUCCESS, () => {
      fetchDetail();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    playTargetRef.current = document.querySelector('.downloadCenter');
  }, []);

  if (!detail) return null;

  return (
    <>
      <section>
        <BreadcrumbCase
          items={[
            {
              name: 'Claim Ticket',
              path: `${PATHS.CLAIM_TICKET_LIST}?type=${ClaimTicketTabKey.CLAIM_TICKET}`,
            },
            {
              name: 'Claim Ticket Details',
              path: PATHS.CLAIM_TICKET_LIST_DETAIL,
            },
          ]}
        />
      </section>

      <section style={{ marginTop: '-8px', background: 'rgba(0, 0, 0, 0.06)' }}>
        <Flex gap={1}>
          <div style={{ width: 360, flexShrink: 0 }}>
            <DetailList
              ticketNumberValue={ticketNumberValue}
              onRecordClick={onRecordClick}
            />
          </div>

          <div style={{ flex: 'auto' }}>
            {detailLoading ? (
              <ProSkeleton type="descriptions" pageHeader={false} />
            ) : (
              <>
                <div
                  style={{
                    padding: '0 12px',
                    paddingBottom: '12px',
                    background: '#fff',
                  }}
                >
                  <DetailBasicInfo detail={detail} />
                  <DetailDescription detail={detail} />
                  <DetailStatusInfo detail={detail} />
                  <DetailLog detail={detail} />
                </div>
                <Affix offsetBottom={0}>
                  <Flex
                    gap={10}
                    style={{
                      padding: '8px 12px',
                      borderTop: '1px solid #e8e8e8',
                      background: '#fff',
                    }}
                  >
                    <Access
                      accessible={
                        access[PermissionEnum.CLAIM_TICKET_DETAIL_CREATE_REFUND]
                      }
                    >
                      {showCreateRefund(detail) && (
                        <Button
                          onClick={() => {
                            setCreateRefundTicketModalOpen(true);
                          }}
                        >
                          Create Refund
                        </Button>
                      )}
                    </Access>

                    <Access
                      accessible={
                        access[PermissionEnum.CLAIM_TICKET_DETAIL_CANCEL_TICKET]
                      }
                    >
                      {showCancelTicket(detail) && (
                        <>
                          {linkedClaimRequest(detail) ? (
                            <Popconfirm
                              title="Warning"
                              description={
                                <>
                                  <div>
                                    Tickets created by AR cannot be canceld.
                                  </div>
                                  <div>
                                    Please contact the PD team for assistance.
                                  </div>
                                </>
                              }
                              showCancel={false}
                              trigger="hover"
                            >
                              <Button disabled>Cancel Ticket</Button>
                            </Popconfirm>
                          ) : (
                            <>
                              {linkedArOrAp(detail) ? (
                                <Popconfirm
                                  title="Warning"
                                  description={'Should the ticket be canceled?'}
                                  trigger="hover"
                                  onConfirm={() => doCancel()}
                                >
                                  <Button loading={canceling}>
                                    Cancel Ticket
                                  </Button>
                                </Popconfirm>
                              ) : (
                                <Button
                                  loading={canceling}
                                  onClick={() => doCancel()}
                                >
                                  Cancel Ticket
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </Access>

                    <Access
                      accessible={
                        access[
                          PermissionEnum.CLAIM_TICKET_DETAIL_ONGOING_VALIDATION
                        ]
                      }
                    >
                      {showOngoingValidation(detail) && (
                        <Button
                          loading={ongoingValidating}
                          onClick={() => doOngoingValidation()}
                        >
                          Ongoing Validation
                        </Button>
                      )}
                    </Access>

                    <Access
                      accessible={
                        access[
                          PermissionEnum.CLAIM_TICKET_DETAIL_VENDOR_DISPUTED
                        ]
                      }
                    >
                      {showVendorDisputed(detail) && (
                        <Button
                          loading={vendorDisputing}
                          onClick={() => doVendorDisputed()}
                        >
                          Vendor Disputed
                        </Button>
                      )}
                    </Access>

                    <Access
                      accessible={
                        access[PermissionEnum.CLAIM_TICKET_DETAIL_EXPORT_DM]
                      }
                    >
                      {showExportDM(detail) && (
                        <Button
                          ref={playSrcRef}
                          loading={exporting}
                          onClick={() => {
                            if (completedGuidance) {
                              doExportDM();
                            } else {
                              playAnimation();
                              guidanceUpdateHandle();
                              doExportDM();
                            }
                          }}
                        >
                          Export DM
                        </Button>
                      )}
                    </Access>

                    <Access
                      accessible={
                        access[PermissionEnum.CLAIM_TICKET_DETAIL_CONFIRM]
                      }
                    >
                      {showConfirm(detail) && (
                        <Button
                          type="primary"
                          loading={confirming}
                          onClick={() => doConfirm()}
                        >
                          Confirm
                        </Button>
                      )}
                    </Access>
                    <Access
                      accessible={
                        access[PermissionEnum.CLAIM_TICKET_DETAIL_OC_CONFIRM]
                      }
                    >
                      {showOCConfirm(detail) &&
                        detail.ocStatus !==
                          EnumClaimOcStatus.Ongoing_Validation && (
                          <Button
                            type="primary"
                            loading={confirming}
                            onClick={() => doOCConfirm()}
                          >
                            Confirm
                          </Button>
                        )}
                    </Access>

                    <Access
                      accessible={
                        access[PermissionEnum.CLAIM_TICKET_DETAIL_COMPLETED]
                      }
                    >
                      {showCompleted(detail) && (
                        <Button
                          type="primary"
                          loading={completing}
                          onClick={() => doCompleted()}
                        >
                          Completed
                        </Button>
                      )}
                    </Access>
                  </Flex>
                </Affix>
              </>
            )}
          </div>
        </Flex>
      </section>
      <RefundTicketModal
        disabledLinkedClaim={true}
        linkedClaimId={detail.id}
        open={createRefundTicketModalOpen}
        onCancel={() => setCreateRefundTicketModalOpen(false)}
        onSuccess={() => {
          setCreateRefundTicketModalOpen(false);
          reload();
        }}
      />
    </>
  );
};

export default ClaimDetail;
