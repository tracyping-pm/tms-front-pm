import { ossGetPreviewUrl } from '@/api-uam/oss';
import { IImagePreviewGroupState, IOssFile } from './types';

export const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const getExts = (file: any) => {
  const name = (file.name || file.originalFileName).toLowerCase();
  const ext = name.substring(name.lastIndexOf('.'));
  return ext;
};

export const splitFileName = (originalFileName: string) => {
  const index = originalFileName.lastIndexOf('.');
  const ext = originalFileName.substring(index + 1)?.toLowerCase();
  const name = originalFileName.substring(0, index);
  return {
    name,
    ext,
  };
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const downloadFile = (file: any) => {
  // 生成文件 URL
  const url = URL.createObjectURL(file);

  // 创建下载链接
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name || file.originalFileName;

  // 点击触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 释放url
  URL.revokeObjectURL(url);
};

export const initialImagePreviewGroupState: IImagePreviewGroupState = {
  pending: false,
  visible: false,
  index: 0,
  sourceImageList: [],
};

export const getImageSource = async (ossFile: IOssFile) => {
  const res = await ossGetPreviewUrl({ documentId: ossFile.documentId });

  return new Promise((resolve, reject) => {
    if (res.code === 200) {
      resolve({
        src: res.data,
        documentId: ossFile.documentId,
      });
    } else {
      reject();
    }
  });
};
