/** Billing / AR / AP Statement mock data */

const ok = (data: any) => ({ code: 200, msg: 'success', data });
const page = (list: any[], total?: number) =>
  ok({ list, total: total ?? list.length, pageNum: 1, pageSize: 20, pages: 1 });

const arStatements = [
  { id: 1, statementNumber: 'AR-2024-001', customerName: 'ABC Logistics Co.', projectNames: ['Metro Manila Distribution 2024'], settledItemList: ['waybill'], statementStatus: 'pendingCollection', statementType: 'withWaybill', totalAmountDue: 150000, amountReceived: 0, outstandingAmount: 150000, reconciliationPeriodStart: '2024-05-01', reconciliationPeriodEnd: '2024-05-31', invoiceNumber: 'INV-2024-001', createdAt: '2024-06-01T08:00:00Z' },
  { id: 2, statementNumber: 'AR-2024-002', customerName: 'XYZ Trading Inc.', projectNames: ['Cebu Cold Chain Operations'], settledItemList: ['waybill', 'claim'], statementStatus: 'partiallyCollected', statementType: 'withWaybill', totalAmountDue: 80000, amountReceived: 40000, outstandingAmount: 40000, reconciliationPeriodStart: '2024-04-01', reconciliationPeriodEnd: '2024-04-30', invoiceNumber: 'INV-2024-002', createdAt: '2024-05-05T09:00:00Z' },
  { id: 3, statementNumber: 'AR-2024-003', customerName: 'Southeast Pharma', projectNames: ['Mindanao Pharma Express'], settledItemList: ['waybill'], statementStatus: 'awaitCustomerConfirm', statementType: 'withWaybill', totalAmountDue: 220000, amountReceived: 0, outstandingAmount: 220000, reconciliationPeriodStart: '2024-05-01', reconciliationPeriodEnd: '2024-05-31', invoiceNumber: null, createdAt: '2024-06-02T10:00:00Z' },
  { id: 4, statementNumber: 'AR-2024-004', customerName: 'Manila Fresh Foods', projectNames: ['NCR Retail Distribution'], settledItemList: ['waybill'], statementStatus: 'underBillingPrep', statementType: 'withWaybill', totalAmountDue: 55000, amountReceived: 0, outstandingAmount: 55000, reconciliationPeriodStart: '2024-05-15', reconciliationPeriodEnd: '2024-05-31', invoiceNumber: null, createdAt: '2024-06-03T11:00:00Z' },
];

const apStatements = [
  { id: 1, statementNumber: 'AP-2024-001', vendorName: 'FastTrack Transport', projectNames: ['Metro Manila Distribution 2024'], settledItemList: ['waybill'], statementStatus: 'pendingPayment', statementType: 'withWaybill', totalAmountDue: 90000, amountReceived: 0, outstandingAmount: 90000, reconciliationPeriodStart: '2024-05-01', reconciliationPeriodEnd: '2024-05-31', invoiceNumber: 'VINV-2024-001', createdAt: '2024-06-01T08:00:00Z' },
  { id: 2, statementNumber: 'AP-2024-002', vendorName: 'Island Cargo Services', projectNames: ['Cebu Cold Chain Operations'], settledItemList: ['waybill'], statementStatus: 'partiallyPaid', statementType: 'withWaybill', totalAmountDue: 45000, amountReceived: 20000, outstandingAmount: 25000, reconciliationPeriodStart: '2024-04-01', reconciliationPeriodEnd: '2024-04-30', invoiceNumber: 'VINV-2024-002', createdAt: '2024-05-05T09:00:00Z' },
  { id: 3, statementNumber: 'AP-2024-003', vendorName: 'Southern Logistics Corp.', projectNames: ['Mindanao Pharma Express'], settledItemList: ['waybill', 'claim'], statementStatus: 'awaitVendorConfirm', statementType: 'withWaybill', totalAmountDue: 130000, amountReceived: 0, outstandingAmount: 130000, reconciliationPeriodStart: '2024-05-01', reconciliationPeriodEnd: '2024-05-31', invoiceNumber: null, createdAt: '2024-06-02T10:00:00Z' },
];

const taxRates = [
  { id: 1, name: 'VAT 12%', rate: 12, type: 'VAT', isDefault: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Non-VAT 0%', rate: 0, type: 'Non-VAT', isDefault: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Withholding Tax 2%', rate: 2, type: 'Withholding', isDefault: false, createdAt: '2024-01-01T00:00:00Z' },
];

const arDashboardOverview = {
  totalOutstanding: 505000,
  totalReceived: 60000,
  overdueCount: 2,
  overdueAmount: 230000,
  byStatus: [
    { status: 'underBillingPrep', count: 1, amount: 55000 },
    { status: 'awaitCustomerConfirm', count: 1, amount: 220000 },
    { status: 'pendingCollection', count: 1, amount: 150000 },
    { status: 'partiallyCollected', count: 1, amount: 40000 },
  ],
};

export default {
  // AR Statement
  'POST /api/statement/customer-list': (req: any, res: any) => res.json(page(arStatements, 4)),
  'POST /api/statement/detail': (req: any, res: any) => res.json(ok(arStatements[0])),
  'POST /api/statement/confirm': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/customer-confirm': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/confirm-received': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/reject': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/write-off': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/check-waybill-invoice': (req: any, res: any) => res.json(ok(true)),
  'POST /api/statement/export-statement': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/query-waybill': (req: any, res: any) => res.json(page([])),
  'POST /api/statement/query-project': (req: any, res: any) => res.json(ok([])),
  'POST /api/statement/add-with-waybill': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/statement/add-no-waybill': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/statement/query-statementWaybill': (req: any, res: any) => res.json(page([])),
  'POST /api/statement/edit-cost': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/claim-list': (req: any, res: any) => res.json(page([])),
  'POST /api/statement/export-statement-claim': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/change-tax': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/check/add/waybill': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/add/waybill': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/remove/waybill': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/claim/list': (req: any, res: any) => res.json(page([])),
  'POST /api/statement/check/add/claim': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/remove/claim': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/add/claim': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/cancel/check': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement/export-change-record': (req: any, res: any) => res.json(ok(null)),
  'GET /api/statement/customer/export': (req: any, res: any) => res.json(ok(null)),
  'GET /api/statement/log': (req: any, res: any) => res.json(ok([])),
  'GET /api/statement/additional-charge-list': (req: any, res: any) => res.json(ok([])),

  // AP Statement
  'POST /api/statement/vendor-list': (req: any, res: any) => res.json(page(apStatements, 3)),
  'POST /api/statement/vendor-confirm': (req: any, res: any) => res.json(ok(null)),
  'GET /api/statement/vendor/export': (req: any, res: any) => res.json(ok(null)),

  // Statement invoice / receipts
  'POST /api/statement-invoice/number-list': (req: any, res: any) => res.json(ok([])),
  'POST /api/statement-invoice/waybill/save': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-invoice/waybill/save-all': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-invoice/list': (req: any, res: any) => res.json(page([])),
  'POST /api/statement-invoice/create': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-invoice/edit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-invoice/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-invoice/cancelled-list': (req: any, res: any) => res.json(page([])),
  'POST /api/statement-receipt/create': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-receipt/list': (req: any, res: any) => res.json(page([])),
  'GET /api/statement-receipt/detail': (req: any, res: any) => res.json(ok(null)),
  'GET /api/statement-proof/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/statement-proof/create': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-proof/edit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-proof/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-miscellaneous-charge/list': (req: any, res: any) => res.json(page([])),
  'POST /api/statement-miscellaneous-charge/history-list': (req: any, res: any) => res.json(page([])),
  'POST /api/statement-miscellaneous-charge/save': (req: any, res: any) => res.json(ok(null)),
  'POST /api/statement-miscellaneous-charge/waybill/save': (req: any, res: any) => res.json(ok(null)),

  // AR Dashboard
  'POST /api/ar-statement/statistic/overview': (req: any, res: any) => res.json(ok(arDashboardOverview)),
  'POST /api/ar-statement/statistic/overview/trips-num/download': (req: any, res: any) => res.json(ok(null)),
  'POST /api/ar-statement/statistic/overview/download': (req: any, res: any) => res.json(ok(null)),
  'POST /api/ar-statement/statistic/breakdown-by-month': (req: any, res: any) =>
    res.json(ok([
      { month: '2024-01', totalAmount: 120000, receivedAmount: 100000 },
      { month: '2024-02', totalAmount: 180000, receivedAmount: 150000 },
      { month: '2024-03', totalAmount: 200000, receivedAmount: 200000 },
      { month: '2024-04', totalAmount: 160000, receivedAmount: 120000 },
      { month: '2024-05', totalAmount: 505000, receivedAmount: 60000 },
    ])),
  'POST /api/ar-statement/statistic/breakdown-by-month/download': (req: any, res: any) => res.json(ok(null)),

  // Tax Rate
  'GET /api/tax-rate/list': (req: any, res: any) => res.json(ok(taxRates)),
  'POST /api/tax-rate/edit': (req: any, res: any) => res.json(ok(null)),

  // Advance Payment (prototype pages)
  'GET /api/advance-payment/list': (req: any, res: any) => res.json(page([])),
  'POST /api/advance-payment/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'GET /api/advance-payment/detail': (req: any, res: any) => res.json(ok(null)),
};
