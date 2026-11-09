import { redirect } from "next/navigation";
import { hasPainelSession, isPainelConfigured } from "@/lib/painel/auth";
import { LoginForm } from "@/components/painel/LoginForm";

export const dynamic = "force-dynamic";

export default function PainelLoginPage() {
  if (hasPainelSession()) redirect("/painel");

  const configured = isPainelConfigured();

  return (
    <div className="pnl-login">
      <div className="pnl-login-card">
        <div className="pnl-login-brand">
          <span className="pnl-login-logo">JFV</span>
          <div className="pnl-login-brand-text">
            <strong>Painel de métricas</strong>
            <span>Priscila Sinópolis · jfv.smdigtal.com</span>
          </div>
        </div>

        <h1>Acesso restrito</h1>
        <p className="pnl-login-sub">
          Entre com a senha administrativa para acompanhar visitas, cliques e
          conversões da landing.
        </p>

        <LoginForm configured={configured} />

        <div className="pnl-login-foot">
          <span>Área exclusiva da administração</span>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Ver site
          </a>
        </div>
      </div>
    </div>
  );
}
