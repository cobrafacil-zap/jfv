"use client";

import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserClient | null = null;
let browserProxy: BrowserClient | null = null;

function resolveBrowserClient(): BrowserClient {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

/**
 * Cliente Supabase do browser criado de forma preguiçosa.
 *
 * Evita que o `next build` (prerender de páginas client) quebre quando as
 * variáveis de ambiente não estão disponíveis no momento do build.
 * A instância do Proxy é estável para não quebrar dependências de hooks.
 */
export function getSupabaseBrowserClient(): BrowserClient {
  if (!browserProxy) {
    browserProxy = new Proxy({} as BrowserClient, {
      get(_target, prop, receiver) {
        const client = resolveBrowserClient();
        const value = Reflect.get(client, prop, receiver);
        return typeof value === "function" ? value.bind(client) : value;
      },
    });
  }
  return browserProxy;
}
