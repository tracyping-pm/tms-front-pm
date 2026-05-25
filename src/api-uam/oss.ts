import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';
import { CommonUploadOptions, RequestPromise } from './types/common';
import { IOssSignature } from './types/oss';

export const ossGetUploadSignature = (): RequestPromise<IOssSignature> => {
  return request(`/uam-api/oss/get-upload-signature`, {
    method: 'get',
  });
};

export const ossUpload = (options: CommonUploadOptions) => {
  const {
    url,
    method,
    formData,
    signal,
    progressCallback,
    skipErrorHandler = false,
  } = options;
  return request(url, {
    method,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      const percent = Math.floor(
        (progressEvent.loaded / progressEvent.total) * 100,
      );
      console.log(`文件上传进度:${percent}%`);
      progressCallback?.(percent);
    },
    data: formData,
    signal,
    timeout: FILE_UPLOAD_TIMEOUT,
    skipErrorHandler,
  });
};

export const ossGetPreviewUrl = (params: {
  documentId: number;
}): RequestPromise<string> => {
  return request(`/uam-api/document/get-preview-url`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const ossGetDownloadUrl = (params: {
  documentId: number;
}): RequestPromise<string> => {
  return request(`/uam-api/document/get-download-url`, {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};
