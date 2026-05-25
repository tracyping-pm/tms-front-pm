import {
  AccessStatusEnum,
  CrewStatusEnum,
  TruckTransportationStatusEnum,
} from '@/enums';

export interface ITruckVendorRefPayload {
  pageNum: number;
  pageSize: number;
  truckId?: number;
  truckTypeId?: number;
  vendorId?: number;
  plateNumber?: string;
}

export interface ITruckVendorRefRecord {
  vendorTruckId: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  vendorTag: string;
}

export interface ICapacityPoolTruckListPayload {
  pageNum: number;
  pageSize: number;
  capacityPoolId?: number;
  truckType?: number;
  vendorId?: number;
  projectId?: number;
}
export interface ICapacityPoolVendorListPayload {
  pageNum: number;
  pageSize: number;
  projectId?: number;
  capacityPoolId?: number;

  vendorNameId?: number;
  vendorTagId?: number;
  vendorAccessStatus?: string[];
}

// TODO: email
export interface ICapacityPoolTruckRecord {
  id: number;
  truckId: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  status: string;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  vendorTruckId: number;
  garageLocation: string;
  contactPerson: string;
  contactNumber: string;
  contactEmail?: string;
}
export interface ICapacityPoolVendorRecord {
  id: number;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  trucks: number;
  vendorAccessStatus: string;
  billingVersionStart: string;
  billingVersionEnd: string;
  routeLibraryId: number;
  billingMode: string;
}

export interface ICapacityPoolListPayload {
  pageNum?: number;
  pageSize?: number;
  projectId?: number;
  poolName?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  country?: number;
}

export interface ICapacityPoolDetail {
  id: number;
  projectId: number;
  projectName: string;
  poolName: string;
  customerName: string;
  customerTag: string;
  trucks: number;
  approvedTrucks: number;
  vendors: number;
  crews: number;
  approvedVendors: number;
  approvedCrews: number;
  creationTime: string;
}
export interface ICapacityPoolCrewListPayload {
  pageNum: number;
  pageSize: number;
  projectId?: number;
  capacityPoolId?: number;
  crewId?: number;
  name?: string;
  driverFlag?: boolean;
  helperFlag?: boolean;
  status?: CrewStatusEnum;
  transportationStatus?: TruckTransportationStatusEnum;
  accessStatus?: AccessStatusEnum;
  licenseNumber?: string;
  vendorId?: number;
}
export interface ICapacityPoolCrewRecord {
  id: number;
  accessStatus: AccessStatusEnum;
  crewId: number;
  name: string;
  status: CrewStatusEnum;
  transportationStatus: TruckTransportationStatusEnum;
  driverFlag: true;
  helperFlag: true;
  idNumber: string;
  licenseNumber: string;
  phoneCode: string;
  phoneNum: string;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
}
