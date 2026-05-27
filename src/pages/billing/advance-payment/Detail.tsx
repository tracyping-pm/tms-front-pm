import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import {
  getApplication,
  nowIso,
  formatDateTime,
  updateApplicationStatus,
  appendLog,
  type SyncedApplication,
  type OperationLogEntry,
} from '@/pages/vendor/common/prepaidApplicationSync';
import { history, useParams } from '@umijs/max';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import { TMS_WAYBILLS } from './mock/waybills';
import { TMS_CLAIM_TICKETS } from './mock/claimTickets';
import type {
  AppStatus,
  ApplicationData,
  ClaimTicket,
  InvoiceRecord,
  WaybillRow,
} from './mock/applicationData';
import {
  APP_DATA,
  FALLBACK,
  STATEMENT_PAYMENT_DATA,
  RESPONSIBLE_DEPARTMENTS,
  PAYMENT_DEFINITIONS,
  ENTITIES,
  BUSINESS_UNITS,
  PAYMENT_ID_L1,
  PAYMENT_ID_L2,
} from './mock/applicationData';

// --- Modification review mock data ---
interface ModLine {
  id: string;
  waybill: string;
  item: string;
  tmsAmount: number;
  vendorAmount: number;
  delta: number;
}

const MOD_LINES: ModLine[] = [
  { id: 'L1', waybill: 'WB2604002', item: 'Basic (Remaining)', tmsAmount: 9500, vendorAmount: 10000, delta: 500 },
  { id: 'L2', waybill: 'WB2604002', item: 'Vendor Exception Fee', tmsAmount: 800, vendorAmount: 1200, delta: 400 },
  { id: 'L3', waybill: 'WB2604003', item: 'Basic (Remaining)', tmsAmount: 16800, vendorAmount: 17500, delta: 700 },
];

// --- Settlement review mock data ---
interface SettlementWaybillRow {
  no: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  additionalChargeItems: Array<{ id: string; type: string; amount: number }>;
  exceptionFee: number;
  reimbursement: number;
  hasDiscrepancy: boolean;
}

interface SettlementClaimTicketRow {
  ticketNo: string;
  claimTypeL1: string;
  claimTypeL2: string;
  relatedWaybill: string;
  claimAmount: number;
}

const SETTLEMENT_WAYBILLS: SettlementWaybillRow[] = [
  {
    no: 'WB2604001', unloadingTime: '2026-04-10 14:00', truckType: '10W', origin: 'Manila', destination: 'Cebu',
    basicAmount: 15000, additionalChargeItems: [
      { id: 'ac1', type: 'Toll Fee', amount: 300 },
      { id: 'ac2', type: 'Parking Fee', amount: 200 },
    ], exceptionFee: 0, reimbursement: 0, hasDiscrepancy: false,
  },
  {
    no: 'WB2604002', unloadingTime: '2026-04-11 16:30', truckType: '6W', origin: 'Manila', destination: 'Davao',
    basicAmount: 10000, additionalChargeItems: [
      { id: 'ac3', type: 'Detention Fee', amount: 500 },
    ], exceptionFee: 1200, reimbursement: 0, hasDiscrepancy: true,
  },
  {
    no: 'WB2604004', unloadingTime: '2026-04-12 09:00', truckType: '10W', origin: 'Cebu', destination: 'Manila',
    basicAmount: 7800, additionalChargeItems: [
      { id: 'ac4', type: 'Loading Fee', amount: 300 },
    ], exceptionFee: 0, reimbursement: 0, hasDiscrepancy: false,
  },
  {
    no: 'WB2604006', unloadingTime: '2026-04-13 11:00', truckType: '6W', origin: 'Davao', destination: 'Manila',
    basicAmount: 15500, additionalChargeItems: [
      { id: 'ac5', type: 'Toll Fee', amount: 400 },
      { id: 'ac6', type: 'Unloading Fee', amount: 400 },
    ], exceptionFee: 0, reimbursement: 0, hasDiscrepancy: false,
  },
];

const SETTLEMENT_CLAIM_TICKETS: SettlementClaimTicketRow[] = [
  { ticketNo: 'CLM2604001', claimTypeL1: 'Damage', claimTypeL2: 'Cargo Damage', relatedWaybill: 'WB2604002', claimAmount: 500 },
];

const SETTLEMENT_INVOICES = [
  { invoiceNo: 'INV-2026-00201', invoiceAmount: 42300, invoiceDate: '2026-04-16', attachmentName: 'Invoice_Apr2026.pdf' },
];

const SETTLEMENT_PROOFS = [
  { id: 'p1', description: 'Detention fee receipt for WB2604002', attachmentName: 'detention_receipt.pdf' },
  { id: 'p2', description: 'Exception fee supporting document', attachmentName: 'exception_approval.jpg' },
];

const COMMUNICATION_RECORDS = [
  { id: 'cr1', timestamp: '2026-04-16 17:10', actor: 'VP' as const, action: 'Submitted', note: 'Billing statement for April 1-15 period. 4 waybills included.' },
  { id: 'cr2', timestamp: '2026-04-17 09:30', actor: 'TMS' as const, action: 'Rejected', note: 'WB2604002 has unresolved price discrepancy.' },
  { id: 'cr3', timestamp: '2026-04-18 14:20', actor: 'VP' as const, action: 'Resubmitted', note: 'Added Proof documents for detention and exception fees.' },
];

// ---

const STATUS_COLOR: Record<string, string> = {
  'Awaiting Confirmation': 'warning',
  'Pending Payment': 'processing',
  'Rejected': 'error',
  'Paid': 'success',
  'Sync Failed': 'magenta',
  'Payment Rejected': 'error',
  'Approved': 'processing',
};

function syncedToApplicationData(s: SyncedApplication): ApplicationData {
  return {
    appNo: s.applicationNo,
    requestType: s.appType,
    source: s.source,
    vendor: s.vendorName,
    submittedAt: (s.submittedAt || s.createdAt).slice(0, 16).replace('T', ' '),
    status:
      s.status === 'Awaiting Confirmation' || s.status === 'Awaiting Inteluck Confirmation' ? 'Awaiting Confirmation'
      : s.status === 'Pending Payment' || s.status === 'Pending Receipt' ? 'Pending Payment'
      : s.status === 'Paid' || s.status === 'Collected' ? 'Paid'
      : s.status === 'Rejected' ? 'Rejected'
      : s.status === 'Sync Failed' ? 'Sync Failed'
      : s.status === 'Payment Rejected' || s.status === 'Receipt Rejected' ? 'Payment Rejected'
      : 'Awaiting Confirmation',
    waybills: s.waybills.map((w) => ({
      no: w.no,
      status: 'In Transit',
      basicAmount: w.prePaidAmount > 0 ? Math.round(w.prePaidAmount * 1.4) : 0,
      allocatedPrepaid: w.prePaidAmount,
      utilization: w.prePaidAmount > 0 ? Math.round((w.prePaidAmount / (w.prePaidAmount * 1.4)) * 1000) / 10 : 0,
    })),
    claimTickets: [],
    invoices: s.proofFiles[0] ? [{
      id: 'inv-1',
      invoiceNumber: `INV-${s.applicationNo}`,
      invoiceDate: (s.submittedAt || s.createdAt).slice(0, 10),
      invoiceDocument: s.proofFiles[0] || 'invoice_document.pdf',
      status: 'Active' as const,
    }] : [],
    prepaidAmount: s.totalAmountPayable,
    vatRate: 0, vatAmount: 0, whtRate: 0, whtAmount: 0,
    totalPayable: s.totalAmountPayable,
    currency: s.currency,
    bankName: s.bankName || '-',
    bankAccount: s.payeeAccount || '-',
    proofFile: s.proofFiles[0] || '',
    invoiceNumber: `INV-${s.applicationNo}`,
    invoiceDate: (s.submittedAt || s.createdAt).slice(0, 10),
    invoiceDocument: s.proofFiles[0] || 'invoice_document.pdf',
    remark: s.remark || '',
    rejectReason: s.rejectReason || s.hrRejectReason,
    rfpNumber: s.rfpNumber,
    rfpStatus: s.rfpStatus,
    responsibleDepartment: s.responsibleDepartment,
    paymentDefinition: s.paymentDefinition,
    entity: s.entity,
    businessUnit: s.businessUnit,
    dateOfNeeded: s.dateOfNeeded,
    paymentIdentificationL1: s.paymentIdentificationL1,
    paymentIdentificationL2: s.paymentIdentificationL2,
    isSynced: true,
  };
}

function genRfpNumber(appNo: string): string {
  const tail = appNo.slice(-4);
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `RFP-${yy}${mm}${dd}-${tail}`;
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

type DetailType = 'prepaid' | 'modification' | 'settlement';

const AdvancePaymentDetail: React.FC = () => {
  const { id: appNo } = useParams<{ id: string }>();

  // Determine which detail type to render (based on URL param or appNo pattern)
  const detailType: DetailType = useMemo(() => {
    // Check URL query params for type override
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'modification') return 'modification';
    if (type === 'settlement') return 'settlement';
    return 'prepaid';
  }, []);

  if (detailType === 'modification') return <ModificationView appNo={appNo!} />;
  if (detailType === 'settlement') return <SettlementView appNo={appNo!} />;
  return <PrepaidView appNo={appNo!} />;
};

// ======================= PREPAID VIEW =======================
function PrepaidView({ appNo }: { appNo: string }) {
  const [data, setData] = useState<ApplicationData>(() => {
    const synced = getApplication(appNo);
    if (synced) return syncedToApplicationData(synced);
    if (STATEMENT_PAYMENT_DATA[appNo]) return STATEMENT_PAYMENT_DATA[appNo];
    return APP_DATA[appNo] || FALLBACK;
  });
  const [operationLogs, setOperationLogs] = useState<OperationLogEntry[]>(() =>
    getApplication(appNo)?.operationLogs || [],
  );

  const refreshLogs = () => setOperationLogs(getApplication(appNo)?.operationLogs || []);

  useEffect(() => {
    const synced = getApplication(appNo);
    if (synced) {
      setData(syncedToApplicationData(synced));
      setOperationLogs(synced.operationLogs || []);
    } else {
      setData(STATEMENT_PAYMENT_DATA[appNo] || APP_DATA[appNo] || FALLBACK);
    }
  }, [appNo]);

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHrRejectDialog, setShowHrRejectDialog] = useState(false);
  const [showAddWaybillDialog, setShowAddWaybillDialog] = useState(false);
  const [showAddClaimTicketDialog, setShowAddClaimTicketDialog] = useState(false);
  const [showAddInvoiceDialog, setShowAddInvoiceDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [hrRejectReason, setHrRejectReason] = useState('');
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AppStatus>(data.status);
  const [editableWaybills, setEditableWaybills] = useState<WaybillRow[]>(data.waybills);
  const [editableClaimTickets, setEditableClaimTickets] = useState<ClaimTicket[]>(data.claimTickets);
  const [editableInvoices, setEditableInvoices] = useState<InvoiceRecord[]>(data.invoices);
  const [selectedWaybillNos, setSelectedWaybillNos] = useState<Set<string>>(new Set());
  const [waybillAdvancedAmounts, setWaybillAdvancedAmounts] = useState<Record<string, string>>({});
  const [editingWaybillNo, setEditingWaybillNo] = useState<string | null>(null);
  const [editingWaybillAmount, setEditingWaybillAmount] = useState('');
  const [selectedClaimTicketNos, setSelectedClaimTicketNos] = useState<Set<string>>(new Set());
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState('');
  const [newInvoiceDocument, setNewInvoiceDocument] = useState('');
  const [rfpForm, setRfpForm] = useState({
    responsibleDepartment: '',
    paymentDefinition: '',
    entity: '',
    businessUnit: '',
    dateOfNeeded: '',
    paymentIdentificationL1: '',
    paymentIdentificationL2: '',
  });

  useEffect(() => { setCurrentStatus(data.status); }, [data.status]);

  const isRfpFormComplete = Object.values(rfpForm).every(Boolean);

  const handleApprove = () => {
    if (!isRfpFormComplete) return;
    setShowApproveConfirm(false);
    const shouldFailRfpSync = appNo === 'PPA2604012';
    if (shouldFailRfpSync) {
      setActionDone('rfp-failed');
      if (data.isSynced) {
        const now = nowIso();
        appendLog(appNo, { time: now, actor: 'TMS Reviewer', action: 'Confirm and Create RFP Failed', note: 'RFP sync failed; status remains Awaiting Confirmation' });
        refreshLogs();
      }
      return;
    }
    const nextStatus: AppStatus = 'Pending Payment';
    const rfpNumber = genRfpNumber(appNo);
    setCurrentStatus(nextStatus);
    setActionDone('approved');
    setData((prev) => ({ ...prev, status: nextStatus, rfpNumber, rfpStatus: 'Created', ...rfpForm }));
    if (data.isSynced) {
      const now = nowIso();
      updateApplicationStatus(appNo, { status: nextStatus, reviewedAt: now, rfpNumber, rfpStatus: 'Created', ...rfpForm });
      appendLog(appNo, { time: now, actor: 'TMS Reviewer', action: 'Approve and Create RFP', note: `${rfpNumber} created; RFP sync succeeded` });
      refreshLogs();
    }
  };

  const handleRetrySync = () => {
    const now = nowIso();
    setCurrentStatus('Pending Payment');
    setData((prev) => ({ ...prev, status: 'Pending Payment', rfpStatus: 'Created' }));
    if (data.isSynced) {
      updateApplicationStatus(appNo, { status: 'Pending Payment', reviewedAt: now, rfpStatus: 'Created' });
      appendLog(appNo, { time: now, actor: 'TMS Reviewer', action: 'Retry Sync', note: 'HR sync succeeded - moved to Pending Payment' });
      refreshLogs();
    }
    message.success('Sync retried successfully');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setShowRejectDialog(false);
    setCurrentStatus('Rejected');
    setActionDone('rejected');
    if (data.isSynced) {
      const now = nowIso();
      updateApplicationStatus(appNo, { status: 'Rejected', rejectReason: rejectReason.trim(), reviewedAt: now });
      appendLog(appNo, { time: now, actor: 'TMS Reviewer', action: 'Rejected', note: rejectReason.trim() });
      refreshLogs();
    }
  };

  const handleEdit = () => {
    setShowEditDialog(false);
    const updatedWaybills = editableWaybills.map((w) => ({
      ...w,
      utilization: w.basicAmount > 0 ? Math.round((w.allocatedPrepaid / w.basicAmount) * 1000) / 10 : 0,
    }));
    const newTotal = updatedWaybills.reduce((s, w) => s + w.allocatedPrepaid, 0);
    setData((prev) => ({ ...prev, waybills: updatedWaybills, claimTickets: editableClaimTickets, invoices: editableInvoices, prepaidAmount: newTotal }));
    setActionDone('edited');
    if (data.isSynced) {
      const now = nowIso();
      appendLog(appNo, { time: now, actor: 'TMS Reviewer', action: 'Application Edited', note: 'Waybills/Claims/Invoices updated' });
      refreshLogs();
    }
    message.success('Changes saved');
  };

  const handleAddWaybill = () => {
    const toAdd = TMS_WAYBILLS
      .filter((w) => w.vendor === data.vendor && selectedWaybillNos.has(w.no))
      .filter((w) => !editableWaybills.some((ew) => ew.no === w.no));
    if (toAdd.length === 0) return;
    const newRows: WaybillRow[] = toAdd.map((w) => {
      const advAmt = Number(waybillAdvancedAmounts[w.no] || '0');
      const basic = w.basicAmount;
      return { no: w.no, status: w.status, basicAmount: basic, allocatedPrepaid: advAmt, utilization: basic > 0 ? Math.round((advAmt / basic) * 1000) / 10 : 0 };
    });
    const nextWaybills = [...editableWaybills, ...newRows];
    setEditableWaybills(nextWaybills);
    setSelectedWaybillNos(new Set());
    setWaybillAdvancedAmounts({});
    setShowAddWaybillDialog(false);
    if (data.isSynced) {
      const newNet = nextWaybills.reduce((s, w) => s + w.allocatedPrepaid, 0) - editableClaimTickets.reduce((s, ct) => s + ct.amount, 0);
      updateApplicationStatus(appNo, { totalAmountPayable: Math.max(0, newNet) });
    }
    message.success(`${newRows.length} waybill(s) added`);
  };

  const handleRemoveWaybill = (no: string) => setEditableWaybills((prev) => prev.filter((w) => w.no !== no));

  const handleWaybillAmountChange = (no: string, newAmount: number) => {
    setEditableWaybills((prev) => prev.map((w) => {
      if (w.no !== no) return w;
      return { ...w, allocatedPrepaid: newAmount, utilization: w.basicAmount > 0 ? Math.round((newAmount / w.basicAmount) * 1000) / 10 : 0 };
    }));
  };

  const handleSaveWaybillRow = (no: string) => {
    const newAmount = Number(editingWaybillAmount);
    setEditableWaybills((prev) => prev.map((w) => {
      if (w.no !== no) return w;
      return { ...w, allocatedPrepaid: newAmount, utilization: w.basicAmount > 0 ? Math.round((newAmount / w.basicAmount) * 1000) / 10 : 0 };
    }));
    setEditingWaybillNo(null);
    setEditingWaybillAmount('');
  };

  const handleAddClaimTicket = () => {
    const toAdd = TMS_CLAIM_TICKETS
      .filter((ct) => ct.vendor === data.vendor && selectedClaimTicketNos.has(ct.ticketNo))
      .filter((ct) => !editableClaimTickets.some((ect) => ect.ticketNo === ct.ticketNo));
    if (toAdd.length === 0) return;
    const newRows: ClaimTicket[] = toAdd.map((ct) => ({
      id: `ct-${ct.ticketNo}`, ticketNo: ct.ticketNo, ticketType: 'Claim Ticket' as const, amount: ct.amount,
      description: ct.claimType + (ct.relatedWaybill ? ` - ${ct.relatedWaybill}` : ''),
    }));
    const nextClaimTickets = [...editableClaimTickets, ...newRows];
    setEditableClaimTickets(nextClaimTickets);
    setSelectedClaimTicketNos(new Set());
    setShowAddClaimTicketDialog(false);
    if (data.isSynced) {
      const newNet = editableWaybills.reduce((s, w) => s + w.allocatedPrepaid, 0) - nextClaimTickets.reduce((s, ct) => s + ct.amount, 0);
      updateApplicationStatus(appNo, { totalAmountPayable: Math.max(0, newNet) });
    }
    message.success(`${newRows.length} claim ticket(s) added`);
  };

  const handleRemoveClaimTicket = (id: string) => setEditableClaimTickets((prev) => prev.filter((ct) => ct.id !== id));

  const handleAddInvoice = () => {
    if (!newInvoiceNumber.trim() || !newInvoiceDate.trim()) return;
    const newInv: InvoiceRecord = {
      id: `inv-${Date.now()}`, invoiceNumber: newInvoiceNumber.trim(), invoiceDate: newInvoiceDate.trim(),
      invoiceDocument: newInvoiceDocument.trim() || `invoice_${newInvoiceNumber.trim()}.pdf`, status: 'Active',
    };
    setEditableInvoices((prev) => [...prev, newInv]);
    setNewInvoiceNumber(''); setNewInvoiceDate(''); setNewInvoiceDocument('');
    setShowAddInvoiceDialog(false);
  };

  const handleVoidInvoice = (id: string) => {
    setEditableInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: 'Voided' as const } : inv));
  };

  const handleHrPay = () => {
    setCurrentStatus('Paid');
    setActionDone('hr-paid');
    if (data.isSynced) {
      const now = nowIso();
      updateApplicationStatus(appNo, { status: 'Paid', paidAt: now });
      appendLog(appNo, { time: now, actor: 'HR System', action: 'Payment Released', note: 'Payment completed' });
      refreshLogs();
    }
    message.success('Payment released');
  };

  const handleHrReject = () => {
    if (!hrRejectReason.trim()) return;
    setShowHrRejectDialog(false);
    setCurrentStatus('Payment Rejected');
    setActionDone('hr-rejected');
    if (data.isSynced) {
      const now = nowIso();
      updateApplicationStatus(appNo, { status: 'Payment Rejected', hrRejectReason: hrRejectReason.trim(), paidAt: now });
      appendLog(appNo, { time: now, actor: 'HR System', action: 'Payment Rejected', note: hrRejectReason.trim() });
      refreshLogs();
    }
  };

  const totalPaymentAmount = editableWaybills.reduce((sum, w) => sum + w.allocatedPrepaid, 0);
  const totalClaimAmount = editableClaimTickets.reduce((sum, ct) => sum + ct.amount, 0);
  const netPaymentAmount = totalPaymentAmount - totalClaimAmount;

  const isReviewable = currentStatus === 'Awaiting Confirmation';
  const isVpCreated = data.source === 'Vendor Portal';
  const isEditable = isReviewable;
  const isStatementPaymentRequest = data.requestType === 'Statement Payment Request' || appNo.startsWith('APA');
  const statusLabel = data.displayStatus || currentStatus;

  // -------- Statement Payment Request view --------
  if (isStatementPaymentRequest) {
    const paymentItems = [
      { type: 'Basic Amount', netAmount: 1000, vatRate: '7%', vat: 70, whtRate: '2%', wht: 20 },
      { type: 'Additional Charge', netAmount: 100, vatRate: '7%', vat: 7, whtRate: '2%', wht: 2 },
    ];
    const deductionItems = [
      { type: 'KPI Claim', netAmount: 1000, vatRate: '0', vat: 0, whtRate: '0', wht: 0 },
    ];
    const associatedRecords = data.associatedRecords || [
      { recordType: 'AP Statement', number: 'AP2026080811F4', status: 'Pending Payment' },
      { recordType: 'RFP', number: 'Pay-TH2605150037', status: 'Pending Review' },
    ];

    return (
      <div>
        <BreadcrumbCase
          items={[
            { name: 'Advance Payment', path: PATHS.BILLING_ADVANCE_PAYMENT },
            { name: 'Statement Payment Detail', path: PATHS.BILLING_ADVANCE_PAYMENT_DETAIL },
          ]}
        />
        <div className={styles.detailHeader}>
          <Typography.Title level={5} style={{ margin: 0 }}>{data.appNo}</Typography.Title>
          <Tag>{statusLabel}</Tag>
          <Tag color={data.source === 'Vendor Portal' ? 'green' : 'default'}>{data.source}</Tag>
        </div>

        <Card className={styles.detailCard}>
          <div className={styles.sectionTitleBorder}>Basic Information</div>
          <Descriptions column={3} size="small">
            <Descriptions.Item label="Total Amount Payable">{fmt(data.totalPayable)}</Descriptions.Item>
            <Descriptions.Item label="Request Type">Statement Payment Request</Descriptions.Item>
            <Descriptions.Item label="Create date">{data.createdAt || data.submittedAt.slice(0, 10)}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className={styles.detailCard}>
          <div className={styles.sectionTitleBorder}>Associated Record ({associatedRecords.length})</div>
          <Table
            size="small"
            pagination={false}
            dataSource={associatedRecords}
            rowKey="number"
            columns={[
              { title: 'Record Type', dataIndex: 'recordType' },
              { title: 'Number', dataIndex: 'number', render: (v: string) => <Button type="link" style={{ padding: 0 }}>{v}</Button> },
              { title: 'Status', dataIndex: 'status' },
            ]}
          />
        </Card>

        <Card className={styles.detailCard}>
          <div className={styles.sectionTitleBorder}>Amount Information</div>
          <Descriptions column={2} size="small" style={{ marginBottom: 14 }}>
            <Descriptions.Item label="Currency">{data.currency}</Descriptions.Item>
            <Descriptions.Item label="Payment Amount">{fmt(data.prepaidAmount)}</Descriptions.Item>
          </Descriptions>
          <Typography.Text strong style={{ display: 'block', background: '#f3f3f3', padding: '8px 14px', marginBottom: 14 }}>Payment Item</Typography.Text>
          <Table size="small" pagination={false} dataSource={paymentItems} rowKey="type" columns={[
            { title: 'Payment Item Type', dataIndex: 'type' },
            { title: 'Net Amount', dataIndex: 'netAmount', align: 'right' as const, render: (v: number) => fmt(v) },
            { title: 'VAT Rate', dataIndex: 'vatRate' },
            { title: 'VAT', dataIndex: 'vat', align: 'right' as const },
            { title: 'WHT Rate', dataIndex: 'whtRate' },
            { title: 'WHT', dataIndex: 'wht', align: 'right' as const },
          ]} />
          <Typography.Text strong style={{ display: 'block', borderBottom: '1px solid #d9d9d9', paddingBottom: 8, marginBottom: 10, marginTop: 16 }}>Deduction Item</Typography.Text>
          <Table size="small" pagination={false} dataSource={deductionItems} rowKey="type" columns={[
            { title: 'Payment Item Type', dataIndex: 'type' },
            { title: 'Net Amount', dataIndex: 'netAmount', align: 'right' as const, render: (v: number) => fmt(v) },
            { title: 'VAT Rate', dataIndex: 'vatRate' },
            { title: 'VAT', dataIndex: 'vat', align: 'right' as const },
            { title: 'WHT Rate', dataIndex: 'whtRate' },
            { title: 'WHT', dataIndex: 'wht', align: 'right' as const },
          ]} />
        </Card>

        <Card className={styles.detailCard}>
          <div className={styles.sectionTitleBorder}>Bank Information</div>
          <Descriptions column={3} size="small">
            <Descriptions.Item label="Bank Name">{data.bankName} - {data.bankAccount}</Descriptions.Item>
            <Descriptions.Item label="Bank Account Name">{data.bankName} - {data.bankAccount}</Descriptions.Item>
            <Descriptions.Item label="Bank Account Number">{data.bankAccount}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  }

  // -------- Advance Payment Request detail view --------
  const renderPaymentTable = () => (
    <Card className={styles.detailCard}>
      <div className={styles.sectionTitle}>Payment</div>
      <Table size="small" pagination={false} dataSource={[data]} rowKey="appNo" columns={[
        { title: 'Payable Amount', dataIndex: 'totalPayable', align: 'right' as const, render: (v: number) => <strong>{fmt(v)}</strong> },
        { title: 'Payment Request Status', render: () => <Badge status={currentStatus === 'Paid' ? 'success' : 'warning'} text={currentStatus === 'Paid' ? 'Paid' : currentStatus === 'Pending Payment' ? 'Pending' : currentStatus} /> },
        { title: 'Payment Request No.', dataIndex: 'appNo', render: (v: string) => <Typography.Text type="secondary">{v}</Typography.Text> },
        { title: 'Proof', dataIndex: 'proofFile', render: (v: string) => v ? <Button type="link" size="small" style={{ padding: 0 }}>{v}</Button> : <span style={{ color: '#bbb' }}>-</span> },
        { title: 'Bank Name', dataIndex: 'bankName' },
        { title: 'Bank Account Name', dataIndex: 'vendor' },
        { title: 'Bank Account No.', dataIndex: 'bankAccount' },
      ]} />
    </Card>
  );

  return (
    <div>
      <BreadcrumbCase
        items={[
          { name: 'Advance Payment', path: PATHS.BILLING_ADVANCE_PAYMENT },
          { name: 'Request Detail', path: PATHS.BILLING_ADVANCE_PAYMENT_DETAIL },
        ]}
      />
      {/* Header */}
      <div className={styles.detailHeader}>
        <Typography.Title level={5} style={{ margin: 0 }}>{data.appNo}</Typography.Title>
        <Badge status={STATUS_COLOR[currentStatus] as any} text={currentStatus} />
        <Tag color={data.source === 'Vendor Portal' ? 'green' : 'default'}>Origin: {data.source}</Tag>

        {isEditable && (
          <div className={styles.detailActions}>
            <Button onClick={() => setShowEditDialog(true)}>Edit</Button>
            <Button danger onClick={() => setShowRejectDialog(true)}>Reject</Button>
            <Button type="primary" onClick={() => setShowApproveConfirm(true)}>Approve and Create RFP</Button>
          </div>
        )}
        {currentStatus === 'Pending Payment' && (
          <div className={styles.detailActions}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Mock HR Result:</Typography.Text>
            <Button danger onClick={() => { setHrRejectReason(''); setShowHrRejectDialog(true); }}>HR Reject</Button>
            <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={handleHrPay}>HR Pay</Button>
          </div>
        )}
        {currentStatus === 'Sync Failed' && (
          <div className={styles.detailActions}>
            <Typography.Text type="danger" style={{ fontSize: 12 }}>HR sync failed. RFP has been created.</Typography.Text>
            <Button type="primary" onClick={handleRetrySync}>Retry Sync</Button>
          </div>
        )}
      </div>

      {/* Action banners */}
      {actionDone === 'approved' && <Alert type="success" message="RFP created successfully and the request moved to Pending Payment." showIcon style={{ marginBottom: 16 }} />}
      {actionDone === 'rfp-failed' && <Alert type="error" message="RFP sync failed. The request status was not updated and no data was submitted to the next step." showIcon style={{ marginBottom: 16 }} />}
      {actionDone === 'rejected' && <Alert type="error" message="Application rejected. The vendor has been notified with your reason." showIcon style={{ marginBottom: 16 }} />}
      {actionDone === 'edited' && <Alert type="info" message="Amounts updated. Changes recorded in the operation log." showIcon style={{ marginBottom: 16 }} />}
      {actionDone === 'hr-paid' && <Alert type="success" message="HR has released the payment. Application marked as Paid." showIcon style={{ marginBottom: 16 }} />}
      {actionDone === 'hr-rejected' && <Alert type="error" message="HR rejected the payment. Application marked as Payment Rejected." showIcon style={{ marginBottom: 16 }} />}
      {currentStatus === 'Rejected' && data.rejectReason && <Alert type="error" message={<><strong>Reject Reason:</strong> {data.rejectReason}</>} style={{ marginBottom: 16 }} />}

      {/* Basic info */}
      <Card className={styles.detailCard} title="Basic Information" size="small">
        <Descriptions bordered size="small" column={4}>
          <Descriptions.Item label="Vendor">{data.vendor}</Descriptions.Item>
          <Descriptions.Item label="Submitted At">{data.submittedAt}</Descriptions.Item>
          <Descriptions.Item label="Bank">{data.bankName} - {data.bankAccount}</Descriptions.Item>
          <Descriptions.Item label="Proof">
            {data.proofFile ? <Button type="link" size="small" style={{ padding: 0 }}>{data.proofFile}</Button> : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Payment module (shown at top when Paid) */}
      {currentStatus === 'Paid' && renderPaymentTable()}

      {/* Waybill breakdown */}
      <Card className={styles.detailCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Advance Payment Waybills</div>
          {isEditable && <Button size="small" onClick={() => setShowAddWaybillDialog(true)}>+ Add Waybill</Button>}
        </div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          System validation: Advanced Payment Amount must not exceed 50% of Basic Amount.
        </Typography.Text>
        <Table
          size="small"
          pagination={false}
          dataSource={editableWaybills}
          rowKey="no"
          columns={[
            { title: 'Waybill No.', dataIndex: 'no', render: (v: string) => <strong>{v}</strong> },
            { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: 'Basic Amount', dataIndex: 'basicAmount', align: 'right' as const, render: (v: number) => fmt(v) },
            {
              title: 'Advanced Payment Amount', dataIndex: 'allocatedPrepaid', align: 'right' as const,
              render: (v: number, record: WaybillRow) => {
                if (editingWaybillNo === record.no) {
                  return <InputNumber size="small" style={{ width: 110 }} value={Number(editingWaybillAmount)} onChange={(val) => setEditingWaybillAmount(String(val || 0))} autoFocus />;
                }
                return fmt(v);
              },
            },
            {
              title: 'Prepayment Ratio', align: 'right' as const,
              render: (_: any, record: WaybillRow) => {
                const amt = editingWaybillNo === record.no ? Number(editingWaybillAmount) : record.allocatedPrepaid;
                return record.basicAmount > 0 ? `${((amt / record.basicAmount) * 100).toFixed(2)}%` : '-';
              },
            },
            {
              title: 'Utilization', align: 'right' as const,
              render: (_: any, record: WaybillRow) => {
                const amt = editingWaybillNo === record.no ? Number(editingWaybillAmount) : record.allocatedPrepaid;
                const util = record.basicAmount > 0 ? Math.round((amt / record.basicAmount) * 1000) / 10 : 0;
                const overLimit = util > 50;
                return <span style={{ color: overLimit ? '#cf1322' : '#389e0d', fontWeight: 600 }}>{util.toFixed(1)}%</span>;
              },
            },
            {
              title: 'Validation',
              render: (_: any, record: WaybillRow) => {
                const amt = editingWaybillNo === record.no ? Number(editingWaybillAmount) : record.allocatedPrepaid;
                const util = record.basicAmount > 0 ? Math.round((amt / record.basicAmount) * 1000) / 10 : 0;
                return util > 50
                  ? <Tag color="error">Over limit</Tag>
                  : <Tag color="success">OK</Tag>;
              },
            },
            ...(isEditable ? [{
              title: '',
              width: 120,
              render: (_: any, record: WaybillRow) => {
                if (editingWaybillNo === record.no) {
                  return <Button type="primary" size="small" onClick={() => handleSaveWaybillRow(record.no)}>Save</Button>;
                }
                return <Button type="link" size="small" onClick={() => { setEditingWaybillNo(record.no); setEditingWaybillAmount(String(record.allocatedPrepaid)); }}>Edit</Button>;
              },
            }] : []),
          ]}
        />
        <div className={styles.totalBar}>
          {totalClaimAmount > 0 && (
            <>
              <span className={styles.totalLabel}>Advance</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#237804' }}>{fmt(totalPaymentAmount)}</span>
              <span style={{ color: '#999' }}>-</span>
              <span className={styles.totalLabel}>Claims</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#d48806' }}>{fmt(totalClaimAmount)}</span>
              <span style={{ color: '#999' }}>=</span>
            </>
          )}
          <span className={styles.totalLabel}>Total Payment Amount</span>
          <span className={`${styles.totalValue} ${netPaymentAmount < 0 ? styles.negative : ''}`}>
            {fmt(netPaymentAmount)}
          </span>
        </div>
      </Card>

      {/* Payment module (shown below waybills when not Paid) */}
      {currentStatus !== 'Paid' && renderPaymentTable()}

      {/* Invoice */}
      <Card className={styles.detailCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Invoice</div>
          {isEditable && <Button size="small" onClick={() => setShowAddInvoiceDialog(true)}>+ Add Invoice</Button>}
        </div>
        {editableInvoices.length === 0 ? (
          <Typography.Text type="secondary">No invoices.</Typography.Text>
        ) : (
          editableInvoices.map((inv) => (
            <div key={inv.id} className={`${styles.invoiceCard} ${inv.status === 'Voided' ? styles.voided : ''}`}>
              <div className={styles.invoiceGrid}>
                <div><div className={styles.infoLabel}>Invoice Number</div><div style={{ fontWeight: 600 }}>{inv.invoiceNumber}</div></div>
                <div><div className={styles.infoLabel}>Invoice Date</div><div>{inv.invoiceDate}</div></div>
                <div><div className={styles.infoLabel}>Invoice Document</div><Button type="link" size="small" style={{ padding: 0 }}>{inv.invoiceDocument}</Button></div>
              </div>
              <Space>
                {inv.status === 'Voided' ? <Tag color="error">Voided</Tag> : <Tag color="success">Active</Tag>}
                {isEditable && inv.status === 'Active' && <Button type="link" danger size="small" onClick={() => handleVoidInvoice(inv.id)}>Void</Button>}
              </Space>
            </div>
          ))
        )}
      </Card>

      {/* Operation Log */}
      <Card className={styles.detailCard}>
        <div className={styles.sectionTitle}>Operation Log</div>
        {operationLogs.length === 0 ? (
          <Typography.Text type="secondary">No records.</Typography.Text>
        ) : (
          operationLogs.map((log, i) => (
            <div key={i} className={styles.logRow}>
              <span className={styles.logTime}>{formatDateTime(log.time)}</span>
              <span className={styles.logActor}>{log.actor}</span>
              <span className={styles.logAction}>
                {log.action}
                {log.note && <span className={styles.logNote}>- {log.note}</span>}
              </span>
            </div>
          ))
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Approve and Create RFP"
        open={showApproveConfirm}
        onCancel={() => setShowApproveConfirm(false)}
        onOk={handleApprove}
        okText="Confirm and Create RFP"
        okButtonProps={{ disabled: !isRfpFormComplete }}
        width={620}
      >
        <Alert type="warning" message="Complete the required RFP information. The system will create the RFP and sync the result to HR." style={{ marginBottom: 16 }} />
        <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Vendor">{data.vendor}</Descriptions.Item>
          <Descriptions.Item label="Total Payable">{fmt(data.totalPayable)}</Descriptions.Item>
          <Descriptions.Item label="Bank">{data.bankName} - {data.bankAccount}</Descriptions.Item>
        </Descriptions>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {([
            ['Responsible Department', 'responsibleDepartment', RESPONSIBLE_DEPARTMENTS],
            ['Payment Definition', 'paymentDefinition', PAYMENT_DEFINITIONS],
            ['Entity', 'entity', ENTITIES],
            ['Business Unit', 'businessUnit', BUSINESS_UNITS],
            ['Payment Identification L1', 'paymentIdentificationL1', PAYMENT_ID_L1],
            ['Payment Identification L2', 'paymentIdentificationL2', PAYMENT_ID_L2],
          ] as [string, keyof typeof rfpForm, string[]][]).map(([label, key, options]) => (
            <div key={key}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}><span style={{ color: '#ff4d4f' }}>* </span>{label}</div>
              <Select style={{ width: '100%' }} value={rfpForm[key] || undefined} placeholder={`Select ${label}`} onChange={(v) => setRfpForm((prev) => ({ ...prev, [key]: v }))}>
                {options.map((o) => <Select.Option key={o} value={o}>{o}</Select.Option>)}
              </Select>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}><span style={{ color: '#ff4d4f' }}>* </span>Date of Needed</div>
            <Input type="date" value={rfpForm.dateOfNeeded} onChange={(e) => setRfpForm((prev) => ({ ...prev, dateOfNeeded: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Application"
        open={showRejectDialog}
        onCancel={() => setShowRejectDialog(false)}
        onOk={handleReject}
        okText="Confirm Reject"
        okButtonProps={{ danger: true, disabled: !rejectReason.trim() }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Reject Reason <span style={{ color: '#ff4d4f' }}>*</span></div>
          <Input.TextArea rows={4} placeholder="Explain why this application is rejected. The vendor will see this reason." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          {!rejectReason.trim() && <Typography.Text type="danger" style={{ fontSize: 12 }}>Reject reason is required.</Typography.Text>}
        </div>
      </Modal>

      {/* HR Reject Modal */}
      <Modal
        title="Mock HR Reject"
        open={showHrRejectDialog}
        onCancel={() => setShowHrRejectDialog(false)}
        onOk={handleHrReject}
        okText="Confirm HR Reject"
        okButtonProps={{ danger: true, disabled: !hrRejectReason.trim() }}
      >
        <Alert type="warning" message="This simulates the HR system rejecting the payment. The application status will move to Payment Rejected." style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>HR Reject Reason <span style={{ color: '#ff4d4f' }}>*</span></div>
          <Input.TextArea rows={4} placeholder="e.g. Bank account verification failed." value={hrRejectReason} onChange={(e) => setHrRejectReason(e.target.value)} />
          {!hrRejectReason.trim() && <Typography.Text type="danger" style={{ fontSize: 12 }}>Reason is required.</Typography.Text>}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Application"
        open={showEditDialog}
        onCancel={() => setShowEditDialog(false)}
        onOk={handleEdit}
        okText="Save Changes"
        width={720}
      >
        {/* Waybills */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography.Text strong>Advance Payment Waybills</Typography.Text>
            <Button size="small" onClick={() => setShowAddWaybillDialog(true)}>+ Add Waybill</Button>
          </div>
          {editableWaybills.length === 0 ? (
            <Typography.Text type="secondary">No waybills.</Typography.Text>
          ) : (
            <Table size="small" pagination={false} dataSource={editableWaybills} rowKey="no" columns={[
              { title: 'Waybill No.', dataIndex: 'no', render: (v: string) => <strong>{v}</strong> },
              { title: 'Basic Amount', dataIndex: 'basicAmount', align: 'right' as const, render: (v: number) => fmt(v) },
              { title: 'Adv. Payment Amount', dataIndex: 'allocatedPrepaid', align: 'right' as const, render: (v: number, r: WaybillRow) => <InputNumber size="small" style={{ width: 100 }} value={v} onChange={(val) => handleWaybillAmountChange(r.no, val || 0)} /> },
              { title: '', width: 60, render: (_: any, r: WaybillRow) => <Button type="link" danger size="small" onClick={() => handleRemoveWaybill(r.no)}>Remove</Button> },
            ]} />
          )}
        </div>
        {/* Invoices */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography.Text strong>Invoices</Typography.Text>
            <Button size="small" onClick={() => setShowAddInvoiceDialog(true)}>+ Add Invoice</Button>
          </div>
          {editableInvoices.length === 0 ? (
            <Typography.Text type="secondary">No invoices.</Typography.Text>
          ) : (
            editableInvoices.map((inv) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: inv.status === 'Voided' ? '#fff1f0' : '#fafafa', border: inv.status === 'Voided' ? '1px solid #ffa39e' : '1px solid #f0f0f0', borderRadius: 6, fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, flex: 1 }}>{inv.invoiceNumber}</span>
                <span style={{ color: '#888' }}>{inv.invoiceDate}</span>
                {inv.status === 'Voided' ? <Tag color="error">Voided</Tag> : <><Tag color="success">Active</Tag><Button type="link" danger size="small" onClick={() => handleVoidInvoice(inv.id)}>Void</Button></>}
              </div>
            ))
          )}
        </div>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>All edits are recorded in the operation log.</Typography.Text>
      </Modal>

      {/* Add Waybill Modal */}
      <Modal
        title="Add Waybill"
        open={showAddWaybillDialog}
        onCancel={() => { setShowAddWaybillDialog(false); setSelectedWaybillNos(new Set()); setWaybillAdvancedAmounts({}); }}
        onOk={handleAddWaybill}
        okText={`Add Selected (${selectedWaybillNos.size})`}
        okButtonProps={{ disabled: selectedWaybillNos.size === 0 || ![...selectedWaybillNos].every((no) => { const amt = Number(waybillAdvancedAmounts[no] || ''); return !isNaN(amt) && amt > 0; }) }}
        width={680}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Showing waybills for <strong>{data.vendor}</strong>.
        </Typography.Text>
        {(() => {
          const vendorWaybills = TMS_WAYBILLS.filter((w) => w.vendor === data.vendor && !w.alreadyInStatement && !editableWaybills.some((ew) => ew.no === w.no));
          if (vendorWaybills.length === 0) return <Typography.Text type="secondary">No available waybills for this vendor.</Typography.Text>;
          return (
            <Table size="small" pagination={false} dataSource={vendorWaybills} rowKey="no"
              rowSelection={{
                selectedRowKeys: [...selectedWaybillNos],
                onChange: (keys) => setSelectedWaybillNos(new Set(keys as string[])),
              }}
              columns={[
                { title: 'Waybill No.', dataIndex: 'no', render: (v: string) => <strong>{v}</strong> },
                { title: 'Status', dataIndex: 'status' },
                { title: 'Basic Amount', dataIndex: 'basicAmount', align: 'right' as const, render: (v: number) => fmt(v) },
                { title: 'Advanced Payment Amount *', align: 'right' as const, render: (_: any, r: any) => <InputNumber size="small" style={{ width: 110 }} placeholder="0.00" disabled={!selectedWaybillNos.has(r.no)} value={waybillAdvancedAmounts[r.no] ? Number(waybillAdvancedAmounts[r.no]) : undefined} onChange={(val) => setWaybillAdvancedAmounts((prev) => ({ ...prev, [r.no]: String(val || '') }))} /> },
              ]}
            />
          );
        })()}
      </Modal>

      {/* Add Claim Ticket Modal */}
      <Modal
        title="Add Claim Ticket"
        open={showAddClaimTicketDialog}
        onCancel={() => { setShowAddClaimTicketDialog(false); setSelectedClaimTicketNos(new Set()); }}
        onOk={handleAddClaimTicket}
        okText={`Add Selected (${selectedClaimTicketNos.size})`}
        okButtonProps={{ disabled: selectedClaimTicketNos.size === 0 }}
        width={620}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Showing claim tickets for <strong>{data.vendor}</strong>.
        </Typography.Text>
        {(() => {
          const vendorTickets = TMS_CLAIM_TICKETS.filter((ct) => ct.vendor === data.vendor && !ct.alreadyInStatement && !editableClaimTickets.some((ect) => ect.ticketNo === ct.ticketNo));
          if (vendorTickets.length === 0) return <Typography.Text type="secondary">No available claim tickets for this vendor.</Typography.Text>;
          return (
            <Table size="small" pagination={false} dataSource={vendorTickets} rowKey="ticketNo"
              rowSelection={{
                selectedRowKeys: [...selectedClaimTicketNos],
                onChange: (keys) => setSelectedClaimTicketNos(new Set(keys as string[])),
              }}
              columns={[
                { title: 'Ticket No.', dataIndex: 'ticketNo', render: (v: string) => <strong>{v}</strong> },
                { title: 'Claim Type', dataIndex: 'claimType' },
                { title: 'Related Waybill', dataIndex: 'relatedWaybill', render: (v?: string) => v || '-' },
                { title: 'Amount', dataIndex: 'amount', align: 'right' as const, render: (v: number) => <strong>{fmt(v)}</strong> },
                { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v === 'For Deduction' ? 'success' : v === 'Disputed' ? 'error' : 'warning'}>{v}</Tag> },
              ]}
            />
          );
        })()}
      </Modal>

      {/* Add Invoice Modal */}
      <Modal
        title="Add Invoice"
        open={showAddInvoiceDialog}
        onCancel={() => setShowAddInvoiceDialog(false)}
        onOk={handleAddInvoice}
        okText="Add"
        okButtonProps={{ disabled: !newInvoiceNumber.trim() || !newInvoiceDate.trim() }}
        width={400}
      >
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>Invoice Number <span style={{ color: '#ff4d4f' }}>*</span></div>
          <Input value={newInvoiceNumber} onChange={(e) => setNewInvoiceNumber(e.target.value)} placeholder="e.g. INV-2026-001" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>Invoice Date <span style={{ color: '#ff4d4f' }}>*</span></div>
          <Input type="date" value={newInvoiceDate} onChange={(e) => setNewInvoiceDate(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>Invoice Document</div>
          <Input value={newInvoiceDocument} onChange={(e) => setNewInvoiceDocument(e.target.value)} placeholder="e.g. invoice_001.pdf" />
        </div>
      </Modal>
    </div>
  );
}

// ======================= MODIFICATION VIEW =======================
function ModificationView({ appNo }: { appNo: string }) {
  type Decision = 'pending' | 'approved' | 'rejected';
  const [decisions, setDecisions] = useState<Record<string, Decision>>({ L1: 'pending', L2: 'pending', L3: 'pending' });
  const [notes, setNotes] = useState<Record<string, string>>({});

  const decide = (id: string, d: Decision) => setDecisions({ ...decisions, [id]: d });
  const pending = Object.values(decisions).filter((d) => d === 'pending').length;
  const approved = Object.values(decisions).filter((d) => d === 'approved').length;
  const rejected = Object.values(decisions).filter((d) => d === 'rejected').length;
  const totalDelta = MOD_LINES.reduce((a, l) => a + l.delta, 0);
  const approvedDelta = MOD_LINES.filter((l) => decisions[l.id] === 'approved').reduce((a, l) => a + l.delta, 0);
  const finalStatus = pending > 0 ? 'Under Review' : (rejected === 0 ? 'Approved' : (approved === 0 ? 'Rejected' : 'Partially Approved'));

  return (
    <div>
      <BreadcrumbCase
        items={[
          { name: 'Advance Payment', path: PATHS.BILLING_ADVANCE_PAYMENT },
          { name: 'Price Modification Review', path: PATHS.BILLING_ADVANCE_PAYMENT_DETAIL },
        ]}
      />
      <Card className={styles.detailCard} style={{ marginBottom: 16 }}>
        <span>{appNo} - <Tag color="orange">Price Modification</Tag></span>
      </Card>

      <Alert type="info" message={<>Row-by-row review. <strong>Approved</strong> lines update the waybill billing amount. <strong>Rejected</strong> lines keep the original TMS amount.</>} showIcon style={{ marginBottom: 16 }} />

      <Card className={styles.detailCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Application Summary</div>
          <Tag color={finalStatus === 'Under Review' ? 'warning' : finalStatus === 'Approved' ? 'success' : finalStatus === 'Rejected' ? 'error' : 'orange'}>{finalStatus}</Tag>
        </div>
        <Descriptions bordered size="small" column={4}>
          <Descriptions.Item label="Vendor">Coca-Cola Bottlers PH Inc.</Descriptions.Item>
          <Descriptions.Item label="Submitted">2026-04-16 14:22</Descriptions.Item>
          <Descriptions.Item label="Rows">{MOD_LINES.length} ({approved} approved / {pending} pending / {rejected} rejected)</Descriptions.Item>
          <Descriptions.Item label="Approved Delta / Total"><span style={{ color: '#389e0d' }}>+{approvedDelta.toLocaleString()}</span> / +{totalDelta.toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className={styles.detailCard}>
        <div className={styles.sectionTitle}>Line-by-Line Review</div>
        {MOD_LINES.map((l) => {
          const d = decisions[l.id];
          return (
            <div key={l.id} className={`${styles.reviewRow} ${d === 'approved' ? styles.approved : d === 'rejected' ? styles.rejected : ''}`}>
              <Descriptions bordered size="small" column={5} style={{ marginBottom: 0 }}>
                <Descriptions.Item label="Waybill"><strong>{l.waybill}</strong></Descriptions.Item>
                <Descriptions.Item label="Settlement Item">{l.item}</Descriptions.Item>
                <Descriptions.Item label="TMS Amount">{l.tmsAmount.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Vendor Amount">{l.vendorAmount.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Delta"><span style={{ color: '#389e0d', fontWeight: 500 }}>+{l.delta.toLocaleString()}</span></Descriptions.Item>
              </Descriptions>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                  {d === 'pending' && (
                    <>
                      <Button size="small" onClick={() => decide(l.id, 'rejected')}>Reject</Button>
                      <Button type="primary" size="small" onClick={() => decide(l.id, 'approved')}>Approve</Button>
                    </>
                  )}
                  {d === 'approved' && <><Tag color="success">Approved</Tag><Button type="link" size="small" onClick={() => decide(l.id, 'pending')}>Undo</Button></>}
                  {d === 'rejected' && <><Tag color="error">Rejected</Tag><Button type="link" size="small" onClick={() => decide(l.id, 'pending')}>Undo</Button></>}
              </div>
              {d !== 'pending' && (
                <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Typography.Text type="secondary" style={{ width: 80, fontSize: 12 }}>Review Note</Typography.Text>
                  <Input placeholder={d === 'approved' ? 'Confirmed via attached proof' : 'Explain why this adjustment is rejected.'} value={notes[l.id] || ''} onChange={(e) => setNotes({ ...notes, [l.id]: e.target.value })} />
                </div>
              )}
            </div>
          );
        })}
        {pending === 0 && (
          <Alert type="success" message={<>All rows decided. Application status: <strong>{finalStatus}</strong>.{approved > 0 && ` ${approved} approved line(s) will trigger Edit Billed Amount.`}</>} showIcon style={{ marginTop: 14 }} />
        )}
      </Card>
    </div>
  );
}

// ======================= SETTLEMENT VIEW =======================
function SettlementView({ appNo }: { appNo: string }) {
  type SettlementItem = 'basic' | 'additional' | 'exception' | 'reimbursement' | 'claim';
  const [decision, setDecision] = useState<'none' | 'approved' | 'rejected'>('none');
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<'waybill' | 'ticket'>('waybill');
  const [includedItems, setIncludedItems] = useState<Record<SettlementItem, boolean>>({
    basic: true, additional: true, exception: true, reimbursement: true, claim: true,
  });

  const toggleItem = (item: SettlementItem) => setIncludedItems((prev) => ({ ...prev, [item]: !prev[item] }));

  const itemTotals = {
    basic: SETTLEMENT_WAYBILLS.reduce((a, w) => a + w.basicAmount, 0),
    additional: SETTLEMENT_WAYBILLS.reduce((a, w) => a + w.additionalChargeItems.reduce((s, c) => s + c.amount, 0), 0),
    exception: SETTLEMENT_WAYBILLS.reduce((a, w) => a + w.exceptionFee, 0),
    reimbursement: SETTLEMENT_WAYBILLS.reduce((a, w) => a + w.reimbursement, 0),
  };
  const claimDeduction = SETTLEMENT_CLAIM_TICKETS.reduce((a, t) => a + t.claimAmount, 0);
  const waybillSubtotal =
    (includedItems.basic ? itemTotals.basic : 0) +
    (includedItems.additional ? itemTotals.additional : 0) +
    (includedItems.exception ? itemTotals.exception : 0) +
    (includedItems.reimbursement ? itemTotals.reimbursement : 0);
  const totalAmountPayable = waybillSubtotal - (includedItems.claim ? claimDeduction : 0);
  const unresolvedDiscrepancies = SETTLEMENT_WAYBILLS.filter((w) => w.hasDiscrepancy).length;

  return (
    <div>
      <BreadcrumbCase
        items={[
          { name: 'Advance Payment', path: PATHS.BILLING_ADVANCE_PAYMENT },
          { name: 'Settlement Review', path: PATHS.BILLING_ADVANCE_PAYMENT_DETAIL },
        ]}
      />
      <Card className={styles.detailCard} style={{ marginBottom: 16 }}>
        <span>{appNo} - <Tag color="blue">Settlement</Tag></span>
      </Card>

      {unresolvedDiscrepancies > 0 && decision === 'none' && (
        <Alert type="warning" message={<>This vendor has <strong>{unresolvedDiscrepancies}</strong> unresolved price discrepancies. Consider requesting the vendor to resolve via Price Modification first.</>} showIcon style={{ marginBottom: 16 }} />
      )}
      {decision === 'approved' && <Alert type="success" message="Request approved. Vendor Statement has been auto-generated." showIcon style={{ marginBottom: 16 }} />}
      {decision === 'rejected' && <Alert type="warning" message="Request rejected. Waybills released. Vendor has been notified with the reject reason." showIcon style={{ marginBottom: 16 }} />}

      {/* Request Summary */}
      <Card className={styles.detailCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Request Summary</div>
          <Tag color={decision === 'none' ? 'warning' : decision === 'approved' ? 'success' : 'error'}>{decision === 'none' ? 'Awaiting Comparison' : decision === 'approved' ? 'Approved' : 'Rejected'}</Tag>
        </div>
        <Descriptions bordered size="small" column={4}>
          <Descriptions.Item label="Request No."><strong>{appNo}</strong></Descriptions.Item>
          <Descriptions.Item label="Vendor">Coca-Cola Bottlers PH Inc.</Descriptions.Item>
          <Descriptions.Item label="Submitted">2026-04-16 17:10</Descriptions.Item>
          <Descriptions.Item label="Total Amount"><span style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary-color)' }}>{totalAmountPayable.toLocaleString()}</span></Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Communication Records */}
      <Card className={styles.detailCard}>
        <div className={styles.sectionTitle}>Communication Records</div>
        {COMMUNICATION_RECORDS.map((record) => (
          <div key={record.id} className={`${styles.communicationRecord} ${record.actor === 'TMS' ? styles.tms : styles.vendor}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Typography.Text strong>{record.actor === 'VP' ? 'Vendor' : 'TMS'} - {record.action}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{record.timestamp}</Typography.Text>
            </div>
            {record.note && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.note}</Typography.Text>}
          </div>
        ))}
      </Card>

      {/* Invoices */}
      <Card className={styles.detailCard}>
        <div className={styles.sectionTitle}>Invoices</div>
        <Table size="small" pagination={false} dataSource={SETTLEMENT_INVOICES} rowKey="invoiceNo" columns={[
          { title: 'Invoice No.', dataIndex: 'invoiceNo', render: (v: string) => <Button type="link" style={{ padding: 0 }}>{v}</Button> },
          { title: 'Invoice Amount', dataIndex: 'invoiceAmount', align: 'right' as const, render: (v: number) => <strong>{v.toLocaleString()}</strong> },
          { title: 'Invoice Date', dataIndex: 'invoiceDate' },
          { title: 'Attachment', dataIndex: 'attachmentName', render: (v: string) => <Button type="link" size="small" style={{ padding: 0 }}>{v}</Button> },
        ]} />
      </Card>

      {/* Proof */}
      <Card className={styles.detailCard}>
        <div className={styles.sectionTitle}>Proof (Supporting Documents)</div>
        <Table size="small" pagination={false} dataSource={SETTLEMENT_PROOFS} rowKey="id" columns={[
          { title: '#', width: 32, render: (_: any, __: any, i: number) => i + 1 },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Attachment', dataIndex: 'attachmentName', render: (v: string) => <Button type="link" size="small" style={{ padding: 0 }}>{v}</Button> },
        ]} />
      </Card>

      {/* Settlement Item Selection */}
      <Card className={styles.detailCard}>
        <div className={styles.sectionTitle}>Settlement Item Selection & Amount Breakdown</div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Check/uncheck items to include or exclude from this settlement.
        </Typography.Text>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {([
            ['basic', 'Basic Amount'],
            ['additional', 'Additional Charge'],
            ['exception', 'Exception Fee'],
            ['reimbursement', 'Reimbursement'],
            ['claim', 'Claim Deductions'],
          ] as [SettlementItem, string][]).map(([key, label]) => (
            <label key={key} className={`${styles.settlementItemToggle} ${includedItems[key] ? styles.included : ''}`}>
              <Checkbox checked={includedItems[key]} onChange={() => toggleItem(key)} />
              {label}
            </label>
          ))}
        </div>
        <div style={{ background: '#fafafa', borderRadius: 6, padding: 14, border: '1px solid #f0f0f0' }}>
          <div className={`${styles.breakdownRow} ${!includedItems.basic ? styles.excluded : ''}`}><span>Basic Amount</span><span>{itemTotals.basic.toLocaleString()}</span></div>
          <div className={`${styles.breakdownRow} ${!includedItems.additional ? styles.excluded : ''}`}><span>Additional Charge</span><span>{itemTotals.additional.toLocaleString()}</span></div>
          <div className={`${styles.breakdownRow} ${!includedItems.exception ? styles.excluded : ''}`}><span>Exception Fee</span><span>{itemTotals.exception.toLocaleString()}</span></div>
          <div className={`${styles.breakdownRow} ${!includedItems.reimbursement ? styles.excluded : ''}`}><span>Reimbursement</span><span>{itemTotals.reimbursement.toLocaleString()}</span></div>
          <div className={`${styles.breakdownRow} ${styles.subtotal}`}><span>Waybill Subtotal</span><span>{waybillSubtotal.toLocaleString()}</span></div>
          {claimDeduction > 0 && (
            <div className={`${styles.breakdownRow} ${!includedItems.claim ? styles.excluded : styles.deduction}`}><span>Claim Deductions</span><span>-{claimDeduction.toLocaleString()}</span></div>
          )}
          <div className={`${styles.breakdownRow} ${styles.total}`}><span>Total Amount Payable</span><span>{totalAmountPayable.toLocaleString()}</span></div>
        </div>
      </Card>

      {/* Waybill / Ticket tabs */}
      <Card className={styles.detailCard}>
        <div className={styles.tabBar}>
          <button className={`${styles.tabBtn} ${activeTab === 'waybill' ? styles.active : ''}`} onClick={() => setActiveTab('waybill')}>Waybill List ({SETTLEMENT_WAYBILLS.length})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'ticket' ? styles.active : ''}`} onClick={() => setActiveTab('ticket')}>Ticket List ({SETTLEMENT_CLAIM_TICKETS.length})</button>
        </div>
        {activeTab === 'waybill' && (
          <Table size="small" pagination={false} dataSource={SETTLEMENT_WAYBILLS} rowKey="no" columns={[
            { title: 'Waybill No.', dataIndex: 'no' },
            { title: 'Unloading Time', dataIndex: 'unloadingTime' },
            { title: 'Truck Type', dataIndex: 'truckType' },
            { title: 'Origin', dataIndex: 'origin' },
            { title: 'Destination', dataIndex: 'destination' },
            { title: 'Basic', dataIndex: 'basicAmount', align: 'right' as const, render: (v: number) => v.toLocaleString() },
            { title: 'Additional', align: 'right' as const, render: (_: any, r: SettlementWaybillRow) => r.additionalChargeItems.reduce((s, c) => s + c.amount, 0).toLocaleString() },
            { title: 'Exception', dataIndex: 'exceptionFee', align: 'right' as const, render: (v: number) => v.toLocaleString() },
            { title: 'Reimbursement', dataIndex: 'reimbursement', align: 'right' as const, render: (v: number) => v.toLocaleString() },
            { title: 'Notes', render: (_: any, r: SettlementWaybillRow) => r.hasDiscrepancy ? <Tag color="orange">Discrepancy</Tag> : null },
          ]} />
        )}
        {activeTab === 'ticket' && (
          <Table size="small" pagination={false} dataSource={SETTLEMENT_CLAIM_TICKETS} rowKey="ticketNo" columns={[
            { title: 'Ticket No.', dataIndex: 'ticketNo', render: (v: string) => <Button type="link" style={{ padding: 0 }}>{v}</Button> },
            { title: 'Claim Type (L1)', dataIndex: 'claimTypeL1' },
            { title: 'Claim Type (L2)', dataIndex: 'claimTypeL2' },
            { title: 'Related Waybill', dataIndex: 'relatedWaybill' },
            { title: 'Claim Amount', dataIndex: 'claimAmount', align: 'right' as const, render: (v: number) => <strong>{v.toLocaleString()}</strong> },
          ]} />
        )}
      </Card>

      {/* Review Decision */}
      {decision === 'none' && (
        <Card className={styles.detailCard}>
          <div className={styles.sectionTitle}>Review Decision</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Reject Reason (only if rejecting)</div>
            <Input.TextArea rows={3} placeholder="Explain the reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button danger disabled={!rejectReason.trim()} onClick={() => setDecision('rejected')}>Reject</Button>
            <Button type="primary" onClick={() => setDecision('approved')}>Approve & Auto-Generate Statement</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdvancePaymentDetail;
