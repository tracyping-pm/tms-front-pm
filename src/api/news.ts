import { request } from '@umijs/max';
import { INewsRes, IUnReadNewsRes } from './types/News';
import { RequestPromise } from './types/common';

export const msgList = (params: {
  pageNum: number;
  pageSize: number;
}): RequestPromise<INewsRes> => {
  return request(`/api/msg/list`, {
    method: 'post',
    data: params,
  });
};

export const msgRead = (params: {
  msgIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/msg/read`, {
    method: 'post',
    data: params,
  });
};

export const msgUnreadCount = (): RequestPromise<IUnReadNewsRes> => {
  return request(`/api/msg/unreadCount`, {
    method: 'get',
  });
};
export const msgReadAll = (): RequestPromise<null> => {
  return request(`/api/msg/readAll`, {
    method: 'get',
  });
};
