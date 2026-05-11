"use client"

import { useChat, type UIMessage } from "@ai-sdk/react"
import {
  useRemoteThreadListRuntime,
  useAui,
  useAuiState,
  type AssistantState,
} from "@assistant-ui/react"
import {
  AssistantChatTransport,
  useAISDKRuntime,
  type UseChatRuntimeOptions,
} from "@assistant-ui/react-ai-sdk"
import type { ChatInit, ChatTransport } from "ai"
import { useEffect, useMemo, useRef } from "react"
import { supabaseRemoteThreadListAdapter } from "./supabase-remote-thread-adapter"

const useDynamicChatTransport = <UI_MESSAGE extends UIMessage = UIMessage>(
  transport: ChatTransport<UI_MESSAGE>
): ChatTransport<UI_MESSAGE> => {
  const transportRef = useRef<ChatTransport<UI_MESSAGE>>(transport)
  useEffect(() => {
    transportRef.current = transport
  })
  const dynamicTransport = useMemo(
    () =>
      new Proxy(transportRef.current, {
        get(_, prop) {
          const res = transportRef.current[prop as keyof ChatTransport<UI_MESSAGE>]
          return typeof res === "function" ? res.bind(transportRef.current) : res
        },
      }),
    []
  )
  return dynamicTransport
}

function useSupabaseChatThreadRuntime<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: UseChatRuntimeOptions<UI_MESSAGE>
) {
  const { adapters, transport: transportOptions, toCreateMessage, ...chatOptions } = options ?? {}

  const transport = useDynamicChatTransport(
    transportOptions ?? new AssistantChatTransport<UI_MESSAGE>()
  )

  const id = useAuiState((s: AssistantState) => s.threadListItem.id)
  const aui = useAui()
  const chat = useChat<UI_MESSAGE>({
    ...(chatOptions as ChatInit<UI_MESSAGE>),
    id,
    transport,
  })

  const runtime = useAISDKRuntime(chat, {
    adapters,
    ...(toCreateMessage && { toCreateMessage }),
  })

  if (transport instanceof AssistantChatTransport) {
    transport.setRuntime(runtime)
    transport.__internal_setGetThreadListItem(() =>
      aui.threadListItem.source ? aui.threadListItem() : undefined
    )
  }

  return runtime
}

export function useSupabaseChatRuntime<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: UseChatRuntimeOptions<UI_MESSAGE>
) {
  return useRemoteThreadListRuntime({
    runtimeHook: function SupabaseChatRuntimeHook() {
      return useSupabaseChatThreadRuntime(options)
    },
    adapter: supabaseRemoteThreadListAdapter,
    allowNesting: true,
  })
}
