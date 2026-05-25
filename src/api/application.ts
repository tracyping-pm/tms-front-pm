import { ApplicationTypeEnum } from '@/enums';
import { request } from '@umijs/max';
import {
  IApplicationListParams,
  IApplicationRecord,
  ICrewApplicationDetailRecord,
  ITruckApplicationDetailRecord,
  IVendorApplicationDetailRecord,
} from './types/application';
import { RequestPromise } from './types/common';

export const applicationList = (
  params: IApplicationListParams,
): RequestPromise<PaginationResponse<IApplicationRecord>> => {
  return request(`/api/accred-application/list`, {
    method: 'post',
    data: params,
  });
};

export const checkUnderReview = (params: {
  type: ApplicationTypeEnum;
  bizIdentifier: string;
}): RequestPromise<{ id: number; number: string }> => {
  return request(`/api/accred-application/check-under-review`, {
    method: 'post',
    data: params,
  });
};

export const addVendorApplication = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/accred-application/vendor/add`, {
    method: 'post',
    data: params,
  });
};

export const vendorApplicationDetail = (
  id: number,
): RequestPromise<IVendorApplicationDetailRecord> => {
  return request(`/api/accred-application/vendor/detail`, {
    method: 'post',
    data: { id },
  });
};

export const truckApplicationDetail = (
  id: number,
): RequestPromise<ITruckApplicationDetailRecord> => {
  return request(`/api/accred-application/truck/detail`, {
    method: 'post',
    data: { id },
  });
};

export const crewApplicationDetail = (
  id: number,
): RequestPromise<ICrewApplicationDetailRecord> => {
  return request(`/api/accred-application/crew/detail`, {
    method: 'post',
    data: { id },
  });
};
export const applicationReviewReject = (params: {
  id: number;
  reason: string;
}): RequestPromise<null> => {
  return request(`/api/accred-application/reject`, {
    method: 'post',
    data: params,
  });
};
export const applicationReviewApprove = (id: number): RequestPromise<null> => {
  return request(`/api/accred-application/approve`, {
    method: 'post',
    data: { id },
  });
};
