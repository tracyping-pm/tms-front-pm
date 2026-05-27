/** Common / shared / tools / user-manage mock data */

const ok = (data: any) => ({ code: 200, msg: 'success', data });
const page = (list: any[], total?: number) =>
  ok({ list, total: total ?? list.length, pageNum: 1, pageSize: 20, pages: 1 });

const regions = [
  { id: 1, name: 'Metro Manila', padId: 1 },
  { id: 2, name: 'Cebu', padId: 2 },
  { id: 3, name: 'Davao', padId: 3 },
  { id: 4, name: 'Pampanga', padId: 4 },
];

const vendorAccounts = [
  { id: 1, email: 'vendor1@example.com', name: 'FastTrack Transport', status: 'Active', vendorName: 'FastTrack Transport', createdAt: '2024-01-05T08:00:00Z' },
  { id: 2, email: 'vendor2@example.com', name: 'Island Cargo Services', status: 'Active', vendorName: 'Island Cargo Services', createdAt: '2024-02-10T09:00:00Z' },
];

const customerAccounts = [
  { id: 1, email: 'client1@example.com', name: 'ABC Logistics Co.', status: 'Active', customerName: 'ABC Logistics Co.', createdAt: '2024-01-10T08:00:00Z' },
  { id: 2, email: 'client2@example.com', name: 'Southeast Pharma', status: 'Active', customerName: 'Southeast Pharma', createdAt: '2024-04-05T11:00:00Z' },
];

const contracts = [
  { id: 1, contractNumber: 'CON-2024-001', customerName: 'ABC Logistics Co.', status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31', createdAt: '2024-01-01T08:00:00Z' },
  { id: 2, contractNumber: 'CON-2024-002', customerName: 'Southeast Pharma', status: 'Active', startDate: '2024-02-01', endDate: '2025-01-31', createdAt: '2024-02-01T09:00:00Z' },
];

const signatures = [
  { id: 1, title: 'Delivery Agreement 001', status: 'Signed', signerEmail: 'signer@example.com', createdAt: '2024-05-01T08:00:00Z' },
  { id: 2, title: 'Service Contract 002', status: 'Pending', signerEmail: 'pending@example.com', createdAt: '2024-05-15T09:00:00Z' },
];

const departments = [
  { id: 1, name: 'Operations', parentId: null, children: [{ id: 3, name: 'Transport Ops', parentId: 1 }] },
  { id: 2, name: 'Finance', parentId: null, children: [{ id: 4, name: 'AR/AP', parentId: 2 }] },
  { id: 3, name: 'Transport Ops', parentId: 1, children: [] },
  { id: 4, name: 'AR/AP', parentId: 2, children: [] },
];

const roles = [
  { id: 1, roleName: 'Admin', description: 'Full access', buName: 'TMS' },
  { id: 2, roleName: 'Operations Manager', description: 'Manage operations', buName: 'TMS' },
  { id: 3, roleName: 'Finance Officer', description: 'Manage billing', buName: 'TMS' },
  { id: 4, roleName: 'Viewer', description: 'Read-only access', buName: 'TMS' },
];

const pricingData = [
  { id: 1, route: 'Makati → Pasig', truckType: '10-Wheeler', customerPrice: 8000, vendorPrice: 5000, margin: 3000 },
  { id: 2, route: 'Quezon City → Mandaluyong', truckType: '6-Wheeler', customerPrice: 5000, vendorPrice: 3200, margin: 1800 },
  { id: 3, route: 'Manila → Cebu (Air)', truckType: 'Elf', customerPrice: 12000, vendorPrice: 8000, margin: 4000 },
];

export default {
  // Place / Location
  'GET /api/place/region': (req: any, res: any) => res.json(ok(regions)),
  'GET /api/place/geo/region': (req: any, res: any) => res.json(ok(regions)),
  'GET /api/place/province': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Metro Manila' }, { id: 2, name: 'Cebu' }])),
  'GET /api/place/geo/province': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Metro Manila' }, { id: 2, name: 'Cebu' }])),
  'GET /api/place/country': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Philippines' }, { id: 2, name: 'Thailand' }])),
  'GET /api/place/city': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Makati' }, { id: 2, name: 'Cebu City' }])),
  'GET /api/place/geo/city': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Makati' }, { id: 2, name: 'Cebu City' }])),
  'GET /api/place/geo/resolveAddressResult': (req: any, res: any) => res.json(ok([])),
  'POST /api/temp/location/locationConvert': (req: any, res: any) => res.json(ok(null)),

  // User Account Management
  'POST /api/account-manage/reset-password': (req: any, res: any) => res.json(ok(null)),
  'GET /api/account-manage/list': (req: any, res: any) => res.json(page([...vendorAccounts, ...customerAccounts])),
  'POST /api/account-manage/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/account-manage/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/account-manage/suspended': (req: any, res: any) => res.json(ok(null)),
  'POST /api/account-manage/activated': (req: any, res: any) => res.json(ok(null)),
  'POST /api/account-manage/add-vendor': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/account-manage/add-customer': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/account-manage/user-detail': (req: any, res: any) => res.json(ok(vendorAccounts[0])),
  'GET /api/account-manage/vendor-list': (req: any, res: any) => res.json(page(vendorAccounts, 2)),
  'GET /api/account-manage/customer-list': (req: any, res: any) => res.json(page(customerAccounts, 2)),

  // Role & Permissions
  'GET /api/role': (req: any, res: any) => res.json(ok(roles)),
  'GET /api/role/template': (req: any, res: any) => res.json(ok([])),
  'GET /api/role-template/elements': (req: any, res: any) => res.json(ok([])),
  'GET /api/role-template/list': (req: any, res: any) => res.json(ok(roles)),
  'POST /api/role/user': (req: any, res: any) => res.json(ok([])),
  'POST /api/role/no-role-user': (req: any, res: any) => res.json(ok([])),
  'POST /api/role/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/role/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/user-role/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/user-role/distribution-role': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/role-element/listByRole': (req: any, res: any) => res.json(ok([])),
  'POST /api/role/role-element/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/role-template/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/role/role-template/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/role-template/copy': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/role-template/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/role/role-template/update-elements': (req: any, res: any) => res.json(ok(null)),

  // Department
  'GET /api/department/list': (req: any, res: any) => res.json(ok(departments)),
  'POST /api/department/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/department/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/department/delete': (req: any, res: any) => res.json(ok(null)),

  // E-Signature
  'GET /api/eSignature/signature/list': (req: any, res: any) => res.json(page(signatures, 2)),
  'POST /api/eSignature/signature/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/eSignature/signature/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/eSignature/email/check': (req: any, res: any) => res.json(ok(true)),
  'POST /api/eSignature/signature/remind': (req: any, res: any) => res.json(ok(null)),
  'GET /api/eSignature/material/get': (req: any, res: any) => res.json(ok(null)),
  'GET /api/eSignature/signature/certificate': (req: any, res: any) => res.json(ok(null)),

  // Contract Management (Tools)
  'POST /api/contract/list': (req: any, res: any) => res.json(page(contracts, 2)),
  'POST /api/contract/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),

  // Watermark Tool
  'POST /api/watermark/apply': (req: any, res: any) => res.json(ok(null)),

  // Data Processing
  'POST /api/data/process/waybillBackToInTransit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/data/process/changeTruckTypeOfTruck': (req: any, res: any) => res.json(ok(null)),
  'POST /api/data/process/deleteLead': (req: any, res: any) => res.json(ok(null)),
  'POST /api/data/process/waybillRegenerateSubtask': (req: any, res: any) => res.json(ok(null)),
  'POST /api/data/process/rename': (req: any, res: any) => res.json(ok(null)),
  'POST /api/data/process/dataProcessingLogs': (req: any, res: any) => res.json(page([])),

  // FA Billing Records
  'GET /api/fa/transportation/list': (req: any, res: any) => res.json(page([])),
  'GET /api/fa/transportation/sync-status': (req: any, res: any) => res.json(ok({ status: 'idle' })),
  'GET /api/fa/transportation/export': (req: any, res: any) => res.json(ok(null)),
  'POST /api/fa/transportation/import-info': (req: any, res: any) => res.json(ok(null)),
  'POST /api/fa/transportation/sync': (req: any, res: any) => res.json(ok(null)),
  'POST /api/fa/transportation/collect': (req: any, res: any) => res.json(ok(null)),
  'POST /api/fa/transportation/cancel': (req: any, res: any) => res.json(ok(null)),

  // Price Inquiry / Pricing Check
  'POST /api/quotedPrice/waybill/statistics': (req: any, res: any) => res.json(ok({ total: 3, avgMargin: 18 })),
  'POST /api/quotedPrice/waybill/list': (req: any, res: any) => res.json(page(pricingData, 3)),
  'POST /api/quotedPrice/waybill/export': (req: any, res: any) => res.json(ok(null)),
  'POST /api/quotedPrice/routeLibrary/list': (req: any, res: any) => res.json(page([])),
  'POST /api/quotedPrice/routeLibrary/export': (req: any, res: any) => res.json(ok(null)),
  'POST /api/quotedPrice/v2/list': (req: any, res: any) => res.json(page(pricingData, 3)),
  'POST /api/pricing-check/waybill-list': (req: any, res: any) => res.json(page(pricingData, 3)),
  'POST /api/pricing-check/waybill-export': (req: any, res: any) => res.json(ok(null)),

  // Conversion Tool
  'POST /api/conversion/convert': (req: any, res: any) => res.json(ok(null)),

  // Slack
  'GET /api/slack/group-list': (req: any, res: any) => res.json(ok([{ id: 'C001', name: '#general' }, { id: 'C002', name: '#operations' }])),
  'POST /api/slack/send-msg': (req: any, res: any) => res.json(ok(null)),

  // Materials
  'POST /api/materials/multi-download': (req: any, res: any) => res.json(ok(null)),

  // ES Field Query
  'POST /api/es/fieldQueryHighlight': (req: any, res: any) => res.json(ok([])),

  // FMS
  'POST /api/fms/vehicle': (req: any, res: any) => res.json(ok(null)),

  // UAM - additional
  'GET /uam-api/user/change-password': (req: any, res: any) => res.json(ok(null)),
  'POST /uam-api/user/change-password': (req: any, res: any) => res.json(ok(null)),
  'POST /uam-api/user/role/change': (req: any, res: any) => res.json(ok(null)),
  'POST /uam-api/es/fieldQueryHighlight': (req: any, res: any) => res.json(ok([])),
};
