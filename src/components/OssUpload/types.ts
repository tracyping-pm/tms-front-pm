export enum ENUM_OSS_MENU_DIRECTORY {
  HOME = 'home',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  PROJECT = 'project',
  AR_AP = 'ar_ap',
  USER = 'user',
  TOOLS = 'tools',
  OTHER = 'other',
  CREW = 'crew',
}

export interface IDocument {
  documentId: number;
  fileId: string; // eg. tms/other/1.jpeg
  fileName: string;
  originalFileName: string;
  fileType: string; // eg. jpeg
  fileMimeType: string; // eg. image/jpeg
  fileSize: number;
  snapshotUrl: string;
  fileNumber: string;
}

export type IOssFile = Pick<
  IDocument,
  'documentId' | 'originalFileName' | 'snapshotUrl'
>;

export interface IOssSignature {
  version: string;
  policy: string;
  credential: string;
  ossDate: string;
  signature: string;
  token: string;
  dir: string;
  host: string;
}

export interface ISourceImage {
  documentId: number;
  src: string;
}

export interface IImagePreviewGroupState {
  pending: boolean;
  visible: boolean;
  index: number;
  sourceImageList: ISourceImage[];
}
