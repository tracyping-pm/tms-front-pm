import { ContractStatusEnum, ContractTypeEnum } from '@/enums';
import { ICommonMaterial } from './common';

export interface IContractListPayload {
  current?: number;
  pageNum?: number;
  pageSize?: number;
  contractNumber?: string;
  projectId?: number;
  contractType?: ContractTypeEnum;
  contractSignerId?: number;
  contractStatusList?: ContractStatusEnum[];
}

export interface IContractRecord {
  contractId: number;
  contractNumber: string;
  projectName: string;
  contractType: ContractTypeEnum;
  contractSigner: string;
  contractStatus: ContractStatusEnum;
  startDate: string;
  endDate: string;
  fuelBasis: number;
  materials: ICommonMaterial[];
}

export interface operationLogRecord {
  logTime: string;
  description: string;
}

export interface IContractOperationLogRecord {
  contractId: number;
  operationLogList: operationLogRecord[];
}

export interface IVendorListContractPayload {
  pageNum?: number;
  pageSize?: number;
  contractSigner?: number;
  projectId?: number;
  contractType: string;
}

export interface IVendorListContractRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  projectId: number;
  materialId: number;
  contractNumber: string;
  contractType: string;
  contractSigner: number;
  contractStatus: string;
  startDate: string;
  endDate: string;
  fuelBasis: number;
  contractBasedOnFuel: boolean;
  fuelChangeFrequency: string;
  deleted: boolean;
}

export interface IContractTrackingExpireCountData {
  expireWithin30Days: number;
  expireWithin7Days: number;
  expireWithin3Days: number;
  expired: number;
}
