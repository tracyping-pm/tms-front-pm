import { IQuotedPriceWaybillListParamsV2 } from '@/api/types/tool';
import { Empty } from 'antd';
import { useState } from 'react';
import HeaderV2 from '../components/HeaderV2';
import SearchResultsV2 from '../components/SearchResultsV2';
import styles from './styles.less';

export default function PriceInquiryV2() {
  const [searchData, setSearchData] =
    useState<IQuotedPriceWaybillListParamsV2>();
  const [selectedTruck, setSelectedTruck] = useState<any[]>([]);
  return (
    <>
      <div className={styles.priceInquiryTool}>
        <HeaderV2
          onSearchHandle={(v) => {
            setSearchData(v);
          }}
          setSelectedTruck={(n) => setSelectedTruck(n)}
        />
        {searchData ? (
          <SearchResultsV2
            searchData={searchData}
            selectedTruck={selectedTruck}
          />
        ) : (
          <Empty description="Please fill in the search criteria and click the Search button to start querying"></Empty>
        )}
      </div>
    </>
  );
}
