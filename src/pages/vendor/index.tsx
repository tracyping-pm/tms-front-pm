import { PermissionEnum } from '@/enums/permission';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { Space, Tabs, TabsProps, Tooltip } from 'antd';
import { FC, useMemo, useState } from 'react';
import ContractTracking from './ContractTracking';
import VendorList from './List';
import styles from './index.less';

const VendorHome: FC = () => {
  const access = useAccess();

  const allItems: (NonNullable<TabsProps['items']>[number] & {
    permission: PermissionEnum;
  })[] = [
    {
      key: 'vendor-list',
      label: 'Vendor List',
      children: <VendorList />,
      permission: PermissionEnum.VENDOR_LIST,
    },
    {
      key: 'vendor-contract-tracking',
      label: (
        <Space>
          Vendor Contract Tracking
          <Tooltip
            title={`Displays only "In Progress" projects. For multiple contracts under the same vendor within a project, only one is shown based on these priorities: 1. Longer remaining validity; 2. If ending on the same day, the most recently added one.`}
          >
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      ),
      children: <ContractTracking />,
      permission: PermissionEnum.VENDOR_CONTRACT_TRACKING,
    },
  ];

  const items = useMemo(() => {
    return allItems.filter(
      (item) => access[item.permission as keyof typeof access],
    );
  }, [access]);

  const [tabKey, setTabKey] = useState<string>(items[0]?.key || 'vendor-list');

  const onChange = (key: string) => {
    setTabKey(key);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.vendorHome}>
      <Tabs activeKey={tabKey} items={items} onChange={onChange} />
    </div>
  );
};

export default VendorHome;
