import {
  statementCancel,
  statementCheckWaybillInvoice,
  statementConfirm,
  statementConfirmReceivedOrPaid,
  statementExport,
  statementExportRecord,
  statementLog,
  statementVendorConfirm,
} from '@/api/billing';
import { IBillingVendorStatementDetail } from '@/api/types/billing';
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
  CountryCurrencyEnumText,
  LibraryTaxTypeEnum,
  VendorSettledItemEnum,
  VendorSettledItemEnumText,
  VendorStatementStatusEnum,
  VendorStatementStatusEnumIconColor,
  VendorStatementStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmountPercentage } from '@/utils/utils';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Access, history, useAccess, useModel, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  Affix,
  App,
  Badge,
  Button,
  Col,
  Popconfirm,
  Row,
  Space,
  Spin,
  Steps,
  Tag,
  message,
} from 'antd';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS,
} from '../../event';
import RejectStatementModal from '../RejectStatementModal';
import WriteOffModal from '../WriteOffModal';
import styles from './styles.less';

interface IDetailHeader {
  loading: boolean;
  detail: IBillingVendorStatementDetail;
}

export default memo(function DetailHeader({ loading, detail }: IDetailHeader) {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const countryCurrency = CountryCurrencyEnumText[countryId as number];
  const { id: venderId } = useParams();
  const { publish } = useContext(PubSubContext);
  const { modal } = App.useApp();

  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportRecordLoading, setExportRecordLoading] =
    useState<boolean>(false);
  const [vendorConfirmLoading, setVendorConfirmLoading] =
    useState<boolean>(false);

  const [showWriteOffModal, setShowWriteOffModal] = useState<boolean>(false);
  const [confirmPopconfirmOpen, setConfirmPopconfirmOpen] =
    useState<boolean>(false);
  const [waybillListEditStatus, setWaybillListEditStatus] =
    useState<boolean>(false);
  const [rejectStatementModalOpen, setRejectStatementModalOpen] =
    useState<boolean>(false);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await statementLog({ id: Number(venderId) }).finally(() => {
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
  }, [venderId]);

  const exportStatement = async () => {
    setExportLoading(true);
    const res = await statementExport({ statementId: +venderId! }).finally(
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
    const res = await statementExportRecord({ id: +venderId! }).finally(() => {
      setExportRecordLoading(false);
    });
    if (res.code === 200) {
      window.open(res.data, '_blank');
    }
  };

  const cancelStatement = () => {
    modal.confirm({
      title: 'Warning',
      icon: <ExclamationCircleFilled />,
      content: 'Do you want to cancel this statement ?',
      cancelText: 'No',
      okText: 'Cancel Statement',
      onOk: async () => {
        const res = await statementCancel(+venderId!);
        if (res.code === 200) {
          publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
          message.success('success');
        }
      },
    });
  };

  const rejectStatement = () => {
    setRejectStatementModalOpen(true);
  };

  const confirmPaid = async () => {
    setConfirmLoading(true);
    const resCheck = await statementCheckWaybillInvoice(+venderId!);
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
      } else {
        const res = await statementConfirmReceivedOrPaid(+venderId!).finally(
          () => {
            setConfirmLoading(false);
          },
        );
        if (res.code === 200) {
          if (res.data?.status === VendorStatementStatusEnum.PENDING_PAYMENT) {
            modal.confirm({
              title: 'Warning',
              icon: <ExclamationCircleFilled />,
              content:
                res.data?.message ||
                'No payment records,  unable to confirm paid.',
              cancelButtonProps: {
                style: {
                  display: 'none',
                },
              },
            });
          } else if (
            [
              VendorStatementStatusEnum.PARTIALLY_PAID,
              VendorStatementStatusEnum.PAID,
            ].includes(res.data?.status as VendorStatementStatusEnum)
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
        BILLING_DETAIL_ANCHOR_ID_MAP.VENDOR_WAYBILL_LIST,
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
    const res = await statementConfirm(+venderId!).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      message.success('success');
    }
  };

  const vendorConfirmStatement = async () => {
    setConfirmPopconfirmOpen(false);
    const res = await statementVendorConfirm(+venderId!);
    if (res.code === 200) {
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      message.success('success');
    }
  };
  const onCheckWaybillInvoice = async () => {
    setVendorConfirmLoading(true);
    const res = await statementCheckWaybillInvoice(+venderId!);
    setVendorConfirmLoading(false);
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
        setConfirmPopconfirmOpen(false);
        return;
      } else {
        setConfirmPopconfirmOpen(true);
      }
    }
  };

  const getSettledItemListString = useCallback(() => {
    const settledItemList = detail?.settledItemList;
    const content = settledItemList
      ?.map((item: VendorSettledItemEnum) => VendorSettledItemEnumText[item])
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
                    history.push(`${PATHS.BILLING_VENDOR_STATEMENT}`)
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
                      PermissionEnum.VENDOR_STATEMENT_DETAIL_EXPORT_STATEMENT
                    ]
                  }
                >
                  <Button loading={exportLoading} onClick={exportStatement}>
                    Export Statement
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.VENDOR_STATEMENT_DETAIL_EXPORT_RECORD]
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
                    access[PermissionEnum.VENDOR_STATEMENT_DETAIL_WRITE_OFF] &&
                    [
                      VendorStatementStatusEnum.PENDING_PAYMENT,
                      VendorStatementStatusEnum.PARTIALLY_PAID,
                    ].includes(detail?.status)
                  }
                >
                  <Button onClick={onWriteOffHandle}>Write Off</Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.VENDOR_STATEMENT_DETAIL_REJECT] &&
                    detail?.status ===
                      VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM
                  }
                >
                  <CustomTooltip
                    title={
                      'If rejected, the statement status will be updated to "Awaiting Re-bill”'
                    }
                    placement="top"
                  >
                    <Button onClick={rejectStatement}>Reject</Button>
                  </CustomTooltip>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.VENDOR_STATEMENT_DETAIL_CANCEL] &&
                    [
                      VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
                      VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
                      VendorStatementStatusEnum.AWAITING_REBILL,
                      VendorStatementStatusEnum.PENDING_PAYMENT,
                    ].includes(detail?.status)
                  }
                >
                  <CustomTooltip
                    titleMaxWidth={250}
                    title={
                      'If canceled, the statement status will be updated to "canceled" , and all associated waybills will be disassociated from the Statement and return to "Awaiting Settlement" status.'
                    }
                    placement="top"
                  >
                    <Button onClick={cancelStatement}>Cancel</Button>
                  </CustomTooltip>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.VENDOR_STATEMENT_DETAIL_CONFIRM_PAID
                    ] &&
                    [
                      VendorStatementStatusEnum.PENDING_PAYMENT,
                      VendorStatementStatusEnum.PARTIALLY_PAID,
                      VendorStatementStatusEnum.FULLY_PAID,
                    ].includes(detail?.status)
                  }
                >
                  <Button
                    loading={confirmLoading}
                    type="primary"
                    onClick={confirmPaid}
                  >
                    Confirm Paid
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.VENDOR_STATEMENT_DETAIL_VENDOR_CONFIRM
                    ] &&
                    [VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM].includes(
                      detail?.status,
                    )
                  }
                >
                  <Popconfirm
                    title="Please confirm if the vendor has verified the statement amount."
                    style={{ width: 100 }}
                    trigger="click"
                    onConfirm={vendorConfirmStatement}
                    okText="Yes"
                    cancelText="No"
                    open={confirmPopconfirmOpen}
                    onOpenChange={(v) => {
                      if (!v) {
                        setConfirmPopconfirmOpen(v);
                      }
                    }}
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        onCheckWaybillInvoice();
                      }}
                      loading={vendorConfirmLoading}
                    >
                      Vendor Confirm
                    </Button>
                  </Popconfirm>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.VENDOR_STATEMENT_DETAIL_CONFIRM] &&
                    [
                      VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
                      VendorStatementStatusEnum.AWAITING_REBILL,
                    ].includes(detail?.status)
                  }
                >
                  <Button
                    loading={confirmLoading}
                    type="primary"
                    onClick={confirmStatement}
                  >
                    Confirm
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
                        color={VendorStatementStatusEnumIconColor[item?.status]}
                        text={VendorStatementStatusEnumText[item?.status]}
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
                  <LabelCase>Total Amount Payable</LabelCase>
                  <ValueCase $fontSize={20} $lineHeight={28}>
                    {`${countryCurrency}
                      ${formatAmountPercentage(
                        detail?.billingInfo?.totalAmountReceivable,
                      )}`}
                  </ValueCase>
                </Space>

                <Space direction="vertical" size={12}>
                  <LabelCase>Amount Paid</LabelCase>
                  <ValueCase $fontSize={20} $lineHeight={28}>
                    {`${countryCurrency}
                      ${formatAmountPercentage(
                        detail?.billingInfo?.collectedAmount,
                      )}`}
                  </ValueCase>
                </Space>

                <Space direction="vertical" size={12}>
                  <LabelCase>Remaining Amount Unpaid</LabelCase>
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
                              VendorStatementStatusEnumIconColor[detail?.status]
                            }
                            text={VendorStatementStatusEnumText[detail?.status]}
                          />
                        ) : null
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Vendor" value={detail?.vendorName} />
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
                {detail.status === VendorStatementStatusEnum.WRITTEN_OFF && (
                  <Row>
                    <Col span={24}>
                      <ColCell
                        label="Write Off Reason"
                        value={detail?.writeOffReason}
                      />
                    </Col>
                  </Row>
                )}
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
    </>
  );
});
