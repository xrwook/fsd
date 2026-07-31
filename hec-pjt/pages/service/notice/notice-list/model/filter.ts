import type { DropdownOption, FilterSelectItem } from '@hae-fe/elements';

export type NoticeListFilterState = {
  searchKeyword?: string;
  searchNoticeTypeCd?: string;
  searchPublishType?: string;
  searchStartPublishedAt?: string;
  searchEndPublishedAt?: string;
  page: number;
  size: number;
};

export const noticeFilterState: NoticeListFilterState = {
  searchKeyword: '',
  searchNoticeTypeCd: '',
  searchPublishType: '',
  searchStartPublishedAt: '',
  searchEndPublishedAt: '',
  page: 0,
  size: 15,
};

export const AllItem: FilterSelectItem = { label: '전체', value: '' };

export const PER_PAGE_OPTIONS: DropdownOption[] = [
  { label: '15개씩 보기', value: '15' },
  { label: '25개씩 보기', value: '25' },
  { label: '50개씩 보기', value: '50' },
  { label: '100개씩 보기', value: '100' },
];
