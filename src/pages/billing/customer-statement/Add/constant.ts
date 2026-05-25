import dayjs from 'dayjs';

export const TITLE_STEP1 = 'Basic Settings';
export const TITLE_STEP2 = 'Waybill Selection';
export const STEPS_ITEMS = [
  {
    title: 'Step 1',
    description: TITLE_STEP1,
  },
  {
    title: 'Step 2',
    description: TITLE_STEP2,
  },
];

export const DEFAULT_WIDTH = 215;
export const GAP = 12;
export const DATE_WIDTH = DEFAULT_WIDTH * 2 + GAP;

export const buildPresets = () => {
  const currentMonth = dayjs();
  const currentMonthStart = dayjs().startOf('month');
  const lastMonthStart = dayjs(currentMonth)
    .month(currentMonth.month() - 1)
    .startOf('month');
  const lastMonthEnd = lastMonthStart.endOf('month');

  return [
    { label: 'Current Month', value: [currentMonthStart, currentMonth] },
    { label: 'Last Month', value: [lastMonthStart, lastMonthEnd] },
    { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  ];
};
