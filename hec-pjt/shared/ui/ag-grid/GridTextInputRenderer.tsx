import { TextField, Typography } from "@hae-fe/elements";
import type { ICellRendererParams } from "ag-grid-community";
import type { ChangeEvent, MouseEvent } from "react";

type DataFieldName<TData extends object> = Extract<keyof TData, string>;

type Props<TData extends object> = ICellRendererParams<TData> & {
  fieldName: DataFieldName<TData>;
  errorFieldName?: DataFieldName<TData>;
  placeholder?: string;
  disabled?: boolean | ((data: TData) => boolean);
  onChangeContextName?: string;
};

const getDisabled = <TData extends object>(
  disabled: Props<TData>["disabled"],
  data: TData,
) => {
  if (typeof disabled === "function") {
    return disabled(data);
  }

  return !!disabled;
};

const callContextChangeHandler = <TData extends object>({
  context,
  onChangeContextName,
  nextData,
}: {
  context: Props<TData>["context"];
  onChangeContextName?: string;
  nextData: TData;
}) => {
  if (!onChangeContextName) return;

  const handler = context?.[onChangeContextName];
  if (typeof handler === "function") {
    handler(nextData);
  }
};

export const GridTextInputRenderer = <TData extends object>({
  data,
  node,
  fieldName,
  errorFieldName,
  placeholder,
  disabled,
  context,
  onChangeContextName,
}: Props<TData>) => {
  if (!data) return null;

  const errorMessage = errorFieldName ? data[errorFieldName] : undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextData = {
      ...data,
      [fieldName]: e.target.value,
      ...(errorFieldName ? { [errorFieldName]: undefined } : {}),
    } as TData;

    node.setData(nextData);
    callContextChangeHandler({ context, onChangeContextName, nextData });
  };

  return (
    <div className="flex h-full flex-col justify-center gap-1 py-1">
      <TextField
        hdsProps={{ helpText: "", clearable: true }}
        value={String(data[fieldName] ?? "")}
        onChange={handleChange}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        disabled={getDisabled(disabled, data)}
        error={!!errorMessage}
        placeholder={placeholder}
      />
      {!!errorMessage && (
        <Typography
          className="text-(--color-text-attention-strong)"
          hdsProps={{ weight: "regular", type: "body", size: "13" }}
        >
          {String(errorMessage)}
        </Typography>
      )}
    </div>
  );
};
