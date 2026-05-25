import { RequestPromise } from '@/api/types/common';
import {
  ICustomerContactsListData,
  ICustomerContractsListPayload,
  ICustomerContractTrackingItem,
  ICustomerContractTrackingListParams,
  ICustomerList,
  ICustomerPerceptionListData,
  ICustomerRecord,
  ICustomerRecordsListData,
  ICustomerTransferHistoryItem,
  ICustomerTransferList,
  ICustomerUserRoleRecord,
  IIndustryRecord,
  IPhoneSelectOptionsItem,
} from '@/api/types/customer';
import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { TaxTypeEnum } from '@/enums';
import { request } from '@umijs/max';
import {
  IContractRecord,
  IContractTrackingExpireCountData,
} from './types/contract';

export const customerTransfer = (params: {
  id: number;
  bdUserId: number;
}): RequestPromise<any> => {
  return request(`/api/customer/transfer`, {
    method: 'post',
    data: params,
  });
};

export const customerTransferList = (
  params: ICustomerTransferList,
): RequestPromise<any> => {
  return request(`/api/customer/transfer/list`, {
    method: 'post',
    data: params,
  });
};

export const customerList = (
  params: ICustomerList,
): RequestPromise<PaginationResponse<ICustomerRecord>> => {
  return request(`/api/customer/list`, {
    method: 'post',
    data: params,
  });
};

export const customerDetail = (params: {
  id: number;
}): RequestPromise<ICustomerRecord> => {
  return request(`/api/customer/detail`, {
    method: 'post',
    data: params,
  });
};

export const customerDelete = (params: { id: number }): RequestPromise<any> => {
  return request(`/api/customer/delete`, {
    method: 'post',
    data: params,
  });
};

export const customerChange = (
  params: Partial<ICustomerRecord>,
): RequestPromise<any> => {
  return request(`/api/customer/change`, {
    method: 'post',
    data: params,
  });
};

export const customerAdd = (params: FormData): RequestPromise<any> => {
  return request(`/api/customer/add`, {
    method: 'post',
    data: params,
  });
};

export const customerIndustryList = (): RequestPromise<IIndustryRecord[]> => {
  return request(`/api/customer/industry/list`, {
    method: 'get',
  });
};

export const customerUserRoleList = (params: {
  pageNum?: number;
  pageSize?: number;
  userAliasName?: string;
}): RequestPromise<PaginationResponse<ICustomerUserRoleRecord>> => {
  return request(`/api/customer/userRole/list`, {
    method: 'post',
    data: params,
  });
};

export const transferCAMUser = (params: {
  bdUserId?: number;
  customerIds?: number[];
}): RequestPromise<null> => {
  return request(`/api/customer/transfer/cam/list`, {
    method: 'post',
    data: params,
  });
};

/**
 * contacts列表
 */
export const customerContacts = (
  customerId: string,
): RequestPromise<ICustomerContactsListData> => {
  return request(`/api/customers/${customerId}/contacts`, {
    method: 'get',
  });
};

/**
 * 添加contact
 */
export const customerAddContact = (params: {
  customerId: number;
  contactName: string;
  title?: string;
  phoneNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  email?: string;
  notes?: string;
}): RequestPromise<ICustomerContactsListData> => {
  return request(
    `/api/customers/${
      params.customerId
    }/contacts?contactName=${encodeURIComponent(
      params.contactName,
    )}&phoneNumber=${params.phoneNumber}&phoneCode=${
      params.phoneCode
    }&phoneCodeId=${params.phoneCodeId}&title=${encodeURIComponent(
      params.title || '',
    )}&email=${params.email}&notes=${encodeURIComponent(params.notes || '')}`,
    {
      method: 'post',
    },
  );
};

/**
 * 删除contact
 */
export const deleteContact = (params: {
  customerId: number;
  contactId: number;
}): RequestPromise<null> => {
  return request(
    `/api/customers/${params.customerId}/contacts/${params.contactId}`,
    {
      method: 'delete',
    },
  );
};

/**
 * 编辑contact
 */
export const editContact = (params: {
  customerId: number;
  contactId: number;
  contactName: string;
  phoneNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  title?: string;
  email?: string;
  notes?: string;
}): RequestPromise<null> => {
  return request(
    `/api/customers/${params.customerId}/contacts/${
      params.contactId
    }?contactName=${encodeURIComponent(params.contactName)}&phoneNumber=${
      params.phoneNumber
    }&phoneCode=${params.phoneCode}&phoneCodeId=${
      params.phoneCodeId
    }&title=${encodeURIComponent(params.title || '')}&email=${
      params.email
    }&notes=${encodeURIComponent(params.notes || '')}`,
    {
      method: 'patch',
    },
  );
};

export const getRecordsList = (
  customerId: number,
): RequestPromise<ICustomerRecordsListData> => {
  return request(`/api/customer/followRecord/list`, {
    method: 'post',
    data: { id: customerId },
  });
};

export const addRecord = (params: FormData): RequestPromise<null> => {
  return request(`/api/customer/followRecord/add`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const deleteRecord = (params: {
  customerId: number;
  followRecordId: number;
  generateType: string;
}): RequestPromise<ICustomerRecordsListData> => {
  return request(`/api/customer/followRecord/delete`, {
    method: 'post',
    data: params,
  });
};

export const editRecord = (params: FormData): RequestPromise<null> => {
  return request(`/api/customer/followRecord/change`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const getPerceptionsList = (
  customerId: number,
): RequestPromise<ICustomerPerceptionListData> => {
  return request(`/api/customers/${customerId}/perceptions`, {
    method: 'get',
  });
};

export const addPerception = (params: {
  customerId: number;
  addTime: string;
  description: string;
  data: FormData;
}): RequestPromise<null> => {
  return request(
    `/api/customers/${params.customerId}/perceptions?addTime=${
      params.addTime
    }&description=${encodeURIComponent(params.description)}`,
    {
      method: 'post',
      data: params.data,
      timeout: FILE_UPLOAD_TIMEOUT,
    },
  );
};

export const deletePerception = (params: {
  customerId: number;
  perceptionId: number;
}): RequestPromise<ICustomerPerceptionListData> => {
  return request(
    `/api/customers/${params.customerId}/perceptions/${params.perceptionId}`,
    {
      method: 'delete',
    },
  );
};

export const editPerception = (params: {
  customerId: number;
  perceptionId: number;
  addTime: string;
  description: string;
  deletedFileIdList?: string[];
  data: FormData;
}): RequestPromise<null> => {
  return request(
    `/api/customers/${params.customerId}/perceptions/${
      params.perceptionId
    }?addTime=${params.addTime}&description=${encodeURIComponent(
      params.description,
    )}&deletedFileIdList=${params.deletedFileIdList}`,
    {
      method: 'patch',
      data: params.data,
      timeout: FILE_UPLOAD_TIMEOUT,
    },
  );
};

export const getCountryPhone = (): RequestPromise<
  IPhoneSelectOptionsItem[]
> => {
  return request('/api/phone/list', {
    method: 'get',
  });
};

export const customerContractEdit = (params: {
  customerId: number;
  contractId: number;
  contractName: string;
}): RequestPromise<null> => {
  return request(`/api/customer/contract/edit`, {
    method: 'post',
    data: params,
  });
};

export const customerContractList = (
  params: ICustomerContractsListPayload,
): RequestPromise<PaginationResponse<IContractRecord>> => {
  return request(`/api/customer/contract/list`, {
    method: 'post',
    data: params,
  });
};

export const customerTaxMark = (params: {
  id: number;
}): RequestPromise<TaxTypeEnum> => {
  return request(`/api/customer/customerTaxMark`, {
    method: 'post',
    data: params,
  });
};

export const customerNameAndTagCheck = (params: {
  customerName?: string;
  customerTag?: string;
  customerId?: number;
  leadId?: number;
}): RequestPromise<{
  customerOrLead: boolean;
  id: number;
  duplicate: boolean;
}> => {
  return request(`/api/customer/customerNameAndTag/duplicate/check`, {
    method: 'post',
    data: params,
  });
};

export const customerTransferHistoryList = (params: {
  buId: number;
  fieldName: string;
}): RequestPromise<ICustomerTransferHistoryItem[]> => {
  return request(`/api/customer/transfer/history/list`, {
    method: 'post',
    data: params,
  });
};

export const customerContractTrackingList = (
  params: ICustomerContractTrackingListParams,
): RequestPromise<PaginationResponse<ICustomerContractTrackingItem>> => {
  return request(`/api/customer/contract/tracking/list`, {
    method: 'post',
    data: params,
  });
};

export const customerContractTrackingExpireCount =
  (): RequestPromise<IContractTrackingExpireCountData> => {
    return request(`/api/customer/contract/expire/count`, {
      method: 'post',
    });
  };

export const customerContractAdd = (
  params: FormData,
): RequestPromise<boolean> => {
  return request(`/api/customer/contract/add`, {
    method: 'post',
    data: params,
  });
};
