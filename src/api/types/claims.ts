import type { components } from '@/api/generated/tms-paths';
import { IDocument } from '@/components/OssUpload/types';
import {
  DeductionStatusEnum,
  RefundStatusEnum,
  RefundTicketStatusEnum,
  StatementClaimTicketStatusEnum,
} from '@/constants';
import {
  ClaimRequestStatusEnum,
  CustomerStatementStatusEnum,
  VendorStatementStatusEnum,
  WaybillStatusEnum,
} from '@/enums';
import {
  EnumClaimOcStatus,
  EnumClaimTicketType,
  EnumExternalClaimsType,
  EnumInternalClaimsType,
} from '@/enums/claim';

export type IClaimBatchCreateInfoVo =
  components['schemas']['ClaimBatchCreateInfoVo'];

export type IClaimBatchCreateResult =
  components['schemas']['ClaimBatchCreateResultVo'];

export interface IClaimRequestList {
  pageNum: number;
  pageSize: number;
  claimRequestId?: number;
  claimId?: number;
  claimRequestStatus?: ClaimRequestStatusEnum;
  claimantId?: number;
  creatorId?: number;
  createTime?: string;
}
export interface IClaimRequestListRecord {
  id: number;
  claimRequestNo: string;
  claimant: string;
  totalClaimAmount: number;
  claimDetails: string;
  claimRequestProof: IDocument[];
  splitTicketNum: {
    claimId: number;
    claimNum: string;
  }[];
  createdAt: string;
  creator: string;
  claimRequestStatus: ClaimRequestStatusEnum;
}
export interface IClaimRequestReq {
  statementId: number;
  claimantId: number;
  totalClaimAmount: number;
  descList: {
    claimType: EnumExternalClaimsType;
    waybillId: number;
    responsibleParty: number;
    claimDetails: string;
    claimAmount: number;
  }[];
  materialList: number[];
}
export interface IClaimRequestEditReq {
  id: number;
  totalClaimAmount: number;
  descList: {
    claimType: EnumExternalClaimsType;
    waybillId: number;
    responsibleParty: number;
    claimDetails: string;
    claimAmount: number;
    vendorAmount: number;
    inteluckAmount: number;
  }[];
  materialList: number[];
}
export interface IClaimRequestDetail {
  id: number;
  customerId: number;
  claimRequestNo: string;
  requestStatus: ClaimRequestStatusEnum;
  totalClaimAmount: number;
  claimant: string;
  descriptions: {
    id: number;
    claimType: EnumExternalClaimsType;
    waybillId: number;
    waybillNo: string;
    responsibleParty: number;
    responsiblePartyName: string;
    claimDetails: string;
    claimAmount: number;
    vendorAmount: number;
    inteluckAmount: number;
  }[];
  claimRequestProof: IDocument[];
  statementStatus: CustomerStatementStatusEnum;
  splitTicketNum: [
    {
      claimId: number;
      claimNum: string;
    },
  ];
  creator: string;
  createdAt: string;
  operationLogs: {
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
    id: number;
    claimRequestId: number;
    operator: string;
    description: string;
  }[];
}
export interface IClaimWaybillInfo {
  waybillId: number;
  waybillNumber: string;
  waybillStatus: WaybillStatusEnum;
  plateNumber: string;
  truckTypeName: string;
  driverName: string;
  deliveredDate: string;
  customerCodeList: string[];
  hasAssociatedTicket: boolean;
  vendorId: number;
  vendorName: string;
  customerId: number;
}

export interface IClaimListType {
  internalList: EnumInternalClaimsType[];
  externalList: EnumExternalClaimsType[];
}

export interface IClaimCreateListItem {
  waybillId?: number;
  detail?: string;
  amount: number;
  plateNumber?: string;
  referenceDate?: string;
  location?: string;
  personName?: string;
  position?: string;
  item?: string;
  quantity?: number;
  size?: string;
  companyName?: string;
  coverageType?: string;
  fo?: string;
}

export interface IClaimCreatePayload {
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  waybillBased?: boolean;
  claimantId: number;
  responsiblePartyId: number;
  projectId?: number;
  totalAmount: number;
  ocStatus: EnumClaimOcStatus;
  itemList: IClaimCreateListItem[];
  remark?: string;
  documentIdList?: number[];
}

export interface IClaimCreateResponse {
  id: number;
  ticketNumber: string;
  ticketType: EnumClaimTicketType;
}

export interface IClaimListPayload {
  pageNum?: number;
  pageSize?: number;
  id?: number;
  ticketStatusList?: StatementClaimTicketStatusEnum[];
  claimTypeList?: Array<EnumExternalClaimsType | EnumInternalClaimsType>;
  claimantId?: number;
  responsiblePartyId?: number;
  projectId?: number;
  customerDeductionStatus?: DeductionStatusEnum;
  vendorDeductionStatus?: DeductionStatusEnum;
  creatorUserRoleIdList?: number[];
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface IClaimListRecord {
  id: number;
  ticketNumber: string;
  ticketStatus: StatementClaimTicketStatusEnum;
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  waybillBased: boolean;
  claimantId: number;
  claimantName: string;
  responsiblePartyId: number;
  responsiblePartyName: string;
  projectId: number;
  projectName: string;
  customerDeductionStatus: DeductionStatusEnum;
  vendorDeductionStatus: DeductionStatusEnum;
  totalAmount: number;
  createdBy: number;
  creatorName: string;
  createdAt: string;
}

export interface IClaimDetailRefundItem {
  id: number;
  ticketType: EnumClaimTicketType;
  ticketNumber: string;
}

export interface IClaimDetailWaybillInfo {
  waybillId: number;
  waybillNumber: string;
  deliveredDate: string;
  customerCodeList: string[];
}

export interface IClaimDetailTruckInfo {
  truckId: number;
  plateNumber: string;
  truckTypeName: string;
}

export interface IClaimDetailDriverInfo {
  driverId: number;
  driverName: string;
}

export interface IClaimDetailItem {
  id: number;
  waybillId: number;
  waybillInfo: IClaimDetailWaybillInfo;
  truckId: number;
  truckInfo: IClaimDetailTruckInfo;
  driverId: number;
  driverInfo: IClaimDetailDriverInfo;
  vendorId: number;
  detail: string;
  amount: number;
  plateNumber: string;
  referenceDate: string;
  location: string;
  personName: string;
  position: string;
  item: string;
  quantity: number;
  size: string;
  companyName: string;
  coverageType: string;
  fo: string;
}

export interface IClaimDetail {
  id: number;
  ticketNumber: string;
  ticketStatus: StatementClaimTicketStatusEnum;
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  externalFlag: boolean;
  waybillBased: boolean;
  claimantId: number;
  claimantName: string;
  responsiblePartyId: number;
  responsiblePartyName: string;
  projectId: number;
  projectName: string;
  totalAmount: number;
  ocStatus: EnumClaimOcStatus;
  customerDeductionStatus: DeductionStatusEnum;
  vendorDeductionStatus: DeductionStatusEnum;
  claimRequestId: number;
  claimRequestNumber: string;
  arStatementId: number;
  arStatementNumber: string;
  arStatementStatus: CustomerStatementStatusEnum;
  apStatementId: number;
  apStatementNumber: string;
  apStatementStatus: VendorStatementStatusEnum;
  refundList: IClaimDetailRefundItem[];
  itemList: IClaimDetailItem[];
}

export interface ITicketProofListItem extends IDocument {
  id: number;
  canBeDeleted: boolean;
}

export interface ITicketRemarkListItem {
  id: number;
  remark: string;
  createdAt: string;
  createdBy: number;
  creatorName: string;
}

export interface ITicketLogListItem {
  id: number;
  description: string;
  operator: string;
  createdAt: string;
}

export interface IClaimEditPayload {
  id: number;
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  waybillBased: boolean;
  claimantId: number;
  responsiblePartyId: number;
  projectId: number;
  totalAmount: number;
  itemList: IClaimCreateListItem[];
}

export interface ICustomParam {
  code: number;
  customParam: any;
  msg: string;
}

// Refund
export interface IRefundListPayload {
  pageNum?: number;
  pageSize?: number;
  id?: number;
  ticketStatusList?: RefundTicketStatusEnum[];
  payeeId?: number;
  refundingPartyId?: number;
  customerRefundStatus?: RefundStatusEnum;
  vendorRefundStatus?: RefundStatusEnum;
  creatorUserRoleIdList?: number[];
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface IRefundListRecord {
  id: number;
  ticketNumber: string;
  ticketStatus: RefundTicketStatusEnum;
  payeeId: number;
  payeeName: string;
  refundingPartyId: number;
  refundingPartyName: string;
  customerRefundStatus: RefundStatusEnum;
  vendorRefundStatus: RefundStatusEnum;
  totalAmount: number;
  createdBy: number;
  creatorName: string;
  createdAt: string;
  claimId: number;
  claimNumber: string;
}

export interface IRefundCreateListItem {
  claimItemId?: number;
  claimItemDetail?: string;
  claimItemAmount?: number;
  waybillId?: number;
  detail?: string;
  amount: number;
}

export interface IRefundCreatePayload {
  claimId: number;
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  payeeId: number;
  refundingPartyId: number;
  projectId?: number;
  totalAmount: number;
  ocStatus: EnumClaimOcStatus;
  remark?: string;
  documentIdList?: number[];
  itemList: IRefundCreateListItem[];
}

export interface IRefundDetailItem {
  id: number;
  detail: string;
  amount: number;
  claimItemDetail: string;
  claimItemAmount: number;
}

export interface IRefundDetail {
  id: number;
  ticketNumber: string;
  ticketStatus: RefundTicketStatusEnum;
  claimId: number;
  claimNumber: string;
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  claimWaybillBased: boolean;
  payeeId: number;
  payeeName: string;
  refundingPartyId: number;
  refundingPartyName: string;
  projectId: number;
  projectName: string;
  ocStatus: EnumClaimOcStatus;
  totalAmount: number;
  arStatementId: number;
  arStatementNumber: string;
  arStatementStatus: CustomerStatementStatusEnum;
  apStatementId: number;
  apStatementNumber: string;
  apStatementStatus: VendorStatementStatusEnum;
  customerRefundStatus: RefundStatusEnum;
  vendorRefundStatus: RefundStatusEnum;
  itemList: IRefundDetailItem[];
}

export interface IRefundEditPayload {
  id: number;
  claimId?: number;
  payeeId: number;
  refundingPartyId: number;
  projectId?: number;
  totalAmount: number;
  itemList: IRefundCreateListItem[];
}
