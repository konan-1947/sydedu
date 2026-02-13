"use client";

import { useState } from "react";
import katex from "katex";
import { X } from "lucide-react";

interface Props {
  initialLatex: string;
  onSave: (latex: string) => void;
  onClose: () => void;
}

export default function FormulaEditor({ initialLatex, onSave, onClose }: Props) {
  const [latex, setLatex] = useState(initialLatex);

  let preview = "";
  try {
    preview = katex.renderToString(latex, { throwOnError: false, displayMode: true });
  } catch {
    preview = "<span style='color:red'>Lỗi cú pháp LaTeX</span>";
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[640px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Chỉnh sửa công thức</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">
          <div className="p-6">
            <label className="text-sm font-medium text-gray-600 mb-2 block">LaTeX</label>
            <textarea
              value={latex}
              onChange={e => setLatex(e.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="VD: E = mc^2"
            />
          </div>
          <div className="p-6 bg-gray-50 flex items-center justify-center">
            <div className="text-2xl" dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Huỷ</button>
          <button onClick={() => onSave(latex)} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">Lưu</button>
        </div>
      </div>
    </div>
  );
}
