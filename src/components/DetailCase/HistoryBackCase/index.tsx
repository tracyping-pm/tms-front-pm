import { ArrowLeftOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button } from 'antd';
import { FC, ReactNode } from 'react';
import styles from './index.less';

export interface IHistoryBackCase {
  children?: ReactNode;
}

const HistoryBackCase: FC<IHistoryBackCase> = ({ children }) => {
  return (
    <>
      <div className={styles.historyBackCase}>
        <div className={styles.left}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            Back
          </Button>
        </div>
        <div className={styles.right}>{children}</div>
      </div>
    </>
  );
};

export default HistoryBackCase;
