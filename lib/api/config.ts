/**
 * Server-only API configuration. These values are read at request time and are
 * never sent to the browser bundle; the browser talks to the same-origin BFF
 * proxy at /api/cascade, which attaches the base URL and token server-side.
 */
import "server-only";

export function apiBaseUrl(): string {
  const url = process.env.CASCADE_API_URL ?? "http://localhost:8000";
  return url.replace(/\/+$/, "");
}

export function apiToken(): string | undefined {
  const token = process.env.CASCADE_API_TOKEN;
  return token && token.length > 0 ? token : undefined;
}
