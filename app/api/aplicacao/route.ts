import { NextResponse } from "next/server";
import {
  supabaseAdmin,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";

/**
 * Recebe as aplicações da mentoria Do Zero aos 10k.
 *
 * Destinos, em ordem:
 * 1. Tabela `leads` no Supabase (quando configurada — ver
 *    supabase/schema-v6-leads.sql).
 * 2. `LEADS_WEBHOOK_URL` (Make, Zapier, n8n, CRM, Evolution API etc.).
 * 3. Log do servidor, como último recurso.
 *
 * A resposta informa se o lead foi persistido, para a tela final orientar
 * a pessoa a enviar o resumo pelo WhatsApp quando necessário.
 */

type Corpo = Record<string, unknown>;

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

async function salvarNoSupabase(lead: Corpo): Promise<boolean> {
  if (!supabaseUrl || !supabaseServiceRoleKey) return false;

  try {
    const { error } = await supabaseAdmin.from("leads").insert({
      nome: lead.nome,
      email: lead.email,
      whatsapp: lead.whatsapp,
      negocio: lead.negocio ?? null,
      momento: lead.momento ?? null,
      meta_faturamento: lead.meta_faturamento ?? null,
      desafio: lead.desafio ?? null,
      estrutura: Array.isArray(lead.estrutura) ? lead.estrutura : [],
      tempo_disponivel: lead.tempo_disponivel ?? null,
      faixa_investimento: lead.faixa_investimento ?? null,
      prazo: lead.prazo ?? null,
      origem: lead.origem ?? null,
      payload: lead,
    });

    if (error) {
      console.warn("[aplicacao] não foi possível salvar no Supabase:", error.message);
      return false;
    }
    return true;
  } catch (erro) {
    console.warn("[aplicacao] erro ao salvar no Supabase:", erro);
    return false;
  }
}

async function enviarParaWebhook(lead: Corpo): Promise<boolean> {
  const webhook = process.env.LEADS_WEBHOOK_URL;
  if (!webhook) return false;

  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 10000);

  try {
    const resposta = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      signal: controle.signal,
    });

    if (!resposta.ok) {
      throw new Error(`Webhook respondeu ${resposta.status}`);
    }
    return true;
  } catch (erro) {
    console.warn("[aplicacao] falha ao encaminhar lead para o webhook:", erro);
    return false;
  } finally {
    clearTimeout(limite);
  }
}

export async function POST(request: Request) {
  let corpo: Corpo | null = null;

  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (!corpo || typeof corpo !== "object") {
    return NextResponse.json(
      { ok: false, error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const nome = texto(corpo.nome);
  const email = texto(corpo.email);
  const whatsapp = texto(corpo.whatsapp).replace(/\D/g, "");

  if (nome.length < 2 || whatsapp.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Dados obrigatórios ausentes ou inválidos." },
      { status: 422 }
    );
  }

  const lead: Corpo = {
    ...corpo,
    nome,
    email,
    whatsapp,
    recebido_em: new Date().toISOString(),
    origem: "aplicacao-do-zero-aos-10k",
  };

  const salvoNoBanco = await salvarNoSupabase(lead);
  const enviadoParaWebhook = await enviarParaWebhook(lead);

  if (!salvoNoBanco && !enviadoParaWebhook) {
    console.info("[aplicacao] lead sem destino configurado", JSON.stringify(lead));
  }

  return NextResponse.json({
    ok: true,
    stored: salvoNoBanco || enviadoParaWebhook,
  });
}
