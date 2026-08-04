import { TextField, Typography } from "@hae-fe/elements";
import type { ICellRendererParams } from "ag-grid-community";
import type { ChangeEvent } from "react";

import type { TermTypeRow } from "./termsList";

type FieldName = "termCode" | "termName";

type Props = ICellRendererParams<TermTypeRow> & {
  fieldName: FieldName;
  placeholder: string;
};

const getErrorField = (fieldName: FieldName) =>
  fieldName === "termCode" ? "termCodeError" : "termNameError";

export const TermTypeInputRenderer = (props: Props) => {
  const { data, node, fieldName, placeholder } = props;
  if (!data) return null;

  const errorField = getErrorField(fieldName);
  const errorMessage = data[errorField];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    node.setData({
      ...data,
      [fieldName]: e.target.value,
      [errorField]: undefined,
    });
    props.context?.onTermTypeChange?.();
  };

  return (
    <div className="flex h-full flex-col justify-center gap-1 py-1">
      <TextField
        hdsProps={{ helpText: "", clearable: true }}
        value={data[fieldName]}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        disabled={fieldName === "termCode" && data.readOnlyCode}
        error={!!errorMessage}
        placeholder={placeholder}
      />
      {errorMessage && (
        <Typography
          className="text-(--color-text-attention-strong)"
          hdsProps={{ weight: "regular", type: "body", size: "13" }}
        >
          {errorMessage}
        </Typography>
      )}
    </div>
  );
};
