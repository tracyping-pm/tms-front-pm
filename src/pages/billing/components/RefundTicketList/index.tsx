import { statementClaimTicketList, statementRemoveClaim } from '@/api/billing';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import {
  CURRENCY_SYMBOL,
  DEFAULT_PAGINATION,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
  RefundTicketStatusEnum,
} from '@/constants';
import {
  CountryMapEnum,
  CurrencyNameEnum,
  CustomerStatementStatusEnum,
  VendorStatementStatusEnum,
} from '@/enums';
import {
  EnumClaimTicketType,
  RefundTicketStatusEnumColor,
  RefundTicketStatusEnumText,
} from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { openNewTag } from '@/utils/utils';
import { ProColumns } from '@ant-design/pro-components';
import { Access, useAccess, useModel, useParams } from '@umijs/max';
import { Badge, Button, Popconfirm } from 'antd';
import cls from 'classnames';
import { useEffect, useState } from 'react';
import AddRefundTicketModal from './AddRefundTicketModal';
import styles from './index.less';

const RefundTicketList = ({
  statementType,
  statementStatus,
}: {
  statementType: string;
  statementStatus: CustomerStatementStatusEnum | VendorStatementStatusEnum;
}) => {
  const access = useAccess();
  const { id: statementId } = useParams();

  const { initialState: userInfo } = useModel('@@initialState');

  const countryId = userInfo?.currentUser?.countryId;
  const isTH = countryId === CountryMapEnum.Thailand;
  const currencySymbol = isTH
    ? CURRENCY_SYMBOL[CurrencyNameEnum.BAHT]
    : CURRENCY_SYMBOL[CurrencyNameEnum.PESO];

  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [addTicketModalOpen, setAddTicketModalOpen] = useState<boolean>(false);

  const getDataSource = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    let payload: {
      pageNum: number;
      pageSize: number;
      arStatementId?: number;
      apStatementId?: number;
      claimTicketType: EnumClaimTicketType;
    } = {
      pageNum: params?.pageNum ?? 1,
      pageSize: params?.pageSize ?? 20,
      claimTicketType: EnumClaimTicketType.REFUND,
    };
    if (statementType === 'AR') {
      payload = { ...payload, arStatementId: Number(statementId) };
    } else {
      payload = { ...payload, apStatementId: Number(statementId) };
    }
    setLoading(true);
    const res = await statementClaimTicketList(payload).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onRemoveTicket = async (refundId: number) => {
    const res = await statementRemoveClaim({
      statementId: Number(statementId),
      claimIds: [refundId],
    });

    if (res.code === 200) {
      getDataSource({ pageNum: 1, pageSize: 20 });
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Ticket Number',
      dataIndex: 'ticketNumber',
      ellipsis: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.ticketNumber}>
            {access[PermissionEnum.REFUND_TICKET_DETAIL] ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  openNewTag(
                    `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${record.id}`,
                  );
                }}
              >
                {record.ticketNumber}
              </Button>
            ) : (
              record.ticketNumber
            )}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Claimant',
      dataIndex: 'claimantName',
      ellipsis: true,
      hideInTable: statementType === 'AR',
      render: (_, record) => {
        const { claimantName } = record;
        return (
          <CustomTooltip title={claimantName}>{claimantName}</CustomTooltip>
        );
      },
    },
    {
      title: 'Claim Type',
      dataIndex: 'claimType',
      ellipsis: true,
      render: (_, record) => {
        const { claimType } = record;
        return <CustomTooltip title={claimType}>{claimType}</CustomTooltip>;
      },
    },
    {
      title: `Amount (${currencySymbol})`,
      align: 'right',
      dataIndex: 'totalAmount',
      ellipsis: true,
      render: (_, record) => {
        const { totalAmount } = record;
        return <CustomTooltip title={totalAmount}>{totalAmount}</CustomTooltip>;
      },
    },
    {
      title: 'Responsible Party',
      dataIndex: 'responsiblePartyName',
      ellipsis: true,
      hideInTable: statementType === 'AP',
      render: (_, record) => {
        const { responsiblePartyName } = record;
        return (
          <CustomTooltip title={responsiblePartyName}>
            {responsiblePartyName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Deduction for Customer',
      dataIndex: 'customerDeductionStatus',
      ellipsis: true,
      hideInTable: statementType === 'AR',
      render: (_, record) => {
        const { customerDeductionStatus } = record;
        return (
          <CustomTooltip title={customerDeductionStatus}>
            {customerDeductionStatus}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Deduction for Vendor',
      dataIndex: 'vendorDeductionStatus',
      ellipsis: true,
      hideInTable: statementType === 'AP',
      render: (_, record) => {
        const { vendorDeductionStatus } = record;
        return (
          <CustomTooltip title={vendorDeductionStatus}>
            {vendorDeductionStatus}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      ellipsis: true,
      render: (_, record) => {
        const { creatorName } = record;
        return <CustomTooltip title={creatorName}>{creatorName}</CustomTooltip>;
      },
    },
    {
      title: 'Ticket Status',
      dataIndex: 'ticketStatus',
      ellipsis: true,
      render: (_, record) => {
        const status: RefundTicketStatusEnum = record.ticketStatus;
        const Content = (
          <Badge
            color={RefundTicketStatusEnumColor[status]}
            text={RefundTicketStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      ellipsis: {
        showTitle: false,
      },
      hideInTable:
        ![
          CustomerStatementStatusEnum.UNDER_BILLING_PREP,
          CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
          CustomerStatementStatusEnum.AWAITING_REBILL,
        ].includes(statementStatus as CustomerStatementStatusEnum) &&
        ![
          VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
          VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
          VendorStatementStatusEnum.AWAITING_REBILL,
        ].includes(statementStatus as VendorStatementStatusEnum) &&
        (statementType === 'AR'
          ? !access[
              PermissionEnum
                .CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE
            ]
          : !access[
              PermissionEnum
                .VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE
            ]),
      render: (_, record) => {
        return (
          <Access
            key="editChargeHistory"
            accessible={
              statementType === 'AR'
                ? access[
                    PermissionEnum
                      .CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE
                  ]
                : access[
                    PermissionEnum
                      .VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE
                  ]
            }
          >
            <Popconfirm
              title={`Whether to remove the selected ticket`}
              onConfirm={() => onRemoveTicket(record.id)}
              placement="left"
              okText="Yes"
              cancelText="No"
            >
              <CustomStatusButton noStyle>Remove Ticket</CustomStatusButton>
            </Popconfirm>
          </Access>
        );
      },
    },
  ];

  useEffect(() => {
    getDataSource({ pageNum: 1, pageSize: 20 });
  }, []);

  const toolBarRender = () => [
    <Button
      key="create"
      type="primary"
      onClick={() => {
        setAddTicketModalOpen(true);
      }}
    >
      Add Ticket
    </Button>,
  ];

  return (
    <div className={cls(styles.statementClaimsTicket)}>
      <CustomTable
        columns={columns}
        scroll={{ x: 1000 }}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            getDataSource({ pageNum: page, pageSize: pageSize });
          },
        }}
        fixedSpin={false}
        loading={loading}
        toolBarRender={
          ([
            CustomerStatementStatusEnum.UNDER_BILLING_PREP,
            CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
            CustomerStatementStatusEnum.AWAITING_REBILL,
          ].includes(statementStatus as CustomerStatementStatusEnum) ||
            [
              VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
              VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
              VendorStatementStatusEnum.AWAITING_REBILL,
            ].includes(statementStatus as VendorStatementStatusEnum)) &&
          (statementType === 'AR'
            ? access[
                PermissionEnum
                  .CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_ADD
              ]
            : access[
                PermissionEnum
                  .VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_ADD
              ])
            ? toolBarRender
            : false
        }
        search={false}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {addTicketModalOpen ? (
        <AddRefundTicketModal
          open={addTicketModalOpen}
          statementType={statementType}
          onCancel={() => setAddTicketModalOpen(false)}
          onRefresh={() => {
            getDataSource({
              pageNum: 1,
              pageSize: 20,
            });
          }}
        />
      ) : null}
    </div>
  );
};

export default RefundTicketList;
