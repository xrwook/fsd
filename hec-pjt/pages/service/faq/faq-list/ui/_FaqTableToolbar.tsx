import {
  Button,
  Dropdown,
  Popover,
  PopoverContent,
  PopoverFooter,
  TextArea,
} from "@hae-fe/elements";
import { IconDownload } from "@hae-fe/icon-library/react";
import { Form, FormField, FormFieldRow } from "@hae-fe/pattern";
import { type ChangeEvent, type MouseEvent, useState } from "react";

import { DataTableToolbarKr } from "@/shared/ui/layout";

import { PER_PAGE_OPTIONS } from "../model";

type Props = {
  count: number;
  perPage: number;
  showDownload?: boolean;
  onPerPageChange: (size: number) => void;
};

type PerPageOption = {
  label: string;
  value: string;
};

export const FaqTableToolbar = ({
  count,
  perPage,
  showDownload = false,
  onPerPageChange,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [revisionReason, setRevisionReason] = useState("");
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <DataTableToolbarKr
      count={count}
      actions={
        <>
          {showDownload && (
            <>
              <Button
                styleOption="outline"
                semantic="neutral"
                size="small"
                iconLeft={<IconDownload size={16} type="outline" />}
                onClick={handleClick}
              >
                엑셀 다운로드
              </Button>
              <Popover
                className="w-90"
                hdsProps
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 38,
                  horizontal: -83,
                }}
              >
                <PopoverContent noTitle={true} className="w-68">
                  <Form>
                    <FormFieldRow cols={1}>
                      <FormField
                        label="다운로드 사유"
                        required
                        style={{ alignItems: "start" }}
                        controller={
                          <TextArea
                            hdsProps
                            value={revisionReason}
                            required
                            placeholder="다운로드 사유를 입력하세요."
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                              setRevisionReason(e.target.value)
                            }
                            style={{ resize: "none" }}
                          />
                        }
                      />
                    </FormFieldRow>
                  </Form>
                </PopoverContent>
                <PopoverFooter
                  negativeButton={{
                    children: "취소",
                    onClick: handleClose,
                  }}
                  positiveButton={{
                    children: "다운로드",
                    onClick: handleClose,
                  }}
                />
              </Popover>
            </>
          )}
          <Dropdown
            hdsProps={{ size: "small", clearable: false }}
            options={PER_PAGE_OPTIONS}
            value={PER_PAGE_OPTIONS.find((x) => Number(x.value) === perPage)}
            onChange={(option: PerPageOption | PerPageOption[] | null) => {
              if (option && !Array.isArray(option)) {
                onPerPageChange(Number(option.value));
              }
            }}
            style={{ width: 137 }}
          />
        </>
      }
    />
  );
};
