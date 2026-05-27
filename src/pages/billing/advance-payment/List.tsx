import CustomTable from '@/components/CustomTable';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import {
  getApplication,
  getTmsVisibleApplications,
  updateApplicationStatus,
  appendLog,
  upsertApplication,
  type SyncedApplication,
  type SyncedAppStatus,
} from '@/pages/vendor/common/prepaidApplicationSync';
import { history } from '@umijs/max';
import { ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Card, message, Select, Statistic, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import type { AppStatus, ListRow, Origin } from './mock/applicationData';
import { SAMPLE_LIST } from './mock/applicationData';

/** Map VP-synced status to the TMS-side display status. */
function mapSyncStatus(s: SyncedAppStatus): AppStatus {
  switch (s) {
    case 'Awaiting Confirmation':
    case 'Awaiting Inteluck Confirmation':
      return 'Awaiting Confirmation';
    case 'Sync Failed':
      return 'Sync Failed';
    case 'Pending Payment':
    case 'Pending Receipt':
      return 'Pending Payment';
    case 'Paid':
    case 'Collected':
      return 'Paid';
    case 'Rejected':
      return 'Rejected';
    case 'Payment Rejected':
    case 'Receipt Rejected':
      return 'Payment Rejected';
    default:
      return 'Awaiting Confirmation';
  }
}

function syncedToRow(s: SyncedApplication): ListRow {
  return {
    appNo: s.applicationNo,
    appType: s.appType,
    source: s.source,
    vendor: s.vendorName,
    waybillNos: s.waybills.map((w) => w.no),
    prepaidAmount: s.totalAmountPayable,
    vatAmount: 0,
    totalAmount: s.totalAmountPayable,
    currency: s.currency,
    submittedAt: (s.submittedAt || s.createdAt).slice(0, 16).replace('T', ' '),
    status: mapSyncStatus(s.status),
    rejectReason: s.rejectReason || s.hrRejectReason,
  };
}

function buildRfpApprovalDemo(no: string, vendor: string, waybillNo: string): SyncedApplication {
  const createdAt = no === 'PPA2604011' ? '2026-04-27T09:10:00.000Z' : '2026-04-27T09:25:00.000Z';
  return {
    applicationNo: no,
    vendorName: vendor,
    source: 'Vendor Portal',
    appType: 'Advance Payment Request',
    status: 'Awaiting Confirmation',
    taxMark: 'VAT-ex',
    currency: 'PHP',
    waybills: [{
      no: waybillNo,
      positionTime: '2026-04-26 09:00',
      unloadingTime: '2026-04-26 14:20',
      truckType: '10-Wheeler',
      origin: 'PH-NCR-Manila',
      destination: 'PH-Cavite-Imus / DC',
      prePaidAmount: no === 'PPA2604011' ? 14800 : 9600,
    }],
    claimTickets: [],
    paymentItems: [],
    deductionItems: [],
    totalAmountPayable: no === 'PPA2604011' ? 14800 : 9600,
    payeeType: 'External Vendor',
    payeeName: vendor,
    bankName: no === 'PPA2604011' ? 'BPI' : 'BDO',
    payeeAccount: no === 'PPA2604011' ? '1234-5678-90' : '5566-7788-99',
    bankProof: 'bank_certificate.pdf',
    proofFiles: ['advance_payment_request.pdf'],
    remark: no === 'PPA2604011'
      ? 'Demo: HR sync success after Approve and Create RFP.'
      : 'Demo: RFP sync failure after Confirm and Create RFP; status remains Awaiting Confirmation.',
    createdAt,
    submittedAt: createdAt,
    operationLogs: [
      { time: createdAt, actor: 'Vendor', action: 'Submitted', note: 'Awaiting Inteluck confirmation' },
    ],
  };
}

const STATUS_COLOR: Record<AppStatus, string> = {
  'Awaiting Confirmation': 'warning',
  'Pending Payment': 'processing',
  'Rejected': 'error',
  'Paid': 'success',
  'Sync Failed': 'magenta',
  'Payment Rejected': 'error',
};

const SOURCE_COLOR: Record<Origin, string> = {
  'Vendor Portal': 'green',
  'Internal': 'default',
};

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

const AdvancePaymentList: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [syncedRows, setSyncedRows] = useState<ListRow[]>(() =>
    getTmsVisibleApplications().map(syncedToRow),
  );

  useEffect(() => {
    if (!getApplication('PPA2604011')) {
      upsertApplication(buildRfpApprovalDemo('PPA2604011', 'Coca-Cola Bottlers PH Inc.', 'WB2604051'));
    }
    if (!getApplication('PPA2604012')) {
      upsertApplication(buildRfpApprovalDemo('PPA2604012', 'SMC Logistics', 'WB2604052'));
    }
    const refresh = () => setSyncedRows(getTmsVisibleApplications().map(syncedToRow));
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const handleRetrySync = useCallback((appNo: string) => {
    const now = new Date().toISOString();
    updateApplicationStatus(appNo, {
      status: 'Pending Payment',
      reviewedAt: now,
      rfpStatus: 'Created',
    });
    appendLog(appNo, { time: now, actor: 'TMS Reviewer', action: 'Retry Sync', note: 'HR sync succeeded - moved to Pending Payment' });
    setSyncedRows(getTmsVisibleApplications().map(syncedToRow));
    message.success('Sync retried successfully');
  }, []);

  const merged = useMemo(() => {
    const syncedNos = new Set(syncedRows.map((r) => r.appNo));
    const sampleFiltered = SAMPLE_LIST.filter((r) => !syncedNos.has(r.appNo));
    return [...syncedRows, ...sampleFiltered].filter((r) => r.appType === 'Advance Payment Request');
  }, [syncedRows]);

  const pendingCount = merged.filter((r) => r.status === 'Awaiting Confirmation').length;
  const approvedCount = merged.filter((r) => r.status === 'Pending Payment').length;
  const paidCount = merged.filter((r) => r.status === 'Paid').length;
  const vpCount = merged.filter((r) => r.source === 'Vendor Portal').length;

  const filtered = useMemo(() => {
    if (!filterStatus) return merged;
    return merged.filter((r) => r.status === filterStatus);
  }, [merged, filterStatus]);

  const columns: ProColumns<ListRow>[] = [
    {
      title: 'Request No.',
      dataIndex: 'appNo',
      width: 160,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Request No.' },
      render: (_, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => history.push(`${PATHS.BILLING_ADVANCE_PAYMENT_DETAIL}/${record.appNo}`)}
        >
          {record.appNo}
        </Button>
      ),
    },
    {
      title: 'Origin',
      dataIndex: 'source',
      width: 140,
      valueType: 'select',
      valueEnum: {
        'Vendor Portal': { text: 'Vendor Portal' },
        'Internal': { text: 'Internal' },
      },
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Origin' },
      render: (_, record) => (
        <Tag color={SOURCE_COLOR[record.source]}>{record.source}</Tag>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      width: 220,
      ellipsis: true,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Vendor' },
    },
    {
      title: 'Waybills',
      dataIndex: 'waybillNos',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ color: 'var(--character-title-65)' }}>
          {record.waybillNos.length > 0 ? `${record.waybillNos.length} waybill(s)` : '-'}
        </span>
      ),
    },
    {
      title: 'Advance Payment Amount',
      dataIndex: 'totalAmount',
      width: 200,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontWeight: 600 }}>{fmt(record.totalAmount)}</span>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ color: 'var(--character-title-65)', fontSize: 12 }}>{record.submittedAt}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 180,
      valueType: 'select',
      valueEnum: {
        'Awaiting Confirmation': { text: 'Awaiting Confirmation' },
        'Pending Payment': { text: 'Pending Payment' },
        'Rejected': { text: 'Rejected' },
        'Paid': { text: 'Paid' },
        'Sync Failed': { text: 'Sync Failed' },
        'Payment Rejected': { text: 'Payment Rejected' },
      },
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Status' },
      render: (_, record) => (
        <div>
          <Badge
            status={STATUS_COLOR[record.status] as any}
            text={record.status}
          />
          {record.status === 'Rejected' && record.rejectReason && (
            <Tooltip title={record.rejectReason}>
              <div style={{ fontSize: 11, color: '#cf1322', marginTop: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {record.rejectReason}
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'Sync Failed') {
          return (
            <Button type="primary" size="small" onClick={() => handleRetrySync(record.appNo)}>
              Retry Sync
            </Button>
          );
        }
        return (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => history.push(`${PATHS.BILLING_ADVANCE_PAYMENT_DETAIL}/${record.appNo}`)}
          >
            {record.status === 'Awaiting Confirmation' || record.status === 'Payment Rejected' ? 'Review' : 'Details'}
          </Button>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Button
      key="create"
      type="primary"
      onClick={() => history.push(PATHS.BILLING_ADVANCE_PAYMENT_CREATE)}
    >
      + Create Request
    </Button>,
  ];

  return (
    <>
      {/* KPI cards */}
      <div className={styles.kpiRow}>
        <div
          className={`${styles.kpiCard} ${filterStatus === '' ? styles.active : ''}`}
          onClick={() => setFilterStatus('')}
        >
          <div className={styles.kpiLabel}>Total Requests</div>
          <div className={styles.kpiValue}>{merged.length}</div>
        </div>
        <div
          className={`${styles.kpiCard} ${filterStatus === 'Awaiting Confirmation' ? styles.active : ''}`}
          onClick={() => setFilterStatus((s) => s === 'Awaiting Confirmation' ? '' : 'Awaiting Confirmation')}
        >
          <div className={styles.kpiLabel}>Awaiting Confirmation</div>
          <div className={`${styles.kpiValue} ${styles.orange}`}>{pendingCount}</div>
        </div>
        <div
          className={`${styles.kpiCard} ${filterStatus === 'Pending Payment' ? styles.active : ''}`}
          onClick={() => setFilterStatus((s) => s === 'Pending Payment' ? '' : 'Pending Payment')}
        >
          <div className={styles.kpiLabel}>Approved (HR Pending)</div>
          <div className={`${styles.kpiValue} ${styles.blue}`}>{approvedCount}</div>
        </div>
        <div
          className={`${styles.kpiCard} ${filterStatus === 'Paid' ? styles.active : ''}`}
          onClick={() => setFilterStatus((s) => s === 'Paid' ? '' : 'Paid')}
        >
          <div className={styles.kpiLabel}>Paid</div>
          <div className={`${styles.kpiValue} ${styles.green}`}>{paidCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>From Vendor Portal</div>
          <div className={styles.kpiValue}>{vpCount}</div>
        </div>
      </div>

      {/* Info alert */}
      <div className={styles.infoAlert}>
        <span>i</span>
        <span>
          Requests submitted from <strong>Vendor Portal</strong> appear here automatically.
          Upon <strong>Approve and Create RFP</strong>, the system creates the RFP and syncs the payment request to HR.
          Status updates to <Badge status="success" text="Paid" /> once HR releases the payment.
        </span>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        scroll={{ x: 1300 }}
        dataSource={filtered}
        rowKey="appNo"
        toolBarRender={toolBarRender}
        search={{
          defaultCollapsed: false,
          collapseRender: false,
        }}
        options={false}
        pagination={{
          showSizeChanger: true,
          pageSize: 20,
        }}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
    </>
  );
};

export default AdvancePaymentList;
