import type { Unstable_DirectiveFormatter } from "@assistant-ui/core"
import { unstable_defaultDirectiveFormatter } from "@assistant-ui/core"
import { formatDisplayDocId } from "@/app/documents/format"

/**
 * 与 assistant-ui directive 一致：`:type[label]{name=id}`。
 * 文档范围 type=`document`，完整 UUID 放在 `{name=…}`。
 */
const DIRECTIVE_RE = /:([\w-]{1,64})\[([^\]\n]{1,1024})\](?:\{name=([^}\n]{1,1024})\})?/gu

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(s: string): boolean {
  return UUID_RE.test(s)
}

function resolveDocumentId(type: string, label: string, name?: string): string | null {
  if (type !== "document") return null
  const id = name ?? label
  return isUuid(id) ? id : null
}

/** 历史消息 / 兼容：短标签 directive 序列化。 */
export const documentDirectiveFormatter: Unstable_DirectiveFormatter = {
  serialize(item) {
    if (item.type !== "document") {
      return unstable_defaultDirectiveFormatter.serialize(item)
    }
    const id = item.id
    const label = formatDisplayDocId(id)
    return `:document[${label}]{name=${id}}`
  },
  parse: unstable_defaultDirectiveFormatter.parse,
}

/** 从请求体解析 `documentIds`（UUID 白名单，去重）。 */
export function parseDocumentIdsList(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const x of ids) {
    if (typeof x !== "string" || !isUuid(x) || seen.has(x)) continue
    seen.add(x)
    out.push(x)
  }
  return out
}

/** 从文本中收集 `document` 指令绑定的文档 id（去重）；用于历史消息展示。 */
export function collectDocumentIdsFromScopeDirectives(text: string): string[] {
  const ids = new Set<string>()
  for (const match of text.matchAll(DIRECTIVE_RE)) {
    const id = resolveDocumentId(match[1]!, match[2]!, match[3])
    if (id) ids.add(id)
  }
  return [...ids]
}

/** 去掉 `document` 指令，仅保留用户自然语言。 */
export function stripDocumentScopeDirectives(text: string): string {
  let out = ""
  let lastIndex = 0
  for (const match of text.matchAll(DIRECTIVE_RE)) {
    if (match.index === undefined) continue
    out += text.slice(lastIndex, match.index)
    if (match[1] !== "document") {
      out += match[0]
    }
    lastIndex = match.index + match[0].length
  }
  out += text.slice(lastIndex)
  return out.replace(/[ \t]{2,}/g, " ").trim()
}

/** 从文本中移除某一文档的 scope 指令。 */
export function removeDocumentScopeDirective(text: string, documentId: string): string {
  let out = ""
  let lastIndex = 0
  for (const match of text.matchAll(DIRECTIVE_RE)) {
    if (match.index === undefined) continue
    const type = match[1]!
    const label = match[2]!
    const name = match[3]
    const id = resolveDocumentId(type, label, name)
    const sliceEnd = match.index + match[0].length
    if (id === documentId) {
      out += text.slice(lastIndex, match.index)
      lastIndex = sliceEnd
      continue
    }
    out += text.slice(lastIndex, sliceEnd)
    lastIndex = sliceEnd
  }
  out += text.slice(lastIndex)
  return out.replace(/[ \t]{2,}/g, " ").trim()
}
