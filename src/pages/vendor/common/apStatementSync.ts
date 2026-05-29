/**
 * Cross-module sync for AP Statements.
 *
 * Used by both Vendor Portal pages and TMS billing pages.
 * - VP creates and submits statements, writing them here.
 * - TMS reads VP-submitted entries, performs OC/Pricing checks, and updates status.
 * - VP picks up status changes (Awaiting Rebill, Pending Payment, etc.) on next read.
 */

const STORAGE_KEY = 'ap-statements-sync';

export type SyncedApStmtStatus =
  | 'Draft'
  | 'Awaiting Comparison'
  | 'Under Payment Preparation'
  | 'Awaiting Rebill'
  | 'Pending Payment'
  | 'Paid'
  | 'Canceled';

export interface ApStmtLog {
  time: string; // ISO datetime
  actor: string; // e.g. "Vendor", "TMS User"
  action: string; // e.g. "Submitted", "Rejected"
  note?: string; // optional detail
}

export interface ApStmtItemCheck {
  oc: boolean;
  pricing: boolean;
}

export interface SyncedApStmtWaybill {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  additionalCharge: number;
  exceptionFee: number;
  reimbursement: number;
}

export interface SyncedApStmtClaim {
  no: string;
  type: string;
  amount: number;
  waybillNo: string;
}

// Standalone — present only when statementType === 'Standalone'
export interface SyncedMiscCharge {
  object: string;
  amount: number;
  proof: string;
}
export interface SyncedStandaloneInvoice {
  number: string;
  amount: number;
  date: string;
  proof: string;
}
export interface SyncedStandaloneProof {
  message: string;
}

export interface SyncedApStatement {
  no: string;
  vendorName: string;
  source: 'Vendor Portal' | 'Internal';
  status: SyncedApStmtStatus;
  statementType: 'Standard' | 'Standalone';
  reconciliationPeriod: string;
  taxMark: 'Tax-inclusive' | 'Tax-exclusive';
  vatRate: number;
  whtRate: number;
  vatAmount: number;
  whtAmount: number;
  settlementItems: string[];
  totalVpAmount: number;
  waybillCount: number;
  waybills: SyncedApStmtWaybill[];
  claims: SyncedApStmtClaim[];
  // Per-item check state: key = "waybillNo:itemName"
  itemChecks?: Record<string, ApStmtItemCheck>;
  /** Per-item Returned state: key = "waybillNo:itemName" → true */
  returnedItems?: Record<string, boolean>;
  rejectReason?: string;
  cancelReason?: string;
  releaseProof?: string;
  createdAt: string;
  submittedAt?: string;
  operationLogs?: ApStmtLog[];
  // Standalone
  miscCharges?: SyncedMiscCharge[];
  standaloneInvoices?: SyncedStandaloneInvoice[];
  standaloneProofs?: SyncedStandaloneProof[];
}

function safeRead(): SyncedApStatement[] {
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

function safeWrite(items: SyncedApStatement[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function getAllApStatements(): SyncedApStatement[] {
  return safeRead().sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || ''),
  );
}

export function getApStatement(no: string): SyncedApStatement | undefined {
  return safeRead().find((s) => s.no === no);
}

export function upsertApStatement(stmt: SyncedApStatement) {
  const items = safeRead();
  const idx = items.findIndex((s) => s.no === stmt.no);
  if (idx >= 0) items[idx] = stmt;
  else items.push(stmt);
  safeWrite(items);
}

export function updateApStatementStatus(
  no: string,
  patch: Partial<SyncedApStatement>,
) {
  const items = safeRead();
  const idx = items.findIndex((s) => s.no === no);
  if (idx < 0) return;
  items[idx] = { ...items[idx], ...patch };
  safeWrite(items);
}

export function saveApStmtItemChecks(
  no: string,
  itemChecks: Record<string, ApStmtItemCheck>,
) {
  const items = safeRead();
  const idx = items.findIndex((s) => s.no === no);
  if (idx < 0) return;
  items[idx] = { ...items[idx], itemChecks };
  safeWrite(items);
}

export function appendApStmtLog(no: string, entry: ApStmtLog) {
  const items = safeRead();
  const idx = items.findIndex((s) => s.no === no);
  if (idx < 0) return;
  const existing = items[idx].operationLogs || [];
  items[idx] = { ...items[idx], operationLogs: [...existing, entry] };
  safeWrite(items);
}

/** Map TMS canonical status → VP display status. */
export function tmsStatusToVpStatus(s: SyncedApStmtStatus): string {
  const MAP: Record<SyncedApStmtStatus, string> = {
    Draft: 'Draft',
    'Awaiting Comparison': 'Awaiting Inteluck Confirmation',
    'Under Payment Preparation': 'Awaiting Inteluck Confirmation',
    'Awaiting Rebill': 'Awaiting Re-bill',
    'Pending Payment': 'Pending Payment',
    Paid: 'Collected',
    Canceled: 'Canceled',
  };
  return MAP[s] ?? 'Awaiting Comparison';
}

export function formatApDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
