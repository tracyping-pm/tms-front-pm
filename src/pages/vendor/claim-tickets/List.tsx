import { ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Tag } from 'antd';
import { useRequest } from 'ahooks';
import CustomTable from '@/components/CustomTable';
import { request } from '@umijs/max';

interface ClaimTicket {
  id: number;
  ticketNumber: string;
  type: string;
  waybillNumber: string;
  vendorName: string;
  status: string;
  amount: number;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  Pending: 'orange',
  Confirmed: 'green',
  Completed: 'cyan',
  Cancelled: 'default',
};

export default function VPClaimTicketList() {
  const { data, loading } = useRequest(() =>
    request('/api/claim/list', { method: 'POST', data: { pageNum: 1, pageSize: 20 } }),
  );

  const list: ClaimTicket[] = data?.data?.list ?? [];
  const total: number = data?.data?.total ?? 0;

  const columns: ProColumns<ClaimTicket>[] = [
    { title: 'Ticket No.', dataIndex: 'ticketNumber', width: 160 },
    { title: 'Type', dataIndex: 'type', width: 100 },
    { title: 'Waybill No.', dataIndex: 'waybillNumber', width: 160 },
    { title: 'Vendor', dataIndex: 'vendorName', width: 200 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, r) => <Tag color={statusColor[r.status] ?? 'default'}>{r.status}</Tag>,
    },
    {
      title: 'Amount (PHP)',
      dataIndex: 'amount',
      width: 140,
      render: (v) => v?.toLocaleString(),
    },
    { title: 'Created At', dataIndex: 'createdAt', width: 180, render: (v) => v?.slice(0, 10) },
    {
      title: 'Action',
      width: 100,
      render: (_, r) => (
        <Button type="link" onClick={() => history.push(`/vendor/claim-tickets/detail/${r.id}`)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CustomTable<ClaimTicket>
        loading={loading}
        dataSource={list}
        columns={columns}
        pagination={{ total, pageSize: 20 }}
        rowKey="id"
      />
    </Card>
  );
}
