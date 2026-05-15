"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { FileText, MessageSquare, TreePine } from "lucide-react"
import { LibraryUpload } from "@/app/documents/components/LibraryUpload"
import { signOut } from "@/app/chat/actions"
import { cn } from "@/lib/utils"

export type WorkspaceUser = {
  email: string | undefined
  name: string | null | undefined
  image: string | null | undefined
}

type Active = "documents" | "chat"

export function WorkspacePageShell({
  active,
  user,
  sidebarMiddle,
  children,
  mainClassName = "p-6 lg:p-8",
}: {
  active: Active
  user: WorkspaceUser
  sidebarMiddle?: ReactNode
  children: ReactNode
  /** Main column inner wrapper（对话页为全宽内容区） */
  mainClassName?: string
}) {
  const displayName = user.name || user.email || "用户"
  const initial = (user.email ?? "?").slice(0, 1).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef7f2] text-[#1b4332]">
      <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[#c8e6d9] bg-[#e8f5ef]">
        <div className="flex items-center gap-2 border-b border-[#c8e6d9] px-5 py-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1b4332] text-white shadow-sm">
            <TreePine className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-label-sm font-semibold text-[#1b4332]">DocAI</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c7268]">
              智能文档
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="主导航">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a9084]">
            主导航
          </p>
          <Link
            href="/documents"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-label-sm font-medium transition-colors",
              active === "documents"
                ? "bg-[#1b4332] font-semibold text-white shadow-sm"
                : "text-[#5c7268] hover:bg-white/60 hover:text-[#1b4332]"
            )}
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            文档列表
          </Link>
          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-label-sm font-medium transition-colors",
              active === "chat"
                ? "bg-[#1b4332] font-semibold text-white shadow-sm"
                : "text-[#5c7268] hover:bg-white/60 hover:text-[#1b4332]"
            )}
          >
            <MessageSquare className="size-4 shrink-0" aria-hidden />
            对话
          </Link>
        </nav>

        {sidebarMiddle != null ? (
          <div className="flex min-h-0 flex-1 flex-col border-t border-[#c8e6d9]/80 px-1 pt-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a9084]">
              最近会话
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-1 pb-2">
              {sidebarMiddle}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1" aria-hidden />
        )}

        <div className="mt-auto border-t border-[#c8e6d9] p-4">
          <LibraryUpload />
        </div>

        <div className="border-t border-[#c8e6d9] p-4">
          <div className="mb-3 flex items-center gap-2">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="size-9 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-white/80 text-label-sm font-semibold text-[#1b4332] ring-2 ring-white">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-xs font-medium text-[#1b4332]">{displayName}</p>
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
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="size-8 rounded-full object-cover ring-1 ring-[#c8e6d9]"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e8f5ef] text-label-xs font-semibold text-[#1b4332]">
                {initial}
              </div>
            )}
          </div>
        </header>
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", mainClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
