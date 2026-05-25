import { UAM_LOCAL_REDIRECT_TOKEN_PARAM } from '@/constants';
import { REGION_ID_ENUM } from '@/enums/uam';
import dayjs from 'dayjs';
import Cookie from 'js-cookie';
import _ from 'lodash';
import queryString from 'query-string';

export const isLocalhost = () => {
  return (
    location.origin?.includes('localhost') ||
    /[\d]+\.[\d]+\.[\d]+\.[\d]+:[\d]+/.test(location.origin)
  );
};

function pickUamRedirectToken(
  parsed: queryString.ParsedQuery<string>,
): string | undefined {
  const v = parsed[UAM_LOCAL_REDIRECT_TOKEN_PARAM];
  if (typeof v === 'string' && v) return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

export function consumeLocalhostRedirectToken(tokenKey: string) {
  if (typeof location === 'undefined' || !isLocalhost()) return;

  const searchParsed = queryString.parse(
    location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search,
  );
  let token = pickUamRedirectToken(searchParsed);

  if (!token && location.hash.includes('?')) {
    const q = location.hash.indexOf('?');
    const hashParsed = queryString.parse(location.hash.slice(q + 1));
    token = pickUamRedirectToken(hashParsed);
  }

  if (!token) return;

  Cookie.set(tokenKey, token);

  const sp = new URLSearchParams(
    location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search,
  );
  sp.delete(UAM_LOCAL_REDIRECT_TOKEN_PARAM);
  const searchPart = sp.toString() ? `?${sp.toString()}` : '';

  let hashPart = location.hash;
  if (location.hash.includes('?')) {
    const q = location.hash.indexOf('?');
    const pathOnly = location.hash.slice(0, q);
    const hp = new URLSearchParams(location.hash.slice(q + 1));
    hp.delete(UAM_LOCAL_REDIRECT_TOKEN_PARAM);
    const hq = hp.toString();
    hashPart = hq ? `${pathOnly}?${hq}` : pathOnly;
  }

  history.replaceState(
    null,
    '',
    `${location.pathname}${searchPart}${hashPart}`,
  );
}

export const buildCurrentInfo = (userInfo: UserInfo): CurrentUser => {
  let countryId, countryName;

  if (userInfo.currentUserRole?.regionId === REGION_ID_ENUM.Philippines) {
    countryId = 1;
    countryName = 'Philippines';
  } else if (userInfo.currentUserRole?.regionId === REGION_ID_ENUM.Thailand) {
    countryId = 2;
    countryName = 'Thailand';
  } else {
    countryId = 0;
    countryName = '';
    console.error('Unknown countryId and countryName');
  }

  return { ...userInfo, countryId, countryName };
};

export const isSameList = (list1: any[], list2: any[], fieldName?: string) => {
  if (list1?.length !== list2?.length) {
    return false;
  }

  const field = fieldName ?? 'id';

  const ids1 = new Set(list1?.map((item) => item[field]));
  const ids2 = new Set(list2?.map((item) => item[field]));

  if (ids1?.size !== ids2?.size) {
    return false;
  }

  for (let id of ids1) {
    if (!ids2?.has(id)) {
      return false;
    }
  }

  return true;
};

export const openNewTag = (relativeUrl: string) => {
  const url = window.location.origin + relativeUrl;
  window.open(url, '_blank');
};

export const formatAmount = (amount: number): string => {
  if (amount === 0) {
    return '0';
  }
  if (!amount) {
    return '';
  }
  let str = amount?.toString?.();

  let int = str?.split?.('.')[0];
  let decimal = str?.split?.('.')[1];

  // 使用正则表达式每三位添加一个逗号
  int = int?.replace?.(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimal) {
    return `${int}.${decimal}`;
  }

  return int;
};

export const formatAmountWithRound = (amount: number): string => {
  if (amount === 0) {
    return '0';
  }
  if (!amount) {
    return '';
  }

  const int = Math.round(amount).toString();
  const formattedInt = int?.replace?.(/\B(?=(\d{3})+(?!\d))/g, ',');

  return formattedInt;
};

export const formatAmountPercentage = (amount?: number): string => {
  if (amount === 0) {
    return '0.00';
  }
  if (!amount) {
    return '0.00';
  }
  let str = amount?.toString?.();

  let int = str?.split?.('.')[0];
  let decimal = str?.split?.('.')[1] ?? '00';

  // 使用正则表达式每三位添加一个逗号
  int = int?.replace?.(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimal) {
    return `${int}.${decimal}`;
  }

  return int;
};

/**
 * @description 格式化金额（千位分隔 + 两位小数）
 * @param amount 传入金额
 */
export const formatMoneyWithDecimal = (
  amount: number | string,
  decimal = 2,
): string => {
  const num = Number(amount);

  // 防御性编程：处理非数字
  if (isNaN(num)) return '0.00';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(num);
};

export const mergeWithUndefinedAndNull = (...objects: any[]) => {
  return objects.reduce((result, obj) => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value === undefined || value === null) {
        // 如果属性值为 undefined，则进行覆盖
        result[key] = value;
      } else if (value) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // 如果当前属性值是对象，则递归合并
          result[key] = mergeWithUndefinedAndNull(result[key] || {}, value);
        } else {
          // 否则直接覆盖
          result[key] = value;
        }
      } else if (!Object.prototype.hasOwnProperty.call(result, key)) {
        // 如果属性在前面的对象中不存在，则合并该属性
        result[key] = value;
      }
    });

    return result;
  }, {});
};

export const getOS = (): 'Windows' | 'MacOS' | 'Unknown' => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Win')) {
    return 'Windows';
  } else if (userAgent.includes('Mac')) {
    return 'MacOS';
  } else {
    return 'Unknown';
  }
};

export const isUndefinedOrNull = (value: any) => {
  return _.isUndefined(value) || _.isNull(value);
};

export const isValidityPeriod = (startTime: string, endTime: string) => {
  const now = dayjs();

  if (!endTime || !startTime) return;
  return now?.isBefore(endTime) && now?.isAfter(startTime);
};

export const findDuplicates = (arr: any, type: any) => {
  return arr.filter(
    (currentValue: any, currentIndex: number) =>
      arr.findIndex((item: any) => item[type] === currentValue[type]) !==
      currentIndex,
  );
};

export const getFileNameByPath = (path: string) => {
  const nameWithExtension = path?.split?.('/')?.pop?.();
  return nameWithExtension?.split?.('.')?.[0] ?? '';
};

export const getNumberRangeList = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export function getTimeDiffText(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);

  const years = now.diff(target, 'year');
  const afterYears = target.add(years, 'year');

  const months = now.diff(afterYears, 'month');
  const afterMonths = afterYears.add(months, 'month');

  const days = now.diff(afterMonths, 'day');

  const parts: string[] = [];
  if (years) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`);
  }
  if (months) {
    parts.push(`${months} month${months > 1 ? 's' : ''}`);
  }
  if (days) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }

  return parts.length === 0 ? 'today' : parts.join(' ') + ' ago';
}
