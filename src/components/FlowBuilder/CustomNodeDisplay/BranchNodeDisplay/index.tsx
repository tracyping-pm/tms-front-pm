import cls from 'classnames';
import { FC } from 'react';
import BasicNodeDisplay from '../BasicNodeDisplay';
import styles from './index.less';

const BranchNodeDisplay: FC = () => {
  return (
    <>
      <div className={cls('branch-node', styles.branchNode)}>
        <BasicNodeDisplay />
      </div>
    </>
  );
};

export default BranchNodeDisplay;
