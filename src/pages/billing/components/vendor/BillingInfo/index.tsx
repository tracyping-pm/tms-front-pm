import {
  miscellaneousChangeList,
  miscellaneousChangeSave,
  statementChangeTax,
} from '@/api/billing';
import {
  IBillingVendorStatementDetail,
  IMiscellaneousChangeSaveReq,
  IStatementMiscellaneousChargeListItem,
} from '@/api/types/billing';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { CountryCurrencyEnumText, VendorStatementStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmountPercentage } from '@/utils/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Access, history, useAccess, useModel, useParams } from '@umijs/max';
import { Radio, Spin, message } from 'antd';
import cls from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { EVENT_BILLING_STATEMENT_DETAIL_RELOAD } from '../../event';
import EditMiscellaneousModal from '../EditMiscellaneousModal';
import MiscellaneousHistoryModal from '../MiscellaneousHistoryModal';
import styles from './styles.less';
interface IBillingInfo {
  loading: boolean;
  detail: IBillingVendorStatementDetail;
}

export default function BillingInfo({ detail, loading }: IBillingInfo) {
  const access = useAccess();
  const { id: statementId } = useParams();
  const { publish } = useContext(PubSubContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const [miscellaneousOpen, setMiscellaneousOpen] = useState<boolean>(false);
  const [miscellaneousLoading, setMiscellaneousLoading] =
    useState<boolean>(false);
  const [miscellaneousHistoryOpen, setMiscellaneousHistoryOpen] =
    useState<boolean>(false);
  const [miscellaneousList, setMiscellaneousList] = useState<
    IStatementMiscellaneousChargeListItem[]
  >([]);

  const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
  const [isTaxInclusiveValue, setIsTaxInclusiveValue] = useState<boolean>(
    detail.billingInfo?.isTaxInclusive,
  );

  // const items: MenuProps['items'] = [
  //   {
  //     label: 'Claim Detail',
  //     key: ' claimDetail',
  //   },
  // ];

  const onAddEditMiscellaneous = async () => {
    setMiscellaneousLoading(true);
    const res = await miscellaneousChangeList(+statementId!);
    setMiscellaneousLoading(false);
    if (res.code === 200) {
      setMiscellaneousList(res.data ?? []);
      setMiscellaneousOpen(true);
    }
  };

  const onEditMiscellaneousModalConfirm = async (
    data: IMiscellaneousChangeSaveReq,
  ) => {
    setMiscellaneousLoading(true);
    const res = await miscellaneousChangeSave(data);
    setMiscellaneousLoading(false);
    if (res.code === 200) {
      message.success('Edit Success');
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      setMiscellaneousOpen(false);
    }
  };

  const onAddEditMiscellaneousHistory = async () => {
    setMiscellaneousHistoryOpen(true);
  };
  const onTaxInclusiveValueHandelChange = async (v: boolean) => {
    setIsTaxInclusiveValue(v);
    setRefreshLoading(true);
    const res = await statementChangeTax({
      id: +statementId!,
    });
    setRefreshLoading(false);
    if (res.code === 200) {
      message.success('Edit Settlement Tax-inclusive Success');
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
    }
  };
  useEffect(() => {
    if (detail) {
      setIsTaxInclusiveValue(detail.billingInfo?.isTaxInclusive);
    }
  }, [detail]);

  return (
    <Spin spinning={loading || refreshLoading}>
      <div className={styles.info}>
        <div className={styles.info_header}>
          <div className={styles.info_header_left}>Billing info.</div>
          <div className={styles.info_header_right}>
            {detail.billingInfo?.basedOnWaybill ? (
              <>
                <Access
                  key="additionalChargeDetail"
                  accessible={
                    access[
                      PermissionEnum
                        .VENDOR_STATEMENT_DETAIL_BILLING_ADDITIONAL_CHARGE
                    ]
                  }
                >
                  <CustomStatusButton
                    className={styles.info_header_right_btn}
                    onClick={() => {
                      history.push(
                        `${PATHS.BILLING_VENDOR_ADDITIONAL}/${statementId}`,
                      );
                    }}
                  >
                    Additional Charge Detail
                  </CustomStatusButton>
                </Access>
                <Access
                  key="claimTicketDetail"
                  accessible={
                    access[
                      PermissionEnum
                        .VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL
                    ]
                  }
                >
                  <CustomStatusButton
                    className={styles.info_header_right_btn}
                    onClick={() => {
                      history.push(
                        `${PATHS.BILLING_VENDOR_CLAIMS_TICKET}/${statementId}`,
                      );
                    }}
                    type="link"
                  >
                    Claim Ticket Detail
                  </CustomStatusButton>
                </Access>
              </>
            ) : (
              <>
                <Access
                  key="editChargeHistory"
                  accessible={
                    access[
                      PermissionEnum
                        .VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE_HISTORY
                    ]
                  }
                >
                  <CustomStatusButton
                    className={styles.info_header_right_btn}
                    onClick={onAddEditMiscellaneousHistory}
                  >
                    Miscellaneous Charge Edit History
                  </CustomStatusButton>
                </Access>
                {access[
                  PermissionEnum
                    .VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE_HISTORY
                ] &&
                access[
                  PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE
                ] ? (
                  <div className={styles.info_header_right_line} />
                ) : null}
                <Access
                  key="editCharge"
                  accessible={
                    access[
                      PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE
                    ] &&
                    [
                      VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
                      VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
                      VendorStatementStatusEnum.AWAITING_REBILL,
                    ].includes(detail.status)
                  }
                >
                  <CustomStatusButton
                    className={styles.info_header_right_btn}
                    onClick={onAddEditMiscellaneous}
                    loading={miscellaneousLoading}
                  >
                    Edit Miscellaneous Charge
                  </CustomStatusButton>
                </Access>
              </>
            )}
          </div>
        </div>
        <div className={styles.info_content}>
          <div className={styles.info_table}>
            <div className={styles.infoHeader}>
              <div
                className={styles.infoHeaderTitle}
                style={{
                  width: detail.billingInfo?.basedOnWaybill ? '33.2%' : '100%',
                }}
              >
                <div className={styles.info_table_title}>
                  Total Amount Payment
                  <CustomTooltip
                    title="Total Amount Payment  = Waybill Contract Cost - Claim + Others"
                    placement="top"
                  >
                    {detail.billingInfo?.basedOnWaybill ? (
                      <InfoCircleOutlined
                        style={{ color: '#838CA1', marginLeft: 8 }}
                      />
                    ) : null}
                  </CustomTooltip>
                </div>
                <div className={cls(styles.info_table_title)}>
                  {CountryCurrencyEnumText[countryId as number]}
                  {formatAmountPercentage(
                    detail?.billingInfo?.totalAmountReceivable,
                  )}
                </div>
              </div>
              <Access
                key="taxInclusive"
                accessible={
                  access[
                    PermissionEnum
                      .VENDOR_STATEMENT_DETAIL_BILLING_IS_TAX_INCLUSIVE
                  ]
                }
              >
                {detail.billingInfo?.basedOnWaybill &&
                [
                  VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
                  VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
                  VendorStatementStatusEnum.AWAITING_REBILL,
                ].includes(detail.status) ? (
                  <div
                    className={cls(
                      styles.infoHeaderTitle,
                      styles.infoHeaderTaxInclusive,
                    )}
                  >
                    <div className={styles.info_table_title}>
                      Is the Settlement Tax-inclusive
                    </div>
                    <Radio.Group
                      value={isTaxInclusiveValue}
                      onChange={(e) => {
                        onTaxInclusiveValueHandelChange(e.target.value);
                      }}
                    >
                      <Radio value={true}> Yes </Radio>
                      <Radio value={false}> No </Radio>
                    </Radio.Group>
                  </div>
                ) : null}
              </Access>
            </div>

            <div className={styles.info_row}>
              {detail?.billingInfo?.basedOnWaybill ? (
                <>
                  <div
                    className={styles.info_row_col}
                    style={{ borderRight: '1px solid #0000001a' }}
                  >
                    <div className={styles.info_table_header}>
                      <div className={styles.info_table_title}>
                        Waybill Contract Cost
                      </div>
                      <div
                        className={cls(
                          styles.info_table_title,
                          //   {
                          //   [styles.highlightAmount]:
                          //     detail?.billingInfo?.settlementAmount !==
                          //     detail?.billingInfo?.originalSettlementAmount,
                          // }
                        )}
                      >
                        {CountryCurrencyEnumText[countryId as number]}
                        {formatAmountPercentage(
                          detail?.billingInfo?.waybillContractRevenue,
                        )}
                      </div>
                    </div>
                    <div>
                      {typeof detail?.billingInfo?.paidInAdvance ===
                      'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>
                            Paid In advance
                          </div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo?.paidInAdvance,
                            )}
                          </div>
                        </div>
                      ) : null}
                      {typeof detail?.billingInfo?.regularPayments ===
                      'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>
                            Basic Amount Payable (Remaining)
                          </div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo?.regularPayments,
                            )}
                          </div>
                        </div>
                      ) : null}
                      {typeof detail?.billingInfo?.additionalCharge ===
                      'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>
                            Vendor Additional Charge
                          </div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo?.additionalCharge,
                            )}
                          </div>
                        </div>
                      ) : null}
                      {typeof detail?.billingInfo?.exceptionFee === 'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>
                            Vendor Exception Fee
                          </div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo?.exceptionFee,
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={styles.info_row_col}
                    style={{ borderRight: '1px solid #0000001a' }}
                  >
                    <div className={styles.info_table_header}>
                      <div className={styles.info_table_title}>Claim</div>
                      <div className={styles.info_table_title}>
                        {CountryCurrencyEnumText[countryId as number]}
                        {formatAmountPercentage(detail?.billingInfo?.claim)}
                      </div>
                    </div>
                    <div>
                      {detail?.billingInfo?.claimMap &&
                        Object.entries(detail?.billingInfo?.claimMap).map(
                          ([key, value]) => (
                            <div className={styles.info_table_item} key={key}>
                              <div className={styles.info_table_name}>
                                {key}
                              </div>
                              <div className={styles.info_table_num}>
                                {CountryCurrencyEnumText[countryId as number]}
                                {formatAmountPercentage(value)}
                              </div>
                            </div>
                          ),
                        )}
                    </div>
                  </div>
                  <div className={styles.info_row_col}>
                    <div className={styles.info_table_header}>
                      <div className={styles.info_table_title}>
                        Others
                        <CustomTooltip
                          title=" Others = Reimbursement Expense + Miscellaneous Charge + WHT + VAT (lf the statement does not include tax, then it is exclusive of VAT)"
                          placement="top"
                        >
                          <InfoCircleOutlined
                            style={{ color: '#838CA1', marginLeft: 8 }}
                          />
                        </CustomTooltip>
                      </div>
                      <div className={cls(styles.info_table_title)}>
                        {CountryCurrencyEnumText[countryId as number]}
                        {formatAmountPercentage(detail?.billingInfo?.others)}
                      </div>
                    </div>
                    <div>
                      {typeof detail?.billingInfo?.vatAmount === 'number' ? (
                        <div className={styles.info_table_item}>
                          <div
                            className={cls(
                              styles.info_table_name,
                              !isTaxInclusiveValue && styles.textLine,
                            )}
                          >
                            VAT
                          </div>
                          <div
                            className={cls(
                              styles.info_table_num,
                              !isTaxInclusiveValue && styles.textLine,
                            )}
                          >
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo?.vatAmount,
                            )}
                          </div>
                        </div>
                      ) : null}
                      {typeof detail?.billingInfo
                        ?.miscellaneousChargeTotalAmount === 'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>
                            Miscellaneous Charge
                          </div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo
                                ?.miscellaneousChargeTotalAmount,
                            )}
                          </div>
                        </div>
                      ) : null}
                      {typeof detail?.billingInfo?.whtAmount === 'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>WHT</div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo?.whtAmount,
                            )}
                          </div>
                        </div>
                      ) : null}
                      {typeof detail?.billingInfo
                        ?.reimbursementExpenseTotalAmount === 'number' ? (
                        <div className={styles.info_table_item}>
                          <div className={styles.info_table_name}>
                            Reimbursement Expense
                          </div>
                          <div className={styles.info_table_num}>
                            {CountryCurrencyEnumText[countryId as number]}
                            {formatAmountPercentage(
                              detail?.billingInfo
                                ?.reimbursementExpenseTotalAmount,
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.info_row_col}>
                  <div className={styles.info_table_header}>
                    <div className={styles.info_table_title}>
                      Miscellaneous Charge
                    </div>
                    <div className={styles.info_table_title}>
                      {CountryCurrencyEnumText[countryId as number]}
                      {formatAmountPercentage(
                        detail?.billingInfo?.miscellaneousChargeTotalAmount,
                      )}
                    </div>
                  </div>
                  <div>
                    {detail?.billingInfo?.miscellaneousChargeList?.map((m) => (
                      <div className={styles.info_table_item} key={m.id}>
                        <div className={styles.info_table_name}>
                          {m.itemName}
                        </div>
                        <div className={styles.info_table_num}>
                          {CountryCurrencyEnumText[countryId as number]}
                          {formatAmountPercentage(m.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {miscellaneousOpen && (
          <EditMiscellaneousModal
            open={miscellaneousOpen}
            list={miscellaneousList}
            onConfirm={(v) => {
              onEditMiscellaneousModalConfirm(v);
            }}
            modalProps={{
              okText: 'Confirm',
              onCancel: () => {
                setMiscellaneousOpen(false);
              },
            }}
            submitter={{
              submitButtonProps: {
                loading: miscellaneousLoading,
              },
            }}
          />
        )}
        {miscellaneousHistoryOpen && (
          <MiscellaneousHistoryModal
            onCancel={() => {
              setMiscellaneousHistoryOpen(false);
            }}
          />
        )}
      </div>
    </Spin>
  );
}
