// ─── Types ────────────────────────────────────────────────────────────────────

export type ApStatementStatus =
  | 'Under Payment Preparation'
  | 'Awaiting Comparison'
  | 'Awaiting Rebill'
  | 'Pending Payment'
  | 'Paid'
  | 'Canceled';

export type Origin = 'Vendor Portal' | 'Internal';
export type StatementType = 'Standard' | 'Standalone';

export interface WaybillItem {
  name: string;
  tmsAmount: number;
  vpAmount: number;
}

export interface WaybillRow {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  items: WaybillItem[];
}

export interface ClaimRow {
  no: string;
  type: string;
  amount: number;
  currency: string;
  waybillNo: string;
}

export interface InvoiceRow {
  no: string;
  amount: number;
  date: string;
  proof: string;
}

export interface PaymentRow {
  payableAmount: number;
  status: string;
  applicationNo: string;
  proof: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
}

export interface LogEntry {
  time: string;
  action: string;
  operator: string;
  detail?: string;
}

export interface StatementDetail {
  no: string;
  statementType: StatementType;
  status: ApStatementStatus;
  source: Origin;
  vendor: string;
  taxMark: 'Tax-inclusive' | 'Tax-exclusive';
  settlementItems: string[];
  reconciliationPeriod: string;
  currency: string;
  createDate: string;
  createBy: string;
  vatRate: number;
  whtRate: number;
  waybills: WaybillRow[];
  claims: ClaimRow[];
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  operationLog: LogEntry[];
  rejectReason?: string;
  cancelReason?: string;
  releaseProof?: string;
  miscCharges?: Array<{ object: string; amount: number; proof: string }>;
  standaloneInvoices?: Array<{ number: string; amount: number; date: string; proof: string }>;
  standaloneProofs?: Array<{ message: string }>;
}

export interface ApStatementRow {
  no: string;
  source: Origin;
  vendorName: string;
  settlementItems: string[];
  totalAmountPayable: number;
  currency: string;
  statementType: StatementType;
  waybillCount: number;
  status: ApStatementStatus;
  creator: string;
  createdAt: string;
}

// ─── List Sample Data ──────────────────────────────────────────────────────────

export const SAMPLE_ROWS: ApStatementRow[] = [
  {
    no: 'APVS2604001', source: 'Internal', vendorName: 'Manila Freight Co.',
    settlementItems: [], totalAmountPayable: 52800, currency: 'PHP',
    statementType: 'Standalone', waybillCount: 0,
    status: 'Under Payment Preparation', creator: 'Zhang Jialei', createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'APVS2604002', source: 'Vendor Portal', vendorName: 'Manila Freight Co.',
    settlementItems: ['Vendor Exception Fee', 'Vendor Additional Charge', 'Reimbursement Expense'],
    totalAmountPayable: 52800, currency: 'PHP', statementType: 'Standard', waybillCount: 3,
    status: 'Awaiting Comparison', creator: 'Manila Freight', createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'APVS2604003', source: 'Vendor Portal', vendorName: 'Manila Freight Co.',
    settlementItems: ['Basic Amount'], totalAmountPayable: 38500, currency: 'PHP',
    statementType: 'Standard', waybillCount: 3,
    status: 'Awaiting Rebill', creator: 'Manila Freight', createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'APVS2604004', source: 'Internal', vendorName: 'Laguna Logistics Corp.',
    settlementItems: ['Basic Amount'], totalAmountPayable: 52800, currency: 'PHP',
    statementType: 'Standard', waybillCount: 3,
    status: 'Pending Payment', creator: 'Zhang Jialei', createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'APVS2603001', source: 'Vendor Portal', vendorName: 'Bangkok Express Logistics',
    settlementItems: ['Basic Amount', 'Vendor Exception Fee'],
    totalAmountPayable: 48000, currency: 'PHP', statementType: 'Standalone', waybillCount: 3,
    status: 'Paid', creator: 'Bangkok Express', createdAt: '2026/3/28 14:10:00',
  },
  {
    no: 'APVS2603003', source: 'Internal', vendorName: 'Cebu Trans Lines',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    totalAmountPayable: 15500, currency: 'PHP', statementType: 'Standard', waybillCount: 1,
    status: 'Canceled', creator: 'Zhang Jialei', createdAt: '2026/3/10 16:45:00',
  },
  {
    no: 'APVS2605001', source: 'Vendor Portal', vendorName: 'Manila Freight Co.',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    totalAmountPayable: 28300, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Manila Freight', createdAt: '2026/5/1 10:00:00',
  },
  {
    no: 'APVS2605002', source: 'Vendor Portal', vendorName: 'Laguna Logistics Corp.',
    settlementItems: ['Basic Amount', 'Reimbursement Expense', 'Vendor Additional Charge'],
    totalAmountPayable: 31700, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Laguna Logistics', createdAt: '2026/5/2 09:00:00',
  },
  {
    no: 'APVS2605003', source: 'Vendor Portal', vendorName: 'Bangkok Express Logistics',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    totalAmountPayable: 43200, currency: 'PHP', statementType: 'Standard', waybillCount: 3,
    status: 'Awaiting Comparison', creator: 'Bangkok Express', createdAt: '2026/5/3 10:00:00',
  },
  {
    no: 'APVS2605004', source: 'Vendor Portal', vendorName: 'Cebu Trans Lines',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    totalAmountPayable: 26900, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Cebu Trans', createdAt: '2026/5/4 09:00:00',
  },
  {
    no: 'APVS2605005', source: 'Vendor Portal', vendorName: 'Manila Freight Co.',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    totalAmountPayable: 44300, currency: 'PHP', statementType: 'Standard', waybillCount: 3,
    status: 'Awaiting Comparison', creator: 'Manila Freight', createdAt: '2026/5/6 09:00:00',
  },
  {
    no: 'APVS2605006', source: 'Vendor Portal', vendorName: 'Laguna Logistics Corp.',
    settlementItems: ['Basic Amount', 'Reimbursement Expense'],
    totalAmountPayable: 30300, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Laguna Logistics', createdAt: '2026/5/6 10:00:00',
  },
  {
    no: 'APVS2605007', source: 'Vendor Portal', vendorName: 'Bangkok Express Logistics',
    settlementItems: ['Basic Amount', 'Vendor Exception Fee', 'Vendor Additional Charge'],
    totalAmountPayable: 33300, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Bangkok Express', createdAt: '2026/5/7 09:00:00',
  },
  {
    no: 'APVS2605008', source: 'Vendor Portal', vendorName: 'NCR Cargo Solutions',
    settlementItems: ['Basic Amount', 'Reimbursement Expense'],
    totalAmountPayable: 48300, currency: 'PHP', statementType: 'Standard', waybillCount: 3,
    status: 'Awaiting Comparison', creator: 'NCR Cargo', createdAt: '2026/5/8 09:00:00',
  },
  {
    no: 'APVS2605009', source: 'Vendor Portal', vendorName: 'Manila Freight Co.',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    totalAmountPayable: 28700, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Manila Freight', createdAt: '2026/5/9 09:00:00',
  },
  {
    no: 'APVS2605010', source: 'Vendor Portal', vendorName: 'Cebu Trans Lines',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    totalAmountPayable: 35400, currency: 'PHP', statementType: 'Standard', waybillCount: 2,
    status: 'Awaiting Comparison', creator: 'Cebu Trans', createdAt: '2026/5/10 09:00:00',
  },
];

// ─── Detail Mock Data ──────────────────────────────────────────────────────────

export const DETAIL_MOCK: Record<string, StatementDetail> = {
  APVS2604001: {
    no: 'APVS2604001', statementType: 'Standalone', status: 'Under Payment Preparation',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Miscellaneous Charge'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-17', createBy: 'Manila Freight Co.',
    vatRate: 0, whtRate: 0,
    waybills: [], claims: [], invoices: [], payments: [],
    miscCharges: [
      { object: 'Toll Fee Reimbursement', amount: 3500, proof: 'toll_receipt_apr.pdf' },
      { object: 'Driver Allowance', amount: 2800, proof: 'allowance_voucher.pdf' },
      { object: 'Parking Fee', amount: 600, proof: '' },
    ],
    standaloneInvoices: [
      { number: 'INV-2026-00201', amount: 6900, date: '2026-04-18', proof: 'invoice_201.pdf' },
    ],
    standaloneProofs: [
      { message: 'All charges have been verified against the April route records. Toll receipts and allowance vouchers are attached as supporting documents.' },
    ],
    operationLog: [
      { time: '2026-04-17 10:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
      { time: '2026-04-19 14:30', action: 'Compared & moved to payment preparation', operator: 'TMS User' },
    ],
  },

  APVS2604002: {
    no: 'APVS2604002', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Vendor Exception Fee', 'Vendor Additional Charge', 'Reimbursement Expense'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-01', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2604011', positionTime: '2026-04-11 09:00', unloadingTime: '2026-04-10 15:30', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 14500, vpAmount: 14500 }, { name: 'PrePaid Amount', tmsAmount: 2000, vpAmount: 2000 }, { name: 'Additional Charge', tmsAmount: 800, vpAmount: 900 }] },
      { no: 'WB2604012', positionTime: '2026-04-12 17:00', unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 13300 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }] },
      { no: 'WB2604013', positionTime: '2026-04-13 11:15', unloadingTime: '2026-04-12 17:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 15000, vpAmount: 15000 }, { name: 'PrePaid Amount', tmsAmount: 1190, vpAmount: 1190 }, { name: 'Additional Charge', tmsAmount: 1200, vpAmount: 1200 }, { name: 'Exception Fee', tmsAmount: 500, vpAmount: 500 }] },
    ],
    claims: [{ no: 'PHCT26041501AB', type: 'KPI Claim', amount: 2000, currency: 'PHP', waybillNo: 'WB2604011' }],
    invoices: [], payments: [],
    operationLog: [{ time: '2026-04-01 10:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' }],
  },

  APVS2604003: {
    no: 'APVS2604003', statementType: 'Standard', status: 'Awaiting Rebill',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-10', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    rejectReason: 'Basic Amount for WB2604013 exceeds contracted rate. Additional Charge for WB2604013 has no supporting proof. Please correct and resubmit.',
    waybills: [
      { no: 'WB2604014', positionTime: '2026-04-14 08:30', unloadingTime: '2026-04-13 11:15', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
        items: [{ name: 'Basic Amount', tmsAmount: 12000, vpAmount: 12500 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }] },
      { no: 'WB2604015', positionTime: '2026-04-15 14:00', unloadingTime: '2026-04-14 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 13300 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }] },
      { no: 'WB2604016', positionTime: '2026-04-16 10:45', unloadingTime: '2026-04-15 14:00', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
        items: [{ name: 'Basic Amount', tmsAmount: 11800, vpAmount: 11800 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 500, vpAmount: 500 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [
      { time: '2026-04-10 09:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
      { time: '2026-04-12 14:30', action: 'Rejected the AP statement', operator: 'Keris', detail: 'Basic Amount for WB2604013 exceeds contracted rate.' },
    ],
  },

  APVS2604004: {
    no: 'APVS2604004', statementType: 'Standard', status: 'Pending Payment',
    source: 'Internal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-01', createBy: 'Zhang Jialei',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2604020', positionTime: '2026-04-01 08:00', unloadingTime: '2026-03-31 18:00', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 16800, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 900, vpAmount: 0 }] },
      { no: 'WB2604021', positionTime: '2026-04-02 09:30', unloadingTime: '2026-04-01 08:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 0 }] },
      { no: 'WB2604022', positionTime: '2026-04-03 14:00', unloadingTime: '2026-04-02 09:30', truckType: '4-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Manila',
        items: [{ name: 'Basic Amount', tmsAmount: 9800, vpAmount: 0 }, { name: 'Exception Fee', tmsAmount: 500, vpAmount: 0 }] },
    ],
    claims: [],
    invoices: [{ no: 'INV-2026-00185', amount: 44821, date: '2026-04-05', proof: 'invoice_185.pdf' }],
    payments: [{ payableAmount: 44821, status: 'Pending', applicationNo: 'PA2604001', proof: 'payment_proof.pdf', bankName: 'BDO Unibank', bankAccountName: 'Laguna Logistics Corp.', bankAccountNo: '1234567890' }],
    operationLog: [
      { time: '2026-04-01 10:00', action: 'Created the AP statement', operator: 'Zhang Jialei' },
      { time: '2026-04-03 14:20', action: 'Confirmed & Created RFP', operator: 'Zhang Jialei' },
      { time: '2026-04-05 09:00', action: 'Invoice added', operator: 'Zhang Jialei' },
    ],
  },

  APVS2603001: {
    no: 'APVS2603001', statementType: 'Standalone', status: 'Paid',
    source: 'Vendor Portal', vendor: 'Bangkok Express Logistics',
    taxMark: 'Tax-exclusive', settlementItems: ['Miscellaneous Charge'],
    reconciliationPeriod: '2026-03-01 ~ 2026-03-31',
    currency: 'PHP', createDate: '2026-03-25', createBy: 'Bangkok Express',
    vatRate: 0, whtRate: 0,
    releaseProof: 'hr_release_PA2603018.pdf',
    waybills: [], claims: [],
    miscCharges: [
      { object: 'Special Handling Fee', amount: 18000, proof: 'handling_fee_mar.pdf' },
      { object: 'Customs Documentation', amount: 12000, proof: 'customs_doc_mar.pdf' },
      { object: 'Overnight Storage', amount: 18000, proof: 'storage_receipt_mar.pdf' },
    ],
    standaloneInvoices: [
      { number: 'INV-2026-00157', amount: 48000, date: '2026-03-26', proof: 'invoice_157.pdf' },
    ],
    standaloneProofs: [
      { message: 'March miscellaneous charges include special handling and customs documentation for cross-border shipments.' },
      { message: 'Overnight storage incurred due to port congestion on 2026-03-22. Proof of storage attached.' },
    ],
    invoices: [], payments: [{ payableAmount: 48000, status: 'Paid', applicationNo: 'PA2603018', proof: 'hr_release_PA2603018.pdf', bankName: 'Bangkok Bank', bankAccountName: 'Bangkok Express Logistics', bankAccountNo: '9876543210' }],
    operationLog: [
      { time: '2026-03-25 10:00', action: 'Created the AP statement', operator: 'Bangkok Express' },
      { time: '2026-03-26 14:00', action: 'Confirmed & Created RFP', operator: 'Inteluck' },
      { time: '2026-03-28 14:10', action: 'Marked as Paid (HR release received)', operator: 'Inteluck' },
    ],
  },

  APVS2603003: {
    no: 'APVS2603003', statementType: 'Standard', status: 'Canceled',
    source: 'Internal', vendor: 'Cebu Trans Lines',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    reconciliationPeriod: '2026-03-01 ~ 2026-03-31',
    currency: 'PHP', createDate: '2026-03-08', createBy: 'Zhang Jialei',
    vatRate: 12, whtRate: 2,
    cancelReason: 'Vendor double-submitted; this draft superseded by APVS2603004. Released linked waybills back to Awaiting Settlement.',
    waybills: [
      { no: 'WB2603020', positionTime: '2026-03-05 08:30', unloadingTime: '2026-03-04 17:00', truckType: '10-Wheeler', origin: 'PH-Cebu', destination: 'PH-Bohol',
        items: [{ name: 'Basic Amount', tmsAmount: 12500, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 1500, vpAmount: 0 }, { name: 'Exception Fee', tmsAmount: 1500, vpAmount: 0 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [
      { time: '2026-03-08 09:00', action: 'Created the AP statement', operator: 'Zhang Jialei' },
      { time: '2026-03-10 16:45', action: 'Canceled the AP statement', operator: 'Zhang Jialei', detail: 'Vendor double-submitted; this draft superseded by APVS2603004.' },
    ],
  },

  APVS2605001: {
    no: 'APVS2605001', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-01', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605001', positionTime: '2026-05-01 09:00', unloadingTime: '2026-04-30 18:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 14500, vpAmount: 13000 }, { name: 'Additional Charge', tmsAmount: 800, vpAmount: 800 }] },
      { no: 'WB2605002', positionTime: '2026-05-02 14:00', unloadingTime: '2026-05-01 09:00', truckType: '4-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Makati',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 14000 }, { name: 'Additional Charge', tmsAmount: 0, vpAmount: 500 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-01 10:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' }],
  },

  APVS2605002: {
    no: 'APVS2605002', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Reimbursement Expense', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-02', createBy: 'Laguna Logistics Corp.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605003', positionTime: '2026-05-02 08:30', unloadingTime: '2026-05-01 18:00', truckType: '6-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
        items: [{ name: 'Basic Amount', tmsAmount: 16000, vpAmount: 16000 }, { name: 'Reimbursement', tmsAmount: 500, vpAmount: 300 }] },
      { no: 'WB2605004', positionTime: '2026-05-03 13:00', unloadingTime: '2026-05-02 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 14200, vpAmount: 14200 }, { name: 'Additional Charge', tmsAmount: 1000, vpAmount: 1200 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-02 09:00', action: 'Created the AP statement', operator: 'Laguna Logistics Corp.' }],
  },

  APVS2605003: {
    no: 'APVS2605003', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Bangkok Express Logistics',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-03', createBy: 'Bangkok Express Logistics',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605005', positionTime: '2026-05-03 10:30', unloadingTime: '2026-05-02 14:00', truckType: '6-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Quezon City',
        items: [{ name: 'Basic Amount', tmsAmount: 15000, vpAmount: 13500 }, { name: 'Additional Charge', tmsAmount: 600, vpAmount: 600 }] },
      { no: 'WB2605006', positionTime: '2026-05-04 09:00', unloadingTime: '2026-05-03 10:30', truckType: '6-Wheeler', origin: 'PH-NCR-Taguig', destination: 'PH-Bulacan-Meycauayan',
        items: [{ name: 'Basic Amount', tmsAmount: 13800, vpAmount: 13800 }] },
      { no: 'WB2605007', positionTime: '2026-05-05 14:00', unloadingTime: '2026-05-04 09:00', truckType: '10-Wheeler', origin: 'PH-Batangas-Lipa / DC', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 14000, vpAmount: 14500 }, { name: 'Exception Fee', tmsAmount: 0, vpAmount: 800 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-03 10:00', action: 'Created the AP statement', operator: 'Bangkok Express Logistics' }],
  },

  APVS2605004: {
    no: 'APVS2605004', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Cebu Trans Lines',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-04', createBy: 'Cebu Trans Lines',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605008', positionTime: '2026-05-04 08:00', unloadingTime: '2026-05-03 18:00', truckType: '4-Wheeler', origin: 'PH-Cebu City / Port', destination: 'PH-Cebu-Mandaue / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 12800, vpAmount: 12800 }, { name: 'Additional Charge', tmsAmount: 700, vpAmount: 500 }] },
      { no: 'WB2605009', positionTime: '2026-05-05 09:30', unloadingTime: '2026-05-04 08:00', truckType: '6-Wheeler', origin: 'PH-Cebu-Mandaue / DC', destination: 'PH-Cebu City / Port',
        items: [{ name: 'Basic Amount', tmsAmount: 13600, vpAmount: 13600 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-04 09:00', action: 'Created the AP statement', operator: 'Cebu Trans Lines' }],
  },

  APVS2605005: {
    no: 'APVS2605005', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-06', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605010', positionTime: '2026-05-06 08:00', unloadingTime: '2026-05-05 18:00', truckType: '10-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 15500, vpAmount: 14000 }, { name: 'Additional Charge', tmsAmount: 1000, vpAmount: 1000 }] },
      { no: 'WB2605011', positionTime: '2026-05-07 10:00', unloadingTime: '2026-05-06 08:00', truckType: '6-Wheeler', origin: 'PH-NCR-Caloocan / DC', destination: 'PH-Rizal-Cainta',
        items: [{ name: 'Basic Amount', tmsAmount: 13800, vpAmount: 13800 }] },
      { no: 'WB2605012', positionTime: '2026-05-08 11:00', unloadingTime: '2026-05-07 10:00', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
        items: [{ name: 'Basic Amount', tmsAmount: 14800, vpAmount: 15500 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-06 09:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' }],
  },

  APVS2605006: {
    no: 'APVS2605006', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Reimbursement Expense'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-06', createBy: 'Laguna Logistics Corp.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605013', positionTime: '2026-05-06 09:30', unloadingTime: '2026-05-05 18:00', truckType: '6-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 14500, vpAmount: 14500 }, { name: 'Reimbursement', tmsAmount: 800, vpAmount: 600 }] },
      { no: 'WB2605014', positionTime: '2026-05-07 14:00', unloadingTime: '2026-05-06 09:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 15200, vpAmount: 15200 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-06 10:00', action: 'Created the AP statement', operator: 'Laguna Logistics Corp.' }],
  },

  APVS2605007: {
    no: 'APVS2605007', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Bangkok Express Logistics',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Exception Fee', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-07', createBy: 'Bangkok Express Logistics',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605015', positionTime: '2026-05-07 09:00', unloadingTime: '2026-05-06 18:00', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
        items: [{ name: 'Basic Amount', tmsAmount: 16500, vpAmount: 15000 }, { name: 'Exception Fee', tmsAmount: 500, vpAmount: 500 }] },
      { no: 'WB2605016', positionTime: '2026-05-08 13:30', unloadingTime: '2026-05-07 09:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 17100, vpAmount: 17100 }, { name: 'Additional Charge', tmsAmount: 0, vpAmount: 700 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-07 09:00', action: 'Created the AP statement', operator: 'Bangkok Express Logistics' }],
  },

  APVS2605008: {
    no: 'APVS2605008', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'NCR Cargo Solutions',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Reimbursement Expense'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-08', createBy: 'NCR Cargo Solutions',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605017', positionTime: '2026-05-08 09:00', unloadingTime: '2026-05-07 18:00', truckType: '6-Wheeler', origin: 'PH-NCR-Makati', destination: 'PH-Rizal-Cainta',
        items: [{ name: 'Basic Amount', tmsAmount: 17000, vpAmount: 15500 }, { name: 'Reimbursement', tmsAmount: 300, vpAmount: 300 }] },
      { no: 'WB2605018', positionTime: '2026-05-09 10:00', unloadingTime: '2026-05-08 09:00', truckType: '6-Wheeler', origin: 'PH-NCR-Caloocan / DC', destination: 'PH-Bulacan-Meycauayan',
        items: [{ name: 'Basic Amount', tmsAmount: 15500, vpAmount: 15500 }] },
      { no: 'WB2605019', positionTime: '2026-05-10 14:00', unloadingTime: '2026-05-09 10:00', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 16000, vpAmount: 17000 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-08 09:00', action: 'Created the AP statement', operator: 'NCR Cargo Solutions' }],
  },

  APVS2605009: {
    no: 'APVS2605009', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-09', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605020', positionTime: '2026-05-09 08:30', unloadingTime: '2026-05-08 18:00', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
        items: [{ name: 'Basic Amount', tmsAmount: 14000, vpAmount: 14000 }, { name: 'Additional Charge', tmsAmount: 500, vpAmount: 300 }] },
      { no: 'WB2605021', positionTime: '2026-05-10 10:30', unloadingTime: '2026-05-09 08:30', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13900, vpAmount: 14400 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-09 09:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' }],
  },

  APVS2605010: {
    no: 'APVS2605010', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Cebu Trans Lines',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    reconciliationPeriod: '2026-05-01 ~ 2026-05-31',
    currency: 'PHP', createDate: '2026-05-10', createBy: 'Cebu Trans Lines',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2605022', positionTime: '2026-05-10 08:00', unloadingTime: '2026-05-09 18:00', truckType: '10-Wheeler', origin: 'PH-Cebu City / Port', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 17600, vpAmount: 16000 }, { name: 'Additional Charge', tmsAmount: 900, vpAmount: 900 }] },
      { no: 'WB2605023', positionTime: '2026-05-11 09:30', unloadingTime: '2026-05-10 08:00', truckType: '6-Wheeler', origin: 'PH-Cebu-Mandaue / DC', destination: 'PH-Cebu City / Port',
        items: [{ name: 'Basic Amount', tmsAmount: 17600, vpAmount: 17600 }, { name: 'Exception Fee', tmsAmount: 0, vpAmount: 900 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [{ time: '2026-05-10 09:00', action: 'Created the AP statement', operator: 'Cebu Trans Lines' }],
  },
};
