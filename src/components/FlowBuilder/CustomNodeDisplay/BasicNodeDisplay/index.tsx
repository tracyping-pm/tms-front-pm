import {
  EditOutlined,
  ExclamationCircleFilled,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useHover } from 'ahooks';
import { Input, InputRef, message } from 'antd';
import cls from 'classnames';
import { FC, useContext, useMemo, useRef, useState } from 'react';

import CustomPopover from '@/components/CustomPopover';
import PubSubContext from '@/context/pubsub';
import _, { map } from 'lodash';
import {
  BuilderContext,
  NodeContext,
  useAction,
  useDrawer,
} from 'react-flow-builder';
import { EnumNodeType, EnumNodeTypeColor } from '../../constant';
import { EventBus } from '../../eventBus';
import { ReactComponent as ApprovalNodeIcon } from '../../static/approvalNode.svg';
import { ReactComponent as BatchNodeIcon } from '../../static/batchNode.svg';
import { ReactComponent as OperationNodeIcon } from '../../static/operationNode.svg';
import DeleteNode from '../DeleteNode';
import styles from './index.less';

const BasicNodeDisplay: FC = () => {
  const node = useContext(NodeContext);

  const { publish } = useContext(PubSubContext);
  const { readonly } = useContext(BuilderContext);
  const { saveDrawer } = useDrawer();
  const { removeNode } = useAction();
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [inputValue, setInputValue] = useState(node.name);
  const [validateNodeSettingStatus, setValidateNodeSettingStatus] =
    useState(false);
  const nodeRef = useRef(null);
  const inputRef = useRef<InputRef>(null);
  const isHovering = useHover(nodeRef);

  const save = (values: any, validateStatusError?: boolean) => {
    const data = node?.data;
    const mergeData = _.merge({}, data, values);
    saveDrawer(mergeData, validateStatusError);
  };

  const Icon = useMemo(() => {
    switch (node.type) {
      case EnumNodeType.OPERATION:
        return <OperationNodeIcon />;
      case EnumNodeType.BRANCH:
        return <BatchNodeIcon />;
      case EnumNodeType.APPROVAL:
        return <ApprovalNodeIcon />;

      default:
        return;
    }
  }, [node.name]);

  const assigneeObj = useMemo(() => {
    const assigneeList = node?.data?.assignee || [];
    const assigneeName = map(assigneeList, (item) => item.name).join(',');
    const nodeName = node?.data?.nodeName;
    setInputValue(nodeName ?? node.name);
    setValidateNodeSettingStatus(!!node.validateStatusError);
    return {
      assigneeName,
    };
  }, [node?.data]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    if (value.length === 0) {
      message.error('Name cannot be empty');
    }
    setInputValue(value);
  };

  const onInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    if (value.length === 0) {
      message.error('Name cannot be empty');
      inputRef.current!.focus({
        cursor: 'end',
      });
      save({ nodeName: undefined }, false);
      return;
    }
    console.log(node);
    save({ nodeName: value }, !!node?.validateStatusError);
    setIsEditing(false);
  };

  return (
    <>
      <CustomPopover
        align={{ offset: [10, -8] }}
        content={'Please complete the required information in the node'}
        placement="topRight"
      >
        {!validateNodeSettingStatus && (
          <ExclamationCircleFilled className={styles.verificationTips} />
        )}
      </CustomPopover>
      <div
        ref={nodeRef}
        id={node.id}
        className={cls(
          'basic-node',
          styles.basicNode,
          !validateNodeSettingStatus && styles.validateLine,
        )}
        style={{
          backgroundColor: EnumNodeTypeColor[node.type as EnumNodeType],
        }}
      >
        {!readonly && (
          <DeleteNode
            isHovering={isHovering}
            showDelete={showDelete}
            setShowDelete={setShowDelete}
            deleteCallback={() => {
              removeNode(node.id);
            }}
          />
        )}

        <div
          className={styles.nodeName}
          style={{
            backgroundColor:
              !readonly && isHovering ? 'rgba(0, 0, 0, 0.20)' : 'transparent',
          }}
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
          {!isEditing && Icon}
          <Input
            ref={inputRef}
            className={cls(
              styles.nodeInput,
              isEditing && styles.hoverNodeInput,
            )}
            readOnly={!isEditing}
            value={inputValue}
            onChange={onInputChange}
            onBlur={onInputBlur}
          />
          {!readonly && isHovering && !isEditing && (
            <EditOutlined className={styles.nodeEditIcon} />
          )}
        </div>
        <div
          className={styles.assignee}
          onClick={() => {
            publish(EventBus.NODE_CLICK, { ...node, readonly });
          }}
        >
          <UserOutlined className={styles.assigneeIcon} />：
          <div className={'ellipsis'}>
            {assigneeObj.assigneeName ? assigneeObj.assigneeName : 'No Data'}
          </div>
          <RightOutlined className={styles.rightIcon} />
        </div>
      </div>
    </>
  );
};

export default BasicNodeDisplay;
