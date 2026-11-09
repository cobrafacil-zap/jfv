import { redirect } from "next/navigation";
import { hasPainelSession } from "@/lib/painel/auth";

export const dynamic = "force-dynamic";

export default function PainelAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasPainelSession()) {
    redirect("/painel/login?next=/painel");
  }

  return <>{children}</>;
}
