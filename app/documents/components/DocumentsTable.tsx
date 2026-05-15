import Link from "next/link"
import { FileText, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import type { Document, DocumentStatus } from "@/lib/database.types"
import { formatDisplayDocId, formatFileSize, formatRelativeTime } from "../format"
import { cn } from "@/lib/utils"

function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case "uploading":
      return "上传中"
    case "processing":
      return "解析中"
    case "ready":
      return "就绪"
    case "failed":
      return "失败"
    default:
      return status
  }
}

function StatusCell({ doc }: { doc: Document }) {
  if (doc.status === "uploading") {
    const pct = Math.min(100, Math.max(0, doc.progress))
    return (
      <div className="min-w-[140px] space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-label-xs text-[#5c7268]">
          <span className="font-medium text-[#1b4332]">上传中 {pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#c8e6d9]/60">
          <div
            className="h-full rounded-full bg-[#1b4332] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  if (doc.status === "processing") {
    return (
      <div className="flex min-w-[140px] items-start gap-2">
        <span className="mt-0.5 flex size-2 shrink-0 rounded-full bg-[#4ade80] ring-2 ring-[#bbf7d0]" />
        <div className="min-w-0">
          <p className="text-label-sm font-medium text-[#1b4332]">解析与向量化</p>
          {doc.current_step ? (
            <p className="truncate text-label-xs text-[#5c7268]" title={doc.current_step}>
              {doc.current_step}
            </p>
          ) : (
            <p className="text-label-xs text-[#5c7268]">处理中…</p>
          )}
          {doc.progress > 0 && doc.progress < 100 && (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#c8e6d9]/60">
              <div
                className="h-full rounded-full bg-[#166534]"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (doc.status === "ready") {
    return (
      <div className="flex min-w-[140px] items-center gap-2">
        <CheckCircle2 className="size-4 shrink-0 text-[#166534]" aria-hidden />
        <div>
          <p className="text-label-sm font-medium text-[#1b4332]">已完成</p>
          <p className="text-label-xs text-[#5c7268]">{formatRelativeTime(doc.updated_at)}</p>
        </div>
      </div>
    )
  }

  if (doc.status === "failed") {
    return (
      <div className="flex min-w-[140px] items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
        <div className="min-w-0">
          <p className="text-label-sm font-medium text-error">失败</p>
          <p
            className="line-clamp-2 text-label-xs text-on-surface-variant"
            title={doc.error_message ?? ""}
          >
            {doc.error_message ?? "未知错误"}
          </p>
        </div>
      </div>
    )
  }

  return <span className="text-label-sm text-[#5c7268]">{statusLabel(doc.status)}</span>
}

export function DocumentsTable({ documents }: { documents: Document[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#c8e6d9] bg-[#f4fbf7]">
            <th className="px-5 py-3 text-label-xs font-semibold uppercase tracking-wide text-[#5c7268]">
              文档名称
            </th>
            <th className="px-5 py-3 text-label-xs font-semibold uppercase tracking-wide text-[#5c7268]">
              文档 ID
            </th>
            <th className="px-5 py-3 text-label-xs font-semibold uppercase tracking-wide text-[#5c7268]">
              状态 / 进度
            </th>
            <th className="w-24 px-5 py-3 text-label-xs font-semibold uppercase tracking-wide text-[#5c7268]">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-16 text-center text-body-md text-[#5c7268]">
                暂无文档。可在左侧上传 PDF，或调整搜索 / 筛选条件。
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-[#e8f5ef] transition-colors hover:bg-[#f8fdf9]"
              >
                <td className="px-5 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1b4332]/10 text-[#1b4332]">
                      <FileText className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1b4332]" title={doc.file_name}>
                        {doc.file_name}
                      </p>
                      <p className="mt-0.5 text-label-xs text-[#5c7268]">
                        {formatFileSize(doc.file_size)} · PDF
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-top">
                  <code className="rounded-md bg-[#f4fbf7] px-2 py-1 text-label-xs text-[#374151]">
                    {formatDisplayDocId(doc.id)}
                  </code>
                </td>
                <td className="px-5 py-4 align-top">
                  <StatusCell doc={doc} />
                </td>
                <td className="px-5 py-4 align-top">
                  <Link
                    href="/chat"
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-lg border border-[#c8e6d9]",
                      "text-[#1b4332] transition-colors hover:bg-[#1b4332] hover:text-white"
                    )}
                    title="在对话中使用"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
