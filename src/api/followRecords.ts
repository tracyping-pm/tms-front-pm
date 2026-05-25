import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';
import { RequestPromise } from './types/common';

export const createFollowRecords = (
  customerId: number,
  params: {
    followTime: string;
    description: string;
  },
  data: FormData,
  signal: AbortSignal,
): RequestPromise<any> => {
  return request(`/api/customers/${customerId}/followRecords`, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      const percent = Math.floor(
        (progressEvent.loaded / progressEvent.total) * 100,
      );
      console.log(`文件上传进度:${percent}%`);
    },
    params: params,
    data: data,
    signal: signal,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};
