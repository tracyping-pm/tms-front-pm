import { WaybillTimeType } from '@/api/types/statistics';
import { Affix, Card, Flex, Select } from 'antd';
import { useState } from 'react';
import { TIME_TYPE_OPTIONS, WAYBILL_TIME_TYPE } from '../common/constants';
import { WaybillTimeTypeContext } from '../common/TimeTypeContext';
import AnalysisCustomer from './components/AnalysisCustomer';
import AnalysisProject from './components/AnalysisProject';
import CustomerRevenue from './components/CustomerRevenue';
import CustomerStatistic from './components/CustomerStatistic';
import OverallBusiness from './components/OverallBusiness';
import ProjectRevenue from './components/ProjectRevenue';
import ProjectStatistic from './components/ProjectStatistic';
import Summary from './components/Summary';
export default function Analysis() {
  const [waybillTimeType, setWaybillTimeType] = useState<WaybillTimeType>(
    WAYBILL_TIME_TYPE.UNLOADING,
  );
  return (
    <WaybillTimeTypeContext.Provider
      value={{ waybillTimeType, setWaybillTimeType }}
    >
      <Flex vertical gap={12}>
        <Affix offsetTop={50}>
          <Card size="small">
            <Select
              style={{ width: 200 }}
              value={waybillTimeType}
              onChange={(value) => setWaybillTimeType(value as WaybillTimeType)}
              options={TIME_TYPE_OPTIONS}
            />
          </Card>
        </Affix>

        <Summary />
        <OverallBusiness />
        <CustomerStatistic />
        <ProjectStatistic />
        <CustomerRevenue />
        <ProjectRevenue />
        <AnalysisCustomer />
        <AnalysisProject />
      </Flex>
    </WaybillTimeTypeContext.Provider>
  );
}
