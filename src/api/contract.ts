import { RequestPromise } from '@/api/types/common';
import { request } from '@umijs/max';
import {
  IContractListPayload,
  IContractOperationLogRecord,
  IContractRecord,
  IVendorListContractPayload,
  IVendorListContractRecord,
} from './types/contract';

export const contractRefuse = (params: {
  contractId: number;
  refuseReason: string;
}): RequestPromise<null> => {
  return request(`/api/contract/refuseContract`, {
    method: 'post',
    data: params,
  });
};

export const contractQueryCustomerSigner = (params: {
  id: number;
}): RequestPromise<{ signerId: number; signerName: string }> => {
  return request(`/api/contract/queryCustomerSigner`, {
    method: 'post',
    data: params,
  });
};

export const getContractList = (
  params: IContractListPayload,
): RequestPromise<PaginationResponse<IContractRecord>> => {
  return request(`/api/contract/list`, {
    method: 'post',
    data: params,
  });
};

export const contractOperationLog = (params: {
  id: number;
}): RequestPromise<IContractOperationLogRecord> => {
  return request(`/api/contract/listOperationLog`, {
    method: 'post',
    data: params,
  });
};

export const contractDelete = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/contract/delete`, {
    method: 'post',
    data: params,
  });
};

export const contractCheckContractNumber = (params: {
  contractNumber: string;
}): RequestPromise<number> => {
  return request(`/api/contract/checkContractNumber`, {
    method: 'post',
    data: params,
  });
};

export const contractApproveContract = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/contract/approveContract`, {
    method: 'post',
    data: params,
  });
};

export const contractAdd = (params: FormData): RequestPromise<boolean> => {
  return request(`/api/contract/add`, {
    method: 'post',
    data: params,
  });
};

export const contractValidityPeriod = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/contract/queryCustomerContractValidityPeriod`, {
    method: 'post',
    data: params,
  });
};

export const contractCheckVoid = (params: {
  id: number;
}): RequestPromise<{ code: 0 | 1; msg: string }> => {
  return request(`/api/contract/checkVoidContract`, {
    method: 'post',
    data: params,
  });
};

export const contractVoid = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/contract/voidContract`, {
    method: 'post',
    data: params,
  });
};

export const vendorListContract = (
  params: IVendorListContractPayload,
): RequestPromise<PaginationResponse<IVendorListContractRecord>> => {
  return request(`/api/contract/vendor-contract-list`, {
    method: 'post',
    data: params,
  });
};

export const contractAddNote = (params: {
  contractId: number;
  note: string;
}): RequestPromise<boolean> => {
  return request(`/api/contract/add/note`, {
    method: 'post',
    data: params,
  });
};

export const contractDeleteNote = (params: {
  contractId: number;
}): RequestPromise<boolean> => {
  return request(`/api/contract/delete/note?contractId=${params.contractId}`, {
    method: 'get',
  });
};
