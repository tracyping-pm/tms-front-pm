import { request } from '@umijs/max';
import {
  ICapacityPoolCrewListPayload,
  ICapacityPoolCrewRecord,
  ICapacityPoolDetail,
  ICapacityPoolListPayload,
  ICapacityPoolTruckListPayload,
  ICapacityPoolTruckRecord,
  ICapacityPoolVendorListPayload,
  ICapacityPoolVendorRecord,
  ITruckVendorRefPayload,
  ITruckVendorRefRecord,
} from './types/capacity';
import { RequestPromise } from './types/common';

export const truckVendorRef = (
  params: ITruckVendorRefPayload,
): RequestPromise<PaginationResponse<ITruckVendorRefRecord>> => {
  return request(`/api/truck/truckVendorRef`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolTruckList = (
  params: ICapacityPoolTruckListPayload,
): RequestPromise<PaginationResponse<ICapacityPoolTruckRecord>> => {
  return request(`/api/capacity-pool/truck/list`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolVendorList = (
  params: ICapacityPoolVendorListPayload,
): RequestPromise<PaginationResponse<ICapacityPoolVendorRecord>> => {
  return request(`/api/capacity-pool/vendor/list`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolVendorRevoke = (
  params: {
    id: number;
  },
  signal: AbortSignal,
): RequestPromise<number> => {
  return request(`/api/capacity-pool/vendor/revoke`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const capacityPoolVendorApprove = (
  params: {
    id: number;
  },
  signal: AbortSignal,
): RequestPromise<null> => {
  return request(`/api/capacity-pool/vendor/approve`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const capacityPoolVendorAdd = (params: {
  capacityPoolId: number;
  vendorId: number;
}): RequestPromise<null> => {
  return request(`/api/capacity-pool/vendor/add`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolList = (
  params: ICapacityPoolListPayload,
): RequestPromise<PaginationResponse<ICapacityPoolDetail>> => {
  return request(`/api/capacity-pool/list`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolDetail = (params: {
  id: number;
}): RequestPromise<ICapacityPoolDetail> => {
  return request(`/api/capacity-pool/detail`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolCreate = (params: {
  projectId: number;
  projectName: string;
  poolName: string;
}): RequestPromise<any> => {
  return request(`/api/capacity-pool/create`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolChange = (params: {
  id: number;
  poolName: string;
}): RequestPromise<any> => {
  return request(`/api/capacity-pool/change`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolBind = (params: {
  id: number;
  bindIds: number[];
}): RequestPromise<any> => {
  return request(`/api/capacity-pool/bind`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolApproveRevoke = (params: {
  ids: number[];
  enable: boolean;
}): RequestPromise<any> => {
  return request(`/api/capacity-pool/approveRevoke`, {
    method: 'post',
    data: params,
  });
};
export const capacityPoolTruckApproveRevoke = (params: {
  ids: number[];
  enable: boolean;
}): RequestPromise<any> => {
  return request(`/api/capacity-pool/truck/approveRevoke`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolCrewList = (
  params: ICapacityPoolCrewListPayload,
): RequestPromise<PaginationResponse<ICapacityPoolCrewRecord>> => {
  return request(`/api/capacity-pool/crew/list`, {
    method: 'post',
    data: params,
  });
};

export const capacityPoolCrewApproveRevoke = (params: {
  ids: number[];
  enable: boolean;
  capacityPoolId: number;
}): RequestPromise<any> => {
  return request(`/api/capacity-pool/crew/approveRevoke`, {
    method: 'post',
    data: params,
  });
};
