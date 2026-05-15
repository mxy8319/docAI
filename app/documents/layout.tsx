import type { ReactNode } from "react"
import Link from "next/link"
import { LibraryUpload } from "./components/LibraryUpload"
import { FileText, MessageSquare, TreePine } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { signOut } from "@/app/chat/actions"

export default async function DocumentsLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const metadata = user.user_metadata ?? {}

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef7f2] text-[#1b4332]">
      <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[#c8e6d9] bg-[#e8f5ef]">
        <div className="flex items-center gap-2 border-b border-[#c8e6d9] px-5 py-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1b4332] text-white shadow-sm">
            <TreePine className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-label-sm font-semibold text-[#1b4332]">DocAI</p>
            <p className="truncate text-label-xs text-[#5c7268]">文档库</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="主导航">
          <Link
            href="/documents"
            className="flex items-center gap-3 rounded-xl bg-[#c8e6d9]/70 px-3 py-2.5 text-label-sm font-semibold text-[#004d40] shadow-sm"
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            文档列表
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-label-sm font-medium text-[#5c7268] transition-colors hover:bg-white/60 hover:text-[#1b4332]"
          >
            <MessageSquare className="size-4 shrink-0" aria-hidden />
            对话
          </Link>
        </nav>

        <div className="mt-auto border-t border-[#c8e6d9] p-4">
          <LibraryUpload />
        </div>

        <div className="border-t border-[#c8e6d9] p-4">
          <div className="mb-3 flex items-center gap-2">
            {metadata.avatar_url ? (
              <img
                src={metadata.avatar_url as string}
                alt=""
                className="size-9 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-white/80 text-label-sm font-semibold text-[#1b4332] ring-2 ring-white">
                {(user.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-xs font-medium text-[#1b4332]">
                {metadata.name || metadata.user_name || user.email}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg border border-[#c8e6d9] bg-white/70 px-3 py-2 text-label-sm font-medium text-[#5c7268] transition-colors hover:bg-white hover:text-[#1b4332]"
            >
              退出登录
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#c8e6d9]/80 bg-white/70 px-6 backdrop-blur-sm">
          <span className="text-label-md font-semibold tracking-tight text-[#1b4332]">DocAI</span>
          <div className="flex items-center gap-2">
            {metadata.avatar_url ? (
              <img
                src={metadata.avatar_url as string}
                alt=""
                className="size-8 rounded-full object-cover ring-1 ring-[#c8e6d9]"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e8f5ef] text-label-xs font-semibold text-[#1b4332]">
                {(user.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
