import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import {
  IPlaceGeoRecord,
  IPlaceGeoResolveAddressResult,
  IPlaceRecord,
} from './types/place';

export const placeRegion = (params: any): RequestPromise<IPlaceRecord[]> => {
  return request(`/api/place/region`, {
    method: 'get',
    params,
  });
};

export const placeGeoRegion = (params: {
  country: number;
  noAllRegion: boolean;
}): RequestPromise<IPlaceGeoRecord[]> => {
  return request(`/api/place/geo/region`, {
    method: 'get',
    params,
  });
};

export const placeProvince = (params: any): RequestPromise<IPlaceRecord[]> => {
  return request(`/api/place/province`, {
    method: 'get',
    params,
  });
};

export const placeGeoProvince = (
  params: any,
): RequestPromise<IPlaceGeoRecord[]> => {
  return request(`/api/place/geo/province`, {
    method: 'get',
    params,
  });
};

export const placeCountry = (): RequestPromise<IPlaceRecord[]> => {
  return request(`/api/place/country`, {
    method: 'get',
  });
};

export const placeCity = (params: any): RequestPromise<IPlaceRecord[]> => {
  return request(`/api/place/city`, {
    method: 'get',
    params,
  });
};

export const placeLeoCity = (
  params: any,
): RequestPromise<IPlaceGeoRecord[]> => {
  return request(`/api/place/geo/city`, {
    method: 'get',
    params,
  });
};

export const placeGeoResolveAddressResult = (
  params: {
    lat: number;
    lng: number;
    level: number;
  },
  skipErrorHandler?: boolean,
): RequestPromise<IPlaceGeoResolveAddressResult> => {
  return request(`/api/place/geo/resolveAddressResult`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
    skipErrorHandler: skipErrorHandler ?? false,
  });
};
