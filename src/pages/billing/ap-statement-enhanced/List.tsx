import React, { useEffect, useMemo, useState } from 'react';
import { history } from '@umijs/max';
import { Button } from 'antd';
import { ProColumns } from '@ant-design/pro-components';
import CustomTable from '@/components/CustomTable';
import {
  getAllApStatements,
  formatApDateTime,
  type SyncedApStmtStatus,
} from '@/pages/vendor/common/apStatementSync';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import styles from './index.less';
import {
  SAMPLE_ROWS,
  type ApStatementRow,
  type ApStatementStatus,
} from './mock/apStatementData';

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: ApStatementStatus[] = [
  'Under Payment Preparation',
  'Awaiting Comparison',
  'Awaiting Rebill',
  'Pending Payment',
  'Paid',
  'Canceled',
];

const SETTLEMENT_ITEM_OPTIONS = [
  'Basic Amount',
  'Vendor Additional Charge',
  'Vendor Exception Fee',
  'Reimbursement Expense',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function toApStatus(s: SyncedApStmtStatus): ApStatementStatus {
  if (s === 'Awaiting Comparison') return 'Awaiting Comparison';
  return s as ApStatementStatus;
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

// ─── Component ─────────────────────────────────────────────────────────────────

const ApStatementEnhancedList: React.FC = () => {
  // React to VP-tab cross-tab sync events
  const [storageVer, setStorageVer] = useState(0);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'ap-statements-sync') setStorageVer((v) => v + 1);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const sampleNos = useMemo(() => new Set(SAMPLE_ROWS.map((r) => r.no)), []);

  // Rows from VP-submitted statements (deduplicated against SAMPLE)
  const syncedRows = useMemo((): ApStatementRow[] => {
    return getAllApStatements()
      .filter((s) => !sampleNos.has(s.no))
      .map((s) => {
        const firstActor = s.operationLogs?.[0]?.actor;
        const creator =
          s.source === 'Vendor Portal'
            ? s.vendorName
                .replace(
                  /\s+(Co\.|Corp\.|Inc\.|Logistics|Freight|Express|Lines).*$/i,
                  '',
                )
                .trim() || s.vendorName
            : firstActor && firstActor !== 'TMS User'
            ? firstActor
            : 'TMS User';
        return {
          no: s.no,
          source: s.source,
          vendorName: s.vendorName,
          settlementItems: (s.settlementItems || []) as string[],
          totalAmountPayable: s.totalVpAmount,
          currency: 'PHP',
          statementType: s.statementType,
          waybillCount: s.waybillCount,
          status: toApStatus(s.status),
          creator,
          createdAt: formatApDateTime(s.createdAt),
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageVer, sampleNos]);

  const allRows: ApStatementRow[] = [...syncedRows, ...SAMPLE_ROWS];

  const statusValueEnum = Object.fromEntries(
    STATUS_OPTIONS.map((s) => [s, { text: s }]),
  );

  const settlementItemValueEnum = Object.fromEntries(
    SETTLEMENT_ITEM_OPTIONS.map((s) => [s, { text: s }]),
  );

  const columns: ProColumns<ApStatementRow>[] = [
    {
      title: 'Statement No.',
      dataIndex: 'no',
      width: 160,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Statement Number' },
      render: (_, row) => (
        <a
          style={{ fontWeight: 600 }}
          onClick={() =>
            history.push(`${PATHS.BILLING_AP_STATEMENT_ENHANCED_DETAIL}/${row.no}`)
          }
        >
          {row.no}
        </a>
      ),
    },
    {
      title: 'Origin',
      dataIndex: 'source',
      width: 120,
      valueType: 'select',
      valueEnum: {
        'Vendor Portal': { text: 'Vendor Portal' },
        'Internal': { text: 'Internal' },
      },
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Origin' },
      render: (_, row) => (
        <span className={row.source === 'Vendor Portal' ? styles.originVP : styles.originInternal}>
          {row.source}
        </span>
      ),
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      width: 180,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Vendor Name' },
      render: (_, row) => <span style={{ fontSize: 13 }}>{row.vendorName}</span>,
    },
    {
      title: 'Settlement Item',
      dataIndex: 'settlementItems',
      width: 220,
      valueType: 'select',
      valueEnum: settlementItemValueEnum,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Settlement Item' },
      hideInTable: false,
      render: (_, row) =>
        row.settlementItems.length === 0 ? (
          <span style={{ color: '#bbb' }}>—</span>
        ) : (
          <span style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>
            {row.settlementItems.join(', ')}
          </span>
        ),
    },
    {
      title: 'Total Amount Payable',
      dataIndex: 'totalAmountPayable',
      width: 180,
      align: 'right',
      hideInSearch: true,
      render: (_, row) => (
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          {row.currency} {fmt(row.totalAmountPayable)}
        </span>
      ),
    },
    {
      title: 'Waybills',
      dataIndex: 'waybillCount',
      width: 90,
      align: 'center',
      hideInSearch: true,
      render: (_, row) =>
        row.waybillCount > 0 ? (
          <span style={{ fontSize: 13 }}>{row.waybillCount}</span>
        ) : (
          <span style={{ color: '#bbb' }}>—</span>
        ),
    },
    {
      title: 'Statement Type',
      dataIndex: 'statementType',
      width: 140,
      valueType: 'select',
      valueEnum: {
        'Standard': { text: 'Standard' },
        'Standalone': { text: 'Standalone' },
      },
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Statement Type' },
      render: (_, row) => (
        <span className={row.statementType === 'Standard' ? styles.typeStandard : styles.typeStandalone}>
          {row.statementType}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      valueType: 'select',
      valueEnum: statusValueEnum,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Status' },
      render: (_, row) => (
        <span className={`${styles.statusBadge} ${statusClassName(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      width: 140,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Creator' },
      render: (_, row) => <span style={{ fontSize: 13 }}>{row.creator}</span>,
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 170,
      hideInSearch: true,
      render: (_, row) => (
        <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{row.createdAt}</span>
      ),
    },
    {
      title: 'Operation',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, row) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() =>
            history.push(`${PATHS.BILLING_AP_STATEMENT_ENHANCED_DETAIL}/${row.no}`)
          }
        >
          Details
        </Button>
      ),
    },
  ];

  const toolBarRender = () => [
    <Button
      key="create"
      type="primary"
      onClick={() => history.push(PATHS.BILLING_AP_STATEMENT_ENHANCED_CREATE)}
    >
      + Create Statement
    </Button>,
  ];

  return (
    <CustomTable<ApStatementRow>
      rowKey="no"
      columns={columns}
      dataSource={allRows}
      scroll={{ x: 1500 }}
      toolBarRender={toolBarRender}
      options={false}
      manualRequest
      filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
        showTotal: (total: number) => `${total} Statement${total !== 1 ? 's' : ''}`,
      }}
    />
  );
};

export default ApStatementEnhancedList;
