import { BU_TYPE_ENUM, REGION_ID_ENUM } from '@/enums/uam';
import '@umijs/max/typings';

declare global {
  interface Window {
    ENV?: {
      APP_ENV?: string;
      TMS_ORIGIN?: string;
      UAM_ORIGIN?: string;
    };
  }

  type Token = string;

  interface APIJSON<T> {
    code: number;
    msg: string;
    data: T;
  }

  interface RoleItem {
    roleId: number;
    userRoleId: number;
    roleName: string;
    dataPermissionType: string;
    parentRoleId: number;
    buId: number;
    buName: string;
    buType: BU_TYPE_ENUM;
    regionId: REGION_ID_ENUM;
    regionName: string;
  }

  interface UserInfo {
    id: number;
    email: string;
    name: string;
    aliasName?: string;
    avatar: string;
    slackMemberId: string;
    status: string;
    roleList: RoleItem[];
    elementNameList: string[];
    currentUserRole: RoleItem;
    userGuidanceMap: {
      ExportDownloadManage: boolean;
    };
  }

  interface CurrentUser extends UserInfo {
    countryId: number;
    countryName: string;
  }

  type PaginationResponse<T = any> = {
    list?: T[];
    pageNum?: number;
    pageSize?: number;
    total?: number;
    pages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    isFirstPage?: boolean;
    isLastPage?: boolean;
  };
}
