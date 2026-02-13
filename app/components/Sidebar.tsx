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
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { icon: LayoutDashboard, text: "Trang chủ", href: "/" },
  { icon: Presentation, text: "Slide Composer", href: "/slide-builder" },
  { icon: Sparkles, text: "SimuGen AI", href: "/simu-gen" },
  { icon: GraduationCap, text: "Quản lý Lớp học", href: "/classes" },
  { icon: FolderOpen, text: "Kho lưu trữ", href: "/library" },
  { icon: CalendarDays, text: "Lịch báo giảng", href: "/schedule" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
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
