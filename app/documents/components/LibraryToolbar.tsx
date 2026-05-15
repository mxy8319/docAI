"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useTransition } from "react"
import type { DocumentStatus } from "@/lib/database.types"
import { Filter } from "lucide-react"

const STATUS_OPTIONS: { value: "" | DocumentStatus; label: string }[] = [
  { value: "", label: "全部状态" },
  { value: "uploading", label: "上传中" },
  { value: "processing", label: "解析中" },
  { value: "ready", label: "就绪" },
  { value: "failed", label: "失败" },
]

export function LibraryToolbar({
  total,
  page,
  pageSize,
}: {
  total: number
  page: number
  pageSize: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const buildHref = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === "") next.delete(k)
        else next.set(k, v)
      }
      const qs = next.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, searchParams]
  )

  const statusValue = useMemo(() => {
    const s = searchParams.get("status") as DocumentStatus | null
    if (s && STATUS_OPTIONS.some((o) => o.value === s)) return s
    return ""
  }, [searchParams])

  const onStatusChange = (value: string) => {
    startTransition(() => {
      router.push(
        buildHref({
          status: value || undefined,
          page: "1",
        })
      )
    })
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-3 border-b border-[#c8e6d9]/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8e6d9] bg-white/80 px-2.5 py-1.5 text-label-sm text-[#1b4332]">
          <Filter className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <label htmlFor="lib-status" className="sr-only">
            状态筛选
          </label>
          <select
            id="lib-status"
            disabled={pending}
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className="cursor-pointer border-0 bg-transparent text-label-sm font-medium text-[#1b4332] outline-none focus:ring-0"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </span>
        <span className="rounded-lg border border-transparent px-2 py-1.5 text-label-sm text-[#5c7268]">
          按上传时间 · 最新优先
        </span>
      </div>
      <p className="text-label-sm text-[#5c7268]">
        {total === 0 ? (
          "暂无文档"
        ) : (
          <>
            第 <span className="font-medium text-[#1b4332]">{from}</span>–
            <span className="font-medium text-[#1b4332]">{to}</span> 条，共{" "}
            <span className="font-medium text-[#1b4332]">{total}</span> 个文档
          </>
        )}
      </p>
    </div>
  )
}
