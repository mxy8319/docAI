"use client";

import { useAuiState, type AssistantState } from "@assistant-ui/react";
import { type FC, memo } from "react";
import { useCitationPreview } from "@/app/chat/components/CitationPreviewContext";
import { readRagCitationsFromMessageMetadata } from "@/lib/rag-citations-metadata";
import { cn } from "@/lib/utils";

/** Lists RAG retrieval chunks as chips; complements inline [n] links in the markdown body. */
export const RagSourceChips: FC = memo(function RagSourceChips() {
  const { openCitation } = useCitationPreview();
  const cites = useAuiState((s: AssistantState) =>
    readRagCitationsFromMessageMetadata(s.message.metadata),
  );

  if (!cites?.length) return null;
  
  return (
    <div className="mt-3 border-t border-outline/15 pt-3" data-slot="aui_rag_sources">
      <p className="mb-2 text-label-sm font-medium text-on-surface-variant">参考片段</p>
      <div className="flex flex-wrap gap-1.5">
        {cites.map((c, i) => (
          <button
            key={`${c.chunk_id}-${i}`}
            type="button"
            onClick={() => openCitation(c)}
            className={cn(
              "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-outline/25 bg-surface-container px-2.5 py-1 text-left text-label-sm text-primary transition-colors hover:border-primary/40 hover:bg-primary/5",
            )}
            title={c.source_title?.trim() || c.file_name}
          >
            <span className="shrink-0 font-mono tabular-nums text-on-surface-variant">[{i + 1}]</span>
            <span className="min-w-0 truncate">{c.file_name}</span>
            {c.page_number != null ? (
              <span className="shrink-0 text-on-surface-variant">· 第{c.page_number}页</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
});
