"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

interface FileUploadProps {
  accept?: string;
  label?: string;
  description?: string;
  onFile?: (file: File) => void;
}

export default function FileUpload({
  accept = "*",
  label = "Kéo thả file vào đây",
  description = "hoặc nhấn để chọn file",
  onFile,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFile?.(file);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-colors ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"
      }`}
    >
      <Upload size={36} className="text-gray-400 mb-3" />
      <p className="font-medium text-gray-700">{fileName || label}</p>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
    </label>
  );
}
