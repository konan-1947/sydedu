"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SidebarContextType {
  collapsed: boolean;
  toggle: () => void;
}

// Module-level state survives PageShell remounts across navigations
let persistedCollapsed = true;

const SidebarContext = createContext<SidebarContextType>({ collapsed: true, toggle: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(persistedCollapsed);
  const toggle = useCallback(() => {
    setCollapsed((c) => {
      persistedCollapsed = !c;
      return !c;
    });
  }, []);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
