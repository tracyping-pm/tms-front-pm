import { IFile_2 } from '@/components/CustomUpload/genAI';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import React from 'react';

export type RequestPromise<T> = Promise<APIJSON<T>>;

export interface IDynamicFuzzyParams {
  projectId?: number;
  approved?: number;
  uniqueLogic?: FieldQueryHighlightUniqueLogicEnum;
  uniqueLogicParams?: { [key: string]: any };
}

export interface IFieldQueryHighlightParams extends IDynamicFuzzyParams {
  field: string;
  value: string;
  esDtoClass: string;
  type: FieldQueryHighlightTypeEnum;
  [key: string]: any;
}

export interface IFieldQueryHighlightRes {
  id?: number;
  name: string;
  additionalRemark: string;
  nameHighlight: string;
  disabled: boolean;
  disabledTip: string;
  uniqueLogicParams?: { [key: string]: any };
  [key: string]: any;
}

export type AxiosRequestHeaders = Record<string, string | number | boolean>;

export interface CommonUploadOptions {
  url: string;
  method: 'post' | 'put';
  headers?: AxiosRequestHeaders;
  formData: FormData;
  signal: AbortSignal;
  skipErrorHandler?: boolean;
  progressCallback?: (v: number) => void;
}

export interface IMaterialImageParams {
  materialId: number | string;
  driveFileId: number | string;
}

export interface IMaterialFileParams {
  materialId: number | string;
  driveFileId: number | string;
  fileName: string;
}

export interface ICommonListItem {
  label: string | number | React.ReactNode;
  value: string | number | React.ReactNode;
  tag?: ITagItem;
  popover?: boolean;
  valueColor?: string;
  pointer?: boolean;
  change?: boolean;
  handle?: () => void;
}

export interface ITagItem {
  text: string;
  style: React.CSSProperties;
}

export interface IFmsVehicleResp {
  deviceDate: string;
  speed: number;
  heading: number;
  latitude: number;
  longitude: number;
  groupBy: number;
}

export interface ICommonMaterial {
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
  file_2?: IFile_2;
  fileNumber?: string;
}
export interface ISlackGroupItem {
  id: string;
  name: string;
  users: string[];
}

export interface ISourceImage {
  material: any;
  src: string;
}

export interface IImageState {
  pending: boolean;
  visible: boolean;
  index: number;
  sourceImages: ISourceImage[];
}

export interface IHaveTipsResponse {
  code: number;
  msg: string;
}
