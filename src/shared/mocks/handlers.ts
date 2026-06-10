import { http, HttpResponse } from "msw";
import { getUserPermissionMockApi } from "@/entities/user/api/mocks/getUserPermissionMockApi";

export const handlers = [
  http.get("/api/permissions", async () => {
    const response = await getUserPermissionMockApi();

    return HttpResponse.json(response);
  }),
];
