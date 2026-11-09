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
const UTM_KEY = "jfv_utm";

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

function getUtms() {
  let stored: { utm_source?: string; utm_medium?: string; utm_campaign?: string } = {};

  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
  };

  const merged = {
    utm_source: fromUrl.utm_source || stored.utm_source || "",
    utm_medium: fromUrl.utm_medium || stored.utm_medium || "",
    utm_campaign: fromUrl.utm_campaign || stored.utm_campaign || "",
  };

  try {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(merged));
  } catch {
    // armazenamento indisponível: segue com os dados da URL
  }

  return merged;
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
      const utms = getUtms();

      queue.push({
        type,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        page: window.location.pathname.slice(0, 200),
        device: window.matchMedia("(max-width: 768px)").matches
          ? "mobile"
          : "desktop",
        ts: new Date().toISOString(),
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        referrer: externalReferrer(),
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
        type !== "form_submit"
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

    window.jfvTrack = track;
    document.addEventListener("click", handleClick, true);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("jfv:form-submit", handleCustomFormSubmit);

    enqueue("pageview");

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("jfv:form-submit", handleCustomFormSubmit);

      if (timer) clearTimeout(timer);
      void flush(true);

      if (window.jfvTrack === track) delete window.jfvTrack;
    };
  }, [pathname]);

  return null;
}
