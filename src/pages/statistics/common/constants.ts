// Waybill时间类型
export const WAYBILL_TIME_TYPE = {
  UNLOADING: 'unloading',
  POSITION: 'position',
} as const;

export type TimeType =
  (typeof WAYBILL_TIME_TYPE)[keyof typeof WAYBILL_TIME_TYPE];

// 时间类型选项
export const TIME_TYPE_OPTIONS = [
  { label: 'Based on unloading time', value: WAYBILL_TIME_TYPE.UNLOADING },
  {
    label: 'Based on position time',
    value: WAYBILL_TIME_TYPE.POSITION,
  },
];
