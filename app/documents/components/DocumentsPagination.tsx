import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buildListHref } from "../build-list-href"
import { cn } from "@/lib/utils"

function pageNumbers(current: number, total: number): number[] {
  const set = new Set<number>()
  set.add(1)
  set.add(total)
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= total) set.add(p)
  }
  return [...set].sort((a, b) => a - b)
}

function withEllipsis(sorted: number[]): (number | "gap")[] {
  const out: (number | "gap")[] = []
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!
    if (i > 0) {
      const prev = sorted[i - 1]!
      if (n - prev > 1) out.push("gap")
    }
    out.push(n)
  }
  return out
}

export function DocumentsPagination({
  page,
  totalPages,
  q,
  status,
}: {
  page: number
  totalPages: number
  q?: string
  status?: string
}) {
  if (totalPages < 1) totalPages = 1
  const nums = withEllipsis(pageNumbers(page, totalPages))

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 border-t border-[#e8f5ef] px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-1">
        <PaginationLink
          href={page > 1 ? buildListHref(q, status, page - 1) : undefined}
          aria-label="上一页"
          disabled={page <= 1}
        >
          <ChevronLeft className="size-4" />
        </PaginationLink>
        {nums.map((item, i) =>
          item === "gap" ? (
            <span key={`g-${i}`} className="px-2 text-label-sm text-[#94a3b8]">
              …
            </span>
          ) : (
            <PaginationLink key={item} href={buildListHref(q, status, item)} active={item === page}>
              {item}
            </PaginationLink>
          )
        )}
        <PaginationLink
          href={page < totalPages ? buildListHref(q, status, page + 1) : undefined}
          aria-label="下一页"
          disabled={page >= totalPages}
        >
          <ChevronRight className="size-4" />
        </PaginationLink>
      </div>

      <form
        method="get"
        action="/documents"
        className="flex items-center gap-2 text-label-sm text-[#5c7268]"
      >
        {q ? <input type="hidden" name="q" value={q} /> : null}
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <label htmlFor="goto-page" className="shrink-0">
          跳转至
        </label>
        <input
          id="goto-page"
          name="page"
          type="number"
          min={1}
          max={totalPages}
          defaultValue={page}
          className="w-16 rounded-lg border border-[#c8e6d9] bg-white px-2 py-1.5 text-center text-label-sm text-[#1b4332] outline-none focus:border-[#1b4332]"
        />
        <button
          type="submit"
          className="rounded-lg border border-[#c8e6d9] bg-white px-3 py-1.5 font-medium text-[#1b4332] transition-colors hover:bg-[#f4fbf7]"
        >
          前往
        </button>
      </form>
    </div>
  )
}

function PaginationLink({
  href,
  children,
  disabled,
  active,
  "aria-label": ariaLabel,
}: {
  href?: string
  children: ReactNode
  disabled?: boolean
  active?: boolean
  "aria-label"?: string
}) {
  if (disabled || !href) {
    return (
      <span
        className={cn(
          "inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-2 py-1.5 text-label-sm text-[#cbd5e1]"
        )}
        aria-hidden={disabled}
      >
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-2 py-1.5 text-label-sm font-medium transition-colors",
        active ? "bg-[#1b4332] text-white shadow-sm" : "text-[#1b4332] hover:bg-[#c8e6d9]/50"
      )}
    >
      {children}
    </Link>
  )
}
