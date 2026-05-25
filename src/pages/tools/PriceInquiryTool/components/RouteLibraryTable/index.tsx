import { IQuotedPriceListParamsV2 } from '@/api/types/tool';
import { DEFAULT_PAGINATION, PAGE_NUMBER } from '@/constants';

import { useEffect, useState } from 'react';

import { quotedPriceV2List } from '@/api/tool';
import CommonTitle from '@/components/CommonTitle';
import { RouteBillingModeEnum } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { Empty, Pagination, Skeleton } from 'antd';
import RouteLibraryCustomTable from './RouteLibraryCustomTable';
import styles from './index.less';
interface ISearchResults {
  searchData: IQuotedPriceListParamsV2;
  getPaginationData: (v: any) => void;
}
export default function RouteLibraryTable({
  searchData,
  getPaginationData,
}: ISearchResults) {
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getSource = async (prams: IQuotedPriceListParamsV2) => {
    setLoading(true);
    const res = await quotedPriceV2List(prams).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginData(res.data);
    }

    // setOriginData({
    //   pageNum: 1,
    //   pageSize: 20,
    //   total: 20,
    //   list: data,
    // });
  };

  useEffect(() => {
    setCurrentPage(1);
    getSource({ ...searchData, pageNum: 1, pageSize: PAGE_NUMBER });
  }, [searchData]);

  return (
    <>
      <Skeleton loading={loading}>
        <div className={styles.title}>
          <CommonTitle
            title={
              <>
                Route Library
                {searchData.billingMode ===
                RouteBillingModeEnum.MILEAGE_BILLING ? (
                  <span className={styles.billingMode}>
                    * Distance of the entered route is &nbsp;
                    {originData?.list?.[0]?.mileage
                      ? formatAmount(originData?.list?.[0]?.mileage)
                      : 0}{' '}
                    km
                  </span>
                ) : null}
              </>
            }
          />
        </div>

        {originData?.list?.map((_data: any, index) => {
          return (
            <RouteLibraryCustomTable
              key={index}
              sourceData={_data}
              pricingMode={searchData.billingMode}
            />
          );
        })}
        {!!originData?.list?.length ? (
          <Pagination
            style={{ marginTop: 12 }}
            current={currentPage}
            total={originData.total}
            align="end"
            size="small"
            pageSize={PAGE_NUMBER}
            showTotal={(total) => `Total ${total} items`}
            onChange={(page: number, pageSize: number) => {
              setCurrentPage(page);
              const payload = { ...searchData, pageNum: page, pageSize };
              getSource(payload);
              getPaginationData?.({ pageNum: page, pageSize });
            }}
          />
        ) : null}
        {!originData?.list?.length ? (
          <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : null}
      </Skeleton>
    </>
  );
}
