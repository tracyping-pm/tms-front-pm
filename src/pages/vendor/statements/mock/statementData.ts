// Mock statement data for the VP My Statements module
// Covers all 4 VP statuses + Inteluck-origin statements + Standalone type

import { type StatementWaybillRow, type StatementClaimRow } from './waybills';

// ── Types ─────────────────────────────────────────────────────────────────────

export type VpStatus =
  | 'Draft'
  | 'Awaiting Inteluck Confirmation'
  | 'Awaiting Re-bill'
  | 'Pending Payment'
  | 'Collected'
  | 'Canceled';

export type StatementOrigin = 'Self-Created' | 'Inteluck';
export type StatementType = 'Standard' | 'Standalone';

export interface StatementListRow {
  no: string;
  origin: StatementOrigin;
  totalSubmittedAmount: number;
  currency: string;
  statementType: StatementType;
  waybillCount: number;
  invoiceNo: string;
  status: VpStatus;
  createdAt: string;
  rejectReason?: string;
}

export interface InvoiceEntry {
  invoiceNo: string;
  invoiceAmount: number;
  invoiceDate: string;
  proofName?: string;
}

export interface PaymentEntry {
  payableAmount: number;
  paymentStatus: string;
  applicationNo: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
  proofName?: string;
}

export interface OperationLogEntry {
  timestamp: string;
  action: string;
  operator: string;
  subLine?: string;
}

export interface MiscChargeRow {
  object: string;
  amount: number;
  proof: string;
}

export interface StandaloneInvoiceRow {
  number: string;
  amount: number;
  date: string;
  proof: string;
}

export interface StandaloneProofRow {
  message: string;
}

export interface StatementDetailData {
  source: StatementOrigin;
  statementType?: StatementType;
  reconciliationPeriod: string;
  taxMark: string;
  totalAmountPayable: number;
  createDate: string;
  waybills: StatementWaybillRow[];
  claimTickets: StatementClaimRow[];
  // Amount summary breakdown
  waybillContractCost: number;
  vendorBasicAmount: number;
  prepaidAmount: number;
  vendorExceptionFee: number;
  vendorAdditionalCharge: number;
  kpiClaim: number;
  vat: number;
  wht: number;
  // Conditional sections
  invoices?: InvoiceEntry[];
  payments?: PaymentEntry[];
  operationLog?: OperationLogEntry[];
  rejectReason?: string;
  // Standalone-specific
  miscCharges?: MiscChargeRow[];
  standaloneInvoices?: StandaloneInvoiceRow[];
  standaloneProofs?: StandaloneProofRow[];
}

// ── Shared fixtures ───────────────────────────────────────────────────────────

const BASE_WAYBILL: StatementWaybillRow = {
  no: 'WB2604050',
  waybillAmount: 13300,
  basicAmount: 13300,
  prepaidAmount: 0,
  additionalCharge: 0,
  exceptionFee: 0,
  reimbursement: 0,
  positionTime: '2026-04-16 12:45',
  unloadingTime: '2026-04-16 08:30',
  truckType: '10-Wheeler',
  origin: 'Manila',
  destination: 'Laguna',
};

const BASE_CLAIM: StatementClaimRow = {
  ticketNo: 'PHCT2604001',
  claimType: 'KPI Claim',
  relatedWaybill: 'WB2604050',
  claimAmount: 2000,
};

const BASE_INVOICE: InvoiceEntry = {
  invoiceNo: 'INV-PH-2604006',
  invoiceAmount: 44500,
  invoiceDate: '2026-04-15',
  proofName: 'Invoice 123.pdf',
};

const BASE_OP_LOG: OperationLogEntry[] = [
  {
    timestamp: '2026-04-25 09:20',
    action: 'Rejected the AP statement',
    operator: 'Keris',
    subLine: 'Reject Reason : 7PIWJ Amount is wrong',
  },
  {
    timestamp: '2026-04-24 09:20',
    action: 'Created the AP statement',
    operator: 'Olymris',
  },
];

const PENDING_PAYMENTS: PaymentEntry[] = [
  {
    payableAmount: 12000,
    paymentStatus: 'Pending Payment',
    applicationNo: 'wwerr32436546',
    bankName: 'ACAA Trucking Services',
    bankAccountName: 'SSSSS',
    bankAccountNo: '555555',
  },
  {
    payableAmount: 12000,
    paymentStatus: 'Pending Payment',
    applicationNo: 'werwe2324325',
    bankName: 'ACAA Trucking Services',
    bankAccountName: 'SSSSS',
    bankAccountNo: '555555',
  },
  {
    payableAmount: 12000,
    paymentStatus: 'Pending Payment',
    applicationNo: '1223ewr',
    bankName: 'ACAA Trucking Services',
    bankAccountName: 'SSSSS',
    bankAccountNo: '555555',
  },
];

const PAID_PAYMENTS: PaymentEntry[] = [
  {
    payableAmount: 12000,
    paymentStatus: 'Collected',
    applicationNo: 'wwerr32436546',
    proofName: 'released 123.pdf',
    bankName: 'ACAA Trucking Services',
    bankAccountName: 'SSSSS',
    bankAccountNo: '555555',
  },
  {
    payableAmount: 12000,
    paymentStatus: 'Collected',
    applicationNo: 'werwe2324325',
    proofName: 'released 123.pdf',
    bankName: 'ACAA Trucking Services',
    bankAccountName: 'SSSSS',
    bankAccountNo: '555555',
  },
  {
    payableAmount: 12000,
    paymentStatus: 'Collected',
    applicationNo: '1223ewr',
    proofName: 'released 123.pdf',
    bankName: 'ACAA Trucking Services',
    bankAccountName: 'SSSSS',
    bankAccountNo: '555555',
  },
];

const BASE_AMOUNTS = {
  waybillContractCost: 22000,
  vendorBasicAmount: 23190,
  prepaidAmount: 3190,
  vendorExceptionFee: 1000,
  vendorAdditionalCharge: 1000,
  kpiClaim: 2000,
  vat: 1000,
  wht: 200,
  totalAmountPayable: 23190,
};

// ── List rows (SAMPLE_STATEMENTS) ─────────────────────────────────────────────

export const SAMPLE_STATEMENTS: StatementListRow[] = [
  // Draft — Self-Created, Standard
  {
    no: 'VS2604008',
    origin: 'Self-Created',
    totalSubmittedAmount: 0,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 2,
    invoiceNo: '—',
    status: 'Draft',
    createdAt: '2026-04-28 09:20',
  },
  // Awaiting Inteluck Confirmation — Self-Created, Standard
  {
    no: 'VS2604001',
    origin: 'Self-Created',
    totalSubmittedAmount: 52800,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 3,
    invoiceNo: 'INV-2026-00201',
    status: 'Awaiting Inteluck Confirmation',
    createdAt: '2026-04-20 10:15',
  },
  // Awaiting Re-bill — Self-Created, Standalone (with reject reason)
  {
    no: 'VS2604002',
    origin: 'Self-Created',
    totalSubmittedAmount: 38500,
    currency: 'PHP',
    statementType: 'Standalone',
    waybillCount: 2,
    invoiceNo: 'INV-2026-00198',
    status: 'Awaiting Re-bill',
    createdAt: '2026-04-18 14:30',
    rejectReason:
      'Basic Amount for WB2604011 exceeds contracted rate. Please correct and resubmit.',
  },
  // Pending Payment — Inteluck origin, Standard
  {
    no: 'VS2604003',
    origin: 'Inteluck',
    totalSubmittedAmount: 68800,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 4,
    invoiceNo: 'INV-2026-00185',
    status: 'Pending Payment',
    createdAt: '2026-04-13 11:45',
  },
  // Collected — Self-Created, Standalone
  {
    no: 'VS2603001',
    origin: 'Self-Created',
    totalSubmittedAmount: 48000,
    currency: 'PHP',
    statementType: 'Standalone',
    waybillCount: 3,
    invoiceNo: 'INV-2026-00157',
    status: 'Collected',
    createdAt: '2026-03-28 14:10',
  },
  // Canceled — Self-Created, Standard
  {
    no: 'VS2603003',
    origin: 'Self-Created',
    totalSubmittedAmount: 15500,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 1,
    invoiceNo: '—',
    status: 'Canceled',
    createdAt: '2026-03-10 16:45',
  },
];

// ── Detail data map ───────────────────────────────────────────────────────────

export const STATEMENT_DETAIL_MAP: Record<string, StatementDetailData> = {
  // Draft
  VS2604008: {
    source: 'Self-Created',
    statementType: 'Standard',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    createDate: '2026-04-28',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    operationLog: [
      {
        timestamp: '2026-04-28 09:20',
        action: 'Created the AP statement',
        operator: 'Olymris',
      },
    ],
  },
  // Awaiting Inteluck Confirmation
  VS2604001: {
    source: 'Self-Created',
    statementType: 'Standard',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    createDate: '2026-04-20',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    invoices: [BASE_INVOICE],
    operationLog: [
      {
        timestamp: '2026-04-20 10:15',
        action: 'Submitted the AP statement',
        operator: 'Olymris',
      },
      {
        timestamp: '2026-04-20 09:00',
        action: 'Created the AP statement',
        operator: 'Olymris',
      },
    ],
  },
  // Awaiting Re-bill — Standalone
  VS2604002: {
    source: 'Self-Created',
    statementType: 'Standalone',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    createDate: '2026-04-18',
    waybills: [],
    claimTickets: [],
    ...BASE_AMOUNTS,
    rejectReason:
      'Vendor overcharged on WB2604055 Additional Charge by PHP 2,000. Please review and resubmit.',
    miscCharges: [
      { object: 'Fuel Surcharge', amount: 12000, proof: 'fuel_receipt.pdf' },
      { object: 'Toll Fee', amount: 800, proof: 'toll_receipt.pdf' },
    ],
    standaloneInvoices: [
      { number: 'INV-2026-00198', amount: 12800, date: '2026-04-17', proof: 'invoice.pdf' },
    ],
    standaloneProofs: [
      { message: 'Supporting documents attached — fuel receipts and toll tickets for April 2026.' },
    ],
    operationLog: BASE_OP_LOG,
  },
  // Pending Payment — Inteluck origin, Standard
  VS2604003: {
    source: 'Inteluck',
    statementType: 'Standard',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    createDate: '2026-04-13',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    invoices: [BASE_INVOICE],
    payments: PENDING_PAYMENTS,
    operationLog: BASE_OP_LOG,
  },
  // Collected — Self-Created, Standalone
  VS2603001: {
    source: 'Self-Created',
    statementType: 'Standalone',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    createDate: '2026-03-28',
    waybills: [],
    claimTickets: [],
    ...BASE_AMOUNTS,
    miscCharges: [
      { object: 'Miscellaneous Charge', amount: 20000, proof: 'misc_receipt.pdf' },
      { object: 'Handling Fee', amount: 8000, proof: 'handling.pdf' },
    ],
    standaloneInvoices: [
      { number: 'INV-2026-00157', amount: 28000, date: '2026-03-25', proof: 'invoice_157.pdf' },
    ],
    invoices: [BASE_INVOICE],
    payments: PAID_PAYMENTS,
    operationLog: BASE_OP_LOG,
  },
  // Canceled — Self-Created, Standard
  VS2603003: {
    source: 'Self-Created',
    statementType: 'Standard',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    createDate: '2026-03-10',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    operationLog: [
      {
        timestamp: '2026-04-10 14:30',
        action: 'Canceled the AP statement',
        operator: 'Olymris',
        subLine:
          'Cancel Reason : Duplicate statement, resubmitting under correct period',
      },
      {
        timestamp: '2026-04-10 09:00',
        action: 'Created the AP statement',
        operator: 'Olymris',
      },
    ],
  },
};
