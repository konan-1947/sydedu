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
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, text: "Trang chủ", href: "/" },
  { icon: Sparkles, text: "SimuGen AI", href: "/simu-gen" },
  { icon: GraduationCap, text: "Quản lý Lớp học", href: "/classes" },
  { icon: FolderOpen, text: "Kho lưu trữ", href: "/library" },
  { icon: CalendarDays, text: "Lịch báo giảng", href: "/schedule" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-gray-100 flex flex-col z-20">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-6 h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="text-xl font-bold text-blue-700">Sydedu</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} />
                <span>{item.text}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom buttons */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Users size={16} />
          Mời bạn bè
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <ArrowUpCircle size={16} />
          Nâng cấp
        </button>
      </div>
    </aside>
  );
}
