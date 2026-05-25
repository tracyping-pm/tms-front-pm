import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  getVendorStatementExport,
  getVendorStatementList,
} from '@/api/billing';
import { IVendorStatementParams } from '@/api/types/billing';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CountryCurrencyEnumText,
  CustomerSizeEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  GetUserGuidanceEnum,
  StatementAssociationTypeEnum,
  StatementAssociationTypeEnumText,
  VendorSettledItemEnum,
  VendorSettledItemEnumText,
  VendorSettledItemListOptions,
  VendorStatementStatusEnum,
  VendorStatementStatusEnumIconColor,
  VendorStatementStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { formatAmount, formatAmountPercentage } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined } from '@ant-design/icons';
import {
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history, useAccess, useModel } from '@umijs/max';
import { Badge, Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  statementId?: string;
  statementNumber?: string;
  vendorId?: string;
  vendorName?: string;
  projectId?: string;
  invoiceNumber?: string;
  waybillId?: number;
  statementStatus?: VendorStatementStatusEnum;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  statementType?: StatementAssociationTypeEnum;
  settledItemList?: VendorSettledItemEnum[];
  remainingUnpaidAmountStart?: number;
  remainingUnpaidAmountEnd?: number;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  projectName?: string;
  waybillNumber?: string;
}

const CustomerStatementList: React.FC = () => {
  const access = useAccess();
  const { initialState: userInfo, setInitialState: setUserInfo } =
    useModel('@@initialState');
  const completedGuidance =
    userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const countryId = userInfo?.currentUser?.countryId;
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  // 用户引导
  const downloadRef = useRef<any>(null);
  const exportRef = useRef<any>(null);
  const animation = useAddAnimation(exportRef, downloadRef);
  const formRef = useRef<ProFormInstance>();
  const [, setUrlState] = useUrlState();

  const {
    options: statementNumberOptions,
    onSearch: statementNumberSearch,
    defaultFieldProps: statementNumberDefaultFieldProps,
    value: statementNumberValue,
    setValue: setStatementNumberValue,
  } = useFieldQuery({
    field: 'statementNumber',
    esDtoClass: ES_DTO_CLASS.STATEMENT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
    value: vendorNameValue,
    setValue: setVendorNameValue,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: waybillNumberOptions,
    onSearch: waybillNumberSearch,
    defaultFieldProps: waybillNumberDefaultFieldProps,
    value: waybillNumberValue,
    setValue: setWaybillNumberValue,
  } = useFieldQuery({
    field: 'waybillNumber',
    esDtoClass: ES_DTO_CLASS.WAYBILL,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const playAnimation = () => {
    animation(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const saveScrollTop = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED } = extraJson;
    const scrollTop = document?.scrollingElement?.scrollTop ?? 0;

    const newExtra = { ...extraJson, FE_NEED: { ...FE_NEED, scrollTop } };

    setUrlState({
      extra: JSON.stringify(newExtra),
    });
  };

  const doScrollTop = (top: number) => {
    setTimeout(() => {
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await getVendorStatementList(BE_NEED as IVendorStatementParams);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();
    if (values.statementNumber) {
      lodash.set(FE_NEED, 'statementNumber', values.statementNumber?.name);
      lodash.set(BE_NEED, 'statementId', values.statementNumber?.id);
    }

    if (values.vendorName) {
      lodash.set(FE_NEED, 'vendorName', values.vendorName?.name);
      lodash.set(BE_NEED, 'vendorId', values.vendorName?.id);
    }
    if (values.projectNameObj) {
      lodash.set(FE_NEED, 'projectName', values.projectNameObj?.name);
      lodash.set(FE_NEED, 'projectId', values.projectNameObj?.id);
      lodash.set(BE_NEED, 'projectId', values.projectNameObj?.id);
    }

    if (values.invoiceNumber) {
      lodash.set(FE_NEED, 'invoiceNumber', values.invoiceNumber);
      lodash.set(BE_NEED, 'invoiceNumber', values.invoiceNumber);
    }

    if (values.waybillNumber) {
      lodash.set(FE_NEED, 'waybillNumber', values.waybillNumber?.name);
      lodash.set(FE_NEED, 'waybillId', values.waybillNumber?.id);
      lodash.set(BE_NEED, 'waybillId', values.waybillNumber?.id);
    }

    if (values.statementStatus) {
      lodash.set(FE_NEED, 'statementStatus', values.statementStatus);
      lodash.set(BE_NEED, 'statementStatus', values.statementStatus);
    }

    if (values.statementType) {
      lodash.set(FE_NEED, 'statementType', values.statementType);
      lodash.set(BE_NEED, 'statementType', values.statementType);
    }

    if (values.settledItemList) {
      lodash.set(FE_NEED, 'settledItemList', values.settledItemList);
      lodash.set(BE_NEED, 'settledItemList', values.settledItemList);
    }
    if (values.outstandingAmount) {
      lodash.set(
        FE_NEED,
        'remainingUnpaidAmountStart',
        values.outstandingAmount[0],
      );
      lodash.set(
        FE_NEED,
        'remainingUnpaidAmountEnd',
        values.outstandingAmount[1],
      );

      lodash.set(
        BE_NEED,
        'remainingUnpaidAmountStart',
        values.outstandingAmount[0],
      );
      lodash.set(
        BE_NEED,
        'remainingUnpaidAmountEnd',
        values.outstandingAmount[1],
      );
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'creationTimeStart', startTime);
      lodash.set(FE_NEED, 'creationTimeEnd', endTime);

      lodash.set(BE_NEED, 'creationTimeStart', startTime);
      lodash.set(BE_NEED, 'creationTimeEnd', endTime);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });
    getDataSource(BE_NEED);
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      statementStatus: FE_NEED.statementStatus,
      statementType: FE_NEED.statementType,
      settledItemList: FE_NEED.settledItemList,
      invoiceNumber: FE_NEED.invoiceNumber,
      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
      outstandingAmount: [
        FE_NEED.remainingUnpaidAmountStart,
        FE_NEED.remainingUnpaidAmountEnd,
      ],
    });

    formRef.current?.setFieldsValue({
      statementNumber: FE_NEED.statementNumber
        ? { value: FE_NEED.statementNumber }
        : undefined,
      vendorName: FE_NEED.vendorName
        ? { value: FE_NEED.vendorName }
        : undefined,
      projectNameObj: FE_NEED.projectName
        ? { name: FE_NEED.projectName, id: FE_NEED.projectId }
        : undefined,
      waybillNumber: FE_NEED.waybillNumber
        ? { name: FE_NEED.waybillNumber, id: FE_NEED.waybillId }
        : undefined,
    });

    setStatementNumberValue(FE_NEED.statementNumber);
    setVendorNameValue(FE_NEED.vendorName);
    setWaybillNumberValue(FE_NEED.waybillNumber);
  };

  const doFirstQuery = async () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED, BE_NEED } = extraJson;
    if (FE_NEED) {
      fillTableForm(FE_NEED);
    }

    if (BE_NEED) {
      await getDataSource(BE_NEED);
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    } else {
      await getDataSource({ pageNum: 1, pageSize: 20 });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    }
  };
  const onReset = () => {
    setUrlState({ extra: undefined });
    setStatementNumberValue(undefined);
    setVendorNameValue(undefined);
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;

    await getDataSource({ ...BE_NEED, ...params });
  };

  const doDownload = async () => {
    setExportLoading(true);
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    const payload = { ...BE_NEED };
    delete payload.pageNum;
    delete payload.pageSize;

    const res = await getVendorStatementExport(payload).finally(() => {
      setExportLoading(false);
    });
    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  };

  const guidanceUpdateHandle = async () => {
    await setUserInfo((s) => ({
      ...s,
      currentUser: {
        ...userInfo?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const onExport = useCallback(() => {
    if (completedGuidance) {
      doDownload();
    } else {
      playAnimation();
      guidanceUpdateHandle();
      setTimeout(() => {
        doDownload();
      }, 3000);
    }
  }, [completedGuidance]);

  const columns: ProColumns[] = [
    {
      title: 'Statement Number',
      dataIndex: 'statementNumber',
      valueType: 'select',
      width: 240,
      order: 10,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...statementNumberDefaultFieldProps,
        placeholder: 'Statement Number',
        options: statementNumberOptions,
        onSearch: (keywords: string) =>
          statementNumberSearch(keywords, {
            uniqueLogic:
              FieldQueryHighlightUniqueLogicEnum.BILLING_STATEMENT_NUMBER,
            uniqueLogicParams: { type: 'Vendor' },
          }),
        value: statementNumberValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.statementNumber}>
            {record.statementNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      valueType: 'select',
      width: 240,
      order: 9,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...vendorNameDefaultFieldProps,
        placeholder: 'Vendor Name',
        options: vendorNameOptions,
        onSearch: vendorNameSearch,
        value: vendorNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorName}>
            {record.vendorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'projectNameObj',
      valueType: 'select',
      width: 200,
      order: 8,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Project Name' }}
          request={{
            field: 'projectName',
            esDtoClass: ES_DTO_CLASS.PROJECT,
            type: FieldQueryHighlightTypeEnum.USER_ROLE,
          }}
        />
      ),
      render: (_, record) => {
        const projectNames = record.projectNames.join(', ');
        return (
          <CustomTooltip title={projectNames}>{projectNames}</CustomTooltip>
        );
      },
    },
    {
      title: 'Settlement Item',
      dataIndex: 'settledItemList',
      width: 400,
      order: 2,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'Statement Item',
        options: VendorSettledItemListOptions,
      },
      render: (_, record) => {
        const { settledItemList } = record;
        const content = settledItemList
          ?.map(
            (item: VendorSettledItemEnum) => VendorSettledItemEnumText[item],
          )
          .join(', ');
        return content ?? '-';
      },
    },

    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      valueType: 'select',
      width: 240,
      order: 6,
      ellipsis: { showTitle: false },
      hideInTable: true,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...waybillNumberDefaultFieldProps,
        placeholder: 'Waybill Number',
        options: waybillNumberOptions,
        onSearch: waybillNumberSearch,
        value: waybillNumberValue,
      },
    },
    {
      title: 'Status',
      dataIndex: 'statementStatus',
      ellipsis: { showTitle: false },
      width: 240,
      order: 5,
      valueType: 'select',
      valueEnum: VendorStatementStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Status',
      },
      render: (_, record) => {
        const status: VendorStatementStatusEnum = record.statementStatus;
        const Content = (
          <Badge
            color={VendorStatementStatusEnumIconColor[status]}
            text={VendorStatementStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Statement Type',
      dataIndex: 'statementType',
      ellipsis: { showTitle: false },
      width: 240,
      order: 4,
      valueType: 'select',
      hideInTable: true,
      valueEnum: StatementAssociationTypeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Statement Type',
      },
    },
    {
      title: `Total Amount Payable (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'totalAmountDue',
      hideInSearch: true,
      align: 'right',
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const valStr = formatAmountPercentage(record.totalAmountDue);
        return <CustomTooltip title={valStr}>{valStr}</CustomTooltip>;
      },
    },
    {
      title: `Amount Paid(${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'amountReceived',
      hideInSearch: true,
      align: 'right',
      width: 180,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const valStr = formatAmountPercentage(record.amountReceived);
        return <CustomTooltip title={valStr}>{valStr}</CustomTooltip>;
      },
    },
    {
      title: `Remaining Amount Unpaid(${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'outstandingAmount',
      align: 'right',
      width: 230,
      order: 3,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Remaining Amount Unpaid', 'Remaining Amount Unpaid'],
      },
      renderFormItem: (item, { defaultRender, ...rest }) => {
        return !!defaultRender ? (
          <ProFormDigitRange
            fieldProps={{
              ...rest,
              className: styles.rangeInput,
              min: -99999999.99,
              max: 99999999.99,
              controls: false,
              formatter: (v) => formatAmount(v!),
            }}
            transform={(value: [number, number]) => {
              if (value && value.length === 2) {
                const [start, end] = value;
                return {
                  min: Math.min(start, end),
                  max: Math.max(start, end),
                };
              }
              return {};
            }}
          />
        ) : null;
      },
      render: (_, record) => {
        const valStr = formatAmountPercentage(record.outstandingAmount);
        return <CustomTooltip title={valStr}>{valStr}</CustomTooltip>;
      },
    },
    {
      title: 'Reconciliation Period',
      dataIndex: 'reconciliationPeriodTime',
      hideInSearch: true,
      width: 220,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        let showTime = '-';
        if (
          record.reconciliationPeriodStart &&
          record.reconciliationPeriodEnd
        ) {
          showTime =
            record.reconciliationPeriodStart +
            ' - ' +
            record.reconciliationPeriodEnd;
        }
        return <CustomTooltip title={showTime}>{showTime}</CustomTooltip>;
      },
    },

    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber',
      width: 240,
      order: 7,
      valueType: 'text',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Invoice Number',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        let str = record.invoiceNumber || '';
        str = str.split('\n').join(',');
        return (
          <CustomTooltip title={str} placement="top">
            {str}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 180,
      order: 1,
      valueType: 'dateTimeRange',
      valueEnum: CustomerSizeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Creation Time Start', 'Creation Time End'],
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            title={dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable: !access[PermissionEnum.VENDOR_STATEMENT_DETAIL],
      width: 100,
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              boxSizing: 'border-box',
            }}
          >
            <Access
              key="detail"
              accessible={access[PermissionEnum.VENDOR_STATEMENT_DETAIL]}
            >
              <Button
                icon={<BarsOutlined />}
                type="link"
                onClick={() => {
                  saveScrollTop();
                  history.push(
                    `${PATHS.BILLING_VENDOR_STATEMENT_DETAIL}/${record.id}`,
                  );
                }}
              >
                Detail
              </Button>
            </Access>
          </div>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create"
      accessible={access[PermissionEnum.VENDOR_STATEMENT_ADD]}
    >
      <Button
        type="primary"
        onClick={() => {
          history.replace(PATHS.BILLING_VENDOR_STATEMENT_ADD);
        }}
      >
        Add Statement
      </Button>
    </Access>,
    <Access
      key="create"
      accessible={access[PermissionEnum.VENDOR_STATEMENT_EXPORT]}
    >
      <Button onClick={onExport} ref={exportRef} loading={exportLoading}>
        Export Statement
      </Button>
    </Access>,
  ];

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
    doFirstQuery();
  }, []);

  return (
    <>
      <CustomTable
        columns={columns}
        scroll={{ x: 1500 }}
        formRef={formRef}
        form={{
          name: 'customer-statement-list',
        }}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
          },
        }}
        loading={loading}
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
    </>
  );
};

export default CustomerStatementList;
