"use client"

import { ThreadList } from "@/components/assistant-ui/thread-list"
import type { Document, DocumentStatus } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { getChatSidebarLists } from "../actions"
import { Upload } from "./Upload"

type SidebarTab = "documents" | "chats"

function documentStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case "uploading":
      return "上传中"
    case "processing":
      return "处理中"
    case "ready":
      return "就绪"
    case "failed":
      return "失败"
    default:
      return status
  }
}

function documentStatusClass(status: DocumentStatus): string {
  switch (status) {
    case "ready":
      return "bg-primary/15 text-primary"
    case "failed":
      return "bg-error/15 text-error"
    case "processing":
    case "uploading":
      return "bg-on-surface-variant/10 text-on-surface-variant"
    default:
      return "bg-on-surface-variant/10 text-on-surface-variant"
  }
}

export function ChatSidebar() {
  const [tab, setTab] = useState<SidebarTab>("chats")
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { documents: nextDocs } = await getChatSidebarLists()
      setDocuments(nextDocs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="tablist"
        aria-label="侧边栏"
        className="flex shrink-0 gap-1 border-b border-outline/20 p-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "documents"}
          onClick={() => setTab("documents")}
          className={cn(
            "flex-1 rounded-lg px-2 py-2 text-label-sm font-medium transition-colors",
            tab === "documents"
              ? "bg-surface-container-low text-on-surface shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-low/60 hover:text-on-surface"
          )}
        >
          文档
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "chats"}
          onClick={() => setTab("chats")}
          className={cn(
            "flex-1 rounded-lg px-2 py-2 text-label-sm font-medium transition-colors",
            tab === "chats"
              ? "bg-surface-container-low text-on-surface shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-low/60 hover:text-on-surface"
          )}
        >
          对话
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "documents" ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b border-outline/20 p-3">
              <Upload onUpload={() => void refresh()} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {loading ? (
                <p className="px-1 text-label-sm text-on-surface-variant">加载中…</p>
              ) : documents.length === 0 ? (
                <p className="px-1 text-label-sm text-on-surface-variant">暂无文档</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm hover:bg-surface-container-low"
                    >
                      <span
                        className="min-w-0 flex-1 truncate text-on-surface"
                        title={doc.file_name}
                      >
                        {doc.file_name}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-label-xs ${documentStatusClass(doc.status)}`}
                      >
                        {documentStatusLabel(doc.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-y-auto p-3">
            <ThreadList />
          </div>
        )}
      </div>
    </div>
  )
}
