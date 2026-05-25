import { IDocument } from '@/components/OssUpload/types';
import {
  ApplicationTypeEnum,
  ContractStatusEnum,
  CrewStatusEnum,
  EnumCompareOperatorType,
  EnumContractExpireStatus,
  ProjectStatusEnum,
  VendorStatusEnum,
} from '@/enums';
import { ICommonMaterial } from './common';

export interface IVendorParams {
  pageNum?: number;
  pageSize?: number;
  vendorName?: string;
  status?: string | null;
  trucksMin?: number | null;
  trucksMax?: number | null;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface IVendorListItem {
  bdUserName: string;
  bdUserRoleId: number;
  country: number;
  countryName: string;
  createdAt: string;
  garageLocation: string;
  id: number;
  pad: number;
  padName: string;
  region: string;
  sad: number;
  sadName: string;
  status: string;
  tad: number;
  tadName: string;
  taxMark: string;
  trucks: number;
  vendorName: string;
  vendorTag: string;
  tinNumber: string;
  listOfServices: string;
  vendorType: string;
  email?: string;
}

export interface IAddVendorParams {
  id?: number;
  vendorName: string;
  vendorTag: string;
  vendorType: string;
  garageLocation: string;
  countryName?: string;
  country: number;
  pad: number;
  sad: number;
  tad: number;
  taxMark: string;
  tinNumber: string;
  listOfServices: string;
  reason?: string;
  email?: string;
}
export interface IAddVendorRecord {
  id: number;
  account: IVendorAccountRecord;
}
export interface IVendorAccountRecord {
  id: number;
  email: string;
  name: string;
  aliasName: string;
  randomPassword: string;
}

export interface IEditVendorParams {
  id: number;
  vendorTag: string;
  vendorType: string;
  garageLocation: string;
  pad: number;
  sad: number;
  tad: number;
  taxMark: string;
  tinNumber: string;
  listOfServices: string;
  reason?: string;
  email?: string;
}

export interface IVendorDetail {
  bdUserName: string;
  bdUserRoleId: number;
  country: number;
  countryName: string;
  createdAt: string;
  garageLocation: string;
  mark: string;
  markReason: string;
  id: number;
  pad: number;
  padName: string;
  region: string;
  sad: number;
  sadName: string;
  status: string;
  tad: number;
  tadName: string;
  taxMark: string;
  trucks: number;
  vendorName: string;
  vendorTag: string;
  tinNumber: string;
  listOfServices: string;
  vendorType: string;
  email?: string;
  accreditationStatus?: string;
  firstDeliveryDate?: string;
  latestDeliveryDate?: string;
  waybillCount?: number;
  ongoingWaybillCount?: number;
}

export interface ITransferRoleListItem {
  departmentId: number;
  departmentName: string;
  id: number;
  roleId: number;
  roleName: string;
  userAliasName: string;
  userId: number;
}

export interface IVendorTransferList {
  bdUserId: number;
  vendorIds: number[];
}

export interface IVendorContactParams {
  vendorId?: number;
  id?: number;
  contactName: string;
  title: string;
  phoneNumber: string;
  email: string;
  notes: string;
  phoneCode: string;
  phoneCodeId: number;
}

export interface IVendorContactListItem {
  contactName: string;
  email: string;
  id: number;
  notes: string;
  phoneNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  title: string;
  vendorId: number;
}

export interface IVendorRecordMaterialListItem {
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
}

export interface IVendorRecordListItem {
  followRecordId: number;
  followTime: string;
  description: string;
  generateType: string;
  materialList: ICommonMaterial[];
}

export interface IVendorRecordData {
  vendorId: number;
  followRecordList: IVendorRecordListItem[];
}

export interface IVendorDetailTruckListItem {
  id: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  vanType: string;
  registrationNumber: number;
  grossCapacity: number;
  netCapacity: number;
  volume: number;
  model: string;
  status: string;
  vendorId: number;
  vendorName: string;
}

export interface IAccreditationMaterialListItem {
  fileAccreditationId: number;
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
  fileNumber: string;
}
export interface IAccreditationCategoryListItem {
  categoryAccreditationId: number;
  categoryMaterialId: number;
  defaultCategory: boolean;
  fileCategory: string;
  subFileCategory?: string;
  required: boolean;
  validDateStart: string;
  validDateEnd: string;
  validIndefinitely: boolean;
  accreditationMaterialList: IAccreditationMaterialListItem[];
  id: string;
  change?: boolean;
  version?: number;
}

export interface IVendorAccreditationData {
  id: number;
  accreditationCategoryList: IAccreditationCategoryListItem[];
}
export interface IProcurementAccreditationData {
  id: number;
  accreditationCategoryList: IAccreditationCategoryListItem[];
}

export interface IVendorDetailHelperListItem {
  id: number;
  helperName: string;
  contactPhoneNum: string;
  phoneCode: string;
  phoneCodeId: number;
  status: string;
  vendorId: number;
  countryId: number;
  deleted: boolean;
  createdAt: string;
}

export interface IVendorDetailHelperForm {
  id: number;
  helperName: string;
  contactPhoneNum: string;
  phoneCode: string;
  phoneCodeId: number;
  vendorId: number;
  countryId: number;
}

export interface IVendorDetailDriverListItem {
  id: number;
  driverName: string;
  licenseNumber: string;
  contactPhoneNum: string;
  phoneCode: string;
  phoneCodeId: number;
  status: string;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  countryId: number;
  creationTime: string;
}

export interface IVendorDetailContractListPayload {
  pageNum?: number;
  pageSize?: number;
  vendorId?: number;
  contractNumber?: string;
  contractStatusList?: ContractStatusEnum[];
  projectId?: number;
  customerId?: number;
}

export interface IVendorSummaryRecord {
  vendorSummaryId: number;
  addTime: string;
  description: string;
  materialList: ICommonMaterial[];
}

export interface IVendorSummaryListResp {
  vendorId: number;
  summaryList: IVendorSummaryRecord[];
}

export interface IVendorSummaryEditPayload {
  dto: {
    vendorId: number;
    vendorSummaryId: number;
    addTime: string;
    description: string;
    deletedFileIdList: number[];
  };
  files: File[];
}

export interface IVendorSummaryDeletePayload {
  vendorId: number;
  vendorSummaryId: number;
}

export interface IVendorSummaryAddPayload {
  dto: {
    vendorId: number;
    addTime: string;
    description: string;
  };
  files: File[];
}
export interface VendorAccreditationValidDateParams {
  fileCategory: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely: boolean;
  id: number;
}

export interface IProcurementLogRecord {
  id: number;
  entityType: ApplicationTypeEnum;
  entityId: number;
  description: string;
  createdAt: string;
  operator: string;
}

export interface IVendorBizStatusRecordItem {
  id: number;
  entityType: ApplicationTypeEnum;
  entityId: number;
  afterStatus: CrewStatusEnum;
  reason: string;
  remark: string;
  createdAt: string;
  creator: string;
  proofDocumentList: IDocument[];
}

export interface IAccreditationHistoryRecord {
  categoryAccreditationId: number;
  version: number;
  creator: string;
  createdAt: string;
  validDateStart: string;
  validDateEnd: string;
  validIndefinitely: boolean;

  accreditationMaterialList: ICommonMaterial[];
}

export interface IVendorContractTrackingListParams {
  pageNum?: number;
  pageSize?: number;
  projectId?: number;
  vendorId?: number;
  projectActivityStatus?: boolean;
  customerId?: number;
  vendorAccreditationStatus?: VendorStatusEnum;
  vendorActivityStatus?: boolean;
  operatorType?: EnumCompareOperatorType;
  operatorDays?: number;
  picUserId?: number;
  contractExpireStatus?: EnumContractExpireStatus;
}

export interface IVendorContractTrackingItem {
  contractId: number;
  contractNumber: string;
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
  vendorId: number;
  vendorName: string;
  picUserId: number;
  picName: string;
  projectActivityStatus: boolean;
  customerId: number;
  customerName: string;
  customerContractPeriod: {
    startDate: string;
    endDate: string;
  };
  vendorAccreditationStatus: VendorStatusEnum;
  vendorActivityStatus: boolean;
  vendorContractPeriod: {
    startDate: string;
    endDate: string;
  };
  remainingDays: number;
  vendorNote: {
    id: number;
    contractId: number;
    note: string;
    createdBy: number;
    createdName: string;
    createdAt: string;
  };
}

export interface IAccreditationVersionHistoryRecord {
  categoryAccreditationId: number;
  version: number;
  creator: string;
  createdAt: string;
  validDateStart: string;
  validDateEnd: string;
  validIndefinitely: boolean;
  fileNumber: string;
  accreditationMaterialList: ICommonMaterial[];
}
