import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/lib/api";
import { fileKeys } from "@/shared/query-keys";

import type {
  FileGroupsRequest,
  FileGroupsResponse,
  FileGroupIdResponse,
  FileUploadUrlRequestItem,
  ImageUploadUrlRequest,
  ImageUploadUrlResponse,
  MultipleFileUploadUrlsRequest,
  MultipleFileUploadUrlsResponse,
} from "./model";

const MULTIPLE_FILE_UPLOAD_URLS_API_URL =
  "/v1/backoffice/files/multiple/upload/urls";
const IMAGE_UPLOAD_URL_API_URL = "/v1/backoffice/files/image/updown/url";
const FILE_GROUPS_API_URL = "/v1/backoffice/files/groups";
const FILE_GROUP_ID_API_URL = "/v1/backoffice/files/group-id";

export const createMultipleFileUploadUrls = async (
  requestBody: FileUploadUrlRequestItem[],
) => {
  const response = await apiRequest<
    MultipleFileUploadUrlsResponse,
    MultipleFileUploadUrlsRequest
  >("post", MULTIPLE_FILE_UPLOAD_URLS_API_URL, {
    requestBody,
  });

  return response.data.data;
};

export const createImageUploadUrl = async (
  requestBody: FileUploadUrlRequestItem,
) => {
  const response = await apiRequest<
    ImageUploadUrlResponse,
    ImageUploadUrlRequest
  >("post", IMAGE_UPLOAD_URL_API_URL, {
    requestBody,
  });

  return response.data.data;
};

export const getFileGroups = async (params: FileGroupsRequest) => {
  const response = await apiRequest<FileGroupsResponse, FileGroupsRequest>(
    "get",
    FILE_GROUPS_API_URL,
    params,
  );

  return response.data.data;
};

export const getFileGroupId = async () => {
  const response = await apiRequest<FileGroupIdResponse>(
    "get",
    FILE_GROUP_ID_API_URL,
  );

  return response.data.data;
};

export const fileQueryFactory = {
  all: () => fileKeys.all,
  groups: (params: FileGroupsRequest) =>
    queryOptions({
      queryFn: () => getFileGroups(params),
      queryKey: fileKeys.groups(params),
    }),
};

export const useGetFileGroupsQuery = (params: FileGroupsRequest) => {
  return useQuery(fileQueryFactory.groups(params));
};

export const useUploadUrlsMutation = () => {
  return useMutation({
    mutationFn: createMultipleFileUploadUrls,
    mutationKey: fileKeys.multipleUploadUrls(),
  });
};

export const useImageUploadUrlMutation = () => {
  return useMutation({
    mutationFn: createImageUploadUrl,
    mutationKey: fileKeys.imageUploadUrl(),
  });
};

export const useFileGroupIdMutation = () => {
  return useMutation({
    mutationFn: getFileGroupId,
    mutationKey: fileKeys.groupId(),
  });
};
