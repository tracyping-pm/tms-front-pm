import LogicFlow from '@logicflow/core';
import _ from 'lodash';
import { INode } from 'react-flow-builder';
import { EnumNodeType } from './constant';
import { genBpmnId } from './id';

export const getLogicFlowNodeType = (type: EnumNodeType) => {
  let logicNodeType = '';

  switch (type) {
    case EnumNodeType.START:
      logicNodeType = 'bpmn:startEvent';
      break;
    case EnumNodeType.END:
      logicNodeType = 'bpmn:endEvent';
      break;
    default:
      logicNodeType = 'bpmn:userTask';
      break;
  }
  return logicNodeType;
};

export const getLogicFlowNode = (node: INode, includeNodeData = false) => {
  const nodeData = node.data ?? {};
  const nodeConfig = {
    id: node.id,
    type: getLogicFlowNodeType(node.type as EnumNodeType),
    x: 100,
    y: 100,
    properties: includeNodeData ? nodeData : {},
  };

  return nodeConfig;
};

export const buildGraphData = (
  flatNodes: INode[],
  includeNodeData: boolean = false,
) => {
  const nodes: LogicFlow.NodeConfig[] = [];
  const edges: LogicFlow.EdgeConfig[] = [];
  const nodesMap = new Map();

  // build node
  flatNodes.forEach((node: INode) => {
    nodesMap.set(node.id, node);
    const nodeConfig = getLogicFlowNode(node, includeNodeData);
    nodes.push(nodeConfig);
  });

  // build edge
  flatNodes.forEach((node: INode) => {
    const next = node.next ?? [];
    const nextLen = next.length;
    if (nextLen > 0) {
      next.forEach((nextId) => {
        const nextNode = nodesMap.get(nextId);
        const edgeConfig = {
          id: `Flow_${genBpmnId()}`,
          type: 'bpmn:sequenceFlow',
          sourceNodeId: node.id,
          targetNodeId: nextId,
        };
        if (
          node.type === EnumNodeType.BRANCH &&
          nextNode.type === EnumNodeType.CONDITION
        ) {
          _.set(edgeConfig, 'properties', nextNode.data ?? {});
        }
        edges.push(edgeConfig);
      });
    }
  });

  return {
    nodes,
    edges,
  };
};

export const findParentByClassName = (
  target: HTMLElement,
  className: string,
): HTMLElement | null => {
  if (target?.classList?.contains(className)) {
    return target;
  }

  if (target.parentElement) {
    return findParentByClassName(target.parentElement, className);
  }

  return null;
};

const computeChildrenPath = (children: INode[], parentPath: string[]) => {
  for (let index = 0; index < children.length; index++) {
    const node = children[index];

    node.path = [...parentPath, 'children', String(index)];

    if (Array.isArray(node.children) && node.children.length > 0) {
      computeChildrenPath(node.children, node.path);
    }
  }
};

export const computeNodesPath = (nodes: INode[]) => {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];

    node.path = [String(index)];

    if (Array.isArray(node.children) && node.children.length > 0) {
      computeChildrenPath(node.children, node.path);
    }
  }
  return nodes;
};
