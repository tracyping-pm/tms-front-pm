import {
  queryStatementWaybill,
  statementInvoiceNumberList,
  statementInvoiceWaybillSave,
  statementInvoiceWaybillSaveAll,
  statementQueryWaybill,
} from '@/api/billing';
import { getTruckTypeList } from '@/api/truck';
import {
  IBillingCustomerStatementDetail,
  IMiscellaneousChargeList,
  IStatementQueryWaybillReq,
  IStatementWaybillRecord,
} from '@/api/types/billing';
import { ITruckTypeListItem } from '@/api/types/truck';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import {
  BILLING_DETAIL_ANCHOR_ID_MAP,
  DEFAULT_PAGINATION,
  PATHS,
} from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
  AdditionalChargeStatusEnum,
  BasicAmountStatusEnum,
  CountryCurrencyEnumText,
  CountryMapEnum,
  CustomerStatementStatusEnum,
  StatementGetTaxRateEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { aggregateToJsonArray } from '@/pages/waybill/components/DetailInformationCard';
import { formatAmount, openNewTag } from '@/utils/utils';
import {
  BarsOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess, useModel, useParams } from '@umijs/max';
import {
  App,
  Button,
  Empty,
  Popconfirm,
  Popover,
  Select,
  Space,
  Tooltip,
} from 'antd';
import cls from 'classnames';
import { clone } from 'lodash';
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS,
  EVENT_BILLING_STATEMENT_WAYBILL_INVOICE_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_RELOAD,
} from '../../event';
import TaxRateModal from '../../TaxRateModal';
import WaybillMiscellaneousProofModal from '../WaybillMiscellaneousProofModal';
import styles from './index.less';

interface IDetailWaybillListCard {
  detail?: IBillingCustomerStatementDetail;
  isCreatePage?: boolean;
  manual?: boolean;
  extraPayload?: IStatementQueryWaybillReq;
  onGetSelectItem?: (data: {
    ids: number[];
    options: IStatementWaybillRecord[];
  }) => void;
  ref?: any;
}

const DetailWaybillListCard = forwardRef(
  (
    {
      detail,
      isCreatePage = true,
      manual = false,
      extraPayload = { pageNum: 1, pageSize: 20 },
      onGetSelectItem,
    }: IDetailWaybillListCard,
    ref,
  ) => {
    const { message } = App.useApp();
    const { publish, subscribe } = useContext(PubSubContext);

    const access = useAccess();
    const { initialState } = useModel('@@initialState');
    const { id: statementId } = useParams();
    const countryId = initialState?.currentUser?.countryId;
    const isTH = countryId === CountryMapEnum.Thailand;
    const countryCurrency = CountryCurrencyEnumText[countryId as number];
    const [originData, setOriginData] =
      useState<PaginationResponse<IStatementWaybillRecord>>(DEFAULT_PAGINATION);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAmountEditStatus, setIsAmountEditStatus] =
      useState<boolean>(false);
    const [isEditInvoiceNumber, setIsEditInvoiceNumber] =
      useState<boolean>(false);
    const [isEditMiscellaneous, setIsEditMiscellaneous] =
      useState<boolean>(false);
    const [editMiscellaneousProofOpen, setEditMiscellaneousProofOpen] =
      useState<boolean>(false);

    const [confirmInvoiceLoading, setConfirmInvoiceLoading] =
      useState<boolean>(false);
    const [confirmAllInvoiceLoading, setConfirmAllInvoiceLoading] =
      useState<boolean>(false);
    const [isEditTaxRateOpen, setIsEditTaxRateOpen] = useState<boolean>(false);
    const [editTaxRateWaybillData, setEditTaxRateWaybillData] = useState<{
      taxRateType: StatementGetTaxRateEnum;
      waybillId: number;
    }>();

    const [miscellaneousChargeList, setMiscellaneousChargeList] = useState<
      IMiscellaneousChargeList[]
    >([]);
    const [invoiceNumberList, setInvoiceNumberList] = useState<
      { id: number; invoiceNumberId?: number | number[] }[]
    >([]);
    const [invoiceNumberOptions, setInvoiceNumberOptions] = useState<
      { label: string; value: number; statementInvoiceId: number }[]
    >([]);
    const [billingTruckTypeList, setBillingTruckTypeList] = useState<
      { label: string; value: number }[]
    >([]);
    const [tableSelect, setTableSelect] = useState<{ ids: []; options: [] }>({
      ids: [],
      options: [],
    });
    const [tablePageNumber, setTablePageNumber] = useState<number>(1);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

    const formRef = useRef<ProFormInstance>();
    const isEditStatusRef = useRef<boolean>(false);

    const getDataSource = async (params: IStatementQueryWaybillReq) => {
      const payload = { ...extraPayload, ...params };
      setTablePageNumber(payload?.pageNum ?? 1);
      setLoading(true);
      const res = isCreatePage
        ? await statementQueryWaybill(payload)
        : await queryStatementWaybill(payload);
      setLoading(false);
      const data = res?.data;
      if (res.code === 200) {
        setOriginData(data);
        if (!isEditStatusRef.current) {
          setIsAmountEditStatus(false);
        }
      }
    };
    const getInvoiceNumberList = async () => {
      const res = await statementInvoiceNumberList(+statementId!);
      const data = res?.data ?? [];
      if (res.code === 200) {
        const list = data.map((item) => {
          return {
            label: item.invoiceNumber,
            value: item.statementInvoiceNumberId!,
            statementInvoiceId: item.statementInvoiceId,
          };
        });
        setInvoiceNumberOptions(list);
      }
    };

    const onSubmit = (params?: any) => {
      const payload = {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 20,
        waybillNum: params?.waybillNumber,
        customerCode: params?.customerCode,
        invoiceNumber: params?.invoiceNumbers,
        truckTypeIdList: params?.truckTypeName,
        statementId: +statementId!,
      };
      getDataSource(payload);
    };

    const onReset = () => {
      formRef.current?.resetFields();
    };

    const saveEditInvoiceNumber = async (
      record: IStatementWaybillRecord,
      value?: number | number[],
    ) => {
      const { id } = record;
      const list = clone(invoiceNumberList);
      const idx = list.findIndex((item) => item.id === id);

      if (idx === -1) {
        let obj: { id: number; invoiceNumberId?: number | number[] } = {
          id: id!,
          invoiceNumberId: value ?? [],
        };
        list.push(obj);
      } else {
        list[idx].invoiceNumberId = value ?? [];
      }
      setInvoiceNumberList(list);
    };
    // 获取选择数据
    const getSelectItem = (values: { ids: []; options: [] }) => {
      onGetSelectItem?.(values);
      setTableSelect(values);
    };

    const scrollToColumn = (columnIndex: number) => {
      const tableScrollContainer = document.querySelector(
        '.ant-pro-table .ant-table-body',
      ) as HTMLDivElement;
      if (tableScrollContainer) {
        const table = tableScrollContainer;
        const columnCells = table.querySelectorAll(
          `.ant-table-cell:nth-child(${columnIndex + 1})`,
        );
        if (columnCells.length > 0) {
          const targetCell = columnCells[0] as HTMLElement;

          table.scrollTo({
            left: targetCell.offsetLeft,
            behavior: 'smooth',
          });
        }
      }
    };

    const onCancelEditStatus = () => {
      setIsAmountEditStatus(false);
      isEditStatusRef.current = false;
      setIsEditMiscellaneous(false);
      setMiscellaneousChargeList([]);
      setIsEditInvoiceNumber(false);
      setInvoiceNumberList([]);
      publish(EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS, false);
    };

    const tableExtraRender = () => {
      return (
        <>
          <div className={styles.tableDescribe}>
            <div>
              <span className={styles.tableDescribe_total}>
                {originData?.total}
              </span>
              waybills total
              {isCreatePage && !!tableSelect?.ids?.length && (
                <>
                  ,
                  <span className={styles.tableDescribe_total}>
                    {tableSelect?.ids?.length}
                  </span>
                  waybills selected
                </>
              )}
            </div>

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
                    {!isCreatePage && (
                      <div className={styles.tableDescribe_notes}>
                        Edited amount：
                        <span className={styles.tableDescribe_edited}>
                          0.00
                        </span>
                      </div>
                    )}
                    <div className={styles.tableDescribe_notes}>
                      On Hold/Pending Items：
                      <span className={styles.noVerified}>0.00</span>
                    </div>
                    <div className={styles.tableDescribe_notes}>
                      Billed Amount (VAT-in) = Billed Amount (VAT-ex)+VAT
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
        </>
      );
    };

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

    const onInvoiceNumberHandle = async () => {
      if (isEditInvoiceNumber) {
        if (invoiceNumberList.length) {
          const list = invoiceNumberList.map((item) => {
            return {
              statementWaybillId: item.id,
              statementInvoiceNumberIds:
                typeof item.invoiceNumberId === 'number'
                  ? [item.invoiceNumberId]
                  : item.invoiceNumberId!,
            };
          });
          const payload = {
            statementId: +statementId!,
            list,
          };
          setConfirmInvoiceLoading(true);
          const res = await statementInvoiceWaybillSave(payload);
          setConfirmInvoiceLoading(false);
          if (res.code === 200) {
            message.success('edit invoice Number successfully');
            publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
            onSubmit();
          }
        }
        setIsEditInvoiceNumber(false);
        setInvoiceNumberList([]);
        publish(EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS, false);
      } else {
        scrollToColumn(9);
        setIsEditInvoiceNumber(true);
        publish(EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS, true);
      }
    };

    const onFillInAllInvoiceNumberHandle = async () => {
      setIsEditInvoiceNumber(false);
      publish(EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS, false);
      if (!invoiceNumberOptions?.length) {
        setConfirmAllInvoiceLoading(false);
        message.warning('There is no invoice number available to fill in. ');
        return;
      }

      setConfirmAllInvoiceLoading(true);
      const res = await statementInvoiceWaybillSaveAll(+statementId!);
      setConfirmAllInvoiceLoading(false);
      if (res.code === 200) {
        message.success('fill in all invoice Number successfully');
        publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
        onSubmit();
      }
    };

    const columns: ProColumns[] = [
      {
        title: 'Waybill Number',
        dataIndex: 'waybillNumber',
        width: 160,
        order: 7,
        ellipsis: {
          showTitle: false,
        },
        formItemProps: {
          label: null,
          style: {
            width: `${DEFAULT_WIDTH}px`,
          },
        },
        fieldProps: {
          placeholder: 'Waybill Number',
        },
        render: (_, record) => {
          return (
            <CustomTooltip title={record.waybillNumber}>
              {record.waybillNumber}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Customer Code',
        dataIndex: 'customerCode',
        width: 270,
        order: 6,
        ellipsis: {
          showTitle: false,
        },
        formItemProps: {
          label: null,
          style: {
            width: `${DEFAULT_WIDTH}px`,
          },
        },
        fieldProps: {
          placeholder: 'Customer Code',
        },
        render(_, record) {
          const list = aggregateToJsonArray(record.customerCodeVos);
          const customerCode =
            list.reduce((acc, cur, index) => {
              const curStr = !!cur.numbers
                ? `${cur.customerCodeType}:${cur.numbers}`
                : '';
              return `${acc}${index !== 0 && curStr && acc ? ',' : ''}${curStr}`;
            }, '') || '';

          return (
            <CustomTooltip
              title={customerCode}
              rootClassName={styles.customerCodePopover}
            >
              {customerCode}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Position Time',
        dataIndex: 'positionTime',
        width: 170,
        ellipsis: {
          showTitle: false,
        },
        hideInSearch: true,
        render: (_, record) => (
          <CustomTooltip title={record.positionTime}>
            {record.positionTime}
          </CustomTooltip>
        ),
      },
      {
        title: 'Unloading Time',
        dataIndex: 'unloadingTime',
        width: 170,
        order: 2,
        ellipsis: {
          showTitle: false,
        },
        hideInSearch: true,
        render: (_, record) => (
          <CustomTooltip title={record.unloadingTime}>
            {record.unloadingTime}
          </CustomTooltip>
        ),
      },
      {
        title: 'Billing Truck Type',
        dataIndex: 'truckTypeName',
        width: 160,
        order: 5,
        valueType: 'select',
        ellipsis: {
          showTitle: false,
        },
        formItemProps: {
          label: null,
          style: {
            width: `${DEFAULT_WIDTH}px`,
          },
        },
        fieldProps: {
          filterOption: (input: string, option: { label: string }) => {
            return (option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase());
          },
          options: billingTruckTypeList,
          mode: 'multiple',
          showSearch: true,
          placeholder: 'Billing Truck Type',
          maxTagCount: 1,
        },

        render: (_, record) => (
          <CustomTooltip title={record.truckTypeName}>
            {record.truckTypeName}
          </CustomTooltip>
        ),
      },

      {
        title: `Basic Amount Receivable (${countryCurrency})`,
        dataIndex: 'basicAmount',
        width: 200,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { basicAmountStatus, basicAmount } = record;
          const content =
            !!basicAmount || basicAmount === 0 ? (
              <span className={cls(styles[basicAmountStatus])}>
                {formatAmount(basicAmount)}
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
        title: `Basic Amount Tax Rate (VAT,WHT)`,
        dataIndex: 'taxRate',
        width: 260,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        hideInTable: !isTH || isCreatePage,
        render: (_, record) => {
          const {
            basicAmountVat,
            basicAmountWht,
            basicAmountVatEdit,
            basicAmountWhtEdit,
          } = record;
          const content = (
            <>
              <span
                className={cls(basicAmountVatEdit ? styles.vatWhtEdited : '')}
              >
                {basicAmountVat}%
              </span>
              ,&nbsp;&nbsp;
              <span
                className={cls(basicAmountWhtEdit ? styles.vatWhtEdited : '')}
              >
                {basicAmountWht}%
              </span>
            </>
          );
          const isEdit =
            record.basicAmountStatus === BasicAmountStatusEnum.VERIFIED;

          return (
            <>
              <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
                {content}
              </CustomTooltip>
              <Access
                accessible={
                  access[
                    PermissionEnum
                      .CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_TAX_RATE
                  ]
                }
              >
                <Tooltip
                  title={
                    isEdit
                      ? null
                      : 'Non current settlement items are not allowed to be edited'
                  }
                  placement="top"
                  rootClassName={styles.tooltipCls}
                >
                  {[
                    CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                    CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                    CustomerStatementStatusEnum.AWAITING_REBILL,
                  ].includes(detail?.status as CustomerStatementStatusEnum) && (
                    <EditOutlined
                      className={cls(
                        isEdit ? styles.isEdit : styles.editDisabled,
                      )}
                      onClick={() => {
                        if (!isEdit) {
                          return;
                        }
                        setIsEditTaxRateOpen(true);
                        setEditTaxRateWaybillData({
                          taxRateType: StatementGetTaxRateEnum.BASIC_AMOUNT,
                          waybillId: record.id,
                        });
                      }}
                    />
                  )}
                </Tooltip>
              </Access>
            </>
          );
        },
      },
      {
        title: `Customer Additional Charge (${countryCurrency})`,
        dataIndex: 'additionalCharge',
        width: 230,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { additionalChargeStatus, additionalCharge } = record;
          const content =
            !!additionalCharge || additionalCharge === 0 ? (
              <span className={cls(styles[additionalChargeStatus])}>
                {formatAmount(additionalCharge)}
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
        title: `Additional Charge Tax Rate (VAT,WHT)`,
        dataIndex: 'additionalTaxRate',
        width: 260,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        hideInTable: !isTH || isCreatePage,
        render: (_, record) => {
          return (
            // <Tooltip
            //   title={
            //     isEdit
            //       ? null
            //       : 'Non current settlement items are not allowed to be edited'
            //   }
            //   placement="top"
            //   rootClassName={styles.tooltipCls}
            // >
            //   {[
            //     CustomerStatementStatusEnum.UNDER_BILLING_PREP,
            //     CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
            //     CustomerStatementStatusEnum.AWAITING_REBILL,
            //   ].includes(detail?.status as CustomerStatementStatusEnum) && (
            <EditOutlined
              className={cls(styles.isEdit)}
              onClick={() => {
                // if (!isEdit) {
                //   return;
                // }
                const _isEdit =
                  record.additionalChargeStatus ===
                    AdditionalChargeStatusEnum.VERIFIED &&
                  [
                    CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                    CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                    CustomerStatementStatusEnum.AWAITING_REBILL,
                  ].includes(detail?.status as CustomerStatementStatusEnum);
                setIsReadOnly(!_isEdit);
                setIsEditTaxRateOpen(true);
                setEditTaxRateWaybillData({
                  taxRateType: StatementGetTaxRateEnum.ADDITIONAL_CHARGE,
                  waybillId: record.id,
                });
              }}
            />
            //   )}
            // </Tooltip>
          );
        },
      },
      {
        title: `Customer Exception Fee(${countryCurrency})`,
        dataIndex: 'exceptionFee',
        width: 200,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { exceptionFeeStatus, exceptionFee } = record;
          const content =
            !!exceptionFee || exceptionFee === 0 ? (
              <span className={cls(styles[exceptionFeeStatus])}>
                {formatAmount(exceptionFee)}
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
        title: `Contract Revenue(${countryCurrency})`,
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
          const content =
            !!billAmount || billAmount === 0 ? (
              <span>{formatAmount(billAmount)}</span>
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
        title: (
          <>
            VAT ({countryCurrency})
            <CustomTooltip
              title={
                'Only display the tax amount of the settlement items in this Statement'
              }
              placement="top"
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </CustomTooltip>
          </>
        ),
        dataIndex: 'vatAmount',
        width: 200,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { vatAmount, vatChange } = record;
          const content =
            !!vatAmount || vatAmount === 0 ? (
              <span style={{ color: vatChange ? '#1890ff' : '' }}>
                {formatAmount(vatAmount)}
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
        title: (
          <>
            WHT ({countryCurrency})
            <CustomTooltip
              title={
                'Only display the tax amount of the settlement items in this Statement'
              }
              placement="top"
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </CustomTooltip>
          </>
        ),
        dataIndex: 'whtAmount',
        width: 200,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { whtAmount, whtChange } = record;
          const content =
            !!whtAmount || whtAmount === 0 ? (
              <span style={{ color: whtChange ? '#1890ff' : '' }}>
                {formatAmount(whtAmount)}
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
        title: `Billed Amount (VAT-in) (${countryCurrency})`,
        dataIndex: 'billAmount',
        width: 200,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { billAmount, vatAmount = 0 } = record;
          const content =
            !!billAmount || billAmount === 0 ? (
              <span>{formatAmount((billAmount + vatAmount).toFixed(2))}</span>
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
        title: `Reimbursement Expense (${countryCurrency})`,
        dataIndex: 'reimbursementExpense',
        width: 200,
        hideInSearch: true,
        align: 'right',
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => {
          const { reimbursementExpense, reimbursementExpenseStatus } = record;

          const content =
            !!reimbursementExpense || reimbursementExpense === 0 ? (
              <span className={cls(styles[reimbursementExpenseStatus])}>
                {formatAmount(reimbursementExpense)}
              </span>
            ) : (
              ''
            );
          return (
            <div>
              <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
                {content}
              </CustomTooltip>
            </div>
          );
        },
      },
      {
        title: 'Invoice No.',
        dataIndex: 'invoiceNumbers',
        width: 160,

        ellipsis: {
          showTitle: false,
        },
        formItemProps: {
          label: null,
          style: {
            width: `${DEFAULT_WIDTH}px`,
          },
        },
        fieldProps: {
          placeholder: 'Invoice No.',
        },
        render: (_, record) => {
          const { invoiceNumbers } = record;
          const content = !!invoiceNumbers?.length ? (
            <span>{invoiceNumbers.join(',')}</span>
          ) : (
            ''
          );
          let invoiceNumberIds: number[] = [];
          invoiceNumberOptions?.forEach((item) => {
            if (invoiceNumbers?.find((_item: string) => _item === item.label)) {
              invoiceNumberIds.push(item.value);
            }
          });
          return isEditInvoiceNumber ? (
            <>
              <Select
                mode={countryId === 1 ? 'multiple' : undefined}
                allowClear
                defaultValue={invoiceNumberIds}
                style={{ width: 150 }}
                options={invoiceNumberOptions}
                placeholder="Please select"
                onChange={(value) => {
                  saveEditInvoiceNumber(record, value);
                }}
              />
            </>
          ) : (
            <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
              {content}
            </CustomTooltip>
          );
        },
      },

      {
        title: 'Origin',
        dataIndex: 'origin',
        width: 160,
        hideInSearch: true,
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => (
          <CustomTooltip title={record.origin}>{record.origin}</CustomTooltip>
        ),
      },
      {
        title: 'Origin Label',
        dataIndex: 'originLabel',
        width: 160,
        hideInSearch: true,
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => (
          <CustomTooltip title={record.originLabel}>
            {record.originLabel}
          </CustomTooltip>
        ),
      },
      {
        title: 'Destination',
        dataIndex: 'destination',
        width: 160,
        hideInSearch: true,
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => (
          <CustomTooltip title={record.destination}>
            {record.destination}
          </CustomTooltip>
        ),
      },
      {
        title: 'Destination Label',
        dataIndex: 'destinationLabel',
        width: 160,
        hideInSearch: true,
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => (
          <CustomTooltip title={record.destinationLabel}>
            {record.destinationLabel}
          </CustomTooltip>
        ),
      },
      {
        title: 'Operate',
        valueType: 'option',
        key: 'option',
        fixed: 'right',
        align: 'center',
        width: 88,
        render: (_, record) => {
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <Button
                icon={<BarsOutlined />}
                type="link"
                onClick={() => {
                  openNewTag(
                    `${PATHS.WAYBILL_LIST_DETAIL}/${record.waybillId}`,
                  );
                }}
              >
                Detail
              </Button>
            </div>
          );
        },
      },
    ];

    useEffect(() => {
      if (!manual) {
        getDataSource({ pageNum: 1, pageSize: 20, statementId: +statementId! });
        getInvoiceNumberList();
      }
      getTruckTypeListHandle();
    }, []);

    useEffect(() => {
      const unsubscribe = subscribe(
        EVENT_BILLING_STATEMENT_WAYBILL_RELOAD,
        () => {
          getDataSource({
            pageNum: 1,
            pageSize: 20,
            statementId: +statementId!,
          });
        },
      );

      return unsubscribe;
    }, []);

    useEffect(() => {
      const unsubscribe = subscribe(
        EVENT_BILLING_STATEMENT_WAYBILL_INVOICE_RELOAD,
        () => {
          getInvoiceNumberList();
        },
      );

      return unsubscribe;
    }, []);

    useImperativeHandle(ref, () => ({
      getDataSource: (params: IStatementQueryWaybillReq) =>
        getDataSource(params),
      onReset: (params: IStatementQueryWaybillReq) => {
        onReset();
        getDataSource(params);
      },
    }));

    return (
      <div id={BILLING_DETAIL_ANCHOR_ID_MAP.CUSTOMER_WAYBILL_LIST}>
        {(isCreatePage || detail?.billingInfo?.basedOnWaybill) && (
          <div className={cls(styles.wrap, 'statementWaybillList')}>
            <CommonTitle
              title={`${isCreatePage ? 'Waybill Selection' : 'Waybill'}`}
              tooltip={
                isCreatePage ? (
                  'Only waybills that are awaiting settlement will be shown in the list'
                ) : (
                  <div>
                    <div>
                      Contract Revenue = Basic amount Receivable + Customer
                      Additional Charge+ Customer Exception Fee（When these fees
                      are settled in this statement.）
                    </div>
                    <div>
                      VAT=（ Contract Revenue +Miscellaneous Charge）* Tax Rate
                    </div>
                    <div>
                      WHT=（ Contract Revenue +Miscellaneous Charge）* Tax Rate
                    </div>
                  </div>
                )
              }
              extra={
                <Space size={24}>
                  <Access
                    key="associatedWaybill"
                    accessible={
                      access[
                        PermissionEnum
                          .CUSTOMER_STATEMENT_DETAIL_ASSOCIATED_WAYBILL
                      ] &&
                      !isCreatePage &&
                      [
                        CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                        CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                      ].includes(detail?.status as CustomerStatementStatusEnum)
                    }
                  >
                    <CustomStatusButton
                      noStyle
                      onClick={() => {
                        history.push(
                          `${PATHS.BILLING_STATEMENT_ASSOCIATED_WAYBILL}/${statementId}`,
                        );
                      }}
                    >
                      Associated Waybill
                    </CustomStatusButton>
                  </Access>
                  <Access
                    key="billedAmount"
                    accessible={
                      access[
                        PermissionEnum
                          .CUSTOMER_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT
                      ] && !isCreatePage
                    }
                  >
                    <CustomStatusButton
                      noStyle
                      onClick={() => {
                        history.push(
                          `${PATHS.BILLING_CUSTOMER_STATEMENT_BILLED_AMOUNT}/${statementId}`,
                        );
                      }}
                    >
                      Billed Amount
                    </CustomStatusButton>
                  </Access>

                  <Access
                    key="invoiceNumber"
                    accessible={
                      access[
                        PermissionEnum
                          .CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_INVOICE
                      ] &&
                      !isCreatePage &&
                      [
                        CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                        CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                        CustomerStatementStatusEnum.AWAITING_REBILL,
                      ].includes(detail?.status as CustomerStatementStatusEnum)
                    }
                  >
                    {isEditInvoiceNumber ? (
                      <Space size={24}>
                        <Popconfirm
                          title="Do you want to cancel this edit?"
                          style={{ width: 100 }}
                          trigger="click"
                          onConfirm={onCancelEditStatus}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button>Cancel</Button>
                        </Popconfirm>
                        <Button
                          type="primary"
                          onClick={onInvoiceNumberHandle}
                          loading={confirmInvoiceLoading}
                        >
                          Confirm Invoice No.
                        </Button>
                      </Space>
                    ) : (
                      <CustomStatusButton
                        noStyle
                        onClick={onInvoiceNumberHandle}
                        disabled={isEditMiscellaneous || isAmountEditStatus}
                      >
                        Edit Invoice No.
                      </CustomStatusButton>
                    )}
                  </Access>
                  <Access
                    key="FillInAllInvoiceNumber"
                    accessible={
                      access[
                        PermissionEnum
                          .CUSTOMER_STATEMENT_DETAIL_WAYBILL_FILL_IN_ALL_INVOICE
                      ] &&
                      !isCreatePage &&
                      [
                        CustomerStatementStatusEnum.UNDER_BILLING_PREP,
                        CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM,
                        CustomerStatementStatusEnum.AWAITING_REBILL,
                      ].includes(detail?.status as CustomerStatementStatusEnum)
                    }
                  >
                    <CustomStatusButton
                      noStyle
                      onClick={onFillInAllInvoiceNumberHandle}
                      loading={confirmAllInvoiceLoading}
                      disabled={
                        (countryId === 2 && invoiceNumberOptions.length > 1) ||
                        isEditMiscellaneous ||
                        isAmountEditStatus
                      }
                    >
                      Fill in All Invoice No.
                    </CustomStatusButton>
                  </Access>
                </Space>
              }
            />
            <div className={styles.detailWaybillList}>
              <CustomTable
                className={styles.detailWaybillTable}
                formRef={formRef}
                columns={columns}
                scroll={{ x: 2900 }}
                loading={loading}
                fixedSpin={false}
                search={{ defaultCollapsed: false, collapseRender: false }}
                dataSource={originData?.list}
                pagination={{
                  showSizeChanger: true,
                  current: originData?.pageNum,
                  pageSize: originData?.pageSize,
                  total: originData?.total,
                  onChange: (page: number, pageSize: number) => {
                    onSubmit({ pageNum: page, pageSize: pageSize });
                  },
                }}
                manualRequest
                onSubmit={onSubmit}
                onReset={onReset}
                form={{
                  name: 'billing-detail-waybill',
                  syncToUrl: false,
                  syncToInitialValues: false,
                }}
                rowKey="waybillId"
                selectedKey="waybillId"
                rowSelection={isCreatePage ? { all: true } : false}
                getSelectTableItem={(items) => {
                  getSelectItem(items);
                }}
                tableExtraRender={tableExtraRender}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="There are no matching waybills. Please update your filter"
                    />
                  ),
                }}
              />
            </div>
            {editMiscellaneousProofOpen && (
              <WaybillMiscellaneousProofModal
                open={editMiscellaneousProofOpen}
                miscellaneousChargeList={miscellaneousChargeList}
                materialList={[]}
                onCancel={() => {
                  setEditMiscellaneousProofOpen(false);
                }}
                onRefresh={() => {
                  onSubmit();
                  setIsEditMiscellaneous(false);
                  setMiscellaneousChargeList([]);
                  publish(EVENT_BILLING_STATEMENT_WAYBILL_EDIT_STATUS, false);
                }}
              />
            )}
            {isEditTaxRateOpen && (
              <TaxRateModal
                open={isEditTaxRateOpen}
                defaultWaybillData={editTaxRateWaybillData!}
                isReadOnly={
                  isReadOnly ||
                  !access[
                    PermissionEnum
                      .CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_TAX_RATE
                  ]
                }
                onCancel={() => {
                  setIsReadOnly(false);
                  setIsEditTaxRateOpen(false);
                }}
                onRefresh={() => {
                  getDataSource({
                    pageNum: tablePageNumber,
                    pageSize: 20,
                    statementId: +statementId!,
                  });
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

export default DetailWaybillListCard;
