import { IContractTrackingExpireCountData } from '@/api/types/contract';
import { EnumContractExpireStatus } from '@/enums';
import { Col, Row } from 'antd';
import cls from 'classnames';
import { FC, memo } from 'react';
import styles from './index.less';
import { ExpiringDayFilterProps, ExpiringOption } from './types';

const OPTIONS: ExpiringOption[] = [
  {
    key: EnumContractExpireStatus.EXPIRE_WITHIN_30_DAYS,
    label: 'Expiring within 30 days',
  },
  {
    key: EnumContractExpireStatus.EXPIRE_WITHIN_7_DAYS,
    label: 'Expiring within 7 days',
  },
  {
    key: EnumContractExpireStatus.EXPIRE_WITHIN_3_DAYS,
    label: 'Expiring within 3 days',
  },
  { key: EnumContractExpireStatus.EXPIRED, label: 'Expired' },
];

const defaultDataSource: IContractTrackingExpireCountData = {
  expireWithin30Days: 0,
  expireWithin7Days: 0,
  expireWithin3Days: 0,
  expired: 0,
};

const ExpiringDayFilter: FC<ExpiringDayFilterProps> = ({
  value,
  onChange,
  expireFileType = '',
  dataSource = defaultDataSource,
}) => {
  const getStatusClass = (key: EnumContractExpireStatus): string => {
    const keyToClass: Record<EnumContractExpireStatus, string> = {
      [EnumContractExpireStatus.EXPIRE_WITHIN_30_DAYS]: 'status-normal',
      [EnumContractExpireStatus.EXPIRE_WITHIN_7_DAYS]: 'status-warning',
      [EnumContractExpireStatus.EXPIRE_WITHIN_3_DAYS]: 'status-danger',
      [EnumContractExpireStatus.EXPIRED]: 'status-disabled',
    };
    return keyToClass[key] ?? 'status-normal';
  };

  return (
    <div className={styles.expiringDayFilter}>
      <Row gutter={24}>
        {OPTIONS.map((opt) => {
          const isActive = value === opt.key;
          const count = dataSource?.[opt.key] ?? 0;
          const statusClass = getStatusClass(opt.key);

          return (
            <Col span={6} key={opt.key}>
              <div
                className={cls(styles.expiringDay, styles[statusClass], {
                  [styles.active]: isActive,
                })}
                onClick={() => {
                  // if (isActive) return;
                  onChange?.(opt.key);
                }}
              >
                <div
                  className={styles.expiringDayTitle}
                >{`${opt.label} ${expireFileType}`}</div>
                <div className={styles.expiringDayValue}>{count}</div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default memo(ExpiringDayFilter);
