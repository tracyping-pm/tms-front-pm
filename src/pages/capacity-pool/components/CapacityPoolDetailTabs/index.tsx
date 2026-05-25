import CustomTabs from '@/components/CustomTabs';

import { capacityPoolCreate, capacityPoolVendorAdd } from '@/api/capacity';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { CapacityPoolDetailTabsUsePlaceEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { PlusSquareOutlined } from '@ant-design/icons';
import { Access, history, useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App } from 'antd';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import {
  OPS_TYPE,
  StateContext as ProjectStateContext,
} from '../../../project/Detail/store';
import PoolModal from '../../../project/components/PoolModal';
import {
  EVENT_CAPACITY_DETAIL_RELOAD,
  EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD,
  EVENT_CAPACITY_DETAIL_VENDOR_LIST_RELOAD,
} from '../../Detail/events';
import CapacityPoolCrewList from '../CapacityPoolCrewList';
import CapacityPoolTruckList from '../CapacityPoolTruckList';
import CapacityPoolVendorList from '../CapacityPoolVendorList';
import styles from '../common.less';
import AddVendorModal from './AddVendorModal';

interface IState {
  tabKey: string;
  vendorModal: boolean;
  vendorModalLoading: boolean;
}

interface ICapacityPoolDetailTabs {
  capacityPoolId: number;
  projectId: number;
  capacityPoolSource?: CapacityPoolDetailTabsUsePlaceEnum;
}

const CapacityPoolDetailTabs = ({
  capacityPoolId,
  projectId,
  capacityPoolSource = CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL,
}: ICapacityPoolDetailTabs) => {
  const { publish } = useContext(PubSubContext);
  // @ts-ignore
  const { state: projectState, dispatch } = useContext(ProjectStateContext);
  const { message } = App.useApp();
  const access = useAccess();
  const [state, setState] = useSetState<IState>({
    tabKey: 'Vendors',
    vendorModal: false,
    vendorModalLoading: false,
  });
  const [poolModalLoading, setPoolModalLoading] = useState<boolean>(false);

  const tabItems = useMemo(() => {
    const list = [
      access[PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_LIST] ||
      capacityPoolSource !==
        CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
        ? {
            key: 'Vendors',
            label: 'Vendors',
            children: (
              <CapacityPoolVendorList
                capacityPoolId={capacityPoolId}
                projectId={projectId}
                capacityPoolSource={capacityPoolSource}
              />
            ),
          }
        : null,
      access[PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_LIST] ||
      capacityPoolSource !==
        CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
        ? {
            key: 'Trucks',
            label: 'Trucks',
            children: (
              <CapacityPoolTruckList
                capacityPoolId={capacityPoolId}
                projectId={projectId}
                capacityPoolSource={capacityPoolSource}
              />
            ),
          }
        : null,

      access[PermissionEnum.CAPACITY_POOL_DETAIL_CREW_LIST] ||
      capacityPoolSource !==
        CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL
        ? {
            key: 'Crew',
            label: 'Crew',
            children: (
              <CapacityPoolCrewList
                capacityPoolId={capacityPoolId}
                projectId={projectId}
                capacityPoolSource={capacityPoolSource}
              />
            ),
          }
        : null,
    ];
    if (projectId) {
      return list;
    } else {
      return [];
    }
  }, [state.tabKey, projectId]);

  // tab额外按钮
  const TabBarExtraContent = memo((props: { tabKey: string }) => {
    const { tabKey: activeTab } = props;
    switch (activeTab) {
      case 'Vendors':
        return (
          <Access
            accessible={
              access[PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_CREATE]
            }
          >
            {capacityPoolSource ===
            CapacityPoolDetailTabsUsePlaceEnum.CAPACITY_POOLS_DETAIL ? (
              <div
                className={styles.addVendors}
                onClick={() => {
                  setState({
                    vendorModal: true,
                  });
                }}
              >
                <PlusSquareOutlined /> Vendor
              </div>
            ) : null}
          </Access>
        );
      default:
        return null;
    }
  });

  const doCloseCapacityPoolCreateModal = useCallback(() => {
    dispatch({
      type: OPS_TYPE.CREATE_POOL_MODAL,
      payload: {
        open: false,
        data: {},
      },
    });
  }, []);
  const onPoolModalConfirm = useCallback(async (values: any) => {
    const params = {
      poolName: values?.poolName,
      projectId: values?.projectId,
      projectName: values?.projectName,
    };
    setPoolModalLoading(true);
    const res = await capacityPoolCreate(params);
    setPoolModalLoading(false);
    if (res.code === 200) {
      doCloseCapacityPoolCreateModal();
      message.success('Add Pool successfully!');
      history.push(`${PATHS.CAPACITY_DETAIL}/${res.data}`);
    }
  }, []);

  const addVendorModalFinish = async (data: {
    capacityPoolId: number;
    vendorId: number;
  }) => {
    setState({
      vendorModalLoading: true,
    });
    const res = await capacityPoolVendorAdd(data);
    setState({
      vendorModalLoading: false,
    });
    if (res.code === 200) {
      setState({
        vendorModal: false,
      });
      publish(EVENT_CAPACITY_DETAIL_VENDOR_LIST_RELOAD);
      publish(EVENT_CAPACITY_DETAIL_TRUCK_LIST_RELOAD);
      publish(EVENT_CAPACITY_DETAIL_RELOAD);
      message.success(`Add Successfully`);
    }
  };
  return (
    <>
      {/* {capacityPoolId ? ( */}
      <CustomTabs
        defaultActiveKey={state.tabKey}
        tabBarGutter={60}
        items={tabItems as any[]}
        size="large"
        onChange={(key: string) => {
          setState({
            tabKey: key,
          });
        }}
        tabBarExtraContent={<TabBarExtraContent tabKey={state.tabKey} />}
        useSticky
        offsetTop={LAYOUT_HEADER_HEIGHT + 82}
      />
      {/* ) : (
        <div className={styles.empty}>
          <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <pre className={styles.description}>
            {'No data\nPlease Create Pool'}
          </pre>
        </div>
      )} */}

      <AddVendorModal
        open={state.vendorModal}
        onConfirm={addVendorModalFinish}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            setState({
              vendorModal: false,
            });
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: state.vendorModalLoading,
          },
        }}
      />
      {capacityPoolSource ===
        CapacityPoolDetailTabsUsePlaceEnum.PROJECT_DETAIL_CAPACITY_POOLS && (
        <PoolModal
          title={'Create Pool'}
          isEdit={false}
          record={{
            projectId: projectState?.projectDetail?.data?.id,
            projectName: projectState?.projectDetail?.data?.projectName,
          }}
          open={projectState?.capacityPoolCreateModal?.open}
          onConfirm={onPoolModalConfirm}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              doCloseCapacityPoolCreateModal();
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: poolModalLoading,
            },
          }}
        />
      )}
    </>
  );
};

export default CapacityPoolDetailTabs;
