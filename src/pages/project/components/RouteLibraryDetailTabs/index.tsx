import CustomTabs from '@/components/CustomTabs';
import { LAYOUT_HEADER_HEIGHT, ROUTE_LIBRARY_DETAIL_TABS } from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import { useAccess } from '@umijs/max';
import { useEffect, useState } from 'react';
import RouteLibraryDetailTable from '../RouteLibraryDetailTable';
import RouteLibraryDetailCustomerPricing from './components/RouteLibraryDetailCustomerPricing';
import RouteLibraryDetailVendorPricing from './components/RouteLibraryDetailVendorPricing';
import styles from './styles.less';

export default function RouteLibraryDetailTabs() {
  const access = useAccess();
  const [tabKey, setTabKey] = useState<ROUTE_LIBRARY_DETAIL_TABS>(
    ROUTE_LIBRARY_DETAIL_TABS.ROUTES,
  );

  const tabItems = [
    access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES]
      ? {
          key: ROUTE_LIBRARY_DETAIL_TABS.ROUTES,
          label: 'Routes',
          children: <RouteLibraryDetailTable tabKey={tabKey} />,
        }
      : null,
    access[PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_VERSION_TAB]
      ? {
          key: ROUTE_LIBRARY_DETAIL_TABS.CUSTOMERPV,
          label: 'Customer Pricing Version',
          children: <RouteLibraryDetailCustomerPricing />,
        }
      : null,
    access[PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_VERSION_TAB]
      ? {
          key: ROUTE_LIBRARY_DETAIL_TABS.VENDORPV,
          label: 'Vendor Pricing Version',
          children: <RouteLibraryDetailVendorPricing />,
        }
      : null,
  ].filter(Boolean);

  useEffect(() => {
    if (tabItems.length) {
      setTabKey(tabItems?.[0]?.key as ROUTE_LIBRARY_DETAIL_TABS);
    }
  }, []);

  return (
    <div className={styles.content}>
      <CustomTabs
        defaultActiveKey={tabKey}
        tabBarGutter={60}
        // @ts-ignore
        items={tabItems}
        size="large"
        onChange={(key: string) => setTabKey(key as ROUTE_LIBRARY_DETAIL_TABS)}
        useSticky
        offsetTop={LAYOUT_HEADER_HEIGHT + 82}
      />
    </div>
  );
}
