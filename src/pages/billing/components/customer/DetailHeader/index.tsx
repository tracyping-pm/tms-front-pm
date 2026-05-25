import {
  statementCancel,
  statementCancelCheck,
  statementCheckWaybillInvoice,
  statementConfirm,
  statementConfirmReceivedOrPaid,
  statementExport,
  statementExportRecord,
  statementLog,
} from '@/api/billing';
import { IBillingCustomerStatementDetail } from '@/api/types/billing';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { LabelCase, ValueCase } from '@/components/CustomDetailHeader/ViewCase';
import CustomTooltip from '@/components/CustomTooltip';
import OperationLogModal, {
  IOperationLogModalState,
  initialOperationLogModalState,
} from '@/components/OperationLogModal';
import {
  BILLING_DETAIL_ANCHOR_ID_MAP,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import PubSubContext from '@/context/pubsub';
import {
  ClaimRequestStatusEnum,
  CountryCurrencyEnumText,
  CustomerSettledItemEnum,
  CustomerSettledItemEnumText,
  CustomerStatementStatusEnum,
  CustomerStatementStatusEnumIconColor,
  CustomerStatementStatusEnumText,
  LibraryTaxTypeEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmountPercentage, openNewTag } from '@/utils/utils';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Access, history, useAccess, useModel, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  Affix,
  App,
  Badge,
  Button,
  Col,
  Row,
  Space,
  Spin,
  Steps,
  Tag,
  Tooltip,
  message,
} from 'antd';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS,
} from '../../event';
import ConfirmProofModal from '../ConfirmProofModal';
import RejectStatementModal from '../RejectStatementModal';
import WriteOffModal from '../WriteOffModal';
import styles from './styles.less';

interface IDetailHeader {
  loading: boolean;
  detail: IBillingCustomerStatementDetail;
}

export default memo(function DetailHeader({ loading, detail }: IDetailHeader) {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const countryCurrency = CountryCurrencyEnumText[countryId as number];
  const { id: customerId } = useParams();
  const { publish } = useContext(PubSubContext);
  const { modal } = App.useApp();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [customerConfirmLoading, setCustomerConfirmLoading] =
    useState<boolean>(false);
  const [exportRecordLoading, setExportRecordLoading] =
    useState<boolean>(false);
  const [showWriteOffModal, setShowWriteOffModal] = useState<boolean>(false);
  const [waybillListEditStatus, setWaybillListEditStatus] =
    useState<boolean>(false);
  const [rejectStatementModalOpen, setRejectStatementModalOpen] =
    useState<boolean>(false);
  const [confirmProofModalOpen, setConfirmProofModalOpen] =
    useState<boolean>(false);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const [cancelCheckLoading, setCancelCheckLoading] = useState<boolean>(false);

  const statusTextMap: Record<string, string> = {
    [CustomerStatementStatusEnum.UNDER_BILLING_PREP]: 'Bill',
    [CustomerStatementStatusEnum.AWAITING_REBILL]: 'ReBill',
  };

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await statementLog({ id: Number(customerId) }).finally(() => {
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
  }, [customerId]);

  const exportStatement = async () => {
    setExportLoading(true);
    const res = await statementExport({ statementId: +customerId! }).finally(
      () => {
        setExportLoading(false);
      },
    );
    if (res.code === 200) {
      window.open(res.data, '_blank');
    }
  };
  const exportChangeRecord = async () => {
    setExportRecordLoading(true);
    const res = await statementExportRecord({ id: +customerId! }).finally(
      () => {
        setExportRecordLoading(false);
      },
    );
    if (res.code === 200) {
      window.open(res.data, '_blank');
    }
  };

  const cancelStatement = async () => {
    modal.confirm({
      title: 'Warning',
      icon: <ExclamationCircleFilled />,
      content: 'Do you want to cancel this statement ?',
      cancelText: 'No',
      okText: 'Cancel Statement',
      onOk: async () => {
        const res = await statementCancel(+customerId!);
        if (res.code === 200) {
          publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
          message.success('success');
        }
      },
    });
  };

  const cancelCheck = async () => {
    setCancelCheckLoading(true);
    const resCancelCheck = await statementCancelCheck({
      id: +customerId!,
    }).finally(() => {
      setCancelCheckLoading(false);
    });
    if (resCancelCheck.code === 200) {
      const { isValid, requestStatus, requestNo = [] } = resCancelCheck.data;

      if (isValid) {
        cancelStatement();
      } else {
        if (requestStatus === ClaimRequestStatusEnum.PENDING_OC) {
          modal.confirm({
            title: 'Warning',
            icon: <ExclamationCircleFilled />,
            content: (
              <div>
                The associated Request
                {requestNo.map((item) => {
                  return (
                    <a
                      key={item.id}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.CLAIM_TICKET_LIST}?type=claimRequest&id=${item?.id}&claimRequestNo=${item?.claimRequestNo}`,
                        );
                      }}
                    >
                      {' '}
                      {item?.claimRequestNo},
                    </a>
                  );
                })}
                will be cancelled synchronously. Confirm cancelling the
                statement。
              </div>
            ),
            cancelText: 'No, Close',
            okText: 'Yes, Cancel statement ',
            onOk: async () => {
              const res = await statementCancel(+customerId!);
              if (res.code === 200) {
                publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
                message.success('success');
              }
            },
          });
        } else if (requestStatus === ClaimRequestStatusEnum.SPLIT) {
          message.error({
            content: (
              <div
                style={{
                  width: 595,
                  wordBreak: 'break-word',
                  textAlign: 'left',
                }}
              >
                Request
                {requestNo.map((item) => {
                  return (
                    <a
                      key={item.id}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.CLAIM_TICKET_LIST}?type=claimRequest&id=${item?.id}&claimRequestNo=${item?.claimRequestNo}`,
                        );
                      }}
                    >
                      {' '}
                      {item?.claimRequestNo},{' '}
                    </a>
                  );
                })}
                is associated. Statement Cancellation is not allowed—please
                contact the development team for handling.
              </div>
            ),
            duration: 3,
          });
        }
      }
    }
  };

  const rejectStatement = () => {
    setRejectStatementModalOpen(true);
  };

  const confirmReceived = async () => {
    setConfirmLoading(true);
    const resCheck = await statementCheckWaybillInvoice(+customerId!);

    if (resCheck.code === 200) {
      if (resCheck.data.code === 1) {
        setConfirmLoading(false);
        message.error(
          <>
            There are
            <a
              style={{ margin: '0 4px' }}
              onClick={() => {
                const element = document.getElementById(
                  BILLING_DETAIL_ANCHOR_ID_MAP.CUSTOMER_WAYBILL_LIST,
                );
                if (element) {
                  element?.scrollIntoView?.({
                    behavior: 'smooth',
                    block: 'end',
                  });
                }
              }}
            >
              waybills
            </a>
            not associated with an invoice number. Please check
          </>,
        );
      } else {
        const res = await statementConfirmReceivedOrPaid(+customerId!).finally(
          () => {
            setConfirmLoading(false);
          },
        );
        if (res.code === 200) {
          //@ts-ignore
          if (res.data.code === 1) {
            message.error(
              <>
                There are
                <a
                  style={{ margin: '0 4px' }}
                  onClick={() => {
                    const element = document.getElementById(
                      BILLING_DETAIL_ANCHOR_ID_MAP.CUSTOMER_WAYBILL_LIST,
                    );
                    if (element) {
                      element?.scrollIntoView?.({
                        behavior: 'smooth',
                        block: 'end',
                      });
                    }
                  }}
                >
                  waybills
                </a>
                not associated with an invoice number. Please check
              </>,
            );
            return;
          }

          if (
            res.data?.status === CustomerStatementStatusEnum.PENDING_COLLECTION
          ) {
            modal.confirm({
              title: 'Warning',
              icon: <ExclamationCircleFilled />,
              content:
                res.data?.message ||
                'No receipt records, unable to confirm collected.',
              cancelButtonProps: {
                style: {
                  display: 'none',
                },
              },
            });
          } else if (
            [
              CustomerStatementStatusEnum.PARTIALLY_COLLECTED,
              CustomerStatementStatusEnum.COLLECTED,
            ].includes(res.data?.status as CustomerStatementStatusEnum)
          ) {
            publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
            message.success(res.data?.message || 'success');
          }
        }
      }
    } else {
      setConfirmLoading(false);
    }
  };
  const onWriteOffHandle = async () => {
    setShowWriteOffModal(true);
  };

  const confirmStatement = async () => {
    if (waybillListEditStatus) {
      const element = document.getElementById(
        BILLING_DETAIL_ANCHOR_ID_MAP.CUSTOMER_WAYBILL_LIST,
      );
      if (element) {
        element?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
      }
      message.error(
        'Please confirm that the waybill list operation item has been submitted',
      );
      return;
    }

    setConfirmLoading(true);
    const res = await statementConfirm(+customerId!).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      message.success('success');
    }
  };
  const customerConfirmStatement = async () => {
    setCustomerConfirmLoading(true);
    const res = await statementCheckWaybillInvoice(+customerId!);
    setCustomerConfirmLoading(false);
    if (res.code === 200) {
      if (res.data.code === 1) {
        message.error(
          <>
            There are
            <a
              style={{ margin: '0 4px' }}
              onClick={() => {
                const element = document.getElementById(
                  BILLING_DETAIL_ANCHOR_ID_MAP.VENDOR_WAYBILL_LIST,
                );
                if (element) {
                  element?.scrollIntoView?.({
                    behavior: 'smooth',
                    block: 'end',
                  });
                }
              }}
            >
              waybills
            </a>
            not associated with an invoice number. Please check
          </>,
        );
        setConfirmProofModalOpen(false);
        return;
      } else {
        setConfirmProofModalOpen(true);
      }
    }
  };
  // const customerConfirmStatement = async () => {
  //   setConfirmProofModalOpen(true);
  // };

  const getSettledItemListString = useCallback(() => {
    const settledItemList = detail?.settledItemList;
    const content = settledItemList
      ?.map(
        (item: CustomerSettledItemEnum) => CustomerSettledItemEnumText[item],
      )
      .join(', ');
    return content ?? '-';
  }, [detail]);

  useEffect(() => {
    const unsubscribe = subscribe(
      EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS,
      (bol) => {
        setWaybillListEditStatus(bol);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() =>
                    history.push(`${PATHS.BILLING_CUSTOMER_STATEMENT}`)
                  }
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
                  accessible={
                    access[
                      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_EXPORT_STATEMENT
                    ]
                  }
                >
                  <Button loading={exportLoading} onClick={exportStatement}>
                    Export Statement
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_EXPORT_RECORD
                    ]
                  }
                >
                  <Button
                    loading={exportRecordLoading}
                    onClick={exportChangeRecord}
                  >
                    Export Change Record
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WRITE_OFF
                    ] &&
                    [
                      CustomerStatementStatusEnum.PENDING_COLLECTION,
                      CustomerStatementStatusEnum.PARTIALLY_COLLECTED,
                    ].includes(detail?.status)
                  }
                >
                  <Button onClick={onWriteOffHandle}>Write Off</Button>
                </Access>

                <Access
                  accessible={
                    access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_REJECT] &&
                    [
                      CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                      CustomerStatementStatusEnum.PENDING_COLLECTION,
                    ].includes(detail?.status)
                  }
                >
                  <Tooltip
                    title={
                      detail?.status ===
                      CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM
                        ? 'If rejected, the statement status will be updated to "Awaiting Re-bill”'
                        : ''
                    }
                    placement="top"
                  >
                    <Button onClick={rejectStatement}>
                      {detail?.status ===
                      CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM
                        ? 'Customer Reject '
                        : 'Reject'}
                    </Button>
                  </Tooltip>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CANCEL] &&
                    [
                      CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                      CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                      CustomerStatementStatusEnum.AWAITING_REBILL,
                      CustomerStatementStatusEnum.PENDING_COLLECTION,
                    ].includes(detail?.status)
                  }
                >
                  <CustomTooltip
                    title={
                      'If canceled, the statement status will be updated to "canceled" , and all associated waybills will be disassociated from the Statement and return to "Awaiting Settlement" status.'
                    }
                    placement="top"
                  >
                    <Button onClick={cancelCheck} loading={cancelCheckLoading}>
                      Cancel
                    </Button>
                  </CustomTooltip>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CONFIRM_COLLECTED
                    ] &&
                    [
                      CustomerStatementStatusEnum.PARTIALLY_COLLECTED,
                      CustomerStatementStatusEnum.OVER_COLLECTED,
                      CustomerStatementStatusEnum.FULLY_COLLECTED,
                    ].includes(detail?.status)
                  }
                >
                  <Tooltip
                    title={
                      detail?.status ===
                      CustomerStatementStatusEnum.PARTIALLY_COLLECTED
                        ? 'The amount received can’t  be less than the total amount receivable'
                        : null
                    }
                    placement="top"
                  >
                    <Button
                      loading={confirmLoading}
                      disabled={
                        detail?.status ===
                        CustomerStatementStatusEnum.PARTIALLY_COLLECTED
                      }
                      type="primary"
                      onClick={confirmReceived}
                    >
                      Confirm Collected
                    </Button>
                  </Tooltip>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CUSTOMER_CONFIRM
                    ] &&
                    [
                      CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                    ].includes(detail?.status)
                  }
                >
                  <Button
                    type="primary"
                    loading={customerConfirmLoading}
                    onClick={() => {
                      customerConfirmStatement();
                    }}
                  >
                    Customer Confirm
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CONFIRM] &&
                    [
                      CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                      CustomerStatementStatusEnum.AWAITING_REBILL,
                    ].includes(detail?.status)
                  }
                >
                  <Button
                    loading={confirmLoading}
                    type="primary"
                    onClick={confirmStatement}
                  >
                    {statusTextMap[detail?.status] || 'Confirm'}
                  </Button>
                </Access>
              </div>
            </div>
          </Affix>
          <div className={styles.infoWrap}>
            {detail.statusHisList?.length ? (
              <div className={styles.statusRecord}>
                <p style={{ marginBottom: 0, color: 'rgba(0, 0, 0, 0.45)' }}>
                  Status Change Record
                </p>
                <Steps
                  type="navigation"
                  size="small"
                  items={detail?.statusHisList?.map((item, index) => ({
                    title: (
                      <Badge
                        className={
                          index !== detail?.statusHisList?.length - 1
                            ? styles.last
                            : ''
                        }
                        color={
                          CustomerStatementStatusEnumIconColor[item?.status]
                        }
                        text={CustomerStatementStatusEnumText[item?.status]}
                      />
                    ),
                    icon: <></>,
                    description: item?.updatedAt,
                  }))}
                />
              </div>
            ) : null}
            <div className={styles.basicInfo}>
              <Space size={94}>
                <Space direction="vertical" size={12}>
                  <LabelCase>Total Amount Receivable</LabelCase>
                  <ValueCase $fontSize={20} $lineHeight={28}>
                    {`${countryCurrency}
                      ${formatAmountPercentage(
                        detail?.billingInfo?.totalAmountReceivable,
                      )}`}
                  </ValueCase>
                </Space>

                <Space direction="vertical" size={12}>
                  <LabelCase>Amount Received</LabelCase>
                  <ValueCase $fontSize={20} $lineHeight={28}>
                    {`${countryCurrency}
                      ${formatAmountPercentage(
                        detail?.billingInfo?.collectedAmount,
                      )}`}
                  </ValueCase>
                </Space>

                <Space direction="vertical" size={12}>
                  <LabelCase>Outstanding Amount</LabelCase>
                  <ValueCase $fontSize={20} $lineHeight={28}>
                    {`${countryCurrency}
                      ${formatAmountPercentage(
                        detail?.billingInfo?.unCollectedAmount,
                      )}`}
                  </ValueCase>
                </Space>
              </Space>

              <div
                style={{
                  border: '0.5px solid #f0f0f0',
                  borderRight: 'none',
                  borderBottom: 'none',
                }}
              >
                <Row>
                  <Col span={24}>
                    <ColCell
                      label="Settlement item"
                      value={getSettledItemListString()}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell label="Statement Number" value={detail?.number} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Status"
                      value={
                        detail?.status ? (
                          <Badge
                            color={
                              CustomerStatementStatusEnumIconColor[
                                detail?.status
                              ]
                            }
                            text={
                              CustomerStatementStatusEnumText[detail?.status]
                            }
                          />
                        ) : null
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Customer" value={detail?.customerName} />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Tax Inclusion Type"
                      value={
                        detail?.billingInfo?.isTaxInclusive !== null
                          ? detail?.billingInfo?.isTaxInclusive
                            ? LibraryTaxTypeEnum.TAX_INCLUSIVE
                            : LibraryTaxTypeEnum.TAX_EXCLUSIVE
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label={`Reconciliation Period${
                        detail?.settlementTimeType
                          ? '(' + detail?.settlementTimeType + ')'
                          : ''
                      }`}
                      value={
                        detail?.reconciliationPeriodStart &&
                        detail?.reconciliationPeriodEnd
                          ? detail?.reconciliationPeriodStart +
                            ' - ' +
                            detail?.reconciliationPeriodEnd
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Creation time" value={detail?.createdAt} />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ColCell
                      label="Project Name"
                      value={
                        detail?.projectNames?.length
                          ? detail?.projectNames?.map((item) => (
                              <Tag key={item} style={{ marginBottom: 4 }}>
                                {item}
                              </Tag>
                            ))
                          : '-'
                      }
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </Spin>

      {showWriteOffModal && (
        <WriteOffModal
          writeOffAmount={detail?.billingInfo?.unCollectedAmount}
          onCancel={() => setShowWriteOffModal(false)}
        />
      )}
      <OperationLogModal
        showOperator={true}
        list={operationLogModalState.list}
        open={operationLogModalState.open}
        onConfirm={() => setOperationLogModalState({ open: false })}
        onCancel={() => setOperationLogModalState({ open: false })}
      />
      {rejectStatementModalOpen && (
        <RejectStatementModal
          open={rejectStatementModalOpen}
          onCancel={() => setRejectStatementModalOpen(false)}
        />
      )}
      {confirmProofModalOpen && (
        <ConfirmProofModal
          open={confirmProofModalOpen}
          onCancel={() => setConfirmProofModalOpen(false)}
        />
      )}
    </>
  );
});
