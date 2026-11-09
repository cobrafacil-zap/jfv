import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPainelSession,
  isPainelConfigured,
  PAINEL_COOKIE,
  painelCookieOptions,
  verifyPainelPassword,
} from "@/lib/painel/auth";
import {
  checkLoginRateLimit,
  clientIp,
  recordLoginFailure,
  resetLoginRateLimit,
} from "@/lib/painel/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  password: z.string().min(1).max(200),
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  if (!isPainelConfigured()) {
    console.error(
      "[painel] PAINEL_ADMIN_PASSWORD_HASH/PAINEL_ADMIN_PASSWORD ou PAINEL_SESSION_SECRET não configurados."
    );
    return NextResponse.json(
      { error: "O painel ainda não está configurado neste ambiente." },
      { status: 503 }
    );
  }

  const ip = clientIp(request);
  const limit = checkLoginRateLimit(ip);

  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "Muitas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.",
      },
      {
        status: 429,
        headers: limit.retryAfter
          ? { "Retry-After": String(limit.retryAfter) }
          : undefined,
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    recordLoginFailure(ip);
    await delay(350);
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  if (!verifyPainelPassword(parsed.data.password)) {
    recordLoginFailure(ip);
    await delay(450);
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  resetLoginRateLimit(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    PAINEL_COOKIE,
    createPainelSession(),
    painelCookieOptions()
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
