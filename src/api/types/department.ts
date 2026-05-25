import { DataPermissionTypeEnum } from '@/enums';

export interface RoleItem {
  createdAt: string;
  createdBy: number;
  dataPermissionType: DataPermissionTypeEnum;
  deleted: boolean;
  departmentId: number;
  id: number;
  parentId: number | null;
  roleName: string;
  updatedAt: string;
  updatedBy: number;
}

export interface IDepartmentRecord {
  id: number;
  departmentName: string;
  parentId: number;
  level: number;
  countryId: number;
  children: IDepartmentRecord[];
  roles: RoleItem[];
  buType: 'TMS' | 'WMS';
  [key: string]: any;
}
