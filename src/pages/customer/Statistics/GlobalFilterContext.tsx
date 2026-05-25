import { STATISTICS_RANK_OPTION, STATISTICS_TIME_OPTION } from '@/constants';
import { BUEnum } from '@/enums';
import { useRafInterval, useSetState } from 'ahooks';
import { SetState } from 'ahooks/lib/useSetState';
import dayjs from 'dayjs';
import { createContext, ReactNode, useContext } from 'react';

const dateFormat = 'YYYY-MM-DD';
const startTime = dayjs().startOf('month').format(dateFormat);
const endTime = dayjs().endOf('month').isAfter(dayjs().endOf('day'))
  ? dayjs().endOf('day').format(dateFormat)
  : dayjs().endOf('month').format(dateFormat);

interface IGlobalFilter {
  bu?: BUEnum;
  bdUserRoleIds?: number[];
  timeOption: STATISTICS_TIME_OPTION;
  startTime: string;
  endTime: string;
  rankedBy: STATISTICS_RANK_OPTION;
  retryCount: number;
}

const DefaultGlobalFilter: IGlobalFilter = {
  bu: undefined,
  bdUserRoleIds: [],
  timeOption: STATISTICS_TIME_OPTION.CURRENT_MONTH,
  startTime,
  endTime,
  rankedBy: STATISTICS_RANK_OPTION.SUCCESSFUL_CLOSED,
  retryCount: 0,
};

interface IGlobalFilterContext {
  globalFilter: IGlobalFilter;
  setGlobalFilter: SetState<IGlobalFilter>;
}

const GlobalFilterContext = createContext<IGlobalFilterContext>({
  globalFilter: DefaultGlobalFilter,
  setGlobalFilter: () => {},
});
const GlobalFilterProvider = ({ children }: { children: ReactNode }) => {
  const [globalFilter, setGlobalFilter] =
    useSetState<IGlobalFilter>(DefaultGlobalFilter);

  useRafInterval(
    () => {
      console.log('Refresh data');

      setGlobalFilter({
        retryCount: globalFilter.retryCount + 1,
      });
    },
    10 * 60 * 1000,
  );

  return (
    <GlobalFilterContext.Provider value={{ globalFilter, setGlobalFilter }}>
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilter = () => {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilter must in GlobalFilterProvider use');
  }
  return context;
};

export default GlobalFilterProvider;
