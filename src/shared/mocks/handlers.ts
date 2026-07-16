import { delay, http, HttpResponse, passthrough } from "msw";

import { getMainInfoMockApi } from "@/entities/user/api/mocks/getMainInfoMockApi";
import type { Response } from "@/shared/lib/api";
import { SCREEN_ID_HEADER } from "@/shared/lib/api";

const MEMBER_LIST_MOCK = [
  { id: "1001", name: "김현대", status: "이용 중" },
  { id: "1002", name: "이모빌리티", status: "휴면" },
  { id: "1003", name: "박충전", status: "이용 중" },
] as const;

const createMockResponse = <T>(data: T): Response<T> => ({
  trace: "mock",
  code: "0000",
  message: "success",
  data,
});

export const handlers = [
  http.post("http://localhost:3000/api/backend/test/file/testcase_001", () => {
    return passthrough();
  }),
  http.get("/api/permissions", async ({ request }) => {
    if (request.headers.has(SCREEN_ID_HEADER)) {
      return HttpResponse.json(
        { message: `${SCREEN_ID_HEADER} header is not allowed.` },
        { status: 400 },
      );
    }

    const response = await getMainInfoMockApi();

    return HttpResponse.json(createMockResponse(response));
  }),
  http.get("/api/emsp/members", async ({ request }) => {
    await delay(300);

    if (!request.headers.has(SCREEN_ID_HEADER)) {
      return HttpResponse.json(
        { message: `${SCREEN_ID_HEADER} header is required.` },
        { status: 400 },
      );
    }

    const keyword =
      new URL(request.url).searchParams.get("keyword")?.trim().toLowerCase() ??
      "";
    const members = MEMBER_LIST_MOCK.filter((member) => {
      return member.name.toLowerCase().includes(keyword);
    });

    return HttpResponse.json(createMockResponse(members));
  }),
];
