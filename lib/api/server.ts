/**
 * Server-side fetch wrapper for Server Components and Route Handlers. Attaches
 * the Cascade base URL and, when present, the bearer token. The browser never
 * uses this directly; it goes through the /api/cascade proxy instead.
 */
import "server-only";
import { apiBaseUrl, apiToken } from "./config";

export interface CascadeError {
  status: number;
  detail: string;
}

export async function cascadeFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = apiToken();
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (body && typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // response had no JSON body; keep the status text
    }
    const error: CascadeError = { status: response.status, detail };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
