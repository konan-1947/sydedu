"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function ShellInner({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[260px]"}`}>
        <TopBar />
        {children}
      </div>
    </div>
  );
}

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
