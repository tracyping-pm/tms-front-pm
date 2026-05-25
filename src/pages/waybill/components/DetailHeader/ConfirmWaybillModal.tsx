import { IWaybillBillingData } from '@/api/types/waybill';
import { toWaybill } from '@/api/waybill';
import { CountryCurrencyEnumText } from '@/enums';
import { formatAmountPercentage } from '@/utils/utils';
import { App, Button, Checkbox, Modal } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useCallback, useState } from 'react';
import styles from './styles.less';

export default function ConfirmWaybillModal({
  hideModal,
  countryId,
  waybillId,
  billingInfo,
  updateBilling,
  updateBasicInfo,
}: {
  hideModal: () => void;
  updateBilling: () => void;
  updateBasicInfo: () => void;
  countryId: number;
  waybillId: number;
  billingInfo: IWaybillBillingData;
}) {
  const { message } = App.useApp();
  const [checked, setChecked] = useState<boolean>(false);
  const CommonTitle = useCallback(
    ({
      borderTop = false,
      label,
      value,
    }: {
      borderTop?: boolean;
      label: string;
      value: string | number;
    }) => {
      return (
        <div
          className={`${
            borderTop
              ? `${styles.commonTitle} ${styles.commonTitle_up}`
              : styles.commonTitle
          }`}
        >
          <div className={styles.commonTitle_label}>{label}</div>
          <div className={styles.commonTitle_value}>
            {CountryCurrencyEnumText?.[countryId]}
            {value}
          </div>
        </div>
      );
    },
    [],
  );

  const CommonLine = useCallback(
    ({ label, value }: { label: string; value: string | number }) => {
      return (
        <div className={styles.commonLine}>
          <div className={styles.commonLine_label}>{label}</div>
          <div className={styles.commonLine_value}>
            {CountryCurrencyEnumText?.[countryId]}
            {value}
          </div>
        </div>
      );
    },
    [],
  );

  const checkChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  const confirmWaybill = async () => {
    if (!checked) {
      message.error('Please check the confirmation checkbox first');
    } else {
      const res = await toWaybill({ id: Number(waybillId) });
      if (res.code === 200) {
        message.success('Confirm Waybill successfully!');
        updateBilling();
        updateBasicInfo();
        hideModal();
      }
    }
  };

  return (
    <Modal
      open
      width={1320}
      maskClosable={false}
      footer={
        <div className={styles.modalFooter}>
          <Checkbox onChange={checkChange}>
            I have confirmed that the waybill information is correct
          </Checkbox>
          <div>
            <Button onClick={hideModal} style={{ marginRight: '24px' }}>
              Cancel
            </Button>
            <Button type="primary" onClick={confirmWaybill}>
              Confirm
            </Button>
          </div>
        </div>
      }
      closable={false}
    >
      <div className={styles.container}>
        <div className={styles.container_title}>Confirm Waybill</div>
        <div className={styles.container_desc}>
          You are confirming the completion of the current waybill. After
          confirmation, the waybill information will not be allowed to be
          modified. Please make sure you have completed all information
          confirmation.
        </div>
        <div className={styles.container_content}>
          <div className={styles.board}>
            <div className={styles.board_header}>
              <div className={styles.board_header_title}>
                Customer Total Amount
              </div>
              <div className={styles.board_header_value}>
                {CountryCurrencyEnumText?.[countryId]}
                {formatAmountPercentage(
                  billingInfo.basicAmountReceivable +
                    billingInfo.additionalAmountReceivable,
                )}
              </div>
            </div>
            <div className={styles.board_content}>
              <CommonTitle
                label="Basic Amount Receivable"
                value={formatAmountPercentage(
                  billingInfo.basicAmountReceivable,
                )}
              />
              <div className={styles.board_content_line}></div>
              <CommonTitle
                label="Additional Amount Receivable"
                value={formatAmountPercentage(
                  billingInfo.additionalAmountReceivable,
                )}
              />
              <div className={styles.board_content_block}>
                {billingInfo?.additionalChargeCustomerList?.map((item) => (
                  <CommonLine
                    key={item.item}
                    label={item.item}
                    value={formatAmountPercentage(item.amount)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.board}>
            <div className={styles.board_header}>
              <div className={styles.board_header_title}>
                Vendor Total Amount
              </div>
              <div className={styles.board_header_value}>
                {CountryCurrencyEnumText?.[countryId]}
                {formatAmountPercentage(
                  billingInfo.basicAmountPayable +
                    billingInfo.additionalAmountPayable,
                )}
              </div>
            </div>
            <div className={styles.board_content_right}>
              <div
                className={styles.board_content_item}
                style={{
                  borderRight: '1px solid #EFF1F4',
                  padding: '0 16px 12px 28px',
                }}
              >
                <CommonTitle
                  label="Basic Amount Payable"
                  value={formatAmountPercentage(billingInfo.basicAmountPayable)}
                />
                <div className={styles.board_content_line}></div>
                <CommonTitle
                  label="Additional Amount Payable"
                  value={formatAmountPercentage(
                    billingInfo.additionalAmountPayable,
                  )}
                />
                <div className={styles.board_content_block}>
                  {billingInfo?.additionalChargeVendorList?.map((item) => (
                    <CommonLine
                      key={item.item}
                      label={item.item}
                      value={formatAmountPercentage(item.amount)}
                    />
                  ))}
                </div>
              </div>
              <div
                className={styles.board_content_item}
                style={{
                  padding: '16px',
                  justifyContent: 'space-around',
                }}
              >
                <CommonTitle
                  label={`Paid in advance (${formatAmountPercentage(
                    billingInfo?.partialPayment?.percentageOfPaidInAdvance,
                  )}%)`}
                  value={formatAmountPercentage(
                    billingInfo?.partialPayment?.paidInAdvance,
                  )}
                />
                <div className={styles.board_content_line}></div>
                <CommonTitle
                  label={`Handling fee(${formatAmountPercentage(
                    billingInfo?.partialPayment?.percentageOfHandlingFee,
                  )}%)`}
                  value={formatAmountPercentage(
                    billingInfo?.partialPayment?.handlingFee,
                  )}
                />
                <div className={styles.board_content_line}></div>
                <CommonTitle
                  label={`Regular Payments(${formatAmountPercentage(
                    billingInfo?.partialPayment?.percentageOfRegularPayments,
                  )}%)`}
                  value={formatAmountPercentage(
                    billingInfo?.partialPayment?.regularPayments,
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container_footer}>
          <div className={styles.container_footer_item}>
            <span>Gross Profit</span>
            <span>
              {CountryCurrencyEnumText?.[countryId]}
              <span
                style={{ color: billingInfo.grossProfit <= 0 ? 'red' : '#000' }}
              >
                {formatAmountPercentage(billingInfo.grossProfit)}
              </span>
            </span>
          </div>
          <div className={styles.container_footer_item}>
            <span>Gross Margin</span>
            <span>{`${formatAmountPercentage(billingInfo.grossMargin)}%`}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
