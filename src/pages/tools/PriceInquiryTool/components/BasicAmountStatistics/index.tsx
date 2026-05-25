import { Card, Empty, Statistic } from 'antd';
import { ReactNode } from 'react';
import styles from './index.less';

export interface IBasicAmountStatistics {
  title: string;
  statistics: { label: ReactNode; value: string }[];
}
export default function BasicAmountStatistics({
  title,
  statistics = [],
}: IBasicAmountStatistics) {
  return (
    <>
      <Card title={title}>
        {statistics.length ? (
          <div className={styles.wrap}>
            {statistics.map((item, index) => (
              <div className={styles.statisticItem} key={index}>
                <Statistic
                  title={item.label}
                  value={item.value}
                  formatter={(value) => {
                    return value ? value : '-';
                  }}
                  valueStyle={{ fontSize: '14px' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </>
  );
}
