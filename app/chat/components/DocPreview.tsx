"use client"

import { useCitationPreview } from "./CitationPreviewContext"

export default function DocPreview() {
  const { state, clear } = useCitationPreview()

  if (state.status === "idle") {
    return (
      <div className="flex h-full min-h-0 flex-col p-4">
        <h2 className="text-label-md font-medium text-on-surface-variant">出处预览</h2>
        <p className="mt-3 text-body-sm text-on-surface-variant leading-relaxed">
          点击回答中的角标 <span className="font-mono text-on-surface">[1]</span>、
          <span className="font-mono text-on-surface">[2]</span>
          ，或消息下方的「参考片段」按钮，即可在此查看对应原文。
        </p>
      </div>
    )
  }

  const { citation } = state
  const body =
    state.status === "ready" && state.fullContent != null && state.fullContent.length > 0
      ? state.fullContent
      : citation.content_snippet

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <h2 className="text-label-md font-medium text-on-surface-variant">出处预览</h2>
        <button
          type="button"
          onClick={clear}
          className="text-label-sm text-primary hover:underline"
        >
          关闭
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-outline/20 bg-surface-container-low p-4">
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
  )
}
