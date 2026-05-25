import CustomTabs from '@/components/CustomTabs';
import { ClaimTicketTabKey, VendorStatementStatusEnum } from '@/enums';

import { statementDetail } from '@/api/billing';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ClaimTicketList from '../../components/ClaimTicketList';
import RefundTicketList from '../../components/RefundTicketList';
import styles from './index.less';

const ClaimTicket = () => {
  const { id: pageId } = useParams();
  const [tabKey, setTabKey] = useState<ClaimTicketTabKey>(
    ClaimTicketTabKey.CLAIM_TICKET,
  );

  const [statementStatus, setStatementStatus] =
    useState<VendorStatementStatusEnum>();

  const fetchDetail = async () => {
    const res = await statementDetail(+pageId!);

    if (res.code === 200) {
      setStatementStatus(res.data.status as VendorStatementStatusEnum);
    }
  };

  const tabItems = useMemo(() => {
    return [
      true
        ? {
            key: 'claimTicket',
            label: 'Claim Ticket',
            children: (
              <ClaimTicketList
                statementType="AP"
                statementStatus={statementStatus!}
              />
            ),
          }
        : null,
      true
        ? {
            key: 'refundTicket',
            label: 'Refund Ticket',
            children: (
              <RefundTicketList
                statementType="AP"
                statementStatus={statementStatus!}
              />
            ),
          }
        : null,
    ].filter(Boolean);
  }, [statementStatus]);

  useEffect(() => {
    fetchDetail();
  }, []);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'AP Statement', path: PATHS.BILLING_VENDOR_STATEMENT },
          { name: 'AP Claim Ticket', path: PATHS.BILLING_VENDOR_CLAIMS_TICKET },
        ]}
      />
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <div className="left">
            <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
              Back
            </Button>
          </div>
        </div>
        <CustomTabs
          tabBarClassName={styles.content_tabBar}
          defaultActiveKey={tabKey}
          destroyInactiveTabPane={true}
          // @ts-ignore
          items={tabItems}
          size="large"
          onChange={(key) => {
            setTabKey(key as ClaimTicketTabKey);
          }}
          useSticky
        />
      </div>
    </>
  );
};

export default ClaimTicket;
