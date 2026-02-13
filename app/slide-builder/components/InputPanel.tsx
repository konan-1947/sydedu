"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import FileUpload from "../../components/FileUpload";
import { useSlideStore } from "../hooks/useSlideStore";

export default function InputPanel() {
  const { dispatch } = useSlideStore();
  const [topic, setTopic] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !pasteText.trim()) return;
    setLoading(true);
    setError(null);
    dispatch({ type: "SET_PHASE", phase: "generating" });

    try {
      const res = await fetch("/api/slide-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), content: pasteText.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi tạo slide");
      }
      const presentation = await res.json();
      dispatch({ type: "SET_PRESENTATION", presentation });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi không xác định";
      setError(msg);
      dispatch({ type: "SET_PHASE", phase: "input" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Chủ đề bài giảng</label>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="VD: Định luật Newton, Phương trình bậc hai..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <FileUpload accept=".pdf,.doc,.docx,.txt" label="Kéo thả file giáo án vào đây" description="Hỗ trợ PDF, DOC, DOCX, TXT" />

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Hoặc dán nội dung giáo án</label>
        <textarea
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder="Dán nội dung bài giảng tại đây..."
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading || (!topic.trim() && !pasteText.trim())}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang triệu hồi kiến thức...
          </>
        ) : (
          <>
            <Wand2 size={18} />
            Tạo Slide bằng AI
          </>
        )}
      </button>
    </div>
  );
}
