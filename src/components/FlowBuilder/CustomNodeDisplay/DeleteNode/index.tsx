import { cloneDeep } from 'lodash';
import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import { BuilderContext, INode, NodeContext } from 'react-flow-builder';
import {
  EnumNodeType,
  branchWrapClassName,
  highlightClassName,
} from '../../constant';
import { ReactComponent as DeleteIcon } from '../../static/delete.svg';
import { findParentByClassName } from '../../utils';
import styles from './index.less';

export interface IDeleteNode {
  isHovering: boolean;
  showDelete: boolean;
  setShowDelete: (val: boolean) => void;
  deleteCallback: () => void;
}

const DeleteNode: FC<IDeleteNode> = ({
  isHovering,
  showDelete,
  setShowDelete,
  deleteCallback,
}) => {
  const { nodes } = useContext(BuilderContext);
  const node = useContext(NodeContext);
  const branchWrapDomRef = useRef<HTMLElement | null>(null);

  const highlightBranchWrap = useCallback(() => {
    if (showDelete) {
      branchWrapDomRef.current?.classList.add(highlightClassName);
    } else {
      branchWrapDomRef.current?.classList.remove(highlightClassName);
    }
  }, [showDelete]);

  const getDeleteBranchParentNode = (path?: string[]): INode | undefined => {
    if (!path || !path.length) {
      return;
    }
    path.pop();
    let currentNode: INode | INode[] | undefined = nodes;
    while (path.length > 2) {
      const i = path.shift();
      path.shift();
      currentNode = currentNode?.[Number(i)]?.children;
    }
    currentNode = currentNode?.[Number(path[0])];
    return currentNode;
  };

  useEffect(() => {
    const id = node.id;
    const nodeDom = document.getElementById(id);
    if (nodeDom) {
      const branchWarpDom = findParentByClassName(nodeDom, branchWrapClassName);
      branchWrapDomRef.current = branchWarpDom;
    }
  }, []);

  useEffect(() => {
    if (node.type === EnumNodeType.BRANCH) {
      highlightBranchWrap();
    } else if (node.type === EnumNodeType.CONDITION) {
      const cloneNode = cloneDeep(node);
      const parentNode = getDeleteBranchParentNode(cloneNode.path);
      if (parentNode?.children?.length === 2) {
        highlightBranchWrap();
      }
    }
  }, [showDelete, node]);

  return (
    <>
      {isHovering && !showDelete && (
        <DeleteIcon
          className={styles.delete}
          onClick={() => {
            setShowDelete(true);
          }}
        />
      )}
      {showDelete && (
        <div className={styles.deleteOverlay}>
          <div
            className={styles.deleteCancel}
            onClick={() => {
              setShowDelete(false);
            }}
          >
            Cancel
          </div>
          <div
            className={styles.deleteSure}
            onClick={(e) => {
              e.stopPropagation();
              deleteCallback();
            }}
          >
            Delete
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteNode;
