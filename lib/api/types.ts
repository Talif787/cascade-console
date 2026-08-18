/**
 * Minimal hand-written types for Phase F1. Run `npm run gen:api` against the
 * running backend to produce lib/api/schema.d.ts with the full OpenAPI types,
 * then migrate these to reference the generated schema.
 */

export interface HealthStatus {
  status: string;
}

export interface ReadinessCheck {
  name: string;
  status: string;
  detail?: string;
}

export interface ReadinessStatus {
  status: string;
  checks?: ReadinessCheck[];
}

/** The bounded contexts the console will surface, one per platform capability. */
export type ContextKey =
  | "overview"
  | "serving"
  | "copilot"
  | "governance"
  | "pipelines"
  | "contracts"
  | "ingestion"
  | "processing"
  | "mcp";
