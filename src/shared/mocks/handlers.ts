import { delay, http, HttpResponse } from "msw";

import { getMenuPermissionMockApi } from "@/entities/user/api/mocks/getMenuPermissionMockApi";
import { PAGE_ID_HEADER } from "@/shared/lib/axios";

const MEMBER_LIST_MOCK = [
  { id: "1001", name: "김현대", status: "이용 중" },
  { id: "1002", name: "이모빌리티", status: "휴면" },
  { id: "1003", name: "박충전", status: "이용 중" },
] as const;

export const handlers = [
  http.get("/api/permissions", async ({ request }) => {
    if (request.headers.has(PAGE_ID_HEADER)) {
      return HttpResponse.json(
        { message: `${PAGE_ID_HEADER} header is not allowed.` },
        { status: 400 },
      );
    }

    const response = await getMenuPermissionMockApi();

    return HttpResponse.json(response);
  }),
  http.get("/api/emsp/members", async ({ request }) => {
    await delay(300);

    if (!request.headers.has(PAGE_ID_HEADER)) {
      return HttpResponse.json(
        { message: `${PAGE_ID_HEADER} header is required.` },
        { status: 400 },
      );
    }

    const keyword =
      new URL(request.url).searchParams.get("keyword")?.trim().toLowerCase() ??
      "";
    const members = MEMBER_LIST_MOCK.filter((member) => {
      return member.name.toLowerCase().includes(keyword);
    });

    return HttpResponse.json(members);
  }),
];
