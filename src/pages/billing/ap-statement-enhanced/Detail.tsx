import React, { useState } from 'react';
import { history, useParams } from '@umijs/max';
import { Button, Card, Tabs, Modal, Input, message } from 'antd';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import {
  getApStatement,
  updateApStatementStatus,
  upsertApStatement,
  appendApStmtLog,
  type SyncedApStatement,
} from '@/pages/vendor/common/apStatementSync';
import { PATHS } from '@/constants';
import styles from './index.less';
import {
  DETAIL_MOCK,
  type ApStatementStatus,
  type StatementDetail,
  type WaybillRow,
  type WaybillItem,
  type ClaimRow,
  type LogEntry,
} from './mock/apStatementData';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

type ComparisonLabel = 'Matched' | 'Over-Billed' | 'Vendor Short-Billed' | '—';

function compareResult(
  tms: number,
  vp: number,
): { label: ComparisonLabel; color: string } {
  if (vp === 0 && tms === 0) return { label: '—', color: '#999' };
  if (vp === tms) return { label: 'Matched', color: '#389e0d' };
  if (vp > tms) return { label: 'Over-Billed', color: '#cf1322' };
  return { label: 'Vendor Short-Billed', color: '#389e0d' };
}

function itemActionKind(name: string): 'return' | 'edit' | 'none' {
  if (name === 'PrePaid Amount') return 'none';
  if (name === 'Reimbursement' || name === 'Reimbursement Expense') return 'edit';
  return 'return';
}

function waybillTotals(w: WaybillRow, isVP: boolean) {
  const prepaid = w.items.find((i) => i.name === 'PrePaid Amount');
  const tms =
    w.items
      .filter((i) => i.name !== 'PrePaid Amount')
      .reduce((s, i) => s + i.tmsAmount, 0) - (prepaid?.tmsAmount ?? 0);
  const vp = isVP
    ? w.items
        .filter((i) => i.name !== 'PrePaid Amount')
        .reduce((s, i) => s + i.vpAmount, 0) - (prepaid?.vpAmount ?? 0)
    : 0;
  return { tms, vp, diff: tms - vp };
}

function statusClassName(status: ApStatementStatus): string {
  switch (status) {
    case 'Under Payment Preparation': return styles.statusUnderPrep;
    case 'Awaiting Comparison': return styles.statusAwaitingComparison;
    case 'Awaiting Rebill': return styles.statusAwaitingRebill;
    case 'Pending Payment': return styles.statusPendingPayment;
    case 'Paid': return styles.statusPaid;
    case 'Canceled': return styles.statusCanceled;
    default: return '';
  }
}

// ─── Build from sync ────────────────────────────────────────────────────────────

function buildFromSync(id: string): StatementDetail | undefined {
  const s: SyncedApStatement | undefined = getApStatement(id);
  if (!s) return undefined;
  return {
    no: s.no,
    statementType: s.statementType,
    status: s.status as ApStatementStatus,
    source: s.source,
    vendor: s.vendorName,
    taxMark: s.taxMark,
    settlementItems: s.settlementItems,
    reconciliationPeriod: s.reconciliationPeriod,
    currency: 'PHP',
    createDate: s.createdAt.slice(0, 10),
    createBy: s.vendorName,
    vatRate: s.vatRate,
    whtRate: s.whtRate,
    rejectReason: s.rejectReason,
    cancelReason: s.cancelReason,
    releaseProof: s.releaseProof,
    waybills: (s.waybills ?? []).map((w) => ({
      no: w.no,
      positionTime: w.positionTime,
      unloadingTime: w.unloadingTime,
      truckType: w.truckType,
      origin: w.origin,
      destination: w.destination,
      items: [
        ...(s.settlementItems.includes('Basic Amount')
          ? [{ name: 'Basic Amount', tmsAmount: w.basicAmount, vpAmount: w.basicAmount }]
          : []),
        ...(s.settlementItems.includes('Vendor Additional Charge')
          ? [{ name: 'Additional Charge', tmsAmount: w.additionalCharge, vpAmount: w.additionalCharge }]
          : []),
        ...(s.settlementItems.includes('Vendor Exception Fee')
          ? [{ name: 'Exception Fee', tmsAmount: w.exceptionFee, vpAmount: w.exceptionFee }]
          : []),
        ...(s.settlementItems.includes('Reimbursement Expense')
          ? [{ name: 'Reimbursement', tmsAmount: w.reimbursement, vpAmount: w.reimbursement }]
          : []),
      ],
    })),
    claims: (s.claims ?? []).map((c) => ({
      no: c.no,
      type: c.type,
      amount: c.amount,
      currency: 'PHP',
      waybillNo: c.waybillNo,
    })),
    invoices: [],
    payments: [],
    operationLog: (s.operationLogs || []).map((l) => ({
      time: l.time.slice(0, 16).replace('T', ' '),
      action: l.action,
      operator: l.actor,
      detail: l.note,
    })),
    miscCharges: s.miscCharges,
    standaloneInvoices: s.standaloneInvoices,
    standaloneProofs: s.standaloneProofs,
  };
}

// ─── RFP constants ─────────────────────────────────────────────────────────────

const PAYMENT_DEFINITIONS = ['Bank Transfer', 'Cash', 'Check'];
const ENTITIES = ['PH Entity', 'TH Entity', 'SG Entity'];
const BUSINESS_UNITS = ['Logistics & Trucking', 'Freight Forwarding', 'Warehousing'];
const PAYMENT_ID_L2 = ['Domestic Trucking', 'International Freight', 'Last Mile'];

// ─── Component ─────────────────────────────────────────────────────────────────

const ApStatementEnhancedDetail: React.FC = () => {
  const { id: statementId } = useParams<{ id: string }>();

  const baseStmt = DETAIL_MOCK[statementId!] ?? buildFromSync(statementId!);
  const synced = getApStatement(statementId!);

  const [selectedClaim, setSelectedClaim] = useState<ClaimRow | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ApStatementStatus>(() => {
    const raw = (synced?.status ?? baseStmt?.status) as string | undefined;
    return (raw as ApStatementStatus | undefined) ?? 'Awaiting Comparison';
  });
  const [currentRejectReason, setCurrentRejectReason] = useState<string | undefined>(
    () => synced?.rejectReason ?? baseStmt?.rejectReason,
  );
  const [currentLog, setCurrentLog] = useState<LogEntry[]>(() => baseStmt?.operationLog ?? []);
  const [localWaybills, setLocalWaybills] = useState<WaybillRow[]>(() => baseStmt?.waybills ?? []);
  const [localMiscCharges, setLocalMiscCharges] = useState<Array<{ object: string; amount: number; proof: string }>>(
    () => baseStmt?.miscCharges ?? [],
  );
  const [localStandaloneInvoices, setLocalStandaloneInvoices] = useState<
    Array<{ number: string; amount: number; date: string; proof: string }>
  >(() => baseStmt?.standaloneInvoices ?? []);

  const stmt = baseStmt
    ? {
        ...baseStmt,
        status: currentStatus,
        rejectReason: currentRejectReason,
        operationLog: currentLog,
        waybills: localWaybills,
        miscCharges: localMiscCharges,
        standaloneInvoices: localStandaloneInvoices,
      }
    : baseStmt;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRFPDialog, setShowRFPDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ no: '', amount: '', date: '' });
  const [showAddMiscRow, setShowAddMiscRow] = useState(false);
  const [editMiscIdx, setEditMiscIdx] = useState<number | null>(null);
  const [miscRowForm, setMiscRowForm] = useState({ object: '', amount: '', proof: '' });
  const [showReturnedDialog, setShowReturnedDialog] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // Per-item "Returned" state
  const [returnedKeys, setReturnedKeys] = useState<Set<string>>(() => {
    const returned = synced?.returnedItems ?? {};
    return new Set(
      Object.entries(returned)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => k),
    );
  });

  // Reimbursement Edit modal
  const [editingReimbursement, setEditingReimbursement] = useState<{
    wNo: string;
    current: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  // RFP form state
  const [rfpPaymentDef, setRfpPaymentDef] = useState('Bank Transfer');
  const [rfpEntity, setRfpEntity] = useState('');
  const [rfpBU, setRfpBU] = useState('');
  const [rfpDateNeeded, setRfpDateNeeded] = useState('');
  const [rfpIdL2, setRfpIdL2] = useState('');
  const [rfpDocs] = useState<string[]>(['invoice_draft.pdf']);

  const isVP = stmt?.source === 'Vendor Portal';
  const isAwaitingComparison = currentStatus === 'Awaiting Comparison';
  const isStandalone = stmt?.statementType === 'Standalone';
  const isEditable =
    currentStatus === 'Under Payment Preparation' ||
    (isStandalone && isAwaitingComparison);

  const toggleRow = (no: string) =>
    setExpandedRows((prev) => {
      const n = new Set(prev);
      if (n.has(no)) n.delete(no);
      else n.add(no);
      return n;
    });

  const removeWaybill = (no: string) =>
    setLocalWaybills((prev) => prev.filter((w) => w.no !== no));

  const ensureSyncedStatement = () => {
    if (!stmt || getApStatement(statementId!)) return;
    upsertApStatement({
      no: stmt.no,
      vendorName: stmt.vendor,
      source: stmt.source,
      status: currentStatus as any,
      statementType: stmt.statementType,
      reconciliationPeriod: stmt.reconciliationPeriod,
      taxMark: stmt.taxMark,
      vatRate: stmt.vatRate,
      whtRate: stmt.whtRate,
      vatAmount: 0,
      whtAmount: 0,
      settlementItems: stmt.settlementItems,
      totalVpAmount: tmsTotalPayable,
      waybillCount: localWaybills.length,
      waybills: localWaybills.map((w) => ({
        no: w.no,
        positionTime: w.positionTime,
        unloadingTime: w.unloadingTime,
        truckType: w.truckType,
        origin: w.origin,
        destination: w.destination,
        basicAmount: w.items.find((i) => i.name === 'Basic Amount')?.tmsAmount || 0,
        additionalCharge: w.items.find((i) => i.name === 'Additional Charge')?.tmsAmount || 0,
        exceptionFee: w.items.find((i) => i.name === 'Exception Fee')?.tmsAmount || 0,
        reimbursement: w.items.find((i) => i.name === 'Reimbursement')?.tmsAmount || 0,
      })),
      claims: [],
      createdAt: new Date().toISOString(),
      operationLogs: [],
    });
  };

  const markReturned = (wNo: string, name: string) => {
    setReturnedKeys((prev) => {
      const n = new Set(prev);
      n.add(`${wNo}:${name}`);
      const returnedMap: Record<string, boolean> = {};
      n.forEach((k) => {
        returnedMap[k] = true;
      });
      ensureSyncedStatement();
      updateApStatementStatus(statementId!, { returnedItems: returnedMap });
      return n;
    });
    setShowReturnedDialog(true);
  };

  const refreshComparison = () => {
    setReturnedKeys(new Set());
    setLocalWaybills((prev) =>
      prev.map((w) => ({
        ...w,
        items: w.items.map((i) =>
          i.name !== 'PrePaid Amount' &&
          compareResult(i.tmsAmount, i.vpAmount).label === 'Over-Billed'
            ? { ...i, vpAmount: i.tmsAmount }
            : i,
        ),
      })),
    );
  };

  const openReimbursementEdit = (wNo: string, current: number) => {
    setEditingReimbursement({ wNo, current });
    setEditValue(String(current));
  };

  const confirmReimbursementEdit = () => {
    if (!editingReimbursement) return;
    const newAmt = Number(editValue) || 0;
    setLocalWaybills((prev) =>
      prev.map((w) =>
        w.no === editingReimbursement.wNo
          ? {
              ...w,
              items: w.items.map((i) =>
                i.name === 'Reimbursement' ? { ...i, tmsAmount: newAmt } : i,
              ),
            }
          : w,
      ),
    );
    const now = new Date().toISOString();
    const logEntry: LogEntry = {
      time: now.slice(0, 16).replace('T', ' '),
      action: `FA edited Reimbursement on ${editingReimbursement.wNo} to ${newAmt.toLocaleString()}`,
      operator: 'TMS User',
    };
    setCurrentLog((prev) => [...prev, logEntry]);
    appendApStmtLog(statementId!, { time: now, actor: 'TMS User', action: logEntry.action });
    setEditingReimbursement(null);
    setEditValue('');
  };

  // ── Amount calculations ──────────────────────────────────────────────────────

  const allItems = stmt?.waybills.flatMap((w) => w.items) ?? [];
  const sumBy = (name: string, f: 'tmsAmount' | 'vpAmount') =>
    allItems.filter((i) => i.name === name).reduce((s, i) => s + i[f], 0);

  const tmsBasic = sumBy('Basic Amount', 'tmsAmount');
  const tmsPrePaid = sumBy('PrePaid Amount', 'tmsAmount');
  const tmsAdditional = sumBy('Additional Charge', 'tmsAmount');
  const tmsException = sumBy('Exception Fee', 'tmsAmount');
  const vpBasic = sumBy('Basic Amount', 'vpAmount');
  const vpPrePaid = sumBy('PrePaid Amount', 'vpAmount');
  const vpAdditional = sumBy('Additional Charge', 'vpAmount');
  const vpException = sumBy('Exception Fee', 'vpAmount');

  const tmsWCC = tmsBasic + tmsAdditional + tmsException - tmsPrePaid;
  const vpWCC = vpBasic + vpAdditional + vpException - vpPrePaid;
  const claimTotal = stmt?.claims.reduce((s, c) => s + c.amount, 0) ?? 0;
  const vatRate = stmt?.vatRate ?? 0;
  const whtRate = stmt?.whtRate ?? 0;
  const tmsVAT = Math.round((tmsWCC * vatRate) / 100);
  const tmsWHT = Math.round((tmsWCC * whtRate) / 100);
  const vpVAT = Math.round((vpWCC * vatRate) / 100);
  const vpWHT = Math.round((vpWCC * whtRate) / 100);
  const tmsTotalPayable = tmsWCC - claimTotal + tmsVAT - tmsWHT;
  const vpTotalPayable = vpWCC - claimTotal + vpVAT - vpWHT;

  // ── Blocking logic ──────────────────────────────────────────────────────────

  const overBilledKeys = (stmt?.waybills ?? []).flatMap((w) =>
    w.items
      .filter(
        (i) =>
          i.name !== 'PrePaid Amount' &&
          compareResult(i.tmsAmount, i.vpAmount).label === 'Over-Billed',
      )
      .map((i) => `${w.no}:${i.name}`),
  );

  const blockingKey =
    returnedKeys.size > 0 ? Array.from(returnedKeys)[0] : overBilledKeys[0];
  const blockingReason: 'returned' | 'over-billed' | null = blockingKey
    ? returnedKeys.has(blockingKey)
      ? 'returned'
      : 'over-billed'
    : null;
  const canConfirmRFP =
    (isAwaitingComparison || isEditable) ? blockingKey === undefined : false;

  if (!stmt) {
    return (
      <div className={styles.pageWrapper}>
        <BreadcrumbCase
          items={[
            { name: 'AP Statement', path: PATHS.BILLING_AP_STATEMENT_ENHANCED },
            { name: 'Detail', path: PATHS.BILLING_AP_STATEMENT_ENHANCED_DETAIL },
          ]}
        />
        <Card>
          <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            Statement not found.
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button onClick={() => history.push(PATHS.BILLING_AP_STATEMENT_ENHANCED)}>
              Back to List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Top action buttons ────────────────────────────────────────────────────────

  const ConfirmRFPBtn = (
    <Button
      type="primary"
      disabled={!canConfirmRFP}
      title={
        !canConfirmRFP && blockingKey
          ? `Payment Blocked: [${blockingKey}] is ${blockingReason}`
          : undefined
      }
      onClick={() => canConfirmRFP && setShowRFPDialog(true)}
    >
      Confirm &amp; Create RFP
    </Button>
  );

  const renderTopActions = () => {
    if (currentStatus === 'Under Payment Preparation') {
      if (isStandalone) {
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => showToast('Statement submitted to vendor for confirmation')}>
              Submit
            </Button>
            <Button type="primary" onClick={() => setShowRFPDialog(true)}>
              Confirm &amp; Create RFP
            </Button>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button>Save</Button>
          <Button danger onClick={() => setShowCancelDialog(true)}>
            Cancel
          </Button>
          {ConfirmRFPBtn}
        </div>
      );
    }
    if (currentStatus === 'Awaiting Comparison') {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button danger onClick={() => setShowRejectDialog(true)}>
            Reject to Vendor
          </Button>
          <Button
            onClick={() => {
              refreshComparison();
              showToast('Comparison refreshed');
            }}
          >
            Refresh
          </Button>
          {ConfirmRFPBtn}
        </div>
      );
    }
    if (
      currentStatus === 'Pending Payment' ||
      currentStatus === 'Paid' ||
      currentStatus === 'Canceled'
    ) {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => showToast('Export started — file will download shortly')}>
            Export
          </Button>
        </div>
      );
    }
    return null;
  };

  // ── KV Row helper ─────────────────────────────────────────────────────────────

  const KVRow = ({ items }: { items: { label: string; value: React.ReactNode }[] }) => (
    <div className={styles.kvGrid}>
      {items.map((item, i) => (
        <div key={i}>
          <div className={styles.kvLabel}>{item.label}</div>
          <div className={styles.kvValue}>{item.value}</div>
        </div>
      ))}
    </div>
  );

  // ── Statement info section ────────────────────────────────────────────────────

  const renderStandardInfo = () => {
    const invoiceTotal = stmt.invoices.reduce((s, inv) => s + inv.amount, 0);
    const paidAmt = stmt.payments
      .filter((p) => p.status === 'Paid')
      .reduce((s, p) => s + p.payableAmount, 0);
    return (
      <>
        <KVRow
          items={[
            { label: 'Statement No.', value: <strong>{stmt.no}</strong> },
            {
              label: 'Statement Type',
              value: (
                <span className={styles.typeStandard}>Standard</span>
              ),
            },
            {
              label: 'Status',
              value: (
                <span
                  className={`${styles.statusBadge} ${statusClassName(stmt.status)}`}
                >
                  {stmt.status}
                </span>
              ),
            },
            { label: 'Vendor', value: stmt.vendor },
            {
              label: 'Origin',
              value: (
                <span
                  className={
                    isVP ? styles.originVP : styles.originInternal
                  }
                >
                  {stmt.source}
                </span>
              ),
            },
          ]}
        />
        <KVRow
          items={[
            {
              label: 'Total Amount Payable (TMS)',
              value: (
                <strong style={{ color: '#1677ff' }}>{fmt(tmsTotalPayable)}</strong>
              ),
            },
            {
              label: 'Total Invoice Amount',
              value:
                invoiceTotal > 0 ? (
                  fmt(invoiceTotal)
                ) : (
                  <span style={{ color: '#bbb' }}>—</span>
                ),
            },
            {
              label: 'Paid Amount',
              value:
                paidAmt > 0 ? (
                  fmt(paidAmt)
                ) : (
                  <span style={{ color: '#bbb' }}>—</span>
                ),
            },
            { label: 'Reconciliation Period', value: stmt.reconciliationPeriod },
            { label: 'Currency', value: stmt.currency },
          ]}
        />
        <KVRow
          items={[
            { label: 'Create Date', value: stmt.createDate },
            { label: 'Create By', value: stmt.createBy },
            { label: '', value: '' },
            { label: '', value: '' },
            { label: '', value: '' },
          ]}
        />
      </>
    );
  };

  const renderStandaloneInfo = () => {
    const charges = stmt.miscCharges ?? [];
    const totalAmount = charges.reduce((s, c) => s + c.amount, 0);
    const invTotal = (stmt.standaloneInvoices ?? []).reduce(
      (s, i) => s + i.amount,
      0,
    );
    const paidAmt = stmt.payments
      .filter((p) => p.status === 'Paid')
      .reduce((s, p) => s + p.payableAmount, 0);
    return (
      <>
        <KVRow
          items={[
            { label: 'Statement No.', value: <strong>{stmt.no}</strong> },
            {
              label: 'Statement Type',
              value: (
                <span
                  style={{
                    fontSize: 12,
                    borderRadius: 4,
                    padding: '2px 8px',
                    background: '#f9f0ff',
                    color: '#531dab',
                    border: '1px solid #d3adf7',
                  }}
                >
                  Standalone
                </span>
              ),
            },
            {
              label: 'Status',
              value: (
                <span
                  className={`${styles.statusBadge} ${statusClassName(stmt.status)}`}
                >
                  {stmt.status}
                </span>
              ),
            },
            { label: 'Vendor', value: stmt.vendor },
            {
              label: 'Origin',
              value: (
                <span
                  className={
                    isVP ? styles.originVP : styles.originInternal
                  }
                >
                  {stmt.source}
                </span>
              ),
            },
          ]}
        />
        <KVRow
          items={[
            {
              label: 'Total Amount Payable',
              value: (
                <strong style={{ color: '#1677ff' }}>{fmt(totalAmount)}</strong>
              ),
            },
            {
              label: 'Total Invoice Amount',
              value:
                invTotal > 0 ? (
                  fmt(invTotal)
                ) : (
                  <span style={{ color: '#bbb' }}>—</span>
                ),
            },
            {
              label: 'Paid Amount',
              value:
                paidAmt > 0 ? (
                  fmt(paidAmt)
                ) : (
                  <span style={{ color: '#bbb' }}>—</span>
                ),
            },
            { label: 'Reconciliation Period', value: stmt.reconciliationPeriod },
            { label: 'Currency', value: stmt.currency },
          ]}
        />
        <KVRow
          items={[
            { label: 'Create Date', value: stmt.createDate },
            { label: 'Create By', value: stmt.createBy },
            { label: '', value: '' },
            { label: '', value: '' },
            { label: '', value: '' },
          ]}
        />
      </>
    );
  };

  // ── Comparison waybill table (Awaiting Comparison / Awaiting Rebill) ──────────

  const isAcOrAr =
    isAwaitingComparison || currentStatus === 'Awaiting Rebill';

  const renderComparisonWaybillTable = () => (
    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
      <table
        style={{
          width: '100%',
          minWidth: isVP ? 1140 : 920,
          borderCollapse: 'collapse',
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
            <th style={{ width: 28, padding: '8px 12px' }} />
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Waybill</th>
            <th style={{ padding: '8px 12px', textAlign: 'right' }}>TMS Amount</th>
            {isVP && (
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>VP Amount</th>
            )}
            {isVP && <th style={{ padding: '8px 12px' }}>Comparison</th>}
            {isVP && (
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Difference</th>
            )}
            <th style={{ padding: '8px 12px' }}>Position Time</th>
            <th style={{ padding: '8px 12px' }}>Unloading Time</th>
            <th style={{ padding: '8px 12px' }}>Truck Type</th>
            <th style={{ padding: '8px 12px' }}>Origin</th>
            <th style={{ padding: '8px 12px' }}>Destination</th>
            <th style={{ padding: '8px 12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stmt.waybills.map((w) => {
            const expanded = expandedRows.has(w.no);
            const tot = waybillTotals(w, isVP);
            const cmp = isVP ? compareResult(tot.tms, tot.vp) : null;
            return (
              <React.Fragment key={w.no}>
                <tr
                  style={{
                    background: expanded ? '#fafafa' : undefined,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <td
                    style={{ padding: '8px 12px', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => toggleRow(w.no)}
                  >
                    <span style={{ fontSize: 12, color: '#999', userSelect: 'none' }}>
                      {expanded ? '▼' : '▶'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1677ff' }}>
                    {w.no}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    {fmt(tot.tms)}
                  </td>
                  {isVP && (
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      {fmt(tot.vp)}
                    </td>
                  )}
                  {isVP && cmp && (
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: cmp.color }}>
                        {cmp.label}
                      </span>
                    </td>
                  )}
                  {isVP && (
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        color: tot.diff !== 0 ? '#cf1322' : '#389e0d',
                        fontWeight: 500,
                      }}
                    >
                      {tot.diff !== 0 ? fmt(Math.abs(tot.diff)) : '—'}
                    </td>
                  )}
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                    {w.positionTime}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                    {w.unloadingTime}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{w.truckType}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                    {w.origin}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                    {w.destination}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {isEditable && (
                      <a
                        style={{ color: '#cf1322', fontSize: 12 }}
                        onClick={() => removeWaybill(w.no)}
                      >
                        Remove
                      </a>
                    )}
                  </td>
                </tr>

                {expanded && (
                  <tr key={`${w.no}-items`}>
                    <td
                      colSpan={isVP ? 12 : 9}
                      style={{ padding: 0, background: '#f5f7fa' }}
                    >
                      <table
                        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
                      >
                        <thead>
                          <tr
                            style={{
                              background: '#f0f2f5',
                              borderBottom: '1px solid #e0e0e0',
                            }}
                          >
                            <th
                              style={{
                                padding: '5px 32px',
                                textAlign: 'left',
                                fontWeight: 500,
                                color: '#666',
                                fontSize: 11,
                              }}
                            >
                              Waybill Item
                            </th>
                            <th
                              style={{
                                padding: '5px 8px',
                                textAlign: 'right',
                                fontWeight: 500,
                                color: '#666',
                                fontSize: 11,
                              }}
                            >
                              TMS Amount
                            </th>
                            {isVP && (
                              <th
                                style={{
                                  padding: '5px 8px',
                                  textAlign: 'right',
                                  fontWeight: 500,
                                  color: '#666',
                                  fontSize: 11,
                                }}
                              >
                                VP Amount
                              </th>
                            )}
                            {isVP && (
                              <th
                                style={{
                                  padding: '5px 8px',
                                  textAlign: 'right',
                                  fontWeight: 500,
                                  color: '#666',
                                  fontSize: 11,
                                }}
                              >
                                Diff
                              </th>
                            )}
                            {isVP && (
                              <th
                                style={{
                                  padding: '5px 8px',
                                  fontWeight: 500,
                                  color: '#666',
                                  fontSize: 11,
                                }}
                              >
                                Comparison Results
                              </th>
                            )}
                            <th
                              style={{
                                padding: '5px 8px',
                                fontWeight: 500,
                                color: '#666',
                                fontSize: 11,
                              }}
                            >
                              Item Status
                            </th>
                            <th
                              style={{
                                padding: '5px 8px',
                                fontWeight: 500,
                                color: '#666',
                                fontSize: 11,
                              }}
                            >
                              Operation
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {w.items.map((item: WaybillItem, idx: number) => {
                            const isPrePaid = item.name === 'PrePaid Amount';
                            const itemDiff = isVP
                              ? item.tmsAmount - item.vpAmount
                              : 0;
                            const itemCmp = isVP
                              ? isPrePaid
                                ? { label: 'Matched' as const, color: '#389e0d' }
                                : compareResult(item.tmsAmount, item.vpAmount)
                              : null;
                            const ck = `${w.no}:${item.name}`;
                            const isReturned = returnedKeys.has(ck);
                            const isOverBilled = itemCmp?.label === 'Over-Billed';
                            const actionKind = itemActionKind(item.name);
                            const showAction = isAwaitingComparison && !isPrePaid;
                            return (
                              <tr
                                key={idx}
                                style={{ borderBottom: '1px solid #efefef' }}
                              >
                                <td
                                  style={{
                                    padding: '6px 32px',
                                    color: isPrePaid ? '#0958d9' : '#555',
                                  }}
                                >
                                  {isPrePaid ? `↳ ${item.name}` : item.name}
                                </td>
                                <td
                                  style={{
                                    padding: '6px 8px',
                                    textAlign: 'right',
                                    color: isPrePaid ? '#0958d9' : '#333',
                                  }}
                                >
                                  {isPrePaid
                                    ? `−${fmt(item.tmsAmount)}`
                                    : fmt(item.tmsAmount)}
                                </td>
                                {isVP && (
                                  <td
                                    style={{
                                      padding: '6px 8px',
                                      textAlign: 'right',
                                      color: isPrePaid ? '#0958d9' : '#333',
                                    }}
                                  >
                                    {isPrePaid
                                      ? `−${fmt(item.vpAmount)}`
                                      : fmt(item.vpAmount)}
                                  </td>
                                )}
                                {isVP && (
                                  <td
                                    style={{
                                      padding: '6px 8px',
                                      textAlign: 'right',
                                      color: itemDiff !== 0 ? '#cf1322' : '#389e0d',
                                    }}
                                  >
                                    {itemDiff !== 0 ? fmt(Math.abs(itemDiff)) : '—'}
                                  </td>
                                )}
                                {isVP && (
                                  <td style={{ padding: '6px 8px' }}>
                                    {itemCmp && !isPrePaid && (
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 500,
                                          color: itemCmp.color,
                                        }}
                                      >
                                        {itemCmp.label}
                                      </span>
                                    )}
                                  </td>
                                )}
                                <td style={{ padding: '6px 8px' }}>
                                  {isPrePaid ? (
                                    <span style={{ color: '#bbb' }}>—</span>
                                  ) : isReturned ? (
                                    <span className={styles.itemStatusReturned}>
                                      Returned
                                    </span>
                                  ) : isAwaitingComparison ? (
                                    <span className={styles.itemStatusUnderPrep}>
                                      under billing preparation
                                    </span>
                                  ) : (
                                    <span style={{ color: '#bbb' }}>—</span>
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: '6px 8px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {showAction &&
                                    actionKind === 'return' &&
                                    !isReturned &&
                                    isOverBilled && (
                                      <a
                                        style={{ fontSize: 11, color: '#cf1322' }}
                                        onClick={() => markReturned(w.no, item.name)}
                                        title="Return to Pricing for amount correction"
                                      >
                                        Return
                                      </a>
                                    )}
                                  {showAction && actionKind === 'edit' && (
                                    <a
                                      style={{ fontSize: 11, color: '#1677ff' }}
                                      onClick={() =>
                                        openReimbursementEdit(w.no, item.tmsAmount)
                                      }
                                      title="FA direct edit (logged to Operation Log)"
                                    >
                                      Edit
                                    </a>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Flat waybill table (other statuses) ───────────────────────────────────────

  const renderFlatWaybillTable = () => (
    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
      <table
        style={{
          width: '100%',
          minWidth: 1100,
          borderCollapse: 'collapse',
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
            {[
              'Waybill',
              'Position Time',
              'Unloading Time',
              'Truck Type',
              'Origin',
              'Destination',
              'Basic Amount',
              'PrePaid',
              'Additional Charge',
              'Exception Fee',
              'Reimbursement',
              ...(currentStatus === 'Pending Payment' ? ['Item Status'] : []),
              ...(isEditable ? ['Actions'] : []),
            ].map((h, i) => (
              <th
                key={i}
                style={{
                  padding: '8px 12px',
                  textAlign: ['Basic Amount', 'PrePaid', 'Additional Charge', 'Exception Fee', 'Reimbursement'].includes(h)
                    ? 'right'
                    : 'left',
                  fontWeight: 600,
                  color: '#555',
                  fontSize: 12,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stmt.waybills.map((w) => {
            const findAmt = (name: string) =>
              w.items.find((i) => i.name === name)?.tmsAmount ?? 0;
            const dash = (v: number) =>
              v > 0 ? fmt(v) : <span style={{ color: '#bbb' }}>—</span>;
            return (
              <tr
                key={w.no}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1677ff' }}>
                  {w.no}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                  {w.positionTime}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                  {w.unloadingTime}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12 }}>{w.truckType}</td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                  {w.origin}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                  {w.destination}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  {dash(findAmt('Basic Amount'))}
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    color: '#0958d9',
                  }}
                >
                  {findAmt('PrePaid Amount') > 0 ? (
                    `−${fmt(findAmt('PrePaid Amount'))}`
                  ) : (
                    <span style={{ color: '#bbb' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  {dash(findAmt('Additional Charge'))}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  {dash(findAmt('Exception Fee'))}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  {dash(findAmt('Reimbursement'))}
                </td>
                {currentStatus === 'Pending Payment' && (
                  <td style={{ padding: '8px 12px' }}>
                    <span className={styles.itemStatusUnderPrep}>
                      pending payment
                    </span>
                  </td>
                )}
                {isEditable && (
                  <td style={{ padding: '8px 12px' }}>
                    <a
                      style={{ color: '#cf1322', fontSize: 12 }}
                      onClick={() => removeWaybill(w.no)}
                    >
                      Remove
                    </a>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderWaybillTable = () => {
    if (stmt.waybills.length === 0) {
      return (
        <div className={styles.emptyPlaceholder}>No waybills added.</div>
      );
    }
    return isAcOrAr
      ? renderComparisonWaybillTable()
      : renderFlatWaybillTable();
  };

  // ── Claim table ───────────────────────────────────────────────────────────────

  const renderClaimTable = () => {
    if (stmt.claims.length === 0) {
      return (
        <div className={styles.emptyPlaceholder}>
          No claim tickets attached.
        </div>
      );
    }
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
            {['Claim Ticket No.', 'Type', 'Waybill No.', 'Amount', 'Currency'].map(
              (h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '8px 12px',
                    textAlign: h === 'Amount' || h === 'Currency' ? 'right' : 'left',
                    fontWeight: 600,
                    color: '#555',
                    fontSize: 12,
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {stmt.claims.map((c) => (
            <tr key={c.no} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 12px' }}>
                <a
                  style={{
                    color: '#1677ff',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                  }}
                  onClick={() => setSelectedClaim(c)}
                >
                  {c.no}
                </a>
              </td>
              <td style={{ padding: '8px 12px', fontSize: 12 }}>{c.type}</td>
              <td style={{ padding: '8px 12px', fontSize: 12 }}>
                {c.waybillNo && c.waybillNo !== '—' ? (
                  <span style={{ color: '#1677ff' }}>{c.waybillNo}</span>
                ) : (
                  <span style={{ color: '#bbb' }}>—</span>
                )}
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                {fmt(c.amount)}
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  textAlign: 'right',
                  fontSize: 12,
                  color: '#555',
                }}
              >
                {c.currency}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ── Amount Summary ────────────────────────────────────────────────────────────

  const renderAmountSummary = () => {
    const colHdr = (l: string) => (
      <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>{l}</div>
    );

    const amtRow = (
      label: string,
      tms: number,
      vp?: number,
      bold?: boolean,
      isDeduction?: boolean,
    ) => {
      const sign = isDeduction ? '−' : '';
      const s: React.CSSProperties = {
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        color: isDeduction ? '#0958d9' : '#333',
      };
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isVP ? '2fr 1fr 1fr 1fr' : '2fr 1fr',
            gap: 4,
            alignItems: 'center',
            padding: '5px 0',
            borderBottom: '1px solid #f5f5f5',
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: isDeduction ? '#0958d9' : '#555',
              paddingLeft: isDeduction ? 12 : 0,
            }}
          >
            {isDeduction ? `↳ ${label}` : label}
          </span>
          <span style={{ ...s, textAlign: 'right' }}>
            {sign}
            {fmt(tms)}
          </span>
          {isVP && (
            <span style={{ ...s, textAlign: 'right' }}>
              {vp !== undefined ? `${sign}${fmt(vp)}` : '—'}
            </span>
          )}
          {isVP && (
            <span
              style={{
                ...s,
                textAlign: 'right',
                color: tms !== (vp ?? tms) ? '#cf1322' : '#389e0d',
              }}
            >
              {tms !== (vp ?? tms) ? fmt(Math.abs(tms - (vp ?? tms))) : '—'}
            </span>
          )}
        </div>
      );
    };

    return (
      <div>
        {/* Settlement items */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
            * Items to be settled
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              'Vendor Basic Amount',
              'Vendor Additional Charge',
              'Vendor Exception Fee',
              'Reimbursement Expense',
            ].map((item) => (
              <label
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  color: '#333',
                  cursor: 'not-allowed',
                }}
              >
                <input
                  type="checkbox"
                  checked={stmt.settlementItems.includes(item)}
                  disabled
                  readOnly
                />{' '}
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* Total Amount Payable */}
        <div className={styles.totalPayableBox}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
              Total Amount Payable
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: isVP ? 24 : 0 }}>
              <div>
                {isVP && (
                  <div style={{ fontSize: 11, color: '#999' }}>TMS Amount</div>
                )}
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
                  {fmt(tmsTotalPayable)}
                </div>
              </div>
              {isVP && (
                <>
                  <div>
                    <div style={{ fontSize: 11, color: '#999' }}>VP Amount</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#555' }}>
                      {fmt(vpTotalPayable)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#999' }}>Diff</div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color:
                          tmsTotalPayable !== vpTotalPayable ? '#cf1322' : '#389e0d',
                      }}
                    >
                      {tmsTotalPayable !== vpTotalPayable
                        ? fmt(Math.abs(tmsTotalPayable - vpTotalPayable))
                        : '—'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #d6e4ff', height: 40 }} />
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              Statement Tax Mark
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {(['Tax-inclusive', 'Tax-exclusive'] as const).map((m) => (
                <label
                  key={m}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 13,
                    cursor: 'not-allowed',
                  }}
                >
                  <input
                    type="radio"
                    name="taxMark_d"
                    value={m}
                    checked={stmt.taxMark === m}
                    disabled
                    readOnly
                  />{' '}
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 3-column grid */}
        <div className={styles.amountSummaryGrid}>
          <div className={styles.amountSummaryCol}>
            <div
              style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 10 }}
            >
              Waybill Contract Cost
            </div>
            {isVP && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: 4,
                  paddingBottom: 6,
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: 6,
                }}
              >
                <div />
                {colHdr('TMS')}
                {colHdr('VP')}
                {colHdr('Diff')}
              </div>
            )}
            {amtRow('Subtotal', tmsWCC, isVP ? vpWCC : undefined, true)}
            {amtRow('Vendor Basic Amount', tmsBasic, isVP ? vpBasic : undefined)}
            {tmsPrePaid > 0 &&
              amtRow(
                'PrePaid Amount',
                tmsPrePaid,
                isVP ? vpPrePaid : undefined,
                false,
                true,
              )}
            {tmsAdditional > 0 &&
              amtRow(
                'Vendor Additional Charge',
                tmsAdditional,
                isVP ? vpAdditional : undefined,
              )}
            {tmsException > 0 &&
              amtRow(
                'Vendor Exception Fee',
                tmsException,
                isVP ? vpException : undefined,
              )}
          </div>
          <div className={styles.amountSummaryDivider} />
          <div className={styles.amountSummaryCol}>
            <div
              style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 10 }}
            >
              Claim
            </div>
            {stmt.claims.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stmt.claims.map((c) => (
                  <div
                    key={c.no}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: '#555' }}>{c.type}</span>
                    <span style={{ color: '#cf1322', fontWeight: 500 }}>
                      −{fmt(c.amount)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 6,
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: '#333' }}>Subtotal</span>
                  <span style={{ color: '#cf1322' }}>−{fmt(claimTotal)}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#bbb',
                  fontSize: 13,
                }}
              >
                No claim deductions
              </div>
            )}
          </div>
          <div className={styles.amountSummaryDivider} />
          <div className={styles.amountSummaryCol}>
            <div
              style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 10 }}
            >
              Others
            </div>
            {isVP && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: 4,
                  paddingBottom: 6,
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: 6,
                }}
              >
                <div />
                {colHdr('TMS')}
                {colHdr('VP')}
                {colHdr('Diff')}
              </div>
            )}
            {vatRate > 0 &&
              amtRow(`VAT (${vatRate}%)`, tmsVAT, isVP ? vpVAT : undefined)}
            {whtRate > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isVP ? '2fr 1fr 1fr 1fr' : '2fr 1fr',
                  gap: 4,
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                <span style={{ fontSize: 13, color: '#555' }}>
                  WHT ({whtRate}%)
                </span>
                <span
                  style={{
                    fontSize: 13,
                    textAlign: 'right',
                    color: '#cf1322',
                  }}
                >
                  −{fmt(tmsWHT)}
                </span>
                {isVP && (
                  <span
                    style={{
                      fontSize: 13,
                      textAlign: 'right',
                      color: '#cf1322',
                    }}
                  >
                    −{fmt(vpWHT)}
                  </span>
                )}
                {isVP && (
                  <span
                    style={{
                      fontSize: 13,
                      textAlign: 'right',
                      color: tmsWHT !== vpWHT ? '#cf1322' : '#389e0d',
                    }}
                  >
                    {tmsWHT !== vpWHT ? fmt(Math.abs(tmsWHT - vpWHT)) : '—'}
                  </span>
                )}
              </div>
            )}
            {vatRate === 0 && whtRate === 0 && (
              <div
                style={{
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#bbb',
                  fontSize: 13,
                }}
              >
                No tax applied
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Invoice section ───────────────────────────────────────────────────────────

  const renderInvoice = () => (
    <div>
      {currentStatus === 'Pending Payment' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button
            size="small"
            onClick={() =>
              setShowAddInvoice(true)
            }
          >
            + Add Invoice
          </Button>
        </div>
      )}
      {stmt.invoices.length === 0 ? (
        <div className={styles.emptyPlaceholder}>No invoices added.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
              {['Invoice No.', 'Invoice Amount', 'Invoice Date', 'Proof', 'Actions'].map(
                (h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '8px 12px',
                      textAlign: h === 'Invoice Amount' ? 'right' : 'left',
                      fontWeight: 600,
                      color: '#555',
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {stmt.invoices.map((inv) => (
              <tr key={inv.no} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td
                  style={{
                    padding: '8px 12px',
                    color: '#1677ff',
                    fontWeight: 600,
                  }}
                >
                  {inv.no}
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  {fmt(inv.amount)}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                  {inv.date}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12 }}>
                  <span style={{ color: '#1677ff', cursor: 'pointer' }}>
                    {inv.proof}
                  </span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <a style={{ color: '#cf1322', fontSize: 12 }}>Void</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── Payment section ───────────────────────────────────────────────────────────

  const renderPayment = () => (
    <div>
      {stmt.payments.length === 0 ? (
        <div className={styles.emptyPlaceholder}>No payment records.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
              {[
                'Payable Amount',
                'Payment Request Status',
                'Payment Request No.',
                'Proof',
                'Bank Name',
                'Bank Account Name',
                'Bank Account No.',
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '8px 12px',
                    textAlign: h === 'Payable Amount' ? 'right' : 'left',
                    fontWeight: 600,
                    color: '#555',
                    fontSize: 12,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stmt.payments.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}
                >
                  {fmt(p.payableAmount)}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: p.status === 'Paid' ? '#389e0d' : '#d48806',
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#1677ff',
                  }}
                >
                  {p.applicationNo}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12 }}>
                  {p.proof !== '—' ? (
                    <span style={{ color: '#1677ff', cursor: 'pointer' }}>
                      {p.proof}
                    </span>
                  ) : (
                    <span style={{ color: '#bbb' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12 }}>{p.bankName}</td>
                <td style={{ padding: '8px 12px', fontSize: 12 }}>
                  {p.bankAccountName}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12 }}>
                  {p.bankAccountNo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── Standalone sections ───────────────────────────────────────────────────────

  const renderStandaloneMiscCharges = () => {
    const charges = localMiscCharges;
    const total = charges.reduce((s, c) => s + c.amount, 0);
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 12, color: '#999' }}>
            Miscellaneous Charge Edit History
          </span>
          {isEditable && (
            <Button
              size="small"
              onClick={() => {
                setMiscRowForm({ object: '', amount: '', proof: '' });
                setEditMiscIdx(null);
                setShowAddMiscRow(true);
              }}
            >
              + Add Row
            </Button>
          )}
        </div>
        {charges.length === 0 ? (
          <div className={styles.emptyPlaceholder}>
            No miscellaneous charges. Click "+ Add Row" to add one.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>
                  Miscellaneous Charge Object
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#555', fontSize: 12 }}>
                  Amount
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>
                  Proof
                </th>
                {isEditable && (
                  <th style={{ padding: '8px 12px', width: 110, fontWeight: 600, color: '#555', fontSize: 12 }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {charges.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px' }}>{c.object}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>
                    {fmt(c.amount)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>
                    {c.proof ? (
                      <span style={{ color: '#1677ff', cursor: 'pointer' }}>
                        {c.proof}
                      </span>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    )}
                  </td>
                  {isEditable && (
                    <td style={{ padding: '8px 12px' }}>
                      <a
                        style={{ fontSize: 12, marginRight: 8 }}
                        onClick={() => {
                          setMiscRowForm({
                            object: c.object,
                            amount: String(c.amount),
                            proof: c.proof,
                          });
                          setEditMiscIdx(i);
                          setShowAddMiscRow(true);
                        }}
                      >
                        Edit
                      </a>
                      <a
                        style={{ color: '#cf1322', fontSize: 12 }}
                        onClick={() => {
                          setLocalMiscCharges((prev) =>
                            prev.filter((_, j) => j !== i),
                          );
                          showToast('Row removed.');
                        }}
                      >
                        Remove
                      </a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#fafafa' }}>
                <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#555' }}>
                  Total Amount
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1677ff',
                  }}
                >
                  {fmt(total)}
                </td>
                <td />
                {isEditable && <td />}
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    );
  };

  const renderStandaloneInvoices = () => {
    const invs = localStandaloneInvoices;
    return (
      <div>
        {isEditable && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button
              size="small"
              onClick={() => {
                setInvoiceForm({ no: '', amount: '', date: '' });
                setShowAddInvoice(true);
              }}
            >
              + Add Invoice
            </Button>
          </div>
        )}
        {invs.length === 0 ? (
          <div className={styles.emptyPlaceholder}>
            No invoices added.{isEditable ? ' Click "+ Add Invoice" to add one.' : ''}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                {['Invoice Number', 'Invoice Amount', 'Invoice Date', 'Invoice Proof', ...(isEditable ? ['Actions'] : [])].map(
                  (h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '8px 12px',
                        textAlign: h === 'Invoice Amount' ? 'right' : 'left',
                        fontWeight: 600,
                        color: '#555',
                        fontSize: 12,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {invs.map((inv, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px', color: '#1677ff', fontWeight: 600 }}>
                    {inv.number}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      textAlign: 'right',
                      fontWeight: 500,
                    }}
                  >
                    {fmt(inv.amount)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>
                    {inv.date}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>
                    {inv.proof ? (
                      <span style={{ color: '#1677ff', cursor: 'pointer' }}>
                        {inv.proof}
                      </span>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    )}
                  </td>
                  {isEditable && (
                    <td style={{ padding: '8px 12px' }}>
                      <a
                        style={{ color: '#cf1322', fontSize: 12 }}
                        onClick={() => {
                          setLocalStandaloneInvoices((prev) =>
                            prev.filter((_, j) => j !== i),
                          );
                          showToast(`Invoice ${inv.number} voided.`);
                        }}
                      >
                        Void
                      </a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderStandaloneProofs = () => {
    const proofs = stmt.standaloneProofs ?? [];
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button size="small">+ Add Proof</Button>
        </div>
        {proofs.length === 0 ? (
          <div className={styles.emptyPlaceholder}>
            No proof message records yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proofs.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{ flex: 1, fontSize: 13, color: '#333', lineHeight: 1.6 }}
                >
                  {p.message}
                </div>
                <a style={{ color: '#cf1322', fontSize: 12, flexShrink: 0 }}>
                  Remove
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Operation Log ─────────────────────────────────────────────────────────────

  const renderOperationLog = () => (
    <div className={styles.logTimeline}>
      {currentLog.map((entry, i) => (
        <div key={i} className={styles.logEntry}>
          <div className={styles.logDot}>
            <div className={styles.logDotCircle} />
            {i < currentLog.length - 1 && <div className={styles.logLine} />}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>
              <span style={{ color: '#999', marginRight: 10 }}>{entry.time}</span>
              <span>{entry.action}</span>
              <span style={{ color: '#1677ff', marginLeft: 8 }}>{entry.operator}</span>
            </div>
            {entry.detail && (
              <div
                style={{
                  fontSize: 12,
                  color: '#888',
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  padding: '4px 10px',
                  marginTop: 4,
                }}
              >
                Reason: {entry.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Tabs config ────────────────────────────────────────────────────────────────

  const standardTabs = [
    {
      key: 'billing',
      label: 'Billing Details',
      children: (
        <div>
          {/* Blocking alert */}
          {isAwaitingComparison && blockingKey && (
            <div className={styles.blockAlert}>
              <span>&#9888;</span>
              <span>
                Payment Blocked: [{blockingKey}] is {blockingReason}. Please
                resolve before confirming RFP.
              </span>
            </div>
          )}

          {/* Reject/Cancel reason */}
          {stmt.rejectReason && currentStatus === 'Awaiting Rebill' && (
            <div className={styles.rejectReasonBox}>
              <strong>Reject Reason:</strong> {stmt.rejectReason}
            </div>
          )}
          {stmt.cancelReason && currentStatus === 'Canceled' && (
            <div className={styles.cancelReasonBox}>
              <strong>Cancel Reason:</strong> {stmt.cancelReason}
            </div>
          )}

          {/* Settlement section tabs */}
          <Tabs
            defaultActiveKey="waybill"
            items={[
              {
                key: 'waybill',
                label: `Waybill (${stmt.waybills.length})`,
                children: renderWaybillTable(),
              },
              {
                key: 'claim',
                label: `Claim Tickets (${stmt.claims.length})`,
                children: renderClaimTable(),
              },
            ]}
          />

          {/* Amount Summary */}
          <div style={{ marginTop: 24 }}>
            <div className={styles.sectionTitle} style={{ marginBottom: 16 }}>
              <span>Amount Summary</span>
            </div>
            {renderAmountSummary()}
          </div>
        </div>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice',
      children: renderInvoice(),
    },
    {
      key: 'payment',
      label: 'Payment',
      children: renderPayment(),
    },
    {
      key: 'log',
      label: 'Operation Log',
      children: renderOperationLog(),
    },
  ];

  const standaloneTabs = [
    {
      key: 'misc',
      label: 'Miscellaneous Charges',
      children: renderStandaloneMiscCharges(),
    },
    {
      key: 'invoice',
      label: 'Invoice Management',
      children: renderStandaloneInvoices(),
    },
    {
      key: 'proof',
      label: 'Proof',
      children: renderStandaloneProofs(),
    },
    {
      key: 'payment',
      label: 'Payment',
      children: renderPayment(),
    },
    {
      key: 'log',
      label: 'Operation Log',
      children: renderOperationLog(),
    },
  ];

  // ── RFP Modal ────────────────────────────────────────────────────────────────

  const renderRFPModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox} style={{ width: 680 }}>
        <div className={styles.modalHeader}>
          <span>Create RFP</span>
          <a onClick={() => setShowRFPDialog(false)} style={{ fontSize: 16, color: '#999' }}>
            ✕
          </a>
        </div>
        <div className={styles.modalBody}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 14,
              marginBottom: 16,
            }}
          >
            {[
              {
                label: 'Responsible Department',
                el: (
                  <select
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    defaultValue="Account Payable Department"
                  >
                    <option>Account Payable Department</option>
                  </select>
                ),
              },
              {
                label: 'Payment Definition',
                el: (
                  <select
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    value={rfpPaymentDef}
                    onChange={(e) => setRfpPaymentDef(e.target.value)}
                  >
                    {PAYMENT_DEFINITIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                ),
              },
              {
                label: 'Entity',
                el: (
                  <select
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    value={rfpEntity}
                    onChange={(e) => setRfpEntity(e.target.value)}
                  >
                    <option value="" />
                    {ENTITIES.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                ),
              },
              {
                label: 'Business Unit',
                el: (
                  <select
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    value={rfpBU}
                    onChange={(e) => setRfpBU(e.target.value)}
                  >
                    <option value="" />
                    {BUSINESS_UNITS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                ),
              },
            ].map(({ label, el }, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                  <span style={{ color: '#ff4d4f' }}>* </span>
                  {label}
                </div>
                {el}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                <span style={{ color: '#ff4d4f' }}>* </span>Date of Needed
              </div>
              <input
                type="date"
                style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                value={rfpDateNeeded}
                onChange={(e) => setRfpDateNeeded(e.target.value)}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                Payment Category
              </div>
              <div style={{ fontSize: 13, color: '#555', paddingTop: 6 }}>
                Vendor Payment
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                <span style={{ color: '#ff4d4f' }}>* </span>Payment Identification L1
              </div>
              <select
                style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                defaultValue="Logistics & Trucking"
              >
                <option>Logistics &amp; Trucking</option>
                <option>Global Forwarding</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                <span style={{ color: '#ff4d4f' }}>* </span>Payment Identification L2
              </div>
              <select
                style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                value={rfpIdL2}
                onChange={(e) => setRfpIdL2(e.target.value)}
              >
                <option value="" />
                {PAYMENT_ID_L2.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>
              Supporting Documents
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {rfpDocs.map((doc, i) => (
                <div
                  key={i}
                  style={{
                    width: 76,
                    height: 76,
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                  }}
                >
                  <div style={{ fontSize: 22, color: '#aaa' }}>📄</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{doc}</div>
                </div>
              ))}
              <div
                style={{
                  width: 76,
                  height: 76,
                  border: '1px dashed #d9d9d9',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#fafafa',
                  fontSize: 26,
                  color: '#ccc',
                }}
              >
                +
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button onClick={() => setShowRFPDialog(false)}>Cancel</Button>
          <Button
            type="primary"
            disabled={!rfpEntity || !rfpBU || !rfpDateNeeded || !rfpIdL2}
            onClick={() => {
              const now = new Date().toISOString();
              const logEntry: LogEntry = {
                time: now.slice(0, 16).replace('T', ' '),
                action: 'Confirmed & Created RFP',
                operator: 'TMS User',
              };
              setCurrentStatus('Pending Payment');
              setCurrentLog((prev) => [...prev, logEntry]);
              updateApStatementStatus(statementId!, { status: 'Pending Payment' });
              appendApStmtLog(statementId!, {
                time: now,
                actor: 'TMS User',
                action: 'Confirmed & Created RFP',
              });
              setShowRFPDialog(false);
              showToast('RFP created successfully');
            }}
          >
            Sync
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbCase
        items={[
          { name: 'AP Statement', path: PATHS.BILLING_AP_STATEMENT_ENHANCED },
          { name: stmt.no, path: PATHS.BILLING_AP_STATEMENT_ENHANCED_DETAIL },
        ]}
      />
      {/* Page Header */}
      <div className={styles.card}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
            {stmt.no}
          </span>
          {renderTopActions()}
        </div>

        {/* Statement Info */}
        <div className={styles.sectionTitle} style={{ marginBottom: 16 }}>
          <span>Statement Information</span>
        </div>
        {isStandalone ? renderStandaloneInfo() : renderStandardInfo()}
      </div>

      {/* Main Content Tabs */}
      <div className={styles.card}>
        <Tabs items={isStandalone ? standaloneTabs : standardTabs} />
      </div>

      {/* ── Dialogs ── */}

      {/* Claim detail modal */}
      {selectedClaim && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedClaim(null)}
        >
          <div
            className={styles.modalBox}
            style={{ width: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span>Claim Ticket Details</span>
              <a
                onClick={() => setSelectedClaim(null)}
                style={{ fontSize: 16, color: '#999' }}
              >
                ✕
              </a>
            </div>
            <div className={styles.modalBody}>
              {[
                {
                  label: 'Claim Ticket No.',
                  value: (
                    <strong style={{ color: '#1677ff' }}>{selectedClaim.no}</strong>
                  ),
                },
                { label: 'Claim Type', value: selectedClaim.type },
                {
                  label: 'Related Waybill',
                  value:
                    selectedClaim.waybillNo && selectedClaim.waybillNo !== '—' ? (
                      <span style={{ color: '#1677ff' }}>{selectedClaim.waybillNo}</span>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    ),
                },
                {
                  label: 'Amount',
                  value: (
                    <strong style={{ color: '#333' }}>{fmt(selectedClaim.amount)}</strong>
                  ),
                },
                { label: 'Currency', value: selectedClaim.currency },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '8px 0',
                    borderBottom: i < 4 ? '1px solid #f5f5f5' : undefined,
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: '#999', minWidth: 140 }}
                  >
                    {item.label}
                  </span>
                  <span style={{ fontSize: 13, color: '#333' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setSelectedClaim(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {showRejectDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 440 }}>
            <div className={styles.modalHeader}>
              <span>Reject to Vendor</span>
              <a
                onClick={() => setShowRejectDialog(false)}
                style={{ fontSize: 16, color: '#999' }}
              >
                ✕
              </a>
            </div>
            <div className={styles.modalBody}>
              <div
                style={{
                  background: '#fffbe6',
                  border: '1px solid #ffe58f',
                  borderRadius: 4,
                  padding: '8px 12px',
                  marginBottom: 12,
                  fontSize: 13,
                  color: '#614700',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>&#9888;</span>
                <span>Vendors can only modify over-billed settlement items.</span>
              </div>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                Provide a rejection reason. The statement will be set to{' '}
                <strong>Awaiting Rebill</strong>.
              </p>
              <textarea
                style={{
                  width: '100%',
                  minHeight: 100,
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: 10,
                  fontSize: 13,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter reject reason…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button
                danger
                disabled={!rejectReason.trim()}
                onClick={() => {
                  const now = new Date().toISOString();
                  const logEntry: LogEntry = {
                    time: now.slice(0, 16).replace('T', ' '),
                    action: 'Rejected the AP statement',
                    operator: 'TMS User',
                    detail: rejectReason,
                  };
                  setCurrentStatus('Awaiting Rebill');
                  setCurrentRejectReason(rejectReason);
                  setCurrentLog((prev) => [...prev, logEntry]);
                  updateApStatementStatus(statementId!, {
                    status: 'Awaiting Rebill',
                    rejectReason,
                  });
                  appendApStmtLog(statementId!, {
                    time: now,
                    actor: 'TMS User',
                    action: 'Rejected the AP statement',
                    note: rejectReason,
                  });
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 440 }}>
            <div className={styles.modalHeader}>
              <span>Cancel Statement</span>
              <a
                onClick={() => setShowCancelDialog(false)}
                style={{ fontSize: 16, color: '#999' }}
              >
                ✕
              </a>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                Linked waybills and tickets will be released. Please enter the
                cancel reason.
              </p>
              <textarea
                style={{
                  width: '100%',
                  minHeight: 100,
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: 10,
                  fontSize: 13,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter cancel reason…"
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
              />
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setShowCancelDialog(false)}>Back</Button>
              <Button
                danger
                disabled={!cancelReasonInput.trim()}
                onClick={() => {
                  const now = new Date().toISOString();
                  const logEntry: LogEntry = {
                    time: now.slice(0, 16).replace('T', ' '),
                    action: 'Canceled the AP statement',
                    operator: 'TMS User',
                    detail: cancelReasonInput,
                  };
                  setCurrentStatus('Canceled');
                  setCurrentLog((prev) => [...prev, logEntry]);
                  updateApStatementStatus(statementId!, {
                    status: 'Canceled',
                    cancelReason: cancelReasonInput,
                  });
                  appendApStmtLog(statementId!, {
                    time: now,
                    actor: 'TMS User',
                    action: 'Canceled the AP statement',
                    note: cancelReasonInput,
                  });
                  setShowCancelDialog(false);
                  setCancelReasonInput('');
                }}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Misc Charge dialog */}
      {showAddMiscRow && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 440 }}>
            <div className={styles.modalHeader}>
              <span>
                {editMiscIdx !== null
                  ? 'Edit Miscellaneous Charge'
                  : 'Add Miscellaneous Charge'}
              </span>
              <a
                onClick={() => setShowAddMiscRow(false)}
                style={{ fontSize: 16, color: '#999' }}
              >
                ✕
              </a>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px' }}
            >
              <label style={{ fontSize: 13, color: '#555' }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: '#ff4d4f' }}>* </span>Charge Object
                </div>
                <input
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                  value={miscRowForm.object}
                  onChange={(e) =>
                    setMiscRowForm((prev) => ({ ...prev, object: e.target.value }))
                  }
                />
              </label>
              <label style={{ fontSize: 13, color: '#555' }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: '#ff4d4f' }}>* </span>Amount
                </div>
                <input
                  type="number"
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                  value={miscRowForm.amount}
                  onChange={(e) =>
                    setMiscRowForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </label>
              <label style={{ fontSize: 13, color: '#555' }}>
                <div style={{ marginBottom: 4 }}>Proof</div>
                <input
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                  placeholder="e.g. receipt.pdf"
                  value={miscRowForm.proof}
                  onChange={(e) =>
                    setMiscRowForm((prev) => ({ ...prev, proof: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setShowAddMiscRow(false)}>Cancel</Button>
              <Button
                type="primary"
                disabled={!miscRowForm.object.trim() || !miscRowForm.amount}
                onClick={() => {
                  const row = {
                    object: miscRowForm.object.trim(),
                    amount: Number(miscRowForm.amount) || 0,
                    proof: miscRowForm.proof.trim(),
                  };
                  if (editMiscIdx !== null) {
                    setLocalMiscCharges((prev) =>
                      prev.map((m, i) => (i === editMiscIdx ? row : m)),
                    );
                    showToast('Row updated.');
                  } else {
                    setLocalMiscCharges((prev) => [...prev, row]);
                    showToast('Row added.');
                  }
                  setShowAddMiscRow(false);
                }}
              >
                {editMiscIdx !== null ? 'Save' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice dialog */}
      {showAddInvoice && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 480 }}>
            <div className={styles.modalHeader}>
              <span>Add Invoice</span>
              <a
                onClick={() => setShowAddInvoice(false)}
                style={{ fontSize: 16, color: '#999' }}
              >
                ✕
              </a>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ fontSize: 13, color: '#555' }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#ff4d4f' }}>* </span>Invoice No.
                  </div>
                  <input
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    value={invoiceForm.no}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, no: e.target.value })
                    }
                  />
                </label>
                <label style={{ fontSize: 13, color: '#555' }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#ff4d4f' }}>* </span>Invoice Amount
                  </div>
                  <input
                    type="number"
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    value={invoiceForm.amount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, amount: e.target.value })
                    }
                  />
                </label>
                <label style={{ fontSize: 13, color: '#555' }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#ff4d4f' }}>* </span>Invoice Date
                  </div>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                    value={invoiceForm.date}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, date: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setShowAddInvoice(false)}>Cancel</Button>
              <Button
                type="primary"
                disabled={
                  !invoiceForm.no.trim() || !invoiceForm.amount || !invoiceForm.date
                }
                onClick={() => {
                  const now = new Date().toISOString();
                  const logEntry: LogEntry = {
                    time: now.slice(0, 16).replace('T', ' '),
                    action: `Added invoice ${invoiceForm.no}`,
                    operator: 'TMS User',
                  };
                  setCurrentLog((prev) => [...prev, logEntry]);
                  appendApStmtLog(statementId!, {
                    time: now,
                    actor: 'TMS User',
                    action: logEntry.action,
                  });
                  setLocalStandaloneInvoices((prev) => [
                    ...prev,
                    {
                      number: invoiceForm.no.trim(),
                      amount: Number(invoiceForm.amount) || 0,
                      date: invoiceForm.date,
                      proof: '',
                    },
                  ]);
                  setShowAddInvoice(false);
                  setInvoiceForm({ no: '', amount: '', date: '' });
                  showToast('Invoice added');
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reimbursement Edit modal */}
      {editingReimbursement && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 420 }}>
            <div className={styles.modalHeader}>
              <span>Edit Reimbursement — {editingReimbursement.wNo}</span>
              <a
                onClick={() => setEditingReimbursement(null)}
                style={{ fontSize: 16, color: '#999' }}
              >
                ✕
              </a>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                FA can directly amend the Reimbursement amount; the change is
                recorded in Operation Log.
              </p>
              <label style={{ fontSize: 13, color: '#555' }}>
                <div style={{ marginBottom: 4 }}>Reimbursement Amount</div>
                <input
                  type="number"
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setEditingReimbursement(null)}>Cancel</Button>
              <Button type="primary" onClick={confirmReimbursementEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RFP Modal */}
      {showRFPDialog && renderRFPModal()}

      {/* Returned notification */}
      {showReturnedDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 360 }}>
            <div className={styles.modalHeader}>
              <span>Item Returned</span>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: '#555' }}>
                The settlement item has been marked as{' '}
                <strong>Returned</strong>. The vendor will be notified to revise
                and resubmit.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <Button type="primary" onClick={() => setShowReturnedDialog(false)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};

export default ApStatementEnhancedDetail;
