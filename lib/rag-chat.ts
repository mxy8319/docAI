import type { Citation, SearchResult } from "./database.types"
import { resultsToCitations } from "./db"
import type { UIMessage } from "ai"

export function getLatestUserQueryText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== "user" || !m.parts?.length) continue
    const texts = m.parts
      .filter(
        (p): p is { type: "text"; text: string } =>
          p.type === "text" && typeof (p as { text?: unknown }).text === "string"
      )
      .map((p) => p.text.trim())
      .filter(Boolean)
    if (texts.length) return texts.join("\n")
  }
  return ""
}

export function buildRagContextBlock(results: SearchResult[]): string {
  if (results.length === 0) {
    return "（未检索到与用户问题相关的文档片段。请如实说明当前知识库中没有相关材料，不要编造。）"
  }
  return results
    .map((r, i) => {
      const title = r.source_title?.trim() || r.file_name
      return `### [${i + 1}] ${title}\n- 文件: ${r.file_name}\n- 页码: ${r.page_number ?? "—"}\n- chunk_id: ${r.chunk_id}\n\n${r.content}`
    })
    .join("\n\n---\n\n")
}

const RAG_INSTRUCTIONS = `你是 DocAI 文档助手。请严格依据下方「本次检索到的片段」回答用户问题。
规则：
- 只使用片段中明确出现的信息；不得臆测或引用片段外的“事实”。
- 凡引用片段中的事实、数字、定义或原文措辞，句末或分句末必须标注角标，编号与片段标题一致：可用半角 **[1]、[2]** 或中文 **【1】【2】**；一句可标多个。不要使用未提供的编号，也不要用脚注 ^1 等其它样式。
- 若片段不足以回答，请直接说明，并简述还缺少什么信息。`

export function buildRagSystemPrompt(
  contextBlock: string,
  scope?: { fileNames: string[] }
): string {
  const scopeBlock =
    scope && scope.fileNames.length > 0
      ? `\n## 本次问答绑定文档（仅允许使用下列文件名对应的检索片段）\n${scope.fileNames.map((n) => `- ${n}`).join("\n")}\n`
      : ""
  return `${RAG_INSTRUCTIONS}
${scopeBlock}
## 本次检索到的片段

${contextBlock}`
}

/** 从助手正文中收集 [n] /【n】/［n］ 引用，只保留落在检索结果范围内的编号，映射为 Citation。 */
export function collectValidatedCitations(
  assistantText: string,
  results: SearchResult[]
): Citation[] {
  if (results.length === 0) return []
  const base = resultsToCitations(results)
  const seen = new Set<number>()
  const out: Citation[] = []
  const re = /(?:\[(\d+)\]|【(\d+)】|［(\d+)］)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(assistantText)) !== null) {
    const idx = Number.parseInt(m[1] ?? m[2] ?? m[3]!, 10)
    if (!Number.isFinite(idx) || idx < 1 || idx > results.length || seen.has(idx)) continue
    seen.add(idx)
    out.push(base[idx - 1])
  }
  return out
}
