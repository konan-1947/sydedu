"use client";

import { useState } from "react";
import PageShell from "../components/PageShell";
import FileUpload from "../components/FileUpload";
import { Download, Wand2, FileText } from "lucide-react";

const layouts = [
  "Chào mừng",
  "Kiểm tra bài cũ",
  "Kiến thức mới",
  "Củng cố",
  "Dặn dò",
];

export default function SlideBuilderPage() {
  const [selectedLayouts, setSelectedLayouts] = useState<string[]>(layouts);
  const [pasteText, setPasteText] = useState("");

  const toggleLayout = (l: string) =>
    setSelectedLayouts((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  return (
    <PageShell>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Smart Slide Builder
            </h1>
            <p className="text-gray-500 mb-8">
              Tải lên giáo án và tự động tạo slide bài giảng
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Input */}
              <div className="space-y-6">
                <FileUpload
                  accept=".pdf,.doc,.docx,.txt"
                  label="Kéo thả file PDF / Word vào đây"
                  description="Hỗ trợ PDF, DOC, DOCX, TXT"
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Hoặc dán nội dung giáo án
                  </label>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Dán nội dung bài giảng tại đây..."
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Cấu trúc slide
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {layouts.map((l) => (
                      <button
                        key={l}
                        onClick={() => toggleLayout(l)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          selectedLayouts.includes(l)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    <Wand2 size={18} />
                    Tạo Slide
                  </button>
                  <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    <Download size={18} />
                    Tải .pptx
                  </button>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  Xem trước Slide
                </h3>
                <div className="space-y-3">
                  {selectedLayouts.map((l, i) => (
                    <div
                      key={l}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4"
                    >
                      <p className="text-xs text-blue-500 font-medium mb-1">
                        Slide {i + 1}
                      </p>
                      <p className="font-semibold text-gray-800">{l}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Nội dung sẽ được AI tự động tạo
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
    </PageShell>
  );
}
