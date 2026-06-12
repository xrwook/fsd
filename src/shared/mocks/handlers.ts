import { http, HttpResponse } from "msw";
import { getMenuPermissionMockApi } from "@/entities/user/api/mocks/getMenuPermissionMockApi";

export const handlers = [
  http.get("/api/permissions", async () => {
    const response = await getMenuPermissionMockApi();

    return HttpResponse.json(response);
  }),
];
