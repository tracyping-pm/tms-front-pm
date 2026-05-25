import {
  IWaybillBaseInfoData,
  IWaybillLinkStatementData,
  IWaybillReimbursementData,
} from '@/api/types/waybill';
import {
  waybillReimbursement,
  waybillReimbursementStatement,
} from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import {
  BillingStatusEnumColor,
  BillingStatusText,
  CountryCurrencyEnumText,
  WaybillFinancialStatusEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { OPS_TYPE, StateContext } from '@/pages/waybill/WaybillDetail/store';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { formatAmountPercentage } from '@/utils/utils';
import { Access, useAccess, useModel, useParams } from '@umijs/max';
import { Badge, Col, Divider, Row } from 'antd';
import { useContext, useEffect, useState } from 'react';
import WaybillLinkStatementModal from '../WaybillLinkStatementModal';
import WaybillReimbursementModal from '../WaybillReimbursementModal';
import styles from './styles.less';

export default function DetailReimbursementCard(props: {
  isStandardWaybill: boolean;
}) {
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
  const [showStatement, setShowStatement] = useState<boolean>(false);
  const [showReimbursement, setShowReimbursement] = useState<boolean>(false);
  // statement
  const [statementLoading, setStatementLoading] = useState<boolean>(false);
  const [statementList, setStatementList] = useState<
    IWaybillLinkStatementData[]
  >([]);

  const [detail, setDetail] = useState<IWaybillReimbursementData>(
    {} as IWaybillReimbursementData,
  );

  const getDetail = async () => {
    setLoading(true);
    const res = await waybillReimbursement(Number(waybillId)).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDetail(res.data || {});
      dispatch({
        type: OPS_TYPE.REFRESH_BASIC_INFO,
        payload: {
          data: res.data || {},
        },
      });
    }
  };

  useEffect(() => {
    getDetail();
  }, [refreshBilling]);

  const doReimbursement = async () => {
    setShowReimbursement(true);
  };

  const doStatement = async () => {
    setStatementLoading(true);
    const res = await waybillReimbursementStatement({
      id: Number(waybillId),
    }).finally(() => {
      setStatementLoading(false);
    });
    if (res.code === 200) {
      setStatementList(res?.data ?? []);
      setShowStatement(true);
    }
  };

  const computeCount = (count: number) => {
    if (isStandardWaybill) {
      if (access[PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_VIEW_AMOUNT]) {
        return `${
          CountryCurrencyEnumText?.[countryId as number]
        } ${formatAmountPercentage(count)}`;
      } else {
        return '**';
      }
    } else {
      if (access[PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_VIEW_AMOUNT]) {
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
      <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.REIMBURSEMENT}>
        <DetailCard
          title="Reimbursement Expense"
          editCallback={doReimbursement}
          showEditBtn={
            ((isStandardWaybill
              ? access[
                  PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_STATUS_EDIT
                ]
              : access[
                  PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_STATUS_EDIT
                ]) ||
              (isStandardWaybill
                ? access[
                    PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_OBJECT_EDIT
                  ]
                : access[
                    PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_OBJECT_EDIT
                  ])) &&
            ![
              WaybillFinancialStatusEnum.SETTLED,
              WaybillFinancialStatusEnum.CLOSED,
            ].includes(waybillBasicInfo.financialStatus)
          }
          extraBtn={
            ![
              WaybillFinancialStatusEnum.NOT_STARTED,
              WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
            ].includes(waybillBasicInfo?.financialStatus) ? (
              <div className={styles.extraBtn}>
                <Access
                  accessible={
                    isStandardWaybill
                      ? access[
                          PermissionEnum
                            .STANDARD_WAYBILL_REIMBURSEMENT_LINKED_STATEMENT
                        ]
                      : access[
                          PermissionEnum
                            .TEMPORARY_WAYBILL_REIMBURSEMENT_LINKED_STATEMENT
                        ]
                  }
                >
                  <CustomStatusButton
                    className={styles.extraBtnItem}
                    onClick={doStatement}
                    loading={statementLoading}
                  >
                    Linked Statement
                  </CustomStatusButton>
                </Access>
                <Divider type="vertical" />
              </div>
            ) : (
              <div></div>
            )
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
                      detail.customerReimbExpenseList?.length >
                      detail.vendorReimbExpenseList?.length
                        ? '1px solid #d9d9d9'
                        : 'none',
                  }}
                >
                  <div>
                    <Row
                      className={`${styles.board_item_line} ${
                        detail.customerReimbExpenseList?.length
                          ? styles.board_item_border
                          : ''
                      }`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Customer Reimbursement
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              detail?.reimbExpenseReceivableStatus
                            ]
                          }
                          text={
                            BillingStatusText[
                              detail.reimbExpenseReceivableStatus
                            ]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.reimbExpenseReceivable as number)}
                      </Col>
                    </Row>

                    {detail.customerReimbExpenseList?.map((c) => (
                      <Row className={styles.board_item_line} key={c.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {c.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(c.amount as number)}
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
                      detail.vendorReimbExpenseList?.length >=
                      detail.customerReimbExpenseList?.length
                        ? '1px solid #d9d9d9'
                        : 'none',
                  }}
                >
                  <div>
                    <Row
                      className={`${styles.board_item_line} ${
                        detail.vendorReimbExpenseList?.length
                          ? styles.board_item_border
                          : ''
                      }`}
                    >
                      <Col span={8} className={styles.board_item_name_bold}>
                        Vendor Reimbursement
                      </Col>
                      <Col span={8} className={styles.board_item_status}>
                        <Badge
                          color={
                            BillingStatusEnumColor[
                              detail?.reimbExpensePayableStatus
                            ]
                          }
                          text={
                            BillingStatusText[detail.reimbExpensePayableStatus]
                          }
                          style={{ fontWeight: 'bold' }}
                        />
                      </Col>
                      <Col span={8} className={styles.board_item_num_bold}>
                        {computeCount(detail.reimbExpensePayable as number)}
                      </Col>
                    </Row>

                    {detail.vendorReimbExpenseList?.map((c) => (
                      <Row className={styles.board_item_line} key={c.id}>
                        <Col span={12} className={styles.board_item_name}>
                          {c.item}
                        </Col>
                        <Col span={12} className={styles.board_item_num}>
                          {computeCount(c.amount as number)}
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
      {!!showStatement ? (
        <WaybillLinkStatementModal
          list={statementList}
          hideModal={() => setShowStatement(false)}
        />
      ) : null}
      {showReimbursement ? (
        <WaybillReimbursementModal
          isStandardWaybill={isStandardWaybill}
          waybillStatus={waybillBasicInfo?.status}
          open={showReimbursement}
          detail={detail}
          financialStatus={waybillBasicInfo?.financialStatus}
          cancel={() => setShowReimbursement(false)}
          refresh={() => {
            getDetail();
          }}
        />
      ) : null}
    </>
  );
}
