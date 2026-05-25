import { uniqBy } from 'lodash';

export const STEP_EVENTS = {
  STEP1_NEXT_TRIGGER: 'STEP1_NEXT_TRIGGER',
};

export const deDuplication = (arr: any[], id = 'id') => {
  return uniqBy(arr, id);
};

export const checkListItemRepeat = (arr: any[], id = 'id') => {
  const ids = arr.map((item) => item?.[id]);
  const set = new Set(ids);
  return set.size !== ids.length;
};

export const buildVid = (item: any, prefix?: string) => {
  const padId = item?.padId ?? '';
  const sadId = item?.sadId ?? '';
  const tadId = item?.tadId ?? '';
  const label = item?.label ?? '';

  return `${prefix ?? ''}${padId}${sadId}${tadId}${label}`;
};
