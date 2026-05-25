import { ossGetPreviewUrl } from '@/api-uam/oss';
import { statementQueryEditStatementWaybill } from '@/api/billing';
import {
  IStatementEditAmountPayload,
  IStatementQueryEditStatementWaybillItem,
  IStatementQueryEditStatementWaybillPayload,
} from '@/api/types/billing';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import IframeModal, {
  IIFrameModalState,
  initialIframeModalState,
} from '@/components/IframeModal';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { splitFileName } from '@/components/OssUpload/constant';
import { IDocument } from '@/components/OssUpload/types';
import {
  BELONG_IMG_EXTS,
  DEFAULT_PAGINATION,
  LAYOUT_HEADER_HEIGHT,
} from '@/constants';
import PubSubContext from '@/context/pubsub';
import {
  AdditionalChargeStatusEnum,
  BasicAmountStatusEnum,
  CountryCurrencyEnumText,
  ExceptionFeeStatusEnum,
  PaidInAdvanceStatusEnum,
  ReimbursementExpenseStatusEnum,
} from '@/enums';
import { formatAmount } from '@/utils/utils';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { InputNumber, message, Popover, Spin } from 'antd';
import cls from 'classnames';
import { clone } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';

import { EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import { numberMinus, numberSum } from '@/utils/compute';
import {
  EVENT_BILLING_STATEMENT_WAYBILL_BILLED_AMOUNT_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_PROOF_CHECK_ID,
} from '../../components/event';
import styles from './common.less';
import DiscrepancyModal from './DiscrepancyModal';
interface IBilledAmountTable {
  searchData: IStatementQueryEditStatementWaybillPayload;
  editStatus: boolean;
  editReimbursementStatus: boolean;
  getAmountChargeData: (v: IStatementEditAmountPayload[]) => void;
  getAmountReimbursementChargeData: (v: IStatementEditAmountPayload[]) => void;
}

const BELONG_IMG_LIST = BELONG_IMG_EXTS.map((item) => item.split('.')[1]);
export default function BilledAmountTable({
  searchData,
  editStatus,
  editReimbursementStatus,
  getAmountChargeData,
  getAmountReimbursementChargeData,
}: IBilledAmountTable) {
  const { subscribe } = useContext(PubSubContext);
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;
  const { id: statementId } = useParams();
  const countryCurrency = CountryCurrencyEnumText[countryId as number];
  const [originData, setOriginData] =
    useState<PaginationResponse<IStatementQueryEditStatementWaybillItem[]>>(
      DEFAULT_PAGINATION,
    );

  const [amountChargeList, setAmountChargeList] = useState<
    IStatementEditAmountPayload[]
  >([]);
  const [discrepancyData, setDiscrepancyData] = useState<any>();
  const [discrepancyModalOpen, setDiscrepancyModalOpen] =
    useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isEditReimbursement, setIsEditReimbursement] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [noProofIds, setNoProofIds] = useState<number[]>([]);

  const [previewPendingId, setPreviewPendingId] = useState<number | string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [originImageSrc, setOriginImageSrc] = useState<string[]>([]);
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const formRef = useRef<ProFormInstance>();

  const getWaybillSource = async (
    prams: IStatementQueryEditStatementWaybillPayload,
  ) => {
    setLoading(true);
    const res = await statementQueryEditStatementWaybill(prams);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
    statementId: number;
  }) => {
    await getWaybillSource({
      ...searchData,
      ...params,
      statementId: +statementId!,
    });
  };

  const saveAmountChange = async (record: any, value: string, type: string) => {
    const newValue = Math.abs(+value) > 99999999.99 ? 99999999.99 : +value;
    if ((!newValue && newValue !== 0) || isNaN(newValue)) {
      return;
    }
    const list = clone(amountChargeList);
    const idx = list.findIndex((item) => item.id === record.id);
    const {
      id,
      // basicAmount,
      paidInAdvance,
      regularPayments,
      additionalCharge,
      exceptionFee,
      billAmount,
      reimbursementExpense,
      contractRevenue,
      miscellaneousCharge,
      miscellaneousCharges,
      documentIds,
      documentList,
    } = record;

    if (idx === -1) {
      let obj: IStatementEditAmountPayload = {
        id: id!,
        // basicAmount,
        paidInAdvance,
        regularPayments,
        additionalCharge,
        exceptionFee,
        billAmount,
        reimbursementExpense,
        contractRevenue,
        miscellaneousCharge,
        miscChgSaveReqs: miscellaneousCharges.map(
          (item: { itemName: any; amount: any }) => {
            return { itemName: item.itemName, amount: item.amount };
          },
        ),
        documentIds,
        documentList,
      };
      //@ts-ignore
      obj[type] = newValue;

      list.push(obj);
    } else {
      //@ts-ignore
      list[idx][type] = newValue;
    }
    setAmountChargeList(list);
    if (isEditReimbursement) {
      getAmountReimbursementChargeData(list);
    } else {
      getAmountChargeData(list);
    }
  };

  const onEditMiscellaneousModalConfirm = async (
    payload: IStatementEditAmountPayload,
  ) => {
    const list = clone(amountChargeList);
    const idx = list.findIndex((item) => item.id === discrepancyData.id);
    const {
      id,
      // basicAmount,
      paidInAdvance,
      regularPayments,
      additionalCharge,
      exceptionFee,
      miscellaneousCharge,
      miscChgSaveReqs,
      documentIds,
    } = discrepancyData;
    if (payload?.documentIds?.length > 0) {
      const _noProofIds = clone(noProofIds).filter((item) => item !== id);
      setNoProofIds(_noProofIds);
    }
    if (idx === -1) {
      let obj: any = {
        id: id!,
        // basicAmount,
        paidInAdvance,
        regularPayments,
        additionalCharge,
        exceptionFee,
        miscellaneousCharge,
        miscChgSaveReqs,
        documentIds,
      };
      obj.documentIds = payload.documentIds;
      obj.miscChgSaveReqs = payload.miscChgSaveReqs;
      obj.ossFileList = payload.ossFileList;

      list.push(obj);
    } else {
      list[idx].ossFileList = payload.ossFileList;
      list[idx].documentIds = payload.documentIds;
      list[idx].miscChgSaveReqs = payload.miscChgSaveReqs;
    }

    setAmountChargeList(list);

    if (isEditReimbursement) {
      console.log(list);
      getAmountReimbursementChargeData(list);
    } else {
      getAmountChargeData(list);
    }
    setDiscrepancyModalOpen(false);
  };

  const handlePreviewImg = async (documentId: number) => {
    setPreviewPendingId(documentId);
    const res = await ossGetPreviewUrl({ documentId }).finally(() => {
      setPreviewPendingId('');
    });
    if (res.code === 200) {
      setOriginImageSrc([res.data]);
      setPreviewVisible(true);
    }
  };

  const handlePreviewOssFile = async (documentId: number) => {
    setPreviewPendingId(documentId);
    const res = await ossGetPreviewUrl({ documentId }).finally(() => {
      setPreviewPendingId('');
    });
    if (res.code === 200) {
      setIframeModalState({
        url: res.data,
        open: true,
      });
    }
  };

  const onPreview = (item: IDocument) => {
    const { ext } = splitFileName(item.originalFileName);
    const isBelongImg = BELONG_IMG_LIST.includes(ext);
    if (isBelongImg) {
      handlePreviewImg(item.documentId);
    } else {
      handlePreviewOssFile(item.documentId);
    }
  };
  const countAmount = (record: any) => {
    const list = clone(amountChargeList);
    const obj = list.find((item) => item.id === record.id);

    let amount = 0;
    if (obj) {
      const paidInAdvance = [
        BasicAmountStatusEnum.NO_SETTLEMENT,
        BasicAmountStatusEnum.NO_VERIFIED,
        BasicAmountStatusEnum.BILLED,
        BasicAmountStatusEnum.ON_HOLD,
      ].includes(record?.paidInAdvanceStatus)
        ? 0
        : (obj?.paidInAdvance ?? 0);
      const regularPayments = [
        BasicAmountStatusEnum.NO_SETTLEMENT,
        BasicAmountStatusEnum.NO_VERIFIED,
        BasicAmountStatusEnum.BILLED,
        BasicAmountStatusEnum.ON_HOLD,
      ].includes(record?.regularPaymentsStatus)
        ? 0
        : (obj?.regularPayments ?? 0);
      const additionalCharge = [
        BasicAmountStatusEnum.NO_SETTLEMENT,
        BasicAmountStatusEnum.NO_VERIFIED,
        BasicAmountStatusEnum.BILLED,
        BasicAmountStatusEnum.ON_HOLD,
      ].includes(record?.additionalChargeStatus)
        ? 0
        : (obj?.additionalCharge ?? 0);
      const exceptionFee = [
        BasicAmountStatusEnum.NO_SETTLEMENT,
        BasicAmountStatusEnum.NO_VERIFIED,
        BasicAmountStatusEnum.BILLED,
        BasicAmountStatusEnum.ON_HOLD,
      ].includes(record?.exceptionFeeStatus)
        ? 0
        : (obj?.exceptionFee ?? 0);
      const miscellaneousCharge = obj?.miscellaneousCharge ?? 0;

      amount = +numberSum(
        [
          paidInAdvance,
          regularPayments,
          additionalCharge,
          exceptionFee,
          miscellaneousCharge,
        ],
        2,
      );
    }
    return !obj ? formatAmount(record?.billAmount) : formatAmount(amount);
  };

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      key: 'waybillNumber',
      ellipsis: { showTitle: false },
      fixed: 'left',
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.waybillNumber}>
            <div style={{ color: noProofIds.includes(record.id) ? 'red' : '' }}>
              {record.waybillNumber}
            </div>
          </CustomTooltip>
        );
      },
    },
    // {
    //   title: `Basic Amount Receivable(${countryCurrency})`,
    //   dataIndex: 'waybillBasicAmount',
    //   width: 200,
    //   hideInSearch: true,
    //   align: 'right',
    //   ellipsis: {
    //     showTitle: false,
    //   },
    //   render: (_, record) => {
    //     const { waybillBasicAmount, basicAmountStatus } = record;
    //     const content =
    //       !!waybillBasicAmount || waybillBasicAmount === 0 ? (
    //         <span className={cls(styles[basicAmountStatus])}>
    //           {formatAmount(waybillBasicAmount)}
    //         </span>
    //       ) : (
    //         ''
    //       );
    //     return (
    //       <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
    //         {content}
    //       </CustomTooltip>
    //     );
    //   },
    // },
    {
      title: `Paid In advance (${countryCurrency})`,
      dataIndex: 'waybillPaidInAdvance',
      width: 200,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { waybillPaidInAdvance, paidInAdvanceStatus } = record;
        const content =
          !!waybillPaidInAdvance || waybillPaidInAdvance === 0 ? (
            <span className={cls(styles[paidInAdvanceStatus])}>
              {formatAmount(waybillPaidInAdvance)}
            </span>
          ) : (
            ''
          );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Basic Amount Payable (Remaining)(${countryCurrency})`,
      dataIndex: 'waybillRegularPayments',
      width: 260,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { regularPaymentsStatus, waybillRegularPayments } = record;
        const content =
          !!waybillRegularPayments || waybillRegularPayments === 0 ? (
            <span className={cls(styles[regularPaymentsStatus])}>
              {formatAmount(waybillRegularPayments)}
            </span>
          ) : (
            ''
          );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Vendor Additional Charge(${countryCurrency})`,
      dataIndex: 'waybillAdditionalCharge',
      width: 260,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { waybillAdditionalCharge, additionalChargeStatus } = record;
        const content =
          !!waybillAdditionalCharge || waybillAdditionalCharge === 0 ? (
            <span className={cls(styles[additionalChargeStatus])}>
              {formatAmount(waybillAdditionalCharge)}
            </span>
          ) : (
            ''
          );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Vendor Exception Fee(${countryCurrency})`,
      dataIndex: 'waybillExceptionFee',
      width: 200,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { exceptionFeeStatus, waybillExceptionFee } = record;
        const content =
          !!waybillExceptionFee || waybillExceptionFee === 0 ? (
            <span className={cls(styles[exceptionFeeStatus])}>
              {formatAmount(waybillExceptionFee)}
            </span>
          ) : (
            ''
          );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Contract Cost (${countryCurrency})`,
      dataIndex: 'contractRevenue',
      width: 200,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { contractRevenue } = record;
        const content =
          !!contractRevenue || contractRevenue === 0 ? (
            <span>{formatAmount(contractRevenue)}</span>
          ) : (
            ''
          );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Reimbursement Expense(${countryCurrency})`,
      dataIndex: 'waybillReimbursementExpense',
      width: 200,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { waybillReimbursementExpense } = record;
        const content =
          !!waybillReimbursementExpense || waybillReimbursementExpense === 0 ? (
            <span>{formatAmount(waybillReimbursementExpense)}</span>
          ) : (
            ''
          );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },

    {
      title: `Actual Paid In advance (${countryCurrency})`,
      dataIndex: 'paidInAdvance',
      width: 260,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { paidInAdvance, paidInAdvanceChange, paidInAdvanceStatus } =
          record;
        const text =
          !paidInAdvance && paidInAdvance !== 0
            ? ''
            : formatAmount(paidInAdvance);
        const obj = amountChargeList?.find((item) => item.id === record.id);
        return isEdit &&
          ![
            PaidInAdvanceStatusEnum.NO_SETTLEMENT,
            PaidInAdvanceStatusEnum.NO_VERIFIED,
            PaidInAdvanceStatusEnum.BILLED,
            PaidInAdvanceStatusEnum.ON_HOLD,
          ].includes(paidInAdvanceStatus) ? (
          <div className={styles.editAmount}>
            <InputNumber
              defaultValue={paidInAdvance}
              value={obj?.paidInAdvance}
              style={{ width: 140 }}
              min={-99999999.99}
              max={99999999.99}
              precision={2}
              controls={false}
              onBlur={(event) => {
                saveAmountChange(record, event.target.value, 'paidInAdvance');
              }}
            />
          </div>
        ) : (
          <div>
            <CustomTooltip title={text} placement="top">
              <span style={{ color: paidInAdvanceChange ? '#1890ff' : '' }}>
                {text}
              </span>
            </CustomTooltip>
          </div>
        );
      },
    },

    {
      title: `Actual Basic Amount Payable (Remaining)(${countryCurrency})`,
      dataIndex: 'regularPayments',
      width: 310,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const {
          regularPayments,
          regularPaymentsChange,
          regularPaymentsStatus,
        } = record;
        const text =
          !regularPayments && regularPayments !== 0
            ? ''
            : formatAmount(regularPayments);
        const obj = amountChargeList?.find((item) => item.id === record.id);
        return isEdit &&
          ![
            BasicAmountStatusEnum.NO_SETTLEMENT,
            BasicAmountStatusEnum.NO_VERIFIED,
            BasicAmountStatusEnum.BILLED,
            BasicAmountStatusEnum.ON_HOLD,
          ].includes(regularPaymentsStatus) ? (
          <div className={styles.editAmount}>
            <InputNumber
              defaultValue={regularPayments}
              value={obj?.regularPayments}
              style={{ width: 140 }}
              min={-99999999.99}
              max={99999999.99}
              precision={2}
              controls={false}
              onBlur={(event) => {
                saveAmountChange(record, event.target.value, 'regularPayments');
              }}
            />
          </div>
        ) : (
          <div>
            <CustomTooltip title={text} placement="top">
              <span style={{ color: regularPaymentsChange ? '#1890ff' : '' }}>
                {text}
              </span>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: `Actual Vendor Additional Charge(${countryCurrency})`,
      dataIndex: 'additionalCharge',
      width: 290,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const {
          additionalCharge,
          additionalChargeChange,
          additionalChargeStatus,
        } = record;
        const text =
          !additionalCharge && additionalCharge !== 0
            ? ''
            : formatAmount(additionalCharge);
        const obj = amountChargeList?.find((item) => item.id === record.id);
        return isEdit &&
          ![
            AdditionalChargeStatusEnum.NO_SETTLEMENT,
            AdditionalChargeStatusEnum.NO_VERIFIED,
            AdditionalChargeStatusEnum.BILLED,
            AdditionalChargeStatusEnum.ON_HOLD,
          ].includes(additionalChargeStatus) ? (
          <div className={styles.editAmount}>
            <InputNumber
              defaultValue={additionalCharge}
              value={obj?.additionalCharge}
              style={{ width: 140 }}
              min={-99999999.99}
              max={99999999.99}
              precision={2}
              controls={false}
              onBlur={(event) => {
                saveAmountChange(
                  record,
                  event.target.value,
                  'additionalCharge',
                );
              }}
            />
          </div>
        ) : (
          <div>
            <CustomTooltip title={text} placement="top">
              <span style={{ color: additionalChargeChange ? '#1890ff' : '' }}>
                {text}
              </span>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: `Actual Vendor Exception Fee(${countryCurrency})`,
      dataIndex: 'exceptionFee',
      width: 270,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { exceptionFee, exceptionFeeChange, exceptionFeeStatus } = record;
        const text =
          !exceptionFee && exceptionFee !== 0 ? '' : formatAmount(exceptionFee);
        const obj = amountChargeList?.find((item) => item.id === record.id);
        return isEdit &&
          ![
            ExceptionFeeStatusEnum.NO_SETTLEMENT,
            ExceptionFeeStatusEnum.NO_VERIFIED,
            ExceptionFeeStatusEnum.BILLED,
            ExceptionFeeStatusEnum.ON_HOLD,
          ].includes(exceptionFeeStatus) ? (
          <div className={styles.editAmount}>
            <InputNumber
              defaultValue={exceptionFee}
              value={obj?.exceptionFee}
              style={{ width: 140 }}
              min={-99999999.99}
              max={99999999.99}
              precision={2}
              controls={false}
              onBlur={(event) => {
                saveAmountChange(record, event.target.value, 'exceptionFee');
              }}
            />
          </div>
        ) : (
          <div>
            <CustomTooltip title={text} placement="top">
              <span style={{ color: exceptionFeeChange ? '#1890ff' : '' }}>
                {text}
              </span>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: `Miscellaneous Charge(${countryCurrency})`,
      dataIndex: 'miscellaneousCharge',
      width: 200,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { miscellaneousCharge, miscellaneousChargeChange } = record;
        const text =
          !miscellaneousCharge && miscellaneousCharge !== 0
            ? ''
            : formatAmount(miscellaneousCharge);
        const obj = amountChargeList?.find((item) => item.id === record.id);
        return isEdit ? (
          <div className={styles.editAmount}>
            <InputNumber
              defaultValue={miscellaneousCharge}
              value={obj?.miscellaneousCharge}
              style={{ width: 140 }}
              min={-99999999.99}
              max={99999999.99}
              precision={2}
              controls={false}
              onBlur={(event) => {
                saveAmountChange(
                  record,
                  event.target.value,
                  'miscellaneousCharge',
                );
              }}
            />
          </div>
        ) : (
          <div>
            <CustomTooltip title={text} placement="top">
              <span
                style={{ color: miscellaneousChargeChange ? '#1890ff' : '' }}
              >
                {text}
              </span>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: `Billed Amount (VAT-ex) (${countryCurrency})`,
      dataIndex: 'billAmount',
      width: 200,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { billAmount } = record;
        const text =
          !billAmount && billAmount !== 0 ? '' : formatAmount(billAmount);

        return (
          <CustomTooltip title={text}>
            <span>{isEdit ? countAmount(record) : text}</span>
          </CustomTooltip>
        );
      },
    },
    {
      title: `Actual Reimbursement Expense (${countryCurrency})`,
      dataIndex: 'reimbursementExpense',
      width: 250,
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const {
          reimbursementExpense,
          reimbursementExpenseChange,
          reimbursementExpenseStatus,
        } = record;
        const text =
          !reimbursementExpense && reimbursementExpense !== 0
            ? ''
            : formatAmount(reimbursementExpense);
        const obj = amountChargeList?.find((item) => item.id === record.id);
        return isEditReimbursement &&
          ![
            ReimbursementExpenseStatusEnum.NO_SETTLEMENT,
            ReimbursementExpenseStatusEnum.NO_VERIFIED,
            ReimbursementExpenseStatusEnum.BILLED,
            ReimbursementExpenseStatusEnum.ON_HOLD,
          ].includes(reimbursementExpenseStatus) ? (
          <div className={styles.editAmount}>
            <InputNumber
              defaultValue={reimbursementExpense}
              value={obj?.reimbursementExpense}
              style={{ width: 140 }}
              min={-99999999.99}
              max={99999999.99}
              precision={2}
              controls={false}
              onBlur={(event) => {
                saveAmountChange(
                  record,
                  event.target.value,
                  'reimbursementExpense',
                );
              }}
            />
          </div>
        ) : (
          <div>
            <CustomTooltip title={text} placement="top">
              <span
                style={{ color: reimbursementExpenseChange ? '#1890ff' : '' }}
              >
                {text}
              </span>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: `Discrepancy items and corresponding amounts`,
      dataIndex: 'documentList',
      width: 380,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const _obj = clone(amountChargeList)?.find((item) => {
          return item.id === record.id;
        });
        const miscellaneousCharges =
          _obj?.miscChgSaveReqs ?? record.miscellaneousCharges;
        const documentList = _obj?.ossFileList ?? record.documentList;
        const content = (miscellaneousLen: number, documentListLen: number) => {
          return miscellaneousCharges?.length > 0 ||
            documentList?.length > 0 ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', width: 340 }}
              // className={`${isEdit ? styles.tdHover : ''}`}
            >
              {miscellaneousCharges
                .slice(0, miscellaneousLen)
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    className={cls(
                      miscellaneousCharges?.length === miscellaneousLen
                        ? ''
                        : 'ellipsis',
                    )}
                  >
                    {item.itemName}：{item.amount}
                  </div>
                ))}

              {documentList.slice(0, documentListLen).map((item: any) => {
                return (
                  <Spin
                    key={item.id}
                    spinning={previewPendingId === item.documentId}
                  >
                    <div
                      onClick={() => {
                        if (isEdit || isEditReimbursement) return;
                        onPreview(item);
                      }}
                      className={styles.proofItem}
                    >
                      <div style={{ width: 50 }}>Proof:&nbsp;</div>
                      <div
                        className={cls(
                          styles.proofUrl,
                          documentList?.length === documentListLen
                            ? ''
                            : 'ellipsis',
                        )}
                      >
                        {item?.fileName}
                      </div>
                    </div>
                  </Spin>
                );
              })}
            </div>
          ) : (
            <div
              className={`${isEdit || isEditReimbursement ? styles.tdHover : ''}`}
            >
              -
            </div>
          );
        };
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
            onClick={(e) => {
              if (!isEdit && !isEditReimbursement) return;
              const o =
                amountChargeList.find((i) => i.id === record.id) ?? record;
              setDiscrepancyModalOpen(true);
              setDiscrepancyData(o);
              e.stopPropagation();
            }}
          >
            <CustomTooltip
              rootClassName={styles.customToolZIndex}
              title={content(
                miscellaneousCharges?.length,
                documentList?.length,
              )}
            >
              {content(3, 3)}
            </CustomTooltip>
            {(isEdit || isEditReimbursement) && (
              <EditOutlined className={cls(styles.iconItemEdit)} />
            )}
          </div>
        );
      },
    },
  ];

  const tableExtraRender = () => {
    return (
      <div className={styles.tableDescribe}>
        <div>
          <Popover
            title={null}
            placement="left"
            content={
              <>
                <div className={styles.tableDescribe_notes}>
                  Item has been linked to other statements：
                  <span className={styles.billed}>0.00</span>
                </div>
                <div className={styles.tableDescribe_notes}>
                  Non-settlement Items：
                  <span className={styles.noSettlement}>0.00</span>
                </div>

                <div className={styles.tableDescribe_notes}>
                  Edited amount：
                  <span className={styles.tableDescribe_edited}>0.00</span>
                </div>

                <div className={styles.tableDescribe_notes}>
                  On Hold/Pending Items：
                  <span className={styles.noVerified}>0.00</span>
                </div>
              </>
            }
          >
            <span className={styles.tableDescribe_total}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Notes
            </span>
          </Popover>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const payload = {
      ...searchData,
      pageNum: 1,
      pageSize: 20,
      statementId: +statementId!,
    };
    getWaybillSource(payload);
  }, [searchData]);

  useEffect(() => {
    setIsEdit(editStatus);
    setIsEditReimbursement(editReimbursementStatus);
    if (!editStatus || !editReimbursementStatus) {
      setAmountChargeList([]);
      getAmountChargeData([]);
      setNoProofIds([]);
    }
  }, [editStatus, editReimbursementStatus]);

  useEffect(() => {
    const unsubscribe = subscribe(
      EVENT_BILLING_STATEMENT_WAYBILL_PROOF_CHECK_ID,
      (v) => {
        if (v.length) {
          message.error(
            'The price has been updated. Please provide the corresponding proof.',
          );
        }
        setNoProofIds(v);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(
      EVENT_BILLING_STATEMENT_WAYBILL_BILLED_AMOUNT_RELOAD,
      () => {
        const payload = {
          ...searchData,
          pageNum: 1,
          pageSize: 20,
          statementId: +statementId!,
        };
        getWaybillSource(payload);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <CustomTable
        className={'billedAmountTable'}
        columns={columns}
        scroll={{ x: 2000 }}
        formRef={formRef}
        dataSource={originData.list}
        fixedSpin={false}
        form={{
          name: 'billed-amount-table-list',
        }}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({
              pageNum: page,
              pageSize: pageSize,
              statementId: +statementId!,
            });
          },
        }}
        search={false}
        loading={loading}
        //@ts-ignore
        toolBarRender={tableExtraRender}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />

      {discrepancyModalOpen && (
        <DiscrepancyModal
          open={discrepancyModalOpen}
          list={
            discrepancyData.miscChgSaveReqs ??
            discrepancyData.miscellaneousCharges
          }
          materialList={
            discrepancyData.ossFileList ?? discrepancyData.documentList
          }
          discrepancyAmount={
            +numberMinus(
              discrepancyData.billAmount,
              discrepancyData.contractRevenue,
            )
          }
          onConfirm={(v) => {
            onEditMiscellaneousModalConfirm(v);
          }}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setDiscrepancyModalOpen(false);
            },
          }}
        />
      )}

      <ImagePreviewGroup
        visible={previewVisible}
        items={originImageSrc!}
        index={0}
        onClose={() => setPreviewVisible(false)}
      />
      <IframeModal
        url={iframeModalState.url}
        open={iframeModalState.open}
        onCancel={() => setIframeModalState({ open: false })}
      />
    </>
  );
}
