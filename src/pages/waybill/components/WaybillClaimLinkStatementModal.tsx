import { IWaybillClaimLinkStatementData } from '@/api/types/waybill';
import { PATHS } from '@/constants';
import { ClaimTicketTypeText, EnumClaimTicketType } from '@/enums/claim';
import { openNewTag } from '@/utils/utils';
import { Button, Modal, ModalProps, Table, TableColumnsType } from 'antd';

type IWaybillClaimLinkStatementModal = ModalProps & {
  list: IWaybillClaimLinkStatementData[];
  onClose?: () => void;
};

const WaybillClaimLinkStatementModal = ({
  list = [],
  width = 800,
  onClose,
  ...restProps
}: IWaybillClaimLinkStatementModal) => {
  const columns: TableColumnsType<IWaybillClaimLinkStatementData> = [
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
    {
      title: 'AR Statement Number',
      dataIndex: 'arStatementNumber',
      key: 'arStatementNumber',
      ellipsis: true,
      render: (_, record) => {
        return record.arStatementId ? (
          <Button
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => {
              openNewTag(
                `${PATHS.BILLING_CUSTOMER_STATEMENT_DETAIL}/${record.arStatementId}`,
              );
            }}
          >
            {record.arStatementNumber}
          </Button>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'AP Statement Number',
      dataIndex: 'apStatementNumber',
      key: 'apStatementNumber',
      ellipsis: true,
      render: (_, record) => {
        return record.apStatementId ? (
          <Button
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => {
              openNewTag(
                `${PATHS.BILLING_VENDOR_STATEMENT_DETAIL}/${record.apStatementId}`,
              );
            }}
          >
            {record.apStatementNumber}
          </Button>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <>
      <Modal
        title={`Linked Statement`}
        width={width}
        footer={false}
        destroyOnClose
        maskClosable={false}
        onCancel={() => onClose?.()}
        {...restProps}
      >
        <Table<IWaybillClaimLinkStatementData>
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

export default WaybillClaimLinkStatementModal;
