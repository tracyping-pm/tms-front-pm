export interface INewsRes {
  total: number;
  list: INewsListRecord[];
  pageNum: number;
  pageSize: number;
  size: number;
  startRow: number;
  endRow: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  navigatePages: number;
  navigatepageNums: number[];
  navigateFirstPage: number;
  navigateLastPage: number;
}
export interface INewsListRecord {
  id: number;
  type: string;
  content: string;
  customParam: string;
  createdAt: string;
  receiver: number;
  hasRead: boolean;
}
export interface IUnReadNewsRes {
  unreadCount: number;
  unreadCountStr: string;
}
