import { createOpenAI } from "@ai-sdk/openai"
import { Agent, fetch as undiciFetch, ProxyAgent } from "undici"

/** 与入库向量一致，勿随意改动 */
export const EMBEDDING_MODEL = "text-embedding-3-small" as const
export const EMBEDDING_DIMENSIONS = 1536 as const

/** 对话模型，可用 OPENAI_CHAT_MODEL 覆盖 */
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"

function parseTimeoutMs(envValue: string | undefined, fallback: number): number {
  const n = Number.parseInt(envValue ?? "", 10)
  return Number.isFinite(n) && n >= 1000 ? n : fallback
}

/**
 * Node 内置 fetch 对 TLS 建连默认约 10s（undici buildConnector），经代理/跨境易失败。
 * 使用 undici Agent 拉长 connect / 读写超时；配置代理时用 ProxyAgent（Node 不会自动用 macOS「系统代理」）。
 * 代理优先级：HTTPS_PROXY → HTTP_PROXY → OPENAI_HTTPS_PROXY → OPENAI_HTTP_PROXY（后两者仅影响本文件创建的 OpenAI 请求）。
 */
export const openaiConnectTimeoutMs = parseTimeoutMs(process.env.OPENAI_CONNECT_TIMEOUT_MS, 60_000)
export const openaiBodyTimeoutMs = parseTimeoutMs(process.env.OPENAI_BODY_TIMEOUT_MS, 180_000)
const openaiPreferIpv4 =
  process.env.OPENAI_PREFER_IPV4 === "1" || process.env.OPENAI_PREFER_IPV4 === "true"

const openaiAgentBaseOpts = {
  connectTimeout: openaiConnectTimeoutMs,
  headersTimeout: openaiBodyTimeoutMs,
  bodyTimeout: openaiBodyTimeoutMs,
  ...(openaiPreferIpv4 ? { connect: { family: 4 as const } } : {}),
} as ConstructorParameters<typeof Agent>[0]

const openaiProxyUri =
  process.env.HTTPS_PROXY?.trim() ||
  process.env.HTTP_PROXY?.trim() ||
  process.env.OPENAI_HTTPS_PROXY?.trim() ||
  process.env.OPENAI_HTTP_PROXY?.trim()

const openaiDispatcher = openaiProxyUri
  ? new ProxyAgent({
      uri: openaiProxyUri,
      ...openaiAgentBaseOpts,
    } as ConstructorParameters<typeof ProxyAgent>[0])
  : new Agent(openaiAgentBaseOpts)

function openaiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return undiciFetch(
    input as Parameters<typeof undiciFetch>[0],
    {
      ...(init ?? {}),
      dispatcher: openaiDispatcher,
    } as Parameters<typeof undiciFetch>[1]
  ) as unknown as Promise<Response>
}

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  fetch: openaiFetch,
})
