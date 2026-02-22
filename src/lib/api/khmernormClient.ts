export type NormalizeResponse = { normalized: string };

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function withTimeout(signal: AbortSignal | undefined, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException("Request timeout", "AbortError")), ms);

  const abort = () => ctrl.abort();
  signal?.addEventListener("abort", abort, { once: true });

  return {
    signal: ctrl.signal,
    cleanup: () => {
      clearTimeout(t);
      signal?.removeEventListener("abort", abort);
    },
  };
}

export async function apiNormalizeKhmerText(
  text: string,
  opts?: { baseUrl?: string; timeoutMs?: number; signal?: AbortSignal }
): Promise<string> {
  const baseUrl = opts?.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
  const timeoutMs = opts?.timeoutMs ?? 12_000;

  const { signal, cleanup } = withTimeout(opts?.signal, timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/v1/normalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new ApiError(`Normalize failed (${res.status}): ${detail || res.statusText}`, res.status);
    }

    const data = (await res.json()) as NormalizeResponse;
    if (!data?.normalized || typeof data.normalized !== "string") {
      throw new ApiError("Normalize returned an invalid response shape");
    }
    return data.normalized;
  } finally {
    cleanup();
  }
}
