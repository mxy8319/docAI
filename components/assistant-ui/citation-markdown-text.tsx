"use client"

import "@assistant-ui/react-markdown/styles/dot.css"

import {
  MarkdownTextPrimitive,
  type MarkdownTextPrimitiveProps,
} from "@assistant-ui/react-markdown"
import { useAuiState, type AssistantState } from "@assistant-ui/react"
import remarkGfm from "remark-gfm"
import { type AnchorHTMLAttributes, type FC, memo } from "react"
import { useCitationPreview } from "@/app/chat/components/CitationPreviewContext"
import { remarkCitationRefLinks } from "@/lib/remark-citation-ref-links"
import { readRagCitationsFromMessageMetadata } from "@/lib/rag-citations-metadata"
import { cn } from "@/lib/utils"
import { markdownDefaultComponents } from "./markdown-text"

type CitationAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  node?: unknown
}

const { a: _defaultMarkdownAnchor, ...markdownComponentsWithoutA } = markdownDefaultComponents
void _defaultMarkdownAnchor

/** Resolve `#cite-n` from `href` (remark may yield relative `#...` or absolute `.../path#cite-n`). */
function parseCiteIndexFromHref(href: string | undefined): number | undefined {
  if (!href) return undefined
  try {
    const u = new URL(href, "http://localhost")
    const m = /^#cite-(\d+)$/.exec(u.hash)
    if (!m) return undefined
    const n = Number.parseInt(m[1]!, 10)
    return Number.isFinite(n) ? n : undefined
  } catch {
    const m = /#cite-(\d+)/.exec(href)
    if (!m) return undefined
    const n = Number.parseInt(m[1]!, 10)
    return Number.isFinite(n) ? n : undefined
  }
}

/**
 * Must NOT be passed through `memoizeMarkdownComponents`: that helper wraps renderers in
 * `React.memo` that only compares the mdast `node`. When `ragCitations` arrives on
 * `message.metadata` without the link node changing, memo would skip re-renders and the
 * anchor would keep stale closures (e.g. still render as plain `<a href="#cite-n">`).
 */
const CitationAnchor: FC<CitationAnchorProps> = ({
  href,
  className,
  children,
  node: _node,
  ...props
}) => {
  const { openCitation } = useCitationPreview()
  const ragCitations = useAuiState((s: AssistantState) =>
    readRagCitationsFromMessageMetadata(s.message.metadata)
  )

  const n = parseCiteIndexFromHref(href)
  if (n != null) {
    const cite =
      ragCitations?.length && n >= 1 && n <= ragCitations.length ? ragCitations[n - 1] : undefined
    if (cite) {
      return (
        <button
          type="button"
          className={cn(
            "inline cursor-pointer border-0 bg-transparent p-0 font-inherit text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary",
            className
          )}
          onClick={(e) => {
            e.preventDefault()
            openCitation(cite)
          }}
        >
          {children}
        </button>
      )
    }
    return (
      <span
        role="button"
        tabIndex={0}
        className={cn(
          "inline cursor-not-allowed border-b border-dashed border-on-surface-variant/50 font-inherit text-on-surface-variant underline-offset-2",
          className
        )}
        title={
          ragCitations?.length
            ? `引用 [${n}] 超出本次检索片段数量（共 ${ragCitations.length} 条）`
            : "未加载到检索引用数据，无法打开出处预览"
        }
        onClick={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") e.preventDefault()
        }}
      >
        {children}
      </span>
    )
  }

  return (
    <a
      className={cn(
        "aui-md-a text-oklch(0.205 0 0) underline underline-offset-2 hover:text-oklch(0.205 0 0)/80 dark:text-oklch(0.922 0 0) dark:hover:text-oklch(0.922 0 0)/80",
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </a>
  )
}

const citationMarkdownComponents = {
  ...markdownComponentsWithoutA,
  a: CitationAnchor,
} as NonNullable<MarkdownTextPrimitiveProps["components"]>

const CitationMarkdownTextImpl: FC = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkCitationRefLinks, remarkGfm]}
      className="aui-md"
      components={citationMarkdownComponents}
    />
  )
}

export const CitationMarkdownText = memo(CitationMarkdownTextImpl)
