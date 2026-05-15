import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { getDocumentsPaginated } from "@/lib/db"
import type { DocumentStatus } from "@/lib/database.types"
import { LibraryToolbar } from "./components/LibraryToolbar"
import { LibrarySearchBar } from "./components/LibrarySearchBar"
import { DocumentsTable } from "./components/DocumentsTable"
import { DocumentsPagination } from "./components/DocumentsPagination"

const PAGE_SIZE = 10

function parseStatus(raw: string | undefined): DocumentStatus | undefined {
  if (!raw) return undefined
  if (["uploading", "processing", "ready", "failed"].includes(raw)) {
    return raw as DocumentStatus
  }
  return undefined
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const rawPage = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page, 10) : 1
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const q = typeof searchParams.q === "string" ? searchParams.q : ""
  const status = parseStatus(
    typeof searchParams.status === "string" ? searchParams.status : undefined
  )

  const { documents, total, totalPages, pageSize } = await getDocumentsPaginated(user.id, {
    page,
    pageSize: PAGE_SIZE,
    status,
    search: q.trim() || undefined,
  })

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col">
      <nav className="mb-2 shrink-0 text-label-sm text-[#5c7268]" aria-label="面包屑">
        <span className="text-[#94a3b8]">工作台</span>
        <span className="mx-1.5 text-[#cbd5e1]">/</span>
        <span className="font-medium text-[#1b4332]">文档库</span>
      </nav>

      <div className="mb-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-lg font-bold tracking-tight text-[#1b4332]">我的文档库</h1>
          <p className="mt-1 text-body-md text-[#5c7268]">
            管理已上传的 PDF，查看解析进度并进入对话。
          </p>
        </div>
        <LibrarySearchBar defaultQ={q} status={status} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#c8e6d9] bg-white shadow-[0_8px_30px_rgba(27,67,50,0.06)]">
        <Suspense fallback={null}>
          <LibraryToolbar total={total} page={page} pageSize={pageSize} />
        </Suspense>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
          <DocumentsTable documents={documents} />
        </div>
        {total > 0 && (
          <div className="shrink-0">
            <DocumentsPagination
              page={page}
              totalPages={totalPages}
              q={q || undefined}
              status={status}
            />
          </div>
        )}
      </div>
    </div>
  )
}
