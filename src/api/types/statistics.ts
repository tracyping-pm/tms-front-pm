import { STATISTICS_RANK_OPTION } from '@/constants';
import {
  BUEnum,
  CustomerStatusEnum,
  EnumCapacityStatisticActiveType,
  EnumCountCompareResult,
  EnumCustomerStatisticActiveType,
  EnumProjectStatisticActiveType,
  ProjectStatusEnum,
  VendorStatusEnum,
  VendorTypeEnum,
} from '@/enums';

// Time type for statistics
export type WaybillTimeType = 'unloading' | 'position';

// 对比数据结构
export interface ICompareChangeItem {
  month?: string;
  changeAmount?: number; // 历史值 - 当前值 的差值
  compareAmount?: number; // 历史月份的实际值
  changeNum?: number;
  compareNum?: number;
}

export interface IbusinessStatisticItem {
  waybillCount: number;
  waybillSevenDaysCount: number;
  projectCount: number;
  projectSevenDaysCount: number;
  customerCount: number;
  customerSevenDaysCount: number;
  vendorCount: number;
  vendorSevenDaysCount: number;
}

export interface ISummaryData {
  summaryTripNumbers: number[];
  confirmedTripNumbers: number[];
  unconfirmedTripNumbers: number[];
  summaryIncome: number[];
  confirmedIncome: number[];
  unconfirmedIncome: number[];
  summarySpending: number[];
  confirmedSpending: number[];
  unconfirmedSpending: number[];
  summaryGp: number[];
  confirmedGp: number[];
  unconfirmedGp: number[];
  summaryIncomePerTrip: number[];
  summarySpendingPerTrip: number[];
  summaryGPPerTrip: number[];
  summaryGrossMargin: string[];
  xaxis: string[];
}

export interface ISummaryTableData {
  summaryTripNumbers: number;
  confirmedTripNumbers: number;
  unconfirmedTripNumbers: number;
  summaryIncome: number;
  confirmedIncome: number;
  unconfirmedIncome: number;
  summarySpending: number;
  confirmedSpending: number;
  unconfirmedSpending: number;
  summaryGp: number;
  confirmedGp: number;
  unconfirmedGp: number;
  summaryIncomePerTrip: number;
  summarySpendingPerTrip: number;
  summaryGPPerTrip: number;
  summaryGrossMargin: string;
  xaxis: string;
}

export interface IRankItem {
  id: number;
  name: string;
  summaryTripNumbers: number;
  summaryYearlyIncome: number;
  summaryYearlySpending: number;
  getSummaryYearlyGP: number;
}

export interface IPerformanceComparisonResp {
  tripNum: number[];
  summaryIncome: number[];
  summarySpending: number[];
  summaryGP: number[];
  grossMargin: number[];
  summaryIncomePerTrip: number[];
  summarySpendingPerTrip: number[];
  summaryGPPerTrip: number[];
  xaxis: string[];
}

export interface ILeadsPersonItem {
  userRoleId: number;
  userId: number;
  userName: string;
  aliasName: string;
  email: string;
  slackMemberId: string;
  colorId: number;
  roleId: number;
  roleName: string;
  departmentId: number;
  departmentName: string;
  buType: string;
  regionId: number;
  regionName: string;
  deleted: true;
}

export interface ICrmStatisticGlobalFilter {
  bu?: BUEnum;
  bdUserRoleIds?: number[];
  minCreatedAt?: string;
  maxCreatedAt?: string;
  rankedBy?: STATISTICS_RANK_OPTION;
}

export interface ICrmStatisticTrackingItem {
  pic: string;
  picUserRoleId: number;
  leadCreation: number;
  opportunityCreation: number;
  totalClosed: number;
  prevCreatedCurrClosed: number;
  currPeriodCreatedAndClosed: number;
}

export interface ICrmStatisticTrackingChart {
  pic: string[];
  opportunityCreation: number[];
  prevCreatedCurrClosed: number[];
  currPeriodCreatedAndClosed: number[];
}

export interface ICrmStatisticVolumeDataItem {
  pic: string;
  opportunityCount: number;
  creationCount: number;
  reachOutCount: number;
  successfulContactedCount: number;
  quotationRequestReceivedCount: number;
  quotationSubmittedCount: number;
  successClosedCount: number;
  lostCount: number;
  canceledCount: number;
}

export interface ICrmStatisticVolume {
  x: string[];
  creationCount: number[];
  reachOut: number[];
  successfulContacted: number[];
  quotationRequestReceived: number[];
  quotationSubmitted: number[];
  successClosed: number[];
  lost: number[];
  canceled: number[];
}
export interface IBookingSummaryRecord {
  mouthDate: string;
  avgDelivered: number;
  delivered: number;
  avgCommitted: number;
  committed: number;
}
export interface IBookingCustomerWaybillParams {
  startDate: string;
  endDate: string;
  customerId?: number;
}
export interface IBookingCustomerWaybillRecord {
  customerId: number;
  customerName: string;
  delivered?: number;
  committed?: number;
}
export interface IBookingTrendsParams {
  customerId: number;
  timeRange: number;
  startDate: string;
  endDate: string;
}
export interface IBookingTrendsByCustomerRecord {
  trendsVo: {
    mouthDate: string;
    delivered: number;
    committed: number;
  }[];
  customerId: number;
  customerStatus: CustomerStatusEnum;
  customerName: string;
  bdPic: string;
  camPic: string;
  projectNum: number;
  committedWaybill: number;
  deliveredWaybill: number;
  completionRate: number;
}
export interface IBookingProjectTrendsByCustomerRecord {
  trendsVo: {
    mouthDate: string;
    delivered: number;
    committed: number;
  }[];
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
}
export interface IBookingProjectTrendsComparisonRecord {
  mouthDate: string;
  trendsVo: {
    projectId: number;
    projectName: string;
    delivered: number;
    committed: number;
  }[];
}
export interface IBookingGetAllCustomerRecord {
  customerId: number;
  customerName: string;
  delivered: number;
  committed: number;
}
export interface ICustomerAnalysisSummaryRecord {
  totalRevenue: number;
  revenueDifference: number;
  revenueRate: number;
  totalCost: number;
  costDifference: number;
  costRate: number;
  grossProfit: number;
  grossProfitDifference: number;
  grossProfitRate: number;
  grossMargin: number;
  grossMarginDifference: number;
  grossMarginRate: number;
  activeCustomers: number;
  activeCustomersDifference: number;
  activeCustomersRate: number;
  activeProjects: number;
  activeProjectsDifference: number;
  activeProjectsRate: number;
}
export interface ICustomerAnalysisBusinessMonitorParams {
  startDate: string;
  endDate: string;
  bu?: BUEnum;
  waybillTimeType: WaybillTimeType;
}
export interface ICustomerAnalysisBusinessMonitorRecord {
  month: string;
  waybillNum: number;
  avgWaybillNum: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
}
export interface IActiveStaticParams {
  startDate: string;
  endDate: string;
  waybillTimeType: WaybillTimeType;
}
export interface IActiveCustomerStaticRecord {
  mouthDate: string;
  totalActiveCustomer: number;
  existingActiveCustomer: number;
  existingReactiveCustomer: number;
  lostCustomer: number;
  newCustomer: number;
}
export interface IActiveCustomerListParams {
  startDate: string;
  endDate: string;
  customerActiveType: EnumCustomerStatisticActiveType;
  customerId?: number;
  waybillTimeType: WaybillTimeType;
}
export interface IActiveCustomerListRecord {
  customerId: number;
  customerName: string;
  bdUserRoleId: number;
  bdName: string;
  camUserRoleId: number;
  camName: string;
  waybillNum: number;
  avgWaybillNum: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
}
export interface IActiveProjectStaticRecord {
  mouthDate: string;
  totalActiveProject: number;
  existingActiveProject: number;
  existingReactiveProject: number;
  lostProject: number;
  newProject: number;
}
export interface IActiveProjectListParams {
  startDate: string;
  endDate: string;
  projectActiveType: EnumProjectStatisticActiveType;
  projectId?: number;
  waybillTimeType: WaybillTimeType;
}
export interface IActiveProjectListRecord {
  projectId: number;
  projectName: string;
  waybillNum: number;
  avgWaybillNum: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
}
export interface ICustomerAnalysisParams {
  startDate: string;
  endDate: string;
  customerId?: number;
  customerName?: string;
  waybillTimeType: WaybillTimeType;
  compareMonth?: number; // 1-12，表示过去N月
}
export interface ICustomerAnalysisContrastParams {
  contrastMonths: string[];
  yearMonth: string;
  customerId: number;
  waybillTimeType: WaybillTimeType;
}
export interface ICustomerRevenueRecord {
  customerName: string;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}
export interface ICustomerAnalysisListRecord {
  customerId: number;
  customerName: string;
  bdName: string;
  camName: string;
  waybillIds: string;
  projectNum: number;
  waybillNum: number;
  waybillNumChange: number;
  avgWaybillNum: number;
  avgWaybillNumChange: number;
  cost: number;
  revenue: number;
  revenueChange: number;
  revenueCompareResult: EnumCountCompareResult;
  grossProfit: number;
  grossProfitChange: number;
  gpCompareResult: EnumCountCompareResult;
  grossMargin: number;
  grossMarginChange: number;
  gmCompareResult: EnumCountCompareResult;
  // 历史月份对比数据（列表结构）
  waybillNumCompareChangeList?: ICompareChangeItem[];
  avgWaybillNumCompareChangeList?: ICompareChangeItem[];
  revenueCompareChangeList?: ICompareChangeItem[];
  gpCompareChangeList?: ICompareChangeItem[];
  gmCompareChangeList?: ICompareChangeItem[];
}
export interface IProjectRevenueRecord {
  projectName: string;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IProjectAnalysisParams {
  startDate: string;
  endDate: string;
  projectId?: number;
  waybillTimeType: WaybillTimeType;
  compareMonth?: number; // 1-12，表示过去N月
}
export interface IProjectAnalysisAnnualRevenueStatisticsRecord {
  month: string;
  waybillNum: number;
  avgWaybillNum: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IProjectAnalysisContrastParams {
  contrastMonths: string[];
  yearMonth: string;
  projectId: number;
  waybillTimeType: WaybillTimeType;
}

export interface IVoListRecord {
  projectId: number;
  yearMonth: string;
  waybillNum: number;
  waybillNumDifference: number;
  waybillCompareResult: EnumCountCompareResult;
  revenue: number;
  revenueDifference: number;
  revenueCompareResult: EnumCountCompareResult;
  cost: number;
  costDifference: number;
  costCompareResult: EnumCountCompareResult;
  grossProfit: number;
  grossProfitDifference: number;
  grossProfitCompareResult: EnumCountCompareResult;
  grossMargin: number;
  grossMarginDifference: number;
  grossMarginCompareResult: EnumCountCompareResult;
}
export interface IProjectAnalysisAnnualRevenueContrastRecord {
  yearMonth: string;
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
  // waybillNum: number;
  // revenue: number;
  // cost: number;
  // grossProfit: number;
  // grossMargin: number;
  contrastList: IContrastListItem[];
  baseList: IContrastListItem[];
}

export interface IProjectAnalysisListRecord {
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
  waybillNum: number;
  waybillNumChange: number;
  avgWaybillNum: number;
  avgWaybillNumChange: number;
  cost: number;
  revenue: number;
  revenueChange: number;
  grossProfit: number;
  gpChange: number;
  grossMargin: number;
  gmChange: number;
  // 历史月份对比数据（列表结构）
  waybillNumCompareChangeList?: ICompareChangeItem[];
  avgWaybillNumCompareChangeList?: ICompareChangeItem[];
  revenueCompareChangeList?: ICompareChangeItem[];
  gpCompareChangeList?: ICompareChangeItem[];
  gmCompareChangeList?: ICompareChangeItem[];
}

export interface ICustomerAnalysisByProjectRecord {
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusEnum;
  waybillNum: number;
  avgWaybillNum: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
}
export interface ICustomerAnalysisAnnualRevenueStatisticsRecord {
  month: string;
  waybillNum: number;
  avgWaybillNum: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
}
export interface IContrastListItem {
  customerId?: number;
  projectId?: number;
  yearMonth: string;
  waybillNum: number;
  waybillNumDifference: number;
  waybillCompareResult: EnumCountCompareResult;
  revenue: number;
  revenueDifference: number;
  revenueCompareResult: EnumCountCompareResult;
  cost: number;
  costDifference: number;
  costCompareResult: EnumCountCompareResult;
  grossProfit: number;
  grossProfitDifference: number;
  grossProfitCompareResult: EnumCountCompareResult;
  grossMargin: number;
  grossMarginDifference: number;
  grossMarginCompareResult: EnumCountCompareResult;
}
export interface ICustomerAnalysisAnnualRevenueContrastRecord {
  customerId: number;
  customerName: string;
  customerStatus: CustomerStatusEnum;
  // yearMonth: string;
  // waybillNum: number;
  // revenue: number;
  // cost: number;
  // grossProfit: number;
  // grossMargin: number;
  baseList: IContrastListItem[];
  contrastList: IContrastListItem[];
}

export interface IVendorAnalysisSummaryRecord {
  cost: number;
  costIncrement: number;
  costGrowthRate: number;
  revenue: number;
  revenueIncrement: number;
  revenueGrowthRate: number;
  grossProfit: number;
  grossProfitIncrement: number;
  grossProfitGrowthRate: number;
  grossMargin: number;
  grossMarginIncrement: number;
  grossMarginGrowthRate: number;
  activeVendor: number;
  activeVendorIncrement: number;
  activeVendorGrowthRate: number;
  activeTruck: number;
  activeTruckIncrement: number;
  activeTruckGrowthRate: number;
}

export interface IVendorAnalysisCapacityStatisticPayload {
  year: string;
  waybillTimeType: WaybillTimeType;
}

export interface IVendorAnalysisCapacityStatisticItem {
  yearMonth: string;
  totalActiveVendor: number;
  existingActiveVendor: number;
  existingReactiveVendor: number;
  retentionRate: number;
  lostVendor: number;
  newVendor: number;
}

export interface IVendorAnalysisCapacityStatisticVendorListPayload {
  yearMonth: string;
  activeType: EnumCapacityStatisticActiveType;
  waybillTimeType: WaybillTimeType;
}

export interface IVendorAnalysisCapacityStatisticVendorItem {
  vendorId: number;
  vendorName: string;
  _vendorName: string;
  vendorType: VendorTypeEnum;
  vendorStatus: VendorStatusEnum;
  vendorPicUserRoleId: number;
  vendorPicName: string;
  aging: number;
  selfTruckCount: number;
  totalTruckCount: number;
  waybillCount: number;
  cost: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IVendorAnalysisByVendorPayload {
  yearMonth: string;
  vendorId?: number;
  picUserId?: number;
  bu?: BUEnum;
  waybillTimeType: WaybillTimeType;
}
export interface IVendorAnalysisByVendorAnnualTrendPayload {
  year: number;
  vendorId: number;
  bu?: BUEnum;
  waybillTimeType: WaybillTimeType;
}
export interface IVendorAnalysisByVendorAnnualTrendItem {
  yearMonth: string;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IVendorAnalysisByVendorItem {
  vendorId: number;
  vendorName: string;
  vendorPicUserRoleId: number;
  vendorPicName: string;
  projectCount: number;
  projectCountCompareResult: EnumCountCompareResult;
  projectCountCompareValue: number;
  waybillCount: number;
  cost: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IVendorAnalysisByVendorProjectListPayload {
  yearMonth: string;
  vendorId: number;
  bu?: BUEnum;
  waybillTimeType: WaybillTimeType;
}

export interface IVendorAnalysisByVendorProjectItem {
  projectId: number;
  projectName: string;
  customerName: string;
  aging: number;
  truckCount: number;
  waybillCount: number;
  cost: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IVendorAnalysisByProjectPayload {
  yearMonth: string;
  projectId?: number;
  waybillTimeType: WaybillTimeType;
  comparisonPeriod?: number;
}

export interface IVendorAnalysisByProjectItem {
  projectId: number;
  projectName: string;
  vendorCount: number;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  revenueChange: number;
  grossProfit: number;
  grossMargin: number;
  gpChange: number;
  gmChange: number;
  // 历史月份对比数据（列表结构）
  revenueCompareChangeList?: ICompareChangeItem[];
  gpCompareChangeList?: ICompareChangeItem[];
  gmCompareChangeList?: ICompareChangeItem[];
}

export interface IVendorAnalysisByProjectVendorItem {
  vendorId: number;
  vendorName: string;
  vendorType: VendorTypeEnum;
  vendorPicUserRoleId: number;
  vendorPicName: string;
  firstDeliveryDate: string;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  revenueChange: number;
  grossProfit: number;
  grossMargin: number;
  gpChange: number;
  gmChange: number;
  // 历史月份对比数据（列表结构）
  revenueCompareChangeList?: ICompareChangeItem[];
  gpCompareChangeList?: ICompareChangeItem[];
  gmCompareChangeList?: ICompareChangeItem[];
}

export interface IVendorAnalysisByProjectVendorAnnualTrendPayload {
  year: number;
  projectId: number;
  vendorId: number;
  waybillTimeType: WaybillTimeType;
}

export interface IVendorAnalysisByProjectVendorAnnualTrendItem {
  yearMonth: string;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface IVendorAnalysisByCustomerPayload {
  yearMonth: string;
  customerId?: number;
  vendorId?: number;
  waybillTimeType: WaybillTimeType;
  comparisonPeriod?: number;
}

export interface IVendorAnalysisByCustomerItem {
  customerId: number;
  customerName: string;
  vendorCount: number;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  revenueChange: number;
  grossProfit: number;
  grossMargin: number;
  gpChange: number;
  gmChange: number;
  // 历史月份对比数据（列表结构）
  revenueCompareChangeList?: ICompareChangeItem[];
  gpCompareChangeList?: ICompareChangeItem[];
  gmCompareChangeList?: ICompareChangeItem[];
}

export interface IVendorAnalysisByCustomerVendorItem {
  vendorId: number;
  vendorName: string;
  vendorType: VendorTypeEnum;
  vendorPicUserRoleId: number;
  vendorPicName: string;
  firstDeliveryDate: string;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  revenueChange: number;
  grossProfit: number;
  grossMargin: number;
  gpChange: number;
  gmChange: number;
  // 历史月份对比数据（列表结构）
  revenueCompareChangeList?: ICompareChangeItem[];
  gpCompareChangeList?: ICompareChangeItem[];
  gmCompareChangeList?: ICompareChangeItem[];
}

export interface IVendorAnalysisByCustomerVendorAnnualTrendPayload {
  year: number;
  customerId: number;
  vendorId: number;
  waybillTimeType: WaybillTimeType;
}

export interface IVendorAnalysisByCustomerVendorAnnualTrendItem {
  yearMonth: string;
  waybillCount: number;
  truckCount: number;
  cost: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface ISalesCustomerRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  name: string;
  totalPurchaseNum: number;
  totalPurchaseAmount: number;
  lastPurchaseDate: string;
  lat: number;
  lng: number;
  address: string;
  picName: string;
}

export interface IVendorAnalysisComparePayload {
  projectId?: number;
  customerId?: number;
  vendorId: number;
  yearMonth: string;
  contrastMonths: string[];
  bu?: BUEnum;
  waybillTimeType: WaybillTimeType;
}

export interface IVendorAnalysisCompareRecord {
  yearMonth: string;
  vendorId: number;
  vendorName: string;
  vendorStatus: VendorStatusEnum;
  contrastList: IVendorContrastListItem[];
  baseList: IVendorContrastListItem[];
}

export interface IVendorContrastListItem {
  customerId?: number;
  projectId?: number;
  yearMonth: string;
  waybillCount: number;
  waybillCountDifference: number;
  waybillCompareResult: EnumCountCompareResult;
  truckCount: number;
  truckCountDifference: number;
  truckCompareResult: EnumCountCompareResult;
  revenue: number;
  revenueDifference: number;
  revenueCompareResult: EnumCountCompareResult;
  cost: number;
  costDifference: number;
  costCompareResult: EnumCountCompareResult;
  grossProfit: number;
  grossProfitDifference: number;
  grossProfitCompareResult: EnumCountCompareResult;
  grossMargin: number;
  grossMarginDifference: number;
  grossMarginCompareResult: EnumCountCompareResult;
}
