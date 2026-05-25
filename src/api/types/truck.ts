import { VendorDriveStatusEnum, VendorTruckStatusEnum } from '@/enums';
import { IAccreditationCategoryListItem } from './vendor';

export interface ITruckParams {
  pageNum?: number;
  pageSize?: number;
  plateNumber?: string;
  truckType?: number;
  vendorName?: string;
  vendorTag?: string;
  status?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface ITruckListItem {
  country: number;
  grossCapacity: number;
  id: number;
  model: string;
  netCapacity: number;
  plateNumber: string;
  registrationNumber: number;
  status: string | null;
  truckType: number;
  truckTypeName: string | null;
  vanType: string;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  volume: number;
}

export interface ITruckTypeListItem {
  country: number;
  deleted: number;
  id: number;
  name: string;
}
export interface IDocumentListItem {
  fileCategory?: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely?: boolean;
  materialIdList?: number[];
}

export interface IAddTruckParams {
  id?: number;
  plateNumber: string;
  truckType: number;
  vanType: string;
  registrationNumber: number;
  grossCapacity: number;
  netCapacity: number;
  volume: number;
  model: string;
  codingDay: string;
  ownership?: string;
  vendorId?: number;
  vendorName?: string;
  documentList?: IDocumentListItem[];
}

export interface ITruckDetailData {
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
  mark: string;
  markReason: string;
  status: VendorTruckStatusEnum;
  country: number;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  createdAt: string;
  codingDay: string;
  ownership: string;
  transportationStatus?: string;
}

export interface IDriverListParams {
  pageNum?: number;
  pageSize?: number;
  currentUserCountryId?: number;
  driverName?: string;
  vendorName?: string;
  vendorTag?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface IDriverListItem {
  id: number;
  driverName: string;
  licenseNumber: string;
  contactPhoneNum: string;
  status: VendorDriveStatusEnum;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  countryId: number;
  mark: string;
  markReason: string;
  creationTime: string;
  phoneCode: string;
  phoneCodeId: number;
}

export interface IAddDriverParams {
  id?: number;
  driverName: string;
  licenseNumber: string;
  contactPhoneNum: string;
  phoneCode: string;
  phoneCodeId: number;
  vendorId?: number;
  vendorName?: string;
  reason?: string;
  countryId: number;
}

export interface IDriverRoleListParams {
  pageNum: number;
  pageSize: number;
  driverIds: number[];
  vendorNameOrTag?: string;
}

export interface IDriverRoleListItem {
  id: number;
  isRelated: boolean;
  vendorName: string;
  vendorTag: string;
}

export interface ITransferDriverParams {
  vendorId: number;
  driverIds: number[];
}

export interface IDriverDetailParams {
  id: number;
}

export interface IDriverAccreditationMaterialListItem {
  fileAccreditationId: number;
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
}

export interface IDriverAccreditationDataItem {
  categoryAccreditationId: number;
  categoryMaterialId: number;
  defaultCategory: number;
  fileCategory: string;
  required: number;
  validDateStart: string;
  validDateEnd: string;
  validIndefinitely: boolean;
  accreditationMaterialList: IDriverAccreditationMaterialListItem[];
}

export interface IDriverAccreditationData {
  driverId: number;
  accreditationCategoryList: IAccreditationCategoryListItem[];
}

export interface IAccreditationData {
  id: number;
  accreditationCategoryList: IAccreditationCategoryListItem[];
}

export interface IAddDriverCategory {
  id: number;
  fileCategory: string;
}

export interface ITruckVendorListItem {
  id: number;
  vendorId: number | null;
  vendorName: string;
  vendorTag: string;
  ownership: string;
  validateStatus?: boolean;
}

export interface ISelectAttributeVendor {
  id: number | null;
  ownership: string | null;
}
export interface ITruckDefaultCategoryRecord {
  fileCategory: string;
  required: boolean;
  id: number;
}
export interface IUpdateAccreditation {
  id: number;
  fileCategory: string;
  subFileCategory?: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely: boolean;
  addMaterialIdList?: number[];
  version?: number;
}
export interface ICreateAccreditationVersionParams {
  id: number;
  fileCategory: string;
  subFileCategory?: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely: boolean;
  materialIdList?: number[];
  version?: number;
}
