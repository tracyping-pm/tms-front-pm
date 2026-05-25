import { IRefundDetail } from '@/api/types/claims';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import {
  PATHS,
  RefundStatusEnumText,
  RefundStatusEnumTextColor,
} from '@/constants';
import {
  CustomerStatementStatusEnumIconColor,
  CustomerStatementStatusEnumText,
  VendorStatementStatusEnumIconColor,
  VendorStatementStatusEnumText,
} from '@/enums';
import { openNewTag } from '@/utils/utils';
import { Badge, Col, Divider, Flex, Row, Typography } from 'antd';
import { FC } from 'react';
import ItemListView from './ItemListView';

const { Text } = Typography;

export interface IProps {
  detail?: IRefundDetail;
}

const DetailDescription: FC<IProps> = ({ detail }) => {
  if (!detail) return null;

  return (
    <>
      <Divider>Description</Divider>
      <ItemListView detail={detail} />
      <div
        style={{
          marginTop: '12px',
          border: '0.5px solid #f0f0f0',
          borderRight: 'none',
          borderBottom: 'none',
        }}
      >
        <Row>
          <Col span={12}>
            <ColCell
              label="Refund for Customer"
              value={
                <Badge
                  color={RefundStatusEnumTextColor[detail.customerRefundStatus]}
                  text={RefundStatusEnumText[detail.customerRefundStatus]}
                />
              }
            />
          </Col>
          <Col span={12}>
            <ColCell
              label="Linked AR Statement"
              value={() => {
                return (
                  <Flex gap={12}>
                    <Text
                      underline
                      style={{
                        color: 'var(--primary-color)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.BILLING_CUSTOMER_STATEMENT_DETAIL}/${detail.arStatementId}`,
                        );
                      }}
                    >
                      {detail.arStatementNumber}
                    </Text>
                    <Badge
                      color={
                        CustomerStatementStatusEnumIconColor[
                          detail.arStatementStatus
                        ]
                      }
                      text={
                        CustomerStatementStatusEnumText[
                          detail.arStatementStatus
                        ]
                      }
                    />
                  </Flex>
                );
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ColCell
              label="Deduction for Vendor"
              value={
                <Badge
                  color={RefundStatusEnumTextColor[detail.vendorRefundStatus]}
                  text={RefundStatusEnumText[detail.vendorRefundStatus]}
                />
              }
            />
          </Col>
          <Col span={12}>
            <ColCell
              label="Linked AP Statement"
              value={() => {
                return (
                  <Flex gap={12}>
                    <Text
                      underline
                      style={{
                        color: 'var(--primary-color)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.BILLING_VENDOR_STATEMENT_DETAIL}/${detail.apStatementId}`,
                        );
                      }}
                    >
                      {detail.apStatementNumber}
                    </Text>
                    <Badge
                      color={
                        VendorStatementStatusEnumIconColor[
                          detail.apStatementStatus
                        ]
                      }
                      text={
                        VendorStatementStatusEnumText[detail.apStatementStatus]
                      }
                    />
                  </Flex>
                );
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <ColCell
              label="Linked Claim Ticket"
              value={
                <Text
                  underline
                  style={{
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    openNewTag(
                      `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${detail.claimId}`,
                    )
                  }
                >
                  {detail.claimNumber}
                </Text>
              }
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default DetailDescription;
