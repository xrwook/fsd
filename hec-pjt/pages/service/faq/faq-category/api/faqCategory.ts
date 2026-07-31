import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiRequest, type Request, type Response } from "@/shared/lib/api";

import { faqListQueryFactory } from "../../faq-list/api/faqList";

export type FaqCategoryFixedType = "TOP10" | "NORMAL";

export type FaqCategoryItem = {
  id: string;
  categoryName: string;
  sortNo: number;
  fixedType: FaqCategoryFixedType;
  version: number;
  faqCount: number;
};

export type FaqCategoryListRequest = Request<{
  query?: {
    searchFixedType?: FaqCategoryFixedType;
  };
}>;

export type FaqCategoryListResponse = Response<FaqCategoryItem[]>;

export type FaqCategorySaveItem = {
  id: string | null;
  categoryName: string;
  version: number;
  isDeleted: boolean;
};

export type FaqCategorySaveRequest = Request<{
  requestBody: {
    sortedCategories: FaqCategorySaveItem[];
  };
}>;

export const getFaqCategoryList = async (
  params: FaqCategoryListRequest = {},
) => {
  const response = await apiRequest<FaqCategoryListResponse>(
    "get",
    "/pfmt/faq/categories/all",
    params,
  );
  return response.data;
};

export const faqCategorySaveApi = async (params: FaqCategorySaveRequest) => {
  const response = await apiRequest<Response<null>>(
    "put",
    "/pfmt/faq/categories",
    params,
  );
  return response.data;
};

export const faqCategoryQueryFactory = {
  all: () => ["faq-category"] as const,
  list: (params: FaqCategoryListRequest = {}, enabled = true) =>
    queryOptions({
      queryKey: [...faqCategoryQueryFactory.all(), "list", params] as const,
      queryFn: () => getFaqCategoryList(params),
      enabled,
    }),
};

export const useGetFaqCategoryListQuery = (
  params: FaqCategoryListRequest = {},
  enabled = true,
) => {
  return useQuery(faqCategoryQueryFactory.list(params, enabled));
};

export const useFaqCategorySaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: FaqCategorySaveRequest) => faqCategorySaveApi(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: faqCategoryQueryFactory.all(),
      });
      queryClient.invalidateQueries({ queryKey: faqListQueryFactory.all() });
    },
  });
};
