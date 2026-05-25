import { getRoutePriceVendor, libraryDetailVendorPricing } from '@/api/project';
import {
  ILibraryDetailPriceVersionListItem,
  IPriveVendorListItemV,
} from '@/api/types/project';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { IconDetail } from '@/components/OperationIcon';
import { PATHS } from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CountryCurrencyEnumText,
  LibraryDetailPricingStatusEnum,
  LibraryDetailPricingStatusEnumColor,
  LibraryDetailPricingStatusEnumText,
  RouteBillingModeEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { StateContext } from '@/pages/project/RouteLibraryDetail/store';
import VendorList from '@/pages/project/RouteLibraryPrice/components/VendorList';
import { openNewTag } from '@/utils/utils';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history, useAccess, useModel, useParams } from '@umijs/max';
import { Badge } from 'antd';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

export default memo(function RouteLibraryDetailVendorPricing() {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const { state } = useContext(StateContext);

  const { id: pageId } = useParams();
  const [data, setData] = useState<ILibraryDetailPriceVersionListItem[]>([]);
  const [vendorList, setVendorList] = useState<IPriveVendorListItemV[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const vendorKeyRef = useRef<number | null | undefined>(null);
  const [vendorKey, setVendorKey] = useState<number | null | undefined>(null);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const jumpPrice = (id: number, vendorId: number) => {
    history.push(
      `${PATHS.ROUTE_LIBRARY_PRICE}/${pageId}?mode=${
        state.libraryDetail.billingMode === RouteBillingModeEnum.ROUTE_BILLING
          ? 'byRoute'
          : 'byDistance'
      }&identity=vendor&versionId=${id}&vendorId=${vendorId}`,
    );
  };

  const getVendorList = async () => {
    setLoading(true);
    const vendorRes = await getRoutePriceVendor({ id: Number(pageId) });
    setLoading(false);
    if (vendorRes.code === 200) {
      const mapArr = (vendorRes.data || []).map((item) => ({
        label: item.name,
        value: item.id,
      }));
      if (mapArr.length) {
        setVendorKey(mapArr?.[0]?.value);
        vendorKeyRef.current = mapArr?.[0]?.value;
      }
      setVendorList(mapArr);
    }
  };

  const getDataSource = async (params: any) => {
    setLoading(true);
    const res = await libraryDetailVendorPricing({
      routeLibraryId: Number(pageId),
      vendorId: vendorKeyRef.current as number,
      versionName: params.versionName ? params.versionName : undefined,
      contractNumber: params.contractNumber ? params.contractNumber : undefined,
      quotationStart: params?.validityPeriod?.length
        ? params?.validityPeriod?.[0]
        : undefined,
      quotationEnd: params?.validityPeriod?.length
        ? params?.validityPeriod?.[1]
        : undefined,
      contractStatus: params.contractStatus ? params.contractStatus : undefined,
    });
    setLoading(false);
    if (res.code === 200) {
      setData(res.data);
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Pricing Version Name',
      dataIndex: 'versionName',
      valueType: 'text',
      width: 250,
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
        placeholder: 'Pricing Version Name',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.versionName}>
            {record.versionName}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Validity Period',
      dataIndex: 'validityPeriod',
      valueType: 'dateRange',
      width: 200,
      fieldProps: {
        placeholder: 'Validity Period',
      },
      render: (_, record) => (
        <CustomTooltip
          title={`${record.quotationStart} - ${record.quotationEnd}`}
        >
          <div
            className={styles.commonText}
          >{`${record.quotationStart} - ${record.quotationEnd}`}</div>
        </CustomTooltip>
      ),
    },

    {
      title: 'Status',
      dataIndex: 'contractStatus',
      width: 160,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: LibraryDetailPricingStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Contract Status',
        mode: 'multiple',
        maxTagCount: 'responsive',
      },
      render: (_, record) => {
        const Content = record.contractStatus ? (
          <Badge
            color={
              LibraryDetailPricingStatusEnumColor[
                record.contractStatus as LibraryDetailPricingStatusEnum
              ]
            }
            text={record.contractStatus}
          />
        ) : (
          '-'
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },

    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
      valueType: 'text',
      fieldProps: {
        placeholder: 'Contract Number',
      },
      ellipsis: { showTitle: false },
      width: 250,
      render: (_, record) => {
        return (
          <CustomTooltip
            title={record.contractNumber ? record.contractNumber : '-'}
          >
            {record.contractNumber ? (
              <div
                style={{
                  color: '#009688',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
                onClick={() => {
                  openNewTag(`${PATHS.TOOLS_CONTRACT_LIST}`);
                }}
              >
                {record.contractNumber ? record.contractNumber : '-'}
              </div>
            ) : (
              '-'
            )}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Fuel Basis',
      dataIndex: 'fuelBasis',
      hideInSearch: true,
      ellipsis: { showTitle: false },
      width: 160,
      render: (_, record) => {
        return (
          <CustomTooltip
            title={
              record.fuelBasis
                ? `${record.fuelBasis} ${CountryCurrencyEnumText[countryId as number]}`
                : '-'
            }
          >
            {record.fuelBasis
              ? `${record.fuelBasis} ${CountryCurrencyEnumText[countryId as number]}`
              : '-'}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Operate',
      valueType: 'option',
      // hideInTable: !access[PermissionEnum.CUSTOMER_DETAIL_PROJECTS_DETAIL],
      key: 'id',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Access
          accessible={
            access[PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING]
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              boxSizing: 'border-box',
            }}
          >
            <IconDetail
              onClick={() => jumpPrice(record.id, Number(vendorKey))}
            ></IconDetail>
          </div>
        </Access>
      ),
    },
  ];

  useEffect(() => {
    getVendorList();
  }, []);

  useEffect(() => {
    if (vendorKey) {
      getDataSource({});
    }
  }, [vendorKey, state.routeRefresh]);

  return (
    <div className={styles.projects}>
      <div className={styles.projects_left}>
        <VendorList
          list={vendorList}
          vendorKey={vendorKey}
          setVendorKey={(n) => {
            if (n === vendorKeyRef.current) {
              return;
            }
            setVendorKey(n);
            vendorKeyRef.current = n;
          }}
        />
      </div>
      <div className={styles.projects_right}>
        <CustomTable
          noStyle
          actionRef={actionRef}
          formRef={formRef}
          columns={columns}
          // headerTitle={null}
          scroll={{ x: 1140 }}
          dataSource={data}
          loading={loading}
          onSubmit={getDataSource}
          toolBarRender={false}
          form={{
            syncToUrl: false,
            syncToInitialValues: false,
          }}
        />
      </div>
    </div>
  );
});
