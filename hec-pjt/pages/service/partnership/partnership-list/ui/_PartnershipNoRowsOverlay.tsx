import {
  Icon3dEmptyCaseNoData,
  Icon3dEmptyCaseNoResults,
} from "@hae-fe/icon-library/react/3d";

import { Empty } from "@/shared/ui/empty";

type Props = {
  hasSearched: boolean;
};

export const PartnershipNoRowsOverlay = ({ hasSearched }: Props) => {
  return (
    <div className="noRowsOverlay pointer-events-auto">
      <Empty
        title={hasSearched ? "검색 결과가 없습니다." : ""}
        text={
          hasSearched
            ? "검색어에 오타가 없는지 확인하거나, \n 다른 검색어를 입력해 보세요."
            : "등록된 요청이 없습니다."
        }
        icon={
          hasSearched ? (
            <Icon3dEmptyCaseNoResults style={{ width: "100px" }} />
          ) : (
            <Icon3dEmptyCaseNoData style={{ width: "100px" }} />
          )
        }
      />
    </div>
  );
};
