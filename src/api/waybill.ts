import { RequestPromise } from '@/api/types/common';
import {
  IAdditionalChargeConfirmParams,
  IAdditionalChargeRecordResponse,
  IBillingParams,
  ICustomerCodeListItem,
  ICustomerCodeTypeListItem,
  ICustomerCodeUpdate,
  IExceptionListData,
  IExceptionListItem,
  ILatLngFillPayload,
  ILatLngFillResultItem,
  ILatestExportRecord,
  IListPodNumberTypeItem,
  IListPodResp,
  IListRemarkResp,
  IListShippingRecordResponse,
  IListWaybillBatchCreateStatus,
  IOperationLogItem,
  IPartialPaymentRecordResponse,
  IQuickDispatchParams,
  IRequireTruckListItem,
  IRouteByCodeRes,
  IRouteOriginAndDestinationListItem,
  IRouteOriginAndDestinationListPayload,
  ISettlementData,
  IWaybillAutomationResult,
  IWaybillBaseInfoData,
  IWaybillBatchGoogleDriveLink,
  IWaybillBatchSubmitOrStartResult,
  IWaybillBatchUpdateOrCancelOrAbnormalResult,
  IWaybillBillingBasicData,
  IWaybillBillingClaimData,
  IWaybillBillingClaimOptions,
  IWaybillBillingData,
  IWaybillCarrierData,
  IWaybillClaimLinkStatementData,
  IWaybillDriverListItem,
  IWaybillDriverListParams,
  IWaybillEditCustomerCodeListParams,
  IWaybillFilterItem,
  IWaybillHelperListItem,
  IWaybillHelperListParams,
  IWaybillLinkStatementData,
  IWaybillLinkedTicketItem,
  IWaybillListItem,
  IWaybillListParams,
  IWaybillListPodNumberList,
  IWaybillPodAddReq,
  IWaybillPodEditReq,
  IWaybillReimbursementData,
  IWaybillReimbursementOptions,
  IWaybillRejectParams,
  IWaybillRevCostExportParams,
  IWaybillRouteAddressCheckRes,
  IWaybillRouteAddressReplacePayload,
  IWaybillRouteDetailResult,
  IWaybillRouteTemporaryDetailResult,
  IWaybillTruckListItem,
  IWaybillTruckListParams,
  IWaybillTruckTypeItem,
  IWaybillVendorListItem,
  IWaybillVendorListParams,
  IWaypointListItem,
} from '@/api/types/waybill';
import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { WaybillDispatchTypeEnum } from '@/enums';
import { EnumBatchType } from '@/pages/waybill/components/BatchLockModal';
import { request } from '@umijs/max';
import { Key } from 'react';

export const getWaybillList = (
  params: IWaybillListParams,
): RequestPromise<PaginationResponse<IWaybillListItem>> => {
  return request(`/api/waybill/list`, {
    method: 'post',
    data: params,
  });
};

// router 相关
export const waybillRouteOriginList = (
  params: IRouteOriginAndDestinationListPayload,
  signal?: AbortSignal,
): RequestPromise<PaginationResponse<IRouteOriginAndDestinationListItem>> => {
  return request(`/api/waybill/route/origin/list`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const waybillRouteWaypointList = (params: {
  pageNum?: number;
  pageSize?: number;
  padIdQuery?: number;
  routeId: number;
  waybillId: number;
}): RequestPromise<PaginationResponse<IWaypointListItem>> => {
  return request(`/api/waybill/route/waypoint/list`, {
    method: 'post',
    data: params,
  });
};

export const waybillRouteDestinationList = (
  params: IRouteOriginAndDestinationListPayload & { routeId: number },
  signal?: AbortSignal,
): RequestPromise<PaginationResponse<IRouteOriginAndDestinationListItem>> => {
  return request(`/api/waybill/route/destination/list`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const addWaybillCheck = (params: {
  projectId: number;
  positionTime: string;
  dispatchType: WaybillDispatchTypeEnum;
  requiredTruckType: number;
  destinationTime: string;
}): RequestPromise<number> => {
  return request(`/api/waybill/add/check`, {
    method: 'post',
    data: params,
  });
};
export const addWaybill = (params: {
  projectId: number;
  positionTime: string;
  dispatchType: WaybillDispatchTypeEnum;
  requiredTruckType: number;
  destinationTime: string;
}): RequestPromise<null> => {
  return request(`/api/waybill/add`, {
    method: 'post',
    data: params,
  });
};

export const getRequireTruckType = (params: {
  projectId: number;
  dispatchType: WaybillDispatchTypeEnum;
}): RequestPromise<IRequireTruckListItem[]> => {
  return request(`/api/waybill/truckType/show/list`, {
    method: 'post',
    data: params,
  });
};

export const waybillCarrier = (params: {
  id: number;
}): RequestPromise<IWaybillCarrierData | null> => {
  return request('/api/waybill/detail/carrier', {
    method: 'post',
    data: params,
  });
};

export const waybillCarrierCheck = (params: {
  vendorTruckId: number;
  projectId: number;
}): RequestPromise<number> => {
  return request(`/api/waybill/carrier/check`, {
    method: 'post',
    data: params,
  });
};

export const waybillTruckTypeList = (params: {
  id: number;
}): RequestPromise<IWaybillTruckTypeItem[]> => {
  return request(`/api/waybill/truckType/list`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillVendorList = (
  params: IWaybillVendorListParams,
): RequestPromise<PaginationResponse<IWaybillVendorListItem>> => {
  return request(`/api/waybill/vendor/list`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillTruckList = (
  params: IWaybillTruckListParams,
): RequestPromise<PaginationResponse<IWaybillTruckListItem>> => {
  return request(`/api/waybill/truck/list`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillDriverList = (
  params: IWaybillDriverListParams,
): RequestPromise<IWaybillDriverListItem[]> => {
  return request(`/api/waybill/driver/list`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillHelperList = (
  params: IWaybillHelperListParams,
): RequestPromise<IWaybillHelperListItem[]> => {
  return request(`/api/waybill/helper/list`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillBasicInfo = (params: {
  id: number;
}): RequestPromise<IWaybillBaseInfoData> => {
  return request(`/api/waybill/detail/basicInfo`, {
    method: 'post',
    data: params,
  });
};
export const waybillListAllAction = (): RequestPromise<string[]> => {
  return request(`/api/waybill/listAllAction`, {
    method: 'post',
  });
};

export const addShippingRecord = (params: FormData): RequestPromise<null> => {
  return request(`/api/waybill/addShippingRecord`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const listShippingRecord = (params: {
  hasGps: 0 | 1;
  waybillId: number;
  plateNumber: string;
}): RequestPromise<IListShippingRecordResponse> => {
  return request(`/api/waybill/listShippingRecord`, {
    method: 'post',
    data: params,
  });
};

// additional Charge
export const additionalChargeRecord = (params: {
  id: number;
}): RequestPromise<IAdditionalChargeRecordResponse> => {
  return request(`/api/waybill/detail/additionalCharge`, {
    method: 'post',
    data: params,
  });
};

export const editPosition = (params: {
  projectId: number;
  waybillId: number;
  shippingRecordId: number;
  lng: number;
  lat: number;
  mapAddress: string;
}): RequestPromise<null> => {
  return request(`/api/waybill/editPosition`, {
    method: 'post',
    data: params,
  });
};

export const additionalChargeConfirm = (
  params: IAdditionalChargeConfirmParams,
): RequestPromise<null> => {
  return request(`/api/waybill/detail/additionalCharge/confirm`, {
    method: 'post',
    data: params,
  });
};
//Partial Payment
export const partialPaymentRecord = (params: {
  id: number;
}): RequestPromise<IPartialPaymentRecordResponse> => {
  return request(`/api/waybill/detail/partialPayment`, {
    method: 'post',
    data: params,
  });
};

export const partialPaymentEditRecord = (params: {
  id: number;
  waybillId: number;
  percentageOfPaidInAdvance: number;
  percentageOfHandlingFee: number;
  percentageOfRegularPayments: number;
  canUpdate: boolean;
}): RequestPromise<null> => {
  return request(`/api/waybill/detail/partialPayment/edit`, {
    method: 'post',
    data: params,
  });
};

export const waybillRouteAdd = (
  params: any,
): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/waybill/route/add`, {
    method: 'post',
    data: params,
  });
};

export const updateWaybill = (params: {
  id: number;
  projectId: number;
  vendorTruckId?: number;
  positionTime?: string;
  remark?: string;
  truckType?: number;
  capacityPoolTruckId?: number;
  driverId?: number;
  externalCode?: string;
  helperIds?: number[];
  destinationTime?: string;
  requiredTruckType?: number;
}): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/waybill/update`, {
    method: 'post',
    data: params,
  });
};

export const waybillRouteAddressCheck = (
  params: {
    pad: number;
    tad: number;
    sad: number;
    lat: number;
    lng: number;
  },
  skipErrorHandler?: boolean,
): RequestPromise<IWaybillRouteAddressCheckRes> => {
  return request(`/api/waybill/route/address/check`, {
    method: 'post',
    data: params,
    skipErrorHandler: skipErrorHandler ?? false,
  });
};

export const waybillRoutePriceCheck = (params: {
  waybillId: number;
  routeId: number;
}): RequestPromise<boolean> => {
  return request(`/api/waybill/route/price/check`, {
    method: 'post',
    data: params,
  });
};

export const checkCarrierSubmit = (params: {
  id: number;
  projectId: number;
  capacityPoolTruckId?: number;
  vendorTruckId?: number;
  driverId?: number;
  helperIds?: number[];
  positionTime?: string;
}): RequestPromise<number> => {
  return request('/api/waybill/checkSubmitCarrier', {
    method: 'post',
    data: params,
  });
};

export const carrierSubmit = (params: {
  id: number;
  vendorId: number;
  vendorTruckId: number;
  truckType: number;
  driverId: number;
  helperIds: number[];
}): RequestPromise<{ msg: string; code: number }> => {
  return request('/api/waybill/carrier/add', {
    method: 'post',
    data: params,
  });
};

export const editPod = (params: IWaybillPodEditReq): RequestPromise<null> => {
  return request('/api/waybill/editPod', {
    method: 'post',
    data: params,
  });
};

export const addPod = (params: IWaybillPodAddReq): RequestPromise<null> => {
  return request('/api/waybill/addPod', {
    method: 'post',
    data: params,
  });
};

export const deletePod = (params: {
  waybillId: number;
  projectId: number;
  waybillPodId: number;
  generateType: string;
  deletedFileIdList: number[];
}): RequestPromise<null> => {
  return request('/api/waybill/deletePod', {
    method: 'post',
    data: params,
  });
};

export const getListPod = (params: {
  id: number;
}): RequestPromise<IListPodResp> => {
  return request('/api/waybill/listPod', {
    method: 'post',
    data: params,
  });
};

export const listAllPodType = (): RequestPromise<string[]> => {
  return request('/api/waybill/listAllPodType', {
    method: 'post',
  });
};

export const editRemark = (params: FormData): RequestPromise<null> => {
  return request('/api/waybill/editRemark', {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const addRemark = (params: FormData): RequestPromise<null> => {
  return request('/api/waybill/addRemark', {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const deleteRemark = (params: {
  waybillId: number;
  projectId: number;
  waybillRemarkId: number;
  generateType: string;
  deletedFileIdList: number[];
}): RequestPromise<null> => {
  return request('/api/waybill/deleteRemark', {
    method: 'post',
    data: params,
  });
};

export const getListRemark = (params: {
  id: number;
}): RequestPromise<IListRemarkResp> => {
  return request('/api/waybill/listRemark', {
    method: 'post',
    data: params,
  });
};

export const listAllRemarkType = (): RequestPromise<string[]> => {
  return request('/api/waybill/listAllRemarkType', {
    method: 'post',
  });
};

export const getWaybillBilling = (params: {
  id: number;
}): RequestPromise<IWaybillBillingData> => {
  return request('/api/waybill/detail/billing', {
    method: 'post',
    data: params,
  });
};

export const editBilling = (
  params: IBillingParams,
): RequestPromise<{ code: number; msg: string }> => {
  return request('/api/waybill/detail/billing/edit', {
    method: 'post',
    data: params,
  });
};

export const editStandardBilling = (
  params: IBillingParams,
): RequestPromise<{ code: number; msg: string }> => {
  return request('/api/waybill/detail/billing/edit-standard', {
    method: 'post',
    data: params,
  });
};

export const copyWaybill = (params: {
  waybillIds: Key[];
  positionTime: string;
  destinationTime?: string;
}): RequestPromise<null> => {
  return request('/api/waybill/copy', {
    method: 'post',
    data: params,
  });
};

export const getWaybillLog = (params: {
  id: number;
}): RequestPromise<IOperationLogItem[]> => {
  return request('/api/waybill/operation/log', {
    method: 'post',
    data: params,
  });
};

export const checkShippingRecord = (params: {
  projectId: number;
  waybillId: number;
}): RequestPromise<number> => {
  return request('/api/waybill/pod/checkShippingRecord', {
    method: 'post',
    data: params,
  });
};

export const waybillConfirmDelivery = (params: {
  projectId: number;
  countryId: number;
  waybillId: number;
}): RequestPromise<{ code: number; msg: string }> => {
  return request('/api/waybill/confirmDelivery', {
    method: 'post',
    data: params,
    timeout: 1000 * 60,
  });
};

export const checkSubmit = (params: { id: number }): RequestPromise<number> => {
  return request('/api/waybill/checkSubmit', {
    method: 'post',
    data: params,
  });
};

export const toSubmit = (params: {
  id: number;
}): RequestPromise<{ code: number; msg: string }> => {
  return request('/api/waybill/submit', {
    method: 'post',
    data: params,
  });
};

export const toStart = (params: {
  id: number;
}): RequestPromise<{ code: number; msg: string }> => {
  return request('/api/waybill/start', {
    method: 'post',
    data: params,
  });
};

export const toWaybill = (params: { id: number }): RequestPromise<null> => {
  return request('/api/waybill/confirmWaybill', {
    method: 'post',
    data: params,
  });
};

export const checkWaybill = (params: {
  id: number;
}): RequestPromise<boolean> => {
  return request('/api/waybill/checkConfirmWaybill', {
    method: 'post',
    data: params,
  });
};

export const toDelete = (params: { id: number }): RequestPromise<null> => {
  return request('/api/waybill/delete', {
    method: 'post',
    data: params,
  });
};

export const toCancel = (params: {
  id: number;
  remarkType: string;
  reason: string;
}): RequestPromise<null> => {
  return request('/api/waybill/cancel', {
    method: 'post',
    data: params,
  });
};

export const toAbnormal = (params: {
  id: number;
  remarkType: string;
  reason: string;
}): RequestPromise<null> => {
  return request('/api/waybill/abnormal', {
    method: 'post',
    data: params,
  });
};

export const waybillRouteDetail = (params: {
  id: number;
}): RequestPromise<IWaybillRouteDetailResult> => {
  return request(`/api/waybill/route/detail`, {
    method: 'post',
    data: params,
  });
};

export const waybillRouteTemporaryDetail = (params: {
  id: number;
}): RequestPromise<IWaybillRouteTemporaryDetailResult> => {
  return request(`/api/waybill/route/temporary/detail`, {
    method: 'post',
    data: params,
  });
};

export const waybillMapJsonStr = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/waybill/mapJsonStr`, {
    method: 'post',
    data: params,
  });
};

export const waybillConfirmRoute = (params: {
  id: number;
  mapJsonStr: string;
  distance: number;
  duration: number;
}): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/waybill/confirmRoute`, {
    method: 'post',
    data: params,
  });
};

export const waybillRouteAddressLatLngFill = (
  params: ILatLngFillPayload,
): RequestPromise<ILatLngFillResultItem[]> => {
  return request(`/api/waybill/route/address/latLng/fill`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillRouteByCode = (params: {
  waybillId?: number;
  routeCode: string;
  projectId?: number;
}): RequestPromise<IRouteByCodeRes> => {
  return request(`/api/waybill/route/code`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillExport = (params: {
  ids: number[];
}): RequestPromise<any> => {
  return request(`/api/export-download-manage/export-waybill`, {
    method: 'post',
    data: params,
  });
};

export const getAllWaybillExport = (params: any): RequestPromise<any> => {
  return request(`/api/export-download-manage/exportAllWaybill`, {
    method: 'post',
    data: params,
  });
};

export const getCheckExportNumber = (params: any): RequestPromise<any> => {
  return request(`/api/export-download-manage/checkExportNumber`, {
    method: 'post',
    data: params,
  });
};

export const getExportLatestExportRecord = (): RequestPromise<
  ILatestExportRecord[]
> => {
  return request(`/api/export-download-manage/latest-list`, {
    method: 'post',
  });
};

export const getExportDownload = (params: {
  id: number;
  spreadsheetId: string;
}): RequestPromise<string> => {
  return request(`/api/export-download-manage/download`, {
    method: 'post',
    data: params,
  });
};

export const getExportRev = (
  params: IWaybillRevCostExportParams,
): RequestPromise<string> => {
  return request(`/api/export-download-manage/export-rev`, {
    method: 'post',
    data: params,
  });
};

export const checkCreateDispatch = (
  params: IQuickDispatchParams,
): RequestPromise<WaybillDispatchTypeEnum> => {
  return request('/api/waybill/route/check-quick', {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const createQuickDispatch = (
  params: IQuickDispatchParams,
): RequestPromise<null> => {
  return request(`/api/waybill/route/quick`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const waybillRouteAddressReplace = (
  params: IWaybillRouteAddressReplacePayload,
): RequestPromise<IWaybillRouteAddressReplacePayload> => {
  return request(`/api/waybill/route/address/replace`, {
    method: 'post',
    data: params,
  });
};

export const waybillListPodNumberType = (): RequestPromise<
  IListPodNumberTypeItem[]
> => {
  return request(`/api/waybill/listPodNumberType`, {
    method: 'post',
  });
};

export const waybillListPodNumber = (params: {
  projectId: number;
  waybillId: number;
}): RequestPromise<IWaybillListPodNumberList> => {
  return request(`/api/waybill/listPodNumber`, {
    method: 'post',
    data: params,
  });
};

export const deleteWaybillPodNumber = (params: {
  projectId: number;
  podNumberId: number;
}): RequestPromise<null> => {
  return request(`/api/waybill/deletePodNumber`, {
    method: 'post',
    data: params,
  });
};

export const waybillEditPodNumber = (
  params: IWaybillEditCustomerCodeListParams,
): RequestPromise<null> => {
  return request(`/api/waybill/editPodNumber`, {
    method: 'post',
    data: params,
  });
};

export const listWaybillBatchCreateStatus =
  (): RequestPromise<IListWaybillBatchCreateStatus> => {
    return request(`/api/waybill/listWaybillBatchCreateStatus`, {
      method: 'post',
    });
  };

export const createBatchWaybillCreateTemplate = (): RequestPromise<string> => {
  return request(`/api/waybill/createBatchWaybillCreateTemplate`, {
    method: 'post',
  });
};

export const batchWaybillImport = (): RequestPromise<null> => {
  return request(`/api/waybill/batchWaybillImport`, {
    method: 'post',
    timeout: 1000 * 60 * 30,
  });
};

export const updateBillingTruck = (params: {
  waybillFeeId: number;
  actualOrRequireCustomer: boolean;
  actualOrRequireVendor: boolean;
}): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/waybill/fee/truckType/update`, {
    method: 'post',
    data: params,
  });
};

export const checkRouteLibImportingStatus = (params: {
  id: number;
}): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/waybill/route/check/routeLibrary/importing`, {
    method: 'post',
    data: params,
  });
};

export const waybillAutomationSync = (
  startOrCancel: boolean,
): RequestPromise<string> => {
  return request(`/api/waybillAutomation/sync?startOrCancel=${startOrCancel}`, {
    method: 'get',
  });
};

export const waybillAutomationVerification = (): RequestPromise<string> => {
  return request(`/api/waybillAutomation/sync-confirm-verification`, {
    method: 'get',
  });
};
export const waybillAutomationDelivery = (): RequestPromise<string> => {
  return request(`/api/waybillAutomation/sync/confirm-delivery`, {
    method: 'get',
  });
};

export const waybillAutomationUpdate = (): RequestPromise<string> => {
  return request(`/api/waybillAutomation/update`, {
    method: 'get',
  });
};

export const waybillAutomationUpdateWaybillLink = (): RequestPromise<{
  batchUpdateUrl: string;
}> => {
  return request(`/api/waybillAutomation/google-drive-link`, {
    method: 'get',
  });
};

export const waybillAutomationResult =
  (): RequestPromise<IWaybillAutomationResult> => {
    return request(`/api/waybillAutomation/result`, {
      method: 'get',
    });
  };

export const waybillAutomationSyncStatus = (): RequestPromise<{
  cancelInProgress: boolean;
  startInProgress: boolean;
  confirmVerificationInProgress: boolean;
  confirmDeliveryInProgress: boolean;
  updateWaybillInProgress: boolean;
}> => {
  return request(`/api/waybillAutomation/sync/status`, {
    method: 'get',
  });
};

export const waybillConfirmVerification = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/waybill/confirm-verification`, {
    method: 'post',
    data: params,
  });
};

export const waybillConfirmPrice = (params: {
  id: number;
}): RequestPromise<{ code: number; msg: string }> => {
  return request(`/api/waybill/confirm-price`, {
    method: 'post',
    data: params,
  });
};

export const waybillConfirmPodReceipt = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/waybill/confirm-pod-receipt`, {
    method: 'post',
    data: params,
  });
};

export const waybillReject = (
  params: IWaybillRejectParams,
): RequestPromise<null> => {
  return request(`/api/waybill/reject`, {
    method: 'post',
    data: params,
  });
};

export const submitWaybillException = (params: {
  waybillId: number;
  customerExceptionFeeList: IExceptionListItem[];
  vendorExceptionFeeList: IExceptionListItem[];
  exceptionFeeReceivableStatus: string;
  exceptionFeePayableStatus: string;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
}): RequestPromise<null> => {
  return request(`/api/waybill/detail/exception-fee/confirm`, {
    method: 'post',
    data: params,
  });
};

export const waybillFilterCreate = (params: {
  name: string;
  content: string;
}): RequestPromise<null> => {
  return request(`/api/waybill/filter/create`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillException = (params: {
  id: number;
}): RequestPromise<IExceptionListData> => {
  return request(`/api/waybill/detail/exception-fee`, {
    method: 'post',
    data: params,
  });
};

export const waybillFilterList = (): RequestPromise<IWaybillFilterItem[]> => {
  return request(`/api/waybill/filter/list`, {
    method: 'get',
  });
};

export const waybillFilterDelete = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/waybill/filter/delete?id=${params.id}`, {
    method: 'get',
  });
};

export const getWaybillSettlement = (params: {
  waybillId: number;
  objectType: string;
}): RequestPromise<ISettlementData> => {
  return request(`/api/waybill/detail/settlement-setting`, {
    method: 'post',
    data: params,
  });
};

export const setWaybillSettlement = (
  params: ISettlementData,
): RequestPromise<null> => {
  return request(`/api/waybill/detail/settlement-setting/save`, {
    method: 'post',
    data: params,
  });
};

export const waybillCustomerCodeTypeList = (
  id: number,
): RequestPromise<ICustomerCodeTypeListItem[]> => {
  return request(`/api/waybill/customerCodeType/list`, {
    method: 'post',
    data: { id },
  });
};

export const waybillCustomerCodeList = (
  id: number,
): RequestPromise<ICustomerCodeListItem[]> => {
  return request(`/api/waybill/customerCode/list`, {
    method: 'post',
    data: { id },
  });
};

export const waybillCustomerCodeUpdate = (
  data: ICustomerCodeUpdate,
): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/waybill/customerCode/update`, {
    method: 'post',
    data,
  });
};

export const waybillBillingClaim = (
  id: number,
): RequestPromise<IWaybillBillingClaimData> => {
  return request(`/api/waybill/detail/claim`, {
    method: 'post',
    data: { id },
  });
};

export const editWaybillBillingClaim = (
  params: IWaybillBillingClaimData,
): RequestPromise<null> => {
  return request(`/api/waybill/detail/claim/confirm`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillBillingClaimOptions =
  (): RequestPromise<IWaybillBillingClaimOptions> => {
    return request(`/api/waybill/detail/claim/item-selector`, {
      method: 'get',
    });
  };

export const getWaybillAdditionalOptions = (): RequestPromise<string[]> => {
  return request(`/api/waybill/detail/additionalCharge/item-selector`, {
    method: 'get',
  });
};

export const getBasicDetail = (
  id: number,
): RequestPromise<IWaybillBillingBasicData> => {
  return request(`/api/waybill/detail/basicAmount`, {
    method: 'post',
    data: { id },
  });
};

export const waybillBatchSubmit = (params: {
  ids: number[];
}): RequestPromise<null> => {
  return request(`/api/waybill/batch/submit`, {
    method: 'post',
    data: params,
  });
};

export const waybillBatchSubmitResult =
  (): RequestPromise<IWaybillBatchSubmitOrStartResult> => {
    return request(`/api/waybill/batch/submit-result`, {
      method: 'get',
    });
  };

export const waybillBatchStart = (params: {
  ids: number[];
}): RequestPromise<null> => {
  return request(`/api/waybill/batch/start`, {
    method: 'post',
    data: params,
  });
};

export const waybillBatchStartResult =
  (): RequestPromise<IWaybillBatchSubmitOrStartResult> => {
    return request(`/api/waybill/batch/start-result`, {
      method: 'get',
    });
  };

export const waybillBatchGoogleDriveLinkResult =
  (): RequestPromise<IWaybillBatchGoogleDriveLink> => {
    return request(`/api/waybill/batch/google-drive-link-result`, {
      method: 'get',
    });
  };

export const waybillBatchUpdate = (): RequestPromise<null> => {
  return request(`/api/waybill/batch/update`, {
    method: 'get',
  });
};

export const waybillBatchUpdateResult =
  (): RequestPromise<IWaybillBatchUpdateOrCancelOrAbnormalResult> => {
    return request(`/api/waybill/batch/update-result`, {
      method: 'get',
    });
  };

export const waybillBatchCancel = (): RequestPromise<null> => {
  return request(`/api/waybill/batch/cancel`, {
    method: 'get',
  });
};

export const waybillBatchCancelResult =
  (): RequestPromise<IWaybillBatchUpdateOrCancelOrAbnormalResult> => {
    return request(`/api/waybill/batch/cancel-result`, {
      method: 'get',
    });
  };

export const waybillBatchAbnormal = (): RequestPromise<null> => {
  return request(`/api/waybill/batch/abnormal`, {
    method: 'get',
  });
};

export const waybillBatchAbnormalResult =
  (): RequestPromise<IWaybillBatchUpdateOrCancelOrAbnormalResult> => {
    return request(`/api/waybill/batch/abnormal-result`, {
      method: 'get',
    });
  };

export const waybillBatchCheckStatus = (params: {
  waybillIdList: number[];
  waybillBatchType: EnumBatchType;
}): RequestPromise<number[]> => {
  return request(`/api/waybill/batch/check-status`, {
    method: 'post',
    data: params,
  });
};

export const waybillBillingStatement = (params: {
  id: number;
}): RequestPromise<IWaybillLinkStatementData[]> => {
  return request(`/api/waybill/detail/billing/linked-statement`, {
    method: 'post',
    data: params,
  });
};

export const waybillClaimStatement = (params: {
  id: number;
}): RequestPromise<IWaybillClaimLinkStatementData[]> => {
  return request(`/api/waybill/detail/claim/linked-statement`, {
    method: 'post',
    data: params,
  });
};

export const waybillClaimLinkedTicket = (params: {
  id: number;
}): RequestPromise<IWaybillLinkedTicketItem[]> => {
  return request(`/api/waybill/detail/claim/linked-ticket`, {
    method: 'post',
    data: params,
  });
};

export const waybillReimbursementStatement = (params: {
  id: number;
}): RequestPromise<IWaybillLinkStatementData[]> => {
  return request(`/api/waybill/detail/reimb-expense/linked-statement`, {
    method: 'post',
    data: params,
  });
};

export const waybillReimbursement = (
  id: number,
): RequestPromise<IWaybillReimbursementData> => {
  return request(`/api/waybill/detail/reimb-expense`, {
    method: 'post',
    data: { id },
  });
};

export const editWaybillReimbursement = (
  params: IWaybillReimbursementData,
): RequestPromise<null> => {
  return request(`/api/waybill/detail/reimb-expense/confirm`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillReimbursementOptions =
  (): RequestPromise<IWaybillReimbursementOptions> => {
    return request(`/api/waybill/detail/reimb-expense/item-selector`, {
      method: 'get',
    });
  };

export const getWaybillCount = (params: {
  id: number;
  type: 'Customer' | 'Vendor';
}): RequestPromise<{
  firstDeliveryDate: string;
  latestDeliveryDate: string;
  waybillCount: number;
  ongoingWaybillCount: number;
}> => {
  return request(`/api/waybill/count`, {
    method: 'post',
    data: params,
  });
};

export const getWaybillStatementFieldsList = (): RequestPromise<string[]> => {
  return request(`/api/statement/fields/list`, {
    method: 'get',
  });
};

export const waybillStatementFieldsAdd = (params: {
  fields: string[];
}): RequestPromise<null> => {
  return request(`/api/statement/fields/add`, {
    method: 'post',
    data: params,
  });
};
export const waybillCancelCheck = (params: {
  id: number;
}): RequestPromise<{ code: number; customParam: any; msg: string }> => {
  return request(`/api/waybill/cancel/check`, {
    method: 'post',
    data: params,
  });
};
export const waybillCarrierAssignCheck = (params: {
  id: number;
}): RequestPromise<{ code: number; customParam: any; msg: string }> => {
  return request(`/api/waybill/carrier/assign-check`, {
    method: 'post',
    data: params,
  });
};
