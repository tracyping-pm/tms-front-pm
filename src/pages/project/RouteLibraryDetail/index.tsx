import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import { StoreProvider } from '@/pages/project/RouteLibraryDetail/store';
import RouteLibraryDetailHeader from '@/pages/project/components/RouteLibraryDetailHeader';
import RouteLibraryDetailTabs from '../components/RouteLibraryDetailTabs';

function RouteLibraryDetailMain() {
  // const access = useAccess();
  return (
    <div>
      <BreadcrumbCase
        items={[
          { name: 'Route Libraries', path: PATHS.ROUTE_LIBRARY_LIST },
          { name: 'Details', path: PATHS.ROUTE_LIBRARY_DETAIL },
        ]}
      />
      {/*top info*/}
      <RouteLibraryDetailHeader />
      {/*tabs list*/}
      <RouteLibraryDetailTabs />
    </div>
  );
}

const RouteLibraryDetail = () => {
  return (
    <StoreProvider>
      <RouteLibraryDetailMain />
    </StoreProvider>
  );
};

export default RouteLibraryDetail;
