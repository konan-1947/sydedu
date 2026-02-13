"use client";

import { Globe, CreditCard } from "lucide-react";

export default function TopBar() {
  return (
    <>
      

      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
        <div />
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
            <Globe size={16} />
            Vi
          </button>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <CreditCard size={14} />
            123,000
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
            M
          </div>
        </div>
      </header>
    </>
  );
}
