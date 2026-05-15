import { convertToModelMessages, embed, streamText, type UIMessage } from "ai"

import {
  collectDocumentIdsFromScopeDirectives,
  parseDocumentIdsList,
  stripDocumentScopeDirectives,
} from "@/lib/document-scope-text"
import { getDocumentsByIdsForUser, resultsToCitations, semanticSearch } from "@/lib/db"
import { CHAT_MODEL, EMBEDDING_MODEL, openai } from "@/lib/openai-provider"
import { createClient } from "@/lib/supabase-server"
import {
  buildRagContextBlock,
  buildRagSystemPrompt,
  collectValidatedCitations,
  getLatestUserQueryText,
} from "@/lib/rag-chat"

export const runtime = "nodejs"
export const maxDuration = 120

function parseIntEnv(v: string | undefined, fallback: number): number {
  const n = Number.parseInt(v ?? "", 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function parseFloatEnv(v: string | undefined, fallback: number): number {
  const n = Number.parseFloat(v ?? "")
  return Number.isFinite(n) ? n : fallback
}

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY 未配置" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const messages = (body as { messages?: UIMessage[] }).messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages 必填" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const rawText = getLatestUserQueryText(messages)
  const bodyDocumentIds = parseDocumentIdsList(
    (body as { documentIds?: unknown }).documentIds
  )
  const directiveIds = rawText ? collectDocumentIdsFromScopeDirectives(rawText) : []
  const requestedIds = bodyDocumentIds.length > 0 ? bodyDocumentIds : directiveIds
  if (requestedIds.length === 0) {
    return new Response(
      JSON.stringify({
        error: "未指定文档范围：请在输入中使用 @ 选择至少一个已就绪的文档后再提问。",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  const scopeDocs = await getDocumentsByIdsForUser(user.id, requestedIds)
  const readyIds = scopeDocs.filter((d) => d.status === "ready").map((d) => d.id)
  if (readyIds.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          "所选文档尚未就绪或无效：请仅 @ 状态为「就绪」的文档，或等待处理完成后再提问。",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  const topK = parseIntEnv(process.env.RAG_TOP_K, 8)
  const threshold = parseFloatEnv(process.env.RAG_MATCH_THRESHOLD, 0.45)

  const questionText = stripDocumentScopeDirectives(rawText).trim()
  const queryText =
    questionText ||
    scopeDocs
      .filter((d) => readyIds.includes(d.id))
      .map((d) => d.file_name)
      .join(" ")

  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: queryText,
      maxRetries: 2,
    })

    const hits = await semanticSearch(embedding, user.id, {
      threshold,
      topK,
      documentIds: readyIds,
    })

    const contextBlock = buildRagContextBlock(hits)
    const system = buildRagSystemPrompt(contextBlock, {
      fileNames: scopeDocs.filter((d) => readyIds.includes(d.id)).map((d) => d.file_name),
    })

    const uiStripped = messages.map(({ id: _id, ...rest }) => rest) as Omit<UIMessage, "id">[]
    const modelMessages = await convertToModelMessages(uiStripped)

    const result = streamText({
      model: openai(CHAT_MODEL),
      system,
      messages: modelMessages,
      maxRetries: 1,
    })

    // assistant-ui merges assistant metadata via joinExternalMessages and only keeps a
    // whitelist at the top level; `custom.*` is merged. Put citations under custom so
    // useAuiState(s.message.metadata) in the thread sees them.
    const ragMeta = hits.length > 0 ? { custom: { ragCitations: resultsToCitations(hits) } } : null

    return result.toUIMessageStreamResponse({
      // Attach on stream `start` so metadata exists before text deltas (avoids persist/UI races)
      // and again on `finish` for consumers that only read terminal metadata.
      messageMetadata: ({ part }) => {
        if (!ragMeta) return undefined
        if (part.type === "start" || part.type === "finish") {
          return ragMeta
        }
        return undefined
      },
      onFinish: ({ responseMessage }) => {
        const text =
          responseMessage.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("") ?? ""
        const cites = collectValidatedCitations(text, hits)
        if (process.env.NODE_ENV === "development") {
          console.debug("[rag] hits:", hits.length, "validated citations:", cites.length)
        }
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "对话失败"
    console.error("[api/chat]", e)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
