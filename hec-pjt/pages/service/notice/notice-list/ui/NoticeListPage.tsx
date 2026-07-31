import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SCREEN_ID } from '@/shared/config';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';
import { PageLayout } from '@/widgets/layout/ui';

import { useGetNoticeListQuery } from '../api/noticeList';
import { noticeFilterState, type NoticeListFilterState } from '../model/filter';
import { NoticeListFilter } from './_NoticeListFilter';
import { NoticeTable } from './_NoticeTable';
import { NoticeTableToolbar } from './_NoticeTableToolbar';

const NoticeListPage = () => {
  const [filter, setFilter] = useState<NoticeListFilterState>(noticeFilterState);
  const method = useForm<NoticeListFilterState>({ defaultValues: noticeFilterState });

  const {
    data: {
      data: { content = [], totalCount } = {},
    } = {},
    isLoading,
  } = useGetNoticeListQuery({
    query: {
      searchKeyword: filter.searchKeyword,
      searchNoticeTypeCd: filter.searchNoticeTypeCd,
      searchPublishType: filter.searchPublishType,
      searchStartPublishedAt: filter.searchStartPublishedAt,
      searchEndPublishedAt: filter.searchEndPublishedAt,
    },
    paging: {
      page: filter.page,
      size: filter.size,
    },
  });

  const handleReset = () => {
    method.resetField('searchKeyword');
    method.resetField('searchNoticeTypeCd');
    method.resetField('searchPublishType');
    method.resetField('searchStartPublishedAt');
    method.resetField('searchEndPublishedAt');
    setFilter({
      ...noticeFilterState,
    });
  };

  const hasSearched =
    !!filter.searchKeyword ||
    !!filter.searchNoticeTypeCd ||
    !!filter.searchPublishType ||
    !!filter.searchStartPublishedAt ||
    !!filter.searchEndPublishedAt;

  return (
    <PageLayout
      headerButtonItems={[
        {
          label: '등록',
          onClick: () => navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC_CREATE),
          variant: 'primary',
        },
      ]}
      onFavoriteToggle={() => {}}
      title="공지사항"
    >
      <FormProvider {...method}>
        <NoticeListFilter onReset={handleReset} setFilter={setFilter} />
        <div className="flex flex-col">
          <NoticeTableToolbar
            perPage={filter.size}
            onPerPageChange={size => setFilter(prev => ({ ...prev, page: 0, size }))}
            count={totalCount ?? 0}
          />
          <NoticeTable
            hasSearched={hasSearched}
            page={filter.page}
            data={content}
            perPage={filter.size}
            totalCount={totalCount || 0}
            isLoading={isLoading}
            onChangePage={page => setFilter(prev => ({ ...prev, page }))}
          />
        </div>
      </FormProvider>
    </PageLayout>
  );
};

export default NoticeListPage;
