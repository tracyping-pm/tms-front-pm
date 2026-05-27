import { useParams } from '@umijs/max';
import { Card, Descriptions } from 'antd';

export default function VPClaimTicketDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <Card title={`VP Claim Ticket Detail — #${id}`}>
      <Descriptions column={2}>
        <Descriptions.Item label="Ticket ID">{id}</Descriptions.Item>
        <Descriptions.Item label="Status">Pending</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
