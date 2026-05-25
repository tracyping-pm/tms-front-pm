import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';
import { IMaterialFileParams, RequestPromise } from './types/common';
import {
  IAddSignatureParams,
  IFaTransportationListItem,
  IFaTransportationListParams,
  IPDFSignPayload,
  IPricingCheckWaybillItem,
  IPricingCheckWaybillListPayload,
  IProcessRenameParams,
  IQuotedPriceListParamsV2,
  IQuotedPriceListRecord,
  IQuotedPriceStatisticsParams,
  IQuotedPriceStatisticsRecord,
  IQuotedPriceWaybillListParams,
  IQuotedPriceWaybillListParamsV2,
  IQuotedPriceWaybillListRecord,
  ISignatureAddPayload,
  ISignatureDetail,
  ISignatureFlagAddParams,
  ISignatureFlagItem,
  ISignatureListItem,
  ITransportationImportInfo,
} from './types/tool';
import { IWaybillBatchSubmitOrStartResult } from './types/waybill';

export enum EsignatureEmailType {
  SIGN = 'Sign',
  Decline = 'Decline',
}

export const getSignatureList = (params: {
  pageNum?: number;
  pageSize?: number;
  signingByMe?: boolean;
  name?: string;
  statusList?: string[];
  minCreatedAt?: string;
  maxCreatedAt?: string;
}): RequestPromise<PaginationResponse<ISignatureListItem>> => {
  return request(`/api/eSignature/signature/list`, {
    method: 'post',
    data: params,
  });
};

export const cancelSignature = (params: { id: number }) => {
  return request(`/api/eSignature/signature/cancel`, {
    method: 'post',
    data: params,
  });
};

export const signatureAdd = (
  params: ISignatureAddPayload,
): RequestPromise<null> => {
  return request(`/api/eSignature/signature/add`, {
    method: 'post',
    data: params,
  });
};

export const eSignatureEmailCheck = (params: {
  emailList?: string[];
  internalOrExternal: boolean;
}): RequestPromise<{ msg: string; code: number }> => {
  return request(`/api/eSignature/email/check`, {
    method: 'post',
    data: params,
  });
};

export const getSignatureMaterialByFileId = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/eSignature/material/get`, {
    method: 'post',
    data: params,
  });
};

export const addSignature = (
  params: IAddSignatureParams,
): RequestPromise<null> => {
  return request(`/api/eSignature/signature/add`, {
    method: 'post',
    data: params,
  });
};
export const signatureFlagList = (params: {
  emailAES: string;
}): RequestPromise<ISignatureFlagItem[]> => {
  return request(`/api/eSignature/noAuth/signature/flag/list`, {
    method: 'post',
    data: params,
  });
};
export const signatureFlagDelete = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/eSignature/noAuth/signature/flag/delete`, {
    method: 'post',
    data: params,
  });
};
export const signatureFlagAdd = (
  params: ISignatureFlagAddParams,
): RequestPromise<null> => {
  return request(`/api/eSignature/noAuth/signature/flag/add`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};
export const signatureFlagUpdate = (
  params: ISignatureFlagAddParams,
): RequestPromise<null> => {
  return request(`/api/eSignature/noAuth/signature/flag/update`, {
    method: 'post',
    data: params,
  });
};

export const remindSignature = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/eSignature/signature/remind`, {
    method: 'post',
    data: params,
  });
};

export const getPdf = (params: { id: string }): RequestPromise<string> => {
  return request(`/api/eSignature/noAuth/signature/pdf`, {
    method: 'post',
    data: params,
  });
};

export const pdfSign = (
  params: IPDFSignPayload,
): RequestPromise<{
  code: number;
  msg: string;
}> => {
  return request(`/api/eSignature/noAuth/signature/pdf/sign`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};
export const pdfDeclineSign = (params: {
  id: number;
  verificationCode: string;
}): RequestPromise<null> => {
  return request(`/api/eSignature/noAuth/signature/pdf/declineSigning`, {
    method: 'post',
    data: params,
  });
};

export const signatureDetail = (params: {
  id: string;
  email: string;
}): RequestPromise<ISignatureDetail> => {
  return request(`/api/eSignature/noAuth/signature/detail`, {
    method: 'post',
    data: params,
  });
};

export const postSendVerificationCode = (params: {
  signerId: number;
  esignatureEmailType: EsignatureEmailType;
}): RequestPromise<{ code: string }> => {
  return request(`/api/eSignature/noAuth/sendVerificationCode`, {
    method: 'post',
    data: params,
  });
};

export const getMaterialsImage = (params: {
  id: string;
}): RequestPromise<string> => {
  return request(`/api/eSignature/noAuth/materials/image`, {
    method: 'post',
    data: params,
  });
};

export const signatureMaterialFile = (
  params: IMaterialFileParams,
): RequestPromise<any> => {
  const { materialId, driveFileId, fileName } = params;

  return request(
    `/api/eSignature/noAuth/materials/${materialId}/file/${driveFileId}?fileName=${fileName}`,
    {
      method: 'get',
      timeout: FILE_UPLOAD_TIMEOUT,
      // skipErrorHandler: true,
    },
  );
};

export const signatureCertificate = (): RequestPromise<any> => {
  return request(`/api/eSignature/signature/certificate`, {
    method: 'post',
  });
};
export const waybillBackToInTransit = (ids: number[]): RequestPromise<any> => {
  return request(`/api/data/process/waybillBackToInTransit`, {
    method: 'post',
    data: { ids },
  });
};
export const changeTruckTypeOfTruck = (params: {
  truckId: number;
  truckTypeId: number;
}): RequestPromise<any> => {
  return request(`/api/data/process/changeTruckTypeOfTruck`, {
    method: 'post',
    data: params,
  });
};

export const deleteLead = (id: number): RequestPromise<any> => {
  return request(`/api/data/process/deleteLead`, {
    method: 'post',
    data: { id },
  });
};
export const waybillRegenerateSubtask = (
  ids: number[],
): RequestPromise<any> => {
  return request(`/api/data/process/waybillRegenerateSubtask`, {
    method: 'post',
    data: { ids },
  });
};

export const processRename = (
  params: IProcessRenameParams,
): RequestPromise<any> => {
  return request(`/api/data/process/rename`, {
    method: 'post',
    data: params,
  });
};

export const dataProcessingLogs = (
  type:
    | 'Rename'
    | 'DeleteLead'
    | 'WaybillBackToInTransit'
    | 'ChangeTruckTypeOfTruck'
    | 'WaybillRegenerateSubtask',
): RequestPromise<any> => {
  return request(`/api/data/process/dataProcessingLogs`, {
    method: 'post',
    data: { type },
  });
};

export const faTransportationList = (
  params: IFaTransportationListParams,
): RequestPromise<PaginationResponse<IFaTransportationListItem>> => {
  return request(`/api/fa/transportation/list`, {
    method: 'post',
    data: params,
  });
};

export const faTransportationImportInfo =
  (): RequestPromise<ITransportationImportInfo> => {
    return request(`/api/fa/transportation/import-info`, {
      method: 'get',
    });
  };
export const faTransportationSync = (): RequestPromise<null> => {
  return request(`/api/fa/transportation/sync`, {
    method: 'get',
  });
};

export const faTransportationSyncStatus = (
  signal?: AbortSignal,
): RequestPromise<boolean> => {
  return request(`/api/fa/transportation/sync-status`, {
    method: 'get',
    signal: signal,
  });
};
export const faTransportationCollect = (params: {
  ids: number[];
}): RequestPromise<null> => {
  return request(`/api/fa/transportation/collect`, {
    method: 'post',
    data: params,
  });
};
export const faTransportationCancel = (params: {
  ids: number[];
}): RequestPromise<null> => {
  return request(`/api/fa/transportation/cancel`, {
    method: 'post',
    data: params,
  });
};
export const faTransportationExport = (
  params: IFaTransportationListParams,
): RequestPromise<null> => {
  return request(`/api/fa/transportation/export`, {
    method: 'post',
    data: params,
  });
};

export const quotedPriceStatistics = (
  params: IQuotedPriceStatisticsParams,
): RequestPromise<IQuotedPriceStatisticsRecord[]> => {
  return request(`/api/quotedPrice/waybill/statistics`, {
    method: 'post',
    data: params,
  });
};
export const quotedPriceWaybillList = (
  params: IQuotedPriceWaybillListParams,
): RequestPromise<PaginationResponse<IQuotedPriceWaybillListRecord[]>> => {
  return request(`/api/quotedPrice/waybill/list`, {
    method: 'post',
    data: params,
  });
};
// price inquiry v2
export const quotedPriceWaybillListV2 = (
  params: IQuotedPriceWaybillListParamsV2,
): RequestPromise<PaginationResponse<IQuotedPriceWaybillListRecord[]>> => {
  return request(`/api/quotedPrice/routeLibrary/list`, {
    method: 'post',
    data: params,
  });
};

export const quotedPriceWaybillExport = (
  params: IQuotedPriceStatisticsParams,
): RequestPromise<any> => {
  return request(`/api/quotedPrice/waybill/export`, {
    method: 'post',
    data: params,
  });
};

export const priceWaybillExportV2 = (
  params: IQuotedPriceWaybillListParamsV2,
): RequestPromise<any> => {
  return request(`/api/quotedPrice/routeLibrary/export`, {
    method: 'post',
    data: params,
  });
};

export const pricingCheckWaybillList = (
  params: IPricingCheckWaybillListPayload,
): RequestPromise<PaginationResponse<IPricingCheckWaybillItem[]>> => {
  return request(`/api/pricing-check/waybill-list`, {
    method: 'post',
    data: params,
  });
};

export const pricingCheckWaybillExport = (
  params: IPricingCheckWaybillListPayload,
): RequestPromise<string> => {
  return request(`/api/pricing-check/waybill-export`, {
    method: 'post',
    data: params,
  });
};
export const pricingCheckWaybillConfirmPrice = (params: {
  ids: number[];
}): RequestPromise<any> => {
  return request(`/api/waybill/batch/confirm-price`, {
    method: 'post',
    data: params,
  });
};
export const waybillConfirmPriceResult =
  (): RequestPromise<IWaybillBatchSubmitOrStartResult> => {
    return request(`/api/waybill/batch/confirm-price-result`, {
      method: 'get',
    });
  };

export const quotedPriceV2List = (
  params: IQuotedPriceListParamsV2,
): RequestPromise<PaginationResponse<IQuotedPriceListRecord[]>> => {
  return request(`/api/quotedPrice/v2/list`, {
    method: 'post',
    data: params,
  });
};
