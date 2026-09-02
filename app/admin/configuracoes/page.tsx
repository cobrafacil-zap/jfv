import { getCurrentAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Mail, Shield, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunitySettingsForm } from "@/components/admin/CommunitySettingsForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const { data: settings } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "community_whatsapp_url")
    .maybeSingle();
  const whatsappUrl = settings?.value || "";

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-sm text-text-muted">Conta</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          Configurações
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
            Conta de administrador
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <User size={16} className="text-text-muted" />
              <div>
                <p className="text-text-muted">Nome</p>
                <p className="font-semibold text-text-primary">
                  {admin.full_name}
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-text-muted" />
              <div>
                <p className="text-text-muted">E-mail</p>
                <p className="font-semibold text-text-primary">{admin.email}</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Shield size={16} className="text-text-muted" />
              <div>
                <p className="text-text-muted">Nível de acesso</p>
                <p className="font-semibold capitalize text-text-primary">
                  {admin.role}
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Calendar size={16} className="text-text-muted" />
              <div>
                <p className="text-text-muted">Membro desde</p>
                <p className="font-semibold text-text-primary">
                  {format(new Date(admin.created_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
            Próximos passos
          </h2>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li>• Crie os módulos do curso</li>
            <li>• Adicione aulas com upload de vídeo</li>
            <li>• Cadastre bônus para download dos alunos</li>
            <li>• Acompanhe novos alunos no dashboard</li>
            <li>• Para adicionar outro admin, insira manualmente em admin_users</li>
          </ul>
        </div>

        <CommunitySettingsForm initialValue={whatsappUrl} />
      </div>
    </div>
  );
}
