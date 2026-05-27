import React, { useState, useMemo, useEffect, useRef } from 'react';
import { history } from '@umijs/max';
import { Button } from 'antd';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { upsertApStatement, getAllApStatements } from '@/pages/vendor/common/apStatementSync';
import { PATHS } from '@/constants';
import { TMS_WAYBILLS, type TmsWaybill } from './mock/tmsWaybills';
import { TMS_CLAIM_TICKETS, type TmsClaimTicket } from './mock/tmsClaimTickets';
import styles from './index.less';

// ─── Constants ─────────────────────────────────────────────────────────────────

const VENDORS = [
  'Coca-Cola Bottlers PH Inc.',
  'SMC Logistics',
  'JG Summit Freight',
  'Manila Freight Co.',
  'Bangkok Express Logistics',
  'Laguna Logistics Corp.',
];

const RECONCILIATION_PERIODS = [
  '2026-04 (Apr 1 – Apr 30)',
  '2026-03 (Mar 1 – Mar 31)',
  '2026-02 (Feb 1 – Feb 28)',
];

const TRUCK_TYPES = ['4-Wheeler', '6-Wheeler', '10-Wheeler'];
const PAYMENT_DEFINITIONS = ['Bank Transfer', 'Cash', 'Check'];
const ENTITIES = ['PH Entity', 'TH Entity', 'SG Entity'];
const BUSINESS_UNITS = ['Logistics & Trucking', 'Freight Forwarding', 'Warehousing'];
const PAYMENT_ID_L2 = ['Domestic Trucking', 'International Freight', 'Last Mile'];

// ─── Types ─────────────────────────────────────────────────────────────────────

type SettlementItem = 'basic' | 'exception' | 'additional' | 'reimbursement';

interface MiscChargeRow {
  id: number;
  object: string;
  amount: string;
  proof: string;
}

interface StandaloneInvoiceRow {
  id: number;
  number: string;
  amount: string;
  date: string;
  proof: string;
}

interface StandaloneProofRow {
  id: number;
  message: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function generateTmsStatementNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `APTMS${yy}${mm}`;
  const existing = getAllApStatements().filter((s) => s.no.startsWith(prefix));
  return `${prefix}${String(existing.length + 1).padStart(3, '0')}`;
}

let _idCounter = 0;
function nextId() {
  return ++_idCounter;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ApStatementEnhancedCreate: React.FC = () => {
  // ── Basic info ──────────────────────────────────────────────────────────────
  const [statementType, setStatementType] = useState<'Standard' | 'Standalone'>('Standard');
  const [vendor, setVendor] = useState('');
  const [period, setPeriod] = useState('');
  const [taxMark, setTaxMark] = useState<'inclusive' | 'exclusive'>('inclusive');
  const [settlementItems, setSettlementItems] = useState<Set<SettlementItem>>(
    new Set(['basic', 'exception', 'additional', 'reimbursement']),
  );

  // ── Billing detail tabs ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');

  // Standalone forces claim tab & clears waybills
  useEffect(() => {
    if (statementType === 'Standalone') {
      setActiveTab('claim');
      setAddedWaybills([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statementType]);

  // ── Added rows ──────────────────────────────────────────────────────────────
  const [addedWaybills, setAddedWaybills] = useState<TmsWaybill[]>([]);
  const [addedClaims, setAddedClaims] = useState<TmsClaimTicket[]>([]);

  // ── Standalone state ────────────────────────────────────────────────────────
  const [miscCharges, setMiscCharges] = useState<MiscChargeRow[]>([
    { id: nextId(), object: '', amount: '', proof: '' },
  ]);
  const [standaloneInvoices, setStandaloneInvoices] = useState<StandaloneInvoiceRow[]>([]);
  const [standaloneProofs, setStandaloneProofs] = useState<StandaloneProofRow[]>([]);

  // ── Waybill modal ───────────────────────────────────────────────────────────
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [modalWaybillFilter, setModalWaybillFilter] = useState('');
  const [modalTruckFilter, setModalTruckFilter] = useState('');
  const [modalSelectedNos, setModalSelectedNos] = useState<Set<string>>(new Set());

  // ── Claim modal ─────────────────────────────────────────────────────────────
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [modalClaimFilter, setModalClaimFilter] = useState('');
  const [modalSelectedClaimNos, setModalSelectedClaimNos] = useState<Set<string>>(new Set());

  // ── RFP modal ───────────────────────────────────────────────────────────────
  const [showRFPDialog, setShowRFPDialog] = useState(false);
  const [rfpPaymentDef, setRfpPaymentDef] = useState('Bank Transfer');
  const [rfpEntity, setRfpEntity] = useState('');
  const [rfpBU, setRfpBU] = useState('');
  const [rfpDateNeeded, setRfpDateNeeded] = useState('');
  const [rfpIdL2, setRfpIdL2] = useState('');
  const [rfpDocs, setRfpDocs] = useState<string[]>(['invoice_draft.png']);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [validationError, setValidationError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedNo, setSubmittedNo] = useState('');

  const isStandalone = statementType === 'Standalone';

  // ─── Settlement item toggles ────────────────────────────────────────────────

  const allItemsChecked = settlementItems.size === 4;
  const someItemsChecked = settlementItems.size > 0 && settlementItems.size < 4;

  const toggleItem = (item: SettlementItem) => {
    setSettlementItems((prev) => {
      const n = new Set(prev);
      if (n.has(item)) n.delete(item);
      else n.add(item);
      return n;
    });
  };

  const toggleAllItems = (checked: boolean) => {
    if (checked)
      setSettlementItems(new Set(['basic', 'exception', 'additional', 'reimbursement']));
    else setSettlementItems(new Set());
  };

  const allCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = someItemsChecked;
    }
  }, [someItemsChecked]);

  // ─── Misc charge helpers ────────────────────────────────────────────────────

  const miscTotal = useMemo(
    () => miscCharges.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0),
    [miscCharges],
  );

  const updateMisc = (id: number, patch: Partial<MiscChargeRow>) =>
    setMiscCharges((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const addMiscRow = () =>
    setMiscCharges((prev) => [...prev, { id: nextId(), object: '', amount: '', proof: '' }]);
  const removeMiscRow = (id: number) =>
    setMiscCharges((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));

  const updateInvoice = (id: number, patch: Partial<StandaloneInvoiceRow>) =>
    setStandaloneInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addInvoiceRow = () =>
    setStandaloneInvoices((prev) => [
      ...prev,
      { id: nextId(), number: '', amount: '', date: '', proof: '' },
    ]);
  const removeInvoiceRow = (id: number) =>
    setStandaloneInvoices((prev) => prev.filter((i) => i.id !== id));

  const updateProof = (id: number, patch: Partial<StandaloneProofRow>) =>
    setStandaloneProofs((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addProofRow = () =>
    setStandaloneProofs((prev) => [...prev, { id: nextId(), message: '' }]);
  const removeProofRow = (id: number) =>
    setStandaloneProofs((prev) => prev.filter((p) => p.id !== id));

  // ─── Waybill modal helpers ──────────────────────────────────────────────────

  const addedNos = useMemo(() => new Set(addedWaybills.map((w) => w.no)), [addedWaybills]);

  const vendorWaybills = useMemo(
    () => TMS_WAYBILLS.filter((w) => !vendor || w.vendor === vendor),
    [vendor],
  );
  const availableWaybills = vendorWaybills.filter((w) => !addedNos.has(w.no));

  const filteredModalWaybills = availableWaybills.filter((w) => {
    if (
      modalWaybillFilter &&
      !w.no.toLowerCase().includes(modalWaybillFilter.toLowerCase())
    )
      return false;
    if (modalTruckFilter && w.truckType !== modalTruckFilter) return false;
    return true;
  });

  const openWaybillModal = () => {
    setModalSelectedNos(new Set());
    setModalWaybillFilter('');
    setModalTruckFilter('');
    setShowWaybillModal(true);
  };

  const confirmAddWaybills = () => {
    const toAdd = availableWaybills.filter((w) => modalSelectedNos.has(w.no));
    setAddedWaybills((prev) => [...prev, ...toAdd]);
    setShowWaybillModal(false);
  };

  const removeWaybill = (no: string) =>
    setAddedWaybills((prev) => prev.filter((w) => w.no !== no));

  const toggleModalWaybill = (no: string) => {
    setModalSelectedNos((prev) => {
      const n = new Set(prev);
      if (n.has(no)) n.delete(no);
      else n.add(no);
      return n;
    });
  };

  // ─── Claim modal helpers ────────────────────────────────────────────────────

  const addedClaimNos = useMemo(
    () => new Set(addedClaims.map((c) => c.ticketNo)),
    [addedClaims],
  );

  const vendorClaims = useMemo(
    () => TMS_CLAIM_TICKETS.filter((c) => !vendor || c.vendor === vendor),
    [vendor],
  );
  const availableClaims = vendorClaims.filter((c) => !addedClaimNos.has(c.ticketNo));

  const filteredModalClaims = availableClaims.filter(
    (c) =>
      !modalClaimFilter ||
      c.ticketNo.toLowerCase().includes(modalClaimFilter.toLowerCase()),
  );

  const openClaimModal = () => {
    setModalSelectedClaimNos(new Set());
    setModalClaimFilter('');
    setShowClaimModal(true);
  };

  const confirmAddClaims = () => {
    const toAdd = availableClaims.filter((c) => modalSelectedClaimNos.has(c.ticketNo));
    setAddedClaims((prev) => [...prev, ...toAdd]);
    setShowClaimModal(false);
  };

  const removeClaim = (no: string) =>
    setAddedClaims((prev) => prev.filter((c) => c.ticketNo !== no));

  const toggleModalClaim = (no: string) => {
    setModalSelectedClaimNos((prev) => {
      const n = new Set(prev);
      if (n.has(no)) n.delete(no);
      else n.add(no);
      return n;
    });
  };

  // ─── Amount calculations ────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const sumItem = (
      name: 'Basic Amount' | 'Additional Charge' | 'Exception Fee' | 'Reimbursement Expense',
      fld: 'basicAmount' | 'additionalCharge' | 'exceptionFee' | 'reimbursement',
    ): number =>
      addedWaybills.reduce(
        (s, w) => (w.linkedItemStatements?.[name] ? s : s + w[fld]),
        0,
      );

    const basic = settlementItems.has('basic') ? sumItem('Basic Amount', 'basicAmount') : 0;
    const prepaid = settlementItems.has('basic')
      ? addedWaybills.reduce(
          (s, w) => (w.linkedItemStatements?.['Basic Amount'] ? s : s + w.prepaid),
          0,
        )
      : 0;
    const exception = settlementItems.has('exception')
      ? sumItem('Exception Fee', 'exceptionFee')
      : 0;
    const additional = settlementItems.has('additional')
      ? sumItem('Additional Charge', 'additionalCharge')
      : 0;
    const reimbursement = settlementItems.has('reimbursement')
      ? sumItem('Reimbursement Expense', 'reimbursement')
      : 0;
    const claimTotal = addedClaims.reduce((s, c) => s + c.amount, 0);

    const waybillSubtotal = basic - prepaid + exception + additional + reimbursement;
    const taxBase = basic - prepaid + exception + additional;
    const vat = +(taxBase * 0.12).toFixed(2);
    const wht = +(taxBase * 0.02).toFixed(2);
    const taxIncluded = taxMark === 'inclusive';
    const total = waybillSubtotal - claimTotal + (taxIncluded ? vat - wht : 0);

    return {
      basic,
      prepaid,
      exception,
      additional,
      reimbursement,
      claimTotal,
      waybillSubtotal,
      taxBase,
      vat,
      wht,
      taxIncluded,
      total,
    };
  }, [addedWaybills, addedClaims, settlementItems, taxMark]);

  // ─── Build sync payload ─────────────────────────────────────────────────────

  const buildSyncPayload = (
    status: 'Under Payment Preparation' | 'Pending Payment',
  ) => {
    const stmtNo = generateTmsStatementNo();
    const settlementItemsList: string[] = isStandalone
      ? ['Miscellaneous Charge']
      : [
          ...(settlementItems.has('basic') ? ['Basic Amount'] : []),
          ...(settlementItems.has('exception') ? ['Vendor Exception Fee'] : []),
          ...(settlementItems.has('additional') ? ['Vendor Additional Charge'] : []),
          ...(settlementItems.has('reimbursement') ? ['Reimbursement Expense'] : []),
        ];
    const now = new Date().toISOString();
    return {
      stmtNo,
      now,
      payload: {
        no: stmtNo,
        vendorName: vendor,
        source: 'Internal' as const,
        status,
        statementType,
        reconciliationPeriod: period || '2026-04 (Apr 1 – Apr 30)',
        taxMark: isStandalone
          ? ('Tax-exclusive' as const)
          : taxMark === 'inclusive'
          ? ('Tax-inclusive' as const)
          : ('Tax-exclusive' as const),
        vatRate: isStandalone ? 0 : 12,
        whtRate: isStandalone ? 0 : 2,
        vatAmount: isStandalone ? 0 : summary.vat,
        whtAmount: isStandalone ? 0 : summary.wht,
        settlementItems: settlementItemsList,
        totalVpAmount: isStandalone ? miscTotal : summary.total,
        waybillCount: isStandalone ? 0 : addedWaybills.length,
        waybills: isStandalone
          ? []
          : addedWaybills.map((w) => ({
              no: w.no,
              positionTime: w.positionTime,
              unloadingTime: w.unloadingTime,
              truckType: w.truckType,
              origin: w.origin,
              destination: w.destination,
              basicAmount: settlementItems.has('basic') ? w.basicAmount : 0,
              additionalCharge: settlementItems.has('additional') ? w.additionalCharge : 0,
              exceptionFee: settlementItems.has('exception') ? w.exceptionFee : 0,
              reimbursement: settlementItems.has('reimbursement') ? w.reimbursement : 0,
            })),
        claims: isStandalone
          ? []
          : addedClaims.map((c) => ({
              no: c.ticketNo,
              type: c.claimType,
              amount: c.amount,
              waybillNo: c.relatedWaybill ?? '—',
            })),
        miscCharges: isStandalone
          ? miscCharges
              .filter((m) => m.object || parseFloat(m.amount) > 0)
              .map((m) => ({
                object: m.object,
                amount: parseFloat(m.amount) || 0,
                proof: m.proof,
              }))
          : undefined,
        standaloneInvoices: isStandalone
          ? standaloneInvoices.map((i) => ({
              number: i.number,
              amount: parseFloat(i.amount) || 0,
              date: i.date,
              proof: i.proof,
            }))
          : undefined,
        standaloneProofs: isStandalone
          ? standaloneProofs.map((p) => ({ message: p.message }))
          : undefined,
        createdAt: now,
      },
    };
  };

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!vendor) {
      setValidationError('Please select a vendor.');
      return;
    }
    if (isStandalone && miscTotal <= 0) {
      setValidationError('Please enter at least one Miscellaneous Charge.');
      return;
    }
    setValidationError('');
    const { payload, now } = buildSyncPayload('Under Payment Preparation');
    upsertApStatement({
      ...payload,
      operationLogs: [{ time: now, actor: 'TMS User', action: 'Created AP Statement' }],
    });
    history.push(PATHS.BILLING_AP_STATEMENT_ENHANCED);
  };

  const handleConfirmRFP = () => {
    if (!vendor) {
      setValidationError('Please select a vendor.');
      return;
    }
    if (isStandalone) {
      if (miscTotal <= 0) {
        setValidationError('Please enter at least one Miscellaneous Charge.');
        return;
      }
    } else if (addedWaybills.length === 0) {
      setValidationError('Please add at least one waybill.');
      return;
    }
    setValidationError('');
    setShowRFPDialog(true);
  };

  const handleSyncRFP = () => {
    if (!rfpEntity || !rfpBU || !rfpDateNeeded || !rfpIdL2) return;
    const { stmtNo, payload, now } = buildSyncPayload('Pending Payment');
    upsertApStatement({
      ...payload,
      submittedAt: now,
      operationLogs: [
        { time: now, actor: 'TMS User', action: 'Created AP Statement' },
        { time: now, actor: 'TMS User', action: 'Confirmed & Created RFP' },
      ],
    });
    setShowRFPDialog(false);
    setSubmittedNo(stmtNo);
    setSubmitted(true);
  };

  // ─── Success screen ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>✓</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>
            RFP Created Successfully
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>
            AP Statement <strong>{submittedNo}</strong> created for <strong>{vendor}</strong>.<br />
            Total Amount Payable:{' '}
            <strong>PHP {fmt(isStandalone ? miscTotal : summary.total)}</strong>
          </div>
          <Button type="primary" onClick={() => history.push(PATHS.BILLING_AP_STATEMENT_ENHANCED)}>
            Back to AP Statement
          </Button>
        </div>
      </div>
    );
  }

  // ─── Waybill table cell helper ──────────────────────────────────────────────

  const waybillCellStyle = (
    checked: boolean,
    linkedTo: string | undefined,
  ): React.CSSProperties => {
    if (!checked)
      return { color: '#cfcfcf', background: '#fafafa', textDecoration: 'line-through' };
    if (linkedTo) return { color: '#bbb', background: '#fafafa', cursor: 'help' };
    return { color: '#333' };
  };

  const waybillCellContent = (amt: number, linkedTo: string | undefined) => {
    if (linkedTo) return '—';
    return amt > 0 ? fmt(amt) : '—';
  };

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbCase
        items={[
          { name: 'AP Statement', path: PATHS.BILLING_AP_STATEMENT_ENHANCED },
          { name: 'Create Statement', path: PATHS.BILLING_AP_STATEMENT_ENHANCED_CREATE },
        ]}
      />
      {/* Top actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 16,
          gap: 10,
        }}
      >
        <Button onClick={handleSave}>Save</Button>
        <Button
          type="primary"
          disabled={!isStandalone && addedWaybills.length === 0}
          onClick={handleConfirmRFP}
        >
          Confirm &amp; Create RFP
        </Button>
      </div>

      {validationError && (
        <div className={styles.blockAlert} style={{ marginBottom: 12 }}>
          ⚠ {validationError}
        </div>
      )}

      {/* ── Basic Information ── */}
      <div className={styles.card} style={{ marginBottom: 16 }}>
        <div className={styles.cardHeader}>
          <div className={styles.sectionTitle}>
            <span>Basic Information</span>
          </div>
        </div>

        {/* Statement Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: '#555', minWidth: 130, flexShrink: 0 }}>
            <span style={{ color: '#ff4d4f' }}>* </span>Statement Type
          </label>
          <div style={{ display: 'flex', gap: 24 }}>
            {(['Standard', 'Standalone'] as const).map((t) => (
              <label
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="stmtType"
                  checked={statementType === t}
                  onChange={() => setStatementType(t)}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* Vendor + Period */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 32px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 110, flexShrink: 0 }}>
              <span style={{ color: '#ff4d4f' }}>* </span>Vendor Name
            </label>
            <select
              style={{
                flex: 1,
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                fontSize: 13,
              }}
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            >
              <option value=""></option>
              {VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 140, flexShrink: 0 }}>
              Reconciliation Period
            </label>
            <select
              style={{
                flex: 1,
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                fontSize: 13,
              }}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value=""></option>
              {RECONCILIATION_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tax Mark — Standard only */}
        {!isStandalone && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px 32px',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#555', minWidth: 110, flexShrink: 0 }}>
                Vendor Tax Mark
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: '#666',
                  background: '#f5f5f5',
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: '1px solid #e8e8e8',
                }}
              >
                VAT-in
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 13, color: '#555', minWidth: 140, flexShrink: 0 }}>
                <span style={{ color: '#ff4d4f' }}>* </span>Statement Tax Mark
              </label>
              <div style={{ display: 'flex', gap: 18 }}>
                {(['inclusive', 'exclusive'] as const).map((v) => (
                  <label
                    key={v}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="taxMark"
                      checked={taxMark === v}
                      onChange={() => setTaxMark(v)}
                    />
                    Tax-{v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settlement Items — Standard only */}
        {!isStandalone && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <span style={{ fontSize: 13, color: '#555', flexShrink: 0 }}>Settled Items</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                cursor: 'pointer',
                color: '#333',
              }}
            >
              <input
                type="checkbox"
                ref={allCheckboxRef}
                checked={allItemsChecked}
                onChange={(e) => toggleAllItems(e.target.checked)}
              />
              All
            </label>
            {(
              [
                { key: 'basic', label: 'Vendor Basic Amount' },
                { key: 'additional', label: 'Vendor Additional Charge' },
                { key: 'exception', label: 'Vendor Exception Fee' },
                { key: 'reimbursement', label: 'Reimbursement Expense' },
              ] as { key: SettlementItem; label: string }[]
            ).map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#333',
                }}
              >
                <input
                  type="checkbox"
                  checked={settlementItems.has(item.key)}
                  onChange={() => toggleItem(item.key)}
                />
                {item.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Billing Details (Standard only) ── */}
      {!isStandalone && (
        <div className={styles.card} style={{ marginBottom: 16, padding: 0 }}>
          {/* Tab headers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0',
              padding: '0 18px',
            }}
          >
            {(['waybill', 'claim'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 18px',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#1677ff' : '#555',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    activeTab === tab ? '2px solid #1677ff' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {tab === 'waybill'
                  ? `Waybill${addedWaybills.length > 0 ? ` (${addedWaybills.length})` : ''}`
                  : `Claim Tickets${addedClaims.length > 0 ? ` (${addedClaims.length})` : ''}`}
              </button>
            ))}
          </div>

          <div style={{ padding: '14px 18px' }}>
            {/* ── Waybill Tab ── */}
            {activeTab === 'waybill' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#666' }}>
                    {addedWaybills.length === 0 ? (
                      'No waybills added.'
                    ) : (
                      <>
                        <strong style={{ color: '#333' }}>{addedWaybills.length}</strong>{' '}
                        waybill{addedWaybills.length > 1 ? 's' : ''} added.
                      </>
                    )}
                  </span>
                  <Button
                    size="small"
                    onClick={openWaybillModal}
                    disabled={!vendor}
                    title={!vendor ? 'Please select a vendor first' : undefined}
                  >
                    + Add Waybill
                  </Button>
                </div>

                {addedWaybills.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr style={{ background: '#fafafa' }}>
                          {[
                            'Waybill No.',
                            'Position Time',
                            'Unloading Time',
                            'Truck Type',
                            'Origin',
                            'Destination',
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: '8px 10px',
                                textAlign: 'left',
                                borderBottom: '1px solid #f0f0f0',
                                fontWeight: 600,
                                color: '#555',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                          <th
                            style={{
                              padding: '8px 10px',
                              textAlign: 'right',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: 600,
                              color: settlementItems.has('basic') ? '#555' : '#bbb',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Basic Amount
                          </th>
                          <th
                            style={{
                              padding: '8px 10px',
                              textAlign: 'right',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: 600,
                              color: settlementItems.has('additional') ? '#555' : '#bbb',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Add. Charge
                          </th>
                          <th
                            style={{
                              padding: '8px 10px',
                              textAlign: 'right',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: 600,
                              color: settlementItems.has('exception') ? '#555' : '#bbb',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Exception Fee
                          </th>
                          <th
                            style={{
                              padding: '8px 10px',
                              textAlign: 'right',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: 600,
                              color: settlementItems.has('reimbursement') ? '#555' : '#bbb',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Reimbursement
                          </th>
                          <th
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f0f0f0',
                              width: 72,
                            }}
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {addedWaybills.map((w) => {
                          const linkBasic = w.linkedItemStatements?.['Basic Amount'];
                          const linkAdd = w.linkedItemStatements?.['Additional Charge'];
                          const linkExc = w.linkedItemStatements?.['Exception Fee'];
                          const linkReim = w.linkedItemStatements?.['Reimbursement Expense'];
                          const td = (
                            style: React.CSSProperties,
                          ): React.CSSProperties => ({
                            padding: '8px 10px',
                            borderBottom: '1px solid #f8f8f8',
                            ...style,
                          });
                          return (
                            <tr key={w.no}>
                              <td
                                style={td({
                                  fontWeight: 600,
                                  color: '#1677ff',
                                  whiteSpace: 'nowrap',
                                })}
                              >
                                {w.no}
                              </td>
                              <td
                                style={td({ fontSize: 12, color: '#555', whiteSpace: 'nowrap' })}
                              >
                                {w.positionTime}
                              </td>
                              <td
                                style={td({ fontSize: 12, color: '#555', whiteSpace: 'nowrap' })}
                              >
                                {w.unloadingTime}
                              </td>
                              <td style={td({ fontSize: 12 })}>{w.truckType}</td>
                              <td style={td({ fontSize: 12, color: '#555', maxWidth: 120 })}>
                                {w.origin}
                              </td>
                              <td style={td({ fontSize: 12, color: '#555', maxWidth: 120 })}>
                                {w.destination}
                              </td>
                              <td
                                style={td({
                                  textAlign: 'right',
                                  ...waybillCellStyle(settlementItems.has('basic'), linkBasic),
                                })}
                                title={
                                  linkBasic
                                    ? `Already linked to Statement ${linkBasic}`
                                    : undefined
                                }
                              >
                                {waybillCellContent(w.basicAmount, linkBasic)}
                              </td>
                              <td
                                style={td({
                                  textAlign: 'right',
                                  ...waybillCellStyle(
                                    settlementItems.has('additional'),
                                    linkAdd,
                                  ),
                                })}
                                title={
                                  linkAdd
                                    ? `Already linked to Statement ${linkAdd}`
                                    : undefined
                                }
                              >
                                {waybillCellContent(w.additionalCharge, linkAdd)}
                              </td>
                              <td
                                style={td({
                                  textAlign: 'right',
                                  ...waybillCellStyle(settlementItems.has('exception'), linkExc),
                                })}
                                title={
                                  linkExc
                                    ? `Already linked to Statement ${linkExc}`
                                    : undefined
                                }
                              >
                                {waybillCellContent(w.exceptionFee, linkExc)}
                              </td>
                              <td
                                style={td({
                                  textAlign: 'right',
                                  ...waybillCellStyle(
                                    settlementItems.has('reimbursement'),
                                    linkReim,
                                  ),
                                })}
                                title={
                                  linkReim
                                    ? `Already linked to Statement ${linkReim}`
                                    : undefined
                                }
                              >
                                {waybillCellContent(w.reimbursement, linkReim)}
                              </td>
                              <td style={td({ textAlign: 'center' })}>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#cf1322',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                  onClick={() => removeWaybill(w.no)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.emptyPlaceholder}>
                    No waybills added. Click "+ Add Waybill" to select.
                  </div>
                )}
              </>
            )}

            {/* ── Claim Ticket Tab ── */}
            {activeTab === 'claim' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#666' }}>
                    {addedClaims.length === 0 ? (
                      'No claim tickets added.'
                    ) : (
                      <>
                        <strong style={{ color: '#333' }}>{addedClaims.length}</strong> claim
                        ticket{addedClaims.length > 1 ? 's' : ''} added.
                      </>
                    )}
                  </span>
                  <Button
                    size="small"
                    onClick={openClaimModal}
                    disabled={!vendor}
                    title={!vendor ? 'Please select a vendor first' : undefined}
                  >
                    + Add Claim Ticket
                  </Button>
                </div>

                {addedClaims.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#fafafa' }}>
                        {[
                          'Claim Ticket No.',
                          'Type',
                          'Waybill No.',
                          'Amount',
                          'Currency',
                          'Created At',
                          '',
                        ].map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: '8px 10px',
                              textAlign: i === 3 ? 'right' : 'left',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: 600,
                              color: '#555',
                              width: i === 6 ? 72 : undefined,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {addedClaims.map((c) => (
                        <tr key={c.ticketNo}>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontWeight: 600,
                              color: '#1677ff',
                            }}
                          >
                            {c.ticketNo}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                            }}
                          >
                            {c.claimType}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: c.relatedWaybill ? '#333' : '#bbb',
                            }}
                          >
                            {c.relatedWaybill ?? '—'}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              textAlign: 'right',
                              fontWeight: 500,
                            }}
                          >
                            {fmt(c.amount)}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                            }}
                          >
                            {c.currency}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: '#555',
                            }}
                          >
                            {c.createdAt}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              textAlign: 'center',
                            }}
                          >
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#cf1322',
                                fontSize: 12,
                                cursor: 'pointer',
                                padding: 0,
                              }}
                              onClick={() => removeClaim(c.ticketNo)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.emptyPlaceholder}>
                    No claim tickets added. Click "+ Add Claim Ticket" to select.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Amount Summary (Standard only) ── */}
      {!isStandalone && (
        <div className={styles.card} style={{ marginBottom: 16 }}>
          <div className={styles.cardHeader}>
            <div className={styles.sectionTitle}>
              <span>Amount Summary</span>
            </div>
          </div>

          {/* Total payable + tax mark toggle */}
          <div className={styles.totalPayableBox}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Total Amount Payable</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>
                PHP {fmt(summary.total)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Statement Tax Mark</span>
              {(['inclusive', 'exclusive'] as const).map((v) => (
                <label
                  key={v}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="taxMarkSummary"
                    checked={taxMark === v}
                    onChange={() => setTaxMark(v)}
                  />
                  Tax-{v}
                </label>
              ))}
            </div>
          </div>

          {/* 3-column breakdown */}
          {(() => {
            const strikeStyle: React.CSSProperties = {
              textDecoration: 'line-through',
              color: '#bbb',
            };
            const taxStrike: React.CSSProperties = summary.taxIncluded ? {} : strikeStyle;

            const rawBasic = addedWaybills.reduce(
              (s, w) =>
                w.linkedItemStatements?.['Basic Amount'] ? s : s + w.basicAmount,
              0,
            );
            const rawExc = addedWaybills.reduce(
              (s, w) =>
                w.linkedItemStatements?.['Exception Fee'] ? s : s + w.exceptionFee,
              0,
            );
            const rawAdd = addedWaybills.reduce(
              (s, w) =>
                w.linkedItemStatements?.['Additional Charge'] ? s : s + w.additionalCharge,
              0,
            );
            const rawReim = addedWaybills.reduce(
              (s, w) =>
                w.linkedItemStatements?.['Reimbursement Expense'] ? s : s + w.reimbursement,
              0,
            );
            const rawPrePaid = addedWaybills.reduce(
              (s, w) =>
                w.linkedItemStatements?.['Basic Amount'] ? s : s + w.prepaid,
              0,
            );
            const othersSubtotal =
              (summary.taxIncluded ? summary.vat - summary.wht : 0) +
              summary.reimbursement;

            const thStyle: React.CSSProperties = {
              padding: '8px 14px',
              textAlign: 'left',
              borderBottom: '1px solid #f0f0f0',
              fontWeight: 600,
              color: '#555',
              background: '#fafafa',
            };
            const tdStyle: React.CSSProperties = {
              padding: '6px 14px',
              borderBottom: '1px solid #f8f8f8',
            };

            return (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '33%' }}>Waybill Contract Cost</th>
                    <th style={{ ...thStyle, width: '33%' }}>Claim</th>
                    <th style={{ ...thStyle, width: '34%' }}>Others</th>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, fontWeight: 600, background: '#fafafa' }}>
                      {fmt(
                        summary.basic -
                          summary.prepaid +
                          summary.exception +
                          summary.additional,
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, background: '#fafafa' }}>
                      −{fmt(summary.claimTotal)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: '#888',
                        background: '#fafafa',
                      }}
                    >
                      {fmt(othersSubtotal)}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        ...(settlementItems.has('basic') ? {} : strikeStyle),
                      }}
                    >
                      Vendor Basic Amount{' '}
                      <span style={{ float: 'right' }}>{fmt(rawBasic)}</span>
                    </td>
                    <td style={tdStyle}>
                      KPI Claim{' '}
                      <span style={{ float: 'right' }}>
                        −
                        {fmt(
                          addedClaims
                            .filter((c) => c.claimType === 'KPI Claim')
                            .reduce((s, c) => s + c.amount, 0),
                        )}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, ...taxStrike }}>
                      VAT (12%){' '}
                      <span style={{ float: 'right' }}>+{fmt(summary.vat)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '4px 14px 4px 28px',
                        borderBottom: '1px solid #f8f8f8',
                        color: '#0958d9',
                        fontSize: 12,
                        ...(settlementItems.has('basic') ? {} : strikeStyle),
                      }}
                    >
                      ↳ PrePaid{' '}
                      <span style={{ float: 'right' }}>−{fmt(rawPrePaid)}</span>
                    </td>
                    <td style={tdStyle} />
                    <td
                      style={{
                        ...tdStyle,
                        color: '#cf1322',
                        ...taxStrike,
                      }}
                    >
                      WHT (2%){' '}
                      <span style={{ float: 'right' }}>−{fmt(summary.wht)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        ...(settlementItems.has('additional') ? {} : strikeStyle),
                      }}
                    >
                      Vendor Additional Charge{' '}
                      <span style={{ float: 'right' }}>{fmt(rawAdd)}</span>
                    </td>
                    <td style={tdStyle} />
                    <td
                      style={{
                        ...tdStyle,
                        ...(settlementItems.has('reimbursement') ? {} : strikeStyle),
                      }}
                    >
                      Reimbursement Expense{' '}
                      <span style={{ float: 'right' }}>+{fmt(rawReim)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        borderBottom: 'none',
                        ...(settlementItems.has('exception') ? {} : strikeStyle),
                      }}
                    >
                      Vendor Exception Fee{' '}
                      <span style={{ float: 'right' }}>{fmt(rawExc)}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: 'none' }} />
                    <td style={{ ...tdStyle, borderBottom: 'none' }} />
                  </tr>
                </tbody>
              </table>
            );
          })()}
        </div>
      )}

      {/* ── Standalone sections ── */}
      {isStandalone && (
        <>
          {/* Miscellaneous Charge / Amount Summary */}
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardHeader}>
              <div className={styles.sectionTitle}>
                <span>Amount Summary</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1677ff',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Miscellaneous Charge Edit History
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['Miscellaneous Charge Object', 'Amount', 'Proof', ''].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '8px 10px',
                        textAlign: i === 1 ? 'right' : 'left',
                        borderBottom: '1px solid #f0f0f0',
                        fontWeight: 600,
                        color: '#555',
                        width: i === 3 ? 100 : undefined,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {miscCharges.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid #f8f8f8' }}>
                      <input
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          fontSize: 13,
                        }}
                        placeholder="e.g. Miscellaneous Charge"
                        value={row.object}
                        onChange={(e) => updateMisc(row.id, { object: e.target.value })}
                      />
                    </td>
                    <td
                      style={{
                        padding: '6px 10px',
                        borderBottom: '1px solid #f8f8f8',
                        textAlign: 'right',
                      }}
                    >
                      <input
                        type="number"
                        style={{
                          width: 140,
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          fontSize: 13,
                          textAlign: 'right',
                        }}
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) => updateMisc(row.id, { amount: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid #f8f8f8' }}>
                      <input
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          fontSize: 13,
                        }}
                        placeholder="proof file name"
                        value={row.proof}
                        onChange={(e) => updateMisc(row.id, { proof: e.target.value })}
                      />
                    </td>
                    <td
                      style={{
                        padding: '6px 10px',
                        borderBottom: '1px solid #f8f8f8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cf1322',
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: 0,
                          marginRight: 8,
                          opacity: miscCharges.length <= 1 ? 0.4 : 1,
                        }}
                        disabled={miscCharges.length <= 1}
                        onClick={() => removeMiscRow(row.id)}
                      >
                        Remove
                      </button>
                      {idx === miscCharges.length - 1 && (
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#52c41a',
                            fontSize: 12,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          onClick={addMiscRow}
                        >
                          + Add
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#fafafa' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>Total Amount</td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#1677ff',
                    }}
                  >
                    {fmt(miscTotal)}
                  </td>
                  <td colSpan={2} style={{ padding: '8px 10px' }} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Invoice Management */}
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardHeader}>
              <div className={styles.sectionTitle}>
                <span>Invoice Management</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1677ff',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={addInvoiceRow}
              >
                + Add Invoice
              </button>
            </div>
            {standaloneInvoices.length === 0 ? (
              <div className={styles.emptyPlaceholder}>
                No invoices added. Click "+ Add Invoice" to add one.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['Invoice Number', 'Invoice Amount', 'Invoice Date', 'Invoice Proof', ''].map(
                      (h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '8px 10px',
                            textAlign: i === 1 ? 'right' : 'left',
                            borderBottom: '1px solid #f0f0f0',
                            fontWeight: 600,
                            color: '#555',
                            width: i === 4 ? 80 : undefined,
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {standaloneInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f8f8f8' }}>
                        <input
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                          placeholder="Invoice No."
                          value={inv.number}
                          onChange={(e) => updateInvoice(inv.id, { number: e.target.value })}
                        />
                      </td>
                      <td
                        style={{
                          padding: '6px 10px',
                          borderBottom: '1px solid #f8f8f8',
                          textAlign: 'right',
                        }}
                      >
                        <input
                          type="number"
                          style={{
                            width: 140,
                            padding: '4px 8px',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            fontSize: 13,
                            textAlign: 'right',
                          }}
                          placeholder="0.00"
                          value={inv.amount}
                          onChange={(e) => updateInvoice(inv.id, { amount: e.target.value })}
                        />
                      </td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f8f8f8' }}>
                        <input
                          type="date"
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                          value={inv.date}
                          onChange={(e) => updateInvoice(inv.id, { date: e.target.value })}
                        />
                      </td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f8f8f8' }}>
                        <input
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                          placeholder="file name"
                          value={inv.proof}
                          onChange={(e) => updateInvoice(inv.id, { proof: e.target.value })}
                        />
                      </td>
                      <td
                        style={{
                          padding: '6px 10px',
                          borderBottom: '1px solid #f8f8f8',
                          textAlign: 'center',
                        }}
                      >
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#cf1322',
                            fontSize: 12,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          onClick={() => removeInvoiceRow(inv.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Proof */}
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardHeader}>
              <div className={styles.sectionTitle}>
                <span>Proof</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1677ff',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={addProofRow}
              >
                + Add Proof
              </button>
            </div>
            {standaloneProofs.length === 0 ? (
              <div className={styles.emptyPlaceholder}>No proof message records yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {standaloneProofs.map((p) => (
                  <div
                    key={p.id}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        minWidth: 130,
                        paddingTop: 6,
                        color: '#555',
                      }}
                    >
                      Message Records
                    </div>
                    <textarea
                      style={{
                        flex: 1,
                        minHeight: 56,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 13,
                        resize: 'vertical',
                      }}
                      placeholder="…"
                      value={p.message}
                      onChange={(e) => updateProof(p.id, { message: e.target.value })}
                    />
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#cf1322',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        paddingTop: 6,
                      }}
                      onClick={() => removeProofRow(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Add Waybill Modal ── */}
      {showWaybillModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: '90vw', maxWidth: 960 }}>
            <div className={styles.modalHeader}>
              Add Waybill
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#999',
                  padding: 0,
                }}
                onClick={() => setShowWaybillModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 12,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <input
                  style={{
                    width: 160,
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                  placeholder="Waybill Number"
                  value={modalWaybillFilter}
                  onChange={(e) => setModalWaybillFilter(e.target.value)}
                />
                <select
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                  value={modalTruckFilter}
                  onChange={(e) => setModalTruckFilter(e.target.value)}
                >
                  <option value="">Truck Type: All</option>
                  {TRUCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>
                  {modalSelectedNos.size} selected
                </span>
              </div>
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', width: 36 }}>
                        <input
                          type="checkbox"
                          checked={
                            filteredModalWaybills.filter((w) => !w.alreadyInStatement).length >
                              0 &&
                            filteredModalWaybills
                              .filter((w) => !w.alreadyInStatement)
                              .every((w) => modalSelectedNos.has(w.no))
                          }
                          onChange={(e) => {
                            const n = new Set(modalSelectedNos);
                            filteredModalWaybills
                              .filter((w) => !w.alreadyInStatement)
                              .forEach((w) => {
                                if (e.target.checked) n.add(w.no);
                                else n.delete(w.no);
                              });
                            setModalSelectedNos(n);
                          }}
                        />
                      </th>
                      {[
                        'Waybill No.',
                        'Position Time',
                        'Truck Type',
                        'Origin',
                        'Destination',
                        'Basic Amount',
                        'Exception Fee',
                        'Add. Charge',
                        'Reimbursement',
                      ].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 10px',
                            textAlign: i >= 5 ? 'right' : 'left',
                            borderBottom: '1px solid #f0f0f0',
                            fontWeight: 600,
                            color: '#555',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalWaybills.map((w) => {
                      const associated = !!w.alreadyInStatement;
                      const checked = modalSelectedNos.has(w.no);
                      const linkBasic = w.linkedItemStatements?.['Basic Amount'];
                      const linkExc = w.linkedItemStatements?.['Exception Fee'];
                      const linkAdd = w.linkedItemStatements?.['Additional Charge'];
                      const linkReim = w.linkedItemStatements?.['Reimbursement Expense'];

                      const itemCell = (amt: number, linkedTo: string | undefined) => (
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: '1px solid #f8f8f8',
                            textAlign: 'right',
                            fontSize: 12,
                            color: associated ? '#bbb' : linkedTo ? '#bbb' : undefined,
                            background: linkedTo ? '#fafafa' : undefined,
                            cursor: linkedTo ? 'help' : undefined,
                          }}
                          title={linkedTo ? `Already linked to Statement ${linkedTo}` : undefined}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {linkedTo ? '—' : amt > 0 ? fmt(amt) : '—'}
                        </td>
                      );

                      return (
                        <tr
                          key={w.no}
                          style={{
                            background: associated ? '#fafafa' : checked ? '#f0f7ff' : undefined,
                            cursor: associated ? 'default' : 'pointer',
                          }}
                          onClick={() => !associated && toggleModalWaybill(w.no)}
                        >
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={associated}
                              onChange={() => !associated && toggleModalWaybill(w.no)}
                            />
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <strong style={{ color: associated ? '#999' : '#333' }}>
                              {w.no}
                            </strong>
                            {associated && (
                              <span className={styles.itemStatusUnderPrep} style={{ marginLeft: 5 }}>
                                In {w.alreadyInStatement}
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: associated ? '#bbb' : '#555',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {w.positionTime}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: associated ? '#bbb' : undefined,
                            }}
                          >
                            {w.truckType}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: associated ? '#bbb' : '#555',
                              maxWidth: 130,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {w.origin}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: associated ? '#bbb' : '#555',
                              maxWidth: 130,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {w.destination}
                          </td>
                          {itemCell(w.basicAmount, linkBasic)}
                          {itemCell(w.exceptionFee, linkExc)}
                          {itemCell(w.additionalCharge, linkAdd)}
                          {itemCell(w.reimbursement, linkReim)}
                        </tr>
                      );
                    })}
                    {filteredModalWaybills.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#bbb',
                            fontSize: 13,
                          }}
                        >
                          No available waybills.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setShowWaybillModal(false)}>Cancel</Button>
              <Button
                type="primary"
                disabled={modalSelectedNos.size === 0}
                onClick={confirmAddWaybills}
              >
                Add ({modalSelectedNos.size})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Claim Ticket Modal ── */}
      {showClaimModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: '80vw', maxWidth: 680 }}>
            <div className={styles.modalHeader}>
              Add Claim Ticket
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#999',
                  padding: 0,
                }}
                onClick={() => setShowClaimModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 12,
                  alignItems: 'center',
                }}
              >
                <input
                  style={{
                    width: 200,
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                  placeholder="Claim Ticket No."
                  value={modalClaimFilter}
                  onChange={(e) => setModalClaimFilter(e.target.value)}
                />
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>
                  {modalSelectedClaimNos.size} selected
                </span>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', position: 'sticky', top: 0 }}>
                      <th
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #f0f0f0',
                          width: 36,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            filteredModalClaims.length > 0 &&
                            filteredModalClaims.every((c) =>
                              modalSelectedClaimNos.has(c.ticketNo),
                            )
                          }
                          onChange={(e) => {
                            const n = new Set(modalSelectedClaimNos);
                            if (e.target.checked)
                              filteredModalClaims.forEach((c) => n.add(c.ticketNo));
                            else filteredModalClaims.forEach((c) => n.delete(c.ticketNo));
                            setModalSelectedClaimNos(n);
                          }}
                        />
                      </th>
                      {['Ticket No.', 'Related Waybill', 'Claim Type', 'Amount', 'Status'].map(
                        (h, i) => (
                          <th
                            key={h}
                            style={{
                              padding: '8px 10px',
                              textAlign: i === 3 ? 'right' : 'left',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: 600,
                              color: '#555',
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalClaims.map((c) => {
                      const checked = modalSelectedClaimNos.has(c.ticketNo);
                      const associated = !!c.alreadyInStatement;
                      const statusColors: Record<
                        string,
                        { bg: string; color: string; border: string }
                      > = {
                        'For Deduction': {
                          bg: '#f6ffed',
                          color: '#389e0d',
                          border: '#b7eb8f',
                        },
                        Disputed: { bg: '#fff1f0', color: '#cf1322', border: '#ffa39e' },
                        Pending: { bg: '#fffbe6', color: '#d48806', border: '#ffe58f' },
                      };
                      const sc = statusColors[c.status] ?? statusColors['Pending'];
                      return (
                        <tr
                          key={c.ticketNo}
                          style={{
                            background: associated
                              ? '#fafafa'
                              : checked
                              ? '#f0f7ff'
                              : undefined,
                            cursor: associated ? 'default' : 'pointer',
                          }}
                          onClick={() => !associated && toggleModalClaim(c.ticketNo)}
                        >
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={associated}
                              onChange={() => !associated && toggleModalClaim(c.ticketNo)}
                            />
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <strong style={{ color: associated ? '#999' : '#333' }}>
                              {c.ticketNo}
                            </strong>
                            {associated && (
                              <span className={styles.itemStatusUnderPrep} style={{ marginLeft: 5 }}>
                                In {c.alreadyInStatement}
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: associated ? '#bbb' : c.relatedWaybill ? '#333' : '#bbb',
                            }}
                          >
                            {c.relatedWaybill ?? '—'}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              fontSize: 12,
                              color: associated ? '#bbb' : undefined,
                            }}
                          >
                            {c.claimType}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                              textAlign: 'right',
                              fontWeight: 500,
                              color: associated ? '#bbb' : undefined,
                            }}
                          >
                            {fmt(c.amount)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              borderBottom: '1px solid #f8f8f8',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                padding: '2px 6px',
                                borderRadius: 3,
                                background: associated ? '#f5f5f5' : sc.bg,
                                color: associated ? '#bbb' : sc.color,
                                border: `1px solid ${associated ? '#e8e8e8' : sc.border}`,
                              }}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredModalClaims.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#bbb',
                            fontSize: 13,
                          }}
                        >
                          No available claim tickets.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setShowClaimModal(false)}>Cancel</Button>
              <Button
                type="primary"
                disabled={modalSelectedClaimNos.size === 0}
                onClick={confirmAddClaims}
              >
                Add ({modalSelectedClaimNos.size})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create RFP Modal ── */}
      {showRFPDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ width: 700 }}>
            <div className={styles.modalHeader}>
              Create RFP
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#999',
                  padding: 0,
                }}
                onClick={() => setShowRFPDialog(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Row 1 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> Responsible Department
                  </div>
                  <select
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    defaultValue="Account Payable Department"
                  >
                    <option>Account Payable Department</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> Payment Definition
                  </div>
                  <select
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    value={rfpPaymentDef}
                    onChange={(e) => setRfpPaymentDef(e.target.value)}
                  >
                    {PAYMENT_DEFINITIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> Entity
                  </div>
                  <select
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    value={rfpEntity}
                    onChange={(e) => setRfpEntity(e.target.value)}
                  >
                    <option value=""></option>
                    {ENTITIES.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> Business Unit
                  </div>
                  <select
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    value={rfpBU}
                    onChange={(e) => setRfpBU(e.target.value)}
                  >
                    <option value=""></option>
                    {BUSINESS_UNITS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Row 2 */}
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
                    <span style={{ color: '#ff4d4f' }}>*</span> Date of Needed
                  </div>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
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
                    <span style={{ color: '#ff4d4f' }}>*</span> Payment Identification L1
                  </div>
                  <select
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    defaultValue="Logistics & Trucking"
                  >
                    <option>Logistics &amp; Trucking</option>
                    <option>Global Forwarding</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> Payment Identification L2
                  </div>
                  <select
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                    value={rfpIdL2}
                    onChange={(e) => setRfpIdL2(e.target.value)}
                  >
                    <option value=""></option>
                    {PAYMENT_ID_L2.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Supporting Documents */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}
                >
                  Supporting Documents
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
                    onClick={() =>
                      setRfpDocs((p) => [...p, `doc_${p.length + 1}.pdf`])
                    }
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
                onClick={handleSyncRFP}
              >
                Sync
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApStatementEnhancedCreate;
