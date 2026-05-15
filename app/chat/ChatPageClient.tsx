"use client"

import { useCallback, useMemo } from "react"
import type { ChatOnFinishCallback, UIMessage } from "ai"
import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react"
import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk"
import { Thread } from "@/components/assistant-ui/thread"
import { ThreadList } from "@/components/assistant-ui/thread-list"
import { WorkspacePageShell, type WorkspaceUser } from "@/components/workspace/WorkspacePageShell"
import { ComposerDocumentScopeProvider } from "@/app/chat/components/ComposerDocumentScopeContext"
import { composerDocumentScopeRef } from "@/lib/composer-document-scope-ref"
import DocPreview from "./components/DocPreview"
import { useSupabaseChatRuntime } from "./useSupabaseChatRuntime"

export function ChatPageClient({ user }: { user: WorkspaceUser }) {
  const logChatFinish = useCallback<ChatOnFinishCallback<UIMessage>>(
    ({ message, messages, isAbort, isDisconnect, isError, finishReason }) => {
      const answer = message
      let question: UIMessage | undefined
      const aiIdx = messages.findIndex((m) => m.id === answer.id)
      if (aiIdx > 0) {
        const prev = messages[aiIdx - 1]
        if (prev?.role === "user") question = prev
      }
      console.log("[docai] 本轮问答完整数据", {
        finishReason,
        isAbort,
        isDisconnect,
        isError,
        question,
        answer,
        messages,
      })
    },
    []
  )

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: (options) => ({
          ...options,
          body: {
            ...options.body,
            messages: options.messages,
            documentIds: [...composerDocumentScopeRef.current],
          },
        }),
      }),
    []
  )

  const runtime = useSupabaseChatRuntime({
    transport,
    onFinish: logChatFinish,
  })

  const aui = useAui()

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <ComposerDocumentScopeProvider userId={user.id}>
        <WorkspacePageShell
          active="chat"
          user={user}
          sidebarMiddle={<ThreadList />}
          mainClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
        >
          <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
            <div
              className="flex min-h-0 min-w-0 flex-[3] flex-col border-[#c8e6d9]/80 lg:border-r"
              style={{
                backgroundColor: "#f1f6f3",
                backgroundImage: "radial-gradient(circle, #c5d9ce 1px, transparent 1px)",
                backgroundSize: "14px 14px",
              }}
            >
              <div className="chat-thread-host min-h-0 flex-1 [&_.aui-thread-root]:!bg-transparent">
                <Thread userId={user.id} />
              </div>
              <p className="shrink-0 border-t border-[#d4e5dc]/80 bg-white/60 px-4 py-2 text-center text-[11px] leading-snug text-[#7a9084]">
                DocAI 可能产生不完整信息，重要结论请对照原文核实。
              </p>
            </div>
            <div className="flex min-h-0 min-w-0 flex-[1] flex-col border-t border-[#c8e6d9]/40 bg-surface-container-lowest lg:border-l lg:border-t-0">
              <DocPreview />
            </div>
          </div>
        </WorkspacePageShell>
      </ComposerDocumentScopeProvider>
    </AssistantRuntimeProvider>
  )
}
