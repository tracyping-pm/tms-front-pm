import { request } from '@umijs/max';

import { LatestTimeData, SummaryGroupByDate } from '@/enums';
import { RequestPromise } from './types/common';
import {
  IActiveCustomerListParams,
  IActiveCustomerListRecord,
  IActiveCustomerStaticRecord,
  IActiveProjectListParams,
  IActiveProjectListRecord,
  IActiveProjectStaticRecord,
  IActiveStaticParams,
  IBookingCustomerWaybillParams,
  IBookingCustomerWaybillRecord,
  IBookingGetAllCustomerRecord,
  IBookingProjectTrendsByCustomerRecord,
  IBookingProjectTrendsComparisonRecord,
  IBookingSummaryRecord,
  IBookingTrendsByCustomerRecord,
  IBookingTrendsParams,
  ICrmStatisticGlobalFilter,
  ICrmStatisticTrackingChart,
  ICrmStatisticTrackingItem,
  ICrmStatisticVolume,
  ICrmStatisticVolumeDataItem,
  ICustomerAnalysisAnnualRevenueContrastRecord,
  ICustomerAnalysisAnnualRevenueStatisticsRecord,
  ICustomerAnalysisBusinessMonitorParams,
  ICustomerAnalysisBusinessMonitorRecord,
  ICustomerAnalysisByProjectRecord,
  ICustomerAnalysisContrastParams,
  ICustomerAnalysisListRecord,
  ICustomerAnalysisParams,
  ICustomerAnalysisSummaryRecord,
  ICustomerRevenueRecord,
  ILeadsPersonItem,
  IPerformanceComparisonResp,
  IProjectAnalysisAnnualRevenueContrastRecord,
  IProjectAnalysisAnnualRevenueStatisticsRecord,
  IProjectAnalysisContrastParams,
  IProjectAnalysisListRecord,
  IProjectAnalysisParams,
  IProjectRevenueRecord,
  IRankItem,
  ISalesCustomerRecord,
  ISummaryData,
  IVendorAnalysisByCustomerItem,
  IVendorAnalysisByCustomerPayload,
  IVendorAnalysisByCustomerVendorAnnualTrendItem,
  IVendorAnalysisByCustomerVendorAnnualTrendPayload,
  IVendorAnalysisByCustomerVendorItem,
  IVendorAnalysisByProjectItem,
  IVendorAnalysisByProjectPayload,
  IVendorAnalysisByProjectVendorAnnualTrendItem,
  IVendorAnalysisByProjectVendorAnnualTrendPayload,
  IVendorAnalysisByProjectVendorItem,
  IVendorAnalysisByVendorAnnualTrendItem,
  IVendorAnalysisByVendorAnnualTrendPayload,
  IVendorAnalysisByVendorItem,
  IVendorAnalysisByVendorPayload,
  IVendorAnalysisByVendorProjectItem,
  IVendorAnalysisByVendorProjectListPayload,
  IVendorAnalysisCapacityStatisticItem,
  IVendorAnalysisCapacityStatisticPayload,
  IVendorAnalysisCapacityStatisticVendorItem,
  IVendorAnalysisCapacityStatisticVendorListPayload,
  IVendorAnalysisComparePayload,
  IVendorAnalysisCompareRecord,
  IVendorAnalysisSummaryRecord,
  IbusinessStatisticItem,
  WaybillTimeType,
} from './types/statistics';

export const statisticBusinessStatistic =
  (): RequestPromise<IbusinessStatisticItem> => {
    return request(`/api/statistic/business-statistic`, {
      method: 'post',
    });
  };
export const statisticLastSevenDaysAvg = (params: {
  startDate: string;
  endDate: string;
}): RequestPromise<{
  daysAvg: number[];
  daysDataList: any[];
  xaxis: string[];
}> => {
  return request(`/api/statistic/last-seven-days-avg-trend`, {
    method: 'post',
    data: params,
  });
};

export const getSummaryData = (params: {
  groupBy: SummaryGroupByDate;
  startDate: string;
  endDate: string;
  projectIds?: any[] | undefined;
}): RequestPromise<ISummaryData> => {
  return request(`/api/statistic/data-summary`, {
    method: 'post',
    data: params,
  });
};

export const statisticTopCustomer = (): RequestPromise<IRankItem[]> => {
  return request(`/api/statistic/top-customer`, {
    method: 'post',
  });
};

export const statisticTopProject = (): RequestPromise<IRankItem[]> => {
  return request(`/api/statistic/top-project`, {
    method: 'post',
  });
};

export const statisticPerformanceComparison = (params: {
  statDate: string;
}): RequestPromise<IPerformanceComparisonResp> => {
  return request(`/api/statistic/performance-comparison`, {
    method: 'post',
    data: params,
  });
};

export const statisticNewCustomer = (): RequestPromise<{
  daysIncome: number[][];
  daysDataList: any[];
  xaxis: string[];
}> => {
  return request(`/api/statistic/new-customer`, {
    method: 'post',
  });
};

export const statisticTimeLatest = (): RequestPromise<LatestTimeData> => {
  return request(`/api/statistic/time/latest`, {
    method: 'post',
    data: {},
  });
};

export const summaryDownloadPrepare = (params: {
  groupBy: SummaryGroupByDate;
  startDate: string;
  endDate: string;
  projectIds?: any[] | undefined;
}): RequestPromise<string> => {
  return request(`/api/statistic/data-summary/prepare`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const summaryDownload = (params: {
  spreadsheetId: string;
}): RequestPromise<string> => {
  return request(`/api/statistic/data-summary/download`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const opportunityPerson = (): RequestPromise<ILeadsPersonItem[]> => {
  return request(`/api/crm/statistic/opportunity/funnel/person`, {
    method: 'post',
    data: {},
    timeout: 1000 * 60 * 60,
  });
};

export const crmStatisticTrackingList = (
  params: ICrmStatisticGlobalFilter,
): RequestPromise<ICrmStatisticTrackingItem[]> => {
  return request(`/api/crm/statistic/tracking-list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const crmStatisticTrackingChart = (
  params: ICrmStatisticGlobalFilter,
): RequestPromise<ICrmStatisticTrackingChart> => {
  return request(`/api/crm/statistic/tracking-chart`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

// Followup statistic
export const crmStatisticVolumeData = (
  params: ICrmStatisticGlobalFilter,
): RequestPromise<ICrmStatisticVolumeDataItem[]> => {
  return request(`/api/crm/statistic/volume-data`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const crmStatisticVolume = (
  params: ICrmStatisticGlobalFilter,
): RequestPromise<ICrmStatisticVolume> => {
  return request(`/api/crm/statistic/volume`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const bookingSummary = (
  params: IBookingCustomerWaybillParams,
): RequestPromise<IBookingSummaryRecord[]> => {
  return request(`/api/booking/summary`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const bookingCustomerWaybill = (
  params: IBookingCustomerWaybillParams,
): RequestPromise<IBookingCustomerWaybillRecord[]> => {
  return request(`/api/booking/customer/waybill`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const bookingTrendsByCustomer = (
  params: IBookingTrendsParams,
): RequestPromise<IBookingTrendsByCustomerRecord> => {
  return request(`/api/booking/trends/by-customer`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const bookingProjectTrendsByCustomer = (
  params: IBookingTrendsParams,
): RequestPromise<IBookingProjectTrendsByCustomerRecord[]> => {
  return request(`/api/booking/project/trends/by-customer`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const bookingProjectTrendsComparison = (
  params: IBookingTrendsParams,
): RequestPromise<IBookingProjectTrendsComparisonRecord[]> => {
  return request(`/api/booking/project/trends/comparison`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const bookingGetAllCustomer = (
  params: IBookingCustomerWaybillParams,
): RequestPromise<IBookingGetAllCustomerRecord[]> => {
  return request(`/api/booking/get/all/customer`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const customerAnalysisSummary = (params: {
  waybillTimeType: WaybillTimeType;
}): RequestPromise<ICustomerAnalysisSummaryRecord> => {
  return request(`/api/customer/analysis/summary`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisBusinessMonitor = (
  params: ICustomerAnalysisBusinessMonitorParams,
): RequestPromise<ICustomerAnalysisBusinessMonitorRecord[]> => {
  return request(`/api/customer/analysis/business/monitor`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisActiveCustomerStatic = (
  params: IActiveStaticParams,
): RequestPromise<IActiveCustomerStaticRecord[]> => {
  return request(`/api/customer/analysis/active/customer/static`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisActiveCustomerList = (
  params: IActiveCustomerListParams,
): RequestPromise<IActiveCustomerListRecord[]> => {
  return request(`/api/customer/analysis/active/customer/list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisActiveCustomerListExport = (
  params: IActiveCustomerListParams,
): RequestPromise<null> => {
  return request(`/api/customer/analysis/export/active/customer`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisActiveProjectStatic = (
  params: IActiveStaticParams,
): RequestPromise<IActiveProjectStaticRecord[]> => {
  return request(`/api/customer/analysis/active/project/static`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisActiveProjectList = (
  params: IActiveProjectListParams,
): RequestPromise<IActiveProjectListRecord[]> => {
  return request(`/api/customer/analysis/active/project/list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisActiveProjectListExport = (
  params: IActiveProjectListParams,
): RequestPromise<null> => {
  return request(`/api/customer/analysis/export/active/project`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisRevenueStatic = (
  params: ICustomerAnalysisParams,
): RequestPromise<ICustomerRevenueRecord[]> => {
  return request(`/api/customer/analysis/revenue/static`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisProjectRevenueStatic = (
  params: ICustomerAnalysisParams,
): RequestPromise<IProjectRevenueRecord[]> => {
  return request(`/api/customer/analysis/project/revenue/static`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisList = (
  params: ICustomerAnalysisParams,
): RequestPromise<ICustomerAnalysisListRecord[]> => {
  return request(`/api/customer/analysis/list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisByProjectList = (
  params: ICustomerAnalysisParams,
): RequestPromise<ICustomerAnalysisByProjectRecord[]> => {
  return request(`/api/customer/analysis/by/project`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisAnnualRevenueStatistics = (
  params: ICustomerAnalysisParams,
): RequestPromise<ICustomerAnalysisAnnualRevenueStatisticsRecord[]> => {
  return request(`/api/customer/analysis/annual/revenue/statistics`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const customerAnalysisAnnualRevenueContrast = (
  params: ICustomerAnalysisContrastParams,
): RequestPromise<ICustomerAnalysisAnnualRevenueContrastRecord> => {
  return request(`/api/customer/analysis/annual/revenue/contrast`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const projectAnalysisList = (
  params: ICustomerAnalysisParams,
): RequestPromise<IProjectAnalysisListRecord[]> => {
  return request(`/api/customer/analysis/project/list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const projectAnalysisAnnualRevenueStatistics = (
  params: IProjectAnalysisParams,
): RequestPromise<IProjectAnalysisAnnualRevenueStatisticsRecord[]> => {
  return request(`/api/customer/analysis/project/annual/revenue/statistics`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const projectAnalysisAnnualRevenueContrast = (
  params: IProjectAnalysisContrastParams,
): RequestPromise<IProjectAnalysisAnnualRevenueContrastRecord> => {
  return request(`/api/customer/analysis/project/annual/revenue/contrast`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisSummary = (params: {
  waybillTimeType: WaybillTimeType;
}): RequestPromise<IVendorAnalysisSummaryRecord> => {
  return request(`/api/vendor-analysis/summary`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisCapacityStatistic = (
  params: IVendorAnalysisCapacityStatisticPayload,
): RequestPromise<IVendorAnalysisCapacityStatisticItem[]> => {
  return request(`/api/vendor-analysis/capacity-statistic`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisCapacityStatisticVendorList = (
  params: IVendorAnalysisCapacityStatisticVendorListPayload,
): RequestPromise<IVendorAnalysisCapacityStatisticVendorItem[]> => {
  return request(`/api/vendor-analysis/capacity-statistic/vendor-list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisCapacityStatisticVendorListExport = (
  params: IVendorAnalysisCapacityStatisticVendorListPayload,
): RequestPromise<null> => {
  return request(`/api/vendor-analysis/capacity-statistic/vendor-list/export`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByVendor = (
  params: IVendorAnalysisByVendorPayload,
): RequestPromise<IVendorAnalysisByVendorItem[]> => {
  return request(`/api/vendor-analysis/by-vendor`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const vendorAnalysisByVendorAnnualTrend = (
  params: IVendorAnalysisByVendorAnnualTrendPayload,
): RequestPromise<IVendorAnalysisByVendorAnnualTrendItem[]> => {
  return request(`/api/vendor-analysis/by-vendor/vendor-annual-trend`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByVendorExport = (
  params: IVendorAnalysisByVendorPayload & {
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
  },
): RequestPromise<null> => {
  return request(`/api/vendor-analysis/by-vendor/export`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByVendorProjectList = (
  params: IVendorAnalysisByVendorProjectListPayload,
): RequestPromise<IVendorAnalysisByVendorProjectItem[]> => {
  return request(`/api/vendor-analysis/by-vendor/project-list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByProject = (
  params: IVendorAnalysisByProjectPayload,
): RequestPromise<IVendorAnalysisByProjectItem[]> => {
  return request(`/api/vendor-analysis/by-project`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByProjectVendorList = (
  params: IVendorAnalysisByProjectPayload,
): RequestPromise<IVendorAnalysisByProjectVendorItem[]> => {
  return request(`/api/vendor-analysis/by-project/vendor-list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByProjectVendorAnnualTrend = (
  params: IVendorAnalysisByProjectVendorAnnualTrendPayload,
): RequestPromise<IVendorAnalysisByProjectVendorAnnualTrendItem[]> => {
  return request(`/api/vendor-analysis/by-project/vendor-annual-trend`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByCustomer = (
  params: IVendorAnalysisByCustomerPayload,
): RequestPromise<IVendorAnalysisByCustomerItem[]> => {
  return request(`/api/vendor-analysis/by-customer`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByCustomerVendorList = (
  params: IVendorAnalysisByCustomerPayload,
): RequestPromise<IVendorAnalysisByCustomerVendorItem[]> => {
  return request(`/api/vendor-analysis/by-customer/vendor-list`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const vendorAnalysisByCustomerVendorAnnualTrend = (
  params: IVendorAnalysisByCustomerVendorAnnualTrendPayload,
): RequestPromise<IVendorAnalysisByCustomerVendorAnnualTrendItem[]> => {
  return request(`/api/vendor-analysis/by-customer/vendor-annual-trend`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};

export const salesCustomerSync = (): RequestPromise<null> => {
  return request(`/api/salesCustomer/sync`, {
    method: 'get',
  });
};

export const salesCustomerList = (): RequestPromise<ISalesCustomerRecord[]> => {
  return request(`/api/salesCustomer/list`, {
    method: 'get',
  });
};

export const vendorAnalysisByProjectVendorCompare = (
  params: IVendorAnalysisComparePayload,
): RequestPromise<IVendorAnalysisCompareRecord[]> => {
  return request(`/api/vendor-analysis/by-project/vendor-compare`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const vendorAnalysisByCustomerVendorCompare = (
  params: IVendorAnalysisComparePayload,
): RequestPromise<IVendorAnalysisCompareRecord[]> => {
  return request(`/api/vendor-analysis/by-customer/vendor-compare`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
export const vendorAnalysisByVendorCompare = (
  params: IVendorAnalysisComparePayload,
): RequestPromise<IVendorAnalysisCompareRecord[]> => {
  return request(`/api/vendor-analysis/by-vendor/vendor-compare`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 60,
  });
};
