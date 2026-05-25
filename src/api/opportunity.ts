import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import {
  ICustomerLeadSelectorRecord,
  IOpportunityDetailCustomerData,
  IOpportunityDetailData,
  IOpportunityDetailRecord,
  IOpportunityFunnelPerson,
  IOpportunityInCustomerItem,
  IOpportunityInCustomerPayload,
  IOpportunityListItem,
  IOpportunityListPayload,
  IOpportunityRecord,
  IOpportunityUserSelectorRecord,
} from './types/opportunity';

export const opportunityUserSelector = (
  type: string,
): RequestPromise<IOpportunityUserSelectorRecord[]> => {
  return request(`/api/opportunity/user-selector`, {
    method: 'post',
    data: { type },
  });
};
export const opportunityFunnelPerson = (): RequestPromise<
  IOpportunityFunnelPerson[]
> => {
  return request(`/api/crm/statistic/opportunity/funnel/person`, {
    method: 'post',
  });
};

export const opportunityAdd = (
  params: IOpportunityRecord,
): RequestPromise<null> => {
  return request(`/api/opportunity/add`, {
    method: 'post',
    data: params,
  });
};

export const opportunityEdit = (
  params: IOpportunityRecord,
): RequestPromise<null> => {
  return request(`/api/opportunity/edit`, {
    method: 'post',
    data: params,
  });
};

export const customerLeadSelector = (
  name: string,
  signal: AbortSignal,
): RequestPromise<ICustomerLeadSelectorRecord[]> => {
  return request(`/api/lead/customer-lead-selector?name=${name}`, {
    method: 'get',
    signal,
  });
};

export const opportunityList = (
  params: IOpportunityListPayload,
): RequestPromise<PaginationResponse<IOpportunityListItem[]>> => {
  return request(`/api/opportunity/list`, {
    method: 'post',
    data: params,
  });
};
export const opportunityInCustomer = (
  params: IOpportunityInCustomerPayload,
): RequestPromise<PaginationResponse<IOpportunityInCustomerItem[]>> => {
  return request(`/api/opportunity/list-in-customer`, {
    method: 'post',
    data: params,
  });
};

export const opportunityDetailRecord = (
  id: number,
): RequestPromise<IOpportunityDetailRecord> => {
  return request(`/api/follow-up/list-visit-record-time-line`, {
    method: 'post',
    data: { id },
  });
};

export const opportunityDetail = (
  id: number,
): RequestPromise<IOpportunityDetailData> => {
  return request(`/api/opportunity/detail`, {
    method: 'post',
    data: { id },
  });
};

export const opportunityDetailCustomer = (
  id: number,
): RequestPromise<IOpportunityDetailCustomerData> => {
  return request(`/api/lead/customer-lead-detail`, {
    method: 'post',
    data: { id },
  });
};

export const opportunityCheckHaveProject = (
  id: number,
): RequestPromise<boolean> => {
  return request(`/api/opportunity/checkHaveProject`, {
    method: 'post',
    data: { id },
  });
};
