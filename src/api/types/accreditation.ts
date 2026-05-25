export interface IAccreditationFileItem {
  fileAccreditationId: string;
  fileId: string;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailString: string;
  [key: string]: unknown;
}

export interface IAccreditationCategoryItem {
  accreditationId: string;
  materialId: number;
  fileCategory: string;
  defaultCategory: 0 | 1;
  fileList: IAccreditationFileItem[];
}

export interface IAccreditationRecord {
  customerId: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
}
