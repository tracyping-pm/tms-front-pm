import { IField } from '@/api/types/tool';
import { CSSProperties } from 'react';

export type IToolField = Omit<
  IField,
  'uuid' | 'x' | 'y' | 'pageNo' | 'mainColor' | 'email'
>;

export interface IFieldState {
  style: CSSProperties;
}

export type IZoomType = 'in' | 'out';

export type IDirection =
  | 'left'
  | 'top'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export interface ISignature {
  id?: number | string;

  name?: string;
  size?: number;
  font?: string;
  color?: string;
  fileBaseStr?: string;
  fileThumbnailUrl?: string;
  fileDriveId?: string;
}

export type IScrollDirection = 'down' | 'up';
