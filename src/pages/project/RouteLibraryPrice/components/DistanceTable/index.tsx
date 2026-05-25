import {
  changeRouteTablePrice,
  getPriceTableList,
  getTruckTypeAndRange,
} from '@/api/project';
import {
  IRoutePriceVersionListItem,
  IRouteVersionListItem,
  ITypeAndRangeItem,
} from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import RegionSelect from '@/components/RegionSelect';
import { MAX_LENGTH } from '@/constants';
import {
  CountryCurrencyEnumText,
  ROUTE_LIBRARY_IDENTITY,
  ROUTE_LIBRARY_MODE,
} from '@/enums';
import RouteLibraryBillingTable from '@/pages/project/components/RouteLibraryPriceTable';
import { formatAmount } from '@/utils/utils';
import {
  ProForm,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Empty, Form, Spin } from 'antd';
import { throttle } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../index.less';

const ROUTE_BILLING_INIT_COLUMN = [
  {
    title: 'Origin Region',
    dataIndex: 'origin',
    width: 300,
    render: (_: any, record: any) => (
      <CustomTooltip key={`origin${record.id}`} title={record.origin}>
        <div className={styles.commonText} style={{ width: '266px' }}>
          {record.origin}
        </div>
      </CustomTooltip>
    ),
  },
  {
    title: 'Origin Label',
    dataIndex: 'originLabel',
    width: 300,
    render: (_: any, record: any) => (
      <CustomTooltip key={`originLabel${record.id}`} title={record.originLabel}>
        <div className={styles.commonText} style={{ width: '146px' }}>
          {record.originLabel}
        </div>
      </CustomTooltip>
    ),
  },
  {
    title: 'Destination Region',
    dataIndex: 'destination',
    width: 300,
    render: (_: any, record: any) => (
      <CustomTooltip key={`destination${record.id}`} title={record.destination}>
        <div className={styles.commonText} style={{ width: '266px' }}>
          {record.destination}
        </div>
      </CustomTooltip>
    ),
  },
  {
    title: 'Destination Label',
    dataIndex: 'destinationLabel',
    width: 300,
    render: (_: any, record: any) => (
      <CustomTooltip
        key={`destinationLabel${record.id}`}
        title={record.destinationLabel}
      >
        <div className={styles.commonText} style={{ width: '146px' }}>
          {record.destinationLabel}
        </div>
      </CustomTooltip>
    ),
  },
  {
    title: 'Waypoint',
    dataIndex: 'wayPoint',
    width: 200,
    render: (_: any, record: any) => (
      <CustomTooltip key={`wayPoint${record.id}`} title={record.wayPoint}>
        <div className={styles.commonText} style={{ width: '146px' }}>
          {record.wayPoint}
        </div>
      </CustomTooltip>
    ),
  },
  {
    title: 'Route Code',
    dataIndex: 'routeCode',
    width: 200,
    render: (_: any, record: any) => (
      <CustomTooltip key={`routeCode${record.id}`} title={record.routeCode}>
        <div className={styles.commonText} style={{ width: '146px' }}>
          {record.routeCode}
        </div>
      </CustomTooltip>
    ),
  },
  {
    title: 'Mileage range',
    dataIndex: 'rangeName',
    width: 180,
    render: (_: any, record: any) => (
      <div style={{ fontSize: '14px', color: '#595959' }}>
        {record.rangeName}
        {record?.fixedStartingPrice === 1 ? (
          <div className={styles.startPrice}>starting rate</div>
        ) : null}
      </div>
    ),
  },
];

export default function DistanceTable({
  refresh,
  // versionLen,
  // setSelectedVendor,
  libraryId,
  versionId,
  countryId,
  identity,
  vendorId,
}: {
  refresh: boolean;
  // versionLen: (b: boolean) => void;
  // setSelectedVendor: (b: number | undefined) => void;
  libraryId: number;
  versionId: number;
  countryId: any;
  identity: ROUTE_LIBRARY_IDENTITY;
  routeMode?: ROUTE_LIBRARY_MODE;
  vendorId?: number;
}) {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [rangeNum, setRangeNum] = useState<number>(0);

  const lockRef = useRef<boolean>(false); // 上锁
  const defaultColumns = useRef<any[]>([...ROUTE_BILLING_INIT_COLUMN]); // table colum
  const filterFormRef = useRef<ProFormInstance>(); // ProForm实例
  const queryRef = useRef<any>({});
  const [queryData, setQueryData] = useState<any>({});
  const [commonFormValue, setCommonFormValue] = useState<any>({}); // 筛选条件
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  // data
  const typeList = useRef<ITypeAndRangeItem[]>([]); // truckTypes
  const rangeList = useRef<ITypeAndRangeItem[]>([]);
  const [versionData, setVersionData] = useState<IRoutePriceVersionListItem>(
    {} as IRoutePriceVersionListItem,
  );
  const versionDataRef = useRef<IRoutePriceVersionListItem>(
    {} as IRoutePriceVersionListItem,
  );
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  const handleSave = async (rowConfig: any, truckTypeId: number) => {
    const copyData = { ...versionDataRef.current };
    const findIndex = copyData?.dataSource?.findIndex(
      (item) => item.id === rowConfig.id && item.rangeId === rowConfig.rangeId,
    );
    const copyList = copyData?.dataSource?.slice();
    copyList?.splice(findIndex as number, 1, rowConfig);
    copyData.dataSource = copyList;
    setVersionData(copyData);
    versionDataRef.current = copyData;
    await changeRouteTablePrice({
      routeId: rowConfig.id,
      routeLibraryBillingVersionId: versionId,
      routeLibraryTruckTypeId: truckTypeId,
      routeMileageRangeId: rowConfig?.rangeId,
      customerOrVendor: identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER,
      price: rowConfig[`price_${rowConfig?.rangeId}_${truckTypeId}`],
    });
  };

  // 根据truckType增加table colum
  const addColumn = () => {
    const truckColum = typeList.current?.map((truck) => {
      return {
        title: truck?.name,
        dataIndex: `price`,
        width: 200,
        align: 'left',
        render: (_: string, record: any) => {
          return (
            <div style={{ color: '#262626' }}>
              <span
                style={{ marginRight: '2px' }}
                data-id={`price_${record.rangeId}_${truck?.id}`}
              >
                {/*价格符号*/}
                {CountryCurrencyEnumText[countryId as any]}
              </span>
              {formatAmount(record[`price_${record?.rangeId}_${truck?.id}`])}
            </div>
          );
        },
        onCell: (record: any) => {
          return {
            record,
            editable: true,
            dataIndex: `price_${record.rangeId}_${truck?.id}`,
            truckTypeId: truck.id,
            title: truck?.name,
            handleSave,
          };
        },
      };
    });
    let rangeLen = rangeList.current.length; // 价格区间个数
    const oldColumnList: any[] = defaultColumns.current?.map((item) => {
      if (item.dataIndex === 'rangeName') return item;
      return {
        ...item,
        onCell: (_: IRouteVersionListItem, index: number) => {
          return {
            rowSpan:
              index % rangeLen === 0
                ? 1
                : index % rangeLen === 1
                  ? rangeLen - 1
                  : 0,
          };
        },
      };
    });
    defaultColumns.current = [...oldColumnList, ...truckColum];
  };

  // 根据version查询table数据
  const getVersionTable = useCallback(
    throttle(
      async (id: number) => {
        setDataLoading(true);
        const values = filterFormRef.current?.getFieldsValue();
        const res = await getPriceTableList({
          id,
          pageNum: pageNum,
          pageSize: pageSize,
          originPad: queryRef.current?.originPad ?? undefined,
          originSad: queryRef.current?.originSad ?? undefined,
          originTad: queryRef.current?.originTad ?? undefined,
          originLabel: values?.originLabel ? values?.originLabel : undefined,
          destinationPad: queryRef.current?.destinationPad ?? undefined,
          destinationSad: queryRef.current?.destinationSad ?? undefined,
          destinationTad: queryRef.current?.destinationTad ?? undefined,
          destinationLabel: values?.destinationLabel
            ? values?.destinationLabel
            : undefined,
          wayPoint: values?.waypoint ? values?.waypoint : undefined,
          customerOrVendor: identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER,
          vendorId: vendorId ? vendorId : undefined,
          routeCode: values?.routeCode ? values?.routeCode : undefined,
        });
        setDataLoading(false);
        lockRef.current = false;
        if (res.code === 200) {
          const copyData = {
            ...versionDataRef.current,
          };
          copyData.dataSource = res?.data?.list || [];
          copyData.totalNum = res?.data?.total || 0;
          setVersionData(copyData);
          versionDataRef.current = copyData;
        }
      },
      1000,
      { trailing: false },
    ),
    [pageNum, pageSize],
  );

  // 查询version、truck type、range
  const getDetail = async () => {
    setFetchLoading(true);
    lockRef.current = true;
    const configRes = await getTruckTypeAndRange({ id: Number(libraryId) });
    setFetchLoading(false);
    lockRef.current = false;
    // 处理table columns
    if (configRes.code === 200) {
      typeList.current = configRes?.data?.truckTypes || [];
      rangeList.current = configRes?.data?.ranges || [];
      setRangeNum(rangeList.current.length);
      defaultColumns.current = [...ROUTE_BILLING_INIT_COLUMN];
      addColumn();
    }
    const copyData = {
      id: versionId,
      versionName: '',
      totalNum: 0,
      columnList: defaultColumns.current,
      dataSource: [],
    };
    setVersionData(copyData);
    versionDataRef.current = copyData;
    getVersionTable(versionId);
  };

  const refreshTable = async () => {
    getVersionTable(versionId);
  };

  const search = () => {
    refreshTable();
  };

  const onRegionChange = (type: 'origin' | 'destination', values: any) => {
    const padId = `${type}Pad`;
    const sadId = `${type}Sad`;
    const tadId = `${type}Tad`;
    if (values) {
      queryRef.current = {
        ...queryRef.current,
        [padId]: values?.padId,
        [sadId]: values?.sadId,
        [tadId]: values?.tadId,
      };
      setQueryData(queryRef.current);
    } else {
      queryRef.current = {
        ...queryRef.current,
        [padId]: undefined,
        [sadId]: undefined,
        [tadId]: undefined,
      };
      setQueryData(queryRef.current);
    }
  };

  // 清空搜索表单
  const resetTable = (getData = true) => {
    queryRef.current = {};
    setQueryData({});
    setCommonFormValue({});
    filterFormRef.current?.setFieldsValue({
      destination: undefined,
      destinationLabel: undefined,
      origin: undefined,
      originLabel: undefined,
      waypoint: undefined,
      routeCode: undefined,
    });
    if (!getData) {
      return;
    }
    refreshTable();
  };

  // 翻页处理
  useEffect(() => {
    if (!lockRef.current) {
      getVersionTable(versionId);
    }
  }, [pageNum, pageSize]);

  // 初始化
  useEffect(() => {
    if (lockRef.current) {
      return;
    }
    getDetail();
  }, [identity, vendorId, refresh]);

  return (
    <Spin
      spinning={fetchLoading || dataLoading}
      indicator={<></>}
      wrapperClassName={styles.spin}
    >
      <div className={styles.priceContent}>
        <div className={styles.priceContent_customer}>
          <div style={{ padding: '0 24px' }}>
            <ProForm
              submitter={false}
              formRef={filterFormRef}
              initialValues={commonFormValue}
            >
              <div className={styles.listForm}>
                <Form.Item name="origin">
                  <RegionSelect
                    width={215}
                    noAllRegion={true}
                    showAddress={false}
                    value={queryData}
                    placeholder="Origin Region"
                    onChange={(values) => onRegionChange('origin', values)}
                  />
                </Form.Item>
                <ProFormText
                  name={'originLabel'}
                  style={{ width: '216px' }}
                  placeholder={'Origin Label'}
                  rules={[
                    {
                      max: MAX_LENGTH.MAX_1000,
                      message: `Origin label cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
                    },
                  ]}
                />
                <Form.Item name="destination">
                  <RegionSelect
                    width={215}
                    noAllRegion={false}
                    showAddress={false}
                    value={queryData}
                    placeholder="Destination Region"
                    onChange={(values) => onRegionChange('destination', values)}
                  />
                </Form.Item>
                <ProFormText
                  name={'destinationLabel'}
                  style={{ width: '216px' }}
                  placeholder={'Destination Label'}
                  rules={[
                    {
                      max: MAX_LENGTH.MAX_1000,
                      message: `Destination label cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
                    },
                  ]}
                />
                <ProFormText
                  name={'waypoint'}
                  style={{ width: '216px' }}
                  placeholder={'Waypoint'}
                  rules={[
                    {
                      max: MAX_LENGTH.ADDRESS,
                      message: `Waypoint cannot exceed ${MAX_LENGTH.ADDRESS} characters`,
                    },
                  ]}
                />
                <ProFormText
                  name={'routeCode'}
                  style={{ width: '216px' }}
                  placeholder={'Route Code'}
                  rules={[
                    {
                      max: MAX_LENGTH.ADDRESS,
                      message: `Route code cannot exceed ${MAX_LENGTH.ADDRESS} characters`,
                    },
                  ]}
                />
                <Button type="primary" onClick={search} loading={dataLoading}>
                  Search
                </Button>
                <Button onClick={() => resetTable()}>Reset</Button>
              </div>
            </ProForm>
            {!versionData?.dataSource?.length ? (
              <div className={styles.empty}>
                <Empty
                  description={false}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <div className={styles.description}>No pricing version</div>
              </div>
            ) : (
              <RouteLibraryBillingTable
                countryId={countryId}
                rowKey={(record: any) => {
                  return record.id + record.rangeName;
                }}
                scrollY={identity === ROUTE_LIBRARY_IDENTITY.VENDOR ? 400 : 454}
                dataLoading={dataLoading}
                // versionIndex={index}
                pageNum={pageNum}
                pageSize={pageSize * rangeNum}
                setPageNum={setPageNum}
                pageSizeOptions={[
                  rangeNum * 5,
                  rangeNum * 10,
                  rangeNum * 15,
                  rangeNum * 20,
                ]}
                onShowSizeChange={(current: number, curPageSize: number) => {
                  setPageSize(curPageSize / rangeNum);
                }}
                totalNum={versionData.totalNum * rangeNum}
                columnList={versionData?.columnList || []}
                dataSource={versionData?.dataSource || []}
              />
            )}
          </div>
        </div>
      </div>
    </Spin>
  );
}
