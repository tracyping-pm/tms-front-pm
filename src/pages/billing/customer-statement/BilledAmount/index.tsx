import { IStatementEditAmountPayload } from '@/api/types/billing';
import { useState } from 'react';
import BilledAmountHeader from './BilledAmountHeader.';
import BilledAmountTable from './BilledAmountTable';
import styles from './common.less';

export default function BilledAmount() {
  const [searchData, setSearchData] = useState<any>();
  const [amountChangeData, getAmountChargeData] =
    useState<IStatementEditAmountPayload[]>();
  const [amountReimbursementChangeData, getAmountReimbursementChargeData] =
    useState<IStatementEditAmountPayload[]>();
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [editReimbursementStatus, setEditReimbursementStatus] =
    useState<boolean>(false);

  return (
    <>
      <div className={styles.billedAmount}>
        <BilledAmountHeader
          amountChangeData={amountChangeData!}
          amountReimbursementChangeData={amountReimbursementChangeData!}
          onSearchHandle={(v) => {
            setSearchData(v);
          }}
          onGetEditStatusHandle={(v) => {
            setEditStatus(v);
          }}
          onGetEditReimbursementStatusHandle={(v) => {
            setEditReimbursementStatus(v);
          }}
        />

        <BilledAmountTable
          searchData={searchData}
          editStatus={editStatus}
          editReimbursementStatus={editReimbursementStatus}
          getAmountChargeData={(v) => {
            getAmountChargeData(v);
          }}
          getAmountReimbursementChargeData={(v) => {
            getAmountReimbursementChargeData(v);
          }}
        />
      </div>
    </>
  );
}
