const PATHS = {
  BASE: '/',
  HOME: '/home',
  CHANGE_PASSWORD: '/user/change-password',
  CUSTOMER: '/customer',
  CUSTOMER_STATISTICS: '/customer/Statistics',
  CUSTOMER_LIST: '/customer/list',
  CUSTOMER_DETAIL_BASE: '/customer/list/detail',
  CUSTOMER_LEAD_POOL_LIST: '/customer/leads-pool',
  CUSTOMER_LEAD_POOL_DETAIL: '/customer/leads-pool/detail',
  OPPORTUNITIES_LIST: '/customer/opportunities/list',
  OPPORTUNITIES_LIST_DETAIL: '/customer/opportunities/list/detail',
  VENDOR_LIST: '/vendor/list',
  VENDOR_DETAIL: '/vendor/list/detail',
  BILLING_CUSTOMER_STATEMENT: '/billing/customer-statement',
  BILLING_CUSTOMER_STATEMENT_ADD: '/billing/customer-statement/add',
  BILLING_CUSTOMER_STATEMENT_DETAIL: '/billing/customer-statement/detail',
  BILLING_CUSTOMER_STATEMENT_BILLED_AMOUNT:
    '/billing/customer-statement/billed-amount',
  BILLING_CUSTOMER_CLAIMS: '/billing/customer-statement/claims',
  BILLING_CUSTOMER_CLAIMS_TICKET: '/billing/customer-statement/claimsTicket',
  BILLING_CUSTOMER_ADDITIONAL: '/billing/customer-statement/additional',

  BILLING_VENDOR_STATEMENT: '/billing/vendor-statement',
  BILLING_VENDOR_STATEMENT_ADD: '/billing/vendor-statement/add',
  BILLING_VENDOR_STATEMENT_DETAIL: '/billing/vendor-statement/detail',
  BILLING_VENDOR_CLAIMS: '/billing/vendor-statement/claims',
  BILLING_VENDOR_CLAIMS_TICKET: '/billing/vendor-statement/claimsTicket',
  BILLING_VENDOR_ADDITIONAL: '/billing/vendor-statement/additional',
  BILLING_VENDOR_STATEMENT_BILLED_AMOUNT:
    '/billing/vendor-statement/billed-amount',
  BILLING_STATEMENT_ASSOCIATED_WAYBILL: '/billing/statement/associated-waybill',
  PROJECT: '/project',
  PROJECT_LIST: '/project/list',
  PROJECT_DETAIL_BASE: '/project/list/detail',
  CAPACITY_LIST: '/project/capacity-pool',
  CAPACITY_DETAIL: '/project/capacity-pool/detail',
  ROUTE_LIBRARY_LIST: '/project/route-library',
  ROUTE_LIBRARY_DETAIL: '/project/route-library/detail',
  ROUTE_LIBRARY_PRICE: '/project/route-library/price',
  WAYBILL_LIST: '/project/waybill',
  WAYBILL_LIST_DETAIL: '/project/waybill/detail',
  SUBTASK_LIST: '/project/subTask',
  SUBTASK_LIST_DETAIL: '/project/subTask/detail',
  TRANSMITTAL_LIST: '/project/transmittal',
  TRANSMITTAL_CREATE: '/project/transmittal/generate',
  TRANSMITTAL_LIST_DETAIL: '/project/transmittal/detail',
  CLAIM_TICKET_LIST: '/project/claim-ticket',
  CLAIM_TICKET_LIST_DETAIL: '/project/claim-ticket/claim-detail',
  CLAIM_TICKET_REFUND_DETAIL: '/project/claim-ticket/refund-detail',
  VENDOR_TRUCK_LIST: '/vendor/truck',
  VENDOR_TRUCK_DETAIL: '/vendor/truck/detail',
  VENDOR_DRIVER_LIST: '/vendor/driver',
  VENDOR_DRIVER_DETAIL: '/vendor/driver/detail',
  VENDOR_CREW_LIST: '/vendor/crew',
  VENDOR_CREW_DETAIL: '/vendor/crew/detail',
  VENDOR_APPLICATION_LIST: '/vendor/application',
  VENDOR_APPLICATION_DETAIL: '/vendor/application/detail',
  TOOLS_CONTRACT_LIST: '/tools/contract-mgmt',
  TOOL_SIGNATURES: '/tools/signature',
  TOOL_SIGNATURES_CREATE: '/tools/signature/create',
  SIGNATURES_DETAIL: '/signature/detail',
  CUSTOMER_STATISTIC_DETAIL:
    '/statistics/customerAnalysis/customerStatisticDetail',
  PROJECT_STATISTIC_DETAIL:
    '/statistics/customerAnalysis/projectStatisticDetail',
  CUSTOMER_ANALYSIS_BY_PROJECT:
    '/statistics/customerAnalysis/customerAnalysisByProject',

  CUSTOMER_ANALYSIS_CUSTOMER_TREND:
    '/statistics/customerAnalysis/customer/trend',
  CUSTOMER_ANALYSIS_CUSTOMER_COMPARISON:
    '/statistics/customerAnalysis/customer/comparison',

  PROJECT_ANALYSIS_PROJECT_TREND: '/statistics/customerAnalysis/project/trend',
  PROJECT_ANALYSIS_PROJECT_COMPARISON:
    '/statistics/customerAnalysis/project/comparison',

  VENDOR_STATISTIC_DETAIL: '/statistics/vendorAnalysis/vendorStatisticDetail',
  VENDOR_STATISTIC_PROJECT_DETAIL: '/statistics/vendorAnalysis/projectDetail',
  VENDOR_STATISTIC_GROSS_PROFIT_TREND_DETAIL:
    '/statistics/vendorAnalysis/grossProfit/trendDetail',
  VENDOR_STATISTIC_BY_PROJECT_TREND_DETAIL:
    '/statistics/vendorAnalysis/byProject/trendDetail',
  VENDOR_STATISTIC_VENDOR_COMPARISON: '/statistics/vendorAnalysis/comparison',
  VENDOR_STATISTIC_BY_CUSTOMER_TREND_DETAIL:
    '/statistics/vendorAnalysis/byCustomer/trendDetail',
  NO_AUTH: '/403',
};

export default PATHS;
