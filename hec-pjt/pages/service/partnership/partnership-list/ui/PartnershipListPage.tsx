import { Snackbar } from "@hae-fe/elements";
import { IconCheckCircle } from "@hae-fe/icon-library/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { PageLayout } from "@/widgets/layout/ui";

import { PartnershipDetailModal } from "../../partnership-detail/ui/_PartnershipDetailModal";
import { useGetPartnershipListQuery } from "../api";
import {
  partnershipFilterState,
  type PartnershipListFilterState,
  type PartnershipListItem,
} from "../model";
import { PartnershipListFilter } from "./_PartnershipListFilter";
import { PartnershipTable } from "./_PartnershipTable";
import { PartnershipTableToolbar } from "./_PartnershipTableToolbar";

const PartnershipListPage = () => {
  const [filter, setFilter] = useState<PartnershipListFilterState>(
    partnershipFilterState,
  );
  const method = useForm<PartnershipListFilterState>({
    defaultValues: partnershipFilterState,
  });
  const [selectedPartnershipId, setSelectedPartnershipId] = useState<number>();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { data: { data: { content = [], totalCount } = {} } = {}, isLoading } =
    useGetPartnershipListQuery({
      query: {
        searchWord: filter.searchWord || undefined,
        requestStartAt: filter.requestStartAt || undefined,
        requestEndAt: filter.requestEndAt || undefined,
        confirmStartAt: filter.confirmStartAt || undefined,
        confirmEndAt: filter.confirmEndAt || undefined,
        processStatusCd: filter.processStatusCd || undefined,
        page: filter.page,
        size: filter.size,
      },
    });

  const handleReset = () => {
    method.reset(partnershipFilterState);
    setFilter({ ...partnershipFilterState });
  };

  const handleRowClick = (row: PartnershipListItem) => {
    setSelectedPartnershipId(row.partnershipId);
    setDetailModalOpen(true);
  };

  const hasSearched =
    !!filter.searchWord ||
    !!filter.requestStartAt ||
    !!filter.requestEndAt ||
    !!filter.confirmStartAt ||
    !!filter.confirmEndAt ||
    !!filter.processStatusCd;

  return (
    <PageLayout title="사업 제휴 요청" onFavoriteToggle={() => {}}>
      <FormProvider {...method}>
        <PartnershipListFilter onReset={handleReset} setFilter={setFilter} />
        <div className="flex min-h-150 w-full flex-col">
          <PartnershipTableToolbar
            count={totalCount ?? 0}
            perPage={filter.size}
            onPerPageChange={(size) =>
              setFilter((prev) => ({ ...prev, page: 0, size }))
            }
          />
          <PartnershipTable
            data={content}
            hasSearched={hasSearched}
            isLoading={isLoading}
            page={filter.page}
            perPage={filter.size}
            totalCount={totalCount || 0}
            onChangePage={(page) => setFilter((prev) => ({ ...prev, page }))}
            onRowClick={handleRowClick}
          />
        </div>
      </FormProvider>

      <PartnershipDetailModal
        modalOpen={detailModalOpen}
        partnershipId={selectedPartnershipId}
        onModalOpen={setDetailModalOpen}
        onConfirmSuccess={() => setSnackbarOpen(true)}
      />
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        hdsProps={{
          message: "검토가 완료되었습니다.",
          deletable: false,
          placement: "top",
          icon: <IconCheckCircle size={16} type="fill" />,
        }}
      />
    </PageLayout>
  );
};

export default PartnershipListPage;
