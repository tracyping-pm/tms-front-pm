import cls from 'classnames';
import { FC } from 'react';
import BasicNodeDisplay from '../BasicNodeDisplay';
import styles from './index.less';

const ApproveNodeDisplay: FC = () => {
  return (
    <>
      <div className={cls('approve-node', styles.approveNode)}>
        <BasicNodeDisplay />
        {/* {node.name} */}
      </div>
    </>
  );
};

export default ApproveNodeDisplay;
