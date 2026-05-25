import { RequestPromise } from '@/api/types/common';
import {
  IAccreditationHistoryRecord,
  IAccreditationVersionHistoryRecord,
  IAddVendorParams,
  IAddVendorRecord,
  IEditVendorParams,
  IProcurementAccreditationData,
  IProcurementLogRecord,
  ITransferRoleListItem,
  IVendorBizStatusRecordItem,
  IVendorContactListItem,
  IVendorContactParams,
  IVendorContractTrackingItem,
  IVendorContractTrackingListParams,
  IVendorDetail,
  IVendorDetailContractListPayload,
  IVendorDetailDriverListItem,
  IVendorDetailHelperListItem,
  IVendorDetailTruckListItem,
  IVendorListItem,
  IVendorParams,
  IVendorRecordData,
  IVendorSummaryDeletePayload,
  IVendorSummaryListResp,
  IVendorTransferList,
  VendorAccreditationValidDateParams,
} from '@/api/types/vendor';
import {
  ApplicationTypeEnum,
  EnumAccreditationSortTypeStatus,
  TaxTypeEnum,
} from '@/enums';
import { request } from '@umijs/max';
import {
  IContractRecord,
  IContractTrackingExpireCountData,
} from './types/contract';
import { IProjectRecord } from './types/project';
import {
  ICreateAccreditationVersionParams,
  IUpdateAccreditation,
} from './types/truck';

export const vendorList = (
  params: IVendorParams,
): RequestPromise<PaginationResponse<IVendorListItem>> => {
  return request(`/api/vendor/list`, {
    method: 'post',
    data: params,
  });
};

export const vendorFileExpireCount =
  (): RequestPromise<IContractTrackingExpireCountData> => {
    return request(`/api/vendor/file-expire-count`, {
      method: 'post',
    });
  };

export const addVendor = (
  params: IAddVendorParams,
): RequestPromise<IAddVendorRecord> => {
  return request(`/api/vendor/add`, {
    method: 'post',
    data: params,
  });
};

export const editVendor = (params: IEditVendorParams): RequestPromise<null> => {
  return request(`/api/vendor/change`, {
    method: 'post',
    data: params,
  });
};

export const getVendorRoleList = (params: {
  pageNum: number;
  pageSize: number;
  userAliasName?: string;
}): RequestPromise<PaginationResponse<ITransferRoleListItem>> => {
  return request(`/api/vendor/userRole/list`, {
    method: 'post',
    data: params,
  });
};

export const transferVendorList = (params: IVendorTransferList) => {
  return request(`/api/vendor/transfer/list`, {
    method: 'post',
    data: params,
  });
};

export const getVendorDetail = (id: number): RequestPromise<IVendorDetail> => {
  return request(`/api/vendor/detail`, {
    method: 'post',
    data: { id },
  });
};

export const vendorDetailApproval = (params: {
  id: number;
  enable: boolean;
}): RequestPromise<null> => {
  return request(`/api/vendor/approval`, {
    method: 'post',
    data: params,
  });
};

// export const vendorDetailBlockUnblock = (params: {
//   id: number;
//   enable: boolean;
//   reason?: string;
// }): RequestPromise<null> => {
//   return request(`/api/vendor/blockUnblock`, {
//     method: 'post',
//     data: params,
//   });
// };

// export const checkVendorBlock = (params: {
//   id: number;
// }): RequestPromise<boolean> => {
//   return request(`/api/vendor/checkBlock`, {
//     method: 'post',
//     data: params,
//   });
// };

export const vendorDetailTerminate = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/terminate`, {
    method: 'post',
    data: params,
  });
};

export const vendorDetailReaccredit = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/re-accredit`, {
    method: 'post',
    data: params,
  });
};

export const getVendorContactList = (params: {
  id: number;
}): RequestPromise<IVendorContactListItem[]> => {
  return request(`/api/vendor/contact/list`, {
    method: 'post',
    data: params,
  });
};

export const getVendorRecordList = (params: {
  id: number;
}): RequestPromise<IVendorRecordData> => {
  return request(`/api/vendor/followRecord/list`, {
    method: 'post',
    data: params,
  });
};

export const addVendorRecord = (params: {
  data: FormData;
  signal: AbortSignal;
}): RequestPromise<null> => {
  return request(`/api/vendor/followRecord/add`, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params.data,
    signal: params.signal,
  });
};

export const changeVendorRecord = (params: {
  data: FormData;
  signal: AbortSignal;
}): RequestPromise<null> => {
  return request(`/api/vendor/followRecord/change`, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params.data,
    signal: params.signal,
  });
};

export const deleteVendorRecord = (params: {
  vendorId: number;
  followRecordId: number;
  generateType: string;
  deletedFileIdList: number[];
}) => {
  return request(`/api/vendor/followRecord/delete`, {
    method: 'post',
    data: params,
  });
};

export const addVendorContact = (
  params: IVendorContactParams,
): RequestPromise<null> => {
  return request(`/api/vendor/contact/add`, {
    method: 'post',
    data: params,
  });
};

export const deleteVendorContact = (params: {
  contactId: number;
  vendorId: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/contact/delete`, {
    method: 'post',
    data: params,
  });
};

export const editVendorContact = (
  params: IVendorContactParams,
): RequestPromise<null> => {
  return request(`/api/vendor/contact/change`, {
    method: 'post',
    data: params,
  });
};

export const getVendorDetailTruckList = (params: {
  pageNum: number;
  pageSize: number;
  vendorId: number;
}): RequestPromise<PaginationResponse<IVendorDetailTruckListItem>> => {
  return request(`/api/truck/vendor/list`, {
    method: 'post',
    data: params,
  });
};

export const unbindVendorTruck = (params: {
  truckId: number;
  vendorId: number;
}): RequestPromise<null> => {
  return request(`/api/truck/unbind`, {
    method: 'post',
    data: params,
  });
};

export const checkTruckUnbind = (params: {
  truckId: number;
  vendorId: number;
}): RequestPromise<boolean> => {
  return request(`/api/truck/checkUnbind`, {
    method: 'post',
    data: params,
  });
};

export const vendorAccreditationList = (params: {
  id: number;
  sortType?: EnumAccreditationSortTypeStatus;
}): RequestPromise<IProcurementAccreditationData> => {
  return request(`/api/vendor/accreditation/list`, {
    method: 'post',
    data: params,
  });
};

export const getVendorFinancialList = (params: {
  id: number;
}): RequestPromise<IProcurementAccreditationData> => {
  return request(`/api/vendor/financial-document/list`, {
    method: 'post',
    data: params,
  });
};

export const addVendorCategory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/accreditation/category/add`, {
    method: 'post',
    data: params,
  });
};

export const addVendorFinancial = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/financial-document/category/add`, {
    method: 'post',
    data: params,
  });
};

export const deleteVendorCategory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/accreditation/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteVendorFinancialCategory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/financial-document/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteVendorFinancialMaterial = (params: {
  id: number;
  fileAccreditationId: number;
  fileMaterialId: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/financial-document/material/delete`, {
    method: 'post',
    data: params,
  });
};

// export const deleteVendorMaterial = (params: {
//   id: number;
//   fileAccreditationId: number;
//   fileMaterialId: number;
//   fileCategory: string;
// }): RequestPromise<null> => {
//   return request(`/api/vendor/accreditation/material/delete`, {
//     method: 'post',
//     data: params,
//   });
// };

export const getVendorDetailHelperList = (params: {
  pageNum: number;
  pageSize: number;
  vendorId: number;
}): RequestPromise<PaginationResponse<IVendorDetailHelperListItem>> => {
  return request(`/api/vendor/helper/list`, {
    method: 'post',
    data: params,
  });
};

export const addVendorHelper = (params: {
  helperName: string;
  contactPhoneNum: string;
  phoneCode: string;
  phoneCodeId: number;
  vendorId: number;
  countryId: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/helper/add`, {
    method: 'post',
    data: params,
  });
};

export const changeVendorHelper = (params: {
  id: number;
  helperName: string;
  contactPhoneNum: string;
  phoneCode: string;
  phoneCodeId: number;
  vendorId: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/helper/change`, {
    method: 'post',
    data: params,
  });
};

export const deleteVendorHelper = (params: {
  helperId: number;
  vendorId: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/helper/delete`, {
    method: 'post',
    data: params,
  });
};

export const blockVendorHelper = (params: {
  id: number;
  extraId: number;
  status: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/helper/block`, {
    method: 'post',
    data: params,
  });
};

export const unblockVendorHelper = (params: {
  id: number;
  extraId: number;
  status: string;
}): RequestPromise<null> => {
  return request(`/api/vendor/helper/unblock`, {
    method: 'post',
    data: params,
  });
};

export const getVendorDetailDriverList = (params: {
  pageNum: number;
  pageSize: number;
  vendorId: number;
}): RequestPromise<PaginationResponse<IVendorDetailDriverListItem>> => {
  return request(`/api/vendor/driver/list`, {
    method: 'post',
    data: params,
  });
};

export const unblockVendorDriver = (params: {
  vendorId: number;
  driverId: number;
}): RequestPromise<null> => {
  return request(`/api/vendor/driver/unbind`, {
    method: 'post',
    data: params,
  });
};

export const getVendorDetailProjectList = (params: {
  pageNum: number;
  pageSize: number;
  vendorId: number;
}): RequestPromise<PaginationResponse<IVendorDetailTruckListItem>> => {
  return request(`/api/truck/vendor/list`, {
    method: 'post',
    data: params,
  });
};

export const vendorProject = (params: {
  pageNum: number;
  pageSize: number;
  vendorId: number;
  projectId?: number;
  projectStatus?: string;
  logisticsCategory?: string;
  serviceCategory?: string;
  logisticsFlow?: string;
  distance?: string;
}): RequestPromise<PaginationResponse<IProjectRecord>> => {
  return request(`/api/vendor/project`, {
    method: 'post',
    data: params,
  });
};

export const vendorContractList = (
  params: IVendorDetailContractListPayload,
): RequestPromise<PaginationResponse<IContractRecord>> => {
  return request(`/api/vendor/contract/list`, {
    method: 'post',
    data: params,
  });
};

export const vendorSummaryList = (params: {
  id: number;
}): RequestPromise<IVendorSummaryListResp> => {
  return request(`/api/vendor/summary/list`, {
    method: 'post',
    data: params,
  });
};

export const vendorSummaryEdit = (params: {
  data: FormData;
}): RequestPromise<null> => {
  return request(`/api/vendor/summary/edit`, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params.data,
  });
};

export const vendorSummaryDelete = (
  params: IVendorSummaryDeletePayload,
): RequestPromise<string> => {
  return request(`/api/vendor/summary/delete`, {
    method: 'post',
    data: params,
  });
};

export const vendorSummaryAdd = (params: {
  data: FormData;
}): RequestPromise<null> => {
  return request(`/api/vendor/summary/add`, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params.data,
  });
};

export const vendorTaxMark = (params: {
  id: number;
}): RequestPromise<TaxTypeEnum> => {
  return request(`/api/vendor/taxMark`, {
    method: 'post',
    data: params,
  });
};

export const vendorCheckDuplicate = (params: {
  id?: number;
  type: string;
  value: string;
}): RequestPromise<boolean> => {
  return request(`/api/vendor/checkDuplicate`, {
    method: 'post',
    data: params,
  });
};
export const vendorAccreditationValidDate = (
  params: VendorAccreditationValidDateParams,
): RequestPromise<boolean> => {
  return request(`/api/vendor/accreditation/valid-date/update`, {
    method: 'post',
    data: params,
  });
};

export const procurementLog = (params: {
  entityType: ApplicationTypeEnum;
  entityId: number;
}): RequestPromise<IProcurementLogRecord[]> => {
  return request(`/api/vendor-biz/log/list`, {
    method: 'post',
    data: params,
  });
};

export const updateVendorAccreditation = (
  params: IUpdateAccreditation,
): RequestPromise<null> => {
  return request(`/api/vendor/accreditation/update`, {
    method: 'post',
    data: params,
  });
};
export const createVendorAccreditationVersion = (
  params: ICreateAccreditationVersionParams,
): RequestPromise<null> => {
  return request(`/api/vendor/accreditation/create-version`, {
    method: 'post',
    data: params,
  });
};

export const getVendorDefaultSubCategory = (): RequestPromise<string[]> => {
  return request(`/api/vendor/accreditation/default-sub-category`, {
    method: 'get',
  });
};

export const getVendorBizStatusRecordList = (params: {
  entityType: ApplicationTypeEnum;
  entityId: number;
}): RequestPromise<IVendorBizStatusRecordItem[]> => {
  return request(`/api/vendor-biz/status-record/list`, {
    method: 'post',
    data: params,
  });
};

export const vendorAccreditationHistory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<IAccreditationHistoryRecord[]> => {
  return request(`/api/vendor/accreditation/history`, {
    method: 'post',
    data: params,
  });
};
export const vendorAccreditationVersionHistory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<IAccreditationVersionHistoryRecord[]> => {
  return request(`/api/vendor/accreditation/version-history`, {
    method: 'post',
    data: params,
  });
};

export const vendorContractTrackingList = (
  params: IVendorContractTrackingListParams,
): RequestPromise<PaginationResponse<IVendorContractTrackingItem>> => {
  return request(`/api/vendor/contract/tracking/list`, {
    method: 'post',
    data: params,
  });
};

export const vendorContractTrackingExpireCount =
  (): RequestPromise<IContractTrackingExpireCountData> => {
    return request(`/api/vendor/contract/expire/count`, {
      method: 'post',
    });
  };

export const vendorContractAdd = (
  params: FormData,
): RequestPromise<boolean> => {
  return request(`/api/vendor/contract/add`, {
    method: 'post',
    data: params,
  });
};
