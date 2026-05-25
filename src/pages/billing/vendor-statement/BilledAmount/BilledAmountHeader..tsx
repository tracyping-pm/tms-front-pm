import { getTruckTypeList } from '@/api/truck';
import { ITruckTypeListItem } from '@/api/types/truck';
import {
  FieldQueryHighlightTypeEnum,
  VendorStatementStatusEnum,
} from '@/enums';
import { Button, Col, Form, Input, message, Row, Select, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';

import {
  statementDetail,
  statementEditAmount,
  statementEditReimbursement,
} from '@/api/billing';
import {
  IStatementEditAmountPayload,
  IStatementQueryEditStatementWaybillPayload,
} from '@/api/types/billing';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Access, useAccess, useParams } from '@umijs/max';

import { PermissionEnum } from '@/enums/permission';
import {
  EVENT_BILLING_STATEMENT_WAYBILL_BILLED_AMOUNT_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_PROOF_CHECK_ID,
} from '../../components/event';
import styles from './common.less';
interface IProps {
  amountChangeData: IStatementEditAmountPayload[];
  amountReimbursementChangeData: IStatementEditAmountPayload[];
  onSearchHandle: (v?: IStatementQueryEditStatementWaybillPayload) => void;
  onGetEditStatusHandle: (v: boolean) => void;
  onGetEditReimbursementStatusHandle: (v: boolean) => void;
}

export default function BilledAmountHeader({
  amountChangeData,
  amountReimbursementChangeData,
  onSearchHandle,
  onGetEditStatusHandle,
  onGetEditReimbursementStatusHandle,
}: IProps) {
  const access = useAccess();
  const [form] = Form.useForm();
  const { id: statementId } = useParams();
  const { publish } = useContext(PubSubContext);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [editReimbursementStatus, setEditReimbursementStatus] =
    useState<boolean>(false);
  const [chargeLoading, setChargeLoading] = useState<boolean>(false);
  const [detailStatus, setDetailStatus] = useState<VendorStatementStatusEnum>();
  const [billingTruckTypeList, setBillingTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: { label: string; value: number }[] = [];
    if (res.code === 200) {
      list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    }

    setBillingTruckTypeList(list);
  };

  const onSearch = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const payload = {
      ...values,
      waybillNum: values?.waybillNumber?.name,
    };
    delete payload.waybillNumber;

    onSearchHandle?.(payload);
  };
  const onReset = () => {
    form.resetFields();
    onSearchHandle?.();
  };
  const onCancelHandle = () => {
    setEditStatus(false);
    onGetEditStatusHandle(false);
  };
  const onConfirmHandle = async () => {
    const proofCheck = amountChangeData.map(
      (item: IStatementEditAmountPayload) => {
        if (
          item.documentIds === undefined ||
          item.documentIds.length === 0 ||
          item.miscChgSaveReqs === undefined ||
          item.miscChgSaveReqs.length === 0
        ) {
          return item.id;
        }
        return null;
      },
    );

    const _proofCheck = proofCheck.filter((item: number | null) => item);
    if (_proofCheck.length) {
      publish(EVENT_BILLING_STATEMENT_WAYBILL_PROOF_CHECK_ID, _proofCheck);
    } else {
      const _amountChangeData = amountChangeData.map(
        (item: IStatementEditAmountPayload) => {
          return {
            id: item.id,
            basicAmount: item.basicAmount,
            paidInAdvance: item.paidInAdvance,
            regularPayments: item.regularPayments,
            additionalCharge: item.additionalCharge,
            exceptionFee: item.exceptionFee,
            miscellaneousCharge: item.miscellaneousCharge,
            miscChgSaveReqs: item.miscChgSaveReqs,
            documentIds: item.documentIds,
          };
        },
      );
      const payload: any = {
        statementId: statementId,
        reqList: _amountChangeData,
      };
      if (!_amountChangeData.length) {
        onCancelHandle();
        return;
      }
      setChargeLoading(true);
      const res = await statementEditAmount(payload);
      setChargeLoading(false);
      if (res.code === 200) {
        setEditStatus(false);
        onGetEditStatusHandle(false);
        message.success('Edit Successfully!');
        publish(EVENT_BILLING_STATEMENT_WAYBILL_BILLED_AMOUNT_RELOAD);
      }
    }
  };

  const onCancelReimbursementHandle = () => {
    setEditReimbursementStatus(false);
    onGetEditReimbursementStatusHandle(false);
  };

  const onConfirmReimbursementHandle = async () => {
    const proofCheck = amountReimbursementChangeData.map(
      (item: IStatementEditAmountPayload) => {
        if (
          item.documentIds === undefined ||
          item.documentIds.length === 0 ||
          item.miscChgSaveReqs === undefined ||
          item.miscChgSaveReqs.length === 0
        ) {
          return item.id;
        }
        return null;
      },
    );

    const _proofCheck = proofCheck.filter((item: number | null) => item);
    if (_proofCheck.length) {
      publish(EVENT_BILLING_STATEMENT_WAYBILL_PROOF_CHECK_ID, _proofCheck);
    } else {
      const _amountChangeData = amountReimbursementChangeData.map(
        (item: IStatementEditAmountPayload) => {
          return {
            id: item.id,
            reimbursementExpense: item.reimbursementExpense,
            miscChgSaveReqs: item.miscChgSaveReqs,
            documentIds: item.documentIds,
          };
        },
      );
      const payload: any = {
        statementId: statementId,
        reqList: _amountChangeData,
      };
      // console.log(payload);
      // return;
      if (!_amountChangeData.length) {
        onCancelHandle();
        return;
      }

      setChargeLoading(true);
      const res = await statementEditReimbursement(payload);
      setChargeLoading(false);
      if (res.code === 200) {
        setEditReimbursementStatus(false);
        onGetEditReimbursementStatusHandle(false);
        message.success('Edit Successfully!');
        publish(EVENT_BILLING_STATEMENT_WAYBILL_BILLED_AMOUNT_RELOAD);
      }
    }
  };

  const fetchDetail = async () => {
    const res = await statementDetail(+statementId!);

    if (res.code === 200) {
      setDetailStatus(res.data?.status as VendorStatementStatusEnum);
    }
  };

  useEffect(() => {
    fetchDetail();
    getTruckTypeListHandle();
  }, []);

  return (
    <>
      <div className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
          Back
        </Button>
        <Space size={16}>
          {editStatus ? (
            <Space>
              <Button onClick={onCancelHandle}>Cancel</Button>
              <Button
                type="primary"
                onClick={onConfirmHandle}
                loading={chargeLoading}
              >
                Confirm Charge
              </Button>
            </Space>
          ) : (
            <Access
              key="editAmount"
              accessible={
                access[
                  PermissionEnum
                    .VENDOR_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT_EDIT
                ]
              }
            >
              {[
                VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
                VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
                VendorStatementStatusEnum.AWAITING_REBILL,
              ].includes(detailStatus!) && !editReimbursementStatus ? (
                <Button
                  type="primary"
                  onClick={() => {
                    setEditStatus(true);
                    onGetEditStatusHandle(true);
                  }}
                >
                  Edit
                </Button>
              ) : null}
            </Access>
          )}

          {editReimbursementStatus ? (
            <Space>
              <Button onClick={onCancelReimbursementHandle}>Cancel</Button>
              <Button
                type="primary"
                onClick={onConfirmReimbursementHandle}
                loading={chargeLoading}
              >
                Confirm Reimbursement Expense
              </Button>
            </Space>
          ) : (
            <Access
              key="editReimbursementExpense"
              accessible={
                access[
                  PermissionEnum
                    .VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_REIMBURSEMENT_EXPENSE
                ]
              }
            >
              {[
                VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
                VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
                VendorStatementStatusEnum.AWAITING_REBILL,
              ].includes(detailStatus!) && !editStatus ? (
                <Button
                  type="primary"
                  onClick={() => {
                    setEditReimbursementStatus(true);
                    onGetEditReimbursementStatusHandle(true);
                  }}
                >
                  Edit Reimbursement Expense
                </Button>
              ) : null}
            </Access>
          )}
        </Space>
      </div>
      <Form
        name="edit-billed-amount-form"
        form={form}
        style={{ margin: '0 24px' }}
      >
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name={'waybillNumber'} label={null}>
              <FuzzySelector
                fieldProps={{ placeholder: 'Waybill Number' }}
                request={{
                  field: 'waybillNumber',
                  esDtoClass: ES_DTO_CLASS.WAYBILL,
                  type: FieldQueryHighlightTypeEnum.None,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name={'customerCode'} label={null}>
              <Input placeholder="Customer Code" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name={'truckTypeIdList'} label={null}>
              <Select
                style={{ width: '100%' }}
                mode="multiple"
                placeholder="Billing Truck Type"
                showSearch
                maxTagCount={1}
                filterOption={(input: string, option: any) => {
                  return option?.label
                    ?.toLowerCase()
                    .includes(input?.toLowerCase());
                }}
                options={billingTruckTypeList}
              />
            </Form.Item>
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={onSearch}>
                Search
              </Button>
              <Button onClick={onReset}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </>
  );
}
