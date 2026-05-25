import { WaybillTimeType } from '@/api/types/statistics';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useInViewport } from 'ahooks';
import { Affix, Card, ConfigProvider, Flex, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { TIME_TYPE_OPTIONS, WAYBILL_TIME_TYPE } from '../common/constants';
import { WaybillTimeTypeContext } from '../common/TimeTypeContext';
import ByCustomer from './components/ByCustomer';
import ByProject from './components/ByProject';
import CapacityStatistic from './components/CapacityStatistic';
import GrossProfit from './components/GrossProfit';
import Summary from './components/Summary';

function useLazyMount() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inViewport] = useInViewport(ref, { rootMargin: '50px' });

  useEffect(() => {
    if (inViewport && !mounted) setMounted(true);
  }, [inViewport]);

  return { ref, mounted };
}

export default function VendorAnalysis() {
  const [waybillTimeType, setWaybillTimeType] = useState<WaybillTimeType>(
    WAYBILL_TIME_TYPE.UNLOADING,
  );
  const capacityStatistic = useLazyMount();
  const grossProfit = useLazyMount();
  const byCustomer = useLazyMount();
  const byProject = useLazyMount();

  return (
    <WaybillTimeTypeContext.Provider
      value={{ waybillTimeType, setWaybillTimeType }}
    >
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBorderRadius: 0,
            },
          },
        }}
      >
        <Flex vertical gap={12}>
          <Affix offsetTop={50}>
            <Card size="small">
              <Select
                style={{ width: 200 }}
                value={waybillTimeType}
                onChange={(value) =>
                  setWaybillTimeType(value as WaybillTimeType)
                }
                options={TIME_TYPE_OPTIONS}
              />
            </Card>
          </Affix>

          <Summary />
          <div ref={capacityStatistic.ref}>
            {capacityStatistic.mounted ? (
              <CapacityStatistic />
            ) : (
              <SkeletonView />
            )}
          </div>
          <div ref={grossProfit.ref}>
            {grossProfit.mounted ? <GrossProfit /> : <SkeletonView />}
          </div>
          <div ref={byCustomer.ref}>
            {byCustomer.mounted ? <ByCustomer /> : <SkeletonView />}
          </div>
          <div ref={byProject.ref}>
            {byProject.mounted ? <ByProject /> : <SkeletonView />}
          </div>
        </Flex>
      </ConfigProvider>
    </WaybillTimeTypeContext.Provider>
  );
}
