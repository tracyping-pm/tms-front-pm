import { IWaybillLinkedTicketItem } from '@/api/types/waybill';
import { PATHS } from '@/constants';
import { ClaimTicketTypeText, EnumClaimTicketType } from '@/enums/claim';
import { openNewTag } from '@/utils/utils';
import { Button, Modal, ModalProps, Table, TableColumnsType } from 'antd';

type IWaybillLinkTicketModal = ModalProps & {
  list: IWaybillLinkedTicketItem[];
  onClose?: () => void;
};

const WaybillLinkTicketModal = ({
  list = [],
  width = 500,
  onClose,
  ...restProps
}: IWaybillLinkTicketModal) => {
  const columns: TableColumnsType<IWaybillLinkedTicketItem> = [
    {
      title: 'Ticket Type',
      dataIndex: 'ticketType',
      key: 'ticketType',
      ellipsis: true,
      render: (_, record) => ClaimTicketTypeText[record?.ticketType],
    },
    {
      title: 'Ticket Number',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      ellipsis: true,
      render: (_, record) => (
        <Button
          color="primary"
          variant="link"
          style={{ padding: 0 }}
          onClick={() => {
            let path = `${PATHS.CLAIM_TICKET_LIST_DETAIL}`;
            if (record.ticketType === EnumClaimTicketType.CLAIM) {
              path = `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${record.ticketId}`;
            } else if (record.ticketType === EnumClaimTicketType.REFUND) {
              path = `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${record.ticketId}`;
            }

            openNewTag(path);
          }}
        >
          {record.ticketNumber}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Linked Ticket`}
        width={width}
        footer={false}
        destroyOnClose
        maskClosable={false}
        onCancel={() => onClose?.()}
        {...restProps}
      >
        <Table<IWaybillLinkedTicketItem>
          scroll={{ y: 500 }}
          columns={columns}
          dataSource={list}
          pagination={false}
          rowKey={(record) => record.ticketId}
          size="small"
        />
      </Modal>
    </>
  );
};

export default WaybillLinkTicketModal;
