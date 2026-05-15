import { Search } from "lucide-react"

export function LibrarySearchBar({
  defaultQ,
  status,
}: {
  defaultQ: string
  /** Current status filter — preserved when searching */
  status?: string
}) {
  return (
    <form method="get" action="/documents" className="flex w-full max-w-md items-center gap-2">
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <input type="hidden" name="page" value="1" />
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5c7268]"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultQ}
          placeholder="搜索文档名称…"
          className="w-full rounded-xl border border-[#c8e6d9] bg-white py-2.5 pl-10 pr-3 text-label-sm text-[#1b4332] shadow-sm outline-none ring-[#1b4332]/20 placeholder:text-[#94a3b8] focus:border-[#1b4332] focus:ring-2"
          autoComplete="off"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-[#1b4332] px-4 py-2.5 text-label-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e22]"
      >
        搜索
      </button>
    </form>
  )
}
