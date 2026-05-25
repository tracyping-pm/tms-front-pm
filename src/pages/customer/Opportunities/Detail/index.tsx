import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import OpportunitiesDetailCustomer from '../components/OpportunitiesDetailCustomer';
import OpportunitiesDetailHeader from '../components/OpportunitiesDetailHeader';
import OpportunitiesDetailRecords from '../components/OpportunitiesDetailRecords';
import { StoreProvider } from '../store';

const OpportunitiesDetail = () => {
  return (
    <StoreProvider>
      <BreadcrumbCase
        items={[
          { name: 'Opportunities', path: PATHS.OPPORTUNITIES_LIST },
          {
            name: 'Opportunities Detail',
            path: PATHS.OPPORTUNITIES_LIST_DETAIL,
          },
        ]}
      />
      <OpportunitiesDetailHeader />
      <OpportunitiesDetailCustomer />
      <OpportunitiesDetailRecords />
    </StoreProvider>
  );
};

export default OpportunitiesDetail;
