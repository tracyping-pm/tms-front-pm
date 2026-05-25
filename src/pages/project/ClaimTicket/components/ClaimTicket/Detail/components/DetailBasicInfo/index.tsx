import { IClaimDetail } from '@/api/types/claims';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import {
  ClaimTicketStatusEnumColor,
  ClaimTicketStatusEnumText,
} from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { openNewTag } from '@/utils/utils';
import { Access, useAccess } from '@umijs/max';
import { App, Badge, Button, Col, Flex, Row, Typography } from 'antd';
import { FC, useContext, useState } from 'react';
import ClaimTicketModal from '../../../components/ClaimTicketModal';
import { EventBus } from '../../eventBus';
import { showEditTicketInfo } from '../../permission';

const { Title, Text } = Typography;

export interface IProps {
  detail?: IClaimDetail;
}

const DetailBasicInfo: FC<IProps> = ({ detail }) => {
  const access = useAccess();
  const { modal } = App.useApp();
  const { publish } = useContext(PubSubContext);
  const [editClaimTicketModalOpen, setEditClaimTicketModalOpen] =
    useState(false);

  const onEdit = () => {
    if (detail && detail?.refundList?.length > 0) {
      modal.warning({
        title: 'The ticket cannot be edit directly. ',
        content: (
          <>
            <div>
              <Text>This ticket is associated Refund Ticket</Text>
            </div>
            <div>
              <Text>
                Please remove the association of this ticket from the refund
                ticket, and then try to edit it.
              </Text>
            </div>
            <div>
              {detail?.refundList?.map((item: any) => (
                <div key={item.id}>
                  <Text
                    underline
                    style={{
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      openNewTag(
                        `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${item.id}`,
                      );
                    }}
                  >
                    {item.ticketNumber}
                  </Text>
                </div>
              ))}
            </div>
          </>
        ),
      });
    } else {
      setEditClaimTicketModalOpen(true);
    }
  };

  if (!detail) return null;

  return (
    <>
      <Flex justify="space-between" style={{ padding: '8px 0', margin: 0 }}>
        <Title level={4} style={{ margin: 0 }}>
          {detail.ticketNumber}
        </Title>
        <Badge
          color={ClaimTicketStatusEnumColor[detail.ticketStatus]}
          text={ClaimTicketStatusEnumText[detail.ticketStatus]}
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
          <Access
            accessible={
              access[PermissionEnum.CLAIM_TICKET_DETAIL_EDIT_TICKET_INFO]
            }
          >
            <Button
              size="small"
              disabled={!showEditTicketInfo(detail)}
              onClick={onEdit}
            >
              Edit
            </Button>
          </Access>
        </Flex>
        <Row>
          <Col span={12}>
            <ColCell label="Claim Type" value={detail.claimType} />
          </Col>
          <Col span={12}>
            <ColCell label="Claimant" value={detail.claimantName} />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ColCell
              label="Responsible party"
              value={detail.responsiblePartyName}
            />
          </Col>
          <Col span={12}>
            <ColCell label="Affiliated Project" value={detail.projectName} />
          </Col>
        </Row>
      </div>
      <ClaimTicketModal
        open={editClaimTicketModalOpen}
        detail={detail}
        onCancel={() => setEditClaimTicketModalOpen(false)}
        onSuccess={() => {
          setEditClaimTicketModalOpen(false);
          publish(EventBus.EDIT_OC_STATUS_SUCCESS);
        }}
      />
    </>
  );
};

export default DetailBasicInfo;
