// Dashboard KPI 常量配置

// 国家选项
export const COUNTRIES = {
  GLOBAL: 'Global',
  THAILAND: 'Thailand',
  PHILIPPINES: 'Philippines',
} as const;

export type CountryType = (typeof COUNTRIES)[keyof typeof COUNTRIES];

// 主题选项
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;

export type ThemeType = (typeof THEMES)[keyof typeof THEMES];

// 时区配置
export const TIMEZONES = {
  [COUNTRIES.THAILAND]: 'Asia/Bangkok',
  [COUNTRIES.PHILIPPINES]: 'Asia/Manila',
  [COUNTRIES.GLOBAL]: 'UTC',
} as const;

// Grafana 面板 ID
export const PANEL_IDS = {
  HISTORY_MAP_GLOBAL: 61,
  HISTORY_MAP_THAILAND: 19,
  HISTORY_MAP_PHILIPPINES: 20,
  DAILY_WAYBILL: 58,
  WAYBILL_TREND: 60,
  MONTHLY_DELIVERED: 18,
  ACTIVE_PROJECT: 46,
  ACTIVE_CUSTOMER: 48,
  ACTIVE_VENDOR: 47,
  ACTIVE_TRUCK_TYPE: 51,
  THAILAND_DAILY: 52,
  PHILIPPINES_DAILY: 53,
  PANEL_44: 44,
  PANEL_45: 45,
  PANEL_41: 41,
  PANEL_39: 39,
} as const;

// Grafana 基础 URL
export const GRAFANA_BASE_URL =
  'https://grafana-intl-sg-r0v3jukq201.grafana.aliyuncs.com/d-solo/b37afa49-e2fb-4313-a16f-43ef92eb8392/biz-monitor-live-global';

// 日期文本
export const DATE_TEXT = [
  'Today',
  'Yesterday',
  'Day before yesterday',
] as const;

// 国家选项
export const COUNTRY_OPTIONS = [
  { label: 'Thailand', value: COUNTRIES.THAILAND },
  { label: 'Philippines', value: COUNTRIES.PHILIPPINES },
  { label: 'Global', value: COUNTRIES.GLOBAL },
];

// 主题选项
export const THEME_OPTIONS = [
  { label: 'Dark', value: THEMES.DARK },
  { label: 'Light', value: THEMES.LIGHT },
];

// 月份选项
export const MONTHS_OPTIONS = [
  { label: '1 month', value: 1 },
  { label: '2 months', value: 2 },
  { label: '3 months', value: 3 },
  { label: '4 months', value: 4 },
  { label: '5 months', value: 5 },
  { label: '6 months', value: 6 },
  { label: '7 months', value: 7 },
  { label: '8 months', value: 8 },
  { label: '9 months', value: 9 },
  { label: '10 months', value: 10 },
  { label: '11 months', value: 11 },
  { label: '12 months', value: 12 },
];

// 样式常量
export const STYLES = {
  CHART_HEIGHT: '400px',
  MAP_HEIGHT: '500px',
  MONTHLY_CHART_HEIGHT: '250px',
  MARGIN_TOP: '16px',
} as const;

// 图表配置
export const CHART_CONFIG = {
  REFRESH_INTERVAL: '5m',
  TIME_FROM: 'now-5m',
  TIME_TO: 'now',
  ORG_ID: 1,
} as const;
