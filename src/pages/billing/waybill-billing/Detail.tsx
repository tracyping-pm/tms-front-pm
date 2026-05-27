import React, { useState } from 'react';
import { history, useLocation } from '@umijs/max';
import { Button, Modal } from 'antd';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import {
  getAllApStatements,
  updateApStatementStatus,
  type SyncedApStmtWaybill,
} from '@/pages/vendor/common/apStatementSync';
import { PATHS } from '@/constants';
import styles from './index.less';
import {
  WAYBILL_DATA,
  type BillingItem,
  type WaybillBillingData,
} from './mock/tmsWaybills';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n === 0) return '-';
  const sign = n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function money(n: number): string {
  if (n === 0) return '-';
  return n < 0
    ? '-PHP ' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : 'PHP ' + fmt(n);
}

function nowStr(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

const STATEMENT_TO_COST_ITEM: Record<string, string> = {
  'Basic Amount': 'Basic Amount Payable (Remaining)',
  'Additional Charge': 'Additional Amount Payable',
  'Exception Fee': 'Vendor Exception Fee',
  Reimbursement: 'Reimbursement Expense',
};

const COST_TO_REVENUE_NAME: Record<string, string> = {
  'Basic Amount Payable (Remaining)': 'Basic Amount Receivable',
  'Additional Amount Payable': 'Additional Amount Receivable',
};

function costItemMatchesReturned(costItemName: string, returnedName: string): boolean {
  return costItemName === returnedName || STATEMENT_TO_COST_ITEM[returnedName] === costItemName;
}

function statementItemNameForCost(costItemName: string): string {
  const pair = Object.entries(STATEMENT_TO_COST_ITEM).find(
    ([, costName]) => costName === costItemName,
  );
  return pair?.[0] ?? costItemName;
}

function isVendorUnderBillItem(name: string): boolean {
  return (
    name === 'Vendor Under-bill' ||
    name === 'Vendor Discount Amount' ||
    name === 'Underbilling Adjustment'
  );
}

function normalizeCostItem(item: BillingItem): BillingItem {
  if (!isVendorUnderBillItem(item.name)) return item;
  return {
    ...item,
    name: 'Vendor Under-bill',
    amount: item.amount === 0 ? 0 : -Math.abs(item.amount),
  };
}

function patchStatementWaybillAmount(
  waybill: SyncedApStmtWaybill,
  targetWaybillNo: string,
  statementItemName: string,
  amount: number,
): SyncedApStmtWaybill {
  if (waybill.no !== targetWaybillNo) return waybill;
  if (statementItemName === 'Additional Charge') return { ...waybill, additionalCharge: amount };
  if (statementItemName === 'Exception Fee') return { ...waybill, exceptionFee: amount };
  if (statementItemName === 'Reimbursement') return { ...waybill, reimbursement: amount };
  return { ...waybill, basicAmount: amount };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const WaybillBillingDetail: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const waybillNo = params.get('no') ?? 'WB2604011';

  const base: WaybillBillingData =
    WAYBILL_DATA[waybillNo] ?? WAYBILL_DATA['WB2604011'];

  // Init localCost — merge base mock with returned items from AP Statement sync
  const [localCost, setLocalCost] = useState<BillingItem[]>(() => {
    const stmts = getAllApStatements();
    const syncReturnedNames = new Set<string>();
    stmts.forEach((s) => {
      if (!s.returnedItems) return;
      Object.entries(s.returnedItems).forEach(([key, val]) => {
        if (val) {
          const colonIdx = key.indexOf(':');
          if (colonIdx > -1 && key.slice(0, colonIdx) === waybillNo) {
            syncReturnedNames.add(key.slice(colonIdx + 1));
          }
        }
      });
    });
    return base.contractCost.map((item) =>
      Array.from(syncReturnedNames).some((returnedName) =>
        costItemMatchesReturned(item.name, returnedName),
      )
        ? { ...item, status: 'Returned', statusColor: '#cf1322' }
        : item,
    );
  });

  const [localLog, setLocalLog] = useState(base.operationLog);

  // Sync success banner
  const [syncMsg, setSyncMsg] = useState('');

  // Edit Basic Amount dialog state
  const [showEditBasic, setShowEditBasic] = useState(false);
  const [editingItemName, setEditingItemName] = useState('');
  const [editBasicAmount, setEditBasicAmount] = useState('');
  const [showApNotified, setShowApNotified] = useState(false);

  const openEditBasic = (itemName: string) => {
    setEditingItemName(itemName);
    setEditBasicAmount('');
    setShowEditBasic(true);
  };

  const confirmEditBasic = () => {
    const newAmt = Number(editBasicAmount);
    const oldItem = localCost.find((i) => i.name === editingItemName);
    const oldAmt = oldItem?.amount ?? 0;

    // Update status to Under Payment Preparation after editing a returned item
    setLocalCost((prev) => {
      const updated = prev.map((i) =>
        i.name === editingItemName
          ? { ...i, amount: newAmt, status: 'Under Payment Preparation', statusColor: '#d46b08' }
          : i,
      );
      // Record vendor under-bill as a negative Contract Cost item if amount decreased
      if (newAmt < oldAmt) {
        const diff = oldAmt - newAmt;
        const existing = updated.find((i) => isVendorUnderBillItem(i.name));
        if (existing) {
          return updated.map((i) =>
            isVendorUnderBillItem(i.name)
              ? {
                  ...i,
                  name: 'Vendor Under-bill',
                  amount: -Math.abs(i.amount) - diff,
                  status: 'Under Payment Preparation',
                  statusColor: '#d46b08',
                }
              : i,
          );
        }
        updated.push({
          name: 'Vendor Under-bill',
          amount: -diff,
          status: 'Under Payment Preparation',
          statusColor: '#d46b08',
        });
      }
      return updated;
    });

    setLocalLog((prev) => [
      {
        time: nowStr(),
        actor: 'Zhang Jialei',
        action: `Edit ${editingItemName}: ${fmt(oldAmt)} → ${fmt(newAmt)}`,
      },
      ...prev,
    ]);

    // Sync amount back to linked AP Statement
    if (base.linkedStatement) {
      const stmts = getAllApStatements();
      const stmt = stmts.find((s) => s.no === base.linkedStatement);
      if (stmt) {
        const statementItemName = statementItemNameForCost(editingItemName);
        const returnedKey = `${waybillNo}:${statementItemName}`;
        const legacyReturnedKey = `${waybillNo}:${editingItemName}`;
        const newReturnedItems = { ...(stmt.returnedItems ?? {}) };
        delete newReturnedItems[returnedKey];
        delete newReturnedItems[legacyReturnedKey];
        const updatedWaybills = stmt.waybills.map((w) =>
          patchStatementWaybillAmount(w, waybillNo, statementItemName, newAmt),
        );
        updateApStatementStatus(base.linkedStatement, {
          returnedItems: newReturnedItems,
          waybills: updatedWaybills,
          status: 'Under Payment Preparation',
        });
        setSyncMsg(`Amount synced to AP Statement ${base.linkedStatement}`);
        setTimeout(() => setSyncMsg(''), 4000);
      }
    }

    setShowEditBasic(false);
    setShowApNotified(true);
  };

  const visibleRevenue = base.contractRevenue;
  const visibleCost = localCost.map(normalizeCostItem).filter((i) => i.amount !== 0);

  const totalRevenue = visibleRevenue.reduce((s, i) => s + i.amount, 0);
  const totalCost = visibleCost.reduce((s, i) => s + i.amount, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin =
    totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(0) : '0';

  const isAwaitingSettlement = localCost.some((i) => i.status === 'Returned');

  const editingItem = localCost.find((i) => i.name === editingItemName);
  const editingRevItem = base.contractRevenue.find(
    (r) => r.name === COST_TO_REVENUE_NAME[editingItemName],
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.detailWrapper}>
      <BreadcrumbCase
        items={[
          { name: 'Waybill Billing', path: PATHS.BILLING_WAYBILL_BILLING },
          { name: 'Waybill Detail', path: PATHS.BILLING_WAYBILL_BILLING_DETAIL },
        ]}
      />
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.waybillTitle}>{waybillNo}</span>
        {isAwaitingSettlement && (
          <span className={styles.financialStatusTag}>
            <span className={styles.financialStatusDot} />
            Financial Status: Awaiting Settlement
          </span>
        )}
      </div>

      {/* Sync success banner */}
      {syncMsg && (
        <div className={styles.syncBanner}>
          <span>✓</span>
          {syncMsg}
        </div>
      )}

      {/* Billing Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.sectionTitle}>
            <span>Billing</span>
          </div>
          {base.linkedStatement && (
            <Button size="small">
              Linked Statement: {base.linkedStatement}
            </Button>
          )}
        </div>

        {/* Truck type row */}
        <div className={styles.truckTypeGrid}>
          <div className={styles.truckTypeGroup}>
            <div>
              <div className={styles.truckTypeLabel}>Customer Billing Truck Type</div>
              <div className={styles.truckTypeValueBold}>{base.customerTruckType}</div>
            </div>
            <div>
              <div className={styles.truckTypeLabel}>Customer Required Truck Type</div>
              <div className={styles.truckTypeValue}>{base.requiredTruckType}</div>
            </div>
          </div>
          <div className={styles.truckTypeGroup}>
            <div>
              <div className={styles.truckTypeLabel}>Vendor Billing Truck Type</div>
              <div className={styles.truckTypeValueBold}>{base.vendorTruckType}</div>
            </div>
            <div>
              <div className={styles.truckTypeLabel}>Vendor Required Truck Type</div>
              <div className={styles.truckTypeValue}>{base.vendorRequiredTruckType}</div>
            </div>
          </div>
        </div>

        {/* Contract Revenue | Contract Cost split panel */}
        <div className={styles.billingGrid}>
          {/* Contract Revenue */}
          <div className={styles.billingCol}>
            <div className={styles.billingColHeader}>
              <span>Contract Revenue</span>
              <span className={styles.billingColTotal}>{money(totalRevenue)}</span>
            </div>
            {visibleRevenue.map((item, i) => (
              <div
                key={i}
                className={styles.billingRow}
                style={i === visibleRevenue.length - 1 ? { borderBottom: 'none' } : {}}
              >
                <div>
                  <div className={styles.billingItemName}>{item.name}</div>
                  {item.status && (
                    <div
                      className={styles.billingItemStatus}
                      style={{ color: item.statusColor ?? '#999' }}
                    >
                      <span
                        className={styles.billingItemStatusDot}
                        style={{ background: item.statusColor ?? '#999' }}
                      />
                      {item.status}
                    </div>
                  )}
                </div>
                <div
                  className={styles.billingItemAmount}
                  style={{ color: item.amount < 0 ? '#cf1322' : '#333' }}
                >
                  {money(item.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.billingGridDivider} />

          {/* Contract Cost — per-row Edit button when status is Returned */}
          <div className={styles.billingCol}>
            <div className={styles.billingColHeader}>
              <span>Contract Cost</span>
              <span className={styles.billingColTotal}>{money(totalCost)}</span>
            </div>
            {visibleCost.map((item, i) => (
              <div
                key={i}
                className={`${styles.billingRow} ${item.status === 'Returned' ? styles.billingRowReturned : ''}`}
                style={i === visibleCost.length - 1 ? { borderBottom: 'none' } : {}}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className={styles.billingItemName}>{item.name}</div>
                  {item.status && (
                    <div
                      className={styles.billingItemStatus}
                      style={{ color: item.statusColor ?? '#999' }}
                    >
                      <span
                        className={styles.billingItemStatusDot}
                        style={{ background: item.statusColor ?? '#999' }}
                      />
                      {item.status}
                    </div>
                  )}
                </div>
                <div className={styles.billingItemAmountArea}>
                  {item.status === 'Returned' && (
                    <Button
                      type="link"
                      size="small"
                      style={{ fontSize: 11, padding: 0, whiteSpace: 'nowrap' }}
                      onClick={() => openEditBasic(item.name)}
                    >
                      Edit
                    </Button>
                  )}
                  <div
                    className={styles.billingItemAmount}
                    style={{ color: item.amount < 0 ? '#cf1322' : '#333' }}
                  >
                    {money(item.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gross Profit / Margin */}
        <div className={styles.grossRow}>
          <div>
            <div className={styles.grossLabel}>Gross Profit</div>
            <div
              className={styles.grossValue}
              style={{ color: grossProfit >= 0 ? '#389e0d' : '#cf1322' }}
            >
              {money(grossProfit)}
            </div>
          </div>
          <div>
            <div className={styles.grossLabel}>Gross Margin</div>
            <div
              className={styles.grossValue}
              style={{ color: parseInt(grossMargin) >= 0 ? '#389e0d' : '#cf1322' }}
            >
              {grossMargin}%
            </div>
          </div>
        </div>
      </div>

      {/* Operation Log */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.sectionTitle}>
            <span>Operation Log</span>
          </div>
        </div>
        <div className={styles.logTimeline}>
          {localLog.map((entry, i) => (
            <div key={i} className={styles.logEntry}>
              <div className={styles.logDot}>
                <div className={styles.logDotCircle} />
                {i < localLog.length - 1 && <div className={styles.logLine} />}
              </div>
              <div>
                <div className={styles.logText}>
                  <span className={styles.logTime}>{entry.time}</span>
                  <span className={styles.logActor}>{entry.actor}</span>
                  <span>{entry.action}</span>
                </div>
                {entry.detail && (
                  <div className={styles.logDetail}>{entry.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Basic Amount dialog — triggered per row when status is Returned */}
      <Modal
        title="Edit Basic amount"
        open={showEditBasic}
        onCancel={() => setShowEditBasic(false)}
        width={580}
        styles={{ header: { borderBottom: '1.5px solid #fa8c16' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setShowEditBasic(false)}>Fallback</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setShowEditBasic(false)}>Cancel</Button>
              <Button type="primary" disabled={!editBasicAmount} onClick={confirmEditBasic}>
                Confirm
              </Button>
            </div>
          </div>
        }
      >
        <div className={styles.editModalGrid}>
          {/* Left: Receivable side (read-only) */}
          <div className={styles.editModalPanel}>
            <div className={styles.editModalPanelHeader}>
              <span className={styles.editModalPanelTitle}>
                {COST_TO_REVENUE_NAME[editingItemName] ?? 'Basic Amount Receivable'}
              </span>
              <span
                className={styles.editModalStatusChip}
                style={{ color: editingRevItem?.statusColor ?? '#389e0d' }}
              >
                <span
                  className={styles.editModalStatusDot}
                  style={{ background: editingRevItem?.statusColor ?? '#389e0d' }}
                />
                {editingRevItem?.status ?? 'Collected'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>
                {COST_TO_REVENUE_NAME[editingItemName] ?? 'Basic Amount Receivable'}:
              </span>
              <div className={styles.readonlyAmountBox}>
                <span className={styles.currencyPrefix}>฿</span>
                <span className={styles.readonlyAmount}>
                  {editingRevItem
                    ? Math.abs(editingRevItem.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.editModalDivider} />

          {/* Right: Payable side (editable) */}
          <div className={styles.editModalPanel}>
            <div className={styles.editModalPanelHeader}>
              <span className={styles.editModalPanelTitle}>{editingItemName}</span>
              <span
                className={styles.editModalStatusChip}
                style={{ color: editingItem?.statusColor ?? '#cf1322' }}
              >
                <span
                  className={styles.editModalStatusDot}
                  style={{ background: editingItem?.statusColor ?? '#cf1322' }}
                />
                {editingItem?.status ?? 'Returned'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#555' }}>{editingItemName}</span>
              <div className={styles.editInputWrapper}>
                <span className={styles.editInputPrefix}>฿</span>
                <input
                  type="number"
                  className={styles.editInput}
                  placeholder=""
                  value={editBasicAmount}
                  onChange={(e) => setEditBasicAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* AP Team notified dialog — shown after confirming Edit */}
      <Modal
        title="Amount Updated"
        open={showApNotified}
        onCancel={() => setShowApNotified(false)}
        onOk={() => setShowApNotified(false)}
        okText="OK"
        cancelButtonProps={{ style: { display: 'none' } }}
        width={420}
      >
        <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
          AP Team has been notified via Slack: Marcus, Diana, Eliot
        </p>
      </Modal>
    </div>
  );
};

export default WaybillBillingDetail;
