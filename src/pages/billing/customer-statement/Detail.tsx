import { statementDetail } from '@/api/billing';
import { IBillingCustomerStatementDetail } from '@/api/types/billing';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { PermissionEnum } from '@/enums/permission';
import { useAccess, useParams } from '@umijs/max';
import { useContext, useEffect, useState } from 'react';
import BillingInfo from '../components/customer/BillingInfo';
import DetailCollectionCard from '../components/customer/DetailCollectionCard';
import DetailHeader from '../components/customer/DetailHeader';
import DetailInvoiceCard from '../components/customer/DetailInvoiceCard';
import DetailProofCard from '../components/customer/DetailProofCard';
import DetailWaybillListCard from '../components/customer/DetailWaybillListCard';
import { EVENT_BILLING_STATEMENT_DETAIL_RELOAD } from '../components/event';

const CustomerStatementDetail = () => {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detailData, setDetailData] = useState<IBillingCustomerStatementDetail>(
    {} as IBillingCustomerStatementDetail,
  );

  const fetchDetail = async () => {
    setLoading(true);
    const res = await statementDetail(+pageId!);
    setLoading(false);
    if (res.code === 200) {
      setDetailData(res.data as IBillingCustomerStatementDetail);
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
            name: 'AR Statement',
            path: PATHS.BILLING_CUSTOMER_STATEMENT,
          },
          {
            name: 'AR Statement Detail',
            path: PATHS.BILLING_CUSTOMER_STATEMENT_DETAIL,
          },
        ]}
      />
      <DetailHeader loading={loading} detail={detailData} />
      {access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING] ? (
        <BillingInfo loading={loading} detail={detailData} />
      ) : null}
      {access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_COLLECTION] ? (
        <DetailCollectionCard detail={detailData} />
      ) : null}

      {access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_INVOICE] ? (
        <DetailInvoiceCard detail={detailData} />
      ) : null}

      {access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_PROOF] ? (
        <DetailProofCard detail={detailData} />
      ) : null}

      {access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL] ? (
        <DetailWaybillListCard isCreatePage={false} detail={detailData} />
      ) : null}
    </>
  );
};

export default CustomerStatementDetail;
