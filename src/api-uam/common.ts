import type { components } from '@/api/generated/uam-paths';
import {
  IFieldQueryHighlightParams,
  IFieldQueryHighlightRes,
} from '@/api/types/common';
import { GetUserGuidanceEnum } from '@/enums';
import { request } from '@umijs/max';
import {
  IChangePassword,
  ILatestExportRecord,
  RequestPromise,
} from './types/common';

export type BuOriginUrlVo = components['schemas']['BuOriginUrlVo'];

export async function getBuOriginUrl(): Promise<BuOriginUrlVo[]> {
  const res = await request<APIJSON<BuOriginUrlVo[]>>(
    `/uam-api/auth/bu-origin-url`,
    {
      method: 'post',
      skipErrorHandler: true,
    },
  );
  return res?.data ?? [];
}

export const getUserInfo = (
  skipErrorHandler?: boolean,
): RequestPromise<UserInfo> => {
  return request(`/uam-api/user/info`, {
    method: 'get',
    skipErrorHandler: !!skipErrorHandler,
  });
};

export const getUserGuidanceUpdate = (
  type: GetUserGuidanceEnum,
): RequestPromise<null> => {
  return request(`/uam-api/user-guidance/update?type=${type}`, {
    method: 'get',
  });
};

export const roleChange = (params: {
  userRoleId: number;
}): RequestPromise<null> => {
  return request(`/uam-api/user/role/change`, {
    method: 'post',
    data: params,
  });
};

export const changePassword = (
  params: IChangePassword,
): RequestPromise<any> => {
  return request(`/uam-api/user/change-password`, {
    method: 'post',
    data: params,
  });
};

export const authLogout = (): RequestPromise<any> => {
  return request(`/uam-api/user/logout`, {
    method: 'post',
  });
};

export const fieldQueryHighlightByUAM = (
  params: IFieldQueryHighlightParams,
  signal: AbortSignal,
): RequestPromise<IFieldQueryHighlightRes[]> => {
  return request(`/uam-api/es/fieldQueryHighlight`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const getExportLatestExportRecord = (): RequestPromise<
  ILatestExportRecord[]
> => {
  return request(`/uam-api/export-download-manage/latest-list`, {
    method: 'post',
  });
};

export const getExportDownload = (params: {
  id: number;
  spreadsheetId: string;
}): RequestPromise<string> => {
  return request(`/uam-api/export-download-manage/download`, {
    method: 'post',
    data: params,
  });
};

export const getExportRead = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/uam-api/export-download-manage/read`, {
    method: 'post',
    data: params,
  });
};
