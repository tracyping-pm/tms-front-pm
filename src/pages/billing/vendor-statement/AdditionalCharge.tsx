import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import AdditionalChargeList from '../components/AdditionalChargeList';

const AdditionalChargeDetail: React.FC = () => {
  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'AP Statement', path: PATHS.BILLING_VENDOR_STATEMENT },
          {
            name: 'AP Additional Charge Detail',
            path: PATHS.BILLING_VENDOR_ADDITIONAL,
          },
        ]}
      />
      <AdditionalChargeList />
    </>
  );
};

export default AdditionalChargeDetail;
