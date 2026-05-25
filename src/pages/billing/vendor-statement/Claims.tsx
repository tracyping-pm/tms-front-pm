import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import ClaimsList from '../components/ClaimsList';

const Claims: React.FC = () => {
  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'AP Statement', path: PATHS.BILLING_VENDOR_STATEMENT },
          { name: 'AP Claim Detail', path: PATHS.BILLING_VENDOR_CLAIMS },
        ]}
      />
      <ClaimsList />
    </>
  );
};

export default Claims;
