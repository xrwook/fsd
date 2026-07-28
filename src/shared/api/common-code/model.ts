import type { Request, Response } from "@/shared/lib/api";

export type CommonCodeItem = {
  attr1: string;
  attr2: string;
  attr3: string;
  cd: string;
  cdDesc: string;
  cdName: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  forderType: string;
  groupCd: string;
  groupId: string;
  id: string;
  isActive: boolean;
  modifiedBy: string;
  modifiedByName: string;
  modifiedDate: string;
  sortOrder: number;
};

export type CommonCodeRequest = Request<{
  query: {
    groupCd: string;
  };
}>;

export type CommonCodeMultiRequest = Request<{
  query: {
    groupCds: string[];
  };
}>;

export type CommonCodeDetailRequest = Request<{
  query: {
    cd: string;
    groupCd: string;
  };
}>;

export type CommonCodeResponse = Response<CommonCodeItem[]>;
export type CommonCodeMultiResponse = Response<
  Record<string, CommonCodeItem[]>
>;
export type CommonCodeDetailResponse = Response<CommonCodeItem>;
