"use client"

import { Eye } from "lucide-react"
import { useCitationPreview } from "./CitationPreviewContext"

export default function DocPreview() {
  const { state, clear } = useCitationPreview()

  if (state.status === "idle") {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#c8e6d9]/80 bg-white/90 px-4 py-3">
          <div className="flex items-center gap-2 text-label-xs font-semibold uppercase tracking-[0.12em] text-[#5c7268]">
            <Eye className="size-4 text-[#1b4332]" aria-hidden />
            原文预览
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            点击回答中的角标 <span className="font-mono text-on-surface">[1]</span>、
            <span className="font-mono text-on-surface">[2]</span>
            ，或消息下方的「参考片段」按钮，即可在此查看对应原文。
          </p>
        </div>
      </div>
    )
  }

  const { citation } = state
  const body =
    state.status === "ready" && state.fullContent != null && state.fullContent.length > 0
      ? state.fullContent
      : citation.content_snippet

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#c8e6d9]/80 bg-white/90 px-4 py-3">
        <div className="flex items-center gap-2 text-label-xs font-semibold uppercase tracking-[0.12em] text-[#5c7268]">
          <Eye className="size-4 text-[#1b4332]" aria-hidden />
          原文预览
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-label-sm font-medium text-[#1b4332] hover:underline"
        >
          关闭
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-[#c8e6d9]/80 bg-[#f8fdf9] p-4">
          <div className="flex flex-wrap items-center gap-2 text-label-sm text-on-surface">
            <span className="truncate font-medium" title={citation.file_name}>
              {citation.file_name}
            </span>
            <span className="text-on-surface-variant">
              {citation.page_number != null ? `· 第 ${citation.page_number} 页` : ""}
            </span>
          </div>
          {state.status === "loading" && (
            <p className="mt-2 text-label-sm text-on-surface-variant">正在加载原文…</p>
          )}
          <pre className="mt-3 whitespace-pre-wrap break-words text-body-sm text-on-surface leading-relaxed">
            {body}
          </pre>
          {state.status === "ready" && !state.fullContent && (
            <p className="mt-2 text-label-sm text-on-surface-variant">
              未能加载全文，已显示检索片段。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
