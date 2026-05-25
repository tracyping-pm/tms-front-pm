import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import PubSubContext from '@/context/pubsub';
import { LeadStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import CustomerDetailOpportunity from '@/pages/customer/components/CustomerDetailOpportunity';
import { EVENT_LEAD_DATA } from '@/pages/customer/events';
import { Access, useAccess } from '@umijs/max';
import { useContext, useEffect, useState } from 'react';
import styles from './styles.less';
export default function LeadDetailOpportunities() {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const [showAddOpportunity, setShowAddOpportunity] = useState<boolean>(false);
  const [leadStatus, setLeadStatus] = useState<LeadStatusEnum>();
  const [leadName, setLeadName] = useState<string>();

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_LEAD_DATA, (data) => {
      setLeadName(data.customerName);
      setLeadStatus(data.leadStatus);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Access accessible={access[PermissionEnum.LEAD_DETAIL_OPPORTUNITIES]}>
        <div className={styles.main}>
          <CommonTitle
            title={'Opportunities'}
            extra={
              leadStatus !== LeadStatusEnum.SUCCESSFUL_CLOSED ? (
                <Access
                  key="create"
                  accessible={
                    access[PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_ADD]
                  }
                >
                  <CustomStatusButton
                    noStyle
                    onClick={() => setShowAddOpportunity(true)}
                  >
                    Create Opportunity
                  </CustomStatusButton>
                </Access>
              ) : null
            }
          />
          <CustomerDetailOpportunity
            showModal={showAddOpportunity}
            setShowModal={setShowAddOpportunity}
            leadName={leadName}
          />
        </div>
      </Access>
    </>
  );
}
