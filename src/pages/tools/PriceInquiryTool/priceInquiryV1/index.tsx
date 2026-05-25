import {
  IQuotedPriceListParamsV2,
  IQuotedPriceStatisticsParams,
} from '@/api/types/tool';
import { PAGE_NUMBER } from '@/constants';
import { Empty } from 'antd';
import { useState } from 'react';
import Header from '../components/Header';
import RouteLibraryTable from '../components/RouteLibraryTable';
import SearchResults from '../components/SearchResults';
import styles from './styles.less';

export default function PriceInquiryV1() {
  const [deliveredTripsSearchData, setDeliveredTripsSearchData] =
    useState<IQuotedPriceStatisticsParams>();
  const [routeLibrarySearchData, setRouteLibrarySearchData] =
    useState<IQuotedPriceListParamsV2>();
  const [paginationData, setPaginationData] = useState<{
    pageSize: number;
    pageNum: number;
  }>({
    pageSize: PAGE_NUMBER,
    pageNum: 1,
  });
  return (
    <>
      <div className={styles.priceInquiryTool}>
        <Header
          paginationData={paginationData}
          onDeliveredTripsSearchHandle={(v) => {
            setDeliveredTripsSearchData(v);
            document
              .getElementById('deliveredTrips')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
          onRouteLibrarySearchHandle={(v) => {
            setRouteLibrarySearchData(v);
            document
              .getElementById('routeLibrary')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        {deliveredTripsSearchData || routeLibrarySearchData ? (
          <>
            {deliveredTripsSearchData ? (
              <div id="deliveredTrips">
                <SearchResults searchData={deliveredTripsSearchData} />
              </div>
            ) : null}
            {routeLibrarySearchData ? (
              <div id="routeLibrary">
                <RouteLibraryTable
                  searchData={routeLibrarySearchData!}
                  getPaginationData={(v) => {
                    setPaginationData(v);
                  }}
                />
              </div>
            ) : null}
          </>
        ) : (
          <Empty description="Please fill in the search criteria and click the Search button to start querying" />
        )}
      </div>
    </>
  );
}
