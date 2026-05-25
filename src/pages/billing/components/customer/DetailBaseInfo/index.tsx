import { IBillingCustomerStatementDetail } from '@/api/types/billing';
import CommonTitle from '@/components/CommonTitle';
import { InfoListCase } from '@/components/DetailCase';
import {
  CustomerSettledItemEnumText,
  CustomerStatementStatusEnumText,
} from '@/enums';
import { Spin } from 'antd';
import { memo, useCallback } from 'react';
import styles from './styles.less';

interface IDetailBaseInfo {
  loading: boolean;
  detail: IBillingCustomerStatementDetail;
}

export default memo(function DetailBaseInfo({
  loading,
  detail,
}: IDetailBaseInfo) {
  const getSettledItemListString = useCallback(() => {
    if (!detail?.settledItemList) return '-';
    let resStr = '';
    detail.settledItemList?.forEach((item) => {
      if (CustomerSettledItemEnumText[item]) {
        resStr += CustomerSettledItemEnumText[item] + ',';
      }
    });
    if (resStr) resStr = resStr.slice(0, -1);
    return resStr;
  }, [detail]);

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          <div className={styles.header_top}>
            <CommonTitle title="Basic Info." />
          </div>
          <div className={styles.infoWrap}>
            <InfoListCase
              justify="start"
              infoList={[
                {
                  label: 'Statement Number',
                  value: detail?.number,
                },
                {
                  label: 'Customer Name',
                  value: detail?.customerName,
                },
                {
                  label: `Reconciliation Period${detail?.settlementTimeType ? '(' + detail?.settlementTimeType + ')' : ''}`,
                  popover: true,
                  value:
                    detail?.reconciliationPeriodStart &&
                    detail?.reconciliationPeriodEnd
                      ? detail?.reconciliationPeriodStart +
                        ' - ' +
                        detail?.reconciliationPeriodEnd
                      : '-',
                },
                {
                  label: 'Creation Time',
                  value: detail?.createdAt,
                },
                {
                  label: 'Creator',
                  value: detail?.creator,
                },
                {
                  label: 'Items to be settled',
                  popover: true,
                  value: getSettledItemListString(),
                },
                {
                  label: 'Invoice Number',
                  popover: true,
                  value: detail?.invoiceNumber,
                },
                {
                  label: 'Status',
                  value:
                    CustomerStatementStatusEnumText[detail?.status] ||
                    'Pending',
                },
                {
                  label: 'Project Name',
                  popover: true,
                  value: detail?.projectName,
                },
              ]}
            />
          </div>
        </div>
      </Spin>
    </>
  );
});
