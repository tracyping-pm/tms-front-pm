import {
  IWaybillBaseInfoData,
  IWaybillBillingClaimData,
  IWaybillClaimLinkStatementData,
  IWaybillLinkedTicketItem,
} from '@/api/types/waybill';
import {
  waybillBillingClaim,
  waybillClaimLinkedTicket,
  waybillClaimStatement,
} from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import {
  CountryCurrencyEnumText,
  WaybillFinancialStatusEnum,
  WaybillStatusEnum,
} from '@/enums';
import { ClaimTicketTypeText } from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import ClaimTicketModal from '@/pages/project/ClaimTicket/components/ClaimTicket/components/ClaimTicketModal';
import { OPS_TYPE, StateContext } from '@/pages/waybill/WaybillDetail/store';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { formatAmountPercentage } from '@/utils/utils';
import { Access, useAccess, useModel, useParams } from '@umijs/max';
import { Col, Divider, Row, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import WaybillClaimLinkStatementModal from '../WaybillClaimLinkStatementModal';
import WaybillLinkTicketModal from '../WaybillLinkTicketModal';
import styles from './styles.less';

const { Text } = Typography;

export default function DetailClaimCard(props: { isStandardWaybill: boolean }) {
  const { isStandardWaybill } = props;
  const access = useAccess();
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const {
    waybillBasicInfo,
    refreshBilling,
  }: { waybillBasicInfo: IWaybillBaseInfoData; refreshBilling: boolean } =
    state;
  const { id: waybillId } = useParams();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const [loading, setLoading] = useState<boolean>(true);
  // statement
  const [linkedStatementModalOpen, setLinkedStatementModalOpen] =
    useState<boolean>(false);
  const [statementLoading, setStatementLoading] = useState<boolean>(false);
  const [statementList, setStatementList] = useState<
    IWaybillClaimLinkStatementData[]
  >([]);

  // linked Ticket
  const [linkedTicketModalOpen, setLinkedTicketModalOpen] = useState(false);
  const [linkedTicketLoading, setLinkedTicketLoading] =
    useState<boolean>(false);
  const [linkedTicketList, setLinkedTicketList] = useState<
    IWaybillLinkedTicketItem[]
  >([]);

  const [detail, setDetail] = useState<IWaybillBillingClaimData>(
    {} as IWaybillBillingClaimData,
  );
  const [createClaimTicketModalOpen, setCreateClaimTicketModalOpen] =
    useState<boolean>(false);

  const getDetail = async () => {
    setLoading(true);
    const res = await waybillBillingClaim(Number(waybillId)).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setDetail(res.data || {});
      dispatch({
        type: OPS_TYPE.CLAIM_INFO,
        payload: {
          data: res.data || {},
        },
      });
    }
  };

  useEffect(() => {
    getDetail();
  }, [refreshBilling]);

  const doStatement = async () => {
    setStatementLoading(true);
    const res = await waybillClaimStatement({
      id: Number(waybillId),
    }).finally(() => {
      setStatementLoading(false);
    });
    if (res.code === 200) {
      setStatementList(res?.data ?? []);
      setLinkedStatementModalOpen(true);
    }
  };

  const doTicket = async () => {
    setLinkedTicketLoading(true);
    const res = await waybillClaimLinkedTicket({
      id: Number(waybillId),
    }).finally(() => {
      setLinkedTicketLoading(false);
    });
    if (res.code === 200) {
      setLinkedTicketList(res?.data ?? []);
      setLinkedTicketModalOpen(true);
    }
  };

  const computeCount = (count: number) => {
    if (isStandardWaybill) {
      if (access[PermissionEnum.STANDARD_WAYBILL_CLAIM_VIEW_AMOUNT]) {
        return `${
          CountryCurrencyEnumText?.[countryId as number]
        } ${formatAmountPercentage(count)}`;
      } else {
        return '**';
      }
    } else {
      if (access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM_VIEW_AMOUNT]) {
        return `${
          CountryCurrencyEnumText?.[countryId as number]
        } ${formatAmountPercentage(count)}`;
      } else {
        return '**';
      }
    }
  };

  return (
    <>
      <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.CLAIM}>
        <DetailCard
          title="Claim"
          showEditBtn={false}
          extraBtn={
            <Space split={<Divider type="vertical" />}>
              <Access
                accessible={
                  isStandardWaybill
                    ? access[
                        PermissionEnum.STANDARD_WAYBILL_CLAIM_CREATE_TICKET
                      ]
                    : access[
                        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_CREATE_TICKET
                      ]
                }
              >
                {[
                  WaybillStatusEnum.PLANNING,
                  WaybillStatusEnum.PENDING,
                  WaybillStatusEnum.IN_TRANSIT,
                  WaybillStatusEnum.ABNORMAL,
                  WaybillStatusEnum.DELIVERED,
                ].includes(waybillBasicInfo?.status) ? (
                  <CustomStatusButton
                    noStyle
                    onClick={() => setCreateClaimTicketModalOpen(true)}
                  >
                    Create Claim Ticket
                  </CustomStatusButton>
                ) : null}
              </Access>

              <Access
                accessible={
                  isStandardWaybill
                    ? access[
                        PermissionEnum.STANDARD_WAYBILL_CLAIM_LINKED_TICKET
                      ]
                    : access[
                        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_LINKED_TICKET
                      ]
                }
              >
                <CustomStatusButton
                  noStyle
                  loading={linkedTicketLoading}
                  onClick={doTicket}
                >
                  Linked Ticket
                </CustomStatusButton>
              </Access>

              {![
                WaybillFinancialStatusEnum.NOT_STARTED,
                WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
              ].includes(waybillBasicInfo?.financialStatus) && (
                <div className={styles.extraBtn}>
                  <Access
                    accessible={
                      isStandardWaybill
                        ? access[
                            PermissionEnum
                              .STANDARD_WAYBILL_CLAIM_LINKED_STATEMENT
                          ]
                        : access[
                            PermissionEnum
                              .TEMPORARY_WAYBILL_CLAIM_LINKED_STATEMENT
                          ]
                    }
                  >
                    <CustomStatusButton
                      noStyle
                      onClick={doStatement}
                      loading={statementLoading}
                    >
                      Linked Statement
                    </CustomStatusButton>
                  </Access>
                </div>
              )}
            </Space>
          }
          loading={loading}
          child={
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                marginTop: '12px',
                border: '1px solid #d9d9d9',
              }}
            >
              <div className={styles.box}>
                {/* customer */}
                <div
                  className={styles.board}
                  style={{
                    borderRight:
                      detail.customerClaimList?.length >
                      detail.vendorClaimList?.length
                        ? '1px solid #d9d9d9'
                        : 'none',
                  }}
                >
                  <div>
                    <Row
                      className={`${styles.board_item_line} ${
                        styles.board_item_border
                      }`}
                    >
                      <Col span={12} className={styles.board_item_name_bold}>
                        Customer Claim
                      </Col>
                      <Col span={12} className={styles.board_item_num_bold}>
                        {computeCount(detail.customerClaimTotalAmount)}
                      </Col>
                    </Row>

                    {detail.customerClaimList?.map((c, index) => (
                      <Row className={styles.board_item_line} key={index}>
                        <Col span={12} className={styles.board_item_name}>
                          <Text type="secondary">
                            {ClaimTicketTypeText[c.ticketType]}:{' '}
                          </Text>
                          <Text>{c.claimType}</Text>
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(c.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
                {/* vendor */}
                <div
                  className={styles.board}
                  style={{
                    borderLeft:
                      detail.vendorClaimList?.length >=
                      detail.customerClaimList?.length
                        ? '1px solid #d9d9d9'
                        : 'none',
                  }}
                >
                  <div>
                    <Row
                      className={`${styles.board_item_line} ${
                        styles.board_item_border
                      }`}
                    >
                      <Col span={12} className={styles.board_item_name_bold}>
                        Vendor Claim
                      </Col>
                      <Col span={12} className={styles.board_item_num_bold}>
                        {computeCount(detail.vendorClaimTotalAmount)}
                      </Col>
                    </Row>

                    {detail.vendorClaimList?.map((c, index) => (
                      <Row className={styles.board_item_line} key={index}>
                        <Col span={12} className={styles.board_item_name}>
                          <Text type="secondary">
                            {ClaimTicketTypeText[c.ticketType]}:{' '}
                          </Text>

                          <Text>{c.claimType}</Text>
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(c.amount)}
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </div>
      <WaybillClaimLinkStatementModal
        open={linkedStatementModalOpen}
        list={statementList}
        onCancel={() => setLinkedStatementModalOpen(false)}
      />

      <WaybillLinkTicketModal
        open={linkedTicketModalOpen}
        list={linkedTicketList}
        onCancel={() => setLinkedTicketModalOpen(false)}
      />

      <ClaimTicketModal
        open={createClaimTicketModalOpen}
        waybillDetail={waybillBasicInfo}
        onCancel={() => setCreateClaimTicketModalOpen(false)}
        onSuccess={() => {
          setCreateClaimTicketModalOpen(false);
          dispatch({
            type: OPS_TYPE.REFRESH_BILLING,
            payload: {
              data: !refreshBilling,
            },
          });
        }}
      />
    </>
  );
}
