import { useState } from "react";

import TiptapEditor from "./TiptapEditor";

export default function EditorPage() {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <section className="flex flex-1 flex-col gap-6 bg-[#f7f7f8] px-6 py-8">
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <TiptapEditor
          value={content}
          onChange={setContent}
          onUploadStateChange={setIsUploading}
        />

        <div className="mt-6">
          <h2 className="mb-3 text-lg text-gray-900">
            HTML {isUploading ? "(이미지 업로드 중)" : ""}
          </h2>
          <pre className="overflow-x-auto rounded-md bg-gray-50 p-4 text-xs text-gray-700">
            {content || "(내용 없음)"}
          </pre>
        </div>
      </div>
    </section>
  );
}
