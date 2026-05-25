import { PlusOutlined } from '@ant-design/icons';
import LogicFlow from '@logicflow/core';
import { BPMNAdapter, BpmnElement, BpmnXmlAdapter } from '@logicflow/extension';
import { useFullscreen, useSetState } from 'ahooks';
import { Button, Popconfirm, Popover } from 'antd';
import cls from 'classnames';
import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import FlowBuilder, {
  IFlowBuilderMethod,
  INode,
  IRegisterNode,
  buildFlatNodes,
} from 'react-flow-builder';
import { ReactComponent as ApprovalNodeIcon } from '../static/approvalNode.svg';
import { ReactComponent as BatchNodeIcon } from '../static/batchNode.svg';
import { ReactComponent as OperationNodeIcon } from '../static/operationNode.svg';
// import NodeSettingDrawer from '../../components/NodeSettingDrawer';
import ApproveNodeDisplay from '../CustomNodeDisplay/ApproveNodeDisplay';
import BranchNodeDisplay from '../CustomNodeDisplay/BranchNodeDisplay';
import ConditionNodeDisplay from '../CustomNodeDisplay/ConditionNodeDisplay';
import EndNodeDisplay from '../CustomNodeDisplay/EndNodeDisplay';
import OperationNodeDisplay from '../CustomNodeDisplay/OperationNodeDisplay';
import StartNodeDisplay from '../CustomNodeDisplay/StartNodeDisplay';
import ToolBar from '../Toolbar';
import {
  BPMNAdapterExtraProps,
  EnumNodeType,
  EnumNodeTypeText,
  EnumToolType,
  IZoomConfig,
  branchWrapClassName,
  defaultNodes,
  initialZoomConfig,
} from '../constant';
import { genBpmnId } from '../id';
import { layoutGraphData } from '../layout';
import { buildGraphData } from '../utils';
import styles from './index.less';

LogicFlow.use(BpmnElement);
LogicFlow.use(BpmnXmlAdapter);
LogicFlow.use(BPMNAdapter, BPMNAdapterExtraProps);

export const registerNodes: IRegisterNode[] = [
  {
    type: EnumNodeType.START,
    name: EnumNodeTypeText[EnumNodeType.START],
    displayComponent: StartNodeDisplay,
    isStart: true,
  },
  {
    type: EnumNodeType.END,
    name: EnumNodeTypeText[EnumNodeType.END],
    displayComponent: EndNodeDisplay,
    isEnd: true,
  },
  {
    type: EnumNodeType.OPERATION,
    name: EnumNodeTypeText[EnumNodeType.OPERATION],
    displayComponent: OperationNodeDisplay,
    customRemove: true,
    addIcon: <OperationNodeIcon style={{ color: '#52C41A' }} />,
    // removeConfirmTitle: 'Confirm to delete this node?',
    initialNodeData: {},
    configComponent: () => {
      return <></>;
    },
  },
  {
    type: EnumNodeType.APPROVAL,
    name: EnumNodeTypeText[EnumNodeType.APPROVAL],
    displayComponent: ApproveNodeDisplay,
    customRemove: true,
    addIcon: <ApprovalNodeIcon style={{ color: '#FA8C16' }} />,
    configComponent: () => {
      return <></>;
    },
  },
  {
    type: EnumNodeType.BRANCH,
    name: EnumNodeTypeText[EnumNodeType.BRANCH],
    className: branchWrapClassName,
    displayComponent: BranchNodeDisplay,
    conditionNodeType: EnumNodeType.CONDITION,
    conditionMaxNum: 10,
    customRemove: true,
    addIcon: <BatchNodeIcon style={{ color: '#1890FF' }} />,
    addConditionIcon: (
      <Button className={styles.conditional}>
        <PlusOutlined />
        Add Conditional Branch
      </Button>
    ),
    configComponent: () => {
      return <></>;
    },
  },
  {
    type: EnumNodeType.CONDITION,
    name: EnumNodeTypeText[EnumNodeType.CONDITION],
    displayComponent: ConditionNodeDisplay,
    customRemove: true,
    configComponent: () => {
      return <></>;
    },
  },
];

interface IProps {
  readonly?: boolean;
  treeNodes?: INode[];
  height?: number | string;
  onChange?: () => void;
  ref?: any;
}

const FlowBuilderPanel: FC<IProps> = forwardRef(
  ({ readonly, treeNodes, height, onChange }, ref) => {
    const logicContainerRef = useRef<HTMLDivElement>(null);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const flowBuilderMethodRef = useRef<IFlowBuilderMethod>(null);
    const [lf, setLf] = useState<LogicFlow>();
    const [nodes, setNodes] = useState<INode[]>([]);
    const [zoomConfig, setZoomConfig] =
      useSetState<IZoomConfig>(initialZoomConfig);
    const [isFullscreen, { toggleFullscreen }] = useFullscreen(
      pageContainerRef,
      {
        pageFullscreen: { zIndex: 9999 },
      },
    );

    const createUuid = (type?: string) => {
      return `${type}_${genBpmnId()}`;
    };

    const onAddNodeSuccess = (type: string, node: INode) => {
      if (type === EnumNodeType.BRANCH) {
        node.children = node.children?.map((item) => {
          return {
            ...item,
            data: {
              condition: `Branch ${
                +(item?.path?.[item?.path.length - 1] ?? 0) + 1
              }`,
            },
            validateStatusError: true,
          };
        });
      } else if (type === EnumNodeType.CONDITION) {
        node.data = {
          condition: `Branch ${
            +(node?.path?.[node?.path.length - 1] ?? 0) + 1
          }`,
        };
        node.validateStatusError = true;
      } else {
        node.validateStatusError = false;
      }
      console.log({ type, node });
    };

    const onRemoveNodeSuccess = (node: INode) => {
      console.log({ node });
    };

    const download = (filename: string, text: string) => {
      let element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
      );
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    };

    // const uploadXML = (ev: any) => {
    //   console.log(ev);
    //   // const file = ev.target.files[0];
    //   // const reader = new FileReader();
    //   // reader.onload = (event) => {
    //   //   if (event.target) {
    //   //     const xml = event.target.result;
    //   //     console.log({ xml });
    //   //     lf.render(xml as any);
    //   //   }
    //   // };
    //   // reader.readAsText(file);
    // };

    const getFlatNodes = () => {
      const flatNodes = buildFlatNodes({
        registerNodes: registerNodes,
        nodes: nodes,
      });

      return flatNodes;
    };

    const getLogicFlowData = (includeNodeData = false) => {
      const flatNodes = getFlatNodes();
      const graphData = buildGraphData(flatNodes, includeNodeData);
      return graphData;
    };

    const getXMLString = () => {
      if (!lf) {
        console.error('Logic Flow Instance cannot be empty!');
        return null;
      }
      const graphData = getLogicFlowData(false);
      const layoutGraphDataValue = layoutGraphData(
        graphData as LogicFlow.GraphData,
      );
      lf.renderRawData({
        nodes: layoutGraphDataValue.nodes,
        edges: layoutGraphDataValue.edges,
      });

      //   获取实例 xml 字符串
      const XMLString = lf.getGraphData() as string;
      return XMLString;
    };

    const handleChange = (newNodes: INode[]) => {
      console.log('nodes change', newNodes);
      setNodes(newNodes);
      onChange?.();
    };

    const onToolBarChange = useCallback(
      (type: EnumToolType, e: any) => {
        console.log({ e });
        switch (type) {
          case EnumToolType.REDO:
            flowBuilderMethodRef.current?.history?.('redo');
            break;

          case EnumToolType.UNDO:
            flowBuilderMethodRef.current?.history?.('undo');
            break;

          case EnumToolType.ZOOM_IN: {
            const { zoomValue, step, max } = zoomConfig;
            let newZoomValue = zoomValue + step;
            if (newZoomValue >= max) {
              newZoomValue = max;
              setZoomConfig({ inDisabled: true });
            } else {
              setZoomConfig({ inDisabled: false });
            }
            setZoomConfig({ zoomValue: newZoomValue, outDisabled: false });
            flowBuilderMethodRef.current?.zoom?.(newZoomValue);
            break;
          }

          case EnumToolType.ZOOM_RESET: {
            let newZoomValue = 100;
            setZoomConfig({
              zoomValue: newZoomValue,
              inDisabled: false,
              outDisabled: false,
            });
            flowBuilderMethodRef.current?.zoom?.(newZoomValue);
            break;
          }

          case EnumToolType.ZOOM_OUT: {
            const { zoomValue, step, min } = zoomConfig;
            let newZoomValue = zoomValue - step;
            if (newZoomValue <= min) {
              newZoomValue = min;
              setZoomConfig({ outDisabled: true });
            } else {
              setZoomConfig({ outDisabled: false });
            }
            setZoomConfig({ zoomValue: newZoomValue, inDisabled: false });
            flowBuilderMethodRef.current?.zoom?.(newZoomValue);
            break;
          }

          case EnumToolType.FULL_SCREEN_TOOGLE: {
            toggleFullscreen();
            break;
          }

          case EnumToolType.BACK_TO_ORIGINAL: {
            const startNode =
              pageContainerRef.current?.querySelector('.start-node');
            if (startNode) {
              startNode.scrollIntoView({ block: 'center' });
            }
            break;
          }

          case EnumToolType.DOWNLOAD_XML: {
            //   获取实例 xml 字符串
            const XMLString = getXMLString();
            const hello = JSON.stringify(XMLString);

            if (XMLString) {
              console.log({ XMLString, hello });
              download('logic-flow.xml', XMLString);
            }

            break;
          }

          // case 'uploadXML':
          //   uploadXML(e);
          //   break;
        }
      },
      [nodes, zoomConfig, pageContainerRef],
    );

    useEffect(() => {
      setNodes(treeNodes ?? defaultNodes);
    }, [treeNodes]);

    useEffect(() => {
      const newLf = new LogicFlow({
        container: logicContainerRef.current as HTMLElement,
        width: 1000,
        height: 800,
      });
      setLf(newLf);
      newLf.setDefaultEdgeType('bpmn:sequenceFlow');
      // // @ts-ignore
      // lf.renderRawData();
    }, []);

    useImperativeHandle(ref, () => ({
      getFlatNodes: () => getFlatNodes(),
      getLogicFlowData: (includeNodeData: boolean) =>
        getLogicFlowData(includeNodeData),
      getXMLString: () => getXMLString(),
    }));

    return (
      <>
        <div
          className={cls('flow-builder-panel', styles.flowBuilderPanel)}
          style={{ height: height ?? '100%' }}
          ref={pageContainerRef}
        >
          <ToolBar
            className="toolbar"
            onChange={onToolBarChange}
            zoomConfig={zoomConfig}
            isFullscreen={isFullscreen}
            useHistory={!readonly}
          />
          <FlowBuilder
            ref={flowBuilderMethodRef}
            readonly={readonly}
            nodes={nodes}
            registerNodes={registerNodes}
            DrawerComponent={() => <></>}
            PopoverComponent={Popover}
            PopconfirmComponent={Popconfirm}
            spaceX={30}
            spaceY={30}
            backgroundColor="#f0f2f5"
            lineColor="#8C8C8C"
            showArrow
            arrowIcon={<div className="arrow-wrap" />}
            sortable={false}
            zoomTool={false}
            historyTool={false}
            scrollByDrag
            showPracticalBranchNode
            showPracticalBranchRemove
            createUuid={createUuid}
            onChange={handleChange}
            onAddNodeSuccess={onAddNodeSuccess}
            onRemoveNodeSuccess={onRemoveNodeSuccess}
          />
        </div>
        <div
          style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
          className={cls('logic-flow-fake-panel', styles.logicFlowFakePanel)}
          ref={logicContainerRef}
        />
      </>
    );
  },
);

export default FlowBuilderPanel;
