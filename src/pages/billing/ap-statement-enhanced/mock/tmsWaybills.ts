export type TmsWaybillItemName =
  | 'Basic Amount'
  | 'Additional Charge'
  | 'Exception Fee'
  | 'Reimbursement Expense';

export interface TmsWaybill {
  no: string;
  vendor: string;
  truckType: string;
  origin: string;
  destination: string;
  positionTime: string;
  unloadingTime: string;
  basicAmount: number;
  exceptionFee: number;
  additionalCharge: number;
  reimbursement: number;
  prepaid: number;
  status: 'Delivered' | 'Settled' | 'Canceled';
  /** Whole-waybill block (legacy). When set, the waybill cannot be added at all. */
  alreadyInStatement?: string;
  /**
   * Per-item linkage — when a settlement item is already linked to another
   * statement, that item is greyed-out / not addable, but other items remain available.
   */
  linkedItemStatements?: Partial<Record<TmsWaybillItemName, string>>;
}

export const TMS_WAYBILLS: TmsWaybill[] = [
  // ── Manila Freight Co. ──────────────────────────────────────────────────────
  {
    no: 'WB2604011', vendor: 'Manila Freight Co.',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-11 09:00', unloadingTime: '2026-04-10 15:30',
    basicAmount: 14500, exceptionFee: 0, additionalCharge: 800, reimbursement: 0, prepaid: 2000,
    status: 'Delivered', alreadyInStatement: 'APVS2604002',
  },
  {
    no: 'WB2604012', vendor: 'Manila Freight Co.',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-12 17:00', unloadingTime: '2026-04-11 09:00',
    basicAmount: 13300, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered', alreadyInStatement: 'APVS2604002',
  },
  {
    no: 'WB2604013', vendor: 'Manila Freight Co.',
    truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-13 11:15', unloadingTime: '2026-04-12 17:00',
    basicAmount: 15000, exceptionFee: 500, additionalCharge: 1200, reimbursement: 0, prepaid: 1190,
    status: 'Delivered', alreadyInStatement: 'APVS2604002',
  },
  {
    no: 'WB2604014', vendor: 'Manila Freight Co.',
    truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    positionTime: '2026-04-14 08:30', unloadingTime: '2026-04-13 11:15',
    basicAmount: 12000, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered', alreadyInStatement: 'APVS2604003',
  },
  {
    no: 'WB2604015', vendor: 'Manila Freight Co.',
    truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-15 14:00', unloadingTime: '2026-04-14 08:30',
    basicAmount: 13300, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered', alreadyInStatement: 'APVS2604003',
  },
  {
    no: 'WB2604016', vendor: 'Manila Freight Co.',
    truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
    positionTime: '2026-04-16 10:45', unloadingTime: '2026-04-15 14:00',
    basicAmount: 11800, exceptionFee: 0, additionalCharge: 500, reimbursement: 0, prepaid: 0,
    status: 'Delivered', alreadyInStatement: 'APVS2604003',
  },
  {
    no: 'WB2604017', vendor: 'Manila Freight Co.',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
    positionTime: '2026-04-17 07:30', unloadingTime: '2026-04-16 10:45',
    basicAmount: 15500, exceptionFee: 600, additionalCharge: 0, reimbursement: 200, prepaid: 0,
    status: 'Delivered',
    linkedItemStatements: { 'Basic Amount': 'APVS2604001' },
  },
  {
    no: 'WB2604018', vendor: 'Manila Freight Co.',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-18 09:00', unloadingTime: '2026-04-17 18:00',
    basicAmount: 14000, exceptionFee: 0, additionalCharge: 800, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604019', vendor: 'Manila Freight Co.',
    truckType: '4-Wheeler', origin: 'PH-Laguna-Calamba / Plant 2', destination: 'PH-NCR-Manila',
    positionTime: '2026-04-19 13:00', unloadingTime: '2026-04-18 09:00',
    basicAmount: 9800, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  // ── Laguna Logistics Corp. ──────────────────────────────────────────────────
  {
    no: 'WB2604020', vendor: 'Laguna Logistics Corp.',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
    positionTime: '2026-04-01 08:00', unloadingTime: '2026-03-31 18:00',
    basicAmount: 16800, exceptionFee: 0, additionalCharge: 900, reimbursement: 0, prepaid: 0,
    status: 'Settled', alreadyInStatement: 'APVS2604004',
  },
  {
    no: 'WB2604021', vendor: 'Laguna Logistics Corp.',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-02 09:30', unloadingTime: '2026-04-01 08:00',
    basicAmount: 13300, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Settled', alreadyInStatement: 'APVS2604004',
  },
  {
    no: 'WB2604022', vendor: 'Laguna Logistics Corp.',
    truckType: '4-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Manila',
    positionTime: '2026-04-03 14:00', unloadingTime: '2026-04-02 09:30',
    basicAmount: 9800, exceptionFee: 500, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Settled', alreadyInStatement: 'APVS2604004',
  },
  {
    no: 'WB2604033', vendor: 'Laguna Logistics Corp.',
    truckType: '6-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    positionTime: '2026-04-20 08:30', unloadingTime: '2026-04-19 18:00',
    basicAmount: 11500, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604034', vendor: 'Laguna Logistics Corp.',
    truckType: '10-Wheeler', origin: 'PH-Laguna-Calamba / Plant 2', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-21 10:00', unloadingTime: '2026-04-20 08:30',
    basicAmount: 13800, exceptionFee: 0, additionalCharge: 600, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  // ── SMC Logistics ────────────────────────────────────────────────────────────
  {
    no: 'WB2604040', vendor: 'SMC Logistics',
    truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
    positionTime: '2026-04-15 12:00', unloadingTime: '2026-04-15 14:00',
    basicAmount: 7500, exceptionFee: 0, additionalCharge: 0, reimbursement: 300, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604041', vendor: 'SMC Logistics',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
    positionTime: '2026-04-16 08:30', unloadingTime: '2026-04-16 10:45',
    basicAmount: 8200, exceptionFee: 200, additionalCharge: 300, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604042', vendor: 'SMC Logistics',
    truckType: '6-Wheeler', origin: 'PH-Bulacan-Meycauayan', destination: 'PH-NCR-Manila',
    positionTime: '2026-04-17 14:00', unloadingTime: '2026-04-16 18:00',
    basicAmount: 9000, exceptionFee: 500, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  // ── JG Summit Freight ────────────────────────────────────────────────────────
  {
    no: 'WB2604050', vendor: 'JG Summit Freight',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Pampanga / Clark',
    positionTime: '2026-04-18 07:00', unloadingTime: '2026-04-17 21:00',
    basicAmount: 11000, exceptionFee: 0, additionalCharge: 600, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604051', vendor: 'JG Summit Freight',
    truckType: '6-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila',
    positionTime: '2026-04-19 09:30', unloadingTime: '2026-04-18 07:00',
    basicAmount: 12500, exceptionFee: 300, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  // ── Bangkok Express Logistics ────────────────────────────────────────────────
  {
    no: 'WB2604060', vendor: 'Bangkok Express Logistics',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Laguna-Calamba',
    positionTime: '2026-04-20 09:00', unloadingTime: '2026-04-19 22:00',
    basicAmount: 14500, exceptionFee: 0, additionalCharge: 900, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604061', vendor: 'Bangkok Express Logistics',
    truckType: '6-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-21 11:00', unloadingTime: '2026-04-20 09:00',
    basicAmount: 11800, exceptionFee: 0, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  // ── Coca-Cola Bottlers PH Inc. ───────────────────────────────────────────────
  {
    no: 'WB2604070', vendor: 'Coca-Cola Bottlers PH Inc.',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Batangas / Lima',
    positionTime: '2026-04-22 08:00', unloadingTime: '2026-04-21 22:00',
    basicAmount: 18500, exceptionFee: 0, additionalCharge: 1200, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
  {
    no: 'WB2604071', vendor: 'Coca-Cola Bottlers PH Inc.',
    truckType: '6-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-23 10:00', unloadingTime: '2026-04-22 08:00',
    basicAmount: 16000, exceptionFee: 500, additionalCharge: 0, reimbursement: 0, prepaid: 0,
    status: 'Delivered',
  },
];
