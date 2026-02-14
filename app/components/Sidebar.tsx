"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FolderOpen,
  CalendarDays,
  GraduationCap,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  Bot,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSidebar } from "./SidebarContext";
import { useModel, MODEL_INFO, type AIModel } from "./ModelContext";

const navItems = [
  { icon: LayoutDashboard, text: "Trang chủ", href: "/" },
  { icon: Presentation, text: "Slide Composer", href: "/slide-builder" },
  { icon: Sparkles, text: "SimuGen AI", href: "/simu-gen" },
  { icon: GraduationCap, text: "Quản lý Lớp học", href: "/classes" },
  { icon: FolderOpen, text: "Kho lưu trữ", href: "/library" },
  { icon: CalendarDays, text: "Lịch báo giảng", href: "/schedule" },
];

const MODEL_KEYS: AIModel[] = ["gpt-4o", "claude", "deepseek"];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { model, setModel } = useModel();
  const asideRef = useRef<HTMLElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Click outside → auto collapse
  useEffect(() => {
    if (collapsed) return;
    const handler = (e: MouseEvent) => {
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) {
        toggle();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [collapsed, toggle]);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  return (
    <aside
      ref={asideRef}
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 flex flex-col z-20 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between h-16 border-b border-gray-100 px-3">
        <Link href="/" className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && <span className="text-xl font-bold text-blue-700">Sydedu</span>}
        </Link>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Thu gọn"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={toggle}
          className="mx-auto mt-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Mở rộng"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (collapsed) toggle(); }}
                title={collapsed ? item.text : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.text}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Model Picker */}
      <div className="px-3 pb-2 relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          title={collapsed ? `AI: ${MODEL_INFO[model].label}` : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 text-gray-600 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Bot size={18} className="shrink-0" style={{ color: MODEL_INFO[model].color }} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{MODEL_INFO[model].label}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        {pickerOpen && (
          <div className={`${collapsed ? "fixed left-[80px] bottom-16" : "absolute bottom-full mb-1 left-3 right-3"} min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-lg p-1.5 z-30`}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase px-2.5 py-1.5">Chọn mô hình AI</p>
            {MODEL_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => { setModel(key); setPickerOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  model === key ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MODEL_INFO[key].color }} />
                {MODEL_INFO[key].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User profile */}
      <div className="p-3 border-t border-gray-100">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all">
              M
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Minh Nguyen</p>
              <p className="text-xs text-gray-400 truncate">minh@sydedu.vn</p>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
              <CreditCard size={11} />
              123k
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
