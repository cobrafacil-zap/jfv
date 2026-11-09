import { NextResponse } from "next/server";
import {
  PAINEL_COOKIE,
  painelCookieOptions,
} from "@/lib/painel/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PAINEL_COOKIE, "", {
    ...painelCookieOptions(),
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
