import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login?redirect=/admin");
  }

  return (
    <AdminShell fullName={admin.full_name} email={admin.email}>
      {children}
    </AdminShell>
  );
}