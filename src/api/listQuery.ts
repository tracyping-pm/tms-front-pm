import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { IListQueryAddPayload, IListQueryPayload } from './types/listQuery';

export const getListQuery = (
  params: IListQueryPayload,
): RequestPromise<string> => {
  return request(`/api/list/query/history/get`, {
    method: 'post',
    data: params,
  });
};

export const addListQuery = (
  params: IListQueryAddPayload,
): RequestPromise<null> => {
  return request(`/api/list/query/history/add`, {
    method: 'post',
    data: params,
  });
};
