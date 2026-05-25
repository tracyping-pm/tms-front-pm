import { statementDetail } from '@/api/billing';
import { IBillingVendorStatementDetail } from '@/api/types/billing';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { PermissionEnum } from '@/enums/permission';
import { useAccess, useParams } from '@umijs/max';
import { useContext, useEffect, useState } from 'react';
import { EVENT_BILLING_STATEMENT_DETAIL_RELOAD } from '../components/event';
import BillingInfo from '../components/vendor/BillingInfo';
import DetailHeader from '../components/vendor/DetailHeader';
import DetailInvoiceCard from '../components/vendor/DetailInvoiceCard';
import DetailPaymentCard from '../components/vendor/DetailPaymentCard';
import DetailProofCard from '../components/vendor/DetailProofCard';
import DetailWaybillListCard from '../components/vendor/DetailWaybillListCard';

const CustomerStatementDetail = () => {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detailData, setDetailData] = useState<IBillingVendorStatementDetail>(
    {} as IBillingVendorStatementDetail,
  );

  const fetchDetail = async () => {
    setLoading(true);
    const res = await statementDetail(+pageId!);
    setLoading(false);
    if (res.code === 200) {
      setDetailData(res.data as IBillingVendorStatementDetail);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_BILLING_STATEMENT_DETAIL_RELOAD, () => {
      fetchDetail();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchDetail();
  }, [pageId]);

  return (
    <>
      <BreadcrumbCase
        items={[
          {
            name: 'AP Statement',
            path: PATHS.BILLING_VENDOR_STATEMENT,
          },
          {
            name: 'AP Statement Detail',
            path: PATHS.BILLING_VENDOR_STATEMENT_DETAIL,
          },
        ]}
      />
      <DetailHeader loading={loading} detail={detailData} />
      {access[PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING] ? (
        <BillingInfo loading={loading} detail={detailData} />
      ) : null}

      {access[PermissionEnum.VENDOR_STATEMENT_DETAIL_PAYMENT] ? (
        <DetailPaymentCard detail={detailData} />
      ) : null}

      {access[PermissionEnum.VENDOR_STATEMENT_DETAIL_INVOICE] ? (
        <DetailInvoiceCard detail={detailData} />
      ) : null}

      {access[PermissionEnum.VENDOR_STATEMENT_DETAIL_PROOF] ? (
        <DetailProofCard detail={detailData} />
      ) : null}
      {access[PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL] ? (
        <DetailWaybillListCard isCreatePage={false} detail={detailData} />
      ) : null}
    </>
  );
};

export default CustomerStatementDetail;
