import FlowBuilderPanel from '@/components/FlowBuilder/FlowBuilderPanel';
import { Modal, ModalProps } from 'antd';
import { FC } from 'react';
import { INode } from 'react-flow-builder';

export interface IProps extends ModalProps {
  treeNodes?: INode[];
}

const InstructionModal: FC<IProps> = ({ treeNodes = [], ...restProps }) => {
  return (
    <>
      <Modal
        {...restProps}
        footer={null}
        width={'80%'}
        destroyOnClose
        forceRender
      >
        <div style={{ marginTop: 16 }}>
          <FlowBuilderPanel treeNodes={treeNodes} height={700} readonly />
        </div>
      </Modal>
    </>
  );
};

export default InstructionModal;
