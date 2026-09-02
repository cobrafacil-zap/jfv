"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AdminShellProps {
  fullName: string;
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ fullName, email, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-base">
      <AdminSidebar fullName={fullName} email={email} />

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col lg:hidden">
        <div className="flex items-center justify-between border-b border-border bg-bg-card/50 p-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
              <span className="font-display text-sm font-bold text-white">
                P
              </span>
            </div>
            <span className="font-display text-sm font-bold text-text-primary">
              Painel Admin
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-text-secondary hover:bg-bg-elevated"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-bg-base shadow-2xl">
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-bg-elevated"
                >
                  <X size={20} />
                </button>
              </div>
              <AdminSidebar fullName={fullName} email={email} />
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>

      {/* Desktop main */}
      <main className="hidden flex-1 lg:block">{children}</main>
    </div>
  );
}