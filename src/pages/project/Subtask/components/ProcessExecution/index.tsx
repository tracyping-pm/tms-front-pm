import { CheckOutlined, UserOutlined } from '@ant-design/icons';

import { subtaskInstruction } from '@/api/subtask';
import { IExecutionNodes } from '@/api/types/subtask';
import CustomStatusButton from '@/components/CustomStatusButton';
import {
  defaultNodes,
  EnumNodeTypeText,
} from '@/components/FlowBuilder/constant';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Steps } from 'antd';
import cls from 'classnames';
import _, { cloneDeep } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { buildTreeNodes, INode } from 'react-flow-builder';
import { IBuData } from '../NodeDetailsDrawer';
import styles from './common.less';
import InstructionModal from './InstructionModal';
import ProcessExecutionTimelineItem from './ProcessExecutionTimelineItem';

import { ReactComponent as SubtaskProcessIcon } from '../../../../../../public/svg/subtask_process.svg';
interface IInstructionModalState {
  open: boolean;
  treeNodes: INode[];
  pending: boolean;
}

const initialInstructionModalState: IInstructionModalState = {
  open: false,
  treeNodes: [],
  pending: false,
};
interface IProcessExecution {
  executionNodes: IExecutionNodes[];
  buData: IBuData;
}
const ProcessExecution = ({ executionNodes, buData }: IProcessExecution) => {
  const { id: procInstId } = useParams();
  const [instructionModalState, setInstructionModalState] =
    useSetState<IInstructionModalState>(initialInstructionModalState);
  const [timeLineData, setTimeLineData] = useState<IExecutionNodes[]>([]);
  const [currentNodeOrder, setCurrentNodeOrder] = useState<number>(0);
  const [isLeftShift, setIsLeftShift] = useState<boolean>(false);

  const showInstruction = useCallback(async () => {
    setInstructionModalState({ pending: true });
    const res = await subtaskInstruction({
      procInstId: Number(procInstId),
    }).finally(() => {
      setInstructionModalState({ pending: false });
    });

    if (res.code === 200) {
      const bpmJson = res.data ?? '[]';
      const flatNodes = JSON.parse(bpmJson);
      if (flatNodes.length > 0) {
        const nodes = buildTreeNodes({ nodes: flatNodes });
        setInstructionModalState({
          open: true,
          treeNodes: nodes,
        });
      } else {
        const nodes = _.cloneDeep(defaultNodes);
        setInstructionModalState({
          open: true,
          treeNodes: nodes,
        });
      }
    }
  }, []);

  const initData = () => {
    const order = executionNodes?.find((item) => !item.executed)?.order ?? 0;

    const idx = executionNodes?.findIndex(
      (item) => item.nodeType === EnumNodeTypeText.BRANCH && !item.executed,
    );

    setCurrentNodeOrder(order);
    let _executionNodes = cloneDeep(executionNodes);
    if (idx !== -1) {
      _executionNodes = _executionNodes?.slice(0, idx + 1);
      //@ts-ignore
      _executionNodes?.push({
        type: 'NO_EXECUTED_BATCH',
      });
    }
    setTimeLineData(_executionNodes);
  };

  useEffect(() => {
    initData();
  }, [executionNodes]);

  return (
    <>
      <div className={cls(styles.card, 'card')}>
        <div className={styles.card_header}>
          <div className={styles.card_header_left}>Process Execution</div>
          <div className={styles.card_header_right}>
            <CustomStatusButton
              noStyle
              loading={instructionModalState.pending}
              onClick={() => {
                showInstruction();
              }}
            >
              Instruction
            </CustomStatusButton>
          </div>
        </div>
        <div
          className={styles.wrap}
          style={{ paddingLeft: isLeftShift ? '15%' : '45%' }}
        >
          {timeLineData?.length > 0 ? (
            <Steps
              className={styles.wrapSteps}
              direction="vertical"
              current={currentNodeOrder + 1}
              items={[
                {
                  icon: (
                    <UserOutlined style={{ fontSize: 32, color: '#52C41A' }} />
                  ),
                  title: (
                    <div className={cls(styles.startAndEnd, styles.operation)}>
                      Start
                    </div>
                  ),
                },

                ...timeLineData?.map((item: IExecutionNodes, index) => {
                  return {
                    icon: item.executed ? (
                      <div className={styles.subtaskCheckOutlined}>
                        <CheckOutlined />
                      </div>
                    ) : !item.type ? (
                      <div
                        className={cls(
                          styles.serialNumber,
                          currentNodeOrder === item.order &&
                            styles.nodeInProgressSerialNumber,
                        )}
                      >
                        {item.order + 1}
                      </div>
                    ) : (
                      <SubtaskProcessIcon className={styles.noExecuted} />
                    ),
                    title: !item.type ? (
                      <ProcessExecutionTimelineItem
                        executionNodesItem={item}
                        buData={buData}
                        nodeInProgressOrder={currentNodeOrder!}
                        isLastNode={item.order === timeLineData?.length - 1}
                        preExecutionNodeData={timeLineData[index - 1]}
                        onLeftShift={(v: boolean) => {
                          setIsLeftShift(v);
                        }}
                      />
                    ) : (
                      <div
                        className={cls(
                          styles.startAndEnd,
                          styles.startEnd,
                          styles.noExecutedNode,
                        )}
                      ></div>
                    ),
                  };
                }),

                {
                  icon: (
                    <UserOutlined style={{ fontSize: 32, color: '#52C41A' }} />
                  ),
                  title: (
                    <div className={cls(styles.startAndEnd, styles.startEnd)}>
                      End
                    </div>
                  ),
                },
              ]}
            />
          ) : null}
        </div>
      </div>

      <InstructionModal
        title={'Instruction'}
        maskClosable={false}
        open={instructionModalState.open}
        treeNodes={instructionModalState.treeNodes}
        onCancel={() => setInstructionModalState({ open: false })}
      />
    </>
  );
};

export default ProcessExecution;
