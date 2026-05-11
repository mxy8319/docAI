import { convertToModelMessages, embed, streamText, type UIMessage } from "ai"

import { semanticSearch, resultsToCitations } from "@/lib/db"
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

  const queryText = getLatestUserQueryText(messages)
  if (!queryText) {
    return new Response(JSON.stringify({ error: "最后一条用户消息无文本内容" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const topK = parseIntEnv(process.env.RAG_TOP_K, 8)
  const threshold = parseFloatEnv(process.env.RAG_MATCH_THRESHOLD, 0.45)

  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: queryText,
      maxRetries: 2,
    })

    const hits = await semanticSearch(embedding, user.id, {
      threshold,
      topK,
    })

    const contextBlock = buildRagContextBlock(hits)
    const system = buildRagSystemPrompt(contextBlock)

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
