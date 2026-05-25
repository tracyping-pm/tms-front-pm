import { getUserGuidanceUpdate } from '@/api-uam/common';
import { claimExportList, claimList } from '@/api/claim';
import { IClaimListPayload, IClaimListRecord } from '@/api/types/claims';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import {
  CustomerDeductionStatusEnumText,
  DeductionStatusEnumText,
  DeductionStatusEnumTextColor,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
  VendorDeductionStatusEnumText,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CountryCurrencyEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  GetUserGuidanceEnum,
} from '@/enums';
import {
  ClaimTicketStatusEnumColor,
  ClaimTicketStatusEnumText,
  EnumExternalClaimsType,
  EnumInternalClaimsType,
} from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess, useModel } from '@umijs/max';
import { Badge, Button, Select } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import BatchCreateClaimTicketsModal from './components/BatchCreateClaimTicketsModal';
import ClaimTicketModal from './components/ClaimTicketModal';
import { internalClaimsTypeList } from './components/ClaimTicketModal/Fields';
import styles from './index.less';

type IBE_NEED = IClaimListPayload;

interface IFE_NEED extends IBE_NEED {
  idObj?: I_FUZZY_API_RESPONSE;
  projectObj?: I_FUZZY_API_RESPONSE;
  claimantObj?: I_FUZZY_API_RESPONSE;
  responsiblePartyObj?: I_FUZZY_API_RESPONSE;
  creatorObjList?: I_FUZZY_API_RESPONSE[];
  scrollTop?: number;
}

const ClaimTicket: React.FC = () => {
  const access = useAccess();
  // const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [claimTypeOptions, setClaimTypeOptions] = useState<DefaultOptionType[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();
  const [createClaimTicketModalOpen, setCreateClaimTicketModalOpen] =
    useState<boolean>(false);
  const [batchCreateTicketsModalOpen, setBatchCreateTicketsModalOpen] =
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

  const getDataSource = async (BE_NEED: IClaimListPayload) => {
    setLoading(true);
    const res = await claimList(BE_NEED).finally(() => {
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

    if (values.claimTypeList) {
      lodash.set(FE_NEED, 'claimTypeList', values.claimTypeList);
      lodash.set(BE_NEED, 'claimTypeList', values.claimTypeList);
    }

    if (values.customerDeductionStatus) {
      lodash.set(
        FE_NEED,
        'customerDeductionStatus',
        values.customerDeductionStatus,
      );
      lodash.set(
        BE_NEED,
        'customerDeductionStatus',
        values.customerDeductionStatus,
      );
    }

    if (values.vendorDeductionStatus) {
      lodash.set(
        FE_NEED,
        'vendorDeductionStatus',
        values.vendorDeductionStatus,
      );
      lodash.set(
        BE_NEED,
        'vendorDeductionStatus',
        values.vendorDeductionStatus,
      );
    }

    if (values.idObj) {
      lodash.set(FE_NEED, 'idObj', values.idObj);
      lodash.set(BE_NEED, 'id', values.idObj?.id);
    }

    if (values.projectObj) {
      lodash.set(FE_NEED, 'projectObj', values.projectObj);
      lodash.set(BE_NEED, 'projectId', values.projectObj?.id);
    }

    if (values.claimantObj) {
      lodash.set(FE_NEED, 'claimantObj', values.claimantObj);
      lodash.set(BE_NEED, 'claimantId', values.claimantObj?.id);
    }

    if (values.responsiblePartyObj) {
      lodash.set(FE_NEED, 'responsiblePartyObj', values.responsiblePartyObj);
      lodash.set(BE_NEED, 'responsiblePartyId', values.responsiblePartyObj?.id);
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
      projectObj: FE_NEED.projectObj ? FE_NEED.projectObj : undefined,
      claimantObj: FE_NEED.claimantObj ? FE_NEED.claimantObj : undefined,
      responsiblePartyObj: FE_NEED.responsiblePartyObj
        ? FE_NEED.responsiblePartyObj
        : undefined,
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
    const res = await claimExportList(BE_NEED ?? {}).finally(() => {
      setExportLoading(false);
    });

    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
  };

  const columns: ProColumns<IClaimListRecord>[] = [
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
            uniqueLogicParams: { ticketType: 1 },
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.ticketNumber}>
            {access[PermissionEnum.CLAIM_TICKET_DETAIL] ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(
                    `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${record.id}`,
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
      title: 'Affiliated Project',
      dataIndex: 'projectObj',
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
            placeholder: 'Affiliated Project',
          }}
          request={{
            field: 'projectName',
            esDtoClass: ES_DTO_CLASS.PROJECT,
            type: FieldQueryHighlightTypeEnum.USER_ROLE,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Claim Type',
      dataIndex: 'claimTypeList',
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
        <Select
          mode="multiple"
          options={claimTypeOptions}
          placeholder="Claim Type"
          labelRender={(item) => {
            if (
              internalClaimsTypeList.includes(
                item.value as EnumInternalClaimsType,
              )
            ) {
              return `Internal Claim - ${item.label}`;
            } else {
              return `External Claim - ${item.label}`;
            }
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.claimType}>
            {record.claimType}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'totalAmount',
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
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
      title: 'Claimant',
      dataIndex: 'claimantObj',
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
            placeholder: 'Claimant',
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
          <CustomTooltip title={record.claimantName}>
            {record.claimantName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Responsible Party',
      dataIndex: 'responsiblePartyObj',
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
            placeholder: 'Responsible Party',
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
          <CustomTooltip title={record.responsiblePartyName}>
            {record.responsiblePartyName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Deduction for Customer',
      dataIndex: 'customerDeductionStatus',
      valueType: 'select',
      valueEnum: CustomerDeductionStatusEnumText,
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
        placeholder: 'Deduction for Customer',
      },
      width: 200,
      render: (_, record) => {
        const status = record.customerDeductionStatus;

        const Content = (
          <Badge
            color={DeductionStatusEnumTextColor[status]}
            text={DeductionStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Deduction for Vendor',
      dataIndex: 'vendorDeductionStatus',
      valueType: 'select',
      valueEnum: VendorDeductionStatusEnumText,
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
        placeholder: 'Deduction for Vendor',
      },
      width: 200,
      render: (_, record) => {
        const status = record.vendorDeductionStatus;

        const Content = (
          <Badge
            color={DeductionStatusEnumTextColor[status]}
            text={DeductionStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
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
            type: FieldQueryHighlightTypeEnum.BU_Id,
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
      valueEnum: ClaimTicketStatusEnumText,
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
            color={ClaimTicketStatusEnumColor[status]}
            text={ClaimTicketStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create-claim-ticket"
      accessible={access[PermissionEnum.CLAIM_TICKET_CREATE]}
    >
      <Button
        type="primary"
        onClick={() => {
          setCreateClaimTicketModalOpen(true);
        }}
      >
        Create Claim Ticket
      </Button>
    </Access>,
    <Access
      key="batch-create-tickets"
      accessible={access[PermissionEnum.CLAIM_TICKET_BATCH_CREATE]}
    >
      <Button
        onClick={() => {
          setBatchCreateTicketsModalOpen(true);
        }}
      >
        Batch Create Tickets
      </Button>
    </Access>,
    <Access
      key="export-ticket"
      accessible={access[PermissionEnum.CLAIM_TICKET_EXPORT]}
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

  useEffect(() => {
    const group = [];
    const internalOptions = [];
    const externalOptions = [];

    // Internal Claim Type
    if (access[PermissionEnum.CLAIM_TYPE_GPS]) {
      internalOptions.push({
        label: EnumInternalClaimsType.GPS,
        value: EnumInternalClaimsType.GPS,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_DDC_TRAINING_FEE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.DDC_Training_Fee,
        value: EnumInternalClaimsType.DDC_Training_Fee,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_CREW_UNIFORM_CHARGES]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Crew_Uniform_Charges,
        value: EnumInternalClaimsType.Crew_Uniform_Charges,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_INTELUCK_INSURANCE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Inteluck_Insurance,
        value: EnumInternalClaimsType.Inteluck_Insurance,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_COUPON_FEES]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Coupon_Fees,
        value: EnumInternalClaimsType.Coupon_Fees,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_STUFFING_FEE_CDC]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Stuffing_Fee_CDC,
        value: EnumInternalClaimsType.Stuffing_Fee_CDC,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_EQUIPMENT_FEE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Equipment_Fee,
        value: EnumInternalClaimsType.Equipment_Fee,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_MEDICAL_FEE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Medical_Fee,
        value: EnumInternalClaimsType.Medical_Fee,
      });
    }
    // External Claim Type
    if (access[PermissionEnum.CLAIM_TYPE_DELIVERY_CLAIMS]) {
      externalOptions.push({
        label: EnumExternalClaimsType.Delivery_Claims,
        value: EnumExternalClaimsType.Delivery_Claims,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_KPI_CLAIMS]) {
      externalOptions.push({
        label: EnumExternalClaimsType.KPI_Claims,
        value: EnumExternalClaimsType.KPI_Claims,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_THEFT_INCIDENT]) {
      externalOptions.push({
        label: EnumExternalClaimsType.Theft_Incident,
        value: EnumExternalClaimsType.Theft_Incident,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_OTHERS]) {
      externalOptions.push({
        label: EnumExternalClaimsType.Others,
        value: EnumExternalClaimsType.Others,
      });
    }

    if (internalOptions?.length > 0) {
      const groupLabel = 'Internal Claim';
      group.push({
        label: groupLabel,
        options: internalOptions,
      });
    }

    if (externalOptions?.length > 0) {
      const groupLabel = 'External Claim';
      group.push({
        label: groupLabel,
        options: externalOptions,
      });
    }

    setClaimTypeOptions(group);
  }, [access]);

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
          access[PermissionEnum.CLAIM_TICKET_CREATE] ||
          access[PermissionEnum.CLAIM_TICKET_EXPORT]
            ? toolBarRender
            : false
        }
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      <ClaimTicketModal
        open={createClaimTicketModalOpen}
        onCancel={() => setCreateClaimTicketModalOpen(false)}
        onSuccess={() => {
          setCreateClaimTicketModalOpen(false);
          doFirstQuery();
        }}
      />
      <BatchCreateClaimTicketsModal
        open={batchCreateTicketsModalOpen}
        onCancel={() => setBatchCreateTicketsModalOpen(false)}
        onSuccess={() => {
          doFirstQuery();
        }}
      />
    </>
  );
};

export default ClaimTicket;
