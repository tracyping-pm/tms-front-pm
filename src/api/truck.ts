import { RequestPromise } from '@/api/types/common';
import {
  IAccreditationData,
  IAddDriverCategory,
  IAddDriverParams,
  IAddTruckParams,
  ICreateAccreditationVersionParams,
  IDriverAccreditationData,
  IDriverDetailParams,
  IDriverListItem,
  IDriverListParams,
  IDriverRoleListItem,
  IDriverRoleListParams,
  ISelectAttributeVendor,
  ITransferDriverParams,
  ITruckDefaultCategoryRecord,
  ITruckDetailData,
  ITruckListItem,
  ITruckParams,
  ITruckTypeListItem,
  ITruckVendorListItem,
  IUpdateAccreditation,
} from '@/api/types/truck';
import { EnumAccreditationSortTypeStatus } from '@/enums';
import { request } from '@umijs/max';
import { IContractTrackingExpireCountData } from './types/contract';
import {
  IAccreditationHistoryRecord,
  IAccreditationVersionHistoryRecord,
} from './types/vendor';

export const truckList = (
  params: ITruckParams,
): RequestPromise<PaginationResponse<ITruckListItem>> => {
  return request(`/api/truck/list`, {
    method: 'post',
    data: params,
  });
};

export const truckFileExpireCount =
  (): RequestPromise<IContractTrackingExpireCountData> => {
    return request(`/api/truck/file-expire-count`, {
      method: 'post',
    });
  };

export const addTruck = (params: IAddTruckParams): RequestPromise<null> => {
  return request(`/api/truck/add`, {
    method: 'post',
    data: params,
  });
};

export const editTruck = (params: IAddTruckParams): RequestPromise<null> => {
  return request(`/api/truck/change`, {
    method: 'post',
    data: params,
  });
};

export const getTruckTypeList = (): RequestPromise<ITruckTypeListItem[]> => {
  return request(`/api/truck/truckType`, {
    method: 'get',
  });
};

export const getTruckDetail = (params: {
  id: number;
}): RequestPromise<ITruckDetailData> => {
  return request(`/api/truck/detail`, {
    method: 'post',
    data: params,
  });
};

export const truckApproval = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/truck/approval`, {
    method: 'post',
    data: params,
  });
};

export const truckDeactivate = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/truck/deactivate`, {
    method: 'post',
    data: params,
  });
};
export const truckActivate = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/truck/activate`, {
    method: 'post',
    data: params,
  });
};

export const truckAttribute = (params: {
  id: number;
  bindIds: ISelectAttributeVendor[];
}) => {
  return request(`/api/truck/attribution`, {
    method: 'post',
    data: params,
  });
};

export const driverList = (
  params: IDriverListParams,
): RequestPromise<PaginationResponse<IDriverListItem>> => {
  return request(`/api/driver/list`, {
    method: 'post',
    data: params,
  });
};

export const addDriver = (params: IAddDriverParams): RequestPromise<null> => {
  return request(`/api/driver/add`, {
    method: 'post',
    data: params,
  });
};

export const editDriver = (params: IAddDriverParams): RequestPromise<null> => {
  return request(`/api/driver/change`, {
    method: 'post',
    data: params,
  });
};

export const getDriverRoleList = (
  params: IDriverRoleListParams,
): RequestPromise<PaginationResponse<IDriverRoleListItem>> => {
  return request(`/api/driver/transfer/list`, {
    method: 'post',
    data: params,
  });
};

export const transferDriverList = (
  params: ITransferDriverParams,
): RequestPromise<null> => {
  return request(`/api/driver/batch/transfer`, {
    method: 'post',
    data: params,
  });
};

export const getDriverDetail = (
  params: IDriverDetailParams,
): RequestPromise<IDriverListItem> => {
  return request(`/api/driver/detail`, {
    method: 'post',
    data: params,
  });
};

export const approvalDriver = (params: {
  id: number;
  enable: boolean;
  reason: string;
}): RequestPromise<null> => {
  return request(`/api/driver/approval`, {
    method: 'post',
    data: params,
  });
};

export const blockUnblockDriver = (params: {
  id: number;
  enable: boolean;
  reason: string;
}): RequestPromise<null> => {
  return request(`/api/driver/enable`, {
    method: 'post',
    data: params,
  });
};

export const driverAccreditationList = (params: {
  id: number;
}): RequestPromise<IDriverAccreditationData> => {
  return request(`/api/driver/accreditation/list`, {
    method: 'post',
    data: params,
  });
};

export const truckAccreditationList = (params: {
  id: number;
  sortType?: EnumAccreditationSortTypeStatus;
}): RequestPromise<IAccreditationData> => {
  return request(`/api/truck/accreditation/list`, {
    method: 'post',
    data: params,
  });
};

export const addDriverCategory = (
  params: IAddDriverCategory,
): RequestPromise<null> => {
  return request(`/api/driver/accreditation/category/add`, {
    method: 'post',
    data: params,
  });
};

export const addTruckCategory = (
  params: IAddDriverCategory,
): RequestPromise<null> => {
  return request(`/api/truck/accreditation/category/add`, {
    method: 'post',
    data: params,
  });
};

export const deleteDriverCategory = (params: {
  id: number;
  categoryAccreditationId: number;
  fileCategory: string;
  defaultCategory: number;
  deletedFileIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/driver/accreditation/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteTruckCategory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<null> => {
  return request(`/api/truck/accreditation/category/delete`, {
    method: 'post',
    data: params,
  });
};

export const deleteDriverMaterial = (params: {
  id: number;
  fileAccreditationId: number;
  fileMaterialId: number;
  defaultCategory: number;
  required: number;
}): RequestPromise<null> => {
  return request(`/api/driver/accreditation/material/delete`, {
    method: 'post',
    data: params,
  });
};

// export const deleteTruckMaterial = (params: {
//   id: number;
//   fileAccreditationId: number;
//   fileMaterialId: number;
//   defaultCategory: boolean;
//   required: boolean;
// }): RequestPromise<null> => {
//   return request(`/api/truck/accreditation/material/delete`, {
//     method: 'post',
//     data: params,
//   });
// };

export const getTruckVendors = (params: {
  id: number;
}): RequestPromise<ITruckVendorListItem[]> => {
  return request(`/api/truck/vendors`, {
    method: 'post',
    data: params,
  });
};

export const checkTruckAttribute = (params: {
  id: number;
  bindIds: ISelectAttributeVendor[];
}): RequestPromise<boolean> => {
  return request(`/api/truck/checkAttribution`, {
    method: 'post',
    data: params,
  });
};

export const checkTruckDeactivate = (params: {
  id: number;
}): RequestPromise<boolean> => {
  return request(`/api/truck/checkUnable`, {
    method: 'post',
    data: params,
  });
};
export const truckCheckDuplicate = (params: {
  id?: number;
  plateNumber: string;
}): RequestPromise<boolean> => {
  return request(`/api/truck/checkDuplicate `, {
    method: 'post',
    data: params,
  });
};

export const getTruckDefaultCategory = (
  id: number,
): RequestPromise<ITruckDefaultCategoryRecord[]> => {
  return request(
    `/api/truck/accreditation/default-category?truckTypeId=${id}`,
    {
      method: 'get',
    },
  );
};

export const updateTruckAccreditation = (
  params: IUpdateAccreditation,
): RequestPromise<null> => {
  return request(`/api/truck/accreditation/update`, {
    method: 'post',
    data: params,
  });
};
export const createTruckAccreditationVersion = (
  params: ICreateAccreditationVersionParams,
): RequestPromise<null> => {
  return request(`/api/truck/accreditation/create-version`, {
    method: 'post',
    data: params,
  });
};

export const truckAccreditationHistory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<IAccreditationHistoryRecord[]> => {
  return request(`/api/truck/accreditation/history`, {
    method: 'post',
    data: params,
  });
};
export const truckAccreditationVersionHistory = (params: {
  id: number;
  fileCategory: string;
}): RequestPromise<IAccreditationVersionHistoryRecord[]> => {
  return request(`/api/truck/accreditation/version-history`, {
    method: 'post',
    data: params,
  });
};
