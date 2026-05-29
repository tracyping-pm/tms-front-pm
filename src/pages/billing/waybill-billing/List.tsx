import React, { useEffect, useMemo, useState } from 'react';
import { history } from '@umijs/max';
import { Button, Alert } from 'antd';
import { ProColumns } from '@ant-design/pro-components';
import CustomTable from '@/components/CustomTable';
import { getAllApStatements } from '@/pages/vendor/common/apStatementSync';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import styles from './index.less';
import { WAYBILLS, type Waybill, type WaybillStatus } from './mock/tmsWaybills';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getAwaitingSettlementNos(): Set<string> {
  const stmts = getAllApStatements();
  const nos = new Set<string>();
  stmts.forEach((s) => {
    if (!s.returnedItems) return;
    Object.entries(s.returnedItems).forEach(([key, val]) => {
      if (val) nos.add(key.split(':')[0]);
    });
  });
  return nos;
}

function statusClassName(status: WaybillStatus): string {
  switch (status) {
    case 'Delivered': return styles.statusDelivered;
    case 'In Transit': return styles.statusInTransit;
    case 'Planning': return styles.statusPlanning;
    case 'Awaiting Settlement': return styles.statusAwaitingSettlement;
    default: return '';
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

const WaybillBillingList: React.FC = () => {
  const [showReturnedFilter, setShowReturnedFilter] = useState(false);
  const [storageVersion, setStorageVersion] = useState(0);

  // Re-derive on localStorage changes or window focus (cross-tab sync)
  useEffect(() => {
    const refresh = () => setStorageVersion((v) => v + 1);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // Merge static "Awaiting Settlement" waybills with those flagged by AP Statement sync
  const awaitingSettlementNos = useMemo(() => {
    const syncNos = getAwaitingSettlementNos();
    WAYBILLS.filter((w) => w.status === 'Awaiting Settlement').forEach((w) =>
      syncNos.add(w.no),
    );
    return syncNos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageVersion]);

  const effectiveStatus = (w: Waybill): WaybillStatus =>
    awaitingSettlementNos.has(w.no) ? 'Awaiting Settlement' : w.status;

  const dataSource = useMemo(
    () =>
      showReturnedFilter
        ? WAYBILLS.filter((w) => effectiveStatus(w) === 'Awaiting Settlement')
        : WAYBILLS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showReturnedFilter, awaitingSettlementNos],
  );

  const handleViewDetail = (waybillNo: string) => {
    history.push(`${PATHS.BILLING_WAYBILL_BILLING_DETAIL}?no=${waybillNo}`);
  };

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns: ProColumns<Waybill>[] = [
    {
      title: 'Waybill No.',
      dataIndex: 'no',
      width: 130,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Waybill Number' },
      render: (_, record) => {
        const isAwaiting = effectiveStatus(record) === 'Awaiting Settlement';
        return (
          <a
            style={{ fontWeight: isAwaiting ? 600 : 400 }}
            onClick={() => handleViewDetail(record.no)}
          >
            {record.no}
          </a>
        );
      },
    },
    {
      title: 'Financial Status',
      dataIndex: 'status',
      width: 170,
      valueType: 'select',
      valueEnum: {
        'Delivered': { text: 'Delivered' },
        'In Transit': { text: 'In Transit' },
        'Planning': { text: 'Planning' },
        'Awaiting Settlement': { text: 'Awaiting Settlement' },
      },
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Financial Status' },
      render: (_, record) => {
        const eff = effectiveStatus(record);
        return (
          <span className={`${styles.statusBadge} ${statusClassName(eff)}`}>
            {eff}
          </span>
        );
      },
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      width: 190,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Vendor' },
      render: (_, record) => <span style={{ fontSize: 13 }}>{record.vendor}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      width: 170,
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Customer' },
      render: (_, record) => <span style={{ fontSize: 13, color: '#555' }}>{record.customer}</span>,
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      width: 120,
      hideInSearch: true,
      render: (_, record) => <span style={{ fontSize: 13, color: '#555' }}>{record.truckType}</span>,
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      width: 210,
      hideInSearch: true,
      render: (_, record) => <span style={{ fontSize: 12, color: '#555' }}>{record.origin}</span>,
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      width: 190,
      hideInSearch: true,
      render: (_, record) => <span style={{ fontSize: 12, color: '#555' }}>{record.destination}</span>,
    },
    {
      title: 'Position Time',
      dataIndex: 'positionTime',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{record.positionTime}</span>
      ),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      width: 120,
      hideInSearch: true,
      render: (_, record) => <span style={{ fontSize: 12, color: '#666' }}>{record.deliveryDate}</span>,
    },
    {
      title: 'Linked Statement',
      dataIndex: 'linkedStatement',
      width: 160,
      hideInSearch: true,
      render: (_, record) =>
        record.linkedStatement ? (
          <span style={{ fontSize: 12, color: '#1677ff' }}>{record.linkedStatement}</span>
        ) : (
          <span style={{ fontSize: 12, color: '#bbb' }}>-</span>
        ),
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => handleViewDetail(record.no)}
        >
          Details
        </Button>
      ),
    },
  ];

  const toolBarRender = () => [
    <Button key="create" type="primary">Create Waybill</Button>,
    <Button key="batch" type="primary">Batch Create Waybills</Button>,
    <Button key="export-rev" type="primary">Export REV/Cost</Button>,
    <Button key="export-all">Export All Waybill</Button>,
    <Button key="update">Update Waybills</Button>,
    <Button
      key="returned"
      onClick={() => setShowReturnedFilter((v) => !v)}
      style={showReturnedFilter ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}}
    >
      {showReturnedFilter
        ? `Returned Settlement Item (${awaitingSettlementNos.size} awaiting)`
        : 'Returned Settlement Item'}
    </Button>,
  ];

  return (
    <>
      {showReturnedFilter && (
        <Alert
          type="warning"
          showIcon
          message={
            <>
              Showing waybills with <strong>Awaiting Settlement</strong> financial status. These contain
              settlement items returned from AP Statements and require re-billing.
            </>
          }
          style={{ marginBottom: 14 }}
        />
      )}
      <CustomTable
        rowKey="no"
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 1500 }}
        toolBarRender={toolBarRender}
        options={false}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
        onRow={(record) => ({
          style:
            effectiveStatus(record) === 'Awaiting Settlement'
              ? { background: '#fffbe6' }
              : {},
        })}
        locale={{ emptyText: 'No waybills found.' }}
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true }}
      />
    </>
  );
};

export default WaybillBillingList;
