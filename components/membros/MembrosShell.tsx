"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, Search, X } from "lucide-react";
import { MembrosSidebar } from "./Sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface MembrosShellProps {
  children: React.ReactNode;
  student: { full_name: string; email: string };
}

export function MembrosShell({ children, student }: MembrosShellProps) {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <MembrosSidebar student={student} />

      {/* Mobile sidebar */}
      {openMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenMobile(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-bg-secondary">
            <button
              onClick={() => setOpenMobile(false)}
              className="absolute right-2 top-2 text-text-secondary"
            >
              <X size={20} />
            </button>
            <MembrosSidebar student={student} />
          </div>
        </div>
      )}

      <div className="flex-1">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg-primary/80 px-4 backdrop-blur md:hidden">
          <button
            onClick={() => setOpenMobile(true)}
            className="text-text-primary"
          >
            <Menu size={24} />
          </button>
          <Link
            href="/membros"
            className="font-display text-sm font-bold text-text-primary"
          >
            Priscila Sinópolis
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button className="text-text-secondary">
              <Bell size={20} />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}