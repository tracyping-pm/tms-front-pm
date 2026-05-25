import { INode } from 'react-flow-builder';
import { genBpmnId } from './id';

export enum EnumBPMNNodeType {
  START = 'bpmn:startEvent',
  END = 'bpmn:endEvent',
  USER_TASK = 'bpmn:userTask',
}

export enum EnumNodeType {
  START = 'START',
  END = 'END',
  OPERATION = 'OPERATION',
  APPROVAL = 'APPROVAL',
  BRANCH = 'BRANCH',
  CONDITION = 'CONDITION',
}

export const EnumNodeTypeText = {
  [EnumNodeType.APPROVAL]: 'Approval',
  [EnumNodeType.OPERATION]: 'Operation',
  [EnumNodeType.BRANCH]: 'Branch',
  [EnumNodeType.START]: 'Start',
  [EnumNodeType.END]: 'End',
  [EnumNodeType.CONDITION]: 'Condition',
};

export const EnumNodeTypeColor = {
  [EnumNodeType.APPROVAL]: '#FA8C16',
  [EnumNodeType.OPERATION]: '#13C2C2',
  [EnumNodeType.BRANCH]: '#1890FF',
  [EnumNodeType.START]: '',
  [EnumNodeType.END]: '',
  [EnumNodeType.CONDITION]: '',
};

export enum EnumToolType {
  REDO = 'REDO',
  UNDO = 'UNDO',
  ZOOM_OUT = 'ZOOM_OUT',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_RESET = 'ZOOM_RESET',
  BACK_TO_ORIGINAL = 'BACK_TO_ORIGINAL',
  FULL_SCREEN_TOOGLE = 'FULL_SCREEN_TOOGLE',
  DOWNLOAD_XML = 'DOWNLOAD_XML',
}

export interface IZoomConfig {
  zoomValue: number;
  step: number;
  min: number;
  max: number;
  outDisabled: boolean;
  inDisabled: boolean;
}

export const initialZoomConfig: IZoomConfig = {
  zoomValue: 100,
  step: 10,
  min: 50,
  max: 200,
  outDisabled: false,
  inDisabled: false,
};

export const defaultNodes: INode[] = [
  {
    id: `${EnumNodeType.START}_${genBpmnId()}`,
    type: EnumNodeType.START,
    name: EnumNodeTypeText[EnumNodeType.START],
    path: ['0'],
    data: {},
    validateStatusError: true,
  },
  {
    id: `${EnumNodeType.END}_${genBpmnId()}`,
    type: EnumNodeType.END,
    name: EnumNodeTypeText[EnumNodeType.END],
    path: ['1'],
    data: {},
    validateStatusError: true,
  },
];

/**
 * 以包含判断条件的顺序流为例，
 * 在进行导入时，我们需要把<bpmn:sequenceFlow>的子内容<bpmn:conditionExpression>内的属性提取出来，
 * 最终放入父元素bpmn:sequenceFlow的properties属性中
 * 所以导入的时候我们实际需要处理的<bpmn:conditionExpression>中的内容，
 * 它被处理后，数据会被合入bpmn:sequenceFlow的properties属性中
 */
export const BPMNAdapterExtraProps: any = {
  transformer: {
    'bpmn:sequenceFlow': {
      out(data: any) {
        const {
          properties: { expressionType, condition },
        } = data;
        if (condition) {
          if (expressionType === 'cdata') {
            return {
              json: `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${${condition}}]]></bpmn:conditionExpression>`,
            };
          }
          return {
            json: `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">\${nextAct == '${condition}'}</bpmn:conditionExpression>`,
          };
        }
        return {
          json: '',
        };
      },
    },
    // 返回的数据会被合并进父元素bpmn:sequenceFlow的properties属性中
    'bpmn:conditionExpression': {
      in(_key: string, data: any) {
        let condition = '';
        let expressionType = '';
        if (data['#cdata-section']) {
          expressionType = 'cdata';
          condition = /^\$\{(.*)\}$/g.exec(data['#cdata-section'])?.[1] || '';
        } else if (data['#text']) {
          // todo  处理text：${nextAct == '人工任务1'} 只要condition内容
          expressionType = 'normal';
          condition = data['#text'];
        }
        return {
          '-condition': condition,
          '-expressionType': expressionType,
        };
      },
    },
  },
};

export const branchWrapClassName = 'js-branch-wrap';
export const highlightClassName = 'js-node-highlight';
