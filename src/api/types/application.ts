import { ApplicationStatusEnum, ApplicationTypeEnum } from '@/enums';
import { IAccreditationMaterialListItem } from './vendor';

export interface IApplicationListParams {
  pageNum: number;
  pageSize: number;
  id?: number;
  status?: ApplicationStatusEnum;
  type?: ApplicationTypeEnum;
  vendorId?: number;
  objectId?: number;
  objectName?: string;
  updatedAtStart?: string;
  updatedAtEnd?: string;
}
export interface IApplicationRecord {
  id: number;
  number: string;
  status: string;
  type: ApplicationTypeEnum;
  applicant: string;
  vendorId: number;
  objectId: number;
  objectName: string;
  creatorEmail: string;
}

export interface ICategoryItem {
  categoryAccreditationId: number;
  categoryMaterialId: number;
  fileCategory: string;
  defaultCategory: boolean;
  required: boolean;
  validDateStart: string;
  validDateEnd: string;
  validIndefinitely: boolean;
  accreditationMaterialList: IAccreditationMaterialListItem[];
  id: string;
  change: boolean;
}
export interface IVendorApplicationDetailRecord {
  id: number;
  number: string;
  status: ApplicationStatusEnum;
  type: ApplicationTypeEnum;
  objectName: string;
  countryName: string;
  pad: number;
  padName: string;
  padChange: boolean;
  sad: number;
  sadName: string;
  sadChange: boolean;
  tad: number;
  tadName: string;
  tadChange: boolean;
  accreditationCategoryList: ICategoryItem[];
  updatedAt: string;
  rejectReason?: string;
}
export interface ITruckApplicationDetailRecord {
  id: number;
  number: string;
  status: ApplicationStatusEnum;
  type: ApplicationTypeEnum;
  plateNumber: string;
  plateNumberChange: boolean;
  truckType: number;
  truckTypeChange: boolean;
  vanType: string;
  vanTypeChange: boolean;
  registrationNumber: string;
  registrationNumberChange: boolean;
  grossCapacity: number;
  grossCapacityChange: boolean;
  netCapacity: number;
  netCapacityChange: boolean;
  volume: number;
  volumeChange: boolean;
  codingDay: string;
  codingDayChange: true;
  model: string;
  modelChange: boolean;
  ownership: string;
  ownershipChange: boolean;
  accreditationCategoryList: ICategoryItem[];
  updatedAt: string;
  rejectReason?: string;
}
export interface ICrewApplicationDetailRecord {
  id: number;
  number: string;
  status: ApplicationStatusEnum;
  type: ApplicationTypeEnum;
  name: string;
  nameChange: boolean;
  driverFlag: boolean;
  driverFlagChange: boolean;
  helperFlag: boolean;
  helperFlagChange: boolean;
  idNumber: string;
  idNumberChange: boolean;
  phoneCode: string;
  phoneCodeId: number;
  phoneCodeChange: boolean;
  phoneNum: string;
  phoneNumChange: boolean;
  licenseNumber: string;
  licenseNumberChange: boolean;
  accreditationCategoryList: ICategoryItem[];
  updatedAt: string;
  vendorName: string;
  rejectReason?: string;
  objectName: string;
}
