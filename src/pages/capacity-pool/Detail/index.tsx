import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess, useParams } from '@umijs/max';
import { useContext } from 'react';
import CapacityPoolDetailHeader from '../components/CapacityPoolDetailHeader';
import CapacityPoolDetailTabs from '../components/CapacityPoolDetailTabs';
import { StateContext, StoreProvider } from './store';
import styles from './styles.less';

const ProjectDetailMain = () => {
  const { id: capacityPoolId } = useParams();
  //@ts-ignore
  const { state } = useContext(StateContext);
  const access = useAccess();
  const projectId = state?.capacityPoolDetail?.data?.projectId;
  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Capacity Pools', path: PATHS.CAPACITY_LIST },
          { name: 'Capacity Pool Detail', path: PATHS.CAPACITY_DETAIL },
        ]}
      />
      {/*top info*/}
      <CapacityPoolDetailHeader />
      {/*tabs list*/}
      <Access
        accessible={
          access[PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_LIST] ||
          access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_LIST] ||
          access[PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_LIST]
        }
      >
        <div className={styles.content}>
          <CapacityPoolDetailTabs
            projectId={projectId}
            capacityPoolId={+capacityPoolId!}
          ></CapacityPoolDetailTabs>
        </div>
      </Access>
    </>
  );
};

const CapacityPoolDetail = () => {
  return (
    <>
      <StoreProvider>
        <ProjectDetailMain />
      </StoreProvider>
    </>
  );
};

export default CapacityPoolDetail;
