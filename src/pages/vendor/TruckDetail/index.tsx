import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomTabs from '@/components/CustomTabs';
import { LAYOUT_HEADER_HEIGHT, PATHS, TRUCK_TAB_LIST } from '@/constants';

import { ApplicationTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import TruckDetailAccreditation from '@/pages/vendor/components/TruckDetailAccreditation';
import VendorTruckDetailHeader from '@/pages/vendor/components/VendorTruckDetailHeader';
import { PlusOutlined } from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import { memo, useState } from 'react';
import ApplicationList from '../Application';
import styles from './styles.less';

export default function VendorTruckDetail() {
  const access = useAccess();
  const [tabKey, setTabKey] = useState<string>('accreditation');
  const [detailRefresh, setDetailRefresh] = useState<boolean>(false);
  const [addAccreditation, setAddAccreditation] = useState<boolean>(false);

  // tab额外按钮
  const TabBarExtraContent = memo((props: { tabKey: string }) => {
    const { tabKey: activeTab } = props;
    switch (activeTab) {
      case TRUCK_TAB_LIST.ACCREDITATION:
        return (
          <Access
            key="materialType"
            accessible={access[PermissionEnum.TRUCK_DETAIL_ACCREDITATION_EDIT]}
          >
            <div
              className={styles.addContact}
              onClick={() => setAddAccreditation(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Material Type
            </div>
          </Access>
        );

      default:
        return null;
    }
  });

  const tabItems = [
    access[PermissionEnum.TRUCK_DETAIL_ACCREDITATION]
      ? {
          key: 'accreditation',
          label: 'Accreditation',
          children: (
            <TruckDetailAccreditation
              showModal={addAccreditation}
              setShowModal={setAddAccreditation}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,
    access[PermissionEnum.TRUCK_DETAIL_APPLICATION]
      ? {
          key: 'accreditationApplication',
          label: 'Accreditation Application',
          children: (
            <ApplicationList
              source={ApplicationTypeEnum.TRUCK}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Trucks', path: PATHS.VENDOR_TRUCK_LIST },
          { name: 'Truck Detail', path: PATHS.VENDOR_TRUCK_DETAIL },
        ]}
      />
      <VendorTruckDetailHeader detailRefresh={detailRefresh} />
      <Access
        key="tab"
        accessible={
          access[PermissionEnum.TRUCK_DETAIL_ACCREDITATION] ||
          access[PermissionEnum.TRUCK_DETAIL_APPLICATION]
        }
      >
        <div className={styles.content}>
          <CustomTabs
            defaultActiveKey={tabKey}
            tabBarGutter={60}
            // @ts-ignore
            items={tabItems}
            size="large"
            onChange={(key: string) => setTabKey(key)}
            useSticky
            offsetTop={LAYOUT_HEADER_HEIGHT + 82}
            tabBarExtraContent={<TabBarExtraContent tabKey={tabKey} />}
          />
        </div>
      </Access>
    </>
  );
}
