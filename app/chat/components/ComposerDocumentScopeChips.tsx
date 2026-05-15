"use client"

import { useComposerDocumentScope } from "@/app/chat/components/ComposerDocumentScopeContext"
import { cn } from "@/lib/utils"
import { FileTextIcon, XIcon } from "lucide-react"
import type { FC } from "react"

export const ComposerDocumentScopeChips: FC = () => {
  const { scopedIds, documents, removeScopedId } = useComposerDocumentScope()
  const docById = new Map(documents.map((d) => [d.id, d]))

  if (scopedIds.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-1.5 px-0.5 pb-1"
      role="list"
      aria-label="已选文档范围"
    >
      {scopedIds.map((id) => {
        const doc = docById.get(id)
        const title = doc?.file_name ?? id
        return (
          <span
            key={id}
            role="listitem"
            title={title}
            className={cn(
              "inline-flex max-w-[min(100%,14rem)] items-center gap-1 rounded-lg border border-primary/25",
              "bg-primary/8 py-0.5 ps-2 pe-1 text-xs text-on-surface"
            )}
          >
            <FileTextIcon className="h-3 w-3 shrink-0 text-primary" aria-hidden />
            <span className="truncate font-medium">{title}</span>
            <button
              type="button"
              onClick={() => removeScopedId(id)}
              className="rounded-md p-0.5 text-on-surface-variant hover:bg-primary/15 hover:text-on-surface"
              aria-label={`移除 ${title}`}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        )
      })}
    </div>
  )
}
