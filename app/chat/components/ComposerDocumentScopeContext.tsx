"use client"

import { getChatSidebarLists } from "@/app/chat/actions/sidebar"
import { touchAtDocumentMru } from "@/lib/at-doc-mru"
import { composerDocumentScopeRef } from "@/lib/composer-document-scope-ref"
import type { Document } from "@/lib/database.types"
import {
  collectDocumentIdsFromScopeDirectives,
  stripDocumentScopeDirectives,
} from "@/lib/document-scope-text"
import { useAui, useAuiState } from "@assistant-ui/react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react"

type ComposerDocumentScopeContextValue = {
  scopedIds: string[]
  documents: Document[]
  addScopedId: (id: string) => void
  removeScopedId: (id: string) => void
  clearScopedIds: () => void
}

const ComposerDocumentScopeContext = createContext<ComposerDocumentScopeContextValue | null>(
  null
)

export function useComposerDocumentScope(): ComposerDocumentScopeContextValue {
  const ctx = useContext(ComposerDocumentScopeContext)
  if (!ctx) {
    throw new Error("useComposerDocumentScope must be used within ComposerDocumentScopeProvider")
  }
  return ctx
}

/** 若 directive 误入 composer 文本，剥离并合并进 scopedIds。 */
export const ComposerDirectiveSanitizer: FC = () => {
  const aui = useAui()
  const { addScopedId } = useComposerDocumentScope()
  const text = useAuiState((s) => s.composer.text ?? "")

  useEffect(() => {
    const ids = collectDocumentIdsFromScopeDirectives(text)
    if (ids.length === 0) return
    for (const id of ids) addScopedId(id)
    const stripped = stripDocumentScopeDirectives(text)
    if (stripped !== text) {
      aui.composer().setText(stripped)
    }
  }, [text, aui, addScopedId])

  return null
}

export const ComposerDocumentScopeProvider: FC<{
  userId: string
  children: ReactNode
}> = ({ userId, children }) => {
  const aui = useAui()
  const [scopedIds, setScopedIds] = useState<string[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    composerDocumentScopeRef.current = scopedIds
  }, [scopedIds])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { documents: list } = await getChatSidebarLists()
        if (!cancelled) setDocuments(list)
      } catch {
        if (!cancelled) setDocuments([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return aui.on("threadListItem.switchedTo", () => {
      setScopedIds([])
    })
  }, [aui])

  const addScopedId = useCallback(
    (id: string) => {
      setScopedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      touchAtDocumentMru(userId, id)
    },
    [userId]
  )

  const removeScopedId = useCallback((id: string) => {
    setScopedIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const clearScopedIds = useCallback(() => {
    setScopedIds([])
  }, [])

  const value = useMemo(
    () => ({
      scopedIds,
      documents,
      addScopedId,
      removeScopedId,
      clearScopedIds,
    }),
    [scopedIds, documents, addScopedId, removeScopedId, clearScopedIds]
  )

  return (
    <ComposerDocumentScopeContext.Provider value={value}>
      {children}
    </ComposerDocumentScopeContext.Provider>
  )
}
