"use client";
import React, { createContext, useContext } from "react";

// nog te beslissen wat de context precies moet bevatten
interface SidebarContextType {}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{}}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
