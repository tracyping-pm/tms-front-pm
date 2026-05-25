import type { BuOriginUrlVo } from '@/api-uam/common';
import { BU_TYPE_ENUM } from '@/enums/uam';
import { isLocalhost } from '@/utils/utils';

export const UAM_RELATIVE_PATHS = {
  LOGIN: '/login',
  CHANGE_ROLE: '/change-role',
  CHANGE_PASSWORD: '/change-password',
  NO_AUTH: '/403',
};

const buOriginByCode = new Map<string, string>();

export function setBuOriginUrls(list: BuOriginUrlVo[]) {
  buOriginByCode.clear();
  for (const item of list) {
    if (item.code && item.origin) {
      buOriginByCode.set(item.code, item.origin);
    }
  }
}

function localhostOrigin(buCode: BU_TYPE_ENUM): string {
  const { protocol, hostname } = location;
  const port =
    buCode === BU_TYPE_ENUM.TMS
      ? 8000
      : buCode === BU_TYPE_ENUM.WMS
        ? 3000
        : buCode === BU_TYPE_ENUM.UAM
          ? 9999
          : 8100;
  return `${protocol}//${hostname}:${port}`;
}

export function getOrigin(buCode: BU_TYPE_ENUM): string {
  const fromApi = buOriginByCode.get(buCode);
  if (fromApi) return fromApi;
  if (isLocalhost()) return localhostOrigin(buCode);
  return '';
}

export function getUamUrl(path: string): string {
  const origin = getOrigin(BU_TYPE_ENUM.UAM);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}
