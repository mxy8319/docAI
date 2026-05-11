import type { Citation } from "@/lib/database.types";

/** Read RAG citation list from AI SDK / assistant-ui message metadata. */
export function readRagCitationsFromMessageMetadata(metadata: unknown): Citation[] | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const m = metadata as Record<string, unknown> & { custom?: Record<string, unknown> };
  // Prefer `custom` (what assistant-ui preserves when joining assistant messages).
  const nested = m.custom?.ragCitations;
  if (Array.isArray(nested)) return nested as Citation[];
  const top = m.ragCitations;
  if (Array.isArray(top)) return top as Citation[];
  return undefined;
}
