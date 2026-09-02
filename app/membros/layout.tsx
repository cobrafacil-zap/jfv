import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth";
import { MembrosShell } from "@/components/membros/MembrosShell";

export default async function MembrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  return (
    <MembrosShell
      student={{
        full_name: student.full_name,
        email: student.email,
      }}
    >
      {children}
    </MembrosShell>
  );
}