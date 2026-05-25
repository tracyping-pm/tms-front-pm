import { AccountStatusEnum } from '@/enums';

export interface IAccountList {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  aliasName?: string;
  email?: string;
}

export interface IAccountRecord {
  createdAt: string | number;
  createdBy: string | number;
  updatedAt: string | number;
  updatedBy: string | number;
  id: number;
  name: string;
  aliasName: string;
  email: string;
  password: string;
  avatar: string;
  slackMemberId: string;
  status: AccountStatusEnum;
  lastLoginUserRoleId: number;
  deleted: boolean;
}

export type IResetPasswordRes = Partial<IAccountRecord> & {
  randomPassword: string;
};

export type IAccountAddRes = Partial<IAccountRecord> & {
  randomPassword: string;
};

export interface IAccountVendorListPayload {
  pageNum?: number;
  pageSize?: number;
  status?: AccountStatusEnum;
  vendorName?: string;
  vendorTag?: string;
  email?: string;
}

export type IAccountVendorAddRes = Partial<IAccountRecord> & {
  email: string;
  name: string;
  aliasName: string;
  randomPassword: string;
};
export type IAccountuserDetailRes = Partial<IAccountRecord> & {
  id: number;
  userRoleId: number;
  roleName: string;
  dataPermissionType: string;
  departmentId: number;
  departmentLink: string;
  parentId: number;
  countryId: number;
  countryName: string;
};

// Customer Account
export interface IAccountCustomerListPayload {
  pageNum?: number;
  pageSize?: number;
  status?: AccountStatusEnum;
  customerName?: string;
  customerTag?: string;
  email?: string;
}

export type IAccountCustomerAddRes = Partial<IAccountRecord> & {
  email: string;
  name: string;
  aliasName: string;
  randomPassword: string;
};
