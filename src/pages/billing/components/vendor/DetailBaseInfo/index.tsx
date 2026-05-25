import { IBillingVendorStatementDetail } from '@/api/types/billing';
import CommonTitle from '@/components/CommonTitle';
import { InfoListCase } from '@/components/DetailCase';
import {
  VendorSettledItemEnumText,
  VendorStatementStatusEnumText,
} from '@/enums';
import { Spin } from 'antd';
import { memo, useCallback } from 'react';
import styles from './styles.less';

interface IDetailBaseInfo {
  loading: boolean;
  detail: IBillingVendorStatementDetail;
}

export default memo(function DetailBaseInfo({
  loading,
  detail,
}: IDetailBaseInfo) {
  const getSettledItemListString = useCallback(() => {
    if (!detail?.settledItemList) return '';
    let resStr = '';
    detail.settledItemList?.forEach((item) => {
      if (VendorSettledItemEnumText[item]) {
        resStr += VendorSettledItemEnumText[item] + ',';
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
                  label: 'Vendor Name',
                  value: detail?.vendorName,
                },
                {
                  label: `Reconciliation Period${detail?.settlementTimeType ? '(' + detail?.settlementTimeType + ')' : ''}`,
                  value:
                    detail?.reconciliationPeriodStart &&
                    detail?.reconciliationPeriodEnd
                      ? detail?.reconciliationPeriodStart +
                        ' - ' +
                        detail?.reconciliationPeriodEnd
                      : '-',
                  popover: true,
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
                  value: getSettledItemListString(),
                  popover: true,
                },
                {
                  label: 'Invoice Number',
                  value: detail?.invoiceNumber,
                  popover: true,
                },
                {
                  label: 'Status',
                  value:
                    VendorStatementStatusEnumText[detail?.status] || 'Pending',
                },
                {
                  label: 'Project Name',
                  value: detail?.projectName,
                  popover: true,
                },
              ]}
            />
          </div>
        </div>
      </Spin>
    </>
  );
});
