import { IconButton } from "@hae-fe/elements";
import { IconTrash } from "@hae-fe/icon-library/react";
import type { ICellRendererParams } from "ag-grid-community";
import type { MouseEvent } from "react";

import type { TermTypeRow } from "./termsList";

export const TermTypeDeleteButtonRenderer = (
  props: ICellRendererParams<TermTypeRow>,
) => {
  const { data } = props;
  if (!data) return null;

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.context?.onTermTypeDelete?.(data);
  };

  return (
    <IconButton
      semantic="ghost"
      size="medium"
      styleOption="fill"
      aria-label={`${data.termName || data.termCode} 삭제`}
      onClick={handleDelete}
    >
      <IconTrash size={20} type="outline" color="#6B7280" />
    </IconButton>
  );
};
