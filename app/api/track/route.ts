import { NextResponse } from "next/server";
import { z } from "zod";
import { insertEvents } from "@/lib/analytics/store";
import { localDay } from "@/lib/analytics/time";
import type { StoredEvent } from "@/lib/analytics/types";
import { checkCounter, clientIp } from "@/lib/painel/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eventSchema = z.object({
  type: z.enum(["pageview", "click_programa", "click_whatsapp", "form_submit"]),
  visitor_id: z
    .string()
    .min(6)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/),
  session_id: z
    .string()
    .max(64)
    .regex(/^[A-Za-z0-9_-]*$/)
    .optional(),
  page: z.string().max(200).optional(),
  program_id: z.string().max(80).optional(),
  program_name: z.string().max(120).optional(),
  form_id: z.string().max(80).optional(),
  placement: z.string().max(40).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  referrer: z.string().max(300).optional(),
  device: z.enum(["mobile", "desktop"]).optional(),
  ts: z.string().max(40).optional(),
});

const bodySchema = z.object({
  events: z.array(eventSchema).min(1).max(25),
});

function clean(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
  return sanitized || undefined;
}

function cleanPage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const path = value.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) return undefined;
  return path.slice(0, 200);
}

function cleanReferrer(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return `${url.origin}${url.pathname}`.slice(0, 300);
  } catch {
    return undefined;
  }
}

function clampTimestamp(value: string | undefined): Date {
  const now = Date.now();
  if (!value) return new Date(now);

  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed)) return new Date(now);

  // Evita eventos com datas absurdas (manipulação do cliente).
  const min = now - 10 * 60 * 1000;
  const max = now + 2 * 60 * 1000;
  return new Date(Math.min(max, Math.max(min, parsed)));
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const host = new URL(origin).host;
    const requestHost = request.headers.get("host");
    if (host === requestHost) return true;
    if (host === "jfv.smdigtal.com" || host === "www.jfv.smdigtal.com") return true;
    if (host === "localhost:3000" || host === "127.0.0.1:3000") return true;
    if (host.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }

  const ip = clientIp(request);
  const limit = checkCounter(`track:${ip}`, 120, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitos eventos." },
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
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Evento inválido." },
      { status: 400 }
    );
  }

  const events: StoredEvent[] = [];

  for (const event of parsed.data.events) {
    // O modo demonstração usa IDs reservados e nunca vem do site público.
    if (event.visitor_id.startsWith("demo-")) continue;

    const timestamp = clampTimestamp(event.ts);
    const ts = timestamp.toISOString();

    events.push({
      type: event.type,
      visitorId: event.visitor_id,
      sessionId: clean(event.session_id, 64),
      page: cleanPage(event.page),
      programId: clean(event.program_id, 80),
      programName: clean(event.program_name, 120),
      formId: clean(event.form_id, 80),
      utmSource: clean(event.utm_source, 120),
      utmMedium: clean(event.utm_medium, 120),
      utmCampaign: clean(event.utm_campaign, 120),
      referrer: cleanReferrer(event.referrer),
      device: event.device,
      ts,
      day: localDay(ts),
    });
  }

  if (events.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await insertEvents(events);
  } catch (error) {
    console.error("[analytics] Falha ao gravar eventos:", error);
    return NextResponse.json(
      { error: "Não foi possível registrar os eventos." },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
