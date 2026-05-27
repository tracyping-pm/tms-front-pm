export interface TmsClaimTicket {
  ticketNo: string;
  vendor: string;
  claimType: string;
  amount: number;
  currency: string;
  relatedWaybill?: string;
  createdAt: string;
  status: 'For Deduction' | 'Pending' | 'Disputed';
  alreadyInStatement?: string;
}

export const TMS_CLAIM_TICKETS: TmsClaimTicket[] = [
  // Manila Freight Co.
  {
    ticketNo: 'PHCT26041501AB', vendor: 'Manila Freight Co.',
    claimType: 'KPI Claim', amount: 2000, currency: 'PHP',
    relatedWaybill: 'WB2604011', createdAt: '2026-04-15 14:22',
    status: 'For Deduction', alreadyInStatement: 'APVS2604002',
  },
  {
    ticketNo: 'PHCT26041701EF', vendor: 'Manila Freight Co.',
    claimType: 'Shortage Claim', amount: 1500, currency: 'PHP',
    relatedWaybill: 'WB2604017', createdAt: '2026-04-17 10:05',
    status: 'For Deduction',
  },
  {
    ticketNo: 'PHCT26041801GH', vendor: 'Manila Freight Co.',
    claimType: 'Late Delivery', amount: 800, currency: 'PHP',
    relatedWaybill: 'WB2604018', createdAt: '2026-04-18 09:30',
    status: 'Pending',
  },
  {
    ticketNo: 'PHCT26041901IJ', vendor: 'Manila Freight Co.',
    claimType: 'Damaged Goods', amount: 3200, currency: 'PHP',
    relatedWaybill: 'WB2604019', createdAt: '2026-04-19 11:15',
    status: 'Disputed',
  },

  // Laguna Logistics Corp.
  {
    ticketNo: 'PHCT26042001KL', vendor: 'Laguna Logistics Corp.',
    claimType: 'Vehicle Damage', amount: 3000, currency: 'PHP',
    createdAt: '2026-04-20 08:40',
    status: 'For Deduction',
  },
  {
    ticketNo: 'PHCT26043301MN', vendor: 'Laguna Logistics Corp.',
    claimType: 'KPI Claim', amount: 1200, currency: 'PHP',
    relatedWaybill: 'WB2604033', createdAt: '2026-04-21 13:00',
    status: 'For Deduction',
  },
  {
    ticketNo: 'PHCT26043401OP', vendor: 'Laguna Logistics Corp.',
    claimType: 'Fuel Advance Recovery', amount: 2500, currency: 'PHP',
    createdAt: '2026-04-22 10:20',
    status: 'Pending',
  },

  // SMC Logistics
  {
    ticketNo: 'PHCT26044001QR', vendor: 'SMC Logistics',
    claimType: 'Fuel Advance Recovery', amount: 2500, currency: 'PHP',
    createdAt: '2026-04-15 16:30',
    status: 'For Deduction',
  },
  {
    ticketNo: 'PHCT26044201ST', vendor: 'SMC Logistics',
    claimType: 'KPI Claim', amount: 1000, currency: 'PHP',
    relatedWaybill: 'WB2604042', createdAt: '2026-04-17 09:45',
    status: 'Pending',
  },

  // JG Summit Freight
  {
    ticketNo: 'PHCT26045001UV', vendor: 'JG Summit Freight',
    claimType: 'Late Delivery', amount: 1800, currency: 'PHP',
    relatedWaybill: 'WB2604050', createdAt: '2026-04-18 14:00',
    status: 'For Deduction',
  },

  // Bangkok Express Logistics
  {
    ticketNo: 'PHCT26046001WX', vendor: 'Bangkok Express Logistics',
    claimType: 'Shortage Claim', amount: 2200, currency: 'PHP',
    relatedWaybill: 'WB2604060', createdAt: '2026-04-20 11:30',
    status: 'For Deduction',
  },

  // Coca-Cola Bottlers PH Inc.
  {
    ticketNo: 'PHCT26047001YZ', vendor: 'Coca-Cola Bottlers PH Inc.',
    claimType: 'KPI Claim', amount: 3500, currency: 'PHP',
    relatedWaybill: 'WB2604070', createdAt: '2026-04-22 09:00',
    status: 'For Deduction',
  },
];
