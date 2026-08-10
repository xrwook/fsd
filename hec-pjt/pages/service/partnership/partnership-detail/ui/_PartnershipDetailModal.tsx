import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  TextArea,
  TextField,
} from "@hae-fe/elements";
import { Form, FormField, FormFieldRow } from "@hae-fe/pattern";
import { type ChangeEvent, useEffect, useState } from "react";

import {
  useConfirmPartnershipMutation,
  useGetPartnershipDetailQuery,
} from "../api";

type Props = {
  modalOpen: boolean;
  onConfirmSuccess: () => void;
  onModalOpen: (value: boolean) => void;
  partnershipId?: number;
};

export const PartnershipDetailModal = ({
  modalOpen,
  onConfirmSuccess,
  onModalOpen,
  partnershipId,
}: Props) => {
  const [checked, setChecked] = useState(false);
  const { data: detailResponse } = useGetPartnershipDetailQuery(
    {
      path: {
        partnershipId: partnershipId ?? 0,
      },
    },
    modalOpen && !!partnershipId,
  );
  const { mutate: confirmPartnership, isPending } =
    useConfirmPartnershipMutation();
  const detail = detailResponse?.data;

  useEffect(() => {
    if (!modalOpen) {
      setChecked(false);
    }
  }, [modalOpen]);

  const handleCancel = () => {
    onModalOpen(false);
  };

  const handleConfirm = () => {
    if (!partnershipId || !checked) return;

    confirmPartnership(
      {
        path: {
          partnershipId,
        },
        requestBody: {
          isConfirmed: true,
          agreed: checked,
        },
      },
      {
        onSuccess: () => {
          onModalOpen(false);
          onConfirmSuccess();
        },
      },
    );
  };

  return (
    <Dialog
      hdsProps={{ hasFooter: true, hasHeader: true, maxWidth: "lg" }}
      open={modalOpen}
      onClose={handleCancel}
    >
      <DialogHeader
        hdsProps={{ showCloseIcon: true, onClose: handleCancel }}
        className="min-w-200"
      >
        사업 제휴 요청 상세
      </DialogHeader>
      <DialogContent>
        <Form>
          <FormFieldRow cols={1}>
            <FormField
              label="회사명"
              layout="vertical"
              colon={false}
              controlId=""
              controller={
                <TextField
                  readOnly
                  hdsProps={{ helpText: "", clearable: false }}
                  placeholder=""
                  value={detail?.companyName ?? ""}
                  id=""
                />
              }
            />
            <FormField
              label="이름"
              layout="vertical"
              colon={false}
              controlId=""
              controller={
                <TextField
                  readOnly
                  hdsProps={{ helpText: "", clearable: false }}
                  placeholder=""
                  value={detail?.adminName ?? ""}
                  id=""
                />
              }
            />
            <FormField
              label="전화번호"
              layout="vertical"
              colon={false}
              controlId=""
              controller={
                <TextField
                  readOnly
                  hdsProps={{ helpText: "", clearable: false }}
                  placeholder=""
                  value={detail?.hpNum ?? ""}
                  id=""
                />
              }
            />
            <FormField
              label="이메일"
              layout="vertical"
              colon={false}
              controlId=""
              controller={
                <TextField
                  readOnly
                  hdsProps={{ helpText: "", clearable: false }}
                  placeholder=""
                  value={detail?.email ?? ""}
                  id=""
                />
              }
            />
            <FormField
              label="제휴 요청 내용"
              layout="vertical"
              colon={false}
              controlId=""
              controller={
                <TextArea
                  readOnly
                  hdsProps={{
                    rows: 7,
                    overflow: false,
                    maxRows: 7,
                    fixedHeight: true,
                  }}
                  placeholder="답변을 입력해 주세요."
                  value={detail?.requestContent ?? ""}
                  style={{ resize: "none" }}
                />
              }
            />
          </FormFieldRow>
        </Form>
        <div className="mt-5 flex h-8 items-center">
          <Checkbox
            size="medium"
            label="제휴 요청 내용을 확인했으며, 담당자로서 검토 완료하였습니다."
            checked={checked}
            disabled={!detail?.canConfirm}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setChecked(event.target.checked)
            }
          />
        </div>
      </DialogContent>
      <DialogFooter
        hdsProps={{
          negativeButton: { children: "취소", onClick: handleCancel },
          positiveButton: {
            children: "완료",
            onClick: handleConfirm,
            disabled: !detail?.canConfirm || !checked || isPending,
          },
        }}
      />
    </Dialog>
  );
};
