import { RightOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';

import { IExecutionNodes } from '@/api/types/subtask';
import NodeDetailsDrawer, { IBuData } from '../NodeDetailsDrawer';
import styles from './common.less';
interface IProcessExecutionTimelineItem {
  executionNodesItem: IExecutionNodes;
  nodeInProgressOrder: number;
  isLastNode: boolean;
  buData: IBuData;
  preExecutionNodeData: IExecutionNodes;
  onLeftShift: (v: boolean) => void;
}

const ProcessExecutionTimelineItem: FC<IProcessExecutionTimelineItem> = ({
  executionNodesItem,
  nodeInProgressOrder,
  buData,
  preExecutionNodeData,
  isLastNode,
  onLeftShift,
}) => {
  const [nodeDetailsDrawerOpen, setNodeDetailsDrawerOpen] =
    useState<boolean>(false);
  const [drawerRecord, setDrawerRecord] = useState<IExecutionNodes>();

  useEffect(() => {
    setDrawerRecord(executionNodesItem);
  }, [executionNodesItem]);

  return (
    <>
      <div
        className={cls(
          styles.nodeWrap,
          executionNodesItem.executed && styles.operation,
          !executionNodesItem.executed &&
            nodeInProgressOrder === drawerRecord?.order &&
            styles.nodeInProgressOrderOperation,
          isLastNode && styles.endLine,
        )}
      >
        <div
          onClick={() => {
            setDrawerRecord(executionNodesItem);
            setNodeDetailsDrawerOpen(true);
            onLeftShift(true);
          }}
        >
          <div className={styles.nodeName}>
            <div className={styles.nodeNameText}>
              {executionNodesItem.nodeName}
            </div>
            <RightOutlined />
          </div>
          <div className={styles.assignee}>
            {executionNodesItem?.assignees?.reduce(
              (
                pre: string,
                cur: { assigneeName: string; transferred: boolean },
                index: number,
              ) => {
                const str = cur.transferred
                  ? ''
                  : `${cur.assigneeName} ${index === executionNodesItem?.assignees.length - 1 || cur.transferred ? '' : ','} `;
                return `${pre}  ${str}`;
              },
              '',
            )}
          </div>
          {!!executionNodesItem.operationTime ? (
            <div className={styles.assignee}>
              {executionNodesItem.operationTime}
            </div>
          ) : null}
        </div>
      </div>
      <NodeDetailsDrawer
        open={nodeDetailsDrawerOpen}
        record={drawerRecord!}
        buData={buData!}
        nodeInProgressOrder={nodeInProgressOrder}
        preExecutionNodeData={preExecutionNodeData}
        onCancel={() => {
          setNodeDetailsDrawerOpen(false);
          onLeftShift(false);
        }}
      />
    </>
  );
};

export default ProcessExecutionTimelineItem;
