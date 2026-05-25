import { WaybillTimeType } from '@/api/types/statistics';
import { createContext, useContext } from 'react';
import { WAYBILL_TIME_TYPE } from './constants';

interface TimeTypeContextValue {
  waybillTimeType: WaybillTimeType;
  setWaybillTimeType: (value: WaybillTimeType) => void;
}

export const WaybillTimeTypeContext = createContext<TimeTypeContextValue>({
  waybillTimeType: WAYBILL_TIME_TYPE.UNLOADING,
  setWaybillTimeType: () => {},
});

export const useWaybillTimeType = () => useContext(WaybillTimeTypeContext);
