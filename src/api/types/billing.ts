import { IDocument } from '@/components/OssUpload/types';
import {
  DeductionStatusEnum,
  StatementClaimTicketStatusEnum,
} from '@/constants';
import {
  AdditionalChargeStatusEnum,
  BasicAmountStatusEnum,
  ClaimRequestStatusEnum,
  ClaimStatusEnum,
  CustomerSettledItemEnum,
  CustomerStatementStatusEnum,
  EnumTaxRateStatus,
  EnumVAT,
  EnumWHT,
  ExceptionFeeStatusEnum,
  PaidInAdvanceStatusEnum,
  RegularPaymentsStatusEnum,
  SettledItemEnum,
  SettlementTimeTypeEnum,
  StatementAssociationTypeEnum,
  StatementGetTaxRateEnum,
  StatementTypeEnum,
  VendorSettledItemEnum,
  VendorStatementStatusEnum,
} from '@/enums';
import { ICommonMaterial } from './common';
import { ICustomerCodeVosItem } from './waybill';

export interface ICustomerStatementParams {
  pageNum?: number;
  pageSize?: number;
  customerId?: number;
  statementStatus?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  statementId?: number;
  projectId?: number;
  invoiceNumber?: string;
  waybillId?: number;
  statementType?: StatementAssociationTypeEnum;
  outstandingAmountStart?: number;
  outstandingAmountEnd?: number;
  settledItemList?: CustomerSettledItemEnum[];
}
export interface ICustomerStatementListItem {
  id: number;
  statementNumber: string;
  customerName: string;
  invoiceNumber: string;
  statementStatus: CustomerStatementStatusEnum;
  totalAmountDue: number;
  amountReceived: number;
  outstandingAmount: number;
  reconciliationPeriodStart: string;
  reconciliationPeriodEnd: string;
  createdAt: string;
}

export interface IVendorStatementParams {
  pageNum?: number;
  pageSize?: number;
  customerId?: number;
  statementStatus?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  statementId?: number;
  projectId?: string;
  invoiceNumber?: string;
  waybillId?: number;
  statementType?: StatementAssociationTypeEnum;
  settledItemList?: VendorSettledItemEnum[];
  remainingUnpaidAmountStart?: number;
  remainingUnpaidAmountEnd?: number;
}
export interface IVendorStatementListItem {
  id: number;
  statementNumber: string;
  customerName: string;
  invoiceNumber: string;
  statementStatus: CustomerStatementStatusEnum;
  totalAmountDue: number;
  amountReceived: number;
  outstandingAmount: number;
  reconciliationPeriodStart: string;
  reconciliationPeriodEnd: string;
  createdAt: string;
}
export interface IBillingCustomerStatementStatusHisList {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  statementId: number;
  status: CustomerStatementStatusEnum;
  reason: string;
}
export interface IBillingVendorStatementStatusHisList {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  statementId: number;
  status: VendorStatementStatusEnum;
  reason: string;
}

export interface IBillingCustomerStatementDetail {
  number: string;
  status: CustomerStatementStatusEnum;
  customerName: string;
  customerId: number;
  vendorName: string;
  settledItemList: CustomerSettledItemEnum[];
  invoiceNumber: string;
  projectName: string;
  createdAt: string;
  creator: string;
  reconciliationPeriodStart: string;
  reconciliationPeriodEnd: string;
  settlementTimeType: string;
  billingInfo: ICustomerStatementDetailBillingInfo;
  statusHisList: IBillingCustomerStatementStatusHisList[];
  writeOffReason: string;
  projectNames: string[];
}
export interface IBillingVendorStatementDetail {
  number: string;
  status: VendorStatementStatusEnum;
  customerName: string;
  customerId: number;
  vendorName: string;
  settledItemList: VendorSettledItemEnum[];
  invoiceNumber: string;
  projectName: string;
  createdAt: string;
  creator: string;
  reconciliationPeriodStart: string;
  reconciliationPeriodEnd: string;
  settlementTimeType: string;
  billingInfo: ICustomerStatementDetailBillingInfo;
  statusHisList: IBillingVendorStatementStatusHisList[];
  writeOffReason: string;
  projectNames: string[];
}

export interface IStatementExportParams {
  statementId: number;
  waybillId?: number;
  customerCode?: string;
  truckTypeId?: number;
}

export interface IStatementLogRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  statementId: number;
  operator: string;
  description: string;
  deleted: boolean;
}

interface IClaim {
  [key: string]: number;
}

export interface ICustomerStatementDetailBillingInfo {
  additionalCharge: number;
  basedOnWaybill: boolean;
  basicAmount: number;
  claim: number;
  exceptionFee: number;
  isTaxInclusive: boolean;
  miscellaneousChargeList: IMiscellaneousChargeListItem[];
  miscellaneousChargeTotalAmount: number;
  paidInAdvance: number;
  regularPayments: number;
  // settlementAmount: number;
  // originalSettlementAmount: number;
  waybillContractRevenue: number;
  totalAmountReceivable: number;
  claimMap: IClaim;
  collectedAmount: number;
  unCollectedAmount: number;
  vatAmount: number;
  whtAmount: number;
  others: number;
  reimbursementExpenseTotalAmount: number;
}
export interface IMiscellaneousChargeListItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  statementId: number;
  itemName: string;
  amount: number;
}
export interface IStatementInvoiceNumberListItem {
  statementInvoiceId: number;
  statementInvoiceNumberId?: number;
  invoiceNumber: string;
  invoiceDate: string;
}
export interface IStatementInvoiceWaybillSaveParams {
  statementId: number;
  list: { statementWaybillId: number; statementInvoiceNumberIds: number[] }[];
}
export interface IStatementInvoiceListItem {
  id: string | number;
  invoiceNumberList: IStatementInvoiceNumberListItem[];
  materialVoList: ICommonMaterial[];
  vat?: EnumVAT;
  wht?: EnumWHT;
}

export interface IStatementInvoiceParam {
  statementInvoiceId?: number; // Edit Used
  statementId?: number; // Create Used
  invoiceNumberList: IStatementInvoiceNumberListItem[];
  materialIds: string[];
  // vat?: EnumVAT;
  // wht?: EnumWHT;
}

export interface IProofMaterialItem extends ICommonMaterial {
  statementProofId: number;
}
export interface IStatementProofListItem {
  id: number;
  proofType: string;
  description: string;
  materialVoList: IProofMaterialItem[];
  source: string;
}

export interface IStatementQueryWaybillReq {
  pageNum?: number;
  pageSize?: number;
  projectIdList?: number[];
  settledItemList?: SettledItemEnum[];
  type?: StatementTypeEnum;
  waybillNum?: string;
  customerCode?: string;
  truckTypeId?: number;
  positionTimeStart?: string;
  positionTimeEnd?: string;
  destinationTimeStart?: string;
  destinationTimeEnd?: string;
  unloadingTimeStart?: string;
  unloadingTimeEnd?: string;
  statementId?: number;
}

export interface IRemark {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  remarkType: string;
  eventTime: string;
  description: string;
  generateType: string;
  waybillId: number;
}

export interface IStatementWaybillRecord {
  id?: number;
  waybillId: number;
  waybillNumber: string;
  positionTime: string;
  destinationTime: string;
  unloadingTime: string;
  waybillFeeAmount: number;
  basicAmount: number;
  additionalCharge: number;
  exceptionFee: number;
  claim: number;
  claimTip: boolean;
  paidInAdvance: number;
  regularPayments: number;
  basicAmountStatus: BasicAmountStatusEnum;
  additionalChargeStatus: AdditionalChargeStatusEnum;
  exceptionFeeStatus: ExceptionFeeStatusEnum;
  claimStatus: ClaimStatusEnum;
  paidInAdvanceStatus: PaidInAdvanceStatusEnum;
  regularPaymentsStatus: RegularPaymentsStatusEnum;
  settlementAmountTaxIn: number;
  settlementAmountTaxOut: number;
  originalSettlementAmountTaxIn: number;
  originalSettlementAmountTaxOut: number;
  truckTypeName: string;
  plateNumber: string;
  numberOfDrops: number;
  remarks: IRemark[];
  customerCodeVos: ICustomerCodeVosItem[];
  origin: string;
  destination: string;
  originLabel: string;
  destinationLabel: string;
  miscellaneousCharge: number;
}

export interface IStatementQueryProjectReq {
  type: StatementTypeEnum;
  entityId: number;
}

export interface IStatementAmountReq {
  settledItem: SettledItemEnum;
  amount: number;
  status: BasicAmountStatusEnum;
}

export interface IStatementWaybillReqItem {
  waybillId: number;
  amountReqs: IStatementAmountReq[];
}

export interface IStatementAddReq {
  type: StatementTypeEnum;
  entityId: number;
  reconciliationPeriodStart: string;
  reconciliationPeriodEnd: string;
  settlementTimeType?: SettlementTimeTypeEnum;
  projectIdList?: number[];
  waybills?: IStatementWaybillReqItem[];
  settledItemList?: SettledItemEnum[];
  isTaxInclusive?: boolean;
  billedProjectId?: number;
}
export interface IStatementMiscellaneousChargeListItem {
  id?: number;
  itemName: string;
  amount: number;
}
export interface IMiscellaneousChangeHistoryListItem {
  id: number;
  operator: string;
  description: string;
  createdAt: string;
  documentList: IDocument[];
}

export interface IMiscellaneousChangeSaveReq {
  statementMiscellaneousChargeList: IStatementMiscellaneousChargeListItem[];
  deleteIds: number[];
  statementId: number;
  documentIds: number[];
}

export interface IMiscellaneousChangeWaybillSaveReq {
  statementId: number;
  documentIds: number[];
  details: {
    statementWaybillId: number;
    waybillNumber: string;
    miscellaneousCharge: number;
  }[];
}
export interface IStatementWaybillEditCostReq {
  statementId: number;
  costList: {
    statementWaybillId: number;
    amountTaxIn?: number;
    amountTaxEx?: number;
  }[];
}

export interface IClaimWaybillItem {
  waybillId: number;
  waybillNumber: string;
}

export interface IClaimSubtaskItem {
  procInstId: number;
  subtaskName: string;
}

export type IStatementClaimItem = number &
  IClaimWaybillItem &
  IClaimSubtaskItem[];

export interface IStatementClaimListResp {
  headers: string[];
  pageData: PaginationResponse<IStatementClaimItem[]>;
}

export type IMiscellaneousChargeList = {
  id: number;
  symbol: string;
  miscellaneous: number;
  waybillId: number;
  waybillNumber: string;
};
export interface IArStatisticOverviewPayload {
  startDate: string;
  endDate: string;
}

export interface IStatisticOverviewDataItem {
  key: string;
  numOfTrips: number;
  amount: number;
  contractRevenue: number;
  miscellaneousCharge: number;
  vat: number;
  wht: number;
  claim: number;
  reimbursementExpense: number;
  independentAmount: number;
}

export interface IStatisticOverviewDataTotal {
  key: string;
  numOfTrips: number;
  amount: number;
  contractRevenue: number;
  miscellaneousCharge: number;
  vat: number;
  wht: number;
  claim: number;
  reimbursementExpense: number;
  independentAmount: number;
}

export interface IArStatisticOverviewResp {
  beforeFinProportion: number;
  afterFinProportion: number;
  dataList: IStatisticOverviewDataItem[];
  totalData: IStatisticOverviewDataTotal;
}

export interface IArStatisticOverviewKeyDownloadPayload {
  startDate: string;
  endDate: string;
  key: string;
}
export interface IStatementRejectParams {
  statementId: number;
  reason: string;
  materialIds: number[];
}

export interface IStatisticBreakdownByMonthDataItem {
  statDate: string;
  receivableTripNum: number;
  receivableAmount: number;
  unBilledTripNum: number;
  unBilledAmount: number;
  underDocTripNum: number;
  underDocAmount: number;
  underPriceTripNum: number;
  underPriceAmount: number;
  ubpUnderBillTripNum: number;
  ubpUnderBillAmount: number;
  accUnderBillTripNum: number;
  accUnderBillAmount: number;
  afrUnderBillTripNum: number;
  afrUnderBillAmount: number;
  billedTripNum: number;
  billedAmount: number;
  billedTripProportion: number;
  underDueTripNum: number;
  underDueAmount: number;
  overDueTripNum: number;
  overDueAmount: number;
  writeOffTripNum: number;
  writeOffAmount: number;
  collectedTripNum: number;
  collectedAmount: number;
}

export interface IStatisticBreakdownByMonthDataTotal {
  statDate: string;
  receivableTripNum: number;
  receivableAmount: number;
  unBilledTripNum: number;
  unBilledAmount: number;
  underDocTripNum: number;
  underDocAmount: number;
  underPriceTripNum: number;
  underPriceAmount: number;
  ubpUnderBillTripNum: number;
  ubpUnderBillAmount: number;
  accUnderBillTripNum: number;
  accUnderBillAmount: number;
  afrUnderBillTripNum: number;
  afrUnderBillAmount: number;
  billedTripNum: number;
  billedAmount: number;
  billedTripProportion: number;
  underDueTripNum: number;
  underDueAmount: number;
  overDueTripNum: number;
  overDueAmount: number;
  writeOffTripNum: number;
  writeOffAmount: number;
  collectedTripNum: number;
  collectedAmount: number;
}

export interface IArStatisticBreakdownByMonthResp {
  dataList: IStatisticBreakdownByMonthDataItem[];
  totalData: IStatisticBreakdownByMonthDataTotal;
}

export interface IStatisticUncollectedBreakdownDataItem {
  customerId: number;
  customerName: string;
  tripNum: number;
  amount: number;
  percentageOfUnCollected: number;
  underDueTripNum: number;
  underDueAmount: number;
  underZeroToSevenDays: number;
  underEightToFifteenDays: number;
  underSixteenToThirtyDays: number;
  underThirtyOneToFortyFiveDays: number;
  underFortySixToSixtyDays: number;
  underSixtyOneToNinetyDays: number;
  underNinetyPlusDays: number;
  overDueTripNum: number;
  overDueAmount: number;
  overOneToFifteenDays: number;
  overSixteenToThirtyDays: number;
  overThirtyOneToFortyFiveDays: number;
  overFortySixToSixtyDays: number;
  overSixtyOneToNinetyDays: number;
  overNinetyOneToHundredTwentyDays: number;
  overHundredTwentyPlusDays: number;
}

export interface IDataByMonthItem {
  statDate: string;
  // unBilledTripNum: number;
  unBilledAmount: number;
  underDocTripNum: number;
  underDocAmount: number;
  underPriceTripNum: number;
  underPriceAmount: number;
  ubpUnderBillTripNum: number;
  ubpUnderBillAmount: number;
  accUnderBillTripNum: number;
  accUnderBillAmount: number;
  afrUnderBillTripNum: number;
  afrUnderBillAmount: number;
}

export interface IStatisticUnBilledByCustomerDataItem {
  customerId: number;
  customerName: string;
  unBilledAmount: number;
  unBilledProportion: number;
  dataByMonthList: IDataByMonthItem[];
}

export interface IStatisticUnBilledByCustomerResp {
  dataList: IStatisticUnBilledByCustomerDataItem[];
  totalData: IStatisticUnBilledByCustomerDataItem;
}
export interface IStatementCancelledListItem {
  id: string | number;
  invoiceNumberList: IStatementInvoiceNumberListItem[];
  materialVoList: ICommonMaterial[];
  vat?: EnumVAT;
  wht?: EnumWHT;
  updatedAt: string;
  operator: string;
}
export interface IStatementQueryEditStatementWaybillPayload {
  pageNum: number;
  pageSize: number;
  statementId: number;
  waybillNum?: string;
  customerCode?: string;
  invoiceNum?: string;
  truckTypeIdList?: number[];
}
export interface IStatementQueryEditStatementWaybillItem {
  id: number;
  waybillId: number;
  waybillNumber: string;
  waybillBasicAmount: number;
  waybillAdditionalCharge: number;
  waybillExceptionFee: number;
  waybillPaidInAdvance: number;
  waybillRegularPayments: number;
  contractRevenue: number;
  basicAmount: number;
  additionalCharge: number;
  exceptionFee: number;
  paidInAdvance: number;
  regularPayments: number;
  billAmount: number;
  miscellaneousCharges: [
    {
      createdAt: string;
      createdBy: number;
      updatedAt: string;
      updatedBy: number;
      id: number;
      statementId: number;
      statementWaybillId: number;
      itemName: string;
      amount: number;
    },
  ];
  documentList: [
    {
      documentId: number;
      fileId: string;
      fileName: string;
      originalFileName: string;
      fileType: string;
      fileMimeType: string;
      fileSize: number;
      snapshotUrl: string;
    },
  ];
}
export interface IStatementEditAmountPayload {
  id: number;
  basicAmount?: number;
  paidInAdvance?: number;
  regularPayments?: number;
  additionalCharge?: number;
  exceptionFee?: number;
  billAmount?: number;
  contractRevenue?: number;
  miscellaneousCharge?: number;
  reimbursementExpense?: number;
  miscChgSaveReqs: {
    itemName: string;
    amount: number;
  }[];
  documentIds: number[];
  ossFileList?: any;
  documentList?: any;
}

export interface IAdditionalWaybillItem {
  waybillId: number;
  waybillNumber: string;
}

export interface IAdditionalSubtaskItem {
  procInstId: number;
  subtaskName: string;
}

export type IStatementAdditionalItem = number &
  IAdditionalWaybillItem &
  IAdditionalSubtaskItem[];

export interface IStatementAdditionalListResp {
  headers: string[];
  pageData: PaginationResponse<IStatementAdditionalItem[]>;
}

export interface ITaxRateTablePayload {
  pageNum?: number;
  pageSize?: number;
  truckTypeIdList?: number[];
  status?: EnumTaxRateStatus;
}

export interface ITaxRateTableHeaderItem {
  name: string;
  code: string;
}

export interface ITaxRateTableDataItem {
  truckTypeId: number;
  truckTypeName: string;
  status: EnumTaxRateStatus;
  dataMap: any;
}

export interface ITaxRateData {
  tableHeader: ITaxRateTableHeaderItem[];
  tableData: PaginationResponse<ITaxRateTableDataItem>;
}

export interface ITaxRateEditPayload {
  truckTypeId: number;
  status?: EnumTaxRateStatus;
  code?: string;
  vat?: number;
  wht?: number;
}

export interface IStatementReceiptNumberItem {
  voucherNumber?: string;
  voucherDate?: string;
}

export interface IStatementReceiptOrPaymentCreateParams {
  statementId: number;
  receiptTime: string;
  receiptAmount: number;
  receiptNumberList?: IStatementReceiptNumberItem[];
  materialIds: number[];
}

export interface IStatementReceiptOrPaymentListItem {
  id: number;
  receiptTime: string;
  receiptAmount: number;
  updatedByAliasName: string;
  materialVoList: ICommonMaterial[];
  receiptNumberList?: IStatementReceiptNumberItem[];
}
export interface IStatementClaimTicketListItem {
  id: number;
  number: string;
  status: StatementClaimTicketStatusEnum;
  type: 'Internal Claims';
  claimantId: number;
  claimantName: string;
  responsiblePartyId: number;
  responsiblePartyName: string;
  customerDeductionStatus: DeductionStatusEnum;
  vendorDeductionStatus: DeductionStatusEnum;
  totalAmount: number;
  createdBy: number;
  creatorName: string;
  createdAt: string;
}
export interface IStatementCancelCheckResp {
  isValid: boolean;
  requestStatus: ClaimRequestStatusEnum;
  requestNo: {
    id: number;
    claimRequestNo: string;
  }[];
}
export interface IStatementGetTaxRateResp {
  itemType: StatementGetTaxRateEnum;
  item: string;
  vat: number;
  wht: number;
}
export interface IStatementUpdateTaxRateParams {
  id: number;
  itemType: StatementGetTaxRateEnum;
  taxRateUpdateReqs: {
    item: string;
    vat: number;
    wht: number;
    vatEdit: boolean;
    whtEdit: boolean;
  }[];
}
