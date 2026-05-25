import { RequestPromise } from '@/api/types/common';
import { request } from '@umijs/max';
import { ICustomerUserRoleRecord } from './types/customer';
import {
  ICreateEditLeadParams,
  ILeadDetail,
  ILeadFunnelPerson,
  ILeadListItem,
  ILeadListParams,
  ILeadTransferParams,
} from './types/lead';

export const leadFunnelPerson = (): RequestPromise<ILeadFunnelPerson[]> => {
  return request(`/api/crm/statistic/lead/funnel/person`, {
    method: 'post',
  });
};

export const leadList = (
  params: ILeadListParams,
): RequestPromise<PaginationResponse<ILeadListItem>> => {
  return request(`/api/lead/list`, {
    method: 'post',
    data: params,
  });
};

export const checkLeadCustomerName = (params: {
  customerName: string;
}): RequestPromise<{
  code: number;
  msg: string;
}> => {
  return request(`/api/lead/check-duplicate-name`, {
    method: 'post',
    data: params,
  });
};

export const leadCreate = (
  params: ICreateEditLeadParams,
): RequestPromise<{
  code: number;
  msg: string;
}> => {
  return request(`/api/lead/create`, {
    method: 'post',
    data: params,
  });
};

export const leadUpdate = (
  params: ICreateEditLeadParams,
): RequestPromise<{
  code: number;
  msg: string;
}> => {
  return request(`/api/lead/update`, {
    method: 'post',
    data: params,
  });
};

export const leadUserRoleList = (params: {
  pageNum?: number;
  pageSize?: number;
  userAliasName?: string;
}): RequestPromise<PaginationResponse<ICustomerUserRoleRecord>> => {
  return request(`/api/lead/transfer-list`, {
    method: 'post',
    data: params,
  });
};

export const leadTransfer = (
  params: ILeadTransferParams,
): RequestPromise<null> => {
  return request(`/api/lead/transfer`, {
    method: 'post',
    data: params,
  });
};

export const leadDetail = (params: {
  id: number;
}): RequestPromise<ILeadDetail> => {
  return request(`/api/lead/detail`, {
    method: 'post',
    data: params,
  });
};
