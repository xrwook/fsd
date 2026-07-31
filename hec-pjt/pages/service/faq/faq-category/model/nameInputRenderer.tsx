import { TextField } from "@hae-fe/elements";
import { type ICellRendererParams } from "ag-grid-community";

import type { CategoryRow } from "./columnDefs";

export const NameInputRenderer = (props: ICellRendererParams<CategoryRow>) => {
  const { data, node } = props;
  if (!data) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    node.setDataValue("category", e.target.value);
  };

  return (
    <TextField
      hdsProps={{ helpText: "", clearable: true }}
      value={data.category}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      disabled={data.readOnly}
      placeholder="카테고리명을 입력하세요"
    />
  );
};
