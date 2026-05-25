import { TransmittalStatusEnum, TransmittalTypeEnum } from '@/enums';
import { ICommonMaterial } from './common';

export interface ITransmittalListParams {
  pageNum?: number;
  pageSize?: number;
  transmittalId?: string;
  transmittalNumber?: string;
  transmittalType?: string;
  customerId?: string;
  customerName?: string;
  vendorId?: string;
  vendorName?: string;
  status?: TransmittalStatusEnum[];
  statusList?: TransmittalStatusEnum[];
  createTimeStart?: string;
  createTimeEnd?: string;
}

export interface ITransmittalListItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  transmittalId: number;
  transmittalNumber: string;
  transmittalType: TransmittalTypeEnum;
  customerId: number;
  vendorId: number;
  status: TransmittalStatusEnum;
  statisticalIntervalStart: string;
  statisticalIntervalEnd: string;
  countryId: number;
  customerName: string;
  vendorName: string;
}

export interface IAddTransmittalParams {
  transmittalType: TransmittalTypeEnum;
  customerId?: number;
  vendorId?: number;
  waybillIds: number[];
}

export interface IAddTransmittalWaybillListParams {
  pageNum: number;
  pageSize: number;
  transmittalType?: TransmittalTypeEnum;
  customerIds?: number;
  vendorIds?: number;
  projectIds?: number[];
  truckIds?: number[];
  truckTypeIds?: number[];
  waybillIds?: number[];
  driverIds?: number[];
  unloadTimeStart?: string;
  unloadTimeEnd?: string;
  deliverTimeStart?: string;
  deliverTimeEnd?: string;
  podNumber?: string;
}

export interface IWaybillPodNumberListItem {
  waybillId: number;
  createdAt: string;
  customerCodeTypeId: number;
  customerCodeTypeName: string;
  id: number;
  number: string;
  required: boolean;
  podNumberTypeId: number;
}

export interface IAddTransmittalWaybillListItem {
  waybillId: number;
  waybillNumber: string;
  transmittalType: TransmittalTypeEnum;
  projectId: number;
  deliveredTime: string;
  unloadingTime: string;
  truckType: string;
  plateNumber: string;
  customerName: string;
  vendorName: string;
  origin: string;
  destination: string;
  podNumberList: IWaybillPodNumberListItem[];
}

export interface ITransmittalDetail {
  transmittalId: number;
  transmittalNumber: string;
  transmittalType: TransmittalTypeEnum;
  customerId: number;
  vendorId: number;
  status: TransmittalStatusEnum;
  statisticalIntervalStart: string;
  statisticalIntervalEnd: string;
  countryId: number;
  customerName: string;
  vendorName: string;
  projectNames: string[];
  createdAt: string;
}

export interface ITransmittalLogRecord {
  id: number;
  transmittalId: number;
  projectId: number;
  describe: string;
  createdAt: string;
  createdBy: number;
  updatedBy: number;
  updatedAt: string;
  operator: string;
}
export interface ITransmittalDetailWaybillListParams {
  pageNum?: number;
  pageSize?: number;
  transmittalId?: number;
}

export interface ITransmittalDetailWaybillListItem {
  waybillNumber: string;
  deliveredTime: string;
  projectName: string;
  customerName: string;
  vendorName: string;
  podNumberTypeName: string;
  podNumber: string;
}
export interface ITransmittalMaterialFileVos extends ICommonMaterial {
  transmittalMaterialId: number;
  driveFileId: string;
}

export interface ITransmittalDetailProof {
  id: number;
  description: string;
  fileVos: ITransmittalMaterialFileVos[];
}
