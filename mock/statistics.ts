/** Statistics / Dashboard mock data */

const ok = (data: any) => ({ code: 200, msg: 'success', data });
const page = (list: any[], total?: number) =>
  ok({ list, total: total ?? list.length, pageNum: 1, pageSize: 20, pages: 1 });

const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'];
const monthlyRevenue = months.map((m, i) => ({ month: m, revenue: 200000 + i * 30000, waybillCount: 80 + i * 10 }));

export default {
  // Business Statistics
  'POST /api/statistic/business-statistic': (req: any, res: any) =>
    res.json(ok({ totalRevenue: 1200000, totalWaybills: 450, activeCustomers: 12, activeVendors: 8 })),
  'POST /api/statistic/last-seven-days-avg-trend': (req: any, res: any) =>
    res.json(ok(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ day: d, count: 10 + i * 2 })))),
  'POST /api/statistic/data-summary': (req: any, res: any) =>
    res.json(ok({ revenue: 1200000, waybills: 450, customers: 12, vendors: 8 })),
  'POST /api/statistic/top-customer': (req: any, res: any) =>
    res.json(ok([
      { customerName: 'ABC Logistics Co.', revenue: 500000, waybillCount: 180 },
      { customerName: 'Southeast Pharma', revenue: 350000, waybillCount: 120 },
      { customerName: 'XYZ Trading Inc.', revenue: 200000, waybillCount: 90 },
    ])),
  'POST /api/statistic/top-project': (req: any, res: any) =>
    res.json(ok([
      { projectName: 'Metro Manila Distribution 2024', revenue: 500000 },
      { projectName: 'Mindanao Pharma Express', revenue: 350000 },
    ])),
  'POST /api/statistic/performance-comparison': (req: any, res: any) => res.json(ok([])),
  'POST /api/statistic/new-customer': (req: any, res: any) =>
    res.json(ok([{ month: '2024-05', count: 3 }, { month: '2024-04', count: 2 }])),
  'POST /api/statistic/data-summary/prepare': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statistic/data-summary/download': (req: any, res: any) => res.json(ok(null)),
  'GET /api/statistic/time/latest': (req: any, res: any) => res.json(ok({ latestTime: '2024-05-27T00:00:00Z' })),

  // Booking Dashboard
  'POST /api/booking/summary': (req: any, res: any) =>
    res.json(ok({ totalBookings: 450, confirmedBookings: 420, cancelledBookings: 30, revenue: 1200000, monthlyData: monthlyRevenue })),
  'POST /api/booking/customer/waybill': (req: any, res: any) => res.json(ok(monthlyRevenue)),
  'POST /api/booking/trends/by-customer': (req: any, res: any) => res.json(ok([])),
  'POST /api/booking/project/trends/by-customer': (req: any, res: any) => res.json(ok([])),
  'POST /api/booking/project/trends/comparison': (req: any, res: any) => res.json(ok([])),
  'GET /api/booking/get/all/customer': (req: any, res: any) =>
    res.json(ok([{ id: 1, customerName: 'ABC Logistics Co.' }, { id: 4, customerName: 'Southeast Pharma' }])),

  // Customer Analysis
  'POST /api/customer/analysis/summary': (req: any, res: any) =>
    res.json(ok({ activeCustomers: 4, newCustomers: 1, revenue: 1200000, avgRevenuePerCustomer: 300000 })),
  'POST /api/customer/analysis/business/monitor': (req: any, res: any) => res.json(ok([])),
  'POST /api/customer/analysis/active/customer/static': (req: any, res: any) =>
    res.json(ok({ total: 4, byRegion: [{ region: 'Metro Manila', count: 2 }, { region: 'Cebu', count: 1 }] })),
  'POST /api/customer/analysis/active/customer/list': (req: any, res: any) =>
    res.json(page([
      { customerId: 1, customerName: 'ABC Logistics Co.', revenue: 500000, waybillCount: 180 },
      { customerId: 4, customerName: 'Southeast Pharma', revenue: 350000, waybillCount: 120 },
    ])),
  'POST /api/customer/analysis/export/active/customer': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/analysis/active/project/static': (req: any, res: any) => res.json(ok({ total: 3 })),
  'POST /api/customer/analysis/active/project/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/analysis/export/active/project': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/analysis/revenue/static': (req: any, res: any) =>
    res.json(ok({ totalRevenue: 1200000, growth: 15.5, monthlyData: monthlyRevenue })),
  'POST /api/customer/analysis/project/revenue/static': (req: any, res: any) => res.json(ok({ totalRevenue: 1200000 })),
  'POST /api/customer/analysis/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/analysis/by/project': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/analysis/annual/revenue/statistics': (req: any, res: any) => res.json(ok(monthlyRevenue)),
  'POST /api/customer/analysis/annual/revenue/contrast': (req: any, res: any) => res.json(ok([])),
  'POST /api/customer/analysis/project/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/analysis/project/annual/revenue/statistics': (req: any, res: any) => res.json(ok([])),
  'POST /api/customer/analysis/project/annual/revenue/contrast': (req: any, res: any) => res.json(ok([])),

  // Vendor Analysis
  'POST /api/vendor-analysis/summary': (req: any, res: any) =>
    res.json(ok({ activeVendors: 3, totalTrips: 200, totalCost: 400000, avgCostPerTrip: 2000 })),
  'POST /api/vendor-analysis/capacity-statistic': (req: any, res: any) =>
    res.json(ok({ totalTrucks: 25, activeTrucks: 20, utilizationRate: 80 })),
  'POST /api/vendor-analysis/capacity-statistic/vendor-list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/capacity-statistic/vendor-list/export': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor-analysis/by-vendor': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/by-vendor/vendor-annual-trend': (req: any, res: any) => res.json(ok([])),
  'POST /api/vendor-analysis/by-vendor/export': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor-analysis/by-vendor/project-list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/by-vendor/vendor-compare': (req: any, res: any) => res.json(ok([])),
  'POST /api/vendor-analysis/by-project': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/by-project/vendor-list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/by-project/vendor-annual-trend': (req: any, res: any) => res.json(ok([])),
  'POST /api/vendor-analysis/by-project/vendor-compare': (req: any, res: any) => res.json(ok([])),
  'POST /api/vendor-analysis/by-customer': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/by-customer/vendor-list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor-analysis/by-customer/vendor-annual-trend': (req: any, res: any) => res.json(ok([])),
  'POST /api/vendor-analysis/by-customer/vendor-compare': (req: any, res: any) => res.json(ok([])),

  // KPI Dashboard
  'POST /api/statistic/kpi': (req: any, res: any) =>
    res.json(ok({ onTimeDelivery: 92.5, customerSatisfaction: 88, costPerKm: 45, utilizationRate: 78 })),

  // Sub Dashboard
  'POST /api/statistic/sub-dashboard': (req: any, res: any) => res.json(ok({})),

  // Adoption Dashboard
  'POST /api/statistic/adoption': (req: any, res: any) => res.json(ok({})),

  // Field Sales Map
  'GET /api/statistic/field-sales-map': (req: any, res: any) => res.json(ok([])),
  'POST /api/statistic/field-sales-map': (req: any, res: any) => res.json(ok([])),

  // Messages/Notifications
  'GET /api/msg/list': (req: any, res: any) => res.json(page([], 0)),
  'GET /api/msg/unreadCount': (req: any, res: any) => res.json(ok({ count: 0 })),
  'POST /api/msg/read': (req: any, res: any) => res.json(ok(null)),
  'POST /api/msg/readAll': (req: any, res: any) => res.json(ok(null)),
};
