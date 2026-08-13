import type { FileGroupItem } from "@/shared/api/file/model";

export type HomePageableQuery = {
  page?: number;
  size?: number;
  sort?: string[];
};

export type HomePageData<T> = {
  content: T[];
  totalPages: number;
  size: number;
  totalCount: number;
  page: number;
};

export type HomeMenuVisitItem = {
  screenId: string;
  name: string;
  url: string;
  visitedAt: string;
  isFavorite: boolean;
  favoritedAt: string | null;
};

export type HomeNoticeListItem = {
  id: string;
  isImportant: boolean;
  title: string;
  modifiedDate: string;
};

export type HomeNoticeDetail = {
  id: string;
  noticeTypeCdName: string;
  isImportant: boolean;
  title: string;
  content: string;
  publishStatus: string;
  publishedAt: string;
  attachFiles: FileGroupItem[];
};
