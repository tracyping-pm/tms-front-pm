import {
  opportunityAdd,
  opportunityFunnelPerson,
  opportunityList,
} from '@/api/opportunity';
import {
  ICustomerLeadSelectorRecord,
  IOpportunityFunnelPerson,
  IOpportunityListPayload,
  IOpportunityRecord,
} from '@/api/types/opportunity';
import CustomerLeadSelector from '@/components/CustomerLeadSelector';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  BUEnumText,
  CustomerStatusEnumText,
  FieldQueryHighlightTypeEnum,
  FollowUpCheckEnum,
  FollowUpCheckEnumColor,
  FollowUpCheckEnumText,
  LeadStatusEnumText,
  OpportunitiesCustomerStatusEnum,
  OpportunitiesCustomerStatusEnumColor,
  OpportunitiesCustomerStatusEnumText,
  OpportunitiesCustomerTypeEnumText,
  OpportunitiesStatusEnum,
  OpportunitiesStatusEnumColor,
  OpportunitiesStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import {
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { Badge, Button, Divider, message, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import FollowingUpModal from './components/followingUp/FollowingUpModal';
import { SHOW_OPPORTUNITY_DETAIL_FOLLOW_UP_STATUS_LIST } from './components/followingUp/support';
import OpportunitiesAddModal from './components/OpportunitiesAddModal';
import styles from './styles.less';

interface IFE_NEED extends IOpportunityListPayload {
  scrollTop?: number;
  customerNameObj?: ICustomerLeadSelectorRecord;
  projectNameObj?: I_FUZZY_API_RESPONSE;
}

const OpportunitiesList: React.FC = () => {
  const access = useAccess();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [opportunityModalOpen, setOpportunityModalOpen] =
    useState<boolean>(false);
  const [confirmOpportunityLoading, setConfirmOpportunityLoading] =
    useState<boolean>(false);
  const [bdPicOptions, setBdPicOptions] = useState<DefaultOptionType[]>([]);
  const [customerLeadOptions, setCustomerLeadOptions] = useState<
    DefaultOptionType[]
  >([]);
  const [selectedCustomerLeadOption, setSelectedCustomerLeadOption] = useState<
    DefaultOptionType[]
  >([]);
  const [followingUpModalOpen, setFollowingUpModalOpen] = useState(false);
  const [activeOpportunityId, setActiveOpportunityId] = useState<number>(0);

  const [, setUrlState] = useUrlState();
  const [presets, setPresets] = useState<any[]>([]);
  const formRef = useRef<ProFormInstance>();

  const saveScrollTop = () => {
    // 记录滚动位置
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
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: IOpportunityListPayload) => {
    setLoading(true);
    const res = await opportunityList({ ...BE_NEED }).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const reload = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    getDataSource(BE_NEED ?? {});
  };

  const onCreateOpportunity = () => {
    setOpportunityModalOpen(true);
  };

  const onAddModalConfirm = async (values: IOpportunityRecord) => {
    setConfirmOpportunityLoading(true);
    const res = await opportunityAdd(values);
    setConfirmOpportunityLoading(false);
    if (res.code === 200) {
      message.success('Add Opportunity successfully!');
      reload();
      setOpportunityModalOpen(false);
    }
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IOpportunityListPayload = { pageNum, pageSize };
    const values = formRef.current?.getFieldsValue();
    if (values.followUpCheck) {
      lodash.set(FE_NEED, 'followUpCheck', values.followUpCheck);
      lodash.set(BE_NEED, 'followUpCheck', values.followUpCheck);
    }

    if (values.followUpDuration) {
      lodash.set(FE_NEED, 'followUpDurationStart', values.followUpDuration[0]);
      lodash.set(FE_NEED, 'followUpDurationEnd', values.followUpDuration[1]);

      lodash.set(BE_NEED, 'followUpDurationStart', values.followUpDuration[0]);
      lodash.set(BE_NEED, 'followUpDurationEnd', values.followUpDuration[1]);
    }

    if (!!values.buList?.length) {
      lodash.set(FE_NEED, 'buList', values.buList);
      lodash.set(BE_NEED, 'buList', values.buList);
    }

    if (!!values.opportunityStatus?.length) {
      lodash.set(FE_NEED, 'opportunityStatus', values.opportunityStatus);
      lodash.set(BE_NEED, 'opportunityStatus', values.opportunityStatus);
    }

    if (values.projectNameObj) {
      lodash.set(FE_NEED, 'projectNameObj', values.projectNameObj);
      lodash.set(BE_NEED, 'opportunityId', values.projectNameObj.id);
    }

    if (values.customerNameObj) {
      lodash.set(FE_NEED, 'customerNameObj', values.customerNameObj);
      lodash.set(BE_NEED, 'customerOrLeadId', values.customerNameObj.id);
      lodash.set(BE_NEED, 'isCustomer', values.customerNameObj.isCustomer);
    }

    if (values.customerType) {
      lodash.set(FE_NEED, 'customerType', values.customerType);
      lodash.set(BE_NEED, 'customerType', values.customerType);
    }

    if (values.potentialVolumeQuantity) {
      lodash.set(
        FE_NEED,
        'potentialVolumeQuantityStart',
        values.potentialVolumeQuantity[0],
      );
      lodash.set(
        FE_NEED,
        'potentialVolumeQuantityEnd',
        values.potentialVolumeQuantity[1],
      );

      lodash.set(
        BE_NEED,
        'potentialVolumeQuantityStart',
        values.potentialVolumeQuantity[0],
      );
      lodash.set(
        BE_NEED,
        'potentialVolumeQuantityEnd',
        values.potentialVolumeQuantity[1],
      );
    }

    if (values.latestFollowUpTime) {
      const [start, end] = values.latestFollowUpTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;

      lodash.set(FE_NEED, 'latestFollowUpTimeStart', startTime);
      lodash.set(FE_NEED, 'latestFollowUpTimeEnd', endTime);

      lodash.set(BE_NEED, 'latestFollowUpTimeStart', startTime);
      lodash.set(BE_NEED, 'latestFollowUpTimeEnd', endTime);
    }

    if (values.latestStatusChangeTime) {
      const [start, end] = values.latestStatusChangeTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;

      lodash.set(FE_NEED, 'successfulClosedTimeStart', startTime);
      lodash.set(FE_NEED, 'successfulClosedTimeEnd', endTime);

      lodash.set(BE_NEED, 'successfulClosedTimeStart', startTime);
      lodash.set(BE_NEED, 'successfulClosedTimeEnd', endTime);
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;

      lodash.set(FE_NEED, 'createTimeStart', startTime);
      lodash.set(FE_NEED, 'createTimeEnd', endTime);

      lodash.set(BE_NEED, 'createTimeStart', startTime);
      lodash.set(BE_NEED, 'createTimeEnd', endTime);
    }

    if (!!selectedCustomerLeadOption.length) {
      const leadStatusArray = Object.keys(LeadStatusEnumText);
      const customerStatusEnumArray = Object.keys(CustomerStatusEnumText);
      const customerStatus: string[] = [],
        leadStatus: string[] = [];
      selectedCustomerLeadOption.forEach((item) => {
        if (leadStatusArray.includes(item.value as string)) {
          leadStatus.push(item.value as string);
        }
        if (customerStatusEnumArray.includes(item.value as string)) {
          customerStatus.push(item.value as string);
        }
      });
      lodash.set(FE_NEED, 'customerStatus', customerStatus);
      lodash.set(FE_NEED, 'leadStatus', leadStatus);

      lodash.set(BE_NEED, 'customerStatus', customerStatus);
      lodash.set(BE_NEED, 'leadStatus', leadStatus);
    }

    if (values.picUserRoleIdList) {
      lodash.set(FE_NEED, 'picUserRoleIdList', values.picUserRoleIdList);
      lodash.set(BE_NEED, 'picUserRoleIdList', values.picUserRoleIdList);
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
      followUpCheck: FE_NEED.followUpCheck,
      followUpDuration: [
        FE_NEED.followUpDurationStart,
        FE_NEED.followUpDurationEnd,
      ],
      buList: FE_NEED.buList,
      opportunityStatus: FE_NEED.opportunityStatus,
      customerType: FE_NEED.customerType,
      customerLeadStatus: lodash.uniq([
        ...(FE_NEED.customerStatus ?? []),
        ...(FE_NEED?.leadStatus ?? []),
      ]),
      latestFollowUpTime: [
        FE_NEED.latestFollowUpTimeStart
          ? dayjs(FE_NEED.latestFollowUpTimeStart)
          : undefined,
        FE_NEED.latestFollowUpTimeEnd
          ? dayjs(FE_NEED.latestFollowUpTimeEnd)
          : undefined,
      ],
      potentialVolumeQuantity: [
        FE_NEED.potentialVolumeQuantityStart,
        FE_NEED.potentialVolumeQuantityEnd,
      ],
      latestStatusChangeTime: [
        FE_NEED.successfulClosedTimeStart
          ? dayjs(FE_NEED.successfulClosedTimeStart)
          : undefined,
        FE_NEED.successfulClosedTimeEnd
          ? dayjs(FE_NEED.successfulClosedTimeEnd)
          : undefined,
      ],
      createdAt: [
        FE_NEED.createTimeStart ? dayjs(FE_NEED.createTimeStart) : undefined,
        FE_NEED.createTimeEnd ? dayjs(FE_NEED.createTimeEnd) : undefined,
      ],
    });

    // bd
    formRef.current?.setFieldsValue({
      picUserRoleIdList: FE_NEED.picUserRoleIdList,
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      projectNameObj: FE_NEED.projectNameObj
        ? FE_NEED.projectNameObj
        : undefined,
      customerNameObj: FE_NEED.customerNameObj
        ? FE_NEED.customerNameObj
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

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;

    await getDataSource({ ...BE_NEED, ...params });
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
    setSelectedCustomerLeadOption([]);
    // 自动触发 onSubmit
  };

  const buildPresets = () => {
    const currentMonth = dayjs();
    const currentMonthStart = dayjs().startOf('month');
    return [
      {
        label: 'Last 7 Days',
        value: [currentMonth.add(-7, 'd'), currentMonth],
      },
      { label: 'Current Month', value: [currentMonthStart, currentMonth] },
      { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
    ];
  };

  const getOptionsHandle = async () => {
    const res = await opportunityFunnelPerson();
    if (res.code === 200) {
      const list =
        res?.data?.map((_item: IOpportunityFunnelPerson) => {
          return {
            ..._item,
            label: _item.aliasName,
            value: _item.userRoleId,
          };
        }) ?? [];

      setBdPicOptions(list);
    }

    const optionList = Object.keys(OpportunitiesCustomerStatusEnumText).map(
      (item) => {
        return { label: item, value: item };
      },
    );
    setCustomerLeadOptions(optionList);
  };

  const columns: ProColumns[] = [
    {
      title: 'Follow-up Check',
      dataIndex: 'followUpCheck',
      valueType: 'select',
      valueEnum: FollowUpCheckEnumText,
      tooltip:
        'If a project remains in a non-final state for more than 14 days, it will be marked as "Overtime"',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Follow-up Check',
      },
      render: (_, record) => {
        const status: FollowUpCheckEnum = record.followUpCheck;
        const Content = (
          <Badge color={FollowUpCheckEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Follow-up Duration',
      dataIndex: 'followUpDuration',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Follow-up Duration', 'Follow-up Duration'],
      },
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        return !!defaultRender ? (
          <ProFormDigitRange
            fieldProps={{
              ...rest,
              className: styles.rangeInput,
              controls: false,
              min: 0,
              //@ts-ignore
              onChange: (value: [number, number]) => {
                if (!value) return;
                const [min, max] = value;

                if (min > max) {
                  message.warning(
                    'The minimum value cannot be greater than the maximum value',
                  );
                  form.setFieldsValue({ [item.dataIndex]: [max, min] });
                }
                return;
              },
            }}
          />
        ) : null;
      },
      render: (_, record) => {
        const followUpDuration = record.followUpDuration;

        return (
          <CustomTooltip title={formatAmount(followUpDuration)} placement="top">
            <span
              style={{
                color: followUpDuration > 60 ? '#FF4D4F' : '',
              }}
            >
              {formatAmount(followUpDuration)}
            </span>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'BU',
      dataIndex: 'buList',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: BUEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'BU',
        mode: 'multiple',
        maxTagCount: 2,
      },

      render: (_, record) => {
        return <CustomTooltip title={record.bu}>{record.bu}</CustomTooltip>;
      },
    },
    {
      title: 'BD/CAM PIC',
      dataIndex: 'picUserRoleIdList',
      ellipsis: { showTitle: false },
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'BD/CAM PIC',
        mode: 'multiple',
        showSearch: true,
        options: bdPicOptions,
        maxTagCount: 2,
        loading: bdPicOptions.length === 0,
        optionRender: (option: DefaultOptionType) => {
          return (
            <div className={styles.bdSelectOption}>
              <div
                className={styles.bdSelectOptionLabel}
                title={option.data?.label}
              >
                {option.data.label}
              </div>
              <div
                className={styles.bdSelectOptionRoleName}
                title={option.data?.roleName}
              >
                {option.data?.roleName}
              </div>
            </div>
          );
        },
        filterOption: (input: string, option: DefaultOptionType) => {
          return ((option as { label: string; value: string })?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
      render: (_, record) => {
        const { picType, picUserAliasName } = record;
        const content = `${picType}:${picUserAliasName}`;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Opportunity Status',
      dataIndex: 'opportunityStatus',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: OpportunitiesStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Opportunity Status',
        mode: 'multiple',
        maxTagCount: 2,
      },
      render: (_, record) => {
        const status: OpportunitiesStatusEnum = record.opportunityStatus;
        const Content = (
          <Badge color={OpportunitiesStatusEnumColor[status]} text={status} />
        );
        return (
          <CustomTooltip title={Content}>
            <div className={styles.opportunityStatus}>{Content}</div>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerNameObj',
      valueType: 'select',
      width: 260,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return <CustomerLeadSelector placeholder={`Customer Name`} />;
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'projectNameObj',
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Project Name' }}
            request={{
              field: 'projectName',
              esDtoClass: ES_DTO_CLASS.OPPORTUNITY,
              type: FieldQueryHighlightTypeEnum.USER_ROLE,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName} placement="top">
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Type',
      dataIndex: 'customerType',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: OpportunitiesCustomerTypeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Customer Type',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerType}>
            {record.customerType}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer/Lead Status',
      dataIndex: 'customerLeadStatus',
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Customer/Lead Status',
        mode: 'multiple',
        maxTagCount: 2,
        options: customerLeadOptions,
        onChange: (_: any, option: DefaultOptionType[]) => {
          setSelectedCustomerLeadOption(option);
        },
      },

      render: (_, record) => {
        const status: OpportunitiesCustomerStatusEnum =
          record.customerStatus || record.leadStatus;
        const Content = (
          <Badge
            color={OpportunitiesCustomerStatusEnumColor[status]}
            text={status}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Latest Follow-up Time',
      dataIndex: 'latestFollowUpTime',
      valueType: 'dateRange',
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: [
          'Latest Follow-up Time Start',
          'Latest Follow-up Time End',
        ],
        presets: presets,
        onOpenChange: (boolean: boolean) => {
          if (boolean) {
            setPresets(buildPresets());
          }
        },
      },
      render: (_, record) => {
        const formatData = record.latestFollowUpTime
          ? dayjs(record.latestFollowUpTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined;

        return <CustomTooltip title={formatData}>{formatData}</CustomTooltip>;
      },
    },
    {
      title: 'Potential Volume',
      dataIndex: 'potentialVolumeQuantity',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Potential Volume', 'Potential Volume'],
      },
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        return !!defaultRender ? (
          <ProFormDigitRange
            fieldProps={{
              ...rest,
              className: styles.rangeInput,
              controls: false,
              min: 0,
              //@ts-ignore
              onChange: (value: [number, number]) => {
                if (!value) return;
                const [min, max] = value;
                if (min > max) {
                  message.warning(
                    'The minimum value cannot be greater than the maximum value',
                  );
                  form.setFieldsValue({ [item.dataIndex]: [max, min] });
                }
                return;
              },
            }}
          />
        ) : null;
      },
      render: (_, record) => {
        const { potentialVolumeQuantityPerMonth } = record;
        const str =
          potentialVolumeQuantityPerMonth ||
          potentialVolumeQuantityPerMonth === 0
            ? `${formatAmount(potentialVolumeQuantityPerMonth)}/M`
            : '';
        return <CustomTooltip title={str}>{str}</CustomTooltip>;
      },
    },
    {
      title: 'Remark',
      dataIndex: 'followUpRemark',
      hideInSearch: true,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.followUpRemark} placement="top">
            {record.followUpRemark}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Successful Closed Time',
      dataIndex: 'latestStatusChangeTime',
      valueType: 'dateRange',
      width: 200,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: [
          'Successful Closed Time Start',
          'Successful Closed Time End',
        ],
        presets: presets,
        onOpenChange: (boolean: boolean) => {
          if (boolean) {
            setPresets(buildPresets());
          }
        },
      },
      render: (_, record) => {
        const formatData = dayjs(record.latestStatusChangeTime).format(
          'YYYY-MM-DD HH:mm:ss',
        );
        return record.opportunityStatus ===
          OpportunitiesStatusEnum.SUCCESSFUL_CLOSED ? (
          <CustomTooltip title={formatData}>{formatData}</CustomTooltip>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Creation Time Start', 'Creation Time End'],
        presets: presets,
        onOpenChange: (boolean: boolean) => {
          if (boolean) {
            setPresets(buildPresets());
          }
        },
      },
      render: (_, record) => {
        const formatData = dayjs(record.createdAt).format(
          'YYYY-MM-DD HH:mm:ss',
        );
        return <CustomTooltip title={formatData}>{formatData}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 230,
      hideInTable:
        !access[PermissionEnum.OPPORTUNITY_DETAIL] &&
        !access[PermissionEnum.OPPORTUNITY_LIST_FOLLOW_UP],
      render: (_, record) => {
        return (
          <Space split={<Divider type="vertical" />} size="small">
            <Access
              key="detail"
              accessible={access[PermissionEnum.OPPORTUNITY_DETAIL]}
            >
              <div
                className={styles.btn}
                onClick={() => {
                  saveScrollTop();
                  history.push(
                    `${PATHS.OPPORTUNITIES_LIST_DETAIL}/${record.opportunityId}`,
                  );
                }}
              >
                <BarsOutlined />
                Detail
              </div>
            </Access>
            <Access
              key="followUp"
              accessible={access[PermissionEnum.OPPORTUNITY_LIST_FOLLOW_UP]}
            >
              {SHOW_OPPORTUNITY_DETAIL_FOLLOW_UP_STATUS_LIST.includes(
                record.opportunityStatus,
              ) && (
                <div
                  className={styles.btn}
                  onClick={() => {
                    setActiveOpportunityId(record.opportunityId);
                    setFollowingUpModalOpen(true);
                  }}
                >
                  <EditOutlined />
                  Follow Up
                </div>
              )}
            </Access>
          </Space>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create"
      accessible={access[PermissionEnum.OPPORTUNITY_LIST_CREATE]}
    >
      <Button key="create" type="primary" onClick={() => onCreateOpportunity()}>
        Create Opportunity
      </Button>
    </Access>,
  ];

  useEffect(() => {
    doFirstQuery();
    getOptionsHandle();
  }, []);

  return (
    <>
      <CustomTable
        rowKey="opportunityId"
        columns={columns}
        scroll={{ x: 2500 }}
        formRef={formRef}
        form={{
          name: 'opportunity-list',
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
      {opportunityModalOpen ? (
        <OpportunitiesAddModal
          open={opportunityModalOpen}
          onConfirm={onAddModalConfirm}
          modalProps={{
            maskClosable: false,
            okText: 'Confirm',
            onCancel: () => {
              setOpportunityModalOpen(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: confirmOpportunityLoading,
            },
          }}
        />
      ) : null}

      {followingUpModalOpen ? (
        <FollowingUpModal
          open={followingUpModalOpen}
          id={activeOpportunityId}
          onCancel={() => setFollowingUpModalOpen(false)}
          onConfirm={() => {
            setFollowingUpModalOpen(false);
            reload();
          }}
        />
      ) : null}
    </>
  );
};

export default OpportunitiesList;
