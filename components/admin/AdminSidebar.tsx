"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PlayCircle,
  Gift,
  Settings,
  LogOut,
  LayoutTemplate,
  Palette,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AdminSidebarProps {
  fullName: string;
  email: string;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/alunos", label: "Alunos", icon: Users },
  { href: "/admin/modulos", label: "Módulos", icon: BookOpen },
  { href: "/admin/aulas", label: "Aulas", icon: PlayCircle },
  { href: "/admin/bonus", label: "Bônus", icon: Gift },
  { href: "/admin/conteudo", label: "Conteúdo do site", icon: LayoutTemplate },
  { href: "/admin/aparencia", label: "Aparência", icon: Palette },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ fullName, email }: AdminSidebarProps) {
  const pathname = usePathname();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-card/50 lg:flex">
      <div className="border-b border-border p-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient shadow-accent-glow-sm">
            <span className="font-display text-lg font-bold text-white">P</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-text-primary">
              Painel Admin
            </p>
            <p className="text-xs text-text-muted">Priscila Sinópolis</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-3 flex items-center justify-end gap-2 px-1">
          <span className="text-xs text-text-muted">Tema</span>
          <ThemeToggle />
        </div>
        <div className="mb-3 flex items-center gap-3 rounded-lg p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {fullName}
            </p>
            <p className="truncate text-xs text-text-muted">{email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-red-400"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}