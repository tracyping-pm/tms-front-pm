import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import AdditionalChargeList from '../components/AdditionalChargeList';

const AdditionalChargeDetail: React.FC = () => {
  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'AR Statement', path: PATHS.BILLING_CUSTOMER_STATEMENT },
          {
            name: 'AR Additional Charge Detail',
            path: PATHS.BILLING_CUSTOMER_ADDITIONAL,
          },
        ]}
      />
      <AdditionalChargeList />
    </>
  );
};

export default AdditionalChargeDetail;
