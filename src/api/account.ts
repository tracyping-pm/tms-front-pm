import { request } from '@umijs/max';
import {
  IAccountAddRes,
  IAccountCustomerAddRes,
  IAccountCustomerListPayload,
  IAccountList,
  IAccountRecord,
  IAccountVendorAddRes,
  IAccountVendorListPayload,
  IAccountuserDetailRes,
  IResetPasswordRes,
} from './types/account';
import { RequestPromise } from './types/common';

export const accountPasswordReset = (params: {
  id: number;
}): RequestPromise<IResetPasswordRes> => {
  return request(`/api/account-manage/reset-password`, {
    method: 'post',
    data: params,
  });
};

export const accountList = (
  params: IAccountList,
): RequestPromise<PaginationResponse<IAccountRecord>> => {
  return request(`/api/account-manage/list`, {
    method: 'post',
    data: params,
  });
};

export const accountAdd = (
  params: Partial<UserInfo>,
): RequestPromise<IAccountAddRes> => {
  return request(`/api/account-manage/add`, {
    method: 'post',
    data: params,
  });
};

export const accountDelete = (params: {
  ids: number[];
}): RequestPromise<any> => {
  return request(`/api/account-manage/delete`, {
    method: 'post',
    data: params,
  });
};

export const accountSuspended = (params: {
  ids: number[];
}): RequestPromise<any> => {
  return request(`/api/account-manage/suspended`, {
    method: 'post',
    data: params,
  });
};

export const accountActivated = (params: {
  ids: number[];
}): RequestPromise<any> => {
  return request(`/api/account-manage/activated`, {
    method: 'post',
    data: params,
  });
};

export const accountVendorList = (
  params: IAccountVendorListPayload,
): RequestPromise<PaginationResponse<IAccountRecord>> => {
  return request(`/api/account-manage/vendor-list`, {
    method: 'post',
    data: params,
  });
};

export const accountVendorAdd = (params: {
  email: string;
  vendorId: number;
}): RequestPromise<IAccountVendorAddRes> => {
  return request(`/api/account-manage/add-vendor`, {
    method: 'post',
    data: params,
  });
};
export const accountUserDetail = (params: {
  id: number;
}): RequestPromise<IAccountuserDetailRes> => {
  return request(`/api/account-manage/user-detail`, {
    method: 'post',
    data: params,
  });
};

// Customer Account
export const accountCustomerList = (
  params: IAccountCustomerListPayload,
): RequestPromise<PaginationResponse<IAccountRecord>> => {
  return request(`/api/account-manage/customer-list`, {
    method: 'post',
    data: params,
  });
};

export const accountCustomerAdd = (params: {
  email: string;
  customerId: number;
}): RequestPromise<IAccountCustomerAddRes> => {
  return request(`/api/account-manage/add-customer`, {
    method: 'post',
    data: params,
  });
};
