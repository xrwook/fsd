import { IconButton } from "@hae-fe/elements";
import { IconTrash } from "@hae-fe/icon-library/react";
import { type ICellRendererParams } from "ag-grid-community";

import type { CategoryRow } from "./columnDefs";

export const DeleteButtonRenderer = (
  props: ICellRendererParams<CategoryRow>,
) => {
  const { data, api } = props;
  if (!data) return null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    api.applyTransaction({ remove: [data] });
  };

  return (
    <IconButton
      semantic="ghost"
      size="medium"
      styleOption="fill"
      aria-label={"삭제"}
      onClick={handleDelete}
      disabled={data.readOnly}
    >
      <IconTrash size={20} type="outline" color="#6B7280" />
    </IconButton>
  );
};
