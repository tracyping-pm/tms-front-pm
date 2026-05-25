import {
  ContractStatusEnum,
  CustomerPriorityEnum,
  CustomerSizeEnum,
  CustomerStatusEnum,
  EnumCompareOperatorType,
  EnumContractExpireStatus,
  GenerateTypeEnum,
  ProjectStatusEnum,
} from '@/enums';
import { ICommonMaterial } from './common';

export interface ICustomerTransferList {
  bdUserId: number;
  customerIds: number[];
}

export interface ICustomerList {
  pageNum?: number;
  pageSize?: number;
  customerName?: string;
  customerTag?: string;
  industry?: string;
  status?: CustomerStatusEnum;
  priority?: CustomerPriorityEnum;
  size?: CustomerSizeEnum;
  bdUserId?: number;
  userId?: number;
  camUserId?: number;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  inLeadsPool?: boolean;
}

export interface ICustomerRecord {
  id: number;
  customerName: string;
  customerTag: string;
  industry: number;
  industryName: string;
  camUserAliasName: string;
  camUserRoleId: number;
  country: number;
  countryName: string;
  pad: number;
  padName: string;
  sad?: number;
  sadName: string;
  tad?: number;
  tadName: string;
  region: string;
  status: CustomerStatusEnum;
  priority: CustomerPriorityEnum;
  size: CustomerSizeEnum;
  bdUserRoleId: number;
  bdUserAliasName: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  material: ICommonMaterial;
  contactType: string;
  currentMarketShareMin: number;
  currentMarketShareMax: number;
  serviceDuration: string;
  customerTaxMark: string;
  website: string;
  bu: string;
  reachOutChannel: string;
  address: string;
  lat: number;
  lng: number;
  officeAddressAddress: string;
  firstDeliveryDate: string;
  latestDeliveryDate: string;
  ongoingWaybillCount: number;
  waybillCount: number;
}

export interface IIndustryRecord {
  value: number;
  label: string;
  children: IIndustryRecord[];
}

export interface ICustomerUserRoleRecord {
  id: number;
  userId: number;
  userAliasName: string;
  roleId: number | string;
  roleName: string;
  departmentId: number;
  departmentName: string;
}

export interface ICustomerContactsListItem {
  contactId: number | null;
  contactName: string;
  title: string;
  phoneNumber: string;
  email: string;
  notes: string;
  phoneCode: string;
  phoneCodeId: number | null;
}

export interface ICustomerContactsForm {
  name: string;
  title: string;
  number: string;
  email: string;
  notes: string;
}

export interface ICustomerContactsListData {
  contactList: ICustomerContactsListItem[];
}

// records type
export interface ICustomerRecordsListItemChild {
  fileId: string;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileBase64String: string;
  [key: string]: unknown;
}

export interface ICustomerRecordsListItem {
  colorId: number;
  followRecordId: string;
  description: string;
  followTime: string;
  generateType: GenerateTypeEnum;
  materialList: ICustomerRecordsListItemChild[];
  username: string;
}

export interface ICustomerRecordsListData {
  customerId: string;
  followRecordList: ICustomerRecordsListItem[];
}

export interface ICustomerRecordForm {
  description: string;
  followTime: string;
  followRecordId: string;
  generateType: GenerateTypeEnum;
  materialList: any[];
}

// perception type
export interface ICustomerPerceptionListItem {
  addTime: string;
  description: string;
  materialList: ICommonMaterial[];
  perceptionId: string;
}

export interface ICustomerPerceptionListData {
  perceptionList: ICustomerPerceptionListItem[];
}

export interface ICustomerPerceptionForm {
  description: string;
  addTime: string;
  perceptionId: string;
  materialList: any[];
}

export interface IPhoneSelectOptionsItem {
  label: string;
  show: string;
  value: number;
}

export interface ICustomerContractsListPayload {
  pageNum?: number;
  pageSize?: number;
  customerId?: number;
  contractNumber?: string;
  contractStatus?: ContractStatusEnum[];
  projectId?: string;
}

export interface ICustomerTransferHistoryItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  buId: number;
  type: string;
  field: string;
  userRoleId: number;
  startTime: string;
  endTime: string;
  aliasName: string;
}

export interface ICustomerContractTrackingListParams {
  pageNum?: number;
  pageSize?: number;
  projectId?: number;
  projectActivityStatus?: boolean;
  customerId?: number;
  bdUserId?: number;
  camUserId?: number;
  operatorType?: EnumCompareOperatorType;
  operatorDays?: number;
  contractExpireStatus?: EnumContractExpireStatus;
}

export interface ICustomerContractTrackingItem {
  contractId: number;
  contractNumber: string;
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
  projectActivityStatus: boolean;
  customerId: number;
  customerName: string;
  bdUserId: number;
  bdName: string;
  camUserId: number;
  camName: string;
  customerContractPeriod: {
    startDate: string;
    endDate: string;
  };
  remainingDays: number;
  customerNote: {
    id: number;
    contractId: number;
    note: string;
    createdBy: number;
    createdName: string;
    createdAt: string;
  };
}
