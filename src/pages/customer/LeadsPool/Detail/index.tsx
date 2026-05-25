import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import LeadDetailHeader from '../components/LeadDetailHeader';
import LeadDetailOpportunities from '../components/LeadDetailOpportunities';

export default function CustomerDetail() {
  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Lead Pool', path: PATHS.CUSTOMER_LEAD_POOL_LIST },
          { name: 'LeadPool Detail', path: PATHS.CUSTOMER_LEAD_POOL_DETAIL },
        ]}
      />
      <LeadDetailHeader />
      <LeadDetailOpportunities />
    </>
  );
}
