import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess } from '@umijs/max';
import { ConfigProvider } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import BreakdownByMonth from './BreakdownByMonth';
import styles from './index.less';
import Overview from './Overview';
import UnBilledBreakdownByCustomer from './UnBilledBreakdownByCustomer';
import UnCollectedBreakdownByCustomer from './UnCollectedBreakdownByCustomer';

const ARDashboard: FC = () => {
  const access = useAccess();

  return (
    <>
      <div
        className={cls('ar-dashboard-container', styles.arDashboardContainer)}
      >
        <ConfigProvider
          theme={{
            components: {
              Table: {
                cellFontSizeSM: 13,
                cellPaddingBlockSM: 4,
                cellPaddingInlineSM: 4,
              },
            },
          }}
        >
          <Access
            accessible={access[PermissionEnum.AR_STATEMENT_STATISTIC_OVERVIEW]}
          >
            <Overview />
          </Access>

          <Access
            accessible={
              access[PermissionEnum.AR_STATEMENT_STATISTIC_BREAKDOWN_BY_MONTH]
            }
          >
            <BreakdownByMonth />
          </Access>

          <Access
            accessible={
              access[
                PermissionEnum
                  .AR_STATEMENT_STATISTIC_UN_BILLED_BREAKDOWN_BY_CUSTOMER
              ]
            }
          >
            <UnBilledBreakdownByCustomer />
          </Access>

          <Access
            accessible={
              access[
                PermissionEnum
                  .AR_STATEMENT_STATISTIC_UN_COLLECTED_BREAKDOWN_BY_CUSTOMER
              ]
            }
          >
            <UnCollectedBreakdownByCustomer />
          </Access>
        </ConfigProvider>
      </div>
    </>
  );
};

export default ARDashboard;
