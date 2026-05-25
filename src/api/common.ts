import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';
import {
  CommonUploadOptions,
  ICommonMaterial,
  IFieldQueryHighlightParams,
  IFieldQueryHighlightRes,
  IFmsVehicleResp,
  IMaterialFileParams,
  IMaterialImageParams,
  ISlackGroupItem,
  RequestPromise,
} from './types/common';

export const fieldQueryHighlight = (
  params: IFieldQueryHighlightParams,
  signal: AbortSignal,
): RequestPromise<IFieldQueryHighlightRes[]> => {
  return request(`/api/es/fieldQueryHighlight`, {
    method: 'post',
    data: params,
    signal: signal,
  });
};

export const commonUpload = (options: CommonUploadOptions) => {
  const { url, method, formData, signal, progressCallback } = options;
  return request(url, {
    method,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      const percent = Math.floor(
        (progressEvent.loaded / progressEvent.total) * 100,
      );
      // console.log(`文件上传进度:${percent}%`);
      progressCallback?.(percent);
    },
    data: formData,
    signal,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const materialImage = (
  params: IMaterialImageParams,
): RequestPromise<any> => {
  const { materialId, driveFileId } = params;

  return request(`/api/materials/${materialId}/image/${driveFileId}`, {
    method: 'get',
  });
};

export const materialFile = (
  params: IMaterialFileParams,
): RequestPromise<any> => {
  const { materialId, driveFileId, fileName } = params;

  return request(
    `/api/materials/${materialId}/file/${driveFileId}?fileName=${fileName}`,
    {
      method: 'get',
      timeout: FILE_UPLOAD_TIMEOUT,
      // skipErrorHandler: true,
    },
  );
};

// 内部使用
// 地址转换
export const locationConvert = (params: {
  url: string;
}): RequestPromise<null> => {
  return request(`/api/temp/location/locationConvert`, {
    method: 'post',
    data: params,
    timeout: 1000 * 60 * 30,
  });
};

export const fmsVehicle = (params: {
  plateNumber: string;
  time: string;
}): RequestPromise<IFmsVehicleResp> => {
  return request(`/api/fms/vehicle`, {
    method: 'post',
    data: params,
  });
};

export const imgpost = (url: string, data: any, timeout = 300000) => {
  return request(url, {
    method: 'post',
    data: data,
    timeout: timeout,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const materialPreview = (
  params: IMaterialImageParams,
): RequestPromise<string> => {
  const { materialId, driveFileId } = params;
  return request(`/api/materials/${materialId}/preview/${driveFileId}`, {
    method: 'get',
  });
};

// Slack message
export const slackGroupList = (): RequestPromise<ISlackGroupItem[]> => {
  return request(`/api/slack/group-list`, {
    method: 'get',
  });
};

export const slackSendMsg = (params: {
  users: string[];
  msg: string;
}): RequestPromise<null> => {
  return request(`/api/slack/send-msg`, {
    method: 'post',
    data: params,
  });
};

export const materialsMultiDownload = (params: string[]): Promise<Blob> => {
  return request(`/api/materials/multi-download`, {
    method: 'post',
    data: params,
    skipErrorHandler: true,
    responseType: 'blob',
  });
};

export interface ISummaryListItem {
  addTime: string;
  description: string;
  materialList: any[];
  vendorSummaryId: number;
}

export const getImageSource = async (material: ICommonMaterial) => {
  const payload = {
    materialId: material.fileMaterialId,
    driveFileId: material.fileDriveId,
  };
  const res = await materialImage(payload);

  return new Promise((resolve, reject) => {
    if (res.code === 200) {
      const src = `data:${material.fileMimeType};base64,${res.data}`;
      resolve({
        material,
        src,
      });
    } else {
      reject();
    }
  });
};
