import {
  BUEnum,
  ContractStatusEnum,
  CurrentRequirementEnum,
  FinancialStatusEnum,
  LibraryDetailPricingStatusEnum,
  LibrarySyncFromStatusEnum,
  LogisticsCategoryEnum,
  MemberTypeEnum,
  PotentialVolumeFrequencyEnum,
  ProjectStatusEnum,
  RequirementFrequencyEnum,
  RequirementTypeEnum,
  RouteBillingModeEnum,
  SubtaskConfigurationTimeEnum,
  TransportationStatusEnum,
} from '@/enums';

export interface IProjectListPayload {
  pageNum?: number;
  pageSize?: number;
  projectName?: string;
  customerName?: string;
  customerTag?: string;
  projectStatus?: ProjectStatusEnum;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface IProjectRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  projectName: string;
  customerId: number;
  projectStatus: ProjectStatusEnum;
  transportationStatus: TransportationStatusEnum;
  financialStatus: FinancialStatusEnum;
  hasCapacityPool: boolean;
  commodity: string;
  daysForPod: number;
  routeLibraryId: number;
  agreedStartTime: string;
  agreedEndTime: string;
  completedTime: string;
  customerName: string;
  customerTag: string;
  confirmationWindow: number;
  customerLatestVerEndDate: string;
  customerLatestVerStartDate: string;
  logisticsCategory: LogisticsCategoryEnum;
  logisticsFlow: string;
  serviceCategory: string;
  distance: string;
  bu: BUEnum;
  buList: BUEnum[];
  currentRequirementList: CurrentRequirementEnum[];
  requirementType: RequirementTypeEnum;
  potentialVolumeQuantity: number;
  potentialVolumeFrequency: PotentialVolumeFrequencyEnum;
  requirementFrequency: RequirementFrequencyEnum;
  serviceTruck: string[];
  creditTerms: number;
}

export interface IProjectAddPayload {
  projectName: string;
  customerId: number;
  commodity: string;
  daysForPod: number;
  agreedStartTime: string;
  agreedEndTime: string;
  confirmationWindow: number;
  logisticsCategory: LogisticsCategoryEnum;
  serviceCategory: string;
  logisticsFlow: string;
  distance: string;
}

export interface IProjectUpdatePayload {
  id: number;
  projectName: string;
  customerId: number;
  commodity: string;
  daysForPod: number;
  agreedStartTime: string;
  agreedEndTime: string;
  confirmationWindow: number;
  logisticsCategory: LogisticsCategoryEnum;
  serviceCategory: string;
  logisticsFlow: string;
  distance: string;
}

export interface IProjectLogRecord {
  id: number;
  projectId: number;
  describe: string;
  createdAt: string;
  createdBy: number;
  updatedBy: number;
  updatedAt: string;
}

export interface IProjectTeamRecord {
  id: number;
  userRoleId: number;
  memberType: MemberTypeEnum;
  roleName: string;
  departmentName: string;
  memberTypeStr: string;
  aliasName: string;
  managerAliasName: string;
  managerRoleId: number;
}
export interface IProjectTeamManager {
  managerRoleId: number;
  managerAliasName: string;
  departmentId: number;
  departmentName: string;
}

export interface IBusinessDocumentMaterialItem {
  fileBusinessDocumentId: number;
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
}

export interface IBusinessDocumentCategoryItem {
  accreditationMaterialList: any;
  categoryBusinessDocumentId: number;
  categoryMaterialId: number;
  fileCategory: string;
  defaultCategory: 0 | 1;
  businessDocumentMaterialList: IBusinessDocumentMaterialItem[];
}

export interface IBusinessDocumentsData {
  id: number;
  businessDocumentCategoryList: IBusinessDocumentCategoryItem[];
}

export interface IAddBusinessDocumentsCategory {
  id: number;
  fileCategory: string;
}

export interface IDeleteBusinessDocumentsCategory {
  id: number;
  categoryBusinessDocumentId: number;
  fileCategory: string;
  defaultCategory: 0 | 1;
  deletedFileIdList: number[];
}

export interface IDeleteBusinessDocumentsMaterial {
  id: number;
  fileBusinessDocumentId: number;
  fileMaterialId: number;
  defaultCategory: 0 | 1;
}

export interface IAssignUserItem {
  userRoleId: number;
  aliasName: string;
  roleName: string;
  choice: boolean;
  departmentName: string;
  managerRoleId?: number;
}

export interface IVersionTabListItem {
  versionName: string;
  quotationToCustomer: string[];
  quotationFromVendor: string[];
  columnList: any[];
}

export interface IRouteLibraryListParams {
  pageNum?: number;
  pageSize?: number;
  current?: number;
  libraryId?: number;
  projectId?: number;
  billingMode?: RouteBillingModeEnum;
  pricerName?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface IRouteLibraryListItem {
  id: number;
  libraryName: string;
  projectId: number;
  projectName: string;
  customerName: string;
  customerTag: string;
  billingMode: RouteBillingModeEnum;
  multipleRoute: string;
  mileageCalculation: string;
  customerTaxMark: string;
  vendorTaxMark: string;
  pricerName: string;
  createdAt: string;
  activeRouteNum: number;
  activeCustomerVersionNum: number;
  activeVendaVersionNum: number;
  totalCustomerVersionNum: number;
  totalVendaVersionNum: number;
}

export interface IRouteLibraryAddParams {
  id?: number;
  libraryName?: string;
  projectId?: number;
  projectName?: string;
  billingMode: string;
  multipleRoute: string;
  mileageCalculation: string | null;
  customerTaxMark?: string;
  customerTaxType?: string;
  taxMark?: string;
  bindingProject?: {
    id: number;
    name: string;
  };
}

export interface IRouteLibraryDetail {
  id: number;
  libraryName: string;
  projectId: number;
  projectName: string;
  projectStatus: string;
  customerName: string;
  customerTag: string;
  billingMode: string;
  multipleRoute: string;
  mileageCalculation: string;
  customerTaxMark: string;
  taxMark: string;
  pricerName: string;
  createdAt: string;
  sheetEnable: boolean;
  spreadsheetId: string;
}

export interface ILibraryRouteListParams {
  current?: number;
  pageNum: number;
  pageSize: number;
  id?: number;
  projectId?: number;
  originPad?: number;
  originSad?: number;
  originTad?: number;
  originLabel?: string;
  wayPoint?: string;
  destinationPad?: number;
  destinationSad?: number;
  destinationTad?: number;
  destinationLabel?: string;
  routeId?: number;
  status?: string;
}

export interface ILibraryRouteListItem {
  id: number;
  originPad: number;
  originPadName: string;
  originSad: number;
  originSadName: string;
  originTad: number;
  originTadName: string;
  origin: string;
  originAddress: string;
  originLng: number;
  originLat: number;
  wayPoint: string;
  destinationPad: number;
  destinationPadName: string;
  destinationSad: number;
  destinationSadName: string;
  destinationTad: number;
  destinationTadName: string;
  destination: string;
  destinationAddress: string;
  destinationLng: number;
  destinationLat: number;
  routeCode: string;
  status: string;
  originLabel: string;
  destinationLabel: string;
}

export interface IAddChangeLibraryRouteParams {
  id?: number;
  routeLibraryId?: number;
  originPad: number;
  originSad: number;
  originTad: number;
  originLabel: string;
  originAddress: string;
  originLng: number;
  originLat: number;
  wayPoint: string;
  destinationPad: number;
  destinationSad: number;
  destinationTad: number;
  destinationAddress: string;
  destinationLng: number;
  destinationLat: number;
  destinationLabel: string;
  routeCode: string;
}

export interface IAddTruckRangeParamsItem {
  startingMileage: number;
  endingMileage: number;
}

export interface IAddTruckRangeParams {
  routeLibraryId: number;
  fixedStartingPrice: number;
  range: IAddTruckRangeParamsItem[];
}

export interface IAddRouteBillingVersion {
  id?: number;
  routeLibraryId?: number;
  quotationFromVendor?: string[];
  quotationToCustomer?: string[];
  quotationCustomerStart: string;
  quotationCustomerEnd: string;
  quotationVendorStart: string;
  quotationVendorEnd: string;
  fuelBasis?: number;
}

export interface IRouteVersionListItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  versionName: string;
  totalNum: number;
  columnList: any[];
  dataSource: any[];
  routeLibraryId: number;
  quotationCustomerStart: string;
  quotationCustomerEnd: string;
  quotationVendorStart: string;
  quotationVendorEnd: string;
  fuelBasis: number;
  deleted: string;
}

export interface IRoutePriceVersionListItem {
  id: number;
  quotationStart?: string;
  quotationEnd?: string;
  fuelBasis?: number;

  versionName: string;
  totalNum: number;
  columnList: any[];
  dataSource: any[];
  status?: string;
  // routeLibraryId: number;
}

export interface ITypeAndRangeItem {
  id: number;
  name: string;
}

export interface ITypeAndRangeData {
  ranges: ITypeAndRangeItem[];
  truckTypes: ITypeAndRangeItem[];
}

export interface IPriveVendorListItem {
  id: number;
  name: string;
}

export interface IPriceSettingData {
  id: number;
  strongValidityPeriodLimit: boolean;
}

export interface IPriveVendorListItemV {
  value: number;
  label: string;
}

export interface IBillingStandardListParams {
  id: number;
  pageNum: number;
  pageSize: number;
  originPad?: 0;
  originSad?: 0;
  originTad?: 0;
  originLabel?: string;
  wayPoint?: string;
  destinationPad?: 0;
  destinationSad?: 0;
  destinationTad?: 0;
  destinationLabel?: string;
  vendorId?: number;
  customerOrVendor?: boolean;
  routeCode?: string;
}

export interface IAddBillingStandardDataParams {
  routeId: number;
  routeLibraryBillingVersionId: number;
  routeLibraryTruckTypeId: number;
  routeMileageRangeId: number | null;
  customerPrice?: number;
  vendorPrice?: number;
  customerOrVendor: boolean;
  price: number;
}

export interface IManageSheetData {
  spreadsheetUrlPrefix: string;
  spreadsheetId: string;
  spreadsheetUrlSuffix: string;
}

export interface IManageStatusData {
  routeLibraryId: number;
  manageSheetStatus: string;
  spreadsheetUrl: string;
}

export interface ISyncFromStatusData {
  routeLibraryId: number;
  syncFromSheetStatus: LibrarySyncFromStatusEnum;
}

export interface AdditionSettingItem {
  id?: number | string;
  projectId?: number;
  day?: number | string;
  object: string;
  calculation: string;
  item: string;
}

export interface AdditionSettingRecord {
  projectId?: number | string;
  additionSettingList: AdditionSettingItem[];
}

export interface AddTruckTypeItem {
  id: number;
  name: string;
  type?: string;
}

export interface LibraryTruckTypeItem {
  id: number;
  truckTypeId: number;
  name: string;
}

export interface SyncFromSheetDataItem {
  completeNumber: number;
  correctNumber: number;
  incompleteList: string[];
  incompleteNumber: number;
  incorrectList: string[];
  incorrectNumber: number;
  totalNumber: number;
  version: string;
}

export interface SyncFromSheetData {
  routeLibraryId: number;
  importVersionVoList: SyncFromSheetDataItem[];
}
export interface IStopPointParmas {
  id?: number;
  projectId: number;
  padId: number;
  sadId: number;
  tadId: number;
  address: string;
  lat: number;
  lng: number;
  label: string;
}
export interface IStopPointItem {
  id: number;
  projectId: number;
  padId: number;
  padName: string;
  sadId: number;
  sadName: string;
  tadId: number;
  tadName: string;
  address: string;
  lat: number;
  lng: number;
  label: string;
}

export interface IProjectContractsListPayload {
  pageNum?: number;
  pageSize?: number;
  contractNumber?: string;
  projectId?: number;
  contractType?: string;
  contractSignerId?: number;
  contractStatusList?: ContractStatusEnum[];
}

export interface IPodConfigurationItem {
  id?: string;
  requirementType?: string;
  customizedTypeName?: string;
  skippable?: boolean;
  typeName?: string;
  projectId?: number;
  copyType: string;
  podNumberTypeId?: number | string;
}

export interface IProjectPodConfiguration {
  skippable: boolean;
  customer: IPodConfigurationItem[];
  inteluck: IPodConfigurationItem[];
}

export interface ISubtaskConfigParams {
  processId?: number;
  necessity: boolean;
  time?: number;
  timeType: SubtaskConfigurationTimeEnum;
}

export interface ISubtaskConfigurationItem {
  processTypeId: number;
  processType: string;
  processId: string | number;
  necessity: string | boolean;
  time: string | number;
  timeType: string | SubtaskConfigurationTimeEnum;
}

export interface IProcessNameItem {
  id: number;
  processName: string;
  processStatus: string;
}

export interface ISubtaskConfigProcessTypeItem {
  processTypeId: number;
  processTypeName: string;
  processDefList: IProcessNameItem[];
}

export interface IProjectCustomerCodeTypeItem {
  id: number;
  name: string;
}
export interface IProjectCustomerCodeConfigItem {
  id?: string;
  customerCodeTypeId?: number | string;
  customerCodeTypeName?: string;
  required: boolean | string;
}

export interface IProjectCustomerCodeConfigUpdateParams {
  projectId: number;
  customerCodeConfigList: IProjectCustomerCodeConfigItem[];
}
export interface IBatchPriceUpdate {
  code: number;
  successCount: number;
  failCount: number;
}

export interface IAlarmDashboardTaskListPayload {
  pageNum: number;
  pageSize: number;
  timeoutDurationMin?: number;
  timeoutDurationMax?: number;
  riskLevelMin?: number;
  riskLevelMax?: number;
  firstLoadingCompletionTimeStart?: string;
  firstLoadingCompletionTimeEnd?: string;
  latestUnloadingCompletionTimeStart?: string;
  latestUnloadingCompletionTimeEnd?: string;
  projectIdList?: number[];
  vendorIdList?: number[];
  driverIdList?: number[];
}

export interface IAlarmDashboardTaskListItem {
  id: number;
  waybillId: number;
  countryId: number;
  riskLevel: number;
  timeoutDurationSeconds: number;
  timeoutDurationHours: number;
  estimatedDurationHours: number;
  estimatedDurationSeconds: number;
  usedDurationHours: number;
  waybillNumber: string;
  firstLoadingCompletionTime: string;
  latestUnloadingCompletionTime: string;
  vendorId: number;
  vendorName: string;
  trucks: number;
  driverCount: number;
  driverId: number;
  driverName: string;
  driverContactNumber: string;
  phoneCode: string;
  customerId: number;
  customerName: string;
  projectId: number;
  projectName: string;
}

export interface IAlarmDashboardStatisticsListPayload {
  startTime: string;
  endTime: string;
}

export interface IAlarmDashboardStatisticsListItem {
  userId: number;
  userName: string;
  ranking: number;
  doneCount: number;
}

export interface ILibraryDetailPriceVersionListItem {
  id: number;
  quotationStart: string;
  quotationEnd: string;
  fuelBasis: number;
  contractStatus: LibraryDetailPricingStatusEnum;
  versionName: string;
  contractNumber: string;
}

export interface ILibraryDetailPriceVersionInfo {
  id: number;
  routeLibraryId: number;
  versionName: string;
  contractStatus: string;
  truckTypeNames: string;
  vendorId: number;
  vendorName: string;

  customerId: number;
  customerName: string;
}
