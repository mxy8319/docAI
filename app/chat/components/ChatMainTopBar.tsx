"use client"

import { Bell, HelpCircle, Search } from "lucide-react"

type ChatMainTopBarProps = {
  userName?: string | null
}

export function ChatMainTopBar({ userName }: ChatMainTopBarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-[#d4e5dc] bg-white/90 px-5 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-label-md font-bold tracking-tight text-[#1b4332] sm:text-headline-md">
          DocAI
        </h1>
        <p className="mt-0.5 truncate text-label-xs text-[#5c7268] sm:text-label-sm">
          基于你的文档库提问，回答将引用库内片段。
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-end gap-2 sm:max-w-xl">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
            aria-hidden
          />
          <input
            type="search"
            readOnly
            placeholder="搜索会话与消息…"
            className="w-full cursor-default rounded-xl border border-[#c8e6d9] bg-[#f8fdf9] py-2 pl-10 pr-3 text-label-sm text-[#1b4332] outline-none placeholder:text-[#94a3b8]"
            aria-label="搜索（即将推出）"
          />
        </div>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#c8e6d9] bg-white text-[#5c7268] transition-colors hover:bg-[#f4fbf7]"
          aria-label="通知"
        >
          <Bell className="size-4" />
        </button>
        <button
          type="button"
          className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-[#c8e6d9] bg-white text-[#5c7268] transition-colors hover:bg-[#f4fbf7] sm:flex"
          aria-label="帮助"
        >
          <HelpCircle className="size-4" />
        </button>
        <div
          className="hidden max-w-[8rem] truncate text-right text-label-xs text-[#5c7268] sm:block"
          title={userName ?? undefined}
        >
          {userName ? `Hi，${userName.split("@")[0]}` : ""}
        </div>
      </div>
    </div>
  )
}
