import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import {
  IAddTransmittalParams,
  IAddTransmittalWaybillListItem,
  IAddTransmittalWaybillListParams,
  ITransmittalDetail,
  ITransmittalDetailProof,
  ITransmittalDetailWaybillListItem,
  ITransmittalDetailWaybillListParams,
  ITransmittalListItem,
  ITransmittalListParams,
  ITransmittalLogRecord,
} from './types/transmittal';

export const transmittalList = (
  params: ITransmittalListParams,
): RequestPromise<PaginationResponse<ITransmittalListItem>> => {
  return request(`/api/transmittal/list`, {
    method: 'post',
    data: params,
  });
};

export const addTransmittal = (
  params: IAddTransmittalParams,
): RequestPromise<number> => {
  return request(`/api/transmittal/add`, {
    method: 'post',
    data: params,
  });
};

export const addTransmittalWaybillList = (
  params: IAddTransmittalWaybillListParams,
): RequestPromise<PaginationResponse<IAddTransmittalWaybillListItem>> => {
  return request(`/api/transmittal/search/waybill`, {
    method: 'post',
    data: params,
  });
};

export const transmittalDetail = (params: {
  id: number;
}): RequestPromise<ITransmittalDetail> => {
  return request(`/api/transmittal/detail`, {
    method: 'post',
    data: params,
  });
};

export const transmittalDetailWaybillList = (
  params: ITransmittalDetailWaybillListParams,
): RequestPromise<PaginationResponse<ITransmittalDetailWaybillListItem>> => {
  return request(`/api/transmittal/detail/waybill`, {
    method: 'post',
    data: params,
  });
};

export const transmittalDetailProof = (params: {
  id: number;
}): RequestPromise<ITransmittalDetailProof> => {
  return request(`/api/transmittal/proof/list`, {
    method: 'post',
    data: params,
  });
};

export const transmittalLog = (params: {
  id: number;
}): RequestPromise<ITransmittalLogRecord[]> => {
  return request(`/api/transmittal/log`, {
    method: 'post',
    data: params,
  });
};

export const transmittalConfirm = (params: {
  id: number;
  description?: string;
  materialIds: number[];
}): RequestPromise<null> => {
  return request(`/api/transmittal/submit/proof`, {
    method: 'post',
    data: params,
  });
};

export const transmittalCancel = (params: {
  id: number;
  reason?: string;
}): RequestPromise<null> => {
  return request(`/api/transmittal/cancel`, {
    method: 'post',
    data: params,
  });
};
