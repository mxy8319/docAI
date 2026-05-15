/**
 * 浏览器端记录「@ 文档」最近使用顺序（MRU：最近使用的排在前面）。
 * 用户口语中的 LRU 常指「最近优先」，此处按 MRU 维护一条 id 列表。
 */

const STORAGE_VERSION = 1
const MAX_IDS = 200

type Store = { v: number; ids: string[] }

function storageKey(userId: string): string {
  return `docai:at-doc-mru:v${STORAGE_VERSION}:${userId}`
}

function readStore(userId: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as Store
    if (!parsed || parsed.v !== STORAGE_VERSION || !Array.isArray(parsed.ids)) return []
    return parsed.ids.filter((id) => typeof id === "string" && id.length > 0)
  } catch {
    return []
  }
}

function writeStore(userId: string, ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    const payload: Store = { v: STORAGE_VERSION, ids: ids.slice(0, MAX_IDS) }
    window.localStorage.setItem(storageKey(userId), JSON.stringify(payload))
  } catch {
    // quota / private mode
  }
}

/** 最近使用的文档 id 在前（不含从未用过的文档）。 */
export function readAtDocumentMruIds(userId: string): string[] {
  return readStore(userId)
}

/** 将某文档标为「刚用过」，移到列表最前。 */
export function touchAtDocumentMru(userId: string, documentId: string): void {
  const prev = readStore(userId)
  const next = [documentId, ...prev.filter((id) => id !== documentId)]
  writeStore(userId, next)
}
