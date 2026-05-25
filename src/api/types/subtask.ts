import {
  FieldTypeEnum,
  SubtaskStatusEnum,
  WaybillDispatchTypeEnum,
} from '@/enums';
import { ICommonMaterial } from './common';

export interface ISubtaskDetailRecord {
  id?: number;
  status: string;
  waybillNumber: string;
  waybillNumberId: number;
  waybillId: number;
  processType: string;
  processName: string;
  dueTime: string;
  result: string;
  currentProgress: string;
  creator: string;
  creationTime: string;
  currentAssignee: string;
  dateTime: string;
  processDefId: number;
}
export interface IAddSubtaskParams {
  processDefId: number;
  buId: number;
  buType: string;
}
export interface IProcInstDetail {
  procInstId: number;
  buId: number;
  waybillNumber: string;
  buType: string;
  subtaskName: string;
  result: string;
  currentProgress: string;
  processScopeName: string;
  currentAssignees: { assigneeName: string; assigneeId: number }[];
  dueTime: string;
  creator: string;
  creationTime: string;
  status: string;
  localeTime: string;
  executionNodes: IExecutionNodes[];
}

export interface IExecutionNodes {
  actTaskDefKey: string;
  nodeName: string;
  nodeType: string;
  assignees: IExecutionNodesAssignee[];
  fields: IFields[];
  actions: { actionName: string; order: number }[];
  operationTime?: string;
  order: number;
  executed: boolean;
  manualAssign: boolean;
  procInstNodeId: number;
  type: string;
}

export interface IExecutionNodesAssignee {
  assigneeId: number;
  assigneeName: string;
  transferred: boolean; //Is transferred
  original: boolean; //Is original assignee
  originAssigneeId?: number;
  originProcInstAssigneeRecordId: number;
}
export interface IFields {
  procInstNodeFieldConfigId?: number;
  fieldName: string;
  fieldValue?: string | any;
  fieldType: FieldTypeEnum;
  valueOptions?: string;
  materials?: ICommonMaterial[];
  order: number;
  fieldOrder: number;
  required: boolean;
}

export interface IFieldOptions {
  title: string;
  name: string;
  order: number;
  value: Record<any, any>;
}

export interface IAssignee {
  id: number;
  key: number;
  label: string;
  name: string;
  value: number;
}
export interface SubtaskProcessTypeRecord {
  processTypeId: number;
  processType: string;
  hasUnfinishedTask: boolean;
  processName: string;
  dueTime: string;
  processDefId: number;
}
export interface SubtaskQueryWaybillRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  waybillNumber: string;
  externalCode: string;
  projectId: number;
  positionTime: string;
  destinationTime: string;
  completionTime: string;
  status: string;
  dispatchType: WaybillDispatchTypeEnum;
  capacityPoolTruckId: number;
  driverId: number;
  remark: string;
  distance: number;
  duration: number;
  routeCode: string;
  exported: boolean;
  deliveredExported: boolean;
  deliveredTime: string;
  statTime: string;
  deleted: boolean;
  vendorTruckId: number;
  creationMethod: number;
  requiredTruckType: number;
  truckTypeConsistency: true;
  actualTruckType: number;
  vendorId: number;
  financialStatus: string;
}
export interface SubtaskCreateParams {
  processDefId: number;
  buId: number;
  buType: string;
  dueTime: string;
  creator: string;
}
export interface ISubtaskListRecord {
  procInstId: number;
  waybillNumber: string;
  waybillId: string;
  subtaskName: string;
  status: string;
  result: string;
  currentProgress: string;
  currentAssignees: { assigneeId: number; assigneeName: string }[];
  dueTime: string;
  completionCancelTime: string;
  creationTime: string;
  creator: string;
}
export interface SubtaskListParams {
  pageNum?: number;
  pageSize?: number;
  buId?: number;
  buType?: string;
  subtaskName?: string;
  status?: SubtaskStatusEnum;
  result?: string;
  currentAssignees?: { assigneeName: string; assigneeId: number }[];
  dueTime?: string;
  completionCancelTime?: string;
  projectName?: string;
  customerName?: string;
  vendorName?: string;
  projectId?: number;
  customerId?: number;
  vendorId?: number;
}
export interface ISubtaskTestFileParams {
  dto: {
    procInstId: number;
    procInstNodeId: number;
    actTaskDefKey: string;
    nodeType: 'Operation' | 'Approval' | 'Branch';
    nodeName: string;
    action: string;
    fieldHandleDtos: [
      {
        fieldName: string;
        fieldType: FieldTypeEnum;
        fieldOrder: number;
        required: boolean;
      },
    ];
  };
}
