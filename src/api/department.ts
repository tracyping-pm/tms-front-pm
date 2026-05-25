import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { IDepartmentRecord } from './types/department';

export const getDepartmentList = (): RequestPromise<IDepartmentRecord[]> => {
  return request(`/api/department/list`, {
    method: 'get',
  });
};

export const departmentUpdate = (params: {
  id: number;
  departmentName: string;
}): RequestPromise<any> => {
  return request(`/api/department/update`, {
    method: 'post',
    data: params,
  });
};

export const departmentCreate = (params: {
  parentId: number;
  departmentName: string;
}): RequestPromise<any> => {
  return request(`/api/department/create`, {
    method: 'post',
    data: params,
  });
};

export const departmentDelete = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/department/delete`, {
    method: 'post',
    data: params,
  });
};
