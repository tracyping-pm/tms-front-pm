import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import ClaimsList from '../components/ClaimsList';

const Claims: React.FC = () => {
  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'AR Statement', path: PATHS.BILLING_CUSTOMER_STATEMENT },
          { name: 'AR Claim Detail', path: PATHS.BILLING_CUSTOMER_CLAIMS },
        ]}
      />
      <ClaimsList />
    </>
  );
};

export default Claims;
