import { DownLoadStatusEnum } from '@/enums';
import { BU_TYPE_ENUM } from '@/enums/uam';

export type RequestPromise<T> = Promise<APIJSON<T>>;

export interface IEmailLogin {
  email: string;
  password: string;
}

export interface IGoogleLogin {
  code: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IUserList {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  aliasName?: string;
  email?: string;
}

export interface IRole {
  roleId: number;
  userRoleId: number;
  roleName: string;
  dataPermissionType: string;
  parentRoleId: number;
  buId: number;
  buName: string;
  buType: BU_TYPE_ENUM;
  regionId: number;
  regionName: string;
}

export type AxiosRequestHeaders = Record<string, string | number | boolean>;

export interface CommonUploadOptions {
  url: string;
  method: 'post' | 'put';
  headers?: AxiosRequestHeaders;
  formData: FormData;
  signal: AbortSignal;
  skipErrorHandler?: boolean;
  progressCallback?: (v: number) => void;
}

export interface ILatestExportRecord {
  id: number;
  status: DownLoadStatusEnum;
  fileName: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
}
