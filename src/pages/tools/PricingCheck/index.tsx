import {
  pricingCheckWaybillExport,
  pricingCheckWaybillList,
  waybillConfirmPriceResult,
} from '@/api/tool';
import { IPricingCheckWaybillItem } from '@/api/types/tool';
import {
  IWaybillBatchFailedDetailItem,
  IWaybillBatchSubmitOrStartResult,
  IWaybillListItem,
  IWaybillRejectParams,
} from '@/api/types/waybill';
import { waybillConfirmPrice, waybillReject } from '@/api/waybill';
// import CustomStatusButton, { ThemeEnum } from '@/components/CustomStatusButton';
import { getUserGuidanceUpdate } from '@/api-uam/common';
import { getTruckTypeList } from '@/api/truck';
import { ITruckTypeListItem } from '@/api/types/truck';
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
import {
  CountryCurrencyEnumText,
  FieldQueryHighlightTypeEnum,
  GetUserGuidanceEnum,
  WaybillFinancialStatusEnum,
  WaybillFinancialStatusEnumText,
  WaybillFinancialStatusEnumTextColor,
  WaybillStatusEnum,
  WaybillStatusEnumTextColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import BatchErrorModal from '@/pages/waybill/components/BatchErrorModal';
import BatchLockModal, {
  EnumBatchType,
} from '@/pages/waybill/components/BatchLockModal';
import BatchSuccessModal from '@/pages/waybill/components/BatchSuccessModal';
import { aggregateToJsonArray2 } from '@/pages/waybill/components/DetailInformationCard';
import {
  DATE_WIDTH,
  DATE_WIDTH2,
  DEFAULT_WIDTH,
} from '@/pages/waybill/components/Filter/constant';
import WaybillRejectModal from '@/pages/waybill/components/WaybillRejectModal';
import { doDownloadCenterAnimate } from '@/utils/animate';
import {
  formatAmount,
  formatAmountPercentage,
  openNewTag,
} from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { HistoryOutlined } from '@ant-design/icons';
import {
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, useAccess, useModel } from '@umijs/max';
import { App, Badge, Button, Divider, Space, Switch } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { Key, useCallback, useEffect, useRef, useState } from 'react';
import BatchConfirmPriceModal from './BatchConfirmPriceModal';
import styles from './index.less';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  unloadingOrAbnormalTimeStart?: string;
  unloadingOrAbnormalTimeEnd?: string;
  positionTimeStart?: string;
  positionTimeEnd?: string;
  customerTotalAmountMin?: string;
  customerTotalAmountMax?: string;
  vendorTotalAmountMin?: string;
  vendorTotalAmountMax?: string;
  grossMarginMin?: string;
  grossMarginMax?: string;
  waybillNumber?: string;
  projectId?: number;
  include?: boolean;
  vendorId?: number;
  actualTruckTypeId?: number[];
  requiredTruckTypeId?: number[];
  routeCode?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  projectNameObj?: I_FUZZY_API_RESPONSE;
  waybillId?: number;
  vendorName?: string;
}

const PricingCheck: React.FC = () => {
  const { initialState: userInfo, setInitialState: setUserInfo } =
    useModel('@@initialState');
  const completedGuidance =
    userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const countryId = userInfo?.currentUser?.countryId;

  const access = useAccess();
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();
  const [confirmPriceLoading, setConfirmPriceLoading] =
    useState<boolean>(false);
  const [showReject, setShowReject] = useState<boolean>(false);
  const [rejectConfirmLoading, setRejectConfirmLoading] =
    useState<boolean>(false);
  const [activeRecord, setActiveRecord] = useState<IPricingCheckWaybillItem>();
  const [batchConfirmPriceModalOpen, setBatchConfirmPriceModalOpen] =
    useState<boolean>(false);

  const [batchConfirmPriceUsefulIdList, setBatchConfirmPriceUsefulIdList] =
    useState<number[]>([]);
  const [neverBatchConfirmPrice, setNeverBatchConfirmPrice] = useState(true);
  const [batchResultLoading, setBatchResultLoading] = useState(false);
  const [tableSelect, setTableSelect] = useState<{
    ids: [];
    options: IWaybillListItem[];
  }>({
    ids: [],
    options: [],
  });
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [batchType, setBatchType] = useState<EnumBatchType>(
    EnumBatchType.CONFIRM_PRICE,
  );
  const [batchErrorModalOpen, setBatchErrorModalOpen] = useState(false);
  const [batchSuccessModalOpen, setBatchSuccessModalOpen] = useState(false);
  const [failedDetailList, setFailedDetailList] = useState<
    IWaybillBatchFailedDetailItem[]
  >([]);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [projectNameInclude, setProjectNameInclude] = useState<boolean>(true);
  const [newProjectNameObj, setNewProjectNameObj] =
    useState<I_FUZZY_API_RESPONSE>();

  const [batchPriceOpen, setBatchPriceOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [truckTypeList, setTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  // 用户引导
  const downloadRef = useRef<any>(null);
  const exportRef = useRef<any>(null);
  const animation = useAddAnimation(exportRef, downloadRef);
  const selectedKey = 'waybillId';
  const playAnimation = () => {
    animation(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
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

  const selectedALL = useRef<any>([]);
  // 多选
  const onHandleSelect = (record: any, selected: any) => {
    const idx = selectedALL.current.findIndex(
      (i: any) => i[selectedKey] === record[selectedKey],
    );
    if (selected) {
      selectedALL.current.push(record);
    } else {
      selectedALL.current.splice(idx, 1);
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
    setTableSelect({ ids: a, options: selectedALL.current });
  };

  const onHandleSelectAll = (
    selected: any,
    selectedRows: { current: any[] },
    changeRows: any[],
  ) => {
    if (selected) {
      selectedALL.current = selectedALL.current.concat(changeRows);
    } else {
      changeRows.forEach((i) => {
        selectedALL.current.forEach((m: any, mIndex: any) => {
          if (i[selectedKey] === m[selectedKey]) {
            selectedALL.current.splice(mIndex, 1);
          }
        });
      });
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
    setTableSelect({ ids: a, options: selectedALL.current });
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

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await pricingCheckWaybillList(BE_NEED).finally(() => {
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

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (newProjectNameObj) {
      lodash.set(FE_NEED, 'projectNameObj', newProjectNameObj);
      lodash.set(BE_NEED, 'projectId', newProjectNameObj.id);
    }

    lodash.set(FE_NEED, 'include', projectNameInclude);
    lodash.set(BE_NEED, 'include', projectNameInclude);

    if (values.unloadingOrAbnormalTime) {
      const [start, end] = values.unloadingOrAbnormalTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'unloadingOrAbnormalTimeStart', startTime);
      lodash.set(FE_NEED, 'unloadingOrAbnormalTimeEnd', endTime);

      lodash.set(BE_NEED, 'unloadingOrAbnormalTimeStart', startTime);
      lodash.set(BE_NEED, 'unloadingOrAbnormalTimeEnd', endTime);
    }

    if (values.positionTime) {
      const [start, end] = values.positionTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'positionTimeStart', startTime);
      lodash.set(FE_NEED, 'positionTimeEnd', endTime);

      lodash.set(BE_NEED, 'positionTimeStart', startTime);
      lodash.set(BE_NEED, 'positionTimeEnd', endTime);
    }

    if (values.waybillNumber) {
      lodash.set(FE_NEED, 'waybillNumber', values.waybillNumber?.name);
      lodash.set(FE_NEED, 'waybillId', values.waybillNumber?.id);
      lodash.set(BE_NEED, 'waybillNumber', values.waybillNumber?.name);
    }

    if (values.vendorName) {
      lodash.set(FE_NEED, 'vendorName', values.vendorName?.name);
      lodash.set(FE_NEED, 'vendorId', values.vendorName?.id);
      lodash.set(BE_NEED, 'vendorId', values.vendorName?.id);
    }

    if (values.actualTruckType) {
      lodash.set(FE_NEED, 'actualTruckTypeId', values.actualTruckType);
      lodash.set(BE_NEED, 'actualTruckTypeId', values.actualTruckType);
    }

    if (values.requiredTruckType) {
      lodash.set(FE_NEED, 'requiredTruckTypeId', values.requiredTruckType);
      lodash.set(BE_NEED, 'requiredTruckTypeId', values.requiredTruckType);
    }
    if (values.routeCode) {
      lodash.set(FE_NEED, 'routeCode', values.routeCode);
      lodash.set(BE_NEED, 'routeCode', values.routeCode);
    }

    if (values.customerTotalAmount) {
      lodash.set(
        FE_NEED,
        'customerTotalAmountMin',
        values.customerTotalAmount[0],
      );
      lodash.set(
        FE_NEED,
        'customerTotalAmountMax',
        values.customerTotalAmount[1],
      );

      lodash.set(
        BE_NEED,
        'customerTotalAmountMin',
        values.customerTotalAmount[0],
      );
      lodash.set(
        BE_NEED,
        'customerTotalAmountMax',
        values.customerTotalAmount[1],
      );
    }
    if (values.vendorTotalAmount) {
      lodash.set(FE_NEED, 'vendorTotalAmountMin', values.vendorTotalAmount[0]);
      lodash.set(FE_NEED, 'vendorTotalAmountMax', values.vendorTotalAmount[1]);

      lodash.set(BE_NEED, 'vendorTotalAmountMin', values.vendorTotalAmount[0]);
      lodash.set(BE_NEED, 'vendorTotalAmountMax', values.vendorTotalAmount[1]);
    }
    if (values.grossMargin) {
      lodash.set(FE_NEED, 'grossMarginMin', values.grossMargin[0]);
      lodash.set(FE_NEED, 'grossMarginMax', values.grossMargin[1]);

      lodash.set(BE_NEED, 'grossMarginMin', values.grossMargin[0]);
      lodash.set(BE_NEED, 'grossMarginMax', values.grossMargin[1]);
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
      unloadingOrAbnormalTime: [
        FE_NEED.unloadingOrAbnormalTimeStart
          ? dayjs(FE_NEED.unloadingOrAbnormalTimeStart)
          : undefined,
        FE_NEED.unloadingOrAbnormalTimeEnd
          ? dayjs(FE_NEED.unloadingOrAbnormalTimeEnd)
          : undefined,
      ],
      positionTime: [
        FE_NEED.positionTimeStart
          ? dayjs(FE_NEED.positionTimeStart)
          : undefined,
        FE_NEED.positionTimeEnd ? dayjs(FE_NEED.positionTimeEnd) : undefined,
      ],

      // projectNameObj: FE_NEED.projectNameObj
      //   ? FE_NEED.projectNameObj
      //   : undefined,
      waybillNumber: FE_NEED.waybillNumber
        ? {
            id: FE_NEED.waybillId,
            name: FE_NEED.waybillNumber,
          }
        : undefined,
      vendorName: FE_NEED.vendorName
        ? {
            id: FE_NEED.vendorId,
            name: FE_NEED.vendorName,
          }
        : undefined,
      actualTruckType: FE_NEED.actualTruckTypeId
        ? FE_NEED.actualTruckTypeId
        : undefined,
      requiredTruckType: FE_NEED.requiredTruckTypeId
        ? FE_NEED.requiredTruckTypeId
        : undefined,
      routeCode: FE_NEED.routeCode ? FE_NEED.routeCode : undefined,
      customerTotalAmount: [
        FE_NEED.customerTotalAmountMin,
        FE_NEED.customerTotalAmountMax,
      ],
      vendorTotalAmount: [
        FE_NEED.vendorTotalAmountMin,
        FE_NEED.vendorTotalAmountMax,
      ],
      grossMargin: [FE_NEED.grossMarginMin, FE_NEED.grossMarginMax],
    });
    setNewProjectNameObj(FE_NEED.projectNameObj);
    setProjectNameInclude(!!FE_NEED?.include);
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
    setNewProjectNameObj(undefined);
    setProjectNameInclude(true);
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

  // Confirm Price
  const doConfirmPrice = async (record: IPricingCheckWaybillItem) => {
    setActiveRecord(record);
    setConfirmPriceLoading(true);
    const { waybillId } = record;
    const res = await waybillConfirmPrice({ id: waybillId }).finally(() => {
      setConfirmPriceLoading(false);
    });
    if (res.code === 200) {
      if (res.data?.code === 1) {
        message.success(`${res.data?.msg}`);
      } else {
        message.success(`Confirm Price successfully`);
      }
      reload();
    }
  };

  const doRejectPrice = async (record: IPricingCheckWaybillItem) => {
    setActiveRecord(record);
    setShowReject(true);
  };

  const onRejectConfirm = async (data: IWaybillRejectParams) => {
    if (activeRecord?.waybillId) {
      setRejectConfirmLoading(true);

      const { waybillId } = activeRecord;
      const params: IWaybillRejectParams = {
        ...data,
        id: waybillId,
      };
      const res = await waybillReject(params).finally(() => {
        setRejectConfirmLoading(false);
      });
      if (res.code === 200) {
        message.success(`Reject Price successfully`);
        setShowReject(false);
        reload();
      }
    }
  };

  const doDownload = async () => {
    setExportLoading(true);
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    const payload = { ...BE_NEED };
    delete payload.pageNum;
    delete payload.pageSize;
    const res = await pricingCheckWaybillExport(payload).finally(() => {
      setExportLoading(false);
    });
    if (res.code === 200) {
      doDownloadCenterAnimate();
    }
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

  const onConfirmPrice = async () => {
    setBatchConfirmPriceUsefulIdList(tableSelect.ids);
    setBatchConfirmPriceModalOpen(true);
  };

  const openBatchResult = async (_batchType: EnumBatchType) => {
    setBatchType(_batchType);

    setBatchResultLoading(true);
    const res = await waybillConfirmPriceResult().finally(() => {
      setBatchResultLoading(false);
      setBatchPriceOpen(false);
    });
    setFailedDetailList([]);
    if (res.code === 200) {
      const {
        totalNum,
        successNum,
        failedNum,
        failedDetailList: _failedDetailList,
      } = res.data;

      if (totalNum !== null) {
        // 展示处理结果
        if (failedNum > 0) {
          setFailedDetailList(_failedDetailList);
          setBatchErrorModalOpen(true);
        } else if (totalNum > 0 && successNum === totalNum) {
          setBatchSuccessModalOpen(true);
        } else {
          // 成功了部分
          // do nothing
        }
      } else {
        // 没有操作过批量操作或者已经看过批量操作结果
      }
    }
  };

  const checkBatchResult = async () => {
    const allSettled: Array<
      Promise<APIJSON<IWaybillBatchSubmitOrStartResult>>
    > = [waybillConfirmPriceResult()];
    Promise.allSettled(allSettled).then(([submitResult]) => {
      if (submitResult.status === 'fulfilled') {
        if (submitResult.value.code === 200) {
          const { inProcessing } = submitResult.value.data;

          if (inProcessing === true) {
            setBatchType(EnumBatchType.CONFIRM_PRICE);
            setLockModalOpen(true);
            setNeverBatchConfirmPrice(false);
          } else {
            if (submitResult.value.data.totalNum === null) {
              // 没有批量处理过
              setNeverBatchConfirmPrice(true);
            } else {
              // 批量处理过
              setNeverBatchConfirmPrice(false);
            }
          }
        }
      }
    });
  };

  const toolBarRender = () => [
    <Access
      key="ConfirmPrice"
      accessible={access[PermissionEnum.PRICING_CHECK_BATCH_CONFIRM_PRICE]}
    >
      <Space
        split={<Divider type="vertical" style={{ margin: 4 }} />}
        align="center"
        size={0}
      >
        <Button
          disabled={tableSelect.ids.length === 0}
          onClick={onConfirmPrice}
        >
          Confirm Price
        </Button>
        {!neverBatchConfirmPrice && (
          <CustomTooltip
            trigger={['hover']}
            destroyTooltipOnHide
            title="View the results of the most recent batch confirm price"
            open={batchPriceOpen}
            zIndex={1000}
          >
            <Button
              icon={<HistoryOutlined />}
              onMouseEnter={() => setBatchPriceOpen(true)}
              onMouseLeave={() => setBatchPriceOpen(false)}
              onClick={() => {
                openBatchResult(EnumBatchType.CONFIRM_PRICE);
              }}
              loading={
                batchResultLoading && batchType === EnumBatchType.CONFIRM_PRICE
              }
            />
          </CustomTooltip>
        )}
      </Space>
    </Access>,
    <Access key="Export" accessible={true}>
      <Button ref={exportRef} loading={exportLoading} onClick={onExport}>
        Export
      </Button>
    </Access>,
  ];

  const tableAlertRender = () => {
    return (
      <>
        <div
          style={{
            color: 'rgba(0, 0, 0, 45%)',
            fontSize: '14px',
            lineHeight: '22px',
          }}
        >
          <span
            style={{
              color: 'rgba(0, 0, 0, 85%)',
            }}
          >
            {tableSelect.ids.length}
          </span>
          &nbsp; records in total
        </div>
      </>
    );
  };

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      valueType: 'select',
      width: 130,
      order: 12,
      fixed: 'left',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Waybill Number' }}
            request={{
              field: 'waybillNumber',
              esDtoClass: ES_DTO_CLASS.WAYBILL,
              type: FieldQueryHighlightTypeEnum.None,
            }}
          />
        );
      },

      render: (_, record) => {
        const showDetail = access[PermissionEnum.WAYBILL_DETAIL];
        return (
          <CustomTooltip title={record.waybillNumber}>
            {showDetail ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  openNewTag(
                    `${PATHS.WAYBILL_LIST_DETAIL}/${record.waybillId}`,
                  );
                }}
              >
                {record.waybillNumber}
              </Button>
            ) : (
              record.waybillNumber
            )}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Route Code',
      dataIndex: 'routeCode',
      width: 200,
      order: 8,
      ellipsis: {
        showTitle: false,
      },
      hideInTable: true,

      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Route Code',
      },
    },
    {
      title: 'Position Time',
      dataIndex: 'positionTime',
      width: 180,
      order: 7,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'dateTimeRange',
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH2}px`,
        },
      },
      fieldProps: {
        placeholder: ['Position Time Start', 'Position Time End'],
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            title={dayjs(record.positionTime).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.positionTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Unloading Time',
      dataIndex: 'unloadingOrAbnormalTime',
      order: 6,
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'dateTimeRange',
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH2}px`,
        },
      },
      fieldProps: {
        placeholder: ['Unloading Time Start', 'Unloading Time End'],
      },
      render: (_, record) => {
        const str = record.unloadingOrAbnormalTime
          ? dayjs(record.unloadingOrAbnormalTime).format('YYYY-MM-DD HH:mm:ss')
          : '-';
        return <CustomTooltip title={str}>{str}</CustomTooltip>;
      },
    },

    {
      title: 'Project Name',
      dataIndex: 'projectNameObj',
      valueType: 'select',
      order: 5,
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <Space.Compact>
            <div className={styles.customSwitch}>
              <Switch
                style={{ width: 70 }}
                checkedChildren="Include"
                unCheckedChildren="Exclude"
                value={projectNameInclude}
                onChange={(v) => setProjectNameInclude(v)}
              />
            </div>
            <FuzzySelector
              fieldProps={{ placeholder: 'Project Name' }}
              request={{
                field: 'projectName',
                esDtoClass: ES_DTO_CLASS.PROJECT,
                type: FieldQueryHighlightTypeEnum.USER_ROLE,
              }}
              value={newProjectNameObj}
              //@ts-ignore
              onChange={(val: I_FUZZY_API_RESPONSE) => {
                setNewProjectNameObj(val);
              }}
            />
          </Space.Compact>
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Customer Total Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'customerTotalAmount',
      align: 'right',
      width: 180,
      hideInTable: true,
      order: 4,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: [
          'Customer Total Amount(min)',
          'Customer Total Amount(max)',
        ],
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
              precision: 2,
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
        const valStr = formatAmountPercentage(record.customerTotalAmount);
        return <CustomTooltip title={valStr}>{valStr}</CustomTooltip>;
      },
    },
    {
      title: `Vendor Total Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'vendorTotalAmount',
      align: 'right',
      width: 180,
      hideInTable: true,
      order: 3,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Vendor Total Amount(min)', 'Vendor Total Amount(max)'],
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
              precision: 2,
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
        const valStr = formatAmountPercentage(record.vendorTotalAmount);
        return <CustomTooltip title={valStr}>{valStr}</CustomTooltip>;
      },
    },

    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      hideInSearch: true,
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName ? record.customerName : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name(Trucker Name)',
      dataIndex: 'vendorName',
      ellipsis: {
        showTitle: false,
      },
      order: 11,
      width: 250,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Vendor Name' }}
            request={{
              field: 'vendorName',
              esDtoClass: ES_DTO_CLASS.VENDOR,
              type: FieldQueryHighlightTypeEnum.COUNTRY,
            }}
          />
        );
      },
      render: (_, record) => (
        <CustomTooltip title={record.vendorName}>
          {record.vendorName ? record.vendorName : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Total Amount',
      dataIndex: 'waybillReceivableAmount',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        const { waybillReceivableAmount } = record;
        const content =
          typeof waybillReceivableAmount === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(waybillReceivableAmount)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Basic Amount Receivable',
      dataIndex: 'basicAmountReceivable',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        const { basicAmountReceivable } = record;
        const content =
          typeof basicAmountReceivable === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(basicAmountReceivable)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Customer Additional Charge',
      dataIndex: 'additionalAmountReceivable',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        const { additionalAmountReceivable } = record;
        const content =
          typeof additionalAmountReceivable === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(additionalAmountReceivable)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Customer Additional Charge Item',
      dataIndex: 'customerAdditionalDetails',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        return <pre>{record.customerAdditionalDetails}</pre>;
      },
    },
    {
      title: 'Vendor Total Amount',
      dataIndex: 'waybillPayableAmount',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        const { waybillPayableAmount } = record;
        const content =
          typeof waybillPayableAmount === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(waybillPayableAmount)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Vendor Paid In advance',
      dataIndex: 'paidInAdvance',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        const { paidInAdvance } = record;
        const content =
          typeof paidInAdvance === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(paidInAdvance)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Vendor Basic Amount Payable(Remaining)',
      dataIndex: 'basicAmountPayable',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 300,
      align: 'right',
      render: (_, record) => {
        const { basicAmountPayable } = record;
        const content =
          typeof basicAmountPayable === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(basicAmountPayable)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Vendor Additional Charge',
      dataIndex: 'vendorAdditionalDetails',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      align: 'right',
      render: (_, record) => {
        return <pre>{record.vendorAdditionalDetails}</pre>;
      },
    },
    {
      title: 'Actual Truck Type',
      dataIndex: 'actualTruckType',

      ellipsis: {
        showTitle: false,
      },
      width: 200,
      order: 10,
      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Actual Truck Type',
        options: truckTypeList,
        showSearch: true,
        mode: 'multiple',
        filterOption: (input: string, option: { label: string }) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
      render: (_, record) => (
        <CustomTooltip title={record.actualTruckType}>
          {record.actualTruckType ? record.actualTruckType : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Required Truck Type',
      dataIndex: 'requiredTruckType',

      ellipsis: {
        showTitle: false,
      },
      width: 200,
      order: 9,

      valueType: 'select',
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Required Truck Type',
        options: truckTypeList,
        showSearch: true,
        mode: 'multiple',

        filterOption: (input: string, option: { label: string }) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
      render: (_, record) => (
        <CustomTooltip title={record.requiredTruckType}>
          {record.requiredTruckType ? record.requiredTruckType : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Transportation Status',
      dataIndex: 'transportationStatus',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        const transportationStatus: WaybillStatusEnum =
          record.transportationStatus;
        const Content = (
          <Badge
            color={WaybillStatusEnumTextColor[transportationStatus]}
            text={transportationStatus}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Financial Status',
      dataIndex: 'financialStatus',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 210,
      render: (_, record) => {
        const financialStatus: WaybillFinancialStatusEnum =
          record.financialStatus;
        const Content = (
          <Badge
            color={WaybillFinancialStatusEnumTextColor[financialStatus]}
            text={WaybillFinancialStatusEnumText[financialStatus]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Dispatch Type',
      dataIndex: 'dispatchType',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip title={record.dispatchType}>
          {record.dispatchType ? record.dispatchType : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Origin Label',
      dataIndex: 'originLabel',
      hideInSearch: true,
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.originLabel}>
            {record.originLabel}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Origin Region',
      dataIndex: 'originRegion',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.originRegion}>
          {record.originRegion ? record.originRegion : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Destination Label',
      dataIndex: 'destinationLabel',
      hideInSearch: true,
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render(_, record) {
        return (
          <CustomTooltip title={record.destinationLabel}>
            {record.destinationLabel}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Destination Region',
      dataIndex: 'destinationRegion',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.destinationRegion}>
          {record.destinationRegion ? record.destinationRegion : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Waypoint',
      dataIndex: 'waypoint',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.waypoint}>
          {record.waypoint ? record.waypoint : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Route Code',
      dataIndex: 'routeCode',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.routeCode}>
          {record.routeCode ? record.routeCode : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'No. of Drops',
      dataIndex: 'noOfDrops',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={formatAmount(record.noOfDrops)}>
          {record.noOfDrops ? formatAmount(record.noOfDrops) : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Code',
      dataIndex: 'customerCodes',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render(_, record) {
        const list = aggregateToJsonArray2(record.customerCodes);
        const customerCode =
          list.reduce((acc, cur, index) => {
            const curStr = !!cur.number
              ? `${cur.customerCodeTypeName}:${cur.number}`
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
      title: 'Remark',
      dataIndex: 'remark',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 250,
      render: (_, record) => (
        <CustomTooltip title={record.remark}>
          {record.remark ? record.remark : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossProfit',
      hideInSearch: true,
      fixed: 'right',
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      order: 2,
      render: (_, record) => {
        const { grossProfit } = record;
        const content =
          typeof grossProfit === 'number'
            ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(grossProfit)}`
            : '-';

        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Gross Margin',
      dataIndex: 'grossMargin',

      align: 'right',
      fixed: 'right',
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Gross Margin(min)', 'Gross Margin(max)'],
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
              suffix: '%',
              precision: 2,
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
        const { grossMargin } = record;
        const content =
          typeof grossMargin === 'number'
            ? `${formatAmount(grossMargin)}%`
            : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 160,
      render: (_, record) => {
        const showConfirmPrice = [
          WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION,
        ].includes(record?.financialStatus);

        const showRejectPrice = [
          WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION,
          WaybillFinancialStatusEnum.AWAITING_SETTLEMENT,
        ].includes(record?.financialStatus);

        return (
          <Space split={<Divider type="vertical" />} align="center" size={0}>
            {showConfirmPrice && (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => doConfirmPrice(record)}
                loading={
                  confirmPriceLoading &&
                  activeRecord?.waybillId === record.waybillId
                }
              >
                Confirm
              </Button>
            )}

            {showRejectPrice && (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => doRejectPrice(record)}
              >
                Reject
              </Button>
            )}
          </Space>
        );
      },
    },
  ];
  const onTruckTypeOption = async () => {
    const res = await getTruckTypeList();
    if (res.code === 200) {
      const list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setTruckTypeList(list);
    }
  };
  useEffect(() => {
    onTruckTypeOption();
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  useEffect(() => {
    if (true) {
      checkBatchResult();
    }
  }, []);

  useEffect(() => {
    downloadRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <>
      <CustomTable
        rowKey="waybillId"
        selectedKey="waybillId"
        size="small"
        columns={columns}
        scroll={{ x: 4000 }}
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
        rowSelection={{
          selectedRowKeys,
          onSelect: onHandleSelect,
          // @ts-ignore
          onSelectAll: onHandleSelectAll,
        }}
        loading={loading}
        toolBarRender={toolBarRender}
        tableAlertRender={tableAlertRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />

      <BatchConfirmPriceModal
        // selectedList={tableSelect.options}
        usefulIdList={batchConfirmPriceUsefulIdList}
        open={batchConfirmPriceModalOpen}
        onClose={() => setBatchConfirmPriceModalOpen(false)}
        onFinish={() => {
          doFirstQuery();
          setTableSelect({ ids: [], options: [] });
          selectedALL.current = [];
          setSelectedRowKeys([]);
          setNeverBatchConfirmPrice(false);
        }}
      />

      <BatchLockModal
        type={batchType}
        open={lockModalOpen}
        onFinish={() => {
          setLockModalOpen(false);
          doFirstQuery();

          setNeverBatchConfirmPrice(false);
        }}
      />

      <BatchErrorModal
        open={batchErrorModalOpen}
        failedDetailList={failedDetailList}
        onCancel={() => {
          setBatchErrorModalOpen(false);
          setBatchPriceOpen(false);
        }}
      />

      <BatchSuccessModal
        open={batchSuccessModalOpen}
        type={batchType}
        onCancel={() => {
          setBatchSuccessModalOpen(false);
          setBatchPriceOpen(false);
        }}
      />

      {showReject && (
        <WaybillRejectModal
          open={showReject}
          onConfirm={onRejectConfirm}
          rejectTitle={'Reject Price'}
          waybillFinancialStatus={activeRecord?.financialStatus as string}
          modalProps={{
            onCancel: () => setShowReject(false),
          }}
          submitter={{
            submitButtonProps: {
              loading: rejectConfirmLoading,
            },
          }}
        />
      )}
    </>
  );
};

export default PricingCheck;
