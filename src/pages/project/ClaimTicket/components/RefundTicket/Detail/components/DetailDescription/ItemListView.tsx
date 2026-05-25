import { IRefundDetail, IRefundDetailItem } from '@/api/types/claims';
import CountryIcon from '@/components/CountryIcon';
import PubSubContext from '@/context/pubsub';
import { CountryCurrencyEnumText } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount } from '@/utils/utils';
import { Access, useAccess, useModel } from '@umijs/max';
import { Button, Flex, Table, TableColumnsType, Typography } from 'antd';
import { FC, useContext, useState } from 'react';
import RefundTicketModal from '../../../components/RefundTicketModal';
import { EventBus } from '../../eventBus';
import { showEditTicketInfo } from '../../permission';

const { Text } = Typography;

export interface IProps {
  detail: IRefundDetail;
}

const ItemListView: FC<IProps> = ({ detail }) => {
  const access = useAccess();
  const { publish } = useContext(PubSubContext);
  const [editRefundTicketModalOpen, setEditRefundTicketModalOpen] =
    useState(false);
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;

  const columns: TableColumnsType<IRefundDetailItem> = [
    {
      title: 'Claim Details',
      dataIndex: 'claimItemDetail',
      key: 'claimItemDetail',
      ellipsis: true,
      render: (_, record) => record?.claimItemDetail,
    },
    {
      title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'claimItemAmount',
      key: 'claimItemAmount',
      ellipsis: true,
      render: (_, record) => record?.claimItemAmount,
    },
    {
      title: 'Refund Details',
      dataIndex: 'detail',
      key: 'detail',
      ellipsis: true,
      render: (_, record) => record?.detail,
    },
    {
      title: `Refund Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'amount',
      key: 'amount',
      ellipsis: true,
      render: (_, record) => record?.amount,
    },
  ];

  return (
    <>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 8 }}>
        <Flex gap={10}>
          <Text type="secondary">Total Refund Amount</Text>
          <span>
            <CountryIcon />
            {formatAmount(detail.totalAmount)}
          </span>
        </Flex>
        <Access
          accessible={
            access[PermissionEnum.REFUND_TICKET_DETAIL_EDIT_TICKET_INFO]
          }
        >
          <Button
            size="small"
            disabled={!showEditTicketInfo(detail)}
            onClick={() => setEditRefundTicketModalOpen(true)}
          >
            Edit
          </Button>
        </Access>
      </Flex>
      <Table<IRefundDetailItem>
        size="small"
        bordered
        columns={columns}
        dataSource={detail.itemList}
        pagination={false}
        scroll={{ x: 800, y: 300 }}
      />
      <RefundTicketModal
        open={editRefundTicketModalOpen}
        disabledLinkedClaim={true}
        detail={detail}
        onCancel={() => setEditRefundTicketModalOpen(false)}
        onSuccess={() => {
          setEditRefundTicketModalOpen(false);
          publish(EventBus.EDIT_OC_STATUS_SUCCESS);
        }}
      />
    </>
  );
};

export default ItemListView;
