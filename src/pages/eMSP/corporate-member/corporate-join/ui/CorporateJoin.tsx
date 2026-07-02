import { useState } from "react";

import { TiptapImageEditor } from "@/shared/ui/editor";

const CorporateJoin = () => {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">기업 회원 가입</h1>
        <p className="mt-1 text-sm text-gray-500">
          기업 소개 내용을 작성해 주세요.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">기업 소개 에디터</h2>
          {isUploading && (
            <span className="text-xs text-blue-600">이미지 업로드 중</span>
          )}
        </div>

        <TiptapImageEditor
          value={content}
          placeholder="기업 소개 내용을 입력하세요."
          onChange={setContent}
          onUploadStateChange={setIsUploading}
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">HTML 결과</h2>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-gray-50 p-4 text-xs text-gray-700">
          {content || "(작성된 내용이 없습니다.)"}
        </pre>
      </section>
    </div>
  );
};

export default CorporateJoin;
