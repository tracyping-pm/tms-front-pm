import cls from 'classnames';
import { FC, useContext } from 'react';
import { NodeContext } from 'react-flow-builder';
import { ReactComponent as IconEnd } from '../../static/end.svg';
import styles from './index.less';
const EndNodeDisplay: FC = () => {
  const node = useContext(NodeContext);
  return (
    <>
      <div className={cls('end-node', styles.endNode)}>
        <IconEnd className={cls('node-icon', styles.nodeIcon)} />
        {node.name}
      </div>
    </>
  );
};

export default EndNodeDisplay;
