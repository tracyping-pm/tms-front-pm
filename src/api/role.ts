import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import {
  IRoleCreateInput,
  IRoleElementRecord,
  IRoleRecord,
  IRoleTemplateRecord,
  IRoleUpdateElementsRecord,
  IRoleUserRecord,
} from './types/role';

export const getRoleUserList = (params: {
  roleId: number;
  pageNum?: number;
  pageSize?: number;
}): RequestPromise<PaginationResponse<IRoleUserRecord>> => {
  return request(`/api/role/user`, {
    method: 'post',
    data: params,
  });
};

export const getNoRoleUserList = (params: {
  roleId: number;
  pageNum?: number;
  pageSize?: number;
}): RequestPromise<PaginationResponse<IRoleUserRecord>> => {
  return request(`/api/role/no-role-user`, {
    method: 'post',
    data: params,
  });
};

export const roleDelete = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/role/delete`, {
    method: 'post',
    data: params,
  });
};

export const roleCreate = (params: IRoleCreateInput): RequestPromise<any> => {
  return request(`/api/role/create`, {
    method: 'post',
    data: params,
  });
};

export const roleUpdate = (params: IRoleCreateInput): RequestPromise<any> => {
  return request(`/api/role/update`, {
    method: 'post',
    data: params,
  });
};

export const getAllRoles = (params: {
  departmentId?: number;
  roleId?: number;
}): RequestPromise<IRoleRecord[]> => {
  return request(`/api/role`, {
    method: 'post',
    data: params,
  });
};

export const userRoleDelete = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/user-role/delete`, {
    method: 'post',
    data: params,
  });
};

export const userRoleDistribution = (params: {
  userIds: number[];
  roleId: number;
}): RequestPromise<any> => {
  return request(`/api/user-role/distribution-role`, {
    method: 'post',
    data: params,
  });
};

export const roleElementListByRole = (params: {
  roleId: number;
}): RequestPromise<IRoleElementRecord[]> => {
  return request(`/api/role-element/listByRole`, {
    method: 'post',
    data: params,
  });
};

export const roleElementUpdate = (params: {
  roleId: number;
  elementIds: number[];
}): RequestPromise<any> => {
  return request(`/api/role-element/update`, {
    method: 'post',
    data: params,
  });
};

export const roleTemplateCreate = (params: {
  name: string;
}): RequestPromise<any> => {
  return request(`/api/role-template/create`, {
    method: 'post',
    data: params,
  });
};
export const roleTemplateUpdate = (params: {
  id: number;
  name: string;
}): RequestPromise<any> => {
  return request(`/api/role-template/update`, {
    method: 'post',
    data: params,
  });
};
export const roleTemplateCopy = (params: {
  id: number;
  name: string;
}): RequestPromise<any> => {
  return request(`/api/role-template/copy`, {
    method: 'post',
    data: params,
  });
};
export const roleTemplateDelete = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/role-template/delete`, {
    method: 'post',
    data: params,
  });
};
export const roleTemplateElements = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/role-template/elements`, {
    method: 'post',
    data: params,
  });
};
export const roleTemplateList = (): RequestPromise<IRoleTemplateRecord[]> => {
  return request(`/api/role-template/list`, {
    method: 'post',
  });
};
export const roleTemplateUpdateElements = (
  params: IRoleUpdateElementsRecord,
): RequestPromise<any> => {
  return request(`/api/role-template/update-elements`, {
    method: 'post',
    data: params,
  });
};
export const roleTemplate = (params: {
  roleId: number;
  roleTemplateId: number;
}): RequestPromise<any> => {
  return request(`/api/role/template`, {
    method: 'post',
    data: params,
  });
};
