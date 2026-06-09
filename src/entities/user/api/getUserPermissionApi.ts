import { axiosInstance } from "@/shared/lib/axios";
import type { TPermissionApiResponse } from "@/entities/user/lib/permission/types";

export const getUserPermissionApi = async () => {
  return axiosInstance.get<TPermissionApiResponse>("/api/permissions");
};
