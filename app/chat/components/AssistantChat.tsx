"use client";

import { useCallback, useState } from "react";
import type { ChatOnFinishCallback, UIMessage } from "ai";
import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react";
import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { useSupabaseChatRuntime } from "../useSupabaseChatRuntime";

export default function AssistantChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const logChatFinish = useCallback<ChatOnFinishCallback<UIMessage>>(
    ({ message, messages, isAbort, isDisconnect, isError, finishReason }) => {
      const answer = message;
      let question: UIMessage | undefined;
      const aiIdx = messages.findIndex((m) => m.id === answer.id);
      if (aiIdx > 0) {
        const prev = messages[aiIdx - 1];
        if (prev?.role === "user") question = prev;
      }
      console.log("[docai] 本轮问答完整数据", {
        finishReason,
        isAbort,
        isDisconnect,
        isError,
        question,
        answer,
        messages,
      });
    },
    [],
  );

  const runtime = useSupabaseChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    onFinish: logChatFinish,
  });

  const aui = useAui();

  // if (!isChatStarted) {
  //   return (
  //     <div className="flex min-h-0 flex-1 items-center justify-center bg-background">
  //       <button
  //         onClick={() => setIsChatStarted(true)}
  //         className="px-6 py-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors text-body-lg"
  //       >
  //         开始对话
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isSidebarOpen && (
          <>
            <aside className="hidden md:flex md:w-72 border-r border-outline/20 bg-surface-container-lowest flex-col shrink-0 min-h-0">
              <ChatSidebar />
            </aside>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex md:w-6 items-center justify-center border-r border-outline/20 bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
              title="隐藏侧边栏"
            >
              <ChevronLeftIcon className="size-4 text-on-surface-variant" />
            </button>
          </>
        )}
        
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex md:w-6 items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
            title="显示侧边栏"
          >
            <ChevronRightIcon className="size-4 text-on-surface-variant" />
          </button>
        )}

        <div className="flex min-h-0 flex-1 justify-center">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}