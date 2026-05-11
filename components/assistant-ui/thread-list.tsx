import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AuiIf,
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react"
import { ArchiveIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react"
import type { FC } from "react"

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
      <ThreadListNew />
      <AuiIf condition={(s) => s.threads.isLoading}>
        <ThreadListSkeleton />
      </AuiIf>
      <AuiIf condition={(s) => !s.threads.isLoading}>
        <ThreadListPrimitive.Items>{() => <ThreadListItem />}</ThreadListPrimitive.Items>
      </AuiIf>
    </ThreadListPrimitive.Root>
  )
}

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        className="aui-thread-list-new h-9 justify-start gap-2 rounded-lg px-3 text-sm hover:bg-oklch(0.97 0 0) data-active:bg-oklch(0.97 0 0) dark:hover:bg-oklch(0.269 0 0) dark:data-active:bg-oklch(0.269 0 0)"
      >
        <PlusIcon className="size-4" />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  )
}

const ThreadListSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          className="aui-thread-list-skeleton-wrapper flex h-9 items-center px-3"
        >
          <Skeleton className="aui-thread-list-skeleton h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item group flex h-9 items-center gap-2 rounded-lg transition-colors hover:bg-oklch(0.97 0 0) focus-visible:bg-oklch(0.97 0 0) focus-visible:outline-none data-active:bg-oklch(0.97 0 0) dark:hover:bg-oklch(0.269 0 0) dark:focus-visible:bg-oklch(0.269 0 0) dark:data-active:bg-oklch(0.269 0 0)">
      <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger flex h-full min-w-0 flex-1 items-center px-3 text-start text-sm">
        <span className="aui-thread-list-item-title min-w-0 flex-1 truncate">
          <ThreadListItemPrimitive.Title fallback="New Chat" />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemMore />
    </ThreadListItemPrimitive.Root>
  )
}

const ThreadListItemMore: FC = () => {
  return (
    <ThreadListItemMorePrimitive.Root>
      <ThreadListItemMorePrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="aui-thread-list-item-more me-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:bg-oklch(0.97 0 0) data-[state=open]:opacity-100 group-data-active:opacity-100 dark:data-[state=open]:bg-oklch(0.269 0 0)"
        >
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">More options</span>
        </Button>
      </ThreadListItemMorePrimitive.Trigger>
      <ThreadListItemMorePrimitive.Content
        side="bottom"
        align="start"
        className="aui-thread-list-item-more-content z-50 min-w-32 overflow-hidden rounded-md border border-oklch(0.922 0 0) bg-oklch(1 0 0) p-1 text-oklch(0.145 0 0) shadow-md dark:border-oklch(1 0 0 / 10%) dark:bg-oklch(0.205 0 0) dark:text-oklch(0.985 0 0)"
      >
        <ThreadListItemPrimitive.Archive asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-oklch(0.97 0 0) hover:text-oklch(0.205 0 0) focus:bg-oklch(0.97 0 0) focus:text-oklch(0.205 0 0) dark:hover:bg-oklch(0.269 0 0) dark:hover:text-oklch(0.985 0 0) dark:focus:bg-oklch(0.269 0 0) dark:focus:text-oklch(0.985 0 0)">
            <ArchiveIcon className="size-4" />
            Archive
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Archive>
        <ThreadListItemPrimitive.Delete asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-oklch(0.577 0.245 27.325) text-sm outline-none hover:bg-oklch(0.577 0.245 27.325)/10 hover:text-oklch(0.577 0.245 27.325) focus:bg-oklch(0.577 0.245 27.325)/10 focus:text-oklch(0.577 0.245 27.325) dark:text-oklch(0.704 0.191 22.216) dark:hover:bg-oklch(0.704 0.191 22.216)/10 dark:hover:text-oklch(0.704 0.191 22.216) dark:focus:bg-oklch(0.704 0.191 22.216)/10 dark:focus:text-oklch(0.704 0.191 22.216)">
            <TrashIcon className="size-4" />
            Delete
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Delete>
      </ThreadListItemMorePrimitive.Content>
    </ThreadListItemMorePrimitive.Root>
  )
}
