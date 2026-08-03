import { TextField, Typography } from "@hae-fe/elements";
import { type ICellRendererParams } from "ag-grid-community";

import type { CategoryRow } from "./columnDefs";

export const NameInputRenderer = (props: ICellRendererParams<CategoryRow>) => {
  const { data, node } = props;
  if (!data) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    node.setData({
      ...data,
      category: e.target.value,
      categoryError: undefined,
    });
    props.context?.onCategoryChange?.();
  };

  return (
    <div className="flex h-full flex-col justify-center gap-1 py-1">
      <TextField
        hdsProps={{ helpText: "", clearable: true }}
        value={data.category}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        disabled={data.readOnly}
        error={!!data.categoryError}
        placeholder="카테고리명을 입력하세요"
      />
      {data.categoryError && (
        <Typography
          className="text-(--color-text-attention-strong)"
          hdsProps={{ weight: "regular", type: "body", size: "13" }}
        >
          {data.categoryError}
        </Typography>
      )}
    </div>
  );
};
