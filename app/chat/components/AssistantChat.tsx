"use client";

import { useState } from "react";
import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function AssistantChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatStarted, setIsChatStarted] = useState(false);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  const aui = useAui();

  if (!isChatStarted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <button
          onClick={() => setIsChatStarted(true)}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors text-body-lg"
        >
          开始对话
        </button>
      </div>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && (
          <>
            <aside className="hidden md:flex md:w-56 border-r border-outline/20 bg-surface-container-lowest flex-col shrink-0">
              <div className="flex-1 overflow-y-auto">
                <ThreadList />
              </div>
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

        <div className="flex-1 flex justify-center">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}