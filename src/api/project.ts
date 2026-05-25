import { MemberTypeEnum } from '@/enums';
import { request } from '@umijs/max';
import { Key } from 'react';
import { RequestPromise } from './types/common';
import { IContractRecord } from './types/contract';
import {
  AdditionSettingItem,
  AdditionSettingRecord,
  IAddBillingStandardDataParams,
  IAddBusinessDocumentsCategory,
  IAddChangeLibraryRouteParams,
  IAddRouteBillingVersion,
  IAddTruckRangeParams,
  IAlarmDashboardStatisticsListItem,
  IAlarmDashboardStatisticsListPayload,
  IAlarmDashboardTaskListItem,
  IAlarmDashboardTaskListPayload,
  IAssignUserItem,
  IBatchPriceUpdate,
  IBillingStandardListParams,
  IBusinessDocumentsData,
  IDeleteBusinessDocumentsCategory,
  IDeleteBusinessDocumentsMaterial,
  ILibraryDetailPriceVersionInfo,
  ILibraryDetailPriceVersionListItem,
  ILibraryRouteListItem,
  ILibraryRouteListParams,
  IManageSheetData,
  IManageStatusData,
  IPodConfigurationItem,
  IPriceSettingData,
  IPriveVendorListItem,
  IProjectAddPayload,
  IProjectContractsListPayload,
  IProjectCustomerCodeConfigItem,
  IProjectCustomerCodeConfigUpdateParams,
  IProjectCustomerCodeTypeItem,
  IProjectListPayload,
  IProjectLogRecord,
  IProjectPodConfiguration,
  IProjectRecord,
  IProjectTeamManager,
  IProjectTeamRecord,
  IProjectUpdatePayload,
  IRouteLibraryAddParams,
  IRouteLibraryDetail,
  IRouteLibraryListItem,
  IRouteLibraryListParams,
  IRoutePriceVersionListItem,
  IRouteVersionListItem,
  IStopPointItem,
  IStopPointParmas,
  ISubtaskConfigParams,
  ISubtaskConfigProcessTypeItem,
  ISubtaskConfigurationItem,
  ISyncFromStatusData,
  ITypeAndRangeData,
  LibraryTruckTypeItem,
  SyncFromSheetData,
} from './types/project';

export const projectList = (
  params: IProjectListPayload,
): RequestPromise<PaginationResponse<IProjectRecord>> => {
  return request(`/api/project/list`, {
    method: 'post',
    data: params,
  });
};

export const projectAdd = (params: IProjectAddPayload): RequestPromise<any> => {
  return request(`/api/project/add`, {
    method: 'post',
    data: params,
  });
};

export const projectUpdate = (
  params: IProjectUpdatePayload,
): RequestPromise<any> => {
  return request(`/api/project/update`, {
    method: 'post',
    data: params,
  });
};

export const projectCommodity = (): RequestPromise<string[]> => {
  return request(`/api/project/commodity`, {
    method: 'get',
  });
};

export const projectStart = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/project/start`, {
    method: 'post',
    data: params,
  });
};

export const checkProjectStart = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/project/check-start`, {
    method: 'post',
    data: params,
  });
};

export const projectCancel = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/project/cancel`, {
    method: 'post',
    data: params,
  });
};

export const projectSuspend = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/project/suspend`, {
    method: 'post',
    data: params,
  });
};

export const projectResume = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/project/resume`, {
    method: 'post',
    data: params,
  });
};

export const projectTerminate = (params: {
  id: number;
  email: string;
}): RequestPromise<any> => {
  return request(`/api/project/terminate`, {
    method: 'post',
    data: params,
  });
};

export const projectCompleted = (params: {
  id: number;
  email: string;
}): RequestPromise<any> => {
  return request(`/api/project/completed`, {
    method: 'post',
    data: params,
  });
};

export const projectAssign = (params: {
  id: number;
  memberType: MemberTypeEnum;
  assignUserReqs: { userRoleId: number; managerRoleId: number }[];
}): RequestPromise<any> => {
  return request(`/api/project/assign`, {
    method: 'post',
    data: params,
  });
};
export const projectDeleteTeamMember = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/project/delete/team/member`, {
    method: 'post',
    data: params,
  });
};

export const projectAssignUser = (params: {
  memberType: MemberTypeEnum;
  projectId: number;
}): RequestPromise<IAssignUserItem[]> => {
  return request(`/api/project/assign-user`, {
    method: 'post',
    data: params,
  });
};

export const projectLog = (params: {
  id: number;
}): RequestPromise<IProjectLogRecord[]> => {
  return request(`/api/project/log`, {
    method: 'post',
    data: params,
  });
};

export const projectDetail = (params: {
  id: number;
}): RequestPromise<IProjectRecord> => {
  return request(`/api/project/detail`, {
    method: 'post',
    data: params,
  });
};

export const projectTeam = (params: {
  id: number;
}): RequestPromise<IProjectTeamRecord[]> => {
  return request(`/api/project/team`, {
    method: 'post',
    data: params,
  });
};
export const projectTeamManagers = (params: {
  id: number;
}): RequestPromise<IProjectTeamManager[]> => {
  return request(`/api/project/team/managers`, {
    method: 'post',
    data: params,
  });
};

export const projectWaybillTeam = (params: {
  id: number;
}): RequestPromise<IProjectTeamRecord[]> => {
  return request(`/api/waybill/team`, {
    method: 'post',
    data: params,
  });
};

export const businessDocumentsList = (params: {
  id: number;
}): RequestPromise<IBusinessDocumentsData> => {
  return request(`/api/project/businessDocument/list`, {
    method: 'post',
    data: params,
  });
};

export const addBusinessDocumentsCategory = (
  params: IAddBusinessDocumentsCategory,
): RequestPromise<any> => {
  return request(`/api/project/businessDocument/category/add`, {
    method: 'post',
    data: params,
  });
};

export const deleteBusinessDocumentsCategory = (
  params: IDeleteBusinessDocumentsCategory,
): RequestPromise<any> => {
  return request(`/api/project/businessDocument/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteBusinessDocumentsMaterial = (
  params: IDeleteBusinessDocumentsMaterial,
): RequestPromise<null> => {
  return request(`/api/project/businessDocument/material/delete`, {
    method: 'post',
    data: params,
  });
};

export const projectAdditionSetting = (params: {
  id: number;
}): RequestPromise<AdditionSettingItem[]> => {
  return request(`/api/project/additionSetting`, {
    method: 'post',
    data: params,
  });
};
export const projectAdditionSettingConfirm = (
  params: AdditionSettingRecord,
): RequestPromise<null> => {
  return request(`/api/project/additionSetting/confirm`, {
    method: 'post',
    data: params,
  });
};

export const getRouteLibraryList = (
  params: IRouteLibraryListParams,
): RequestPromise<PaginationResponse<IRouteLibraryListItem>> => {
  return request(`/api/routeLibrary/list`, {
    method: 'post',
    data: params,
  });
};

export const addRouteLibrary = (
  params: IRouteLibraryAddParams,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/add`, {
    method: 'post',
    data: params,
  });
};

export const changeRouteLibrary = (
  params: IRouteLibraryAddParams,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/change`, {
    method: 'post',
    data: params,
  });
};

export const checkChangeRouteLibrary = (params: {
  id: number;
  billingMode: string;
  multipleRoute: string;
  mileageCalculation: string;
  customerTaxMark: string;
  routePricingTaxMark: string;
}): RequestPromise<number> => {
  return request(`/api/routeLibrary/checkChange`, {
    method: 'post',
    data: params,
  });
};

export const getCustomerTaxTypeByProject = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/routeLibrary/customerTaxMark`, {
    method: 'post',
    data: params,
  });
};

export const getRouteLibraryDetail = (params: {
  id: number;
}): RequestPromise<IRouteLibraryDetail> => {
  return request(`/api/routeLibrary/detail`, {
    method: 'post',
    data: params,
  });
};

export const getLibraryRouteList = (
  params: ILibraryRouteListParams,
): RequestPromise<PaginationResponse<ILibraryRouteListItem>> => {
  return request(`/api/routeLibrary/route/list`, {
    method: 'post',
    data: params,
  });
};

export const addChangeLibraryRoute = (
  params: IAddChangeLibraryRouteParams,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/route/addChange`, {
    method: 'post',
    data: params,
  });
};

export const approveRevokeLibraryRoute = (params: {
  id: number;
  enable: boolean;
}): RequestPromise<null> => {
  return request(`/api/routeLibrary/route/approveRevoke`, {
    method: 'post',
    data: params,
  });
};

export const approveRevokeList = (params: { ids: Key[]; enable: boolean }) => {
  return request(`/api/routeLibrary/route/approveRevokeList`, {
    method: 'post',
    data: params,
  });
};

export const checkDeleteList = (params: { ids: Key[] }) => {
  return request(`/api/routeLibrary/route/checkDeleteList`, {
    method: 'post',
    data: params,
  });
};

export const batchDeleteList = (params: { ids: Key[] }) => {
  return request(`/api/routeLibrary/route/deleteList`, {
    method: 'post',
    data: params,
  });
};

export const deleteLibraryRoute = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/routeLibrary/route/delete`, {
    method: 'post',
    data: params,
  });
};

export const addRouteTruckRange = (
  params: IAddTruckRangeParams,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/range/add`, {
    method: 'post',
    data: params,
  });
};

export const getRouteTruckRange = (params: {
  id: number;
}): RequestPromise<IAddTruckRangeParams> => {
  return request(`/api/routeLibrary/range/detail`, {
    method: 'post',
    data: params,
  });
};

export const addRouteBillingVersion = (
  params: IAddRouteBillingVersion,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/version/add`, {
    method: 'post',
    data: params,
  });
};

export const getRouteBillingVersionList = (params: {
  id: number;
}): RequestPromise<IRouteVersionListItem[]> => {
  return request(`/api/routeLibrary/version/list`, {
    method: 'post',
    data: params,
  });
};

export const getRoutePriceVersionList = (params: {
  routeLibraryId: number;
  vendorId?: number;
}): RequestPromise<IRoutePriceVersionListItem[]> => {
  return request(`/api/routeLibrary/version/list/cv`, {
    method: 'post',
    data: params,
  });
};

export const changeRouteBillingVersion = (
  params: IAddRouteBillingVersion,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/version/change`, {
    method: 'post',
    data: params,
  });
};

export const addRouteTruckType = (params: {
  truckTypeId: number;
  truckTypeName: string;
  routeLibraryId: number;
}): RequestPromise<null> => {
  return request(`/api/routeLibrary/truckType/add`, {
    method: 'post',
    data: params,
  });
};

export const getLibraryTruckType = (params: {
  id: number;
}): RequestPromise<LibraryTruckTypeItem[]> => {
  return request(`/api/routeLibrary/truckType/list`, {
    method: 'post',
    data: params,
  });
};

export const manageTruckTypes = (params: {
  id: number;
  bindIds: number[];
}): RequestPromise<any> => {
  return request(`/api/routeLibrary/truckType/manage`, {
    method: 'post',
    data: params,
  });
};

export const checkTruckTypes = (params: {
  id: number;
  bindIds: number[];
}): RequestPromise<number> => {
  return request(`/api/routeLibrary/truckType/manage/check`, {
    method: 'post',
    data: params,
  });
};

export const getTruckTypeAndRange = (params: {
  id: number;
}): RequestPromise<ITypeAndRangeData> => {
  return request(`/api/routeLibrary/rangeTruckType`, {
    method: 'post',
    data: params,
  });
};

export const getRoutePriceVendor = (params: {
  id: number;
}): RequestPromise<IPriveVendorListItem[]> => {
  return request(`/api/routeLibrary/version/list/vendor`, {
    method: 'post',
    data: params,
  });
};

export const getRoutePriceSetting = (params: {
  id: number;
  customerOrVendor: boolean;
  vendorId?: number;
}): RequestPromise<IPriceSettingData> => {
  return request(`/api/routeLibrary/settings`, {
    method: 'post',
    data: params,
  });
};

export const updateRoutePriceSetting = (params: {
  id: number;
  customerOrVendor: boolean;
  vendorId?: number;
  strongValidityPeriodLimit: boolean;
}): RequestPromise<any> => {
  return request(`/api/routeLibrary/settings/update`, {
    method: 'post',
    data: params,
  });
};

export const getBillingStandardList = (
  params: IBillingStandardListParams,
): RequestPromise<PaginationResponse<any>> => {
  return request(`/api/routeLibrary/billingStandard/list`, {
    method: 'post',
    data: params,
  });
};

export const getPriceTableList = (
  params: IBillingStandardListParams,
): RequestPromise<PaginationResponse<any>> => {
  return request(`/api/routeLibrary/billingStandard/list/cv`, {
    method: 'post',
    data: params,
  });
};

export const addBillingStandardData = (
  params: IAddBillingStandardDataParams,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/billingStandard/add`, {
    method: 'post',
    data: params,
  });
};

export const changeRouteTablePrice = (
  params: IAddBillingStandardDataParams,
): RequestPromise<null> => {
  return request(`/api/routeLibrary/billingStandard/add/cv`, {
    method: 'post',
    data: params,
  });
};

export const deleteRouteTruckType = (params: {
  id: number;
}): RequestPromise<null> => {
  return request('/api/routeLibrary/truckType/delete', {
    method: 'post',
    data: params,
  });
};

// Batch Price Update Template
export const waybillCreateBatchPriceUpdateTemplate = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/waybill/createBatchPriceUpdateTemplate`, {
    method: 'post',
    data: params,
    timeout: 1000 * 30,
  });
};

export const waybillReceiveInterruptSignal = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/waybill/receiveInterruptSignal`, {
    method: 'post',
    data: params,
  });
};

export const waybillParseWaybillBatchPriceUpdate = (params: {
  projectId: number;
  spreadsheetId: string;
}): RequestPromise<IBatchPriceUpdate> => {
  return request(`/api/waybill/parseWaybillBatchPriceUpdate`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 30,
  });
};
export const stopPointAdd = (params: IStopPointParmas): RequestPromise<any> => {
  return request(`/api/stopPoint/add`, {
    method: 'post',
    data: params,
  });
};
export const stopPointUpdate = (
  params: IStopPointParmas,
): RequestPromise<any> => {
  return request(`/api/stopPoint/update`, {
    method: 'post',
    data: params,
  });
};
export const stopPointDelete = (params: {
  id: number;
}): RequestPromise<any> => {
  return request(`/api/stopPoint/delete`, {
    method: 'post',
    data: params,
  });
};
export const stopPointCheckDelete = (params: {
  id: number;
}): RequestPromise<number> => {
  return request(`/api/stopPoint/checkDelete`, {
    method: 'post',
    data: params,
  });
};
export const stopPointList = (params: {
  projectId: number;
  padId: number;
  sadId: number;
  tadId: number;
  label: string;
}): RequestPromise<PaginationResponse<IStopPointItem>> => {
  return request(`/api/stopPoint/list`, {
    method: 'post',
    data: params,
  });
};

export const projectContractList = (
  params: IProjectContractsListPayload,
): RequestPromise<PaginationResponse<IContractRecord>> => {
  return request(`/api/project/contract/list`, {
    method: 'post',
    data: params,
  });
};

export const getCustomerSheetStatus = (params: {
  id: number;
}): RequestPromise<ISyncFromStatusData> => {
  return request(
    `/api/project/routeLibrary/sheet/customer/syncFromSheetStatus`,
    {
      method: 'post',
      data: params,
    },
  );
};

export const getVendorSheetStatus = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<ISyncFromStatusData> => {
  return request(`/api/project/routeLibrary/sheet/vendor/syncFromSheetStatus`, {
    method: 'post',
    data: params,
  });
};

export const customerFromSheet = (params: {
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<SyncFromSheetData> => {
  return request(`/api/project/routeLibrary/sheet/customer/syncFromSheet`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 10,
  });
};

export const vendorFromSheet = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<SyncFromSheetData> => {
  return request(`/api/project/routeLibrary/sheet/vendor/syncFromSheet`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 10,
  });
};

export const resetCustomerFromSheetStatus = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/project/routeLibrary/sheet/customer/resetSyncStatus`, {
    method: 'post',
    data: params,
  });
};

export const resetVendorFromSheetStatus = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<null> => {
  return request(`/api/project/routeLibrary/sheet/vendor/resetSyncStatus`, {
    method: 'post',
    data: params,
  });
};

export const getCustomerFromSheetData = (params: {
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<SyncFromSheetData> => {
  return request(`/api/project/routeLibrary/sheet/customer/listImportResult`, {
    method: 'post',
    data: params,
  });
};

export const getVendorFromSheetData = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<SyncFromSheetData> => {
  return request(`/api/project/routeLibrary/sheet/vendor/listImportResult`, {
    method: 'post',
    data: params,
  });
};

export const customerManageSheet = (params: {
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<IManageSheetData> => {
  return request(`/api/project/routeLibrary/sheet/customer/manageSheet`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 10,
  });
};

export const vendorManageSheet = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<IManageSheetData> => {
  return request(`/api/project/routeLibrary/sheet/vendor/manageSheet`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 10,
  });
};

export const getCustomerManageStatus = (params: {
  id: number;
}): RequestPromise<IManageStatusData> => {
  return request(`/api/project/routeLibrary/sheet/customer/manageSheetStatus`, {
    method: 'post',
    data: params,
  });
};

export const getVendorManageStatus = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<IManageStatusData> => {
  return request(`/api/project/routeLibrary/sheet/vendor/manageSheetStatus`, {
    method: 'post',
    data: params,
  });
};

export const resetCustomerManageStatus = (params: {
  id: number;
}): RequestPromise<IManageStatusData> => {
  return request(
    `/api/project/routeLibrary/sheet/customer/editExceptionStatus`,
    {
      method: 'post',
      data: params,
    },
  );
};

export const resetVendorManageStatus = (params: {
  vendorId: number;
  routeLibraryId: number;
  billingMode: string;
}): RequestPromise<IManageStatusData> => {
  return request(`/api/project/routeLibrary/sheet/vendor/editExceptionStatus`, {
    method: 'post',
    data: params,
  });
};

export const getProjectPodConfiguration = (params: {
  id: number;
}): RequestPromise<IProjectPodConfiguration> => {
  return request(`/api/project/pod/config/list`, {
    method: 'post',
    data: params,
  });
};

export const saveProjectPodConfiguration = (params: {
  projectId: number;
  list: IPodConfigurationItem[];
}): RequestPromise<null> => {
  return request(`/api/project/pod/config/save`, {
    method: 'post',
    data: params,
  });
};

export const getProjectSubtaskConfiguration = (params: {
  id: number;
}): RequestPromise<ISubtaskConfigurationItem[]> => {
  return request(`/api/project/subtask/config/list`, {
    data: params,
    method: 'post',
  });
};

export const getProjectSubtaskConfigProcessTypeList = (): RequestPromise<
  ISubtaskConfigProcessTypeItem[]
> => {
  return request(`/api/project/subtask/config/processDef/list`, {
    method: 'post',
  });
};

export const saveProjectSubtaskConfiguration = (params: {
  projectId: number;
  list: ISubtaskConfigParams[];
}): RequestPromise<null> => {
  return request(`/api/project/subtask/config/save`, {
    method: 'post',
    data: params,
  });
};
export const projectCustomerCodeTypeList = (): RequestPromise<
  IProjectCustomerCodeTypeItem[]
> => {
  return request(`/api/project/customerCodeType/list`, {
    method: 'get',
  });
};

export const projectCustomerCodeConfigList = (
  id: number,
): RequestPromise<IProjectCustomerCodeConfigItem[]> => {
  return request(`/api/project/customerCodeConfig/list`, {
    method: 'post',
    data: {
      id,
    },
  });
};

export const projectCustomerCodeConfigUpdate = (
  params: IProjectCustomerCodeConfigUpdateParams,
): RequestPromise<IProjectCustomerCodeTypeItem[]> => {
  return request(`/api/project/customerCodeConfig/update`, {
    method: 'post',
    data: params,
  });
};

export const alarmDashboardTaskList = (
  params: IAlarmDashboardTaskListPayload,
): RequestPromise<PaginationResponse<IAlarmDashboardTaskListItem>> => {
  return request(`/api/waybill/alarm/list`, {
    method: 'post',
    data: params,
  });
};

export const alarmDashboardTaskListRefresh = (): RequestPromise<boolean> => {
  return request(`/api/waybill/alarm/statistic`, {
    method: 'post',
    data: {},
  });
};

export const alarmDashboardStatisticsList = (
  params: IAlarmDashboardStatisticsListPayload,
): RequestPromise<IAlarmDashboardStatisticsListItem[]> => {
  return request(`/api/waybill/alarm/doneBy/list`, {
    method: 'post',
    data: params,
  });
};

export const libraryDetailCustomerPricing = (params: {
  routeLibraryId: number;
  versionName?: string;
  contractNumber?: string;
  quotationStart?: string;
  quotationEnd?: string;
  contractStatus?: string;
}): RequestPromise<ILibraryDetailPriceVersionListItem[]> => {
  return request(`/api/routeLibrary/version/customer/list`, {
    method: 'post',
    data: params,
  });
};

export const libraryDetailVendorPricing = (params: {
  routeLibraryId: number;
  vendorId: number;
  versionName?: string;
  contractNumber?: string;
  quotationStart?: string;
  quotationEnd?: string;
  contractStatus?: string;
}): RequestPromise<ILibraryDetailPriceVersionListItem[]> => {
  return request(`/api/routeLibrary/version/vendor/list`, {
    method: 'post',
    data: params,
  });
};

export const libraryDetailVendorPricingInfo = (
  id: number,
): RequestPromise<ILibraryDetailPriceVersionInfo> => {
  return request(`/api/routeLibrary/version/vendor/detail`, {
    method: 'post',
    data: { id },
  });
};

export const libraryDetailCustomerPricingInfo = (
  id: number,
): RequestPromise<ILibraryDetailPriceVersionInfo> => {
  return request(`/api/routeLibrary/version/customer/detail`, {
    method: 'post',
    data: { id },
  });
};

export const editLibraryDetailVendorPricingInfo = (params: {
  id: number;
  name: string;
}): RequestPromise<ILibraryDetailPriceVersionInfo> => {
  return request(`/api/routeLibrary/version/vendor/change  `, {
    method: 'post',
    data: params,
  });
};

export const editLibraryDetailCustomerPricingInfo = (params: {
  id: number;
  name: string;
}): RequestPromise<ILibraryDetailPriceVersionInfo> => {
  return request(`/api/routeLibrary/version/customer/change`, {
    method: 'post',
    data: params,
  });
};
