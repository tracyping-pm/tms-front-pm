import { getUserGuidanceUpdate } from '@/api-uam/common';
import { refundExportList, refundList } from '@/api/claim';
import { IRefundListPayload, IRefundListRecord } from '@/api/types/claims';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import {
  CustomerRefundStatusEnumText,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
  RefundStatusEnumText,
  RefundStatusEnumTextColor,
  VendorRefundStatusEnumText,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CountryCurrencyEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  GetUserGuidanceEnum,
} from '@/enums';
import {
  RefundTicketStatusEnumColor,
  RefundTicketStatusEnumText,
} from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess, useModel } from '@umijs/max';
import { Badge, Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import RefundTicketModal from './components/RefundTicketModal';
import styles from './index.less';

type IBE_NEED = IRefundListPayload;

interface IFE_NEED extends IBE_NEED {
  idObj?: I_FUZZY_API_RESPONSE;
  refundingPartyObj?: I_FUZZY_API_RESPONSE;
  payeeObj?: I_FUZZY_API_RESPONSE;
  creatorObjList?: I_FUZZY_API_RESPONSE[];
  scrollTop?: number;
}

const RefundTicket: React.FC = () => {
  const access = useAccess();
  const { initialState, setInitialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();
  const [createRefundTicketModalOpen, setCreateRefundTicketModalOpen] =
    useState<boolean>(false);
  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);
  const playStar = useAddAnimation(playSrcRef, playTargetRef);

  const playAnimation = () => {
    playStar(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const guidanceUpdateHandle = async () => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const doScrollTop = (top: number) => {
    setTimeout(() => {
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: IRefundListPayload) => {
    setLoading(true);
    const res = await refundList(BE_NEED).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.ticketStatusList) {
      lodash.set(FE_NEED, 'ticketStatusList', values.ticketStatusList);
      lodash.set(BE_NEED, 'ticketStatusList', values.ticketStatusList);
    }

    if (values.customerRefundStatus) {
      lodash.set(FE_NEED, 'customerRefundStatus', values.customerRefundStatus);
      lodash.set(BE_NEED, 'customerRefundStatus', values.customerRefundStatus);
    }

    if (values.vendorRefundStatus) {
      lodash.set(FE_NEED, 'vendorRefundStatus', values.vendorRefundStatus);
      lodash.set(BE_NEED, 'vendorRefundStatus', values.vendorRefundStatus);
    }

    if (values.idObj) {
      lodash.set(FE_NEED, 'idObj', values.idObj);
      lodash.set(BE_NEED, 'id', values.idObj?.id);
    }

    if (values.refundingPartyObj) {
      lodash.set(FE_NEED, 'refundingPartyObj', values.refundingPartyObj);
      lodash.set(BE_NEED, 'refundingPartyId', values.refundingPartyObj?.id);
    }

    if (values.payeeObj) {
      lodash.set(FE_NEED, 'payeeObj', values.payeeObj);
      lodash.set(BE_NEED, 'payeeId', values.payeeObj?.id);
    }

    if (values.creatorObjList) {
      lodash.set(FE_NEED, 'creatorObjList', values.creatorObjList);
      lodash.set(
        BE_NEED,
        'creatorUserRoleIdList',
        values.creatorObjList?.map((item: I_FUZZY_API_RESPONSE) => item.id),
      );
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;

      lodash.set(BE_NEED, 'creationTimeStart', startTime);
      lodash.set(BE_NEED, 'creationTimeEnd', endTime);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });

    // BE_NEED
    getDataSource(BE_NEED);
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      ...FE_NEED,
      createdAt: [
        FE_NEED.creationTimeStart
          ? dayjs(FE_NEED.creationTimeStart)
          : undefined,
        FE_NEED.creationTimeEnd ? dayjs(FE_NEED.creationTimeEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      idObj: FE_NEED.idObj ? FE_NEED.idObj : undefined,
      refundingPartyObj: FE_NEED.refundingPartyObj
        ? FE_NEED.refundingPartyObj
        : undefined,
      payeeObj: FE_NEED.payeeObj ? FE_NEED.payeeObj : undefined,
      creatorObjList: FE_NEED.creatorObjList
        ? FE_NEED.creatorObjList
        : undefined,
    });
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
    // 自动触发 onSubmit
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

  const doExport = async () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    setExportLoading(true);
    const res = await refundExportList(BE_NEED ?? {}).finally(() => {
      setExportLoading(false);
    });

    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  };

  const columns: ProColumns<IRefundListRecord>[] = [
    {
      title: 'Ticket Number',
      dataIndex: 'idObj',
      valueType: 'select',
      width: 200,
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
          fieldProps={{
            placeholder: 'Ticket Number',
          }}
          request={{
            field: 'ticketNumber',
            esDtoClass: ES_DTO_CLASS.CLAIM_TICKET,
            type: FieldQueryHighlightTypeEnum.None,
            uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM,
            uniqueLogicParams: { ticketType: 2 },
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.ticketNumber}>
            {access[PermissionEnum.REFUND_TICKET_DETAIL] ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(
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
      title: `Total Refund Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'totalAmount',
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        const totalAmount = formatAmount(record.totalAmount);
        return (
          <CustomTooltip title={totalAmount} placement="top">
            {totalAmount}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Refunding Party',
      dataIndex: 'refundingPartyObj',
      valueType: 'select',
      width: 200,
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
          fieldProps={{
            placeholder: 'Refunding Party',
          }}
          request={{
            field: 'customerName',
            esDtoClass: ES_DTO_CLASS.CUSTOMER,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
            uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.refundingPartyName}>
            {record.refundingPartyName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Payee',
      dataIndex: 'payeeObj',
      valueType: 'select',
      width: 200,
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
          fieldProps={{
            placeholder: 'Payee',
          }}
          request={{
            field: 'vendorName',
            esDtoClass: ES_DTO_CLASS.VENDOR,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
            uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.payeeName}>
            {record.payeeName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Refund for Customer',
      dataIndex: 'customerRefundStatus',
      valueType: 'select',
      valueEnum: CustomerRefundStatusEnumText,
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
        placeholder: 'Refund for Customer',
      },
      width: 200,
      render: (_, record) => {
        const status = record.customerRefundStatus;

        const Content = (
          <Badge
            color={RefundStatusEnumTextColor[status]}
            text={RefundStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Refund for Vendor',
      dataIndex: 'vendorRefundStatus',
      valueType: 'select',
      valueEnum: VendorRefundStatusEnumText,
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
        placeholder: 'Refund for Vendor',
      },
      width: 200,
      render: (_, record) => {
        const status = record.vendorRefundStatus;

        const Content = (
          <Badge
            color={RefundStatusEnumTextColor[status]}
            text={RefundStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Linked Claim Ticket',
      dataIndex: 'claimNumber',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.claimNumber}>
            {access[PermissionEnum.REFUND_TICKET_LINKED_CLAIM_TICKET_DETAIL] ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(
                    `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${record.claimId}`,
                  );
                }}
              >
                {record.claimNumber}
              </Button>
            ) : (
              record.claimNumber
            )}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'dateRange',
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
      title: 'Creator',
      dataIndex: 'creatorObjList',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'Creator',
            mode: 'multiple',
            popupMatchSelectWidth: 400,
          }}
          customProps={{
            isUAM: true,
          }}
          request={{
            field: 'aliasName',
            esDtoClass: ES_DTO_CLASS.USER_ROLE,
            type: FieldQueryHighlightTypeEnum.None,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.creatorName} placement="top">
            {record.creatorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Ticket Status',
      dataIndex: 'ticketStatusList',
      valueType: 'select',
      valueEnum: RefundTicketStatusEnumText,
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
        placeholder: 'Ticket Status',
        mode: 'multiple',
      },
      width: 200,
      render: (_, record) => {
        const status = record.ticketStatus;

        const Content = (
          <Badge
            color={RefundTicketStatusEnumColor[status]}
            text={RefundTicketStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create-claim-ticket"
      accessible={access[PermissionEnum.REFUND_TICKET_CREATE]}
    >
      <Button
        type="primary"
        onClick={() => {
          setCreateRefundTicketModalOpen(true);
        }}
      >
        Create Refund Ticket
      </Button>
    </Access>,
    <Access
      key="export-ticket"
      accessible={access[PermissionEnum.REFUND_TICKET_EXPORT]}
    >
      <Button
        ref={playSrcRef}
        loading={exportLoading}
        onClick={() => {
          if (completedGuidance) {
            doExport();
          } else {
            playAnimation();
            guidanceUpdateHandle();
            doExport();
          }
        }}
      >
        Export Ticket
      </Button>
    </Access>,
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  useEffect(() => {
    playTargetRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <CustomTable
        className={styles.claimTicketList}
        columns={columns}
        scroll={{ x: 1600 }}
        formRef={formRef}
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
        toolBarRender={
          access[PermissionEnum.REFUND_TICKET_CREATE] ||
          access[PermissionEnum.REFUND_TICKET_EXPORT]
            ? toolBarRender
            : false
        }
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      <RefundTicketModal
        open={createRefundTicketModalOpen}
        onCancel={() => setCreateRefundTicketModalOpen(false)}
        onSuccess={() => {
          setCreateRefundTicketModalOpen(false);
          doFirstQuery();
        }}
      />
    </>
  );
};

export default RefundTicket;
