import { Tab } from "@hae-fe/elements";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { SCREEN_ID } from "@/shared/config";
import { useSystemModal } from "@/shared/lib/modal";
import { navigateToScreen } from "@/shared/lib/navigation/navigation";
import { PageLayout } from "@/widgets/layout/ui";

import { useGetTermTypeListQuery, useGetTermVersionListQuery } from "../api";
import { termsFilterState, type TermsListFilterState } from "../model";
import { TermTypeManageModal } from "./_TermTypeManageModal";
import { TermsListFilter } from "./_TermsListFilter";
import { TermsTable } from "./_TermsTable";
import { TermsTableToolbar } from "./_TermsTableToolbar";

const TermsListPage = () => {
  const [filter, setFilter] = useState<TermsListFilterState>(termsFilterState);
  const method = useForm<TermsListFilterState>({
    defaultValues: termsFilterState,
  });
  const [selectedTermCode, setSelectedTermCode] = useState("");
  const [termTypeModalOpen, setTermTypeModalOpen] = useState(false);
  const { snackbar } = useSystemModal();

  const { data: termTypeResponse } = useGetTermTypeListQuery();
  const terms = useMemo(
    () => termTypeResponse?.data ?? [],
    [termTypeResponse?.data],
  );
  const tabItems = useMemo(
    () =>
      terms.map((term) => ({
        label: term.termName,
        value: term.termCode,
      })),
    [terms],
  );

  useEffect(() => {
    if (selectedTermCode || terms.length === 0) return;

    setSelectedTermCode(terms[0].termCode);
  }, [selectedTermCode, terms]);

  useEffect(() => {
    if (terms.length === 0) {
      setSelectedTermCode("");
      return;
    }

    if (terms.some((term) => term.termCode === selectedTermCode)) return;

    setSelectedTermCode(terms[0].termCode);
  }, [selectedTermCode, terms]);

  const { data: { data: { content = [], totalCount } = {} } = {}, isLoading } =
    useGetTermVersionListQuery(
      {
        path: {
          termCode: selectedTermCode,
        },
        query: {
          revisionReason: filter.revisionReason || undefined,
          isRequired:
            filter.isRequired === "" ? undefined : Boolean(filter.isRequired),
          deployDate: filter.deployDate || undefined,
        },
        paging: {
          page: filter.page,
          size: filter.size,
        },
      },
      !!selectedTermCode,
    );

  const handleReset = () => {
    method.reset(termsFilterState);
    setFilter({ ...termsFilterState });
  };

  const handleChangeTerm = (value: string) => {
    setSelectedTermCode(value);
    method.reset(termsFilterState);
    setFilter({ ...termsFilterState });
  };

  const handleCreate = () => {
    if (!selectedTermCode) return;

    navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS_CREATE, {
      pathParams: {
        termCode: selectedTermCode,
      },
    });
  };

  const hasSearched =
    !!filter.revisionReason || filter.isRequired !== "" || !!filter.deployDate;

  return (
    <PageLayout
      title="약관/개인정보 관리"
      onFavoriteToggle={() => {}}
      headerButtonItems={[
        {
          label: "약관 종류 관리",
          variant: "ghost",
          onClick: () => setTermTypeModalOpen(true),
        },
      ]}
    >
      <FormProvider {...method}>
        <Tab
          className="mb-5"
          hdsProps={{ type: "line", size: "medium" }}
          items={tabItems}
          value={selectedTermCode}
          onChange={(_event: unknown, newValue: unknown) =>
            handleChangeTerm(String(newValue ?? ""))
          }
        />
        <TermsListFilter onReset={handleReset} setFilter={setFilter} />
        <div className="flex min-h-150 w-full flex-col">
          <TermsTableToolbar
            count={totalCount ?? 0}
            perPage={filter.size}
            createDisabled={!selectedTermCode}
            onCreate={handleCreate}
            onPerPageChange={(size) =>
              setFilter((prev) => ({ ...prev, page: 0, size }))
            }
          />
          <TermsTable
            hasSearched={hasSearched}
            page={filter.page}
            data={content}
            perPage={filter.size}
            totalCount={totalCount || 0}
            isLoading={isLoading}
            onChangePage={(page) => setFilter((prev) => ({ ...prev, page }))}
          />
        </div>
      </FormProvider>

      <TermTypeManageModal
        open={termTypeModalOpen}
        onOpen={setTermTypeModalOpen}
        onSave={() => snackbar({ message: "저장이 완료되었습니다." })}
      />
    </PageLayout>
  );
};

export default TermsListPage;
