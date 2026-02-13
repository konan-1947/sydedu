"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowUpCircle,
  FolderOpen,
  CalendarDays,
  GraduationCap,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { icon: LayoutDashboard, text: "Trang chủ", href: "/" },
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

      {/* Bottom buttons */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        {collapsed ? (
          <>
            <button className="w-full flex items-center justify-center py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors" title="Mời bạn bè">
              <Users size={16} />
            </button>
            <button className="w-full flex items-center justify-center py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors" title="Nâng cấp">
              <ArrowUpCircle size={16} />
            </button>
          </>
        ) : (
          <>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Users size={16} />
              Mời bạn bè
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <ArrowUpCircle size={16} />
              Nâng cấp
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
