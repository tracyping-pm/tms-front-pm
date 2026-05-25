import { useEffect, useMemo, useState } from 'react';

import CustomTabs from '@/components/CustomTabs';
import { ClaimTicketTabKey } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAccess } from '@umijs/max';
import queryString from 'query-string';
import ClaimRequest from './components/ClaimRequest';
import ClaimTicket from './components/ClaimTicket';
import RefundTicket from './components/RefundTicket';
import styles from './index.less';

const ClaimTickets = () => {
  const access = useAccess();
  const [tabKey, setTabKey] = useState<ClaimTicketTabKey>(
    ClaimTicketTabKey.CLAIM_TICKET,
  );

  const tabItems = useMemo(() => {
    return [
      access[PermissionEnum.CLAIM_TICKET]
        ? {
            key: 'claimTicket',
            label: 'Claim Ticket',
            children: <ClaimTicket />,
          }
        : null,
      access[PermissionEnum.REFUND_TICKET]
        ? {
            key: 'refundTicket',
            label: 'Refund Ticket',
            children: <RefundTicket />,
          }
        : null,
      access[PermissionEnum.CLAIM_REQUEST]
        ? {
            key: 'claimRequest',
            label: 'Claim Request',
            children: <ClaimRequest />,
          }
        : null,
    ].filter(Boolean);
  }, []);

  const doFirstQuery = () => {
    const parsed = queryString.parse(location.search);

    const type = parsed?.type as ClaimTicketTabKey;

    if (type) {
      setTabKey(type);
    } else {
      // 取 tabItems 的第一个
      setTabKey(tabItems?.[0]?.key as ClaimTicketTabKey);
    }
  };
  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <div className={styles.content}>
      <CustomTabs
        tabBarClassName={styles.content_tabBar}
        defaultActiveKey={tabKey}
        activeKey={tabKey}
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
  );
};

export default ClaimTickets;
