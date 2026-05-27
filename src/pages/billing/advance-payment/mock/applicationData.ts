/**
 * Mock application data for Advance Payment Request detail pages.
 */

export type AppStatus =
  | 'Awaiting Confirmation'
  | 'Rejected'
  | 'Sync Failed'
  | 'Pending Payment'
  | 'Paid'
  | 'Payment Rejected';

export type Origin = 'Vendor Portal' | 'Internal';

export interface WaybillRow {
  no: string;
  status: string;
  basicAmount: number;
  allocatedPrepaid: number;
  utilization: number;
}

export interface ClaimTicket {
  id: string;
  ticketNo: string;
  ticketType: 'Claim Ticket' | 'Refund Ticket';
  amount: number;
  description: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDocument: string;
  status: 'Active' | 'Voided';
}

export interface ApplicationData {
  appNo: string;
  requestType?: 'Advance Payment Request' | 'Statement Payment Request';
  displayStatus?: string;
  source: Origin;
  vendor: string;
  submittedAt: string;
  status: AppStatus;
  waybills: WaybillRow[];
  claimTickets: ClaimTicket[];
  invoices: InvoiceRecord[];
  prepaidAmount: number;
  vatRate: number;
  vatAmount: number;
  whtRate: number;
  whtAmount: number;
  totalPayable: number;
  currency: string;
  bankName: string;
  bankAccount: string;
  proofFile: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDocument: string;
  createdAt?: string;
  associatedRecords?: Array<{ recordType: string; number: string; status: string }>;
  rfpNumber?: string;
  rfpStatus?: string;
  responsibleDepartment?: string;
  paymentDefinition?: string;
  entity?: string;
  businessUnit?: string;
  dateOfNeeded?: string;
  paymentIdentificationL1?: string;
  paymentIdentificationL2?: string;
  remark: string;
  rejectReason?: string;
  isSynced?: boolean;
}

export interface ListRow {
  appNo: string;
  appType: 'Advance Payment Request' | 'Statement Payment Request';
  source: Origin;
  vendor: string;
  waybillNos: string[];
  prepaidAmount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  submittedAt: string;
  status: AppStatus;
  rejectReason?: string;
  associatedStatementId?: string;
}

export const SAMPLE_LIST: ListRow[] = [
  {
    appNo: 'PPA2604010',
    appType: 'Advance Payment Request',
    source: 'Internal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604021', 'WB2604022'],
    prepaidAmount: 16800,
    vatAmount: 0,
    totalAmount: 16800,
    currency: 'PHP',
    submittedAt: '2026-04-26 10:30',
    status: 'Pending Payment',
  },
  {
    appNo: 'PPA2604003',
    appType: 'Advance Payment Request',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604021', 'WB2604022', 'WB2604023'],
    prepaidAmount: 25000,
    vatAmount: 3000,
    totalAmount: 27250,
    currency: 'PHP',
    submittedAt: '2026-04-20 10:15',
    status: 'Awaiting Confirmation',
  },
  {
    appNo: 'PPA2604005',
    appType: 'Advance Payment Request',
    source: 'Vendor Portal',
    vendor: 'SMC Logistics',
    waybillNos: ['WB2604030'],
    prepaidAmount: 18500,
    vatAmount: 2220,
    totalAmount: 19980.50,
    currency: 'PHP',
    submittedAt: '2026-04-22 09:00',
    status: 'Awaiting Confirmation',
  },
  {
    appNo: 'PPA2604002',
    appType: 'Advance Payment Request',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604020'],
    prepaidAmount: 8500,
    vatAmount: 1020,
    totalAmount: 9265,
    currency: 'PHP',
    submittedAt: '2026-04-18 14:30',
    status: 'Pending Payment',
  },
  {
    appNo: 'PPA2604006',
    appType: 'Advance Payment Request',
    source: 'Internal',
    vendor: 'JG Summit Freight',
    waybillNos: ['WB2604035', 'WB2604036'],
    prepaidAmount: 32000,
    vatAmount: 3840,
    totalAmount: 34560,
    currency: 'PHP',
    submittedAt: '2026-04-21 16:00',
    status: 'Pending Payment',
  },
  {
    appNo: 'PPA2604004',
    appType: 'Advance Payment Request',
    source: 'Vendor Portal',
    vendor: 'Manila Freight Co.',
    waybillNos: ['WB2604018'],
    prepaidAmount: 6000,
    vatAmount: 720,
    totalAmount: 6480,
    currency: 'PHP',
    submittedAt: '2026-04-15 11:20',
    status: 'Rejected',
    rejectReason: 'Prepaid amount exceeds 80% of basic freight for WB2604018. Please reduce amount.',
  },
  {
    appNo: 'PPA2604001',
    appType: 'Advance Payment Request',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604010', 'WB2604011'],
    prepaidAmount: 12000,
    vatAmount: 1440,
    totalAmount: 12960,
    currency: 'PHP',
    submittedAt: '2026-04-10 08:30',
    status: 'Paid',
  },
  {
    appNo: 'PPA2604007',
    appType: 'Advance Payment Request',
    source: 'Internal',
    vendor: 'Bangkok Express Logistics',
    waybillNos: ['WB2604040'],
    prepaidAmount: 45000,
    vatAmount: 3150,
    totalAmount: 47025,
    currency: 'THB',
    submittedAt: '2026-04-23 10:00',
    status: 'Paid',
  },
  {
    appNo: 'APA2604001',
    appType: 'Statement Payment Request',
    source: 'Internal',
    vendor: 'Laguna Logistics Corp.',
    waybillNos: ['WB2604050', 'WB2604051', 'WB2604052', 'WB2604053'],
    prepaidAmount: 47200,
    vatAmount: 0,
    totalAmount: 47200,
    currency: 'PHP',
    submittedAt: '2026-04-25 09:30',
    status: 'Awaiting Confirmation',
    associatedStatementId: 'AP2026040007',
  },
  {
    appNo: 'APA2604002',
    appType: 'Statement Payment Request',
    source: 'Internal',
    vendor: 'Cebu Trans Lines',
    waybillNos: ['WB2604060', 'WB2604061'],
    prepaidAmount: 38500,
    vatAmount: 0,
    totalAmount: 38500,
    currency: 'PHP',
    submittedAt: '2026-04-23 14:00',
    status: 'Awaiting Confirmation',
    associatedStatementId: 'AP2026040002',
  },
  {
    appNo: 'APA2604003',
    appType: 'Statement Payment Request',
    source: 'Internal',
    vendor: 'Bangkok Express Logistics',
    waybillNos: ['WB2604040', 'WB2604041', 'WB2604042', 'WB2604043', 'WB2604044', 'WB2604045'],
    prepaidAmount: 156000,
    vatAmount: 0,
    totalAmount: 156000,
    currency: 'THB',
    submittedAt: '2026-04-19 11:30',
    status: 'Sync Failed',
    associatedStatementId: 'AP2026040003',
  },
  {
    appNo: 'APA2604004',
    appType: 'Statement Payment Request',
    source: 'Internal',
    vendor: 'Laguna Logistics Corp.',
    waybillNos: ['WB2604055'],
    prepaidAmount: 22000,
    vatAmount: 0,
    totalAmount: 22000,
    currency: 'PHP',
    submittedAt: '2026-04-15 09:00',
    status: 'Payment Rejected',
    associatedStatementId: 'AP2026040008',
  },
];

export const APP_DATA: Record<string, ApplicationData> = {
  PPA2604010: {
    appNo: 'PPA2604010',
    requestType: 'Advance Payment Request',
    source: 'Internal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    submittedAt: '2026-04-26 10:30',
    status: 'Pending Payment',
    waybills: [
      { no: 'WB2604021', status: 'In Transit', basicAmount: 9800, allocatedPrepaid: 7200, utilization: 73.5 },
      { no: 'WB2604022', status: 'Planning', basicAmount: 13200, allocatedPrepaid: 9600, utilization: 72.7 },
    ],
    claimTickets: [
      { id: 'ct-1', ticketNo: 'CT2604021', ticketType: 'Claim Ticket', amount: 500, description: 'Late delivery penalty for WB2604021' },
    ],
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-PPA2604010', invoiceDate: '2026-04-26', invoiceDocument: 'invoice_PPA2604010.pdf', status: 'Active' },
    ],
    prepaidAmount: 16800,
    vatRate: 0,
    vatAmount: 0,
    whtRate: 0,
    whtAmount: 0,
    totalPayable: 16800,
    currency: 'PHP',
    bankName: 'BPI',
    bankAccount: '1234-5678-90',
    proofFile: 'bpi_bank_certificate.pdf',
    invoiceNumber: 'INV-PPA2604010',
    invoiceDate: '2026-04-26',
    invoiceDocument: 'invoice_PPA2604010.pdf',
    rfpNumber: 'RFP-260426-1001',
    rfpStatus: 'Created',
    responsibleDepartment: 'Account Payable Department',
    paymentDefinition: 'Bank Transfer',
    entity: 'PH Entity',
    businessUnit: 'Logistics & Trucking',
    dateOfNeeded: 'Within 3 Working Days',
    paymentIdentificationL1: 'Logistics & Trucking',
    paymentIdentificationL2: 'Domestic Trucking',
    remark: 'Demo request created from TMS and moved directly to Pending Payment.',
  },
  PPA2604003: {
    appNo: 'PPA2604003',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    submittedAt: '2026-04-20 10:15',
    status: 'Awaiting Confirmation',
    waybills: [
      { no: 'WB2604021', status: 'In Transit', basicAmount: 8000, allocatedPrepaid: 8108.11, utilization: 101.4 },
      { no: 'WB2604022', status: 'Planning', basicAmount: 15000, allocatedPrepaid: 15202.70, utilization: 101.4 },
      { no: 'WB2604023', status: 'Pending', basicAmount: 6000, allocatedPrepaid: 6089.19, utilization: 101.5 },
    ],
    claimTickets: [],
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-APR-2026-003', invoiceDate: '2026-04-20', invoiceDocument: 'invoice_CCA_Apr2026.pdf', status: 'Active' },
    ],
    prepaidAmount: 25000,
    vatRate: 12,
    vatAmount: 3000,
    whtRate: 2,
    whtAmount: 500,
    totalPayable: 27500,
    currency: 'PHP',
    bankName: 'BPI',
    bankAccount: '1234-5678-90',
    proofFile: 'payment_voucher_CCA_Apr2026.pdf',
    invoiceNumber: 'INV-APR-2026-003',
    invoiceDate: '2026-04-20',
    invoiceDocument: 'invoice_CCA_Apr2026.pdf',
    remark: 'Advance for April transport batch.',
  },
  PPA2604005: {
    appNo: 'PPA2604005',
    source: 'Vendor Portal',
    vendor: 'SMC Logistics',
    submittedAt: '2026-04-22 09:00',
    status: 'Awaiting Confirmation',
    waybills: [
      { no: 'WB2604030', status: 'In Transit', basicAmount: 20000, allocatedPrepaid: 18500, utilization: 92.5 },
    ],
    claimTickets: [],
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-SMC-20260422', invoiceDate: '2026-04-22', invoiceDocument: 'invoice_smc_advance.pdf', status: 'Active' },
    ],
    prepaidAmount: 18500,
    vatRate: 12,
    vatAmount: 2220,
    whtRate: 2,
    whtAmount: 370,
    totalPayable: 20350,
    currency: 'PHP',
    bankName: 'BDO',
    bankAccount: '5566-7788-99',
    proofFile: '',
    invoiceNumber: 'INV-SMC-20260422',
    invoiceDate: '2026-04-22',
    invoiceDocument: 'invoice_smc_advance.pdf',
    remark: '',
  },
  PPA2604002: {
    appNo: 'PPA2604002',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    submittedAt: '2026-04-18 14:30',
    status: 'Pending Payment',
    waybills: [
      { no: 'WB2604020', status: 'In Transit', basicAmount: 12500, allocatedPrepaid: 8500, utilization: 68.0 },
    ],
    claimTickets: [],
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-APR-2026-002', invoiceDate: '2026-04-18', invoiceDocument: 'invoice_advance_apr18.pdf', status: 'Active' },
    ],
    prepaidAmount: 8500,
    vatRate: 12,
    vatAmount: 1020,
    whtRate: 2,
    whtAmount: 170,
    totalPayable: 9350,
    currency: 'PHP',
    bankName: 'BPI',
    bankAccount: '1234-5678-90',
    proofFile: 'advance_request_apr18.pdf',
    invoiceNumber: 'INV-APR-2026-002',
    invoiceDate: '2026-04-18',
    invoiceDocument: 'invoice_advance_apr18.pdf',
    rfpNumber: 'RFP-260418-1002',
    rfpStatus: 'Created',
    responsibleDepartment: 'Account Payable Department',
    paymentDefinition: 'Bank Transfer',
    entity: 'PH Entity',
    businessUnit: 'Logistics & Trucking',
    dateOfNeeded: 'Within 3 Working Days',
    paymentIdentificationL1: 'Logistics & Trucking',
    paymentIdentificationL2: 'Domestic Trucking',
    remark: 'Advance payment for April trucking batch.',
  },
};

export const FALLBACK: ApplicationData = {
  appNo: 'PPA2604001',
  source: 'Vendor Portal',
  vendor: 'Coca-Cola Bottlers PH Inc.',
  submittedAt: '2026-04-10 08:30',
  status: 'Paid',
  waybills: [
    { no: 'WB2604010', status: 'Delivered', basicAmount: 10000, allocatedPrepaid: 7000, utilization: 70.0 },
    { no: 'WB2604011', status: 'Delivered', basicAmount: 8000, allocatedPrepaid: 5000, utilization: 62.5 },
  ],
  claimTickets: [],
  invoices: [
    { id: 'inv-1', invoiceNumber: 'INV-APR-2026-001', invoiceDate: '2026-04-10', invoiceDocument: 'invoice_advance_apr10.pdf', status: 'Active' },
  ],
  prepaidAmount: 12000,
  vatRate: 12,
  vatAmount: 1440,
  whtRate: 2,
  whtAmount: 240,
  totalPayable: 13200,
  currency: 'PHP',
  bankName: 'BPI',
  bankAccount: '1234-5678-90',
  proofFile: 'advance_request_apr10.pdf',
  invoiceNumber: 'INV-APR-2026-001',
  invoiceDate: '2026-04-10',
  invoiceDocument: 'invoice_advance_apr10.pdf',
  rfpNumber: 'RFP-260410-0998',
  rfpStatus: 'Paid',
  responsibleDepartment: 'Account Payable Department',
  paymentDefinition: 'Bank Transfer',
  entity: 'PH Entity',
  businessUnit: 'Logistics & Trucking',
  dateOfNeeded: 'Within 3 Working Days',
  paymentIdentificationL1: 'Logistics & Trucking',
  paymentIdentificationL2: 'Domestic Trucking',
  remark: 'Advance for April waybills WB2604010 and WB2604011.',
};

export const STATEMENT_PAYMENT_DATA: Record<string, ApplicationData> = {
  APA2604001: {
    appNo: 'APA2604001',
    requestType: 'Statement Payment Request',
    displayStatus: 'Pending Payment',
    source: 'Internal',
    vendor: 'Laguna Logistics Corp.',
    submittedAt: '2026-04-25 09:30',
    createdAt: '2026-04-25',
    status: 'Awaiting Confirmation' as AppStatus,
    waybills: [],
    claimTickets: [],
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-APA2604001', invoiceDate: '2026-04-25', invoiceDocument: 'invoice_APA2604001.pdf', status: 'Active' },
    ],
    prepaidAmount: 47200,
    vatRate: 7,
    vatAmount: 77,
    whtRate: 2,
    whtAmount: 22,
    totalPayable: 37650,
    currency: 'PHP',
    bankName: 'BPI',
    bankAccount: '1000-2582-3030',
    proofFile: '',
    invoiceNumber: 'INV-APA2604001',
    invoiceDate: '2026-04-25',
    invoiceDocument: 'invoice_APA2604001.pdf',
    associatedRecords: [
      { recordType: 'AP Statement', number: 'AP2026080811F4', status: 'Pending Payment' },
      { recordType: 'RFP', number: 'Pay-TH2605150037', status: 'Pending Review' },
    ],
    remark: '',
  },
};

// RFP select options
export const RESPONSIBLE_DEPARTMENTS = ['Account Payable Department', 'Procurement Department', 'Finance Department'];
export const PAYMENT_DEFINITIONS = ['Bank Transfer', 'Cash', 'Check'];
export const ENTITIES = ['PH Entity', 'TH Entity', 'SG Entity'];
export const BUSINESS_UNITS = ['Logistics & Trucking', 'Freight Forwarding', 'Warehousing'];
export const PAYMENT_ID_L1 = ['Logistics & Trucking', 'Global Forwarding'];
export const PAYMENT_ID_L2 = ['Domestic Trucking', 'International Freight', 'Last Mile'];

export const VENDORS = [
  'Coca-Cola Bottlers PH Inc.',
  'SMC Logistics',
  'JG Summit Freight',
  'Manila Freight Co.',
  'Bangkok Express Logistics',
];

export interface BankInfoEntry {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  proof: string;
}

export const VENDOR_BANK_INFOS: Record<string, BankInfoEntry[]> = {
  'Coca-Cola Bottlers PH Inc.': [
    { id: 'cc-bpi', bankName: 'BPI', accountName: 'Coca-Cola Bottlers PH Inc.', accountNumber: '1234-5678-90', proof: 'bpi_bank_certificate.pdf' },
    { id: 'cc-bdo', bankName: 'BDO', accountName: 'Coca-Cola Bottlers PH Inc.', accountNumber: '9876-5432-10', proof: 'bdo_account_proof.pdf' },
  ],
  'SMC Logistics': [
    { id: 'smc-metro', bankName: 'Metrobank', accountName: 'SMC Logistics', accountNumber: '1111-2222-33', proof: 'metrobank_proof.pdf' },
  ],
  'JG Summit Freight': [
    { id: 'jg-bdo', bankName: 'BDO', accountName: 'JG Summit Freight', accountNumber: '4444-5555-66', proof: 'bdo_jg_proof.pdf' },
    { id: 'jg-union', bankName: 'UnionBank', accountName: 'JG Summit Freight', accountNumber: '7777-8888-99', proof: 'unionbank_jg_proof.pdf' },
  ],
  'Manila Freight Co.': [
    { id: 'mf-bpi', bankName: 'BPI', accountName: 'Manila Freight Co.', accountNumber: '3333-4444-55', proof: 'bpi_mf_proof.pdf' },
  ],
  'Bangkok Express Logistics': [
    { id: 'be-kasikorn', bankName: 'Kasikorn', accountName: 'Bangkok Express Logistics', accountNumber: '6666-7777-88', proof: 'kasikorn_proof.pdf' },
  ],
};
