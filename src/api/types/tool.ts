import { SignTypeEnum, SignatureTypeEnum } from '@/constants';
import {
  FinancialStatusEnum,
  ProjectStatusEnum,
  RequirementFrequencyEnum,
  RouteBillingModeEnum,
  TruckTransportationStatusEnum,
  WaybillDispatchTypeEnum,
} from '@/enums';
import {
  BillingStatusEnum,
  ServiceTypeTypeEnum,
} from '@/pages/tools/FaBillingRecords/components/Transportation/enum';

export interface ISignatureListItemSigner {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  name: string;
  email: string;
  status: string;
  sort: number;
  mainColor: string;
  deleted: boolean;
  esignatureId: number;
}

export interface ISignatureListItemCC {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  name: string;
  email: string;
  mainColor: string;
  deleted: boolean;
  esignatureId: number;
}

export interface ISignatureListItem {
  id: number;
  name: string;
  status: string;
  signatureType: SignatureTypeEnum;
  signingTimeLimit: number;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  materialId: number;
  driveFileId: string;
  idAES: string;
  emailAES: string;
  signerList: ISignatureListItemSigner[];
  ccList: ISignatureListItemCC[];
}

export interface IField {
  uuid: string;
  signType: SignTypeEnum;
  signTypeName: string;
  required: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  pageNo: number;
  fontSize: number;
  font: string;
  email: string;
  mainColor: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ISigner {
  id?: number;
  name: string;
  email: string;
  status?: string;
  sort: number;
  mainColor: string;
}

export interface IFE_NEED_SIGNER extends ISigner {
  signFields: IField[];
}

export interface ICC {
  id: number;
  name: string;
  email: string;
  mainColor: string;
}

export interface ISignatureAddPayload {
  name: string;
  signatureType: SignatureTypeEnum;
  signingTimeLimit: number;
  materialId: number;
  signerList: ISigner[];
  ccList: ICC[];
  signFields: IField[];
}

export interface IAddSignatureParams {
  name: string;
  signatureType: string;
  signingTimeLimit: number;
  materialId: number;
  certificateId: number;
  signerList: {
    name: string;
    email: string;
    sort: number;
    mainColor: string;
  }[];
  ccList: {
    name: string;
    email: string;
    mainColor: string;
  }[];
  signFields: {
    uuid: string;
    signType: string;
    required: boolean;
    width: number;
    height: number;
    x: number;
    y: number;
    pageNo: number;
    signTypeName: string;
    mainColor: string;
    fontSize: number;
    font: string;
    email: string;
  }[];
}

export interface ISignatureFlagAddParams {
  id?: number;
  type: 'Word' | 'Image' | string;
  emailAES: string;
  name?: string;
  font?: string;
  size?: number;
  color?: string;
  fileBaseStr: string;
}
export interface ISignatureFlagItem {
  fileAccreditationId: number;
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
  id: number;
  type: string;
  name: string;
  font: string;
  size: number;
  color: string;
  updatedAtStr: string;
}

export interface ISigningElement {
  signType: SignTypeEnum;
  width: number;
  height: number;
  x: number;
  y: number;
  pageNo: number;
  imageBase64Str: string;
}

export interface IPDFSignPayload {
  id: number;
  verificationCode: string;
  signingElements: ISigningElement[];
}

export interface ISignField {
  id: number;
  signType: SignTypeEnum;
  required: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  pageNo: number;
  fontSize: number;
  font: number;
  mainColor: string;
}

export interface ISignatureDetail {
  id: number;
  name: string;
  lastSign: boolean;
  editEnable: boolean;
  status: string;
  deadline: string;
  signingEmail: string;
  signingId: number;
  signerList: ISigner[];
  ccList: ICC[];
  signFields: ISignField[];
  signingName: string;
  driveFileId: string;
  materialId: number;
}
export interface IProcessRenameParams {
  leadId: number;
  leadName: string;
  leadTag: string;
  opportunityId: number;
  opportunityName: string;
  customerId: number;
  customerName: string;
  customerTag: string;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  projectId: number;
  projectName: string;
}
export interface IFaTransportationListParams {
  pageNum: number;
  pageSize: number;
  hgCompanyName?: string;
  hgServiceTypeList?: ServiceTypeTypeEnum[];
  hgClientTag?: string;
  hgClientName?: string;
  hgInvoiceNo?: string;
  hgBillingStatus?: BillingStatusEnum;
  hgClientReceiveDateStart?: string;
  hgClientReceiveDateEnd?: string;
  hgCoveredPeriodStart?: string;
  hgCoveredPeriodEnd?: string;
  uploadTimeStart?: string;
  uploadTimeEnd?: string;
}
export interface IFaTransportationListItem {
  id: number;
  countryId: number;
  hgCompanyName: string;
  hgServiceType: ServiceTypeTypeEnum;
  hgClientTag: string;
  hgSapCode: string;
  hgClientName: string;
  hgInvoiceNo: string;
  hgBillingStatus: BillingStatusEnum;
  hgBillingInCharge: string;
  hgClientStatus: string;
  hgClientReceiveDate: string;
  hgRecognition: string;
  hgPercentCollected: string;
  hgBilledAmount: string;
  hgArAmount: string;
  hgOrAmount: string;
  hgActualCollected: string;
  hgDeduction: string;
  hgVbActualCollected: string;
  hgDeductionRemark: string;
  hgCwt: string;
  hgPercentCwt: string;
  hgReceiptRef: string;
  hgBankRef: string;
  hgTerm: string;
  hgDueDate: string;
  hgCollectedDate: string;
  hgInterval: string;
  hgOverdueStatus: string;
  hgOverdueDays: string;
  hgRemark: string;
  hgInvoiceDate: string;
  hgCoveredPeriod: string;
  hgBilledServiceYear: string;
  hgBillingDate: string;
  hgBillingReceivedDateSoft: string;
  hgBillingReceivedDateHard: string;
  hgAccountHandler: string;
  hgDayNo: string;
  hgWithinThreeDays: string;
  hgFormula: string;
  hgMonth: string;
  hgYear: string;
  hgOrRef: string;
  hgBilledTripNo: string;
  hgIncidentalCharge: string;
  hgSubsequentlyBilled: string;
  attUploadLink: string;
  attBillingSummary: string;
  attOrSoftCopy: string;
  attBtKpi: string;
  agSap: string;
  agSapAmount: string;
  agSapInvoiceStatus: string;
  agVariance: string;
  agBilledNotReceive: string;
  agSapArInvoiceStatus: string;
  agSiDuplicateCheck: string;
  agDueMonth: string;
  agReceivedMonth: string;
  agOverdueDays: string;
  agTaggingUniformity: string;
  agBillingStatus: BillingStatusEnum;
  agWw: string;
  agMonth: string;
  colOverdueDays: string;
  colLateBilledDays: string;
  colBillingReviewer: string;
  colPic: string;
  colVat: string;
  colCwt: string;
  colNetAmount: string;
  updatedAt: string;
}
export interface ITransportationImportInfo {
  lastResult: boolean;
  lastSuccessNum: number;
  lastImportTime: string;
  templateSpreadsheetUrl: string;
}

export interface IQuotedPriceStatisticsParams {
  pageNum: number;
  pageSize: number;
  truckTypeIdList: number[];
  industryIdList: number[];
  requirementFrequencyList: RequirementFrequencyEnum[];
  addressMatchLevel: 'L2' | 'L3';
  billingMode?: RouteBillingModeEnum;
  quotationStart?: string;
  quotationEnd?: string;
  originPadId: number;
  originSadId: number;
  originTadId: number;
  destinationPadId: number;
  destinationSadId: number;
  destinationTadId: number;
  originAddressLat: number;
  originAddressLng: number;
  destinationAddressLat: number;
  destinationAddressLng: number;
  priceLevel: 'V0' | 'V1' | 'V2';
}

export interface IQuotedPriceStatisticsRecord {
  max: number;
  min: number;
  median: number;
  percentile: number;
  mean: number;
  variance: number;
  standardDeviation: number;
}

export interface IQuotedPriceWaybillListParams {
  pageNum: number;
  pageSize: number;
  truckTypeIdList: number[];
  industryIdList: number[];
  requirementFrequencyList: RequirementFrequencyEnum[];
  addressMatchLevel: 'L2' | 'L3';
  originPadId: number;
  originSadId: number;
  originTadId: number;
  destinationPadId: number;
  destinationSadId: number;
  destinationTadId: number;
}

export interface IQuotedPriceWaybillListParamsV2 {
  pageNum: number;
  pageSize: number;
  truckTypeIdList: number[];
  industryIdList: number[];
  requirementFrequencyList: RequirementFrequencyEnum[];
  addressMatchLevel: 'L2' | 'L3';
  originPadId: number;
  originSadId: number;
  originTadId: number;
  destinationPadId: number;
  destinationSadId: number;
  destinationTadId: number;
  customerOrVendor: boolean;
  quotationStart: string;
  quotationEnd: string;
  originAddressLat: number;
  originAddressLng: number;
  destinationAddressLat: number;
  destinationAddressLng: number;
}

export interface IQuotedPriceWaybillListRecord {
  id: number;
  waybillNumber: string;
  basicAmountReceivable: number;
  basicAmountReceivableKm: number;
  basicAmountPayable: number;
  basicAmountPayableKm: number;
  distance: number;
  projectName: string;
  customerName: string;
  vendorName: string;
  industryName: string;
  requirementFrequency: RequirementFrequencyEnum;
  originRegion: string;
  originAddress: string;
  destinationRegion: string;
  destinationAddress: string;
  positionTime: string;
  grossProfit: number;
  grossMargin: number;
  truckTypeName: string;
  truckTypeId: number;
}

export interface IPricingCheckWaybillListPayload {
  pageNum?: number;
  pageSize?: number;
  unloadingOrAbnormalTimeStart?: string;
  unloadingOrAbnormalTimeEnd?: string;
  positionTimeStart?: string;
  positionTimeEnd?: string;
  projectId?: number;
}

export interface ICustomerCode {
  waybillId: number;
  customerCodeTypeId: number;
  customerCodeTypeName: string;
  number: string;
  required: true;
  createdAt: string;
  id: number;
}

export interface IPricingCheckWaybillItem {
  waybillId: number;
  grossProfit: number;
  grossMargin: number;
  waybillNumber: string;
  positionTime: string;
  projectName: string;
  customerName: string;
  vendorName: string;
  waybillReceivableAmount: number;
  basicAmountReceivable: number;
  additionalAmountReceivable: number;
  customerAdditionalDetails: string;
  waybillPayableAmount: number;
  paidInAdvance: number;
  basicAmountPayable: number;
  vendorAdditionalDetails: string;
  actualTruckType: string;
  requiredTruckType: string;
  transportationStatus: TruckTransportationStatusEnum;
  financialStatus: FinancialStatusEnum;
  dispatchType: WaybillDispatchTypeEnum;
  originLabel: string;
  originRegion: string;
  destinationLabel: string;
  destinationRegion: string;
  waypoint: string;
  routeCode: string;
  noOfDrops: number;
  customerCodes: ICustomerCode[];
  remark: string;
}

export interface IQuotedPriceListParamsV2 {
  pageNum: number;
  pageSize: number;
  truckTypeIdList: number[];
  industryIdList: number[];
  requirementFrequencyList: RequirementFrequencyEnum[];
  addressMatchLevel: 'L2' | 'L3';
  billingMode: RouteBillingModeEnum;
  quotationStart: string;
  quotationEnd: string;
  originPadId: number;
  originSadId: number;
  originTadId: number;
  destinationPadId: number;
  destinationSadId: number;
  destinationTadId: number;
  originAddressLat: number;
  originAddressLng: number;
  destinationAddressLat: number;
  destinationAddressLng: number;
}

export interface IPriceVersionList {
  priceVersionId: number;
  validityPeriod: string;
  priceVersionStatus: string;
  truckTypeList: [
    {
      key?: string;
      truckTypeId: number;
      truckTypeName: string;
      versionPrice: number;
      deliveredTrips: number;
      [key: string]: any;
    },
  ];
}
export interface IQuotedPriceListCustomerAndVendor {
  merchantId: number;
  merchantName: string;
  totalRouteDeliveredTrips: number;
  priceVersionList: IPriceVersionList[];
}

export interface IQuotedPriceListDataByRoute {
  originAddress: string;
  originLabel: string;
  destinationAddress: string;
  destinationLabel: string;
  routeCode: string;
  routeMileage: string;
  totalDeliveryTrips: number;
  customerData: IQuotedPriceListCustomerAndVendor;
  vendorData: IQuotedPriceListCustomerAndVendor[];
}
export interface IQuotedPriceListRecord {
  projectId: number;
  customerId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
  industryId: number;
  industryName: string;
  routeLibraryId: number;
  routeLibraryName: string;
  routeIds: string;
  routeNum: number;
  mileage: number;
  requirementFrequency: RequirementFrequencyEnum;
  routeLibraryCreateTime: string;
  dataByRoute: IQuotedPriceListDataByRoute[];
}
