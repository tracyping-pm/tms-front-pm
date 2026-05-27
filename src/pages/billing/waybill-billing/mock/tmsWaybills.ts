// ─── Types ─────────────────────────────────────────────────────────────────────

export type WaybillStatus =
  | 'Delivered'
  | 'In Transit'
  | 'Planning'
  | 'Awaiting Settlement';

export interface Waybill {
  no: string;
  status: WaybillStatus;
  vendor: string;
  customer: string;
  truckType: '6-Wheeler' | '10-Wheeler' | '4-Wheeler';
  origin: string;
  destination: string;
  positionTime: string;
  deliveryDate: string;
  basicAmount: number;
  linkedStatement?: string;
}

export interface BillingItem {
  name: string;
  amount: number;
  status?: string;
  statusColor?: string;
}

export interface WaybillBillingData {
  no: string;
  customerTruckType: string;
  requiredTruckType: string;
  vendorTruckType: string;
  vendorRequiredTruckType: string;
  contractRevenue: BillingItem[];
  contractCost: BillingItem[];
  linkedStatement?: string;
  operationLog: { time: string; actor: string; action: string; detail?: string }[];
}

// ─── Waybill List Data ─────────────────────────────────────────────────────────

export const WAYBILLS: Waybill[] = [
  // Awaiting Settlement — pre-seeded to demo the filter feature
  {
    no: 'WB2604011', status: 'Awaiting Settlement',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-11 09:00', deliveryDate: '2026-04-12', basicAmount: 14500,
    linkedStatement: 'APVS2604002',
  },
  {
    no: 'WB2604013', status: 'Awaiting Settlement',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-13 11:15', deliveryDate: '2026-04-14', basicAmount: 15000,
    linkedStatement: 'APVS2604002',
  },
  {
    no: 'WB2604016', status: 'Awaiting Settlement',
    vendor: 'Bangkok Express Logistics', customer: 'Unilever PH',
    truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
    positionTime: '2026-04-16 10:45', deliveryDate: '2026-04-17', basicAmount: 11800,
    linkedStatement: 'APVS2604003',
  },
  // Normal waybills
  {
    no: 'WB2604012', status: 'Delivered',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-12 17:00', deliveryDate: '2026-04-13', basicAmount: 13300,
    linkedStatement: 'APVS2604002',
  },
  {
    no: 'WB2604014', status: 'Delivered',
    vendor: 'Laguna Logistics Corp.', customer: 'SMC PH',
    truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    positionTime: '2026-04-14 08:30', deliveryDate: '2026-04-15', basicAmount: 12000,
    linkedStatement: 'APVS2604003',
  },
  {
    no: 'WB2604015', status: 'In Transit',
    vendor: 'Laguna Logistics Corp.', customer: 'SMC PH',
    truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-15 14:00', deliveryDate: '2026-04-16', basicAmount: 13300,
  },
  {
    no: 'WB2604017', status: 'In Transit',
    vendor: 'Manila Freight Co.', customer: 'Jollibee Foods',
    truckType: '4-Wheeler', origin: 'PH-NCR-Caloocan / DC', destination: 'PH-Rizal-Cainta',
    positionTime: '2026-04-17 09:00', deliveryDate: '2026-04-18', basicAmount: 9800,
  },
  {
    no: 'WB2604018', status: 'Planning',
    vendor: 'Bangkok Express Logistics', customer: 'Unilever PH',
    truckType: '6-Wheeler', origin: 'PH-Batangas-Lipa / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-18 14:30', deliveryDate: '2026-04-19', basicAmount: 10500,
  },
  {
    no: 'WB2604020', status: 'Delivered',
    vendor: 'Laguna Logistics Corp.', customer: 'P&G PH',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
    positionTime: '2026-04-01 08:00', deliveryDate: '2026-04-02', basicAmount: 16800,
    linkedStatement: 'APVS2604004',
  },
  // ─── V26: 10 Standard AP Statements demo data ──────────────────────────────
  // APVS2605001 — Manila Freight Co.
  {
    no: 'WB2605001', status: 'Awaiting Settlement',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-05-01 09:00', deliveryDate: '2026-05-02', basicAmount: 14500,
    linkedStatement: 'APVS2605001',
  },
  {
    no: 'WB2605002', status: 'Delivered',
    vendor: 'Manila Freight Co.', customer: 'Jollibee Foods Corp.',
    truckType: '4-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Makati',
    positionTime: '2026-05-02 14:00', deliveryDate: '2026-05-03', basicAmount: 13300,
    linkedStatement: 'APVS2605001',
  },
  // APVS2605002 — Laguna Logistics Corp.
  {
    no: 'WB2605003', status: 'Delivered',
    vendor: 'Laguna Logistics Corp.', customer: 'P&G PH',
    truckType: '6-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    positionTime: '2026-05-02 08:30', deliveryDate: '2026-05-03', basicAmount: 16000,
    linkedStatement: 'APVS2605002',
  },
  {
    no: 'WB2605004', status: 'In Transit',
    vendor: 'Laguna Logistics Corp.', customer: 'SMC PH',
    truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-05-03 13:00', deliveryDate: '2026-05-04', basicAmount: 14200,
    linkedStatement: 'APVS2605002',
  },
  // APVS2605003 — Bangkok Express Logistics
  {
    no: 'WB2605005', status: 'Awaiting Settlement',
    vendor: 'Bangkok Express Logistics', customer: 'Unilever PH',
    truckType: '6-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Quezon City',
    positionTime: '2026-05-03 10:30', deliveryDate: '2026-05-04', basicAmount: 15000,
    linkedStatement: 'APVS2605003',
  },
  {
    no: 'WB2605006', status: 'Delivered',
    vendor: 'Bangkok Express Logistics', customer: 'Unilever PH',
    truckType: '6-Wheeler', origin: 'PH-NCR-Taguig', destination: 'PH-Bulacan-Meycauayan',
    positionTime: '2026-05-04 09:00', deliveryDate: '2026-05-05', basicAmount: 13800,
    linkedStatement: 'APVS2605003',
  },
  {
    no: 'WB2605007', status: 'Delivered',
    vendor: 'Bangkok Express Logistics', customer: 'Nestle PH',
    truckType: '10-Wheeler', origin: 'PH-Batangas-Lipa / DC', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-05-05 14:00', deliveryDate: '2026-05-06', basicAmount: 14000,
    linkedStatement: 'APVS2605003',
  },
  // APVS2605004 — Cebu Trans Lines
  {
    no: 'WB2605008', status: 'Delivered',
    vendor: 'Cebu Trans Lines', customer: 'Nestle PH',
    truckType: '4-Wheeler', origin: 'PH-Cebu City / Port', destination: 'PH-Cebu-Mandaue / DC',
    positionTime: '2026-05-04 08:00', deliveryDate: '2026-05-05', basicAmount: 12800,
    linkedStatement: 'APVS2605004',
  },
  {
    no: 'WB2605009', status: 'Delivered',
    vendor: 'Cebu Trans Lines', customer: 'Nestle PH',
    truckType: '6-Wheeler', origin: 'PH-Cebu-Mandaue / DC', destination: 'PH-Cebu City / Port',
    positionTime: '2026-05-05 09:30', deliveryDate: '2026-05-06', basicAmount: 13600,
    linkedStatement: 'APVS2605004',
  },
  // APVS2605005 — Manila Freight Co.
  {
    no: 'WB2605010', status: 'Awaiting Settlement',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '10-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-05-06 08:00', deliveryDate: '2026-05-07', basicAmount: 15500,
    linkedStatement: 'APVS2605005',
  },
  {
    no: 'WB2605011', status: 'Delivered',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '6-Wheeler', origin: 'PH-NCR-Caloocan / DC', destination: 'PH-Rizal-Cainta',
    positionTime: '2026-05-07 10:00', deliveryDate: '2026-05-08', basicAmount: 13800,
    linkedStatement: 'APVS2605005',
  },
  {
    no: 'WB2605012', status: 'In Transit',
    vendor: 'Manila Freight Co.', customer: 'Jollibee Foods Corp.',
    truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    positionTime: '2026-05-08 11:00', deliveryDate: '2026-05-09', basicAmount: 14800,
    linkedStatement: 'APVS2605005',
  },
  // APVS2605006 — Laguna Logistics Corp.
  {
    no: 'WB2605013', status: 'Delivered',
    vendor: 'Laguna Logistics Corp.', customer: 'P&G PH',
    truckType: '6-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
    positionTime: '2026-05-06 09:30', deliveryDate: '2026-05-07', basicAmount: 14500,
    linkedStatement: 'APVS2605006',
  },
  {
    no: 'WB2605014', status: 'Delivered',
    vendor: 'Laguna Logistics Corp.', customer: 'SMC PH',
    truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-05-07 14:00', deliveryDate: '2026-05-08', basicAmount: 15200,
    linkedStatement: 'APVS2605006',
  },
  // APVS2605007 — Bangkok Express Logistics
  {
    no: 'WB2605015', status: 'Delivered',
    vendor: 'Bangkok Express Logistics', customer: 'Unilever PH',
    truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
    positionTime: '2026-05-07 09:00', deliveryDate: '2026-05-08', basicAmount: 16500,
    linkedStatement: 'APVS2605007',
  },
  {
    no: 'WB2605016', status: 'In Transit',
    vendor: 'Bangkok Express Logistics', customer: 'Unilever PH',
    truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-05-08 13:30', deliveryDate: '2026-05-09', basicAmount: 17100,
    linkedStatement: 'APVS2605007',
  },
  // APVS2605008 — NCR Cargo Solutions (WB2605017 already returned & edited)
  {
    no: 'WB2605017', status: 'Delivered',
    vendor: 'NCR Cargo Solutions', customer: 'Universal Robina Corp.',
    truckType: '6-Wheeler', origin: 'PH-NCR-Makati', destination: 'PH-Rizal-Cainta',
    positionTime: '2026-05-08 09:00', deliveryDate: '2026-05-09', basicAmount: 17000,
    linkedStatement: 'APVS2605008',
  },
  {
    no: 'WB2605018', status: 'Delivered',
    vendor: 'NCR Cargo Solutions', customer: 'Universal Robina Corp.',
    truckType: '6-Wheeler', origin: 'PH-NCR-Caloocan / DC', destination: 'PH-Bulacan-Meycauayan',
    positionTime: '2026-05-09 10:00', deliveryDate: '2026-05-10', basicAmount: 15500,
    linkedStatement: 'APVS2605008',
  },
  {
    no: 'WB2605019', status: 'Delivered',
    vendor: 'NCR Cargo Solutions', customer: 'Universal Robina Corp.',
    truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-05-10 14:00', deliveryDate: '2026-05-11', basicAmount: 16000,
    linkedStatement: 'APVS2605008',
  },
  // APVS2605009 — Manila Freight Co.
  {
    no: 'WB2605020', status: 'Delivered',
    vendor: 'Manila Freight Co.', customer: 'Coca-Cola PH',
    truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    positionTime: '2026-05-09 08:30', deliveryDate: '2026-05-10', basicAmount: 14000,
    linkedStatement: 'APVS2605009',
  },
  {
    no: 'WB2605021', status: 'In Transit',
    vendor: 'Manila Freight Co.', customer: 'Jollibee Foods Corp.',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
    positionTime: '2026-05-10 10:30', deliveryDate: '2026-05-11', basicAmount: 13900,
    linkedStatement: 'APVS2605009',
  },
  // APVS2605010 — Cebu Trans Lines
  {
    no: 'WB2605022', status: 'Awaiting Settlement',
    vendor: 'Cebu Trans Lines', customer: 'Nestle PH',
    truckType: '10-Wheeler', origin: 'PH-Cebu City / Port', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-05-10 08:00', deliveryDate: '2026-05-11', basicAmount: 17600,
    linkedStatement: 'APVS2605010',
  },
  {
    no: 'WB2605023', status: 'Delivered',
    vendor: 'Cebu Trans Lines', customer: 'Nestle PH',
    truckType: '6-Wheeler', origin: 'PH-Cebu-Mandaue / DC', destination: 'PH-Cebu City / Port',
    positionTime: '2026-05-11 09:30', deliveryDate: '2026-05-12', basicAmount: 17600,
    linkedStatement: 'APVS2605010',
  },
];

// ─── Billing Detail Data ───────────────────────────────────────────────────────

export const WAYBILL_DATA: Record<string, WaybillBillingData> = {
  WB2604011: {
    no: 'WB2604011',
    customerTruckType: '6-Wheeler', requiredTruckType: '6-Wheeler',
    vendorTruckType: '6-Wheeler', vendorRequiredTruckType: '6-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 14500, status: 'Write off', statusColor: '#cf1322' },
      { name: 'Additional Amount Receivable', amount: 800, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 0, status: 'Under Billing Preparation', statusColor: '#d46b08' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 14500, status: 'Returned', statusColor: '#cf1322' },
      { name: 'Additional Amount Payable', amount: 800, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2604002',
    operationLog: [
      { time: '2026-04-12 10:30', actor: 'Keris', action: 'Run Waybill', detail: 'Sum: 2,600.00 → 1,500.00' },
      { time: '2026-04-14 09:23', actor: 'Zhuge Liang', action: 'Edit Basic Amount Payable (Remaining): 2,600.00 → 1,000.00' },
    ],
  },
  WB2604013: {
    no: 'WB2604013',
    customerTruckType: '10-Wheeler', requiredTruckType: '10-Wheeler',
    vendorTruckType: '10-Wheeler', vendorRequiredTruckType: '10-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 15000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 1200, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 500, status: 'Under Billing Preparation', statusColor: '#d46b08' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 15000, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 1200, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 500, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2604003',
    operationLog: [
      { time: '2026-04-13 11:00', actor: 'System', action: 'Waybill created' },
      { time: '2026-04-14 10:30', actor: 'Zhuge Liang', action: 'Linked to AP Statement APVS2604003' },
    ],
  },

  // WB2605001 — Awaiting Settlement (Basic Amount Returned)
  WB2605001: {
    no: 'WB2605001',
    customerTruckType: '6-Wheeler', requiredTruckType: '6-Wheeler',
    vendorTruckType: '6-Wheeler', vendorRequiredTruckType: '6-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 14500, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 800, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 14500, status: 'Returned', statusColor: '#cf1322' },
      { name: 'Additional Amount Payable', amount: 800, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605001',
    operationLog: [
      { time: '2026-05-01 09:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-02 10:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605001' },
    ],
  },

  WB2605002: {
    no: 'WB2605002',
    customerTruckType: '4-Wheeler', requiredTruckType: '4-Wheeler',
    vendorTruckType: '4-Wheeler', vendorRequiredTruckType: '4-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 13300, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Exception Fee', amount: 500, status: 'Under Billing Preparation', statusColor: '#d46b08' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 13300, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605001',
    operationLog: [
      { time: '2026-05-02 14:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-03 09:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605001' },
    ],
  },

  // WB2605005 — Awaiting Settlement (Basic Amount Returned)
  WB2605005: {
    no: 'WB2605005',
    customerTruckType: '6-Wheeler', requiredTruckType: '6-Wheeler',
    vendorTruckType: '6-Wheeler', vendorRequiredTruckType: '6-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 15000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 600, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 15000, status: 'Returned', statusColor: '#cf1322' },
      { name: 'Additional Amount Payable', amount: 600, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605003',
    operationLog: [
      { time: '2026-05-03 11:00', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-04 09:30', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605003' },
    ],
  },

  WB2605007: {
    no: 'WB2605007',
    customerTruckType: '10-Wheeler', requiredTruckType: '10-Wheeler',
    vendorTruckType: '10-Wheeler', vendorRequiredTruckType: '10-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 14000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 14000, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605003',
    operationLog: [
      { time: '2026-05-05 14:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-06 10:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605003' },
    ],
  },

  // WB2605010 — Awaiting Settlement (Basic Amount Returned)
  WB2605010: {
    no: 'WB2605010',
    customerTruckType: '10-Wheeler', requiredTruckType: '10-Wheeler',
    vendorTruckType: '10-Wheeler', vendorRequiredTruckType: '10-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 15500, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 1000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 15500, status: 'Returned', statusColor: '#cf1322' },
      { name: 'Additional Amount Payable', amount: 1000, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605005',
    operationLog: [
      { time: '2026-05-06 08:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-07 10:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605005' },
    ],
  },

  // WB2605017 — Delivered, already returned & edited
  WB2605017: {
    no: 'WB2605017',
    customerTruckType: '6-Wheeler', requiredTruckType: '6-Wheeler',
    vendorTruckType: '6-Wheeler', vendorRequiredTruckType: '6-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 17000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 15500, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 300, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: -1500, status: 'Under Payment Preparation', statusColor: '#d46b08' },
    ],
    linkedStatement: 'APVS2605008',
    operationLog: [
      { time: '2026-05-08 09:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-09 10:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605008' },
      { time: '2026-05-10 14:30', actor: 'Zhang Jialei', action: 'Edit Basic Amount Payable (Remaining): 17,000.00 → 15,500.00' },
    ],
  },

  WB2605019: {
    no: 'WB2605019',
    customerTruckType: '10-Wheeler', requiredTruckType: '10-Wheeler',
    vendorTruckType: '10-Wheeler', vendorRequiredTruckType: '10-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 16000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 16000, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605008',
    operationLog: [
      { time: '2026-05-10 14:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-11 09:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605008' },
    ],
  },

  // WB2605022 — Awaiting Settlement (Basic Amount Returned)
  WB2605022: {
    no: 'WB2605022',
    customerTruckType: '10-Wheeler', requiredTruckType: '10-Wheeler',
    vendorTruckType: '10-Wheeler', vendorRequiredTruckType: '10-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 17600, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 900, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 17600, status: 'Returned', statusColor: '#cf1322' },
      { name: 'Additional Amount Payable', amount: 900, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Reimbursement Expense', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Under-bill', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2605010',
    operationLog: [
      { time: '2026-05-10 08:30', actor: 'System', action: 'Waybill created' },
      { time: '2026-05-11 09:00', actor: 'Zhang Jialei', action: 'Linked to AP Statement APVS2605010' },
    ],
  },
};
