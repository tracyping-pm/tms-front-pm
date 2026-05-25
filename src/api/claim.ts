import { EnumClaimOcStatus } from '@/enums/claim';
import { request } from '@umijs/max';
import {
  IClaimBatchCreateInfoVo,
  IClaimBatchCreateResult,
  IClaimCreatePayload,
  IClaimCreateResponse,
  IClaimDetail,
  IClaimEditPayload,
  IClaimListPayload,
  IClaimListRecord,
  IClaimListType,
  IClaimRequestDetail,
  IClaimRequestEditReq,
  IClaimRequestList,
  IClaimRequestListRecord,
  IClaimRequestReq,
  IClaimWaybillInfo,
  ICustomParam,
  IRefundCreatePayload,
  IRefundDetail,
  IRefundEditPayload,
  IRefundListPayload,
  IRefundListRecord,
  ITicketLogListItem,
  ITicketProofListItem,
  ITicketRemarkListItem,
} from './types/claims';
import { RequestPromise } from './types/common';

export const claimRequestList = (
  params: IClaimRequestList,
): RequestPromise<PaginationResponse<IClaimRequestListRecord>> => {
  return request(`/api/claim/request/list`, {
    method: 'post',
    data: params,
  });
};
export const claimRequestCreate = (
  params: IClaimRequestReq,
): RequestPromise<null> => {
  return request(`/api/claim/request/create`, {
    method: 'post',
    data: params,
  });
};
export const claimRequestCancel = (id: number): RequestPromise<null> => {
  return request(`/api/claim/request/cancel`, {
    method: 'post',
    data: { id },
  });
};
export const claimRequestEdit = (
  params: IClaimRequestEditReq,
): RequestPromise<null> => {
  return request(`/api/claim/request/edit`, {
    method: 'post',
    data: params,
  });
};
export const claimRequestSplit = (id: number): RequestPromise<null> => {
  return request(`/api/claim/request/split`, {
    method: 'post',
    data: { id },
  });
};
export const claimRequestDetail = (
  id: number,
): RequestPromise<IClaimRequestDetail> => {
  return request(`/api/claim/request/detail`, {
    method: 'post',
    data: { id },
  });
};
export const claimGetWaybillInfo = (
  waybillId: number,
): RequestPromise<IClaimWaybillInfo> => {
  return request(`/api/claim/get-waybill-info`, {
    method: 'post',
    data: { id: waybillId },
  });
};

export const getClaimListType = (): RequestPromise<IClaimListType> => {
  return request(`/api/claim/list-type`, {
    method: 'get',
  });
};

export const claimCreate = (
  params: IClaimCreatePayload,
): RequestPromise<IClaimCreateResponse> => {
  return request(`/api/claim/create`, {
    method: 'post',
    data: params,
  });
};

export const claimList = (
  params: IClaimListPayload,
): RequestPromise<PaginationResponse<IClaimListRecord>> => {
  return request(`/api/claim/list`, {
    method: 'post',
    data: params,
  });
};

export const claimExportList = (
  params: IClaimListPayload,
): RequestPromise<null> => {
  return request(`/api/claim/export-list`, {
    method: 'post',
    data: params,
  });
};

export const claimExportDM = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/claim/export-dm`, {
    method: 'post',
    data: params,
  });
};

export const claimDetail = (
  params: {
    id: number;
  },
  signal?: AbortSignal,
): RequestPromise<IClaimDetail> => {
  return request(`/api/claim/detail`, {
    method: 'post',
    data: params,
    signal,
  });
};

export const ticketProofList = (params: {
  id: number;
}): RequestPromise<ITicketProofListItem[]> => {
  return request(`/api/ticket/proof/list`, {
    method: 'post',
    data: params,
  });
};

export const ticketProofAdd = (params: {
  ticketId: number;
  documentIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/ticket/proof/add`, {
    method: 'post',
    data: params,
  });
};

export const ticketProofDelete = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/ticket/proof/delete`, {
    method: 'post',
    data: params,
  });
};

export const ticketRemarkList = (params: {
  id: number;
}): RequestPromise<ITicketRemarkListItem[]> => {
  return request(`/api/ticket/remark/list`, {
    method: 'post',
    data: params,
  });
};

export const ticketRemarkAdd = (params: {
  ticketId: number;
  remark?: string;
}): RequestPromise<null> => {
  return request(`/api/ticket/remark/add`, {
    method: 'post',
    data: params,
  });
};

export const ticketLogList = (params: {
  id: number;
}): RequestPromise<ITicketLogListItem[]> => {
  return request(`/api/ticket/log/list`, {
    method: 'post',
    data: params,
  });
};

export const claimEditOcStatus = (params: {
  id: number;
  ocStatus: EnumClaimOcStatus;
}): RequestPromise<null> => {
  return request(`/api/claim/edit-oc-status`, {
    method: 'post',
    data: params,
  });
};

export const claimVendorDisputed = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/claim/vendor-disputed`, {
    method: 'post',
    data: params,
  });
};

export const getClaimBatchCreateSpreadsheetUrl =
  (): RequestPromise<IClaimBatchCreateInfoVo> => {
    return request(`/api/claim/batch-create/spreadsheet-url`, {
      method: 'get',
    });
  };

export const getClaimBatchCreateResult =
  (): RequestPromise<IClaimBatchCreateResult> => {
    return request(`/api/claim/batch-create/result`, {
      method: 'get',
    });
  };

export const claimBatchCreateImport = (): RequestPromise<null> => {
  return request(`/api/claim/batch-create`, {
    method: 'get',
    timeout: 1000 * 60 * 30,
  });
};

export const claimOngoingValidation = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/claim/ongoing-validation`, {
    method: 'post',
    data: params,
  });
};

export const claimConfirm = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/claim/confirm`, {
    method: 'post',
    data: params,
  });
};
export const claimOCConfirm = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/claim/confirm-oc-status`, {
    method: 'post',
    data: params,
  });
};

export const claimComplete = (params: {
  id: number;
}): RequestPromise<ICustomParam> => {
  return request(`/api/claim/complete`, {
    method: 'post',
    data: params,
  });
};

export const claimCancel = (params: {
  id: number;
}): RequestPromise<ICustomParam> => {
  return request(`/api/claim/cancel`, {
    method: 'post',
    data: params,
  });
};

export const claimSubmit = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/claim/submit`, {
    method: 'post',
    data: params,
  });
};

export const claimEdit = (
  params: IClaimEditPayload,
): RequestPromise<ICustomParam> => {
  return request(`/api/claim/edit`, {
    method: 'post',
    data: params,
  });
};

// Refund
export const refundSubmit = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/refund/submit`, {
    method: 'post',
    data: params,
  });
};

export const refundOngoingValidation = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/refund/ongoing-validation`, {
    method: 'post',
    data: params,
  });
};

export const refundList = (
  params: IRefundListPayload,
): RequestPromise<PaginationResponse<IRefundListRecord>> => {
  return request(`/api/refund/list`, {
    method: 'post',
    data: params,
  });
};

export const refundExportList = (
  params: IRefundListPayload,
): RequestPromise<null> => {
  return request(`/api/refund/export-list`, {
    method: 'post',
    data: params,
  });
};

export const refundEdit = (
  params: IRefundEditPayload,
): RequestPromise<ICustomParam> => {
  return request(`/api/refund/edit`, {
    method: 'post',
    data: params,
  });
};

export const refundEditOcStatus = (params: {
  id: number;
  ocStatus: EnumClaimOcStatus;
}): RequestPromise<null> => {
  return request(`/api/refund/edit-oc-status`, {
    method: 'post',
    data: params,
  });
};

export const refundDetail = (
  params: {
    id: number;
  },
  signal?: AbortSignal,
): RequestPromise<IRefundDetail> => {
  return request(`/api/refund/detail`, {
    method: 'post',
    data: params,
    signal,
  });
};

export const refundCreate = (
  params: IRefundCreatePayload,
): RequestPromise<null> => {
  return request(`/api/refund/create`, {
    method: 'post',
    data: params,
  });
};

export const refundConfirm = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/refund/confirm`, {
    method: 'post',
    data: params,
  });
};
export const refundOCConfirm = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/refund/confirm-oc-status`, {
    method: 'post',
    data: params,
  });
};

export const refundComplete = (params: {
  id: number;
}): RequestPromise<ICustomParam> => {
  return request(`/api/refund/complete`, {
    method: 'post',
    data: params,
  });
};

export const refundCancel = (params: {
  id: number;
}): RequestPromise<ICustomParam> => {
  return request(`/api/refund/cancel`, {
    method: 'post',
    data: params,
  });
};
