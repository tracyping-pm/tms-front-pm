// 路由图标支持Ant Icon，https://ant.design/components/icon-cn

import { PermissionEnum } from '../src/enums/permission';

export default [
  {
    path: '/user/change-password',
    component: './user/ChangePassword',
    layout: false,
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home Page',
    component: './Home',
    meta: {
      icon: 'home',
    },
  },
  {
    path: '/customer',
    name: 'Customer Mgmt',
    // redirect: '/customer/list',：
    // hideInBreadcrumb: true,
    access: PermissionEnum.CUSTOMER_MANAGEMENT,
    meta: {
      icon: 'customer',
    },
    routes: [
      {
        path: '/customer/statistics',
        name: 'Statistics',
        component: './customer/Statistics',
        access: PermissionEnum.CUSTOMER_STATISTICS,
      },
      {
        path: '/customer/leads-pool',
        name: 'LeadsPool',
        component: './customer/LeadsPool',
        access: PermissionEnum.LEADS_POOL,
      },
      {
        path: '/customer/leads-pool/detail/:id',
        name: 'LeadsPoolDetail',
        component: './customer/LeadsPool/Detail',
        hideInMenu: true,
        access: PermissionEnum.LEAD_DETAIL,
      },
      {
        path: '/customer/opportunities/list',
        name: 'Opportunities',
        component: './customer/Opportunities/List',
        access: PermissionEnum.OPPORTUNITY_LIST,
      },
      {
        path: '/customer/opportunities/list/detail/:id',
        name: 'OpportunitiesDetail',
        component: './customer/Opportunities/Detail',
        hideInMenu: true,
        access: PermissionEnum.OPPORTUNITY_DETAIL,
      },
      {
        path: '/customer/list',
        name: 'Customers',
        component: './customer',
        access: PermissionEnum.CUSTOMERS_PAGE,
      },

      {
        path: '/customer/list/detail/:id',
        name: 'CustomerDetail',
        component: './customer/Detail',
        hideInMenu: true,
        access: PermissionEnum.CUSTOMER_DETAIL,
      },
    ],
  },
  {
    path: '/vendor',
    name: 'Procurement Mgmt',
    access: PermissionEnum.VENDOR_MANAGEMENT,
    meta: {
      icon: 'vendor',
    },
    routes: [
      {
        path: '/vendor/list',
        name: 'Vendors',
        component: './vendor',
        access: PermissionEnum.VENDORS_PAGE,
      },
      {
        path: '/vendor/truck',
        name: 'Trucks',
        component: './vendor/Trucks',
        access: PermissionEnum.TRUCK_LIST,
      },

      {
        path: '/vendor/crew',
        name: 'Crew',
        component: './vendor/Crew',
        access: PermissionEnum.CREW_LIST,
      },
      {
        path: '/vendor/application',
        name: 'Application',
        component: './vendor/Application',
        access: PermissionEnum.APPLICATION_LIST,
      },
      {
        path: '/vendor/list/detail/:id',
        name: 'VendorDetail',
        component: './vendor/Detail',
        hideInMenu: true,
        access: PermissionEnum.VENDOR_DETAIL,
      },
      {
        path: '/vendor/application/detail/:id',
        name: 'ApplicationDetail',
        component: './vendor/Application/Detail',
        hideInMenu: true,
      },
      {
        path: '/vendor/truck/detail/:id',
        name: 'TruckDetail',
        component: './vendor/TruckDetail',
        hideInMenu: true,
        access: PermissionEnum.TRUCK_DETAIL,
      },

      {
        path: '/vendor/crew/detail/:id',
        name: 'CrewDetail',
        component: './vendor/Crew/Detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/project',
    name: 'Project Mgmt',
    access: PermissionEnum.PROJECT_MANAGEMENT,
    meta: {
      icon: 'project',
    },
    routes: [
      {
        path: '/project/alarmDashboard',
        name: 'Alarm Dashboard',
        component: './project/AlarmDashboard',
        access: PermissionEnum.ALARM_DASHBOARD,
      },
      {
        path: '/project/list',
        name: 'Projects',
        component: './project/List',
        access: PermissionEnum.PROJECT_LIST,
      },
      {
        path: '/project/waybill',
        name: 'Waybills',
        component: './waybill/List',
        access: PermissionEnum.WAYBILL,
      },
      // --- Prototype: Waybill Billing ---
      {
        path: '/project/waybill-billing',
        name: 'Waybills（New）',
        component: './billing/waybill-billing/List',
      },
      {
        path: '/project/waybill/detail/:id',
        name: 'WaybillDetail',
        hideInMenu: true,
        component: './waybill/WaybillDetail',
        access: PermissionEnum.WAYBILL_DETAIL,
      },
      {
        path: '/project/subTask',
        name: 'Financial Process',
        component: './project/Subtask/List',
        access: PermissionEnum.SUBTASK,
      },
      {
        path: '/project/subTask/detail/:id',
        name: 'SubtaskDetail',
        component: './project/Subtask/Detail',
        hideInMenu: true,
        access: PermissionEnum.SUBTASK_DETAIL,
      },
      {
        path: '/project/transmittal',
        name: 'Transmittal ',
        component: './project/Transmittal/List',
        access: PermissionEnum.TRANSMITTAL,
      },
      {
        path: '/project/transmittal/generate',
        name: 'TransmittalCreate',
        component: './project/Transmittal/Generate',
        hideInMenu: true,
        access: PermissionEnum.TRANSMITTAL_CREATE,
      },
      {
        path: '/project/transmittal/detail/:id',
        name: 'TransmittalDetail',
        component: './project/Transmittal/Detail',
        hideInMenu: true,
        access: PermissionEnum.TRANSMITTAL_DETAIL,
      },
      {
        path: '/project/route-library',
        name: 'Route Libraries',
        component: './project/RouteLibraryList',
        access: PermissionEnum.ROUTE_LIBRARIES,
      },
      {
        path: '/project/list/detail/:id',
        name: 'ProjectDetail',
        component: './project/Detail',
        hideInMenu: true,
        access: PermissionEnum.PROJECT_DETAIL,
      },
      {
        path: '/project/route-library/detail/:id',
        name: 'RouteLibraryDetail',
        component: './project/RouteLibraryDetail',
        hideInMenu: true,
        access: PermissionEnum.ROUTE_LIBRARY_DETAIL,
      },
      {
        path: '/project/route-library/price/:id',
        name: 'RouteLibraryPrice',
        component: './project/RouteLibraryPrice',
        hideInMenu: true,
      },
      {
        path: '/project/capacity-pool',
        name: 'Capacity pools',
        component: './capacity-pool/List',
        access: PermissionEnum.CAPACITY_POOLS,
      },
      {
        path: '/project/capacity-pool/detail/:id',
        name: 'CapacityPoolDetail',
        component: './capacity-pool/Detail',
        hideInMenu: true,
        access: PermissionEnum.CAPACITY_POOL_DETAIL,
      },
      {
        path: '/project/claim-ticket',
        name: 'Claim Tickets',
        component: './project/ClaimTicket/list',
        access: PermissionEnum.CLAIM_TICKETS,
      },
      {
        path: '/project/claim-ticket/claim-detail',
        name: 'Claim Tickets Detail',
        component: './project/ClaimTicket/components/ClaimTicket/Detail/index',
        hideInMenu: true,
      },
      {
        path: '/project/claim-ticket/refund-detail',
        name: 'Refund Tickets Detail',
        component: './project/ClaimTicket/components/RefundTicket/Detail/index',
        hideInMenu: true,
      },
      {
        path: '/project/waybill-billing/detail/:id',
        name: 'Waybill Billing Detail',
        component: './billing/waybill-billing/Detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/billing',
    name: 'AR AP Mgmt',
    access: PermissionEnum.BILLING_MANAGEMENT,
    meta: {
      icon: 'billing',
    },
    routes: [
      {
        path: '/billing/ar-dashboard',
        name: 'AR Dashboard',
        component: './billing/ar-dashboard',
        access: PermissionEnum.AR_STATEMENT_STATISTIC,
      },
      {
        path: '/billing/customer-statement',
        name: 'AR Statement',
        component: './billing/customer-statement/List',
        access: PermissionEnum.CUSTOMER_STATEMENT,
      },
      {
        path: '/billing/customer-statement/add',
        name: 'Add AR Statement',
        component: './billing/customer-statement/Add',
        hideInMenu: true,
      },
      {
        path: '/billing/customer-statement/detail/:id',
        name: 'AR Statement Detail',
        component: './billing/customer-statement/Detail',
        hideInMenu: true,
      },
      {
        path: '/billing/customer-statement/billed-amount/:id',
        name: 'Billed Amount',
        component: './billing/customer-statement/BilledAmount',
        hideInMenu: true,
      },
      {
        path: '/billing/customer-statement/claims/:id',
        name: 'AR Claims',
        component: './billing/customer-statement/Claims',
        hideInMenu: true,
      },
      {
        path: '/billing/customer-statement/claimsTicket/:id',
        name: 'AR Claim Ticket',
        component: './billing/customer-statement/ClaimTicket',
        hideInMenu: true,
      },
      {
        path: '/billing/customer-statement/additional/:id',
        name: 'AR Additional Charge ',
        component: './billing/customer-statement/AdditionalCharge',
        hideInMenu: true,
      },

      {
        path: '/billing/vendor-statement',
        name: 'AP Statement',
        component: './billing/vendor-statement/List',
        access: PermissionEnum.VENDOR_STATEMENT,
      },
      // --- Prototype: AP Statement Enhanced ---
      {
        path: '/billing/ap-statement-enhanced',
        name: 'AP Statement（New）',
        component: './billing/ap-statement-enhanced/List',
      },
      {
        path: '/billing/vendor-statement/add',
        name: 'Add AP Statement',
        component: './billing/vendor-statement/Add',
        hideInMenu: true,
      },
      {
        path: '/billing/vendor-statement/detail/:id',
        name: 'AP Statement Detail',
        component: './billing/vendor-statement/Detail',
        hideInMenu: true,
      },
      {
        path: '/billing/vendor-statement/claims/:id',
        name: 'AP Claims',
        component: './billing/vendor-statement/Claims',
        hideInMenu: true,
      },
      {
        path: '/billing/vendor-statement/claimsTicket/:id',
        name: 'AP Claim Ticket',
        component: './billing/vendor-statement/ClaimTicket',
        hideInMenu: true,
      },
      {
        path: '/billing/vendor-statement/additional/:id',
        name: 'AP Additional Charge ',
        component: './billing/vendor-statement/AdditionalCharge',
        hideInMenu: true,
      },
      {
        path: '/billing/vendor-statement/billed-amount/:id',
        name: 'Billed Amount',
        component: './billing/vendor-statement/BilledAmount',
        hideInMenu: true,
      },
      {
        path: '/billing/statement/associated-waybill/:id',
        name: 'Associated Waybill',
        component: './billing/components/AssociatedWaybill',
        hideInMenu: true,
      },
      {
        path: '/billing/tax-rate',
        name: 'Tax Rate Setting',
        component: './billing/tax-rate',
        access: PermissionEnum.TAX_RATE_SETTING,
      },
      // --- Prototype: Advance Payment Request ---
      {
        path: '/billing/advance-payment',
        name: 'Advance Payment',
        component: './billing/advance-payment/List',
      },
      {
        path: '/billing/advance-payment/create',
        name: 'Create Advance Payment',
        component: './billing/advance-payment/Create',
        hideInMenu: true,
      },
      {
        path: '/billing/advance-payment/detail/:id',
        name: 'Advance Payment Detail',
        component: './billing/advance-payment/Detail',
        hideInMenu: true,
      },
      {
        path: '/billing/ap-statement-enhanced/create',
        name: 'Create AP Statement',
        component: './billing/ap-statement-enhanced/Create',
        hideInMenu: true,
      },
      {
        path: '/billing/ap-statement-enhanced/detail/:id',
        name: 'AP Statement Enhanced Detail',
        component: './billing/ap-statement-enhanced/Detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/userManage',
    name: 'User Mgmt',
    access: PermissionEnum.USER_MANAGEMENT,
    meta: {
      icon: 'user',
    },
    routes: [
      {
        path: '/userManage/vendor/account-list',
        name: 'Vendor Account',
        component: './user-manage/vendor/AccountList',
        access: PermissionEnum.VENDOR_ACCOUNT_LIST,
      },
      {
        path: '/userManage/customer/account-list',
        name: 'Customer Account',
        component: './user-manage/customer/AccountList',
        access: PermissionEnum.CUSTOMER_ACCOUNT_LIST,
      },
    ],
  },
  {
    path: '/statistics',
    name: 'Statistics',
    access: PermissionEnum.STATISTICS,
    icon: 'AreaChartOutlined',
    routes: [
      {
        path: '/statistics/bookingDashboard',
        name: 'Booking Dashboard',
        component: './statistics/BookingDashboard',
        access: PermissionEnum.DASHBOARD_BOOKING,
      },
      {
        path: '/statistics/customerAnalysis',
        name: 'Customer Analysis',
        component: './statistics/CustomerAnalysis',
        access: PermissionEnum.CUSTOMER_ANALYSIS,
      },
      {
        path: '/statistics/customerAnalysis/customerStatisticDetail',
        name: 'Customer Statistic Detail',
        hideInMenu: true,
        component:
          './statistics/CustomerAnalysis/components/CustomerStatistic/Detail',
      },
      {
        path: '/statistics/customerAnalysis/projectStatisticDetail',
        name: 'Project Statistic Detail',
        hideInMenu: true,
        component:
          './statistics/CustomerAnalysis/components/ProjectStatistic/Detail',
      },
      {
        path: '/statistics/customerAnalysis/customerAnalysisByProject',
        name: 'Customer Analysis By Project',
        hideInMenu: true,
        component:
          './statistics/CustomerAnalysis/components/AnalysisCustomer/AnalysisByProject',
      },

      {
        path: '/statistics/customerAnalysis/customer/trend',
        name: 'Customer Analysis Trend',
        hideInMenu: true,
        component:
          './statistics/CustomerAnalysis/components/AnalysisCustomer/Trend',
      },
      {
        path: '/statistics/customerAnalysis/customer/comparison',
        name: 'Customer Analysis Comparison',
        hideInMenu: true,
        component: './statistics/components/Comparison/customer',
      },

      {
        path: '/statistics/customerAnalysis/project/trend',
        name: 'Project Analysis Trend',
        hideInMenu: true,
        component:
          './statistics/CustomerAnalysis/components/AnalysisProject/Trend',
      },
      {
        path: '/statistics/customerAnalysis/project/comparison',
        name: 'Project Analysis Comparison',
        hideInMenu: true,
        component: './statistics/components/Comparison/project',
      },

      {
        path: '/statistics/vendorAnalysis',
        name: 'Vendor Analysis',
        component: './statistics/VendorAnalysis',
        access: PermissionEnum.VENDOR_ANALYSIS,
      },
      {
        path: '/statistics/vendorAnalysis/vendorStatisticDetail',
        name: 'Vendor Statistic Detail',
        hideInMenu: true,
        component:
          './statistics/VendorAnalysis/components/CapacityStatistic/Detail',
      },
      {
        path: '/statistics/vendorAnalysis/projectDetail',
        name: 'Project Statistic Detail',
        hideInMenu: true,
        component: './statistics/VendorAnalysis/components/GrossProfit/Detail',
      },
      {
        path: '/statistics/vendorAnalysis/grossProfit/trendDetail',
        name: 'Gross Profit Trend Detail',
        hideInMenu: true,
        component: './statistics/VendorAnalysis/components/GrossProfit/Trend',
      },
      {
        path: '/statistics/vendorAnalysis/grossProfit/comparison',
        name: 'Gross Profit Comparison',
        hideInMenu: true,
        component: './statistics/components/Comparison/vendor',
      },
      {
        path: '/statistics/vendorAnalysis/byProject/trendDetail',
        name: 'Trend Detail',
        hideInMenu: true,
        component: './statistics/VendorAnalysis/components/ByProject/Trend',
      },
      {
        path: '/statistics/vendorAnalysis/comparison',
        name: 'Comparison',
        hideInMenu: true,
        component: './statistics/components/Comparison/vendor',
      },
      {
        path: '/statistics/vendorAnalysis/byCustomer/trendDetail',
        name: 'Trend Detail',
        hideInMenu: true,
        component: './statistics/VendorAnalysis/components/ByCustomer/Trend',
      },
      {
        path: '/statistics/dashboardKpi',
        name: 'KPI Dashboard',
        component: './statistics/DashboardKpi',
        access: PermissionEnum.DASHBOARD_KPI,
      },
      {
        path: '/statistics/subDashboard',
        name: 'SubDashboard',
        component: './statistics/SubDashboard',
        access: PermissionEnum.SUB_DASHBOARD,
      },
      {
        path: '/statistics/dashboardAdoption',
        name: 'Adoption Dashboard',
        component: './statistics/AdoptionDashboard',
        access: PermissionEnum.ADOPTION_DASHBOARD,
      },
      {
        path: '/statistics/field-sales-map',
        name: 'Field Sales Map',
        component: './statistics/FieldSalesMap',
        access: PermissionEnum.FIELD_SALES_MAP,
      },
    ],
  },
  {
    path: '/tools',
    name: 'Tools',
    access: PermissionEnum.TOOLS,
    icon: 'toolFilled',
    routes: [
      {
        path: '/tools/watermark',
        name: 'Watermark',
        component: './tools/Watermark',
        access: PermissionEnum.WATERMARK,
      },
      {
        path: '/tools/signature',
        name: 'Electronic Signature',
        component: './tools/ElectronicSignature',
        access: PermissionEnum.ELECTRONIC_SIGNATURE,
      },
      {
        path: '/tools/signature/create',
        name: 'Create Signature',
        hideInMenu: true,
        component: './tools/ElectronicSignature/ConfigureSignature',
      },
      {
        path: '/tools/contract-mgmt',
        name: 'Contract Mgmt',
        component: './tools/contract-mgmt/List',
        access: PermissionEnum.CONTRACT_MANAGEMENT,
      },
      {
        path: '/tools/waybill-automation',
        name: 'Waybill Automation',
        component: './tools/waybill-automation',
        access: PermissionEnum.WAYBILL_AUTOMATION,
      },
      {
        path: '/tools/conversion',
        name: 'Conversion Tool',
        component: './tools/ConversionTool',
        access: PermissionEnum.CONVERSION_TOOL,
      },
      {
        path: '/tools/group-message',
        name: 'Slack Group Message',
        component: './tools/GroupMessage',
        access: PermissionEnum.SLACK_GROUP_MESSAGE,
      },
      {
        path: '/tools/data-processing',
        name: 'Data Processing',
        component: './tools/DataProcessing',
        access: PermissionEnum.DATA_PROCESSING,
      },

      {
        path: '/tools/fa-billing-records',
        name: 'FA Billing Records',
        component: './tools/FaBillingRecords',
        access: PermissionEnum.FA_BILLING_RECORDS,
      },
      {
        path: '/tools/price-inquiry-tool',
        name: 'Price Inquiry Tool',
        component: './tools/PriceInquiryTool',
        access: PermissionEnum.PRICE_INQUIRY_TOOL,
      },
      {
        path: '/tools/pricing-check',
        name: 'Pricing Check',
        component: './tools/PricingCheck',
        access: PermissionEnum.PRICING_CHECK,
      },
    ],
  },
  {
    path: '/signature/detail',
    name: 'Signature Detail',
    component: './tools/ElectronicSignature/Detail',
    layout: false,
  },
  {
    path: '/403',
    layout: false,
    component: './403',
  },
  {
    path: '/*',
    layout: false,
    component: './404',
  },
];
