import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import {
  IFollowUpAddReq,
  IFollowUpListRecord,
  IFollowUpListReq,
  IFollowUpListVisitRecord,
  IFollowUpListVisitRecordReq,
  IFollowUpListVisitRecordTimeLineItem,
} from './types/followUp';

export const followUpList = (
  params: IFollowUpListReq,
): RequestPromise<PaginationResponse<IFollowUpListRecord>> => {
  return request(`/api/follow-up/list`, {
    method: 'post',
    data: params,
  });
};

export const followUpListVisitRecord = (
  params: IFollowUpListVisitRecordReq,
): RequestPromise<IFollowUpListVisitRecord[]> => {
  return request(`/api/follow-up/list-visit-record`, {
    method: 'post',
    data: params,
  });
};

export const followUpListVisitRecordTimeLine = (params: {
  id: number;
}): RequestPromise<IFollowUpListVisitRecordTimeLineItem[]> => {
  return request(`/api/follow-up/list-visit-record-time-line`, {
    method: 'post',
    data: params,
  });
};

export const followUpAdd = (
  params: IFollowUpAddReq,
): RequestPromise<string> => {
  return request(`/api/follow-up/add`, {
    method: 'post',
    data: params,
  });
};
