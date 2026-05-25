import { EnumAccreditationSortTypeStatus } from '@/enums';
import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { IContractTrackingExpireCountData } from './types/contract';
import {
  ICrewAddParams,
  ICrewDefaultCategory,
  ICrewDetail,
  ICrewListItem,
  ICrewListParams,
  ICrewUpdateParams,
  IVendorDetailCrewListItem,
} from './types/crew';
import {
  ICreateAccreditationVersionParams,
  IUpdateAccreditation,
} from './types/truck';
import {
  IAccreditationHistoryRecord,
  IAccreditationVersionHistoryRecord,
  IProcurementAccreditationData,
} from './types/vendor';

export const crewDefaultCategory = (
  driverFlag: boolean,
): RequestPromise<ICrewDefaultCategory[]> => {
  return request(
    `/api/crew/accreditation/default-category?driverFlag=${driverFlag}`,
    {
      method: 'get',
    },
  );
};

export const crewAdd = (params: ICrewAddParams): RequestPromise<null> => {
  return request(`/api/crew/add`, {
    method: 'post',
    data: params,
  });
};
export const crewUpdate = (params: ICrewUpdateParams): RequestPromise<null> => {
  return request(`/api/crew/update`, {
    method: 'post',
    data: params,
  });
};
export const crewList = (
  params: ICrewListParams,
): RequestPromise<PaginationResponse<ICrewListItem[]>> => {
  return request(`/api/crew/list`, {
    method: 'post',
    data: params,
  });
};
export const crewFileExpireCount =
  (): RequestPromise<IContractTrackingExpireCountData> => {
    return request(`/api/crew/file-expire-count`, {
      method: 'post',
    });
  };
export const vendorDetailCrewList = (params: {
  pageNum: number;
  pageSize: number;
  id: number;
}): RequestPromise<PaginationResponse<IVendorDetailCrewListItem[]>> => {
  return request(`/api/crew/vendor-crew-list`, {
    method: 'post',
    data: params,
  });
};
export const crewCheckDuplicate = (params: {
  id?: number;
  idNumber: string;
}): RequestPromise<boolean> => {
  return request(`/api/crew/checkDuplicate`, {
    method: 'post',
    data: params,
  });
};
export const vendorCrewUnbind = (params: {
  crewId?: number;
  vendorId: number;
}): RequestPromise<null> => {
  return request(`/api/crew/unbind`, {
    method: 'post',
    data: params,
  });
};
export const crewDetail = (params: {
  id: number;
}): RequestPromise<ICrewDetail> => {
  return request(`/api/crew/detail`, {
    method: 'post',
    data: params,
  });
};
export const crewDeactivate = (params: {
  id: number;
  reason: string;
  documentIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/crew/deactivate`, {
    method: 'post',
    data: params,
  });
};
export const crewActivate = (params: {
  id: number;
  reason: string;
  documentIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/crew/activate`, {
    method: 'post',
    data: params,
  });
};

export const crewBlock = (params: {
  id: number;
  reason: string;
  remark: string;
  documentIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/crew/block`, {
    method: 'post',
    data: params,
  });
};
export const crewApproval = (id: number): RequestPromise<null> => {
  return request(`/api/crew/approval`, {
    method: 'post',
    data: { id },
  });
};
export const crewActivateCheck = (id: number): RequestPromise<null> => {
  return request(`/api/crew/activate-check`, {
    method: 'post',
    data: { id },
  });
};
export const crewAttribute = (params: {
  crewId?: number;
  vendorIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/crew/attribute`, {
    method: 'post',
    data: params,
  });
};

export const crewAccreditationList = (params: {
  id: number;
  sortType?: EnumAccreditationSortTypeStatus;
}): RequestPromise<IProcurementAccreditationData> => {
  return request(`/api/crew/accreditation/list`, {
    method: 'post',
    data: params,
  });
};

export const addCrewCategory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/crew/accreditation/category/add`, {
    method: 'post',
    data: params,
  });
};
export const deleteCrewCategory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/crew/accreditation/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const updateCrewCategory = (
  params: IUpdateAccreditation,
): RequestPromise<null> => {
  return request(`/api/crew/accreditation/update`, {
    method: 'post',
    data: params,
  });
};
export const createCrewAccreditationVersion = (
  params: ICreateAccreditationVersionParams,
): RequestPromise<null> => {
  return request(`/api/crew/accreditation/create-version`, {
    method: 'post',
    data: params,
  });
};

export const crewAccreditationHistory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<IAccreditationHistoryRecord[]> => {
  return request(`/api/crew/accreditation/history`, {
    method: 'post',
    data: params,
  });
};
export const crewAccreditationVersionHistory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<IAccreditationVersionHistoryRecord[]> => {
  return request(`/api/crew/accreditation/version-history`, {
    method: 'post',
    data: params,
  });
};
