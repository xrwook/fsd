import { Snackbar, Tab } from "@hae-fe/elements";
import { IconCheckCircle } from "@hae-fe/icon-library/react";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import type { FaqFormValues } from "@/features/faq-form";
import { formatUtc } from "@/shared/lib/date";
import { ConfirmModal } from "@/shared/ui/modal";
import { PageLayout } from "@/widgets/layout/ui";

import { DisplayModal } from "../../display/ui/_DisplayModal";
import { useGetFaqCategoryListQuery } from "../../faq-category/api/faqCategory";
import CategoryModal from "../../faq-category/ui/_CategoryModal";
import { useFaqCreateMutation } from "../../faq-create/api/faqCreate";
import { FaqCreateModal } from "../../faq-create/ui/FaqCreateModal";
import {
  type FaqDetailData,
  useDeleteFaqMutation,
} from "../../faq-detail/api/faqDetail";
import { FaqDetailModal } from "../../faq-detail/ui/_FaqDetailModal";
import { useFaqUpdateMutation } from "../../faq-update/api/faqUpdate";
import { useGetFaqListQuery } from "../api/faqList";
import { faqFilterState, type FaqListFilterState } from "../model";
import type { FaqListItem } from "../model/faqList";
import { FaqListFilter } from "./_FaqListFilter";
import { FaqTable } from "./_FaqTable";
import { FaqTableToolbar } from "./_FaqTableToolbar";

const toFaqRequestBody = (values: FaqFormValues) => ({
  ...values,
  scheduledAt:
    values.publishType === "SCHEDULED" && values.scheduledAt
      ? formatUtc(values.scheduledAt)
      : null,
});

const FaqList = () => {
  const [filter, setFilter] = useState<FaqListFilterState>(faqFilterState);
  const method = useForm<FaqListFilterState>({
    defaultValues: faqFilterState,
  });
  const [selectedFaqId, setSelectedFaqId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    version: number;
  } | null>(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqDetailModalOpen, setFaqDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarDelOpen, setSnackbarDelOpen] = useState(false);
  const [faqModifySnackbar, setFaqModifySnackbar] = useState(false);
  const [displayModalOpen, setDisplayModalOpen] = useState(false);
  const [snackbarSaveOpen, setSnackbarSaveOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { data: categoryResponse } = useGetFaqCategoryListQuery({
    query: { searchFixedType: "NORMAL" },
  });
  const { mutate: createFaq } = useFaqCreateMutation();
  const { mutate: updateFaq } = useFaqUpdateMutation();
  const { mutate: deleteFaq } = useDeleteFaqMutation();

  const categories = categoryResponse?.data ?? [];
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.categoryName,
        value: category.id,
      })),
    [categories],
  );
  const tabItems = useMemo(
    () => [{ label: "전체", value: "" }, ...categoryOptions],
    [categoryOptions],
  );

  const { data: { data: { content = [], totalCount } = {} } = {}, isLoading } =
    useGetFaqListQuery({
      query: {
        searchFaqCategoryId: filter.searchFaqCategoryId,
        searchKeyword: filter.searchKeyword,
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
    method.reset(faqFilterState);
    setFilter({ ...faqFilterState });
  };

  const handleChangeCategory = (value: string) => {
    method.setValue("searchFaqCategoryId", value);
    setFilter((prev) => ({
      ...prev,
      searchFaqCategoryId: value,
      page: 0,
    }));
  };

  const handleCreateSubmit = (values: FaqFormValues) => {
    createFaq(
      {
        requestBody: toFaqRequestBody(values),
      },
      {
        onSuccess: () => {
          setSnackbarOpen(true);
        },
      },
    );
  };

  const handleDeleteRequest = (detail?: FaqDetailData) => {
    if (!selectedFaqId) return;

    setDeleteTarget({
      id: selectedFaqId,
      version: detail?.version ?? 0,
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    deleteFaq(
      {
        path: {
          id: deleteTarget.id,
        },
        query: {
          version: deleteTarget.version,
        },
      },
      {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setFaqDetailModalOpen(false);
          setSnackbarDelOpen(true);
          setDeleteTarget(null);
        },
      },
    );
  };

  const handleUpdateSubmit = (values: FaqFormValues) => {
    if (!selectedFaqId) return;

    updateFaq(
      {
        path: {
          id: selectedFaqId,
        },
        requestBody: toFaqRequestBody(values),
      },
      {
        onSuccess: () => {
          setFaqModifySnackbar(true);
          setFaqDetailModalOpen(false);
        },
      },
    );
  };

  const handleRowClick = (row: FaqListItem) => {
    setSelectedFaqId(row.id);
    setFaqDetailModalOpen(true);
  };

  const handleSave = () => {
    setDisplayModalOpen(false);
    setSnackbarSaveOpen(true);
  };

  const hasSearched =
    !!filter.searchFaqCategoryId ||
    !!filter.searchKeyword ||
    !!filter.searchPublishType ||
    !!filter.searchStartPublishedAt ||
    !!filter.searchEndPublishedAt;

  return (
    <PageLayout
      title="FAQ 관리"
      onFavoriteToggle={() => {}}
      headerButtonItems={[
        {
          label: "노출 순서 설정",
          variant: "ghost",
          onClick: () => {
            setDisplayModalOpen(true);
          },
        },
        {
          label: "카테고리 관리",
          variant: "ghost",
          onClick: () => {
            setCategoryModalOpen(true);
          },
          isDivider: true,
        },
        {
          label: "등록",
          variant: "primary",
          onClick: () => setFaqModalOpen(true),
        },
      ]}
    >
      <FormProvider {...method}>
        <Tab
          className="mb-5"
          hdsProps={{ type: "line", size: "medium" }}
          items={tabItems}
          value={filter.searchFaqCategoryId ?? ""}
          onChange={(_event: unknown, newValue: unknown) =>
            handleChangeCategory(String(newValue ?? ""))
          }
        />

        <FaqListFilter onReset={handleReset} setFilter={setFilter} />

        <div className="md:min-auto flex min-h-150 w-full flex-col">
          <FaqTableToolbar
            count={totalCount ?? 0}
            perPage={filter.size}
            showDownload={!!filter.searchFaqCategoryId}
            onPerPageChange={(size) =>
              setFilter((prev) => ({ ...prev, page: 0, size }))
            }
          />
          <FaqTable
            hasSearched={hasSearched}
            page={filter.page}
            data={content}
            perPage={filter.size}
            totalCount={totalCount || 0}
            isLoading={isLoading}
            onChangePage={(page) => setFilter((prev) => ({ ...prev, page }))}
            onRowClick={handleRowClick}
          />
        </div>
      </FormProvider>

      <FaqCreateModal
        categoryOptions={categoryOptions}
        modalOpen={faqModalOpen}
        onModalOpen={setFaqModalOpen}
        onSubmit={handleCreateSubmit}
      />
      <FaqDetailModal
        categoryOptions={categoryOptions}
        id={selectedFaqId}
        modalOpen={faqDetailModalOpen}
        onModalOpen={setFaqDetailModalOpen}
        onSubmit={handleUpdateSubmit}
        onDelete={handleDeleteRequest}
      />

      <ConfirmModal
        showCloseIcon={false}
        title="삭제 확인"
        message={"삭제한 데이터는 복구할 수 없습니다. \n 삭제하시겠습니까?"}
        nagativeText="취소"
        positiveText="삭제"
        modalOpen={deleteModalOpen}
        onModalOpen={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        positiveSemantic="attention"
      />
      <Snackbar
        open={snackbarDelOpen}
        onClose={() => setSnackbarDelOpen(false)}
        hdsProps={{
          message: "삭제가 완료되었습니다.",
          deletable: false,
          placement: "top",
          icon: <IconCheckCircle size={16} type="fill" />,
        }}
      />
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        hdsProps={{
          message: "등록이 완료되었습니다.",
          deletable: false,
          placement: "top",
          icon: <IconCheckCircle size={16} type="fill" />,
        }}
      />
      <Snackbar
        open={faqModifySnackbar}
        onClose={() => setFaqModifySnackbar(false)}
        hdsProps={{
          message: "수정이 완료되었습니다.",
          deletable: false,
          placement: "top",
          icon: <IconCheckCircle size={16} type="fill" />,
        }}
      />

      <CategoryModal
        open={categoryModalOpen}
        onOpen={setCategoryModalOpen}
        onSave={handleSave}
      />
      <DisplayModal
        modalOpen={displayModalOpen}
        onModalOpen={setDisplayModalOpen}
        onSuccess={handleSave}
      />
      <Snackbar
        open={snackbarSaveOpen}
        onClose={() => setSnackbarSaveOpen(false)}
        hdsProps={{
          message: "설정되었습니다.",
          deletable: false,
          placement: "top",
          icon: <IconCheckCircle size={16} type="fill" />,
        }}
      />
    </PageLayout>
  );
};

export default FaqList;
