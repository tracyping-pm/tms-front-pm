import {
  refundCancel,
  refundComplete,
  refundConfirm,
  refundDetail,
  refundOCConfirm,
  refundOngoingValidation,
} from '@/api/claim';
import { IRefundDetail, IRefundListRecord } from '@/api/types/claims';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { ClaimTicketTabKey } from '@/enums';
import { EnumClaimOcStatus } from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import useUrlState from '@ahooksjs/use-url-state';
import { ProSkeleton } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Affix, App, Button, Flex, Popconfirm } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import queryString from 'query-string';
import { FC, useContext, useEffect, useState } from 'react';
import DetailBasicInfo from './components/DetailBasicInfo';
import DetailDescription from './components/DetailDescription';
import DetailList from './components/DetailList';
import DetailLog from './components/DetailLog';
import DetailStatusInfo from './components/DetailStatusInfo';
import { EventBus } from './eventBus';
import {
  linkedArOrAp,
  showCancelTicket,
  showCompleted,
  showConfirm,
  showOCConfirm,
  showOngoingValidation,
} from './permission';

let controller: AbortController | undefined;

const RefundTicketDetail: FC = () => {
  const access = useAccess();
  const { subscribe, publish } = useContext(PubSubContext);
  const { message } = App.useApp();
  const [, setUrlState] = useUrlState();
  const [detail, setDetail] = useState<IRefundDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [ticketNumberValue, setTicketNumberValue] =
    useState<DefaultOptionType>();
  const [canceling, setCanceling] = useState(false);
  const [ongoingValidating, setOngoingValidating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [completing, setCompleting] = useState(false);

  const fetchDetail = async (initial?: boolean) => {
    const currentQuery = queryString.parse(location.search);
    const { id } = currentQuery;

    if (!id) {
      message.error('Refund Ticket ID is required');
    }

    if (controller) {
      controller?.abort?.();
    }
    controller = new AbortController();
    const { signal } = controller;

    setDetailLoading(true);
    const res = await refundDetail({ id: Number(id) }, signal).finally(() => {
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

  const onRecordClick = async (record: IRefundListRecord) => {
    setUrlState({ id: record.id });
    fetchDetail();
  };

  const reload = () => {
    publish(EventBus.EDIT_OC_STATUS_SUCCESS);
  };

  const doCancel = async () => {
    const currentQuery = queryString.parse(location.search);

    setCanceling(true);
    const res = await refundCancel({
      id: Number(currentQuery.id),
    }).finally(() => {
      setCanceling(false);
    });
    if (res.code === 200) {
      message.success('Refund Ticket Canceled Success');
      reload();
    }
  };

  const doOngoingValidation = async () => {
    const currentQuery = queryString.parse(location.search);

    setOngoingValidating(true);
    const res = await refundOngoingValidation({
      id: Number(currentQuery.id),
    }).finally(() => {
      setOngoingValidating(false);
    });
    if (res.code === 200) {
      message.success('Refund Ticket Ongoing Validation Success');
      reload();
    }
  };

  const doConfirm = async () => {
    const currentQuery = queryString.parse(location.search);

    setConfirming(true);
    const res = await refundConfirm({
      id: Number(currentQuery.id),
    }).finally(() => {
      setConfirming(false);
    });
    if (res.code === 200) {
      message.success('Refund Ticket Confirmed Success');
      reload();
    }
  };
  const doOCConfirm = async () => {
    const currentQuery = queryString.parse(location.search);

    setConfirming(true);
    const res = await refundOCConfirm({
      id: Number(currentQuery.id),
    }).finally(() => {
      setConfirming(false);
    });
    if (res.code === 200) {
      message.success('Refund Ticket Confirmed Success');
      reload();
    }
  };

  const doCompleted = async () => {
    const currentQuery = queryString.parse(location.search);

    setCompleting(true);
    const res = await refundComplete({
      id: Number(currentQuery.id),
    }).finally(() => {
      setCompleting(false);
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        message.success('Refund Ticket Completed Success');
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

  if (!detail) return null;

  return (
    <>
      <section>
        <BreadcrumbCase
          items={[
            {
              name: 'Refund Ticket',
              path: `${PATHS.CLAIM_TICKET_LIST}?type=${ClaimTicketTabKey.REFUND_TICKET}`,
            },
            {
              name: 'Refund Ticket Details',
              path: PATHS.CLAIM_TICKET_REFUND_DETAIL,
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
                        access[
                          PermissionEnum.REFUND_TICKET_DETAIL_CANCEL_TICKET
                        ]
                      }
                    >
                      {showCancelTicket(detail) && (
                        <>
                          {linkedArOrAp(detail) ? (
                            <Popconfirm
                              title="Warning"
                              description={'Should the ticket be canceled?'}
                              trigger="hover"
                              onConfirm={() => doCancel()}
                            >
                              <Button loading={canceling}>Cancel Ticket</Button>
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
                    </Access>

                    <Access
                      accessible={
                        access[
                          PermissionEnum.REFUND_TICKET_DETAIL_ONGOING_VALIDATION
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
                        access[PermissionEnum.REFUND_TICKET_DETAIL_CONFIRM]
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
                        access[PermissionEnum.REFUND_TICKET_DETAIL_OC_CONFIRM]
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
                        access[PermissionEnum.REFUND_TICKET_DETAIL_COMPLETED]
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
    </>
  );
};

export default RefundTicketDetail;
