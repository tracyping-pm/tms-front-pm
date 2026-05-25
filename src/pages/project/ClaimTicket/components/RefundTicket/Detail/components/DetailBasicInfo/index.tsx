import { IRefundDetail } from '@/api/types/claims';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import {
  RefundTicketStatusEnumColor,
  RefundTicketStatusEnumText,
} from '@/enums/claim';
import { Badge, Col, Flex, Row, Typography } from 'antd';
import { FC } from 'react';

const { Title } = Typography;

export interface IProps {
  detail?: IRefundDetail;
}

const DetailBasicInfo: FC<IProps> = ({ detail }) => {
  if (!detail) return null;

  return (
    <>
      <Flex justify="space-between" style={{ padding: '8px 0', margin: 0 }}>
        <Title level={4} style={{ margin: 0 }}>
          {detail.ticketNumber}
        </Title>
        <Badge
          color={RefundTicketStatusEnumColor[detail.ticketStatus]}
          text={RefundTicketStatusEnumText[detail.ticketStatus]}
          style={{ fontSize: '14px' }}
        />
      </Flex>

      <div
        style={{
          border: '0.5px solid #f0f0f0',
          borderRight: 'none',
          borderBottom: 'none',
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{
            height: '40px',
            lineHeight: '40px',
            margin: 0,
            padding: '0 12px',
            borderRight: '0.5px solid #f0f0f0',
            borderBottom: '0.5px solid #f0f0f0',
          }}
        >
          <Title level={5} style={{ padding: '8px 0', margin: 0 }}>
            Basic info.
          </Title>
        </Flex>
        <Row>
          <Col span={8}>
            <ColCell
              label="Refunding Party"
              value={detail.refundingPartyName}
            />
          </Col>
          <Col span={8}>
            <ColCell label="Payee" value={detail.payeeName} />
          </Col>
          <Col span={8}>
            <ColCell label="Affiliated Project" value={detail.projectName} />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default DetailBasicInfo;
