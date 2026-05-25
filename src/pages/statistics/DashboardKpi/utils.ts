import dayjs from 'dayjs';
import {
  CHART_CONFIG,
  CountryType,
  GRAFANA_BASE_URL,
  TIMEZONES,
} from './constants';
import { MapDateState } from './types';

/**
 * 构建 Grafana iframe URL
 */
export const buildFrameSrcUrl = (
  panelId: number,
  country: CountryType,
  mapDate: MapDateState,
  theme: string,
): string | undefined => {
  if (mapDate.mapStartDate === '' || mapDate.mapEndDate === '') {
    return undefined;
  }

  const params = new URLSearchParams({
    orgId: CHART_CONFIG.ORG_ID.toString(),
    refresh: CHART_CONFIG.REFRESH_INTERVAL,
    from: CHART_CONFIG.TIME_FROM,
    to: CHART_CONFIG.TIME_TO,
    'var-country': country,
    'var-map_start_date': mapDate.mapStartDate,
    'var-map_end_date': mapDate.mapEndDate,
    theme,
    panelId: panelId.toString(),
  });

  return `${GRAFANA_BASE_URL}?${params.toString()}`;
};

/**
 * 构建历史地图的 Grafana iframe URL
 */
export const buildFrameSrcUrlForHistoryMap = (
  panelId: number,
  country: CountryType,
  mapDate: MapDateState,
  theme: string,
): string | undefined => {
  if (mapDate.mapStartDate === '' || mapDate.mapEndDate === '') {
    return undefined;
  }

  const params = new URLSearchParams({
    orgId: CHART_CONFIG.ORG_ID.toString(),
    from: CHART_CONFIG.TIME_FROM,
    to: CHART_CONFIG.TIME_TO,
    'var-country': country,
    'var-map_start_date': mapDate.mapStartDate,
    'var-map_end_date': mapDate.mapEndDate,
    theme,
    panelId: panelId.toString(),
  });

  return `${GRAFANA_BASE_URL}?${params.toString()}`;
};

/**
 * 获取指定国家的时区
 */
export const getTimezone = (country: CountryType): string => {
  return TIMEZONES[country as CountryType] || 'UTC';
};

/**
 * 显示几天前的日期
 */
export const showDaysAgo = (
  days: number,
  country: CountryType,
): MapDateState => {
  const timeZone = getTimezone(country);
  const nowStr = new Date().toLocaleDateString('en-CA', {
    timeZone: timeZone,
  }); // '2024-11-01'
  const agoDay = new Date(nowStr);
  agoDay.setDate(agoDay.getDate() - days);
  const agoDayStr = agoDay.toLocaleDateString('en-CA');

  return {
    mapStartDate: agoDayStr,
    mapEndDate: agoDayStr,
  };
};

/**
 * 显示几个月前的日期
 */
export const showMonthsAgo = (
  months: number,
  country: CountryType,
  mapSingleEnable: boolean,
): MapDateState => {
  if (months === 0) {
    return { mapStartDate: '', mapEndDate: '' };
  }

  const utcDate = dayjs.utc();
  const zone = getTimezone(country);
  const localDate = utcDate.tz(zone);
  const firstDayOfMonthStart = localDate
    .subtract(months - 1, 'month')
    .startOf('month');

  let firstDayOfMonthEnd = localDate;
  if (mapSingleEnable && Number(months) !== 1) {
    firstDayOfMonthEnd = localDate.subtract(months - 1, 'month').endOf('month');
  }

  return {
    mapStartDate: firstDayOfMonthStart.format('YYYY-MM-DD'),
    mapEndDate: firstDayOfMonthEnd.format('YYYY-MM-DD'),
  };
};

/**
 * 禁用日期函数（不能选择今天之后的日期）
 */
export const getDisabledDate = (country: CountryType) => {
  return (current: dayjs.Dayjs) => {
    const utcDate = dayjs.utc();
    const zone = getTimezone(country);
    const localDate = utcDate.tz(zone);
    return current && current > localDate.startOf('day');
  };
};
