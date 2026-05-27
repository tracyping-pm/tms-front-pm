/** Customer module mock data */

const ok = (data: any) => ({ code: 200, msg: 'success', data });
const page = (list: any[], total?: number) =>
  ok({ list, total: total ?? list.length, pageNum: 1, pageSize: 20, pages: 1 });

const customers = [
  { id: 1, customerName: 'ABC Logistics Co.', customerTag: 'Key Account', industryName: 'Retail', status: 'In Service', priority: 'High', size: 'Large', bu: 'TMS', bdUserAliasName: 'Alice', camUserAliasName: 'Bob', customerTaxMark: 'VAT', region: 'Metro Manila', createdAt: '2024-01-10T08:00:00Z' },
  { id: 2, customerName: 'XYZ Trading Inc.', customerTag: 'SME', industryName: 'Manufacturing', status: 'Following Up', priority: 'Medium', size: 'Medium', bu: 'TMS', bdUserAliasName: 'Carol', camUserAliasName: 'Dave', customerTaxMark: 'VAT', region: 'Cebu', createdAt: '2024-02-15T09:00:00Z' },
  { id: 3, customerName: 'Manila Fresh Foods', customerTag: 'New', industryName: 'Food & Beverage', status: 'Preparing', priority: 'High', size: 'Small', bu: 'TMS', bdUserAliasName: 'Eve', camUserAliasName: 'Frank', customerTaxMark: 'Non-VAT', region: 'Metro Manila', createdAt: '2024-03-20T10:00:00Z' },
  { id: 4, customerName: 'Southeast Pharma', customerTag: 'Key Account', industryName: 'Pharmaceuticals', status: 'In Service', priority: 'High', size: 'Large', bu: 'TMS', bdUserAliasName: 'Grace', camUserAliasName: 'Henry', customerTaxMark: 'VAT', region: 'Davao', createdAt: '2024-04-05T11:00:00Z' },
  { id: 5, customerName: 'Island Builders Corp.', customerTag: 'SME', industryName: 'Construction', status: 'Public', priority: 'Low', size: 'Medium', bu: 'TMS', bdUserAliasName: 'Ivy', camUserAliasName: 'Jack', customerTaxMark: 'VAT', region: 'Pampanga', createdAt: '2024-05-12T12:00:00Z' },
];

const customerDetail = (id: number) => ({
  ...customers.find((c) => c.id === id) ?? customers[0],
  phone: '+63 912 345 6789',
  email: 'contact@example.com',
  address: '123 Business Ave, Makati City',
  contactList: [{ id: 1, name: 'Contact Person', phone: '+63 917 000 0001', email: 'cp@example.com', position: 'Manager' }],
  followUpRecords: [],
  projectList: [],
  contractList: [],
});

const leads = [
  { id: 1, customerName: 'Potential Client A', status: 'New', bdUserAliasName: 'Alice', region: 'Metro Manila', createdAt: '2024-06-01T08:00:00Z', phone: '+63 912 111 2222' },
  { id: 2, customerName: 'Prospect B Inc.', status: 'Contacted', bdUserAliasName: 'Bob', region: 'Cebu', createdAt: '2024-06-10T09:00:00Z', phone: '+63 917 333 4444' },
  { id: 3, customerName: 'Future Partner C', status: 'Qualified', bdUserAliasName: 'Carol', region: 'Davao', createdAt: '2024-06-15T10:00:00Z', phone: '+63 918 555 6666' },
];

const opportunities = [
  { id: 1, opportunityName: 'Metro Manila Distribution', customerId: 1, customerName: 'ABC Logistics Co.', status: 'Open', estimatedValue: 500000, bdUserAliasName: 'Alice', createdAt: '2024-07-01T08:00:00Z' },
  { id: 2, opportunityName: 'Cebu Cold Chain', customerId: 2, customerName: 'XYZ Trading Inc.', status: 'In Progress', estimatedValue: 300000, bdUserAliasName: 'Carol', createdAt: '2024-07-15T09:00:00Z' },
  { id: 3, opportunityName: 'Mindanao Expansion', customerId: 4, customerName: 'Southeast Pharma', status: 'Won', estimatedValue: 800000, bdUserAliasName: 'Grace', createdAt: '2024-08-01T10:00:00Z' },
];

export default {
  'POST /api/customer/list': (req: any, res: any) => res.json(page(customers, 5)),
  'POST /api/customer/detail': (req: any, res: any) => res.json(ok(customerDetail(req.body?.id ?? 1))),
  'POST /api/customer/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/customer/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/transfer': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/transfer/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/transfer/cam/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/userRole/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/customer/contract/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/contract/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/contract/edit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/followRecord/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/followRecord/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/followRecord/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/followRecord/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/customerTaxMark': (req: any, res: any) => res.json(ok(null)),
  'POST /api/customer/customerNameAndTag/duplicate/check': (req: any, res: any) => res.json(ok(false)),
  'POST /api/customer/transfer/history/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/contract/tracking/list': (req: any, res: any) => res.json(page([])),
  'POST /api/customer/contract/expire/count': (req: any, res: any) => res.json(ok({ count: 0 })),
  'GET /api/customer/industry/list': (req: any, res: any) =>
    res.json(ok(['Retail', 'Manufacturing', 'Food & Beverage', 'Pharmaceuticals', 'Construction', 'E-Commerce', 'FMCG'])),
  'GET /api/customer/phone/list': (req: any, res: any) => res.json(ok([])),

  // Leads
  'POST /api/lead/list': (req: any, res: any) => res.json(page(leads, 3)),
  'POST /api/lead/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/lead/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/lead/detail': (req: any, res: any) => res.json(ok(leads[0])),
  'POST /api/lead/transfer': (req: any, res: any) => res.json(ok(null)),
  'POST /api/lead/transfer-list': (req: any, res: any) => res.json(page([])),
  'POST /api/lead/check-duplicate-name': (req: any, res: any) => res.json(ok(false)),
  'GET /api/lead/customer-lead-selector': (req: any, res: any) => res.json(ok(leads.map((l) => ({ id: l.id, name: l.customerName })))),
  'GET /api/lead/customer-lead-detail': (req: any, res: any) => res.json(ok(leads[0])),

  // Opportunities
  'POST /api/opportunity/list': (req: any, res: any) => res.json(page(opportunities, 3)),
  'POST /api/opportunity/list-in-customer': (req: any, res: any) => res.json(page([])),
  'POST /api/opportunity/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/opportunity/edit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/opportunity/detail': (req: any, res: any) => res.json(ok(opportunities[0])),
  'POST /api/opportunity/user-selector': (req: any, res: any) => res.json(ok([])),
  'POST /api/opportunity/checkHaveProject': (req: any, res: any) => res.json(ok(false)),

  // Follow-up
  'POST /api/follow-up/list': (req: any, res: any) => res.json(page([])),
  'POST /api/follow-up/list-visit-record': (req: any, res: any) => res.json(page([])),
  'POST /api/follow-up/list-visit-record-time-line': (req: any, res: any) => res.json(ok([])),
  'POST /api/follow-up/add': (req: any, res: any) => res.json(ok(null)),

  // CRM statistics
  'POST /api/crm/statistic/opportunity/funnel/person': (req: any, res: any) => res.json(ok([])),
  'POST /api/crm/statistic/opportunity/tracking-list': (req: any, res: any) => res.json(page([])),
  'POST /api/crm/statistic/opportunity/tracking-chart': (req: any, res: any) => res.json(ok([])),
  'POST /api/crm/statistic/opportunity/volume-data': (req: any, res: any) => res.json(ok([])),
  'POST /api/crm/statistic/opportunity/volume': (req: any, res: any) => res.json(ok([])),
  'POST /api/crm/statistic/lead/funnel/person': (req: any, res: any) => res.json(ok([])),
  'POST /api/salesCustomer/sync': (req: any, res: any) => res.json(ok(null)),
  'GET /api/salesCustomer/list': (req: any, res: any) => res.json(ok([])),
};
