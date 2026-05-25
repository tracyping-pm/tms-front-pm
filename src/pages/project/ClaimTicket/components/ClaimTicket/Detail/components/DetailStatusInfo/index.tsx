import { IClaimDetail } from '@/api/types/claims';
import PubSubContext from '@/context/pubsub';
import { OCStatusEnumTextColor } from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess } from '@umijs/max';
import { Badge, Button, Flex, Space, Typography } from 'antd';
import { FC, useContext, useRef, useState } from 'react';
import { EventBus } from '../../eventBus';
import { showAddProof, showAddRemark, showOCStatus } from '../../permission';
import AddProofModal from './AddProofModal';
import AddRemarkModal from './AddRemarkModal';
import OcStatusModal from './OcStatusModal';
import Proof from './Proof';
import Remark from './Remark';

const { Title, Text } = Typography;

export interface IProps {
  detail?: IClaimDetail;
}

const DetailStatusInfo: FC<IProps> = ({ detail }) => {
  const access = useAccess();
  const { publish } = useContext(PubSubContext);
  const [addProofModalOpen, setAddProofModalOpen] = useState(false);
  const [addRemarkModalOpen, setAddRemarkModalOpen] = useState(false);
  const [editOcStatusModalOpen, setEditOcStatusModalOpen] = useState(false);

  const proofRef = useRef<any>(null);
  const remarkRef = useRef<any>(null);

  if (!detail) return null;

  return (
    <>
      <div
        style={{
          marginTop: '12px',
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
          <Title level={5} style={{ padding: '8px 0', margin: 0 }}></Title>
          <Space size={12}>
            <Access
              accessible={access[PermissionEnum.CLAIM_TICKET_DETAIL_ADD_PROOF]}
            >
              <Button
                size="small"
                disabled={!showAddProof(detail)}
                onClick={() => setAddProofModalOpen(true)}
              >
                Add Proof
              </Button>
            </Access>
            <Access
              accessible={access[PermissionEnum.CLAIM_TICKET_DETAIL_ADD_REMARK]}
            >
              <Button
                size="small"
                disabled={!showAddRemark(detail)}
                onClick={() => setAddRemarkModalOpen(true)}
              >
                Add Remark
              </Button>
            </Access>
            <Access
              accessible={
                access[PermissionEnum.CLAIM_TICKET_DETAIL_EDIT_OC_STATUS]
              }
            >
              <Button
                size="small"
                disabled={!showOCStatus(detail)}
                onClick={() => setEditOcStatusModalOpen(true)}
              >
                OC Status
              </Button>
            </Access>
          </Space>
        </Flex>
        <div
          style={{
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.02)',
            borderBottom: '1px dashed  #D9D9D9',
          }}
        >
          <div>
            <Text type="secondary">OC Status</Text>
          </div>
          <div>
            <Badge
              color={OCStatusEnumTextColor[detail.ocStatus]}
              text={detail.ocStatus}
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>
        <Proof detail={detail} ref={proofRef} />
        <Remark detail={detail} ref={remarkRef} />
      </div>
      <AddProofModal
        open={addProofModalOpen}
        detail={detail}
        onCancel={() => setAddProofModalOpen(false)}
        onSuccess={() => {
          setAddProofModalOpen(false);
          proofRef.current?.reload();
        }}
      />
      <AddRemarkModal
        open={addRemarkModalOpen}
        detail={detail}
        onCancel={() => setAddRemarkModalOpen(false)}
        onSuccess={() => {
          setAddRemarkModalOpen(false);
          remarkRef.current?.reload();
        }}
      />
      <OcStatusModal
        open={editOcStatusModalOpen}
        detail={detail}
        onCancel={() => setEditOcStatusModalOpen(false)}
        onSuccess={() => {
          setEditOcStatusModalOpen(false);
          publish(EventBus.EDIT_OC_STATUS_SUCCESS);
        }}
      />
    </>
  );
};

export default DetailStatusInfo;
