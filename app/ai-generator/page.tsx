"use client";

import { useState } from "react";
import PageShell from "../components/PageShell";
import TabSelector from "../components/TabSelector";
import { Download, Wand2, FileText, ClipboardList } from "lucide-react";

const tabs = [
  { key: "lesson", label: "Soạn Giáo án" },
  { key: "exam", label: "Tạo Đề thi" },
];

export default function AIGeneratorPage() {
  const [activeTab, setActiveTab] = useState("lesson");

  return (
    <PageShell>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              AI Generator
            </h1>
            <p className="text-gray-500 mb-6">
              Soạn giáo án và tạo đề thi tự động bằng AI
            </p>

            <TabSelector tabs={tabs} active={activeTab} onChange={setActiveTab} />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Form */}
              <div className="space-y-5">
                {activeTab === "lesson" ? (
                  <>
                    <Field label="Tên bài học" placeholder="VD: Định luật Newton" />
                    <Field label="Môn học" placeholder="VD: Vật lý" />
                    <Field label="Lớp" placeholder="VD: 10" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Thời lượng (phút)" placeholder="45" />
                      <SelectField
                        label="Phương pháp"
                        options={["Thuyết trình", "Thảo luận nhóm", "Thí nghiệm", "Kết hợp"]}
                      />
                    </div>
                    <Field label="Mục tiêu bài học" placeholder="Học sinh nắm được..." textarea />
                  </>
                ) : (
                  <>
                    <Field label="Chủ đề / Chương" placeholder="VD: Động lực học" />
                    <Field label="Môn học" placeholder="VD: Vật lý" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Số câu hỏi" placeholder="30" />
                      <SelectField
                        label="Mức độ"
                        options={["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"]}
                      />
                    </div>
                    <SelectField
                      label="Hình thức"
                      options={["Trắc nghiệm", "Tự luận", "Kết hợp"]}
                    />
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                    <Wand2 size={18} />
                    {activeTab === "lesson" ? "Tạo Giáo án" : "Tạo Đề thi"}
                  </button>
                  <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    <Download size={18} />
                    Tải xuống
                  </button>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {activeTab === "lesson" ? <FileText size={18} /> : <ClipboardList size={18} />}
                  {activeTab === "lesson" ? "Xem trước Giáo án" : "Xem trước Đề thi"}
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
                  <p className="text-gray-400 text-sm text-center">
                    Điền thông tin và nhấn &ldquo;{activeTab === "lesson" ? "Tạo Giáo án" : "Tạo Đề thi"}&rdquo;
                    <br />
                    để xem kết quả tại đây
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
    </PageShell>
  );
}

function Field({
  label,
  placeholder,
  textarea,
}: {
  label: string;
  placeholder: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea placeholder={placeholder} rows={3} className={cls + " resize-none"} />
      ) : (
        <input type="text" placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
