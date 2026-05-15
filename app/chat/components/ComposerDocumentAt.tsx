"use client"

import { getChatSidebarLists } from "@/app/chat/actions/sidebar"
import { formatDisplayDocId } from "@/app/documents/format"
import { readAtDocumentMruIds } from "@/lib/at-doc-mru"
import type { Document, DocumentStatus } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { useComposerDocumentScope } from "@/app/chat/components/ComposerDocumentScopeContext"
import type { Unstable_TriggerAdapter, Unstable_TriggerItem } from "@assistant-ui/core"
import { ComposerPrimitive } from "@assistant-ui/react"
import { FileTextIcon, Loader2Icon } from "lucide-react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type MutableRefObject,
} from "react"

function AtPopoverHeaderBar({
  readyCount,
  total,
  loading,
}: {
  readyCount: number
  total: number
  loading: boolean
}) {
  const ctx = ComposerPrimitive.unstable_useTriggerPopoverScopeContextOptional()
  if (!ctx?.open) return null
  return (
    <div className="flex items-center justify-between gap-2 border-b border-outline/15 px-3 py-2 text-on-surface-variant text-xs">
      <span className="flex min-w-0 items-center gap-2">
        {loading ? (
          <Loader2Icon
            className="h-3.5 w-3.5 shrink-0 animate-spin text-primary"
            aria-hidden
          />
        ) : null}
        <span className="truncate">文档（MRU 排序 · 支持名称筛选）</span>
      </span>
      <span className="shrink-0 tabular-nums">
        {loading ? "加载中…" : `就绪 ${readyCount}/${total}`}
      </span>
    </div>
  )
}

function statusHint(status: DocumentStatus): string {
  switch (status) {
    case "ready":
      return "就绪"
    case "processing":
      return "处理中"
    case "uploading":
      return "上传中"
    case "failed":
      return "失败"
    default:
      return status
  }
}

function sortReadyByMru(ready: Document[], mruIds: string[]): Document[] {
  const rank = new Map<string, number>()
  mruIds.forEach((id, i) => rank.set(id, i))
  return [...ready].sort((a, b) => {
    const ar = rank.has(a.id) ? rank.get(a.id)! : 1_000_000
    const br = rank.has(b.id) ? rank.get(b.id)! : 1_000_000
    if (ar !== br) return ar - br
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/** Context 仅在 `TriggerPopover` 子树内可用：在此触发首次打开时的列表请求。 */
function AtPopoverFetchOnOpen({
  listLoadedRef,
  onLoadingChange,
  onLoaded,
}: {
  listLoadedRef: MutableRefObject<boolean>
  onLoadingChange: (loading: boolean) => void
  onLoaded: (docs: Document[]) => void
}) {
  const ctx = ComposerPrimitive.unstable_useTriggerPopoverScopeContextOptional()
  const popoverOpen = ctx?.open ?? false

  useLayoutEffect(() => {
    if (!popoverOpen || listLoadedRef.current) return

    let cancelled = false
    onLoadingChange(true)
    ;(async () => {
      try {
        const { documents: list } = await getChatSidebarLists()
        if (!cancelled) {
          onLoaded(list)
          listLoadedRef.current = true
        }
      } catch {
        if (!cancelled) {
          onLoaded([])
          listLoadedRef.current = true
        }
      } finally {
        if (!cancelled) onLoadingChange(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [popoverOpen, listLoadedRef, onLoaded, onLoadingChange])

  return null
}

function AtPopoverLoadingOrList({
  documentsLoading,
  hasFetchedAtList,
  readyCount,
}: {
  documentsLoading: boolean
  hasFetchedAtList: boolean
  readyCount: number
}) {
  const ctx = ComposerPrimitive.unstable_useTriggerPopoverScopeContextOptional()
  const popoverOpen = ctx?.open ?? false

  if (popoverOpen && (!hasFetchedAtList || documentsLoading)) {
    return (
      <div
        className="flex min-h-[8.5rem] flex-col items-center justify-center gap-2 px-3 py-8 text-on-surface-variant text-sm"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <span>正在加载文档列表…</span>
      </div>
    )
  }

  return (
    <ComposerPrimitive.Unstable_TriggerPopoverItems className="max-h-56 overflow-y-auto p-1">
      {(items) =>
        items.length === 0 ? (
          <div className="px-3 py-6 text-center text-on-surface-variant text-sm">
            {readyCount === 0
              ? "暂无已就绪文档，请先在文档库上传并等待解析完成。"
              : "没有匹配的文档，请尝试其它文件名。"}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map((item, index) => (
              <li key={item.id}>
                <ComposerPrimitive.Unstable_TriggerPopoverItem
                  item={item}
                  index={index}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-start text-sm",
                    "text-on-surface hover:bg-primary/8 data-[highlighted]:bg-primary/12"
                  )}
                >
                  <FileTextIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.label}</span>
                    {item.description ? (
                      <span className="mt-0.5 block truncate text-on-surface-variant text-xs">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </ComposerPrimitive.Unstable_TriggerPopoverItem>
              </li>
            ))}
          </ul>
        )
      }
    </ComposerPrimitive.Unstable_TriggerPopoverItems>
  )
}

export const ComposerDocumentAtPopover: FC<{ userId: string }> = ({ userId }) => {
  const { addScopedId } = useComposerDocumentScope()
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [hasFetchedAtList, setHasFetchedAtList] = useState(false)
  const listLoadedRef = useRef(false)
  const [mruIds, setMruIds] = useState<string[]>(() => readAtDocumentMruIds(userId))

  const onAtDocumentsLoaded = useCallback((docs: Document[]) => {
    setDocuments(docs)
    setHasFetchedAtList(true)
  }, [])

  const refreshMru = useCallback(() => {
    setMruIds(readAtDocumentMruIds(userId))
  }, [userId])

  useEffect(() => {
    setMruIds(readAtDocumentMruIds(userId))
  }, [userId])

  const { readyDocs, readyCount, total } = useMemo(() => {
    const ready = documents.filter((d) => d.status === "ready")
    return {
      readyDocs: sortReadyByMru(ready, mruIds),
      readyCount: ready.length,
      total: documents.length,
    }
  }, [documents, mruIds])

  const triggerItems: Unstable_TriggerItem[] = useMemo(
    () =>
      readyDocs.map((d) => ({
        id: d.id,
        type: "document",
        label: d.file_name,
        description: `${formatDisplayDocId(d.id)} · ${statusHint(d.status)}`,
      })),
    [readyDocs]
  )

  const adapter = useMemo<Unstable_TriggerAdapter>(() => {
    return {
      categories: () => [],
      categoryItems: () => [],
      search: (query: string) => {
        const lower = query.trim().toLowerCase()
        if (!lower) return triggerItems
        return triggerItems.filter((item) => {
          const id = item.id.toLowerCase()
          const label = item.label.toLowerCase()
          const desc = item.description?.toLowerCase() ?? ""
          return label.includes(lower) || desc.includes(lower) || id.includes(lower)
        })
      },
    }
  }, [triggerItems])

  const onSelectDocument = useCallback(
    (item: Unstable_TriggerItem) => {
      addScopedId(item.id)
      refreshMru()
    },
    [addScopedId, refreshMru]
  )

  return (
    <ComposerPrimitive.Unstable_TriggerPopover
      char="@"
      adapter={adapter}
      className={cn(
        "aui-doc-at-popover z-30 mb-1 max-h-72 w-full min-w-[min(100%,20rem)] overflow-hidden rounded-xl border border-outline/25 bg-surface-container-lowest shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1 duration-150"
      )}
    >
      <ComposerPrimitive.Unstable_TriggerPopover.Action
        removeOnExecute
        onExecute={onSelectDocument}
      />
      <AtPopoverFetchOnOpen
        listLoadedRef={listLoadedRef}
        onLoadingChange={setDocumentsLoading}
        onLoaded={onAtDocumentsLoaded}
      />
      <AtPopoverHeaderBar
        readyCount={readyCount}
        total={total}
        loading={!hasFetchedAtList || documentsLoading}
      />
      <AtPopoverLoadingOrList
        documentsLoading={documentsLoading}
        hasFetchedAtList={hasFetchedAtList}
        readyCount={readyCount}
      />
      {documents.some((d) => d.status !== "ready") ? (
        <div className="border-t border-outline/15 px-3 py-2 text-on-surface-variant text-[11px] leading-snug">
          未就绪的文档不会出现在上列表中；处理完成后用 @ 即可引用。
        </div>
      ) : null}
    </ComposerPrimitive.Unstable_TriggerPopover>
  )
}
