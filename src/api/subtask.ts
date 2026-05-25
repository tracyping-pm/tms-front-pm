import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import {
  IProcInstDetail,
  ISubtaskListRecord,
  SubtaskCreateParams,
  SubtaskListParams,
  SubtaskProcessTypeRecord,
  SubtaskQueryWaybillRecord,
} from './types/subtask';

export const subtaskLikeQueryWaybill = (
  likeWaybillNumber: string,
): RequestPromise<SubtaskQueryWaybillRecord[]> => {
  return request(
    `/api/subtask/likeQueryWaybill?likeWaybillNumber=${likeWaybillNumber}`,
    {
      method: 'post',
    },
  );
};

export const subtaskLikeProcessType = (params: {
  id: string;
}): RequestPromise<SubtaskProcessTypeRecord[]> => {
  return request(`/api/subtask/listProcessType`, {
    method: 'post',
    data: params,
  });
};

export const subtaskCreate = (
  params: SubtaskCreateParams,
): RequestPromise<number[]> => {
  return request(`/api/subtask/create`, {
    method: 'post',
    data: params,
  });
};

export const subtaskList = (
  params: SubtaskListParams,
): RequestPromise<PaginationResponse<ISubtaskListRecord[]>> => {
  return request(`/api/subtask/list`, {
    method: 'post',
    data: params,
  });
};

export const subtaskDetailList = (params: {
  procInstId: number;
  countryId: number;
}): RequestPromise<IProcInstDetail> => {
  return request(`/api/subtask/detail/list`, {
    method: 'post',
    data: params,
  });
};

export const subtaskHandleNode = (params: FormData): RequestPromise<null> => {
  return request(`/api/subtask/handleNode`, {
    method: 'post',
    data: params,
  });
};

export const subtaskInstruction = (params: {
  procInstId: number;
}): RequestPromise<string> => {
  return request(`/api/subtask/instruction?procInstId=${params.procInstId}`, {
    method: 'get',
  });
};

export const subtaskRemind = (params: {
  procInstId: number;
}): RequestPromise<string> => {
  return request(`/api/subtask/remind?procInstId=${params.procInstId}`, {
    method: 'get',
  });
};

export const subtaskOperationLog = (params: {
  procInstId: number;
}): RequestPromise<
  { description: string; createdAt: string; id: number }[]
> => {
  return request(
    `/api/subtask/listOperationLog?procInstId=${params.procInstId}`,
    {
      method: 'get',
    },
  );
};

export const subtaskCancel = (params: {
  procInstId: number;
  buId: number;
}): RequestPromise<null> => {
  return request(`/api/subtask/cancel`, {
    method: 'post',
    data: params,
  });
};
export const subtaskProcessInstanceNodeAssignee = (params: {
  procInstId: number;
  procInstNodeId: number;
  assigneeId: number;
  originAssigneeId: number;
  origin: boolean;
}): RequestPromise<null> => {
  return request(`/api/subtask/processInstance/nodeAssignee`, {
    method: 'post',
    data: params,
  });
};
