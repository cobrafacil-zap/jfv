"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { AnalyticsEventType } from "@/lib/analytics/types";

declare global {
  interface Window {
    jfvTrack?: (type: string, data?: Record<string, unknown>) => void;
  }
}

type TrackData = {
  program_id?: string;
  program_name?: string;
  form_id?: string;
  placement?: string;
  depth?: number;
};

type QueuedEvent = {
  type: AnalyticsEventType;
  visitor_id: string;
  session_id: string;
  page: string;
  device: "mobile" | "desktop";
  ts: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
} & TrackData;

const VISITOR_KEY = "jfv_vid";
const VISITOR_AT_KEY = "jfv_vid_at";
const SESSION_KEY = "jfv_sid";
const ATTR_COOKIE = "jfv_attr";
const ATTR_DAYS = 30;

const EXCLUDED_PATHS = ["/painel", "/admin", "/membros", "/checkout", "/api"];
const FLUSH_INTERVAL = 5000;
const MAX_QUEUE = 80;

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // segue para o fallback
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId(): string {
  try {
    const current = localStorage.getItem(VISITOR_KEY);
    const createdAt = Number(localStorage.getItem(VISITOR_AT_KEY) || 0);
    const day = 24 * 60 * 60 * 1000;

    if (current && Date.now() - createdAt < day) return current;

    const next = randomId();
    localStorage.setItem(VISITOR_KEY, next);
    localStorage.setItem(VISITOR_AT_KEY, String(Date.now()));
    return next;
  } catch {
    return randomId();
  }
}

function getSessionId(): string {
  try {
    const current = sessionStorage.getItem(SESSION_KEY);
    if (current) return current;

    const next = randomId();
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return randomId();
  }
}

type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
};

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${name}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, days: number) {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; Path=/; Max-Age=${days * 86400}; SameSite=Lax${secure}`;
  } catch {
    // cookie indisponível: segue sem persistir a atribuição
  }
}

/**
 * Atribuição first-touch: guarda por 30 dias a primeira origem
 * relevante (UTM ou referrer externo). Assim quem vê no Instagram,
 * sai e volta digitando o site não vira "Direto".
 */
function getAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
  };
  const hasUrlUtm = Boolean(
    fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign
  );

  let stored: (Attribution & { at?: number }) | null = null;
  const raw = readCookie(ATTR_COOKIE);
  if (raw) {
    try {
      stored = JSON.parse(raw);
    } catch {
      stored = null;
    }
  }

  const hasStoredUtm = Boolean(
    stored?.utm_source || stored?.utm_medium || stored?.utm_campaign
  );
  const currentReferrer = externalReferrer();

  if (hasUrlUtm && !hasStoredUtm) {
    stored = {
      ...fromUrl,
      referrer: currentReferrer || stored?.referrer || "",
      at: Date.now(),
    };
    writeCookie(ATTR_COOKIE, JSON.stringify(stored), ATTR_DAYS);
  } else if (!stored && currentReferrer) {
    stored = {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      referrer: currentReferrer,
      at: Date.now(),
    };
    writeCookie(ATTR_COOKIE, JSON.stringify(stored), ATTR_DAYS);
  }

  return {
    utm_source: stored?.utm_source || fromUrl.utm_source || "",
    utm_medium: stored?.utm_medium || fromUrl.utm_medium || "",
    utm_campaign: stored?.utm_campaign || fromUrl.utm_campaign || "",
    referrer: stored?.referrer || currentReferrer || "",
  };
}

function externalReferrer(): string {
  try {
    const referrer = document.referrer;
    if (!referrer) return "";

    const url = new URL(referrer);
    if (url.host === window.location.host) return "";

    return `${url.origin}${url.pathname}`.slice(0, 300);
  } catch {
    return "";
  }
}

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Rastreamento first-party, em lote e sem dados pessoais.
 * Eventos: pageview, click_programa, click_whatsapp e form_submit.
 */
export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isExcluded(pathname)) return;

    const queue: QueuedEvent[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    let flushing = false;

    const flush = async (useBeacon = false) => {
      if (flushing || queue.length === 0) return;

      flushing = true;
      const batch = queue.splice(0, queue.length);

      try {
        const payload = JSON.stringify({ events: batch });

        if (
          useBeacon &&
          typeof navigator !== "undefined" &&
          typeof navigator.sendBeacon === "function"
        ) {
          const blob = new Blob([payload], { type: "application/json" });
          const sent = navigator.sendBeacon("/api/track", blob);
          if (!sent) queue.unshift(...batch);
          return;
        }

        const response = await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });

        // Recoloca na fila em falhas temporárias do servidor.
        if (!response.ok && response.status >= 500) {
          queue.unshift(...batch.slice(0, MAX_QUEUE));
        }
      } catch {
        // Melhor perder um lote do que travar a navegação.
      } finally {
        flushing = false;
        if (queue.length > 0) schedule();
      }
    };

    const schedule = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        void flush();
      }, FLUSH_INTERVAL);
    };

    const enqueue = (type: AnalyticsEventType, data: TrackData = {}) => {
      const attribution = getAttribution();

      queue.push({
        type,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        page: window.location.pathname.slice(0, 200),
        device: window.matchMedia("(max-width: 768px)").matches
          ? "mobile"
          : "desktop",
        ts: new Date().toISOString(),
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        referrer: attribution.referrer,
        ...data,
      });

      if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);

      if (queue.length >= 10) void flush();
      else schedule();
    };

    const track = (type: string, data: Record<string, unknown> = {}) => {
      if (
        type !== "pageview" &&
        type !== "click_programa" &&
        type !== "click_whatsapp" &&
        type !== "form_submit" &&
        type !== "scroll_depth"
      ) {
        return;
      }

      enqueue(type as AnalyticsEventType, data as TrackData);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const whatsappLink = target.closest<HTMLAnchorElement>(
        'a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp.com/send"]'
      );

      if (whatsappLink) {
        enqueue("click_whatsapp", {
          placement: whatsappLink.getAttribute("data-wa-placement") || "link",
        });
      }

      const program = target.closest<HTMLElement>("[data-program-id]");
      if (program) {
        enqueue("click_programa", {
          program_id: program.getAttribute("data-program-id") || "",
          program_name: program.getAttribute("data-program-name") || "",
        });
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") void flush(true);
    };

    const handlePageHide = () => {
      void flush(true);
    };

    const handleCustomFormSubmit = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail || {};
      track("form_submit", detail);
    };

    // Profundidade de leitura: 25/50/75/90/100% uma vez por carregamento.
    const SCROLL_STEPS = [25, 50, 75, 90, 100];
    const seenDepths = new Set<number>();
    let scrollFrame: number | null = null;

    const measureScroll = () => {
      scrollFrame = null;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent =
        ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;

      for (const depth of SCROLL_STEPS) {
        if (percent + 0.5 >= depth && !seenDepths.has(depth)) {
          seenDepths.add(depth);
          enqueue("scroll_depth", { depth });
        }
      }
    };

    const handleScroll = () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(measureScroll);
    };

    window.jfvTrack = track;
    document.addEventListener("click", handleClick, true);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("jfv:form-submit", handleCustomFormSubmit);
    window.addEventListener("scroll", handleScroll, { passive: true });

    enqueue("pageview");
    const scrollTimer = setTimeout(measureScroll, 1200);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("jfv:form-submit", handleCustomFormSubmit);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);

      if (timer) clearTimeout(timer);
      void flush(true);

      if (window.jfvTrack === track) delete window.jfvTrack;
    };
  }, [pathname]);

  return null;
}
