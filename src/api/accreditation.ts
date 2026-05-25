import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';
import { IAccreditationRecord } from './types/accreditation';
import { RequestPromise } from './types/common';

export const getBusinessDocumentList = (params: {
  id: number;
}): RequestPromise<IAccreditationRecord> => {
  return request(`/api/customer/business-document/list`, {
    method: 'post',
    data: params,
  });
};

export const getFinancialDocumentList = (params: {
  id: number;
}): RequestPromise<IAccreditationRecord> => {
  return request(`/api/customer/financial-document/list`, {
    method: 'post',
    data: params,
  });
};

export const addBusinessType = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<any> => {
  return request(`/api/customer/business-document/category/add`, {
    method: 'post',
    data: params,
  });
};

export const addFinancialType = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<any> => {
  return request(`/api/customer/financial-document/category/add`, {
    method: 'post',
    data: params,
  });
};

export const accreditationCreateCategoriesSnd = (
  customerId: number,
  params: {
    fileCategory: string;
    defaultCategory: number;
  },
  data: FormData,
): RequestPromise<any> => {
  return request(
    `/api/customers/${customerId}/accreditation/categories/accreditations`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
      data,
      timeout: FILE_UPLOAD_TIMEOUT,
    },
  );
};

export const deleteBusinessType = (params: {
  id: number;
  categoryAccreditationId: number | string;
  fileCategory: string;
  defaultCategory: boolean;
  deletedFileIdList?: number[];
}): RequestPromise<any> => {
  return request(`/api/customer/business-document/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteFinancialType = (params: {
  id: number;
  categoryAccreditationId: number | string;
  fileCategory: string;
  defaultCategory: boolean;
  deletedFileIdList?: number[];
}): RequestPromise<any> => {
  return request(`/api/customer/financial-document/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteBusinessDocMaterial = (params: {
  id: number;
  fileAccreditationId: number | string;
  fileMaterialId: number | string;
  defaultCategory: boolean;
  driveFileId: string;
}): RequestPromise<any> => {
  return request(`/api/customer/business-document/material/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteFinancialDocMaterial = (params: {
  id: number;
  fileAccreditationId: number | string;
  fileMaterialId: number | string;
  defaultCategory: boolean;
  driveFileId: string;
}): RequestPromise<any> => {
  return request(`/api/customer/financial-document/material/delete`, {
    method: 'post',
    data: params,
  });
};
