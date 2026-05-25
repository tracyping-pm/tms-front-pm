import {
  AccessStatusEnum,
  CrewStatusEnum,
  DownLoadStatusEnum,
  RouteBillingModeEnum,
  VendorStatusEnum,
  WaybillBillingBasicStatusEnum,
  WaybillDispatchTypeEnum,
  WaybillFinancialStatusEnum,
  WaybillStatusEnum,
} from '@/enums';
import {
  EnumClaimTicketType,
  EnumExternalClaimsType,
  EnumInternalClaimsType,
} from '@/enums/claim';
import { ICommonMaterial } from './common';

export interface IWaybillListParams {
  current?: number;
  pageNum: number;
  pageSize: number;
  projectIdList?: number[];
  customerNameIdList?: number[];
  customerTagIdList?: number[];
  dispatchType?: WaybillDispatchTypeEnum;
  statusList?: string[];
  status?: string[];
  externalCode?: string;
  positionTimeStart?: string;
  positionTimeEnd?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  waybillId?: number;
  truckId?: number;
  truckTypeId?: number;
  truckTypeName?: number;
  vendorIdList?: number[];
  originPadId?: number;
  originSadId?: number;
  originTadId?: number;
  originLabel?: string;
  destinationPadId?: number;
  destinationSadId?: number;
  destinationTadId?: number;
  destinationLabel?: string;
  riskLevelMin?: number;
  riskLevelMax?: number;
}

export interface IWaybillListItem {
  id: number;
  waybillNumber: string;
  projectId: number;
  projectName: string;
  customerId: number;
  customerName: string;
  customerTag: string;
  positionTime: string;
  status: WaybillStatusEnum;
  capacityPoolTruckId: number;
  truckId: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  driverId: number;
  driverName: string;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  createdAt: string;
  originPadId: number;
  originSadId: number;
  originTadId: number;
  originRegion: string;
  destinationPadId: number;
  destinationSadId: number;
  destinationTadId: number;
  destinationRegion: string;
  riskLevel: number;
  dispatchType: WaybillDispatchTypeEnum;
  hasGps: 0 | 1;
  preStatus: WaybillStatusEnum;
  destinationTime: string;
}

// route 相关
export interface IRouteOriginAndDestinationListPayload {
  pageNum?: number;
  pageSize?: number;
  padIdQuery?: number;
  sadIdQuery?: number;
  tadIdQuery?: number;
  waybillId: number;
}

export interface IRouteOriginAndDestinationListItem {
  isStop: boolean;
  routeId: number;
  padId: number;
  padName: string;
  sadId: number;
  sadName: string;
  tadId: number;
  tadName: string;
  label: string;
  vid: string;
  level: number;
  lat: number;
  lng: number;
  address: string;

  [key: string]: unknown;
}

export interface IWaypointListItem {
  routeId: number;
  waypoint: string;
  selected: boolean;
  vid: string;

  [key: string]: unknown;
}

export interface IAddWaybillParams {
  projectId: number;
  externalCode: string;
  positionTime: string;
  destinationTime: string;
  dispatchType: WaybillDispatchTypeEnum;
  projectName?: {
    id: number;
  };
  requiredTruckType: number;
  customerCode: ICustomerCodeListItem[];
}

export interface IHelperVosItem {
  id: number;
  helperName: string;
  helperPhoneNumber: string;
}
export interface ICustomerCodeVosItem {
  customerCodeId: number;
  waybillId: number;
  customerCodeType: string;
  number: string;
}

export interface IWaybillCarrierData {
  id: number;
  truckId: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  capacity: number;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  contact: number;
  contactName: string;
  phoneNumber: string;
  email: string;
  driverId: number;
  driverName: string;
  licenseNumber: string;
  driverPhoneNumber: string;
  helperVos: IHelperVosItem[];
}

export interface IWaybillTruckTypeItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  truckTypeId: number;
  truckTypeName: string;
  routeLibraryId: number;
  deleted: string;
}

export interface IWaybillTruckListParams {
  pageNum: number;
  pageSize: number;
  projectId: number | undefined;
  truckTypeId: number | undefined;
  truckId: number | undefined;
  vendorId: number | undefined;
  standardOrNot: boolean;
  requiredTruckType: number;
  truckIdOriginal?: number;
}

export interface IWaybillVendorListParams {
  pageNum: number;
  pageSize: number;
  projectId: number;
  vendorName: string | undefined;
  standardOrNot: boolean;
  requiredTruckType: number;
  vendorIdOrigin?: number;
}

export interface IWaybillDriverListParams {
  waybillId: number;
  name?: string;
  vendorId: number;
}

export interface IWaybillHelperListParams {
  waybillId: number;
  vendorId: number;
  name?: string;
}

export interface IWaybillVendorListItem {
  id: number;
  vendorName: string;
  mark: string;
  vendorAccessStatus: string;
  trucks: number;
  vendorContactPhoneNumber: string;
  truckTypeConsistency: boolean;
  vendorStatus: VendorStatusEnum;
}

export interface IWaybillTruckListItem {
  id: number;
  truckId: number;
  truckType: number;
  truckTypeName: string;
  plateNumber: string;
  mark: string;
  capacity: number;
  capacityPoolTruckStatus: string;
  vendorId: number;
  vendorTruckId: number;
  garage: string;
  vendorTag: string;
  ownership: string;
  truckTypeConsistency: boolean;
  disabled: boolean;
  disabledTip: string;
}

export interface IWaybillDriverListItem {
  id: number;
  name: string;
  licenseNumber: string;
  phoneNum: string;
  accessStatus: AccessStatusEnum;
  status: CrewStatusEnum;
  disabled: boolean;
  disabledTip: string;
}

export interface IWaybillHelperListItem {
  id: number;
  name: string;
  licenseNumber: string;
  phoneNum: string;
  accessStatus: AccessStatusEnum;
  status: CrewStatusEnum;
  disabled: boolean;
  disabledTip: string;
}

export interface IWaybillBaseInfoData {
  id: number;
  waybillNumber: string;
  dispatchType: WaybillDispatchTypeEnum;
  projectId: number;
  projectName: string;
  customerId: number;
  customerName: string;
  customerTag: string;
  positionTime: string;
  completionTime: string;
  remark: string;
  status: WaybillStatusEnum;
  preStatus: WaybillStatusEnum | null;
  dispatcherId: number;
  dispatcherName: string;
  customerBDId: number;
  customerBDName: string;
  pricerId: number;
  pricerName: string;
  pricingMode: RouteBillingModeEnum;
  vendorBDId: number;
  vendorBDName: string;
  createdAt: string;
  capacityPoolTruckId: number;
  truckId: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  requiredTruckType: number;
  requiredTruckTypeName: string;
  capacity: number;
  vendorId: number;
  vendorName: string;
  vendorTag: string;
  contact: number;
  contactName: string;
  phoneNumber: string;
  email: string;
  driverId: number;
  driverName: string;
  licenseNumber: string;
  driverPhoneNumber: string;
  helperVos: IHelperVosItem[];
  customerCodeVos: ICustomerCodeVosItem[];
  destinationTime: string;
  externalCode: string;
  ocid: number;
  ocname: string;
  onSiteOCId: number;
  onSiteOCName: string;
  podcheckerId: number;
  podcheckerName: string;
  vendorTruckId: number;
  truckTypeConsistency: boolean;
  settledTime: string;
  distance: number;
  financialStatus: WaybillFinancialStatusEnum;
  riskLevel?: number;
  hasGps: 0 | 1;
  hasLinkedStatement: boolean;
}

export interface IAddShippingRecordPayload {
  dto: {
    projectId: number;
    waybillId: number;
    action: string;
    time: string;
    lng: number;
    lat: number;
    mapAddress: string;
    note: string;
  };
  files: [];
}

export interface ITruckHistoryVoListItem {
  deviceDate: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
}

export interface IShippingRecordVoListItem {
  shippingRecordId: number;
  action: string;
  time: string;
  lng: number;
  lat: number;
  mapAddress: string;
  note: string;
  obtainLocationWay: string;
  onSiteMaterialList: ICommonMaterial[];
}

export interface IListShippingRecordResponse {
  waybillId: number;
  mapJsonStr: string;
  truckHistoryVoList: ITruckHistoryVoListItem[];
  shippingRecordVoList: IShippingRecordVoListItem[];
  callFmsFailed: boolean;
}

export interface IWaypointVoListItem {
  waypoint: string;
  vid: string;
  level: number;
  [key: string]: unknown;
}

export interface IDestinationVoListItem {
  routeId: number;
  region: string;
  padId: number;
  padName: string;
  sadId: number;
  sadName: string;
  tadId: number;
  tadName: string;
  address: string;
  level: number;
  lat: number;
  lnt: number;
  sort: number;
  vid: string;
  children: IWaypointVoListItem[];
  [key: string]: unknown;
}

export interface IOriginVoListItem {
  region: string;
  padId: number;
  padName: string;
  sadId: number;
  sadName: string;
  tadId: number;
  tadName: string;
  address: string;
  level: number;
  lat: number;
  lng: number;
  sort: number;
  vid: string;
  children: IDestinationVoListItem[];
  [key: string]: unknown;
}

export interface IWaybillRouteDetailResult {
  routeCode: string;
  originStopPoints: IRouteOriginAndDestinationListItem[];
  destinationStopPoints: IRouteOriginAndDestinationListItem[];
  originVos: IOriginVoListItem[];
}

export interface IWaybillRouteTemporaryDetailResult {
  routeCode: string;
  origins: IRouteOriginAndDestinationListItem[];
  waypoints: string[];
  destinations: IRouteOriginAndDestinationListItem[];
}

export interface IPodItem {
  defaultPod: boolean;
  skippable: boolean;
  requirementType: string;
  copyType: string;
  waybillPodId: number;
  podType: string;
  description: string;
  generateType: string;
  materialVoList: ICommonMaterial[];
}

export interface IListPodResp {
  waybillId: number;
  podList: IPodItem[];
}

export interface IRemarkItem {
  waybillRemarkId: number;
  remarkType: string;
  eventTime: string;
  description: string;
  generateType: string;
  creator: string;
  materialVoList: ICommonMaterial[];
}

export interface IListRemarkResp {
  waybillId: number;
  remarkList: IRemarkItem[];
}

export interface AdditionalChargeListItem {
  amount: number;
  id: number;
  item: string;
  objectType: string;
  source: string;
  waybillId: number;
}

export interface IBillingExceptionListItem {
  id: number;
  waybillId: number;
  objectType: string;
  item: string;
  amount: number;
  source: string;
}

export interface IClaimListItem {
  amount: number;
  id: number;
  item: string;
  objectType: string;
  source: string;
  waybillId: number;
}
export interface IWaybillBillingData {
  additionalAmountPayable: number;
  additionalAmountPayableStatus: string;
  additionalAmountReceivable: number;
  additionalAmountReceivableStatus: string;
  additionalChargeVendorList: AdditionalChargeListItem[];
  additionalChargeCustomerList: AdditionalChargeListItem[];
  basicAmountPayable: number;
  basicAmountPayableRemaining: number;
  basicAmountPayableRemainingStatus: string;
  basicAmountReceivable: number;
  basicAmountReceivableStatus: string;
  // claimCustomerList: IClaimListItem[];
  claimPayable: number;
  claimPayableStatus: string;
  claimReceivable: number;
  claimReceivableStatus: string;
  // claimVendorList: IClaimListItem[];
  customerTruckTypeActualOrRequired: boolean;
  exceptionFeeCustomerList: IBillingExceptionListItem[];
  exceptionFeePayable: number;
  exceptionFeePayableStatus: string;
  exceptionFeeReceivable: number;
  exceptionFeeReceivableStatus: string;
  exceptionFeeVendorList: IBillingExceptionListItem[];
  grossMargin: number;
  grossProfit: number;
  id: number;
  paidInAdvance: number;
  paidInAdvanceStatus: string;
  vendorTruckTypeActualOrRequired: boolean;
  waybillId: number;
  waybillPayableAmount: number;
  waybillReceivableAmount: number;
  requiredTruckType: string;
  actualTruckType: string;
}

export interface IBillingParams {
  id: number;
  waybillId: number;
  basicAmountReceivable: number;
  basicAmountPayable: number;
  receivable?: number;
  payable?: number;
  canEditAmount?: boolean;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
}

export interface IAdditionalChargeRecordItem {
  id?: number | string;
  waybillId?: number;
  objectType?: string;
  symbol?: string;
  item: string;
  amount: number | undefined;
  // source: string | undefined;
}

export interface IAdditionalChargeRecordResponse {
  waybillId: 0;
  customerChargeList: IAdditionalChargeRecordItem[];
  vendorChargeList: IAdditionalChargeRecordItem[];
  additionalAmountReceivableStatus: string;
  additionalAmountPayableStatus: string;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
}

export interface IAdditionalChargeConfirmParams {
  waybillId?: number;
  customerChargeList: IAdditionalChargeRecordItem[];
  vendorChargeList: IAdditionalChargeRecordItem[];
  additionalAmountReceivableStatus: string;
  additionalAmountPayableStatus: string;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
}

export interface IPartialPaymentRecordResponse {
  handlingFee: number;
  id: number;
  paidInAdvance: number;
  percentageOfHandlingFee: number;
  percentageOfPaidInAdvance: number;
  percentageOfRegularPayments: number;
  regularPayments: number;
  waybillId: number;
  basicAmountPayable: number;
  deleted: boolean;
  canUpdate: boolean;
}

export interface IOperationLogItem {
  id: number;
  waybillId: number;
  description: string;
  createdAt: string;
}

export interface ILatLngFillItem {
  vid: string;
  padId: number;
  sadId: number;
  tadId: number;
  address: string;
}

export interface ILatLngFillPayload {
  latLngList: ILatLngFillItem[];
}

export interface ILatLngFillResultItem {
  vid: string;
  padId: number;
  sadId: number;
  tadId: number;
  address: string;
  lat: number;
  lng: number;
  mateSuccess: boolean;
}

export interface IRouteByCodeRes {
  destination: IRouteOriginAndDestinationListItem;
  origin: IRouteOriginAndDestinationListItem;
  waypoint: IWaypointListItem;
  routeId?: number;
}

export interface IQuickDispatchParams {
  projectId: number;
  positionTime: string;
  destinationTime: string;
  routeCode: string;
  originPad: number;
  originSad: number;
  originTad: number;
  originAddress: string;
  originLat: number;
  originLng: number;
  destinationPad: number;
  destinationSad: number;
  destinationTad: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  mapJsonStr: string;
  distance: number;
  duration: number;
  externalCode?: string;
}

export interface IWaybillRouteAddressReplacePayload {
  waybillId: number;
  selectedOrigins: IRouteOriginAndDestinationListItem[];
  selectedDestinations: IRouteOriginAndDestinationListItem[];
}

export interface IWaybillRouteAddressCheckRes {
  matched: boolean;
  toAdd: boolean;
}

export interface ICustomerCodeDtoItem {
  id?: number;
  podNumberTypeId: number;
  podNumber: string;
}

export interface IWaybillEditCustomerCodeListParams {
  projectId: number;
  waybillId: number;
  podNumberDtos: ICustomerCodeDtoItem[];
}
export interface IListWaybillBatchCreateStatus {
  importStatus: 'Importing' | 'Success' | 'Failure' | 'Initialization';
  importNumber: number;
  importTime: string;
}

export interface IRequireTruckListItem {
  id: number;
  name: string;
  deleted: string;
  country: number;
}

export interface IWaybillAutomationResult {
  startErrorNum: number;
  cancelErrorNum: number;
  confirmVerificationErrorNum: number;
  startSuccessNum: number;
  cancelSuccessNum: number;
  confirmVerificationSuccessNum: number;
  resultCancelDate: string;
  resultStartDate: string;
  confirmVerificationDate: string;
  confirmDeliveryErrorNum: number;
  confirmDeliverySuccessNum: number;
  confirmDeliveryDate: string;
  updateErrorNum: number;
  updateSuccessNum: number;
  updateDate: string;
}
export interface IListPodNumberTypeItem {
  id: number;
  name: string;
}

export interface ICustomerCodeTypeListItem {
  customerCodeTypeId: number;
  customerCodeTypeName: string;
}

export interface ICustomerCodeListItem {
  id?: number;
  customerCodeTypeId: number;
  customerCodeTypeName?: string;
  number?: string;
  required?: boolean;
}

export interface ICustomerCodeUpdate {
  waybillId: number;
  customerCodeList: ICustomerCodeListItem[];
}

export interface IListPodNumberType {
  id: number;
  name: string;
}

export interface IWaybillRejectParams {
  id: number;
  reason: string;
  financialStatusEnum?: string;
}

export interface IExceptionListItem {
  id?: any;
  waybillId?: number;
  objectType?: string;
  symbol?: string;
  item: string;
  amount: number | undefined;
  // source: string | undefined;
}

export interface IExceptionListData {
  waybillId: number;
  customerExceptionFeeList: IExceptionListItem[];
  vendorExceptionFeeList: IExceptionListItem[];
  exceptionFeeReceivableStatus: string;
  exceptionFeePayableStatus: string;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
}

export interface IWaybillFilterItem {
  id: number;
  name: string;
  content: string;
  createdAt: string;
}

export interface ISettlementData {
  objectType?: string;
  enableTotalSettlement: boolean;
  enableBasicAmountSettlement: boolean;
  enableAdditionalChargeSettlement: boolean;
  enableExceptionFeeSettlement: boolean;
  id?: number;
  waybillId?: number;
}

export interface ILatestExportRecord {
  id: number;
  status: DownLoadStatusEnum;
  fileName: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export interface IWaybillListPodNumberList {
  waybillId: number;
  podNumberVoList: {
    podNumberId: number;
    podNumberType: string;
    podNumber: string;
  }[];
}

export interface IWaybillBillingClaimDataItem {
  ticketType: EnumClaimTicketType;
  claimType: EnumExternalClaimsType | EnumInternalClaimsType;
  amount: number;
}

export interface IWaybillBillingClaimData {
  waybillId: number;
  customerClaimList: IWaybillBillingClaimDataItem[];
  vendorClaimList: IWaybillBillingClaimDataItem[];
  customerClaimTotalAmount: number;
  vendorClaimTotalAmount: number;
}

export interface IWaybillBillingBasicData {
  basicAmountReceivable: number;
  basicAmountPayable: number;
  paidInAdvance: number;
  basicAmountPayableRemaining: number;
  basicAmountReceivableStatus: WaybillBillingBasicStatusEnum;
  paidInAdvanceStatus: WaybillBillingBasicStatusEnum;
  basicAmountPayableRemainingStatus: WaybillBillingBasicStatusEnum;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
}

export interface IWaybillLinkStatementData {
  statementId: number;
  statementNumber: string;
  settledItemList: string[];
  statementType: string;
}

export interface IWaybillClaimLinkStatementData {
  ticketId: number;
  ticketType: EnumClaimTicketType;
  ticketNumber: string;
  arStatementId: number;
  arStatementNumber: string;
  apStatementId: number;
  apStatementNumber: string;
}

export interface IWaybillLinkedTicketItem {
  ticketId: number;
  ticketType: EnumClaimTicketType;
  ticketNumber: string;
}

export interface IWaybillPodEditReq {
  projectId: number;
  waybillId: number;
  waybillPodId: number;
  podType: string;
  materialIds?: number[];
  description?: string;
}

export interface IWaybillPodAddReq {
  projectId: number;
  waybillId: number;
  podType: string;
  materialIds?: number[];
  description?: string;
}

export interface IWaybillBillingClaimOptions {
  customerClaimItemList: string[];
  vendorClaimItemList: string[];
}

export interface IWaybillRevCostExportParams {
  unloadingCompletionTimeStart: string;
  unloadingCompletionTimeEnd: string;
  deliveredTimeStart: string;
  deliveredTimeEnd: string;
}

export interface IWaybillBatchFailedDetailItem {
  waybillNumber: string;
  waybillId: number;
  failedReason: string;
}

export interface IWaybillBatchSubmitOrStartResult {
  inProcessing: boolean;
  totalNum: number;
  successNum: number;
  failedNum: number;
  failedDetailList: IWaybillBatchFailedDetailItem[];
}

export interface IWaybillBatchGoogleDriveLink {
  batchUpdateUrl: string;
  updateCompleteTime: string;
  batchCancelUrl: string;
  cancelCompleteTime: string;
  batchAbnormalUrl: string;
  abnormalCompleteTime: string;
  cancelProcessing: boolean;
  abnormalProcessing: boolean;
  updateProcessing: boolean;
}

export interface IWaybillBatchUpdateOrCancelOrAbnormalResult {
  inProcessing: boolean;
  completionTime: string;
}

export interface IWaybillReimbursementOptions {
  customerItemList: string[];
  vendorItemList: string[];
}

export interface IWaybillReimbursementDataItem {
  id?: number | string;
  waybillId?: number;
  objectType?: string;
  item: string;
  amount?: number;
  symbol?: string;
}

export interface IWaybillReimbursementData {
  waybillId: number;
  customerReimbExpenseList: IWaybillReimbursementDataItem[];
  vendorReimbExpenseList: IWaybillReimbursementDataItem[];
  reimbExpenseReceivableStatus: string;
  reimbExpensePayableStatus: string;
  customerCanUpdate: boolean;
  vendorCanUpdate: boolean;
  reimbExpenseReceivable?: number;
  reimbExpensePayable?: number;
}
