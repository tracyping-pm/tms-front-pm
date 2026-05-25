import { PlayCircleFilled } from '@ant-design/icons';
import cls from 'classnames';
import { FC, useContext } from 'react';
import { NodeContext } from 'react-flow-builder';
import styles from './index.less';

const StartNodeDisplay: FC = () => {
  const node = useContext(NodeContext);
  return (
    <>
      <div className={cls('start-node', styles.startNode)}>
        <PlayCircleFilled className={cls('node-icon', styles.nodeIcon)} />
        {node.name}
      </div>
    </>
  );
};

export default StartNodeDisplay;
