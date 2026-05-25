import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import {
  CustomerStatementStatusEnum,
  StatementGetTaxRateEnum,
  VendorStatementStatusEnum,
} from '@/enums';
import { EnumClaimTicketType } from '@/enums/claim';
import { request } from '@umijs/max';
import {
  IArStatisticBreakdownByMonthResp,
  IArStatisticOverviewKeyDownloadPayload,
  IArStatisticOverviewPayload,
  IArStatisticOverviewResp,
  IBillingCustomerStatementDetail,
  IBillingVendorStatementDetail,
  ICustomerStatementListItem,
  ICustomerStatementParams,
  IMiscellaneousChangeHistoryListItem,
  IMiscellaneousChangeSaveReq,
  IMiscellaneousChangeWaybillSaveReq,
  IStatementAdditionalListResp,
  IStatementAddReq,
  IStatementCancelCheckResp,
  IStatementCancelledListItem,
  IStatementClaimListResp,
  IStatementClaimTicketListItem,
  IStatementEditAmountPayload,
  IStatementExportParams,
  IStatementGetTaxRateResp,
  IStatementInvoiceListItem,
  IStatementInvoiceNumberListItem,
  IStatementInvoiceParam,
  IStatementInvoiceWaybillSaveParams,
  IStatementLogRecord,
  IStatementMiscellaneousChargeListItem,
  IStatementProofListItem,
  IStatementQueryEditStatementWaybillItem,
  IStatementQueryEditStatementWaybillPayload,
  IStatementQueryProjectReq,
  IStatementQueryWaybillReq,
  IStatementReceiptOrPaymentCreateParams,
  IStatementReceiptOrPaymentListItem,
  IStatementRejectParams,
  IStatementUpdateTaxRateParams,
  IStatementWaybillEditCostReq,
  IStatementWaybillRecord,
  IStatisticUnBilledByCustomerResp,
  IStatisticUncollectedBreakdownDataItem,
  ITaxRateData,
  ITaxRateEditPayload,
  ITaxRateTablePayload,
  IVendorStatementListItem,
  IVendorStatementParams,
} from './types/billing';
import { ICommonMaterial, RequestPromise } from './types/common';
import { IProjectRecord } from './types/project';

export const getCustomerStatementList = (
  params: ICustomerStatementParams,
): RequestPromise<PaginationResponse<ICustomerStatementListItem>> => {
  return request(`/api/statement/customer-list`, {
    method: 'post',
    data: params,
  });
};
export const getCustomerStatementListExport = (
  params: ICustomerStatementParams,
): RequestPromise<PaginationResponse<string>> => {
  return request(`/api/statement/customer/export`, {
    method: 'post',
    data: params,
  });
};

export const getVendorStatementList = (
  params: IVendorStatementParams,
): RequestPromise<PaginationResponse<IVendorStatementListItem>> => {
  return request(`/api/statement/vendor-list`, {
    method: 'post',
    data: params,
  });
};
export const getVendorStatementExport = (
  params: IVendorStatementParams,
): RequestPromise<PaginationResponse<string>> => {
  return request(`/api/statement/vendor/export`, {
    method: 'post',
    data: params,
  });
};

export const statementDetail = (
  id: number,
): RequestPromise<
  IBillingCustomerStatementDetail | IBillingVendorStatementDetail
> => {
  return request(`/api/statement/detail`, {
    method: 'post',
    data: { id },
  });
};

export const statementConfirm = (id: number): RequestPromise<null> => {
  return request(`/api/statement/confirm`, {
    method: 'post',
    data: { id },
  });
};

export const statementCustomerConfirm = (params: {
  id: number;
  bindIds: number[];
}): RequestPromise<{ id: number; claimRequestNo: string }[]> => {
  return request(`/api/statement/customer-confirm`, {
    method: 'post',
    data: params,
  });
};
export const statementVendorConfirm = (id: number): RequestPromise<null> => {
  return request(`/api/statement/vendor-confirm`, {
    method: 'post',
    data: { id },
  });
};

export const statementConfirmReceivedOrPaid = (
  id: number,
): RequestPromise<{
  status: CustomerStatementStatusEnum | VendorStatementStatusEnum;
  message: string;
}> => {
  return request(`/api/statement/confirm-received`, {
    method: 'post',
    data: { id },
  });
};
export const statementCheckWaybillInvoice = (
  id: number,
): RequestPromise<{
  code: number;
}> => {
  return request(`/api/statement/check-waybill-invoice`, {
    method: 'post',
    data: { id },
  });
};

export const statementExport = (
  data: IStatementExportParams,
): RequestPromise<string> => {
  return request(`/api/statement/export-statement`, {
    method: 'post',
    data,
  });
};

export const statementCancel = (id: number): RequestPromise<null> => {
  return request(`/api/statement/cancel`, {
    method: 'post',
    data: { id },
  });
};

export const statementReject = (
  data: IStatementRejectParams,
): RequestPromise<null> => {
  return request(`/api/statement/reject`, {
    method: 'post',
    data,
  });
};

export const statementLog = (params: {
  id: number;
}): RequestPromise<IStatementLogRecord[]> => {
  return request(`/api/statement/log`, {
    method: 'post',
    data: params,
  });
};

export const statementInvoiceNumberList = (
  id: number,
): RequestPromise<IStatementInvoiceNumberListItem[]> => {
  return request(`/api/statement-invoice/number-list`, {
    method: 'post',
    data: { id },
  });
};

export const statementInvoiceWaybillSave = (
  params: IStatementInvoiceWaybillSaveParams,
): RequestPromise<null> => {
  return request(`/api/statement-invoice/waybill/save`, {
    method: 'post',
    data: params,
  });
};

export const statementInvoiceWaybillSaveAll = (
  id: number,
): RequestPromise<null> => {
  return request(`/api/statement-invoice/waybill/save-all`, {
    method: 'post',
    data: { id },
  });
};

export const statementInvoiceList = (
  id: number,
): RequestPromise<IStatementInvoiceListItem[]> => {
  return request(`/api/statement-invoice/list`, {
    method: 'post',
    data: { id },
  });
};

export const statementInvoiceCreate = (
  data: IStatementInvoiceParam,
): RequestPromise<null> => {
  return request(`/api/statement-invoice/create`, {
    method: 'post',
    data,
  });
};

export const statementInvoiceEdit = (
  data: IStatementInvoiceParam,
): RequestPromise<null> => {
  return request(`/api/statement-invoice/edit`, {
    method: 'post',
    data,
  });
};

export const statementInvoiceDelete = (id: number): RequestPromise<null> => {
  return request(`/api/statement-invoice/delete`, {
    method: 'post',
    data: { id },
  });
};

export const statementReceiptOrPaymentCreate = (params: {
  data: IStatementReceiptOrPaymentCreateParams;
  signal: AbortSignal;
}): RequestPromise<null> => {
  return request(`/api/statement-receipt/create`, {
    method: 'post',
    data: params.data,
    signal: params.signal,
  });
};

export const statementReceiptOrPaymentList = (
  id: number,
): RequestPromise<IStatementReceiptOrPaymentListItem[]> => {
  return request(`/api/statement-receipt/list`, {
    method: 'post',
    data: { id },
  });
};

export const statementReceiptOrPaymentFileList = (
  id: number,
): RequestPromise<ICommonMaterial[]> => {
  return request(`/api/statement-receipt/detail`, {
    method: 'post',
    data: { id },
  });
};

export const statementWrittenOffCreate = (params: {
  data: { statementId: number; materialIds: number[] };
  signal: AbortSignal;
}): RequestPromise<null> => {
  return request(`/api/statement/write-off`, {
    method: 'post',

    data: params.data,
    signal: params.signal,
  });
};

export const statementProofList = (
  id: number,
): RequestPromise<IStatementProofListItem[]> => {
  return request(`/api/statement-proof/list`, {
    method: 'post',
    data: { id },
  });
};

export const statementProofCreate = (params: {
  statementId: number;
  proofType: string;
  description?: string;
  materialIds: number[];
}): RequestPromise<null> => {
  return request(`/api/statement-proof/create`, {
    method: 'post',
    data: params,

    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const statementProofEdit = (params: {
  statementProofId: number;
  deletedMaterialIdList: number[];
  proofType: string;
  description?: string;
  materialIds: number[];
}): RequestPromise<null> => {
  return request(`/api/statement-proof/edit`, {
    method: 'post',
    data: params,

    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const statementProofDelete = (id: number): RequestPromise<null> => {
  return request(`/api/statement-proof/delete`, {
    method: 'post',
    data: { id },
  });
};

export const statementQueryWaybill = (
  params: IStatementQueryWaybillReq,
): RequestPromise<PaginationResponse<IStatementWaybillRecord>> => {
  return request(`/api/statement/query-waybill`, {
    method: 'post',
    data: params,
  });
};

export const statementQueryProject = (
  params: IStatementQueryProjectReq,
): RequestPromise<IProjectRecord[]> => {
  return request(`/api/statement/query-project`, {
    method: 'post',
    data: params,
  });
};

export const statementAddWithWaybill = (
  params: IStatementAddReq,
): RequestPromise<number> => {
  return request(`/api/statement/add-with-waybill`, {
    method: 'post',
    data: params,
    skipErrorHandler: true,
  });
};

export const statementAddNoWaybill = (
  params: IStatementAddReq,
): RequestPromise<number> => {
  return request(`/api/statement/add-no-waybill`, {
    method: 'post',
    data: params,
  });
};

export const miscellaneousChangeList = (
  id: number,
): RequestPromise<IStatementMiscellaneousChargeListItem[]> => {
  return request(`/api/statement-miscellaneous-charge/list`, {
    method: 'post',
    data: { id },
  });
};
export const miscellaneousChangeHistoryList = (
  id: number,
): RequestPromise<IMiscellaneousChangeHistoryListItem[]> => {
  return request(`/api/statement-miscellaneous-charge/history-list`, {
    method: 'post',
    data: { id },
  });
};

export const miscellaneousChangeSave = (
  params: IMiscellaneousChangeSaveReq,
): RequestPromise<IStatementMiscellaneousChargeListItem> => {
  return request(`/api/statement-miscellaneous-charge/save`, {
    method: 'post',
    data: params,
  });
};
export const miscellaneousChangeWaybillSave = (
  params: IMiscellaneousChangeWaybillSaveReq,
): RequestPromise<null> => {
  return request(`/api/statement-miscellaneous-charge/waybill/save`, {
    method: 'post',
    data: params,
  });
};

export const queryStatementWaybill = (
  params: IStatementQueryWaybillReq,
): RequestPromise<PaginationResponse<IStatementWaybillRecord>> => {
  return request(`/api/statement/query-statementWaybill`, {
    method: 'post',
    data: params,
  });
};

export const statementWaybillEditCost = (
  params: IStatementWaybillEditCostReq,
): RequestPromise<PaginationResponse<null>> => {
  return request(`/api/statement/edit-cost`, {
    method: 'post',
    data: params,
  });
};

export const statementClaimList = (params: {
  pageNum: number;
  pageSize: number;
  id: number;
}): RequestPromise<IStatementClaimListResp> => {
  return request(`/api/statement/claim-list`, {
    method: 'post',
    data: params,
  });
};

export const exportStatementClaim = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/statement/export-statement-claim`, {
    method: 'post',
    data: params,
  });
};

export const arStatisticOverview = (
  params: IArStatisticOverviewPayload,
): RequestPromise<IArStatisticOverviewResp> => {
  return request(`/api/ar-statement/statistic/overview`, {
    method: 'post',
    data: params,
  });
};

export const arStatisticOverviewTripsNumDownload = (
  params: IArStatisticOverviewKeyDownloadPayload,
): RequestPromise<any> => {
  return request(`/api/ar-statement/statistic/overview/trips-num/download`, {
    method: 'post',
    data: params,
  });
};

export const arStatisticOverviewIndependentDownload = (
  params: IArStatisticOverviewKeyDownloadPayload,
): RequestPromise<any> => {
  return request(
    `/api/ar-statement/statistic/overview/independent-statement/download`,
    {
      method: 'post',
      data: params,
    },
  );
};

export const arStatisticOverviewDownload = (params: {
  startDate: string;
  endDate: string;
}): RequestPromise<string> => {
  return request(`/api/ar-statement/statistic/overview/download`, {
    method: 'post',
    data: params,
  });
};

export const arStatisticBreakdownByMonth = (params: {
  year: string;
  customerIdList?: number[];
}): RequestPromise<IArStatisticBreakdownByMonthResp> => {
  return request(`/api/ar-statement/statistic/breakdown-by-month`, {
    method: 'post',
    data: params,
  });
};

export const arStatisticBreakdownByMonthDownload = (params: {
  year: string;
  customerIdList?: number[];
}): RequestPromise<string> => {
  return request(`/api/ar-statement/statistic/breakdown-by-month/download`, {
    method: 'post',
    data: params,
  });
};

export const arStatisticBreakdownByMonthTripsNumDownload = (params: {
  statDate: string;
  key: string;
}): RequestPromise<string> => {
  return request(
    `/api/ar-statement/statistic/breakdown-by-month/trips-num/download`,
    {
      method: 'post',
      data: params,
    },
  );
};

export const arStatisticUncollectedBreakdown = (params: {
  customerId?: number;
}): RequestPromise<IStatisticUncollectedBreakdownDataItem[]> => {
  let baseUrl = `/api/ar-statement/statistic/uncollected-breakdown`;
  if (params.customerId) {
    baseUrl += `?customerId=${params.customerId}`;
  }

  return request(baseUrl, {
    method: 'post',
    data: params,
  });
};

export const arStatisticUncollectedBreakdownTripsNumDownload = (params: {
  key: string;
  customerId?: number;
}): RequestPromise<string> => {
  let baseUrl = `/api/ar-statement/statistic/uncollected-breakdown/trips-num/download?key=${params.key}`;
  if (params.customerId) {
    baseUrl += `&customerId=${params.customerId}`;
  }
  return request(baseUrl, {
    method: 'post',
    data: params,
  });
};

export const arStatisticUncollectedBreakdownDownload = (params: {
  customerId?: number;
}): RequestPromise<string> => {
  let baseUrl = `/api/ar-statement/statistic/uncollected-breakdown/download`;
  if (params.customerId) {
    baseUrl += `?customerId=${params.customerId}`;
  }
  return request(baseUrl, {
    method: 'post',
    data: params,
  });
};

export const arStatisticUnBilledByCustomer = (params: {
  year: string;
  customerId?: number;
}): RequestPromise<IStatisticUnBilledByCustomerResp> => {
  let baseUrl = `/api/ar-statement/statistic/unBilled-by-customer`;

  return request(baseUrl, {
    method: 'post',
    data: params,
  });
};

export const arStatisticUnBilledByCustomerDownload = (params: {
  year: string;
  customerId?: number;
}): RequestPromise<string> => {
  let baseUrl = `/api/ar-statement/statistic/unBilled-by-customer/download`;

  return request(baseUrl, {
    method: 'post',
    data: params,
  });
};

export const arStatisticUnBilledByCustomerTripsNumDownload = (params: {
  statDate: string;
  key: string;
  customerId: number;
}): RequestPromise<string> => {
  let baseUrl = `/api/ar-statement/statistic/unBilled-by-customer/trips-num/download`;

  return request(baseUrl, {
    method: 'post',
    data: params,
  });
};

export const statementExportRecord = (data: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/statement/export-change-record`, {
    method: 'post',
    data,
  });
};
export const statementChangeTax = (data: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/statement/change-tax`, {
    method: 'post',
    data,
  });
};
export const statementCancelledInvoiceList = (data: {
  id: number;
}): RequestPromise<IStatementCancelledListItem[]> => {
  return request(`/api/statement-invoice/cancelled-list`, {
    method: 'post',
    data,
  });
};
export const statementQueryEditStatementWaybill = (
  params: IStatementQueryEditStatementWaybillPayload,
): RequestPromise<
  PaginationResponse<IStatementQueryEditStatementWaybillItem[]>
> => {
  return request(`/api/statement/query-edit-statementWaybill`, {
    method: 'post',
    data: params,
  });
};
export const statementEditAmount = (params: {
  statementId: number;
  reqList: IStatementEditAmountPayload[];
}): RequestPromise<null> => {
  return request(`/api/statement/edit-amount`, {
    method: 'post',
    data: params,
  });
};

export const statementAdditionalList = (params: {
  pageNum: number;
  pageSize: number;
  id: number;
}): RequestPromise<IStatementAdditionalListResp> => {
  return request(`/api/statement/additional-charge-list`, {
    method: 'post',
    data: params,
  });
};

export const exportStatementAdditional = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/statement/export-statement/additional-charge`, {
    method: 'post',
    data: params,
  });
};

export const taxRateList = (
  params: ITaxRateTablePayload,
): RequestPromise<ITaxRateData> => {
  return request(`/api/tax-rate/list`, {
    method: 'post',
    data: params,
  });
};

export const taxRateEdit = (
  params: ITaxRateEditPayload,
): RequestPromise<null> => {
  return request(`/api/tax-rate/edit`, {
    method: 'post',
    data: params,
  });
};

export const statementEditReimbursement = (params: {
  statementId: number;
  reqList: IStatementEditAmountPayload[];
}): RequestPromise<null> => {
  return request(`/api/statement/edit-reimbursement`, {
    method: 'post',
    data: params,
  });
};
export const statementCheckWaybill = (params: {
  statementId: number;
  waybillNumber: string;
}): RequestPromise<null> => {
  return request(`/api/statement/check/add/waybill`, {
    method: 'post',
    data: params,
  });
};
export const statementAddWaybill = (params: {
  statementId: number;
  waybillNumbers: string[];
}): RequestPromise<null> => {
  return request(`/api/statement/add/waybill`, {
    method: 'post',
    data: params,
  });
};
export const statementRemoveWaybill = (params: {
  statementId: number;
  statementWaybillIds: number[];
}): RequestPromise<null> => {
  return request(`/api/statement/remove/waybill`, {
    method: 'post',
    data: params,
  });
};
export const statementClaimTicketList = (params: {
  pageNum: number;
  pageSize: number;
  arStatementId?: number;
  apStatementId?: number;
  claimTicketType: EnumClaimTicketType;
}): RequestPromise<PaginationResponse<IStatementClaimTicketListItem[]>> => {
  return request(`/api/statement/claim/list`, {
    method: 'post',
    data: params,
  });
};
export const statementCheckAddClaim = (params: {
  statementId?: number;
  claimId?: number;
}): RequestPromise<null> => {
  return request(`/api/statement/check/add/claim`, {
    method: 'post',
    data: params,
  });
};
export const statementRemoveClaim = (params: {
  statementId?: number;
  claimIds?: number[];
}): RequestPromise<null> => {
  return request(`/api/statement/remove/claim`, {
    method: 'post',
    data: params,
  });
};
export const statementAddClaim = (params: {
  statementId?: number;
  claimIds?: number[];
}): RequestPromise<null> => {
  return request(`/api/statement/add/claim`, {
    method: 'post',
    data: params,
  });
};
export const statementCancelCheck = (params: {
  id?: number;
}): RequestPromise<IStatementCancelCheckResp> => {
  return request(`/api/statement/cancel/check`, {
    method: 'post',
    data: params,
  });
};

export const statementGetTaxRate = (params: {
  id?: number;
  itemType?: StatementGetTaxRateEnum;
}): RequestPromise<IStatementGetTaxRateResp[]> => {
  return request(`/api/statement/get/statementWaybill/taxRate`, {
    method: 'post',
    data: params,
  });
};
export const statementUpdateTaxRate = (
  params: IStatementUpdateTaxRateParams,
): RequestPromise<null> => {
  return request(`/api/statement/update/statementWaybill/taxRate`, {
    method: 'post',
    data: params,
  });
};
