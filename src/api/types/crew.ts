import { CrewStatusEnum, TruckTransportationStatusEnum } from '@/enums';
import { IDocumentListItem } from './truck';

export interface ICrewDefaultCategory {
  id: string;
  fileCategory: string;
  required: boolean;
}
export interface ICrewAddParams {
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  documentList: IDocumentListItem[];
  vendorId?: number;
}
export interface ICrewUpdateParams {
  id: number;
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  // documentList: IDocumentListItem[];
  // vendorId?: number;
}
export interface ICrewListParams {
  pageNum: number;
  pageSize: number;
  id?: number;
  name?: string;
  driverFlag?: boolean;
  helperFlag?: boolean;
  statusList?: CrewStatusEnum[];
  transportationStatusList?: TruckTransportationStatusEnum[];
  phoneCodeId?: number;
  phoneNum?: string;
  licenseNumber?: string;
  vendorId?: number;
  updateTimeStart?: string;
  updateTimeEnd?: string;
  validityPeriodFrom?: number;
  validityPeriodTo?: number;
}
export interface ICrewListItem {
  id: number;
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  status: CrewStatusEnum;
  transportationStatus: TruckTransportationStatusEnum;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  validityPeriod: number;
  updatedAt: string;
  vendorList: ICrewListVendorRecord[];
  accreditationRemainingDays: string;
}

export interface ICrewDetail {
  id: number;
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  status: CrewStatusEnum;
  transportationStatus: TruckTransportationStatusEnum;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  validityPeriod: number;
  updatedAt: string;
  vendorList: ICrewListVendorRecord[];
}
export interface IVendorDetailCrewListItem {
  id: number;
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  status: CrewStatusEnum;
  transportationStatus: TruckTransportationStatusEnum;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
}
export interface ICrewListVendorRecord {
  vendorId: number;
  vendorName: string;
  vendorTag: string;
}
