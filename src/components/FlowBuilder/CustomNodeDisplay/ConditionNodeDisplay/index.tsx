import { EditOutlined } from '@ant-design/icons';
import { useHover } from 'ahooks';
import { Input, InputRef, message } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import {
  BuilderContext,
  INode,
  NodeContext,
  useAction,
  useDrawer,
} from 'react-flow-builder';
import DeleteNode from '../DeleteNode';
import styles from './index.less';

const ConditionNodeDisplay: FC = () => {
  const { nodes, readonly } = useContext(BuilderContext);
  const node = useContext(NodeContext);
  const { saveDrawer } = useDrawer();
  const { removeNode } = useAction();
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [inputValue, setInputValue] = useState(
    `Branch ${+(node?.path?.[node?.path.length - 1] ?? 0) + 1}`,
  );

  const nodeRef = useRef(null);
  const inputRef = useRef<InputRef>(null);
  const isHovering = useHover(nodeRef);

  const save = (values: any, validateStatusError?: boolean) => {
    const data = node.data;
    const mergeData = _.merge({}, data, values);
    saveDrawer(mergeData, validateStatusError);
  };

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

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setInputValue(value);
  };

  const checkBranchNameRepeat = (value: string): boolean | undefined => {
    const cloneNode = _.cloneDeep(node);
    const parentNode = getDeleteBranchParentNode(cloneNode.path);
    return parentNode?.children?.some(
      (item) => item.id !== node.id && item.data?.condition === value,
    );
  };

  const onInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    const isBranchNameRepeat = checkBranchNameRepeat(value);
    if (value.length === 0 || isBranchNameRepeat) {
      const msg = isBranchNameRepeat
        ? 'Multiple branches with the same name are not allowed'
        : 'Condition cannot be empty';
      message.error(msg);
      inputRef.current!.focus({
        cursor: 'end',
      });
      save?.({ condition: undefined }, false);
      return;
    }

    save?.({ condition: value }, true);
    setIsEditing(false);
  };

  const deleteBranch = () => {
    const cloneNode = _.cloneDeep(node);
    const parentNode = getDeleteBranchParentNode(cloneNode.path);
    if (
      !parentNode ||
      (parentNode?.children && parentNode.children?.length > 2)
    ) {
      removeNode();
    } else {
      const nodeIds = parentNode?.children?.map((item) => {
        return item.id;
      });
      removeNode(nodeIds);
    }
  };

  useEffect(() => {
    if (!node.data?.condition) {
      setInputValue(
        `Branch ${+(node?.path?.[node?.path.length - 1] ?? 0) + 1}`,
      );
    } else {
      setInputValue(node.data.condition);
    }
  }, [node?.path?.[node?.path.length - 1]]);

  return (
    <>
      <div
        id={node.id}
        ref={nodeRef}
        className={cls('condition-node', styles.conditionNode)}
      >
        {!readonly && (
          <DeleteNode
            isHovering={isHovering}
            showDelete={showDelete}
            setShowDelete={setShowDelete}
            deleteCallback={deleteBranch}
          />
        )}
        {/* {isHovering && !showDelete && (
          <DeleteIcon
            className={styles.delete}
            onClick={() => setShowDelete(true)}
          />
        )}
        {showDelete && (
          <div className={styles.deleteOverlay}>
            <div
              className={styles.deleteCancel}
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </div>
            <div className={styles.deleteSure} onClick={deleteBranch}>
              Delete
            </div>
          </div>
        )} */}
        <div
          className={styles.nodeName}
          onClick={() => {
            if (readonly) {
              return;
            }
            inputRef.current!.focus({
              cursor: 'end',
            });
            setIsEditing(true);
          }}
        >
          <Input
            ref={inputRef}
            className={cls(
              styles.nodeInput,
              isEditing && styles.nodeInputFocus,
            )}
            readOnly={!isEditing}
            value={inputValue}
            onChange={onInputChange}
            onBlur={onInputBlur}
          />
          {!readonly && isHovering && !isEditing && !showDelete && (
            <EditOutlined className={styles.nodeEditIcon} />
          )}
        </div>
      </div>
    </>
  );
};

export default ConditionNodeDisplay;
