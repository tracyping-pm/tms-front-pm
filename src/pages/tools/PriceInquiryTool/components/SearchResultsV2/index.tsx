import { quotedPriceWaybillListV2 } from '@/api/tool';
import { IQuotedPriceWaybillListParamsV2 } from '@/api/types/tool';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, LAYOUT_HEADER_HEIGHT } from '@/constants';
import { CountryCurrencyEnumText } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ISearchResults {
  searchData: IQuotedPriceWaybillListParamsV2;
  selectedTruck?: any[];
}
export default function SearchResultsV2({
  searchData,
  selectedTruck,
}: ISearchResults) {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;

  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState<boolean>(false);

  const formRef = useRef<ProFormInstance>();

  const getWaybillSource = async (prams: any) => {
    setLoading(true);
    const res = await quotedPriceWaybillListV2(prams);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    await getWaybillSource({ ...searchData, ...params });
  };

  const columns = useMemo(() => {
    let list: ProColumns[] = [
      {
        title: 'Project Name',
        dataIndex: 'projectName',
        key: 'projectName',
        ellipsis: { showTitle: false },
        width: 200,
        fixed: 'left',
        render: (_, record) => {
          return (
            <CustomTooltip title={record.projectName}>
              {record.projectName}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Customer Name',
        dataIndex: 'customerName',
        key: 'customerName',
        width: 200,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          return (
            <CustomTooltip title={record.customerName}>
              {record.customerName}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Industry Name',
        dataIndex: 'industryName',
        key: 'industryName',
        width: 160,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          return (
            <CustomTooltip title={record.industryName}>
              {record.industryName}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Price Version Status',
        dataIndex: 'versionStatus',
        key: 'versionStatus',
        width: 150,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          return (
            <CustomTooltip title={record.versionStatus}>
              {record.versionStatus}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Origin Region',
        dataIndex: 'originRegion',
        key: 'originRegion',
        width: 240,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          const content = `${record.originRegion ? record.originRegion : ''} ${record.originAddress ? record.originAddress : ''}`;
          return <CustomTooltip title={content}>{content}</CustomTooltip>;
        },
      },
      {
        title: 'Destination Region',
        dataIndex: 'destinationRegion',
        key: 'destinationRegion',
        width: 240,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          const content = `${record.destinationRegion ? record.destinationRegion : ''} ${record.destinationAddress ? record.destinationAddress : ''}`;
          return <CustomTooltip title={content}>{content}</CustomTooltip>;
        },
      },
      {
        title: 'Requirement Frequency',
        dataIndex: 'requirementFrequencyName',
        key: 'requirementFrequencyName',
        width: 200,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          return (
            <CustomTooltip title={record.requirementFrequencyName}>
              {record.requirementFrequencyName}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Route Library Created Time',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 200,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          return (
            <CustomTooltip title={record.createdAt}>
              {record.createdAt}
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Delivered Waybill Trip',
        dataIndex: 'deliverWaybillCount',
        key: 'deliverWaybillCount',
        width: 200,
        ellipsis: { showTitle: false },
        render: (_, record) => {
          return <div>{record.deliverWaybillCount}</div>;
        },
      },
    ];
    if (searchData?.customerOrVendor) {
      list = list.concat([
        {
          title: 'Customer Validity Period',
          dataIndex: 'quotationPeriod',
          key: 'quotationPeriod',
          width: 180,
          ellipsis: { showTitle: false },
          render: (_, record) => {
            return (
              <CustomTooltip title={record.quotationPeriod}>
                {record.quotationPeriod}
              </CustomTooltip>
            );
          },
        },
        {
          title: 'Customer Contract Number',
          dataIndex: 'contractNumber',
          key: 'contractNumber',
          width: 160,
          ellipsis: { showTitle: false },
          render: (_, record) => {
            return (
              <CustomTooltip title={record.contractNumber}>
                {record.contractNumber}
              </CustomTooltip>
            );
          },
        },
      ]);
    } else {
      list = list.concat([
        {
          title: 'Vendor Name',
          dataIndex: 'vendorName',
          key: 'vendorName',
          width: 180,
          ellipsis: { showTitle: false },
          render: (_, record) => {
            return (
              <CustomTooltip title={record.vendorName}>
                {record.vendorName}
              </CustomTooltip>
            );
          },
        },
        {
          title: 'Vendor Validity Period',
          dataIndex: 'quotationPeriod',
          // key: 'quotationPeriod',
          width: 180,
          ellipsis: { showTitle: false },
          render: (_, record) => {
            return (
              <CustomTooltip title={record.quotationPeriod}>
                {record.quotationPeriod}
              </CustomTooltip>
            );
          },
        },
        {
          title: 'Vendor Contract Number',
          dataIndex: 'contractNumber',
          key: 'contractNumber',
          width: 160,
          ellipsis: { showTitle: false },
          render: (_, record) => {
            return (
              <CustomTooltip title={record.contractNumber}>
                {record.contractNumber}
              </CustomTooltip>
            );
          },
        },
      ]);
    }
    if (selectedTruck?.length) {
      selectedTruck.forEach((item) => {
        list.push({
          title: <CustomTooltip title={item.label}>{item.label}</CustomTooltip>,
          dataIndex: item.value,
          // key: item.value,
          width: 180,
          ellipsis: { showTitle: false },
          render: (_, record) => {
            const content = record[item.value]
              ? `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(record[item.value])}`
              : '-';

            return <CustomTooltip title={content}>{content}</CustomTooltip>;
          },
        });
      });
    }
    return list;
  }, [selectedTruck, searchData]);

  useEffect(() => {
    const payload = { ...searchData, pageNum: 1, pageSize: 20 };
    getWaybillSource(payload);
  }, [searchData]);

  return (
    <>
      <CustomTable
        className={'priceToolTable'}
        columns={columns as any}
        scroll={{ x: 3500 }}
        formRef={formRef}
        dataSource={originData.list}
        fixedSpin={false}
        form={{
          name: 'price-tool-table-list',
        }}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
          },
        }}
        search={false}
        loading={loading}
        toolBarRender={false}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
    </>
  );
}
