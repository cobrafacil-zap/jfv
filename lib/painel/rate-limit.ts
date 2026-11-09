/* ============================================================
   Rate limit em memória (por instância).
   Para o volume desta landing é suficiente e evita dependências.
   ============================================================ */

type FailureBucket = {
  failures: number;
  firstAt: number;
  blockedUntil: number;
};

const failures = new Map<string, FailureBucket>();
const counters = new Map<string, { count: number; resetAt: number }>();

const LOGIN_WINDOW = 10 * 60 * 1000;
const LOGIN_MAX_FAILURES = 6;
const LOGIN_BLOCK = 15 * 60 * 1000;
const MAX_KEYS = 5000;

function cleanup(now: number) {
  if (failures.size > MAX_KEYS) {
    for (const [key, bucket] of failures) {
      if (bucket.blockedUntil < now && now - bucket.firstAt > LOGIN_WINDOW) {
        failures.delete(key);
      }
    }
  }

  if (counters.size > MAX_KEYS) {
    for (const [key, counter] of counters) {
      if (counter.resetAt < now) counters.delete(key);
    }
  }
}

export function checkLoginRateLimit(ip: string): {
  ok: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  cleanup(now);

  const bucket = failures.get(ip);
  if (bucket && bucket.blockedUntil > now) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000)),
    };
  }

  if (bucket && now - bucket.firstAt > LOGIN_WINDOW) {
    failures.delete(ip);
  }

  return { ok: true };
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const bucket = failures.get(ip) ?? {
    failures: 0,
    firstAt: now,
    blockedUntil: 0,
  };

  if (now - bucket.firstAt > LOGIN_WINDOW) {
    bucket.failures = 0;
    bucket.firstAt = now;
    bucket.blockedUntil = 0;
  }

  bucket.failures += 1;
  if (bucket.failures >= LOGIN_MAX_FAILURES) {
    bucket.blockedUntil = now + LOGIN_BLOCK;
  }

  failures.set(ip, bucket);
}

export function resetLoginRateLimit(ip: string) {
  failures.delete(ip);
}

export function checkCounter(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  cleanup(now);

  const current = counters.get(key);
  if (!current || current.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= max) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "desconhecido";
  return request.headers.get("x-real-ip") || "desconhecido";
}
