/**
 * Backend-for-Frontend proxy. The browser calls /api/cascade/<path>; this
 * handler forwards the request to the Cascade FastAPI, attaching the bearer
 * token server-side so it never reaches client JavaScript. Query strings are
 * preserved; request and response bodies are streamed through.
 */
import { NextRequest, NextResponse } from "next/server";
import { apiBaseUrl, apiToken } from "@/lib/api/config";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const suffix = path.map(encodeURIComponent).join("/");
  const search = req.nextUrl.search;
  const target = `${apiBaseUrl()}/${suffix}${search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("accept", req.headers.get("accept") ?? "application/json");

  const token = apiToken();
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  const idempotency = req.headers.get("idempotency-key");
  if (idempotency) {
    headers.set("idempotency-key", idempotency);
  }

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "The control plane is unreachable. Check CASCADE_API_URL and that the API is running." },
      { status: 502 },
    );
  }

  const body = await upstream.text();
  const responseType = upstream.headers.get("content-type") ?? "application/json";
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": responseType },
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
