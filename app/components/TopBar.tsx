"use client";

import { Globe } from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <Globe size={16} />
          Vi
        </button>
      </div>
    </header>
  );
}
