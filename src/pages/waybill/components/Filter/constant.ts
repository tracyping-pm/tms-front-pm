import { INumberRange } from '@/components/NumberRangeSelect';
import {
  LogisticsCategoryEnum,
  WaybillConsistencyEnum,
  WaybillDispatchTypeEnum,
  WaybillFinancialStatusEnum,
  WaybillStatusEnum,
} from '@/enums';

export const DEFAULT_WIDTH = 215;
export const GAP = 12;
export const DATE_WIDTH = DEFAULT_WIDTH * 2 + GAP;
export const DATE_WIDTH2 = DEFAULT_WIDTH * 3 + GAP * 2;

export const PLAIN_OPTIONS_TRANSPORTATION = [
  WaybillStatusEnum.PLANNING,
  WaybillStatusEnum.PENDING,
  WaybillStatusEnum.IN_TRANSIT,
  WaybillStatusEnum.DELIVERED,
  WaybillStatusEnum.CANCELED,
  WaybillStatusEnum.ABNORMAL,
];

export const PLAIN_OPTIONS_FINANCIAL = [
  WaybillFinancialStatusEnum.NOT_STARTED,
  WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
  WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION,
  WaybillFinancialStatusEnum.AWAITING_EXCEPTION_HANDLING,
  WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION,
  WaybillFinancialStatusEnum.AWAITING_SETTLEMENT,
  WaybillFinancialStatusEnum.SETTLED,
  WaybillFinancialStatusEnum.CLOSED,
];

export const dispatchTypeOptions = [
  {
    label: WaybillDispatchTypeEnum.STANDARD_DISPATCH,
    value: WaybillDispatchTypeEnum.STANDARD_DISPATCH,
  },
  {
    label: WaybillDispatchTypeEnum.TEMPORARY_DISPATCH,
    value: WaybillDispatchTypeEnum.TEMPORARY_DISPATCH,
  },
];

export const truckTypeConsistencyOptions = [
  {
    label: WaybillConsistencyEnum.CONSISTENT,
    value: WaybillConsistencyEnum.CONSISTENT,
  },
  {
    label: WaybillConsistencyEnum.IN_CONSISTENT,
    value: WaybillConsistencyEnum.IN_CONSISTENT,
  },
];

export const DATE_FORMAT = {
  NORMAL: 'YYYY-MM-DD',
  START: 'YYYY-MM-DD 00:00:00',
  END: 'YYYY-MM-DD 23:59:59',
};

export interface IOption {
  disabled?: boolean;
  key: number;
  label: string;
  title: string;
  value: number;
}

export interface IFE_NEED {
  projectIdList?: IOption[];
  customerNameIdList?: IOption[];
  customerTagIdList?: IOption[];
  statusList?: string[];
  dispatchType?: WaybillDispatchTypeEnum;
  positionTimeStart?: string;
  positionTimeEnd?: string;
  unloadingCompletionTimeStart?: string;
  unloadingCompletionTimeEnd?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  destinationTimeStart?: string;
  destinationTimeEnd?: string;
  // externalCode?: string;
  customerCode?: string;
  waybillId?: IOption;
  truckId?: IOption;
  originRegion?: any;
  originLabel?: string;
  destinationRegion?: any;
  destinationLabel?: string;
  vendorIdList?: IOption[];
  podNumber?: string;
  truckTypeConsistency?: string;
  financialStatusList?: string[];
  driverNameList?: IOption[];
  logisticsCategory?: LogisticsCategoryEnum;
  riskLevelObj?: INumberRange;
  truckTypeIdList?: number[];
  include?: boolean;
}

export interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  projectIdList?: number[];
  customerNameIdList?: number[]; // waybill/checkExportNumber 接口需要使用
  customerTagIdList?: number[];
  statusList?: string[];
  dispatchType?: WaybillDispatchTypeEnum;
  positionTimeStart?: string;
  positionTimeEnd?: string;
  unloadingCompletionTimeStart?: string;
  unloadingCompletionTimeEnd?: string;
  creationTimeStart?: string;
  creationTimeEnd?: string;
  destinationTimeStart?: string;
  destinationTimeEnd?: string;
  // externalCode?: string;
  customerCode?: string;
  waybillId?: number;
  truckId?: number;
  originPadId?: number;
  originSadId?: number;
  originTadId?: number;
  originLabel?: string;
  destinationPadId?: number;
  destinationSadId?: number;
  destinationTadId?: number;
  destinationLabel?: string;
  vendorIdList?: number[];
  podNumber?: string;
  truckTypeConsistency?: boolean;
  financialStatusList?: string[];
  driverIdList?: number[];
  logisticsCategory?: LogisticsCategoryEnum;
  riskLevelMin?: number;
  riskLevelMax?: number;
}

export interface IALL_NEED {
  FE_NEED: IFE_NEED;
  BE_NEED: IBE_NEED;
}
