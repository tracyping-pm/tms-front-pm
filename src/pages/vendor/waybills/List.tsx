import { ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Tag } from 'antd';
import { useRequest } from 'ahooks';
import CustomTable from '@/components/CustomTable';
import { request } from '@umijs/max';

interface VPWaybill {
  id: number;
  waybillNumber: string;
  projectId: number;
  vendorId: number;
  status: string;
  financialStatus: string;
  plateNumber: string;
  creationTime: string;
}

export default function VPWaybillList() {
  const { data, loading } = useRequest(() =>
    request('/api/waybill/list', { method: 'POST', data: { pageNum: 1, pageSize: 20 } }),
  );

  const list: VPWaybill[] = data?.data?.list ?? [];
  const total: number = data?.data?.total ?? 0;

  const columns: ProColumns<VPWaybill>[] = [
    { title: 'Waybill No.', dataIndex: 'waybillNumber', width: 160 },
    { title: 'Plate No.', dataIndex: 'plateNumber', width: 120 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Financial Status',
      dataIndex: 'financialStatus',
      width: 200,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    { title: 'Created At', dataIndex: 'creationTime', width: 180, render: (v) => v?.slice(0, 10) },
    {
      title: 'Action',
      width: 100,
      render: (_, r) => (
        <Button type="link" onClick={() => history.push(`/project/waybill/detail/${r.id}`)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CustomTable<VPWaybill>
        loading={loading}
        dataSource={list}
        columns={columns}
        pagination={{ total, pageSize: 20 }}
        rowKey="id"
      />
    </Card>
  );
}
