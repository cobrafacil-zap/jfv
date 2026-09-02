"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  GraduationCap,
  Gift,
  User,
  LogOut,
  Video,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/membros", label: "Início", icon: Home },
  { href: "/membros/bonus", label: "Bônus", icon: Gift },
  { href: "/membros/perfil", label: "Perfil", icon: User },
];

interface MembrosSidebarProps {
  student: {
    full_name: string;
    email: string;
  };
}

export function MembrosSidebar({ student }: MembrosSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = student.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-secondary md:sticky md:top-0 md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient shadow-accent-glow-sm">
          <Video size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-text-primary">
            Priscila Sinópolis
          </p>
          <p className="text-[10px] uppercase tracking-wider text-accent">
            Área de membros
          </p>
        </div>
      </div>

      {/* User */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white">
            {initials || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {student.full_name}
            </p>
            <p className="truncate text-xs text-text-muted">{student.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-border bg-gradient-to-br from-accent/10 to-transparent p-4">
          <Sparkles size={20} className="text-accent" />
          <p className="mt-2 text-sm font-semibold text-text-primary">
            Dica do dia
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            A luz natural é a sua melhor amiga. Filme sempre de frente para a
            janela!
          </p>
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-xs text-text-muted">Tema</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-card hover:text-red-400"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}