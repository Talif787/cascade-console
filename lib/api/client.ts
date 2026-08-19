"use client";

/**
 * Browser API client. Talks to the same-origin BFF proxy at /api/cascade, which
 * forwards to the Cascade FastAPI and attaches auth server-side. Once the OpenAPI
 * types are generated (npm run gen:api), swap the hand-written types below for
 * the generated paths and use openapi-fetch for full end-to-end typing.
 */

export interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiError {
  status: number;
  detail: string;
  issues?: ValidationIssue[];
}

const BASE = "/api/cascade";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    let issues: ValidationIssue[] | undefined;
    try {
      const body = await res.json();
      if (body && typeof body.detail === "string") {
        detail = body.detail;
      } else if (body && Array.isArray(body.detail)) {
        // FastAPI validation errors: detail is an array of issues.
        issues = body.detail as ValidationIssue[];
        detail = issues.map((i) => i.msg).join("; ") || detail;
      }
    } catch {
      // no JSON body
    }
    throw { status: res.status, detail, issues } satisfies ApiError;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...(headers ?? {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
