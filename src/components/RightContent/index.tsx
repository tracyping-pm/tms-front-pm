// @ts-ignore
import { Space } from 'antd';
import React from 'react';

import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess } from '@umijs/max';
import Avatar from './AvatarDropdown';
import ExportCase from './ExportCase';
import News from './News';
import styles from './index.less';

const GlobalHeaderRight: React.FC = () => {
  const access = useAccess();
  return (
    <Space className={styles.right}>
      <Access
        key="export"
        accessible={
          access[PermissionEnum.PROJECT_DETAIL_WAYBILLS_EXPORT] ||
          access[PermissionEnum.EXPORT_WAYBILL]
        }
      >
        <div className="js-download-center">
          <ExportCase />
        </div>
      </Access>

      <div className="js-news">
        <News />
      </div>
      <Avatar />
      {/* {roles?.length > 1 && <Roles />} */}
      {/* <SelectLang className={styles.action} /> */}
    </Space>
  );
};
export default GlobalHeaderRight;
