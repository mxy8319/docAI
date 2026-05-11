"use client";

import type { Citation } from "@/lib/database.types";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { fetchChunkPreview } from "../actions";

export type CitationPreviewState =
  | { status: "idle" }
  | { status: "loading"; citation: Citation }
  | { status: "ready"; citation: Citation; fullContent: string | null };

type CitationPreviewContextValue = {
  state: CitationPreviewState;
  openCitation: (citation: Citation) => void;
  clear: () => void;
};

const CitationPreviewContext = createContext<CitationPreviewContextValue | null>(null);

export function CitationPreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CitationPreviewState>({ status: "idle" });

  const openCitation = useCallback((citation: Citation) => {

    console.log("citation", citation);
    setState({ status: "loading", citation });
    void fetchChunkPreview(citation.chunk_id)
      .then((row) => {
        setState({
          status: "ready",
          citation,
          fullContent: row?.content ?? null,
        });
      })
      .catch(() => {
        setState({ status: "ready", citation, fullContent: null });
      });
  }, []);

  const clear = useCallback(() => setState({ status: "idle" }), []);

  const value = useMemo(
    () => ({
      state,
      openCitation,
      clear,
    }),
    [state, openCitation, clear],
  );

  return <CitationPreviewContext.Provider value={value}>{children}</CitationPreviewContext.Provider>;
}

export function useCitationPreview(): CitationPreviewContextValue {
  const ctx = useContext(CitationPreviewContext);
  if (!ctx) {
    throw new Error("useCitationPreview must be used within CitationPreviewProvider");
  }
  return ctx;
}
