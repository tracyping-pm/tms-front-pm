import { AccountStatusEnum, DataPermissionTypeEnum } from '@/enums';

export interface IRoleUserRecord {
  userId: number;
  userRoleId: number;
  email: string;
  name: string;
  aliasName: string;
  avatar: string;
  slackMemberId: string;
  status: AccountStatusEnum;
}

export interface IRoleCreateInput {
  roleId?: number;
  roleName: string;
  dataPermissionType: DataPermissionTypeEnum;
  departmentId: number;
  parentId: number;
}

export interface IRoleRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  roleName: string;
  dataPermissionType: string;
  departmentId: number;
  parentId: number;
  deleted: boolean;
  [key: string]: any;
}

export interface IRoleElementRecord {
  authorityId: number;
  id: number;
  name: string;
  displayName: string;
  parentId: number;
  roleElementId: number;
  [key: string]: any;
}
export interface IRoleTemplateRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  name: string;
  deleted: boolean;
  [key: string]: any;
}
export interface IRoleUpdateElementsRecord {
  roleTemplateId: number;
  elementIds: number[];
}
