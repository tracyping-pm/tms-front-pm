/**
 * Cross-module sync for PrePaid Applications.
 *
 * Used by both Vendor Portal pages and TMS billing pages.
 * - VP creates / edits / submits applications and writes them here.
 * - TMS reads non-Draft entries (VP-submitted) and merges them with its own mock data.
 * - TMS Approve / Reject and Mock HR Result update the same entries; VP picks up the
 *   changes on next list re-read.
 */

const STORAGE_KEY = 'prepaid-applications-sync';

export interface OperationLogEntry {
  time: string; // ISO datetime
  actor: string; // e.g. "Vendor", "TMS Reviewer", "HR System"
  action: string; // e.g. "Submitted", "Approved", "Rejected"
  note?: string; // optional detail, e.g. reject reason
}

/**
 * Canonical status (TMS-side terms). VP renders via vpAppStatusLabel().
 * V17 flow: Draft → Awaiting Confirmation → (Rejected | HR sync →
 *           (Sync Failed → retry → Pending Payment | Pending Payment)) →
 *           (Payment Rejected | Paid)
 */
export type SyncedAppStatus =
  | 'Draft' // Only in VP local list (never visible to TMS)
  | 'Awaiting Confirmation' // VP submitted, waiting for TMS review
  | 'Awaiting Inteluck Confirmation' // legacy VP-term, treated same as Awaiting Confirmation
  | 'Sync Failed' // TMS approved but HR sync failed — TMS-only, never shown on VP
  | 'Pending Payment' // TMS approved, awaiting HR
  | 'Pending Receipt' // legacy VP-term
  | 'Paid' // HR paid
  | 'Collected' // legacy VP-term
  | 'Rejected' // TMS rejected
  | 'Payment Rejected' // HR rejected
  | 'Receipt Rejected'; // legacy VP-term

/** V17 两端文案对照 — TMS 端展示文案 */
export function tmsAppStatusLabel(s: SyncedAppStatus): string {
  switch (s) {
    case 'Awaiting Inteluck Confirmation':
      return 'Awaiting Confirmation';
    case 'Pending Receipt':
      return 'Pending Payment';
    case 'Collected':
      return 'Paid';
    case 'Receipt Rejected':
      return 'Payment Rejected';
    default:
      return s;
  }
}

/** V17 两端文案对照 — VP 端展示文案（Sync Failed 对 VP 不可见，回落为待审核文案） */
export function vpAppStatusLabel(s: SyncedAppStatus): string {
  switch (s) {
    case 'Awaiting Confirmation':
      return 'Awaiting Inteluck Confirmation';
    case 'Sync Failed':
      return 'Awaiting Inteluck Confirmation'; // VP 不展示 Sync Failed
    case 'Pending Payment':
      return 'Pending Receipt';
    case 'Paid':
      return 'Collected';
    case 'Payment Rejected':
      return 'Receipt Rejected';
    default:
      return s;
  }
}

export interface SyncedWaybill {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  prePaidAmount: number; // editable on draft form, default 0
}

export interface PaymentItemRow {
  type: string; // e.g. "Basic Amount", "Additional Charge"
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  whtRate: number;
  whtAmount: number;
}

export interface ClaimTicketRow {
  ticketNo: string;
  claimType: string;
  relatedWaybill?: string;
  claimAmount: number;
}

export interface SyncedApplication {
  applicationNo: string;
  vendorName: string;
  source: 'Vendor Portal' | 'Internal';
  appType: 'Advance Payment Request' | 'Statement Payment Request';
  status: SyncedAppStatus;

  // Application Information
  taxMark: 'VAT-ex' | 'VAT-in';
  currency: string; // e.g. PHP

  // Associated Waybills (with per-waybill PrePaid Amount)
  waybills: SyncedWaybill[];

  // Claim Tickets (visible on Detail page)
  claimTickets: ClaimTicketRow[];

  // Payment Items / Deduction Items (used by Detail page Amount Information)
  paymentItems: PaymentItemRow[];
  deductionItems: PaymentItemRow[];

  // Computed total
  totalAmountPayable: number;

  // Payee Information
  payeeType?: string; // e.g. "External Vendor"
  payeeName?: string;
  bankName?: string;
  payeeAccount?: string;
  bankProof?: string;
  rfpNumber?: string;
  rfpStatus?: string;
  responsibleDepartment?: string;
  paymentDefinition?: string;
  entity?: string;
  businessUnit?: string;
  dateOfNeeded?: string;
  paymentIdentificationL1?: string;
  paymentIdentificationL2?: string;

  // Supporting Documents & Remark
  proofFiles: string[];
  remark?: string;

  // Reject reasons
  rejectReason?: string;
  hrRejectReason?: string;

  // Timestamps
  createdAt: string; // ISO datetime
  submittedAt?: string; // when status moved to Awaiting Confirmation
  reviewedAt?: string; // when TMS Approve/Reject happened
  paidAt?: string; // when HR Paid / Rejected happened

  // Operation history
  operationLogs?: OperationLogEntry[];
}

function safeRead(): SyncedApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(items: SyncedApplication[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function getAllApplications(): SyncedApplication[] {
  return safeRead().sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || ''),
  );
}

/** Apps visible to TMS — Draft entries are excluded. */
export function getTmsVisibleApplications(): SyncedApplication[] {
  return getAllApplications().filter((a) => a.status !== 'Draft');
}

export function getApplication(
  applicationNo: string,
): SyncedApplication | undefined {
  return safeRead().find((a) => a.applicationNo === applicationNo);
}

export function upsertApplication(app: SyncedApplication) {
  const items = safeRead();
  const idx = items.findIndex(
    (a) => a.applicationNo === app.applicationNo,
  );
  if (idx >= 0) items[idx] = app;
  else items.push(app);
  safeWrite(items);
}

export function updateApplicationStatus(
  applicationNo: string,
  patch: Partial<SyncedApplication>,
) {
  const items = safeRead();
  const idx = items.findIndex((a) => a.applicationNo === applicationNo);
  if (idx < 0) return;
  items[idx] = { ...items[idx], ...patch };
  safeWrite(items);
}

export function appendLog(applicationNo: string, entry: OperationLogEntry) {
  const items = safeRead();
  const idx = items.findIndex((a) => a.applicationNo === applicationNo);
  if (idx < 0) return;
  const existing = items[idx].operationLogs || [];
  items[idx] = { ...items[idx], operationLogs: [...existing, entry] };
  safeWrite(items);
}

export function deleteApplication(applicationNo: string) {
  const items = safeRead().filter(
    (a) => a.applicationNo !== applicationNo,
  );
  safeWrite(items);
}

/** Generate next application number (PPA + YYMMDD + 3-digit seq). */
export function nextApplicationNo(): string {
  const items = safeRead();
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const prefix = `PPA${yy}${mm}${dd}`;
  const same = items.filter((a) => a.applicationNo.startsWith(prefix));
  const seq = String(same.length + 1).padStart(3, '0');
  return `${prefix}${seq}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Format ISO datetime for display: "YYYY-MM-DD HH:mm". */
export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Format ISO date for display: "YYYY-MM-DD". */
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Recompute totalAmountPayable as the sum of all waybill prePaidAmounts. */
export function recomputeTotal(waybills: SyncedWaybill[]): number {
  return waybills.reduce(
    (sum, w) => sum + (Number(w.prePaidAmount) || 0),
    0,
  );
}
