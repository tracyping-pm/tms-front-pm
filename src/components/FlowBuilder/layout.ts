/**
 * 将树这种数据格式转换为图
 */
// @ts-ignore
import Hierarchy from '@antv/hierarchy';
import LogicFlow from '@logicflow/core';
import { uniqBy } from 'lodash';
import { EnumBPMNNodeType } from './constant';

const FIRST_ROOT_X = 200;
const FIRST_ROOT_Y = 100;

interface ITree extends LogicFlow.NodeConfig {
  children?: ITree[];
}

export const treeToGraph = (
  rootNode: ITree,
  originEdges: LogicFlow.EdgeConfig[],
) => {
  const nodes: ITree[] = [];
  const newEdges: LogicFlow.EdgeConfig[] = [];

  function getNode(current: ITree, parent?: ITree) {
    const node = {
      id: current.id,
      type: current.type,
      x: current.type === EnumBPMNNodeType.END ? rootNode.x : current.x,
      y: current.y,
      properties: current.properties,
    };
    nodes.push(node);
    if (current && current.children && current.children.length > 0) {
      current.children.forEach((subNode) => {
        getNode(subNode, node);
      });
    }
    if (parent) {
      const originEdge = originEdges.filter((edge) => {
        return edge.sourceNodeId === parent.id && edge.targetNodeId === node.id;
      })?.[0];

      const edge = {
        id: originEdge.id,
        properties: originEdge.properties,
        sourceNodeId: parent.id!,
        targetNodeId: node.id!,
        type: 'bpmn:sequenceFlow',
      };
      newEdges.push(edge);
    }
  }
  getNode(rootNode);
  // 去重
  const uniqNodes = uniqBy(nodes, 'id');
  const uniqEdges = uniqBy(newEdges, 'id');

  return {
    nodes: uniqNodes,
    edges: uniqEdges,
  };
};

/**
 * 遍历树的每一项，已传入的回调方法重新构建一个新的树
 */
export const dfsTree = (tree: ITree, callback: (tree: ITree) => ITree) => {
  const newTree = callback(tree);
  if (tree.children && tree.children.length > 0) {
    newTree.children = tree.children.map((treeNode) =>
      dfsTree(treeNode, callback),
    );
  }
  return newTree;
};

/**
 * 由于树这种数据格式本身是没有坐标的
 * 需要使用一些算法来将树转换为有坐标的树
 */
export const layoutTree = (tree: ITree) => {
  if (!tree || !tree.children || tree.children.length === 0) return tree;
  const NODE_SIZE_WIDTH = 100;
  const NODE_SIZE_HEIGHT = 100;
  const deltaX = 40;
  const deltaY = 40;
  // const PEM = 40;
  // tree.isRoot = true;
  const rootNode = Hierarchy.compactBox(tree, {
    direction: 'TB',
    getId(d: ITree) {
      return d.id;
    },
    getHeight() {
      return NODE_SIZE_HEIGHT;
    },
    getWidth() {
      return NODE_SIZE_WIDTH;
    },
    getHGap() {
      return deltaX;
    },
    getVGap() {
      return deltaY;
    },
    getSubTreeSep(d: ITree) {
      if (!d.children || !d.children.length) {
        return 0;
      }
      return deltaX;
    },
  });
  const x = tree.x || FIRST_ROOT_X;
  const y = tree.y || FIRST_ROOT_Y;
  const x1 = rootNode.x;
  const y1 = rootNode.y;
  const moveX = x - x1;
  const moveY = y - y1;
  const newTree = dfsTree(rootNode, (currentNode: ITree) => {
    return {
      ...currentNode,
      id: currentNode.id,
      // text: currentNode.data.text.value,
      properties: currentNode.data.properties,
      type: currentNode.data.type,
      x: currentNode.x + moveX,
      y: currentNode.y + moveY,
    };
  });
  return newTree;
};

export const graphToTree = (graphData: LogicFlow.GraphData): ITree => {
  let tree = null;
  const nodesMap = new Map();
  graphData.nodes.forEach((node) => {
    const treeNode = {
      ...node,
      children: [],
    };
    nodesMap.set(node.id, treeNode);
    if (node.type === EnumBPMNNodeType.START) {
      tree = treeNode;
    }
  });
  graphData.edges.forEach((edge) => {
    const node = nodesMap.get(edge.sourceNodeId);
    const child = nodesMap.get(edge.targetNodeId);
    child.parentId = node.id;
    node.children.push(child);
  });

  return tree!;
};

export const layoutGraphData = (graphData: LogicFlow.GraphData) => {
  const tree = graphToTree(graphData);
  const newTree = layoutTree(tree);
  return treeToGraph(newTree, graphData.edges);
};

export const findPaths = (graphData: LogicFlow.GraphData) => {
  const loop = (
    node: ITree,
    path: LogicFlow.NodeConfig[] = [],
    paths: Array<LogicFlow.NodeConfig[]> = [],
  ) => {
    path.push(node); // 将节点添加到路径

    if (node.children && node.children?.length > 0) {
      node.children.forEach((child) => {
        loop(child, path, paths);
      });
    } else {
      // 如果是叶子节点，将路径添加到结果
      paths.push([...path]);
    }

    path.pop(); // 回溯，移除当前节点
    return paths;
  };

  const tree = graphToTree(graphData);
  const allPaths = loop(tree);
  return allPaths;
};
