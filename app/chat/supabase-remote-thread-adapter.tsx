"use client";

import type {
  GenericThreadHistoryAdapter,
  MessageFormatAdapter,
  MessageFormatItem,
  RemoteThreadListAdapter,
  ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { RuntimeAdapterProvider, useAui } from "@assistant-ui/react";
import type { UIMessage } from "ai";
import { createAssistantStream } from "assistant-stream";
import type { FC, PropsWithChildren } from "react";
import { useMemo } from "react";
import type { MessageRole } from "@/lib/database.types";
import type { AiSdkMessageStorageEntry } from "./thread-remote-actions";
import {
  remoteAppendThreadMessage,
  remoteArchiveThread,
  remoteDeleteThread,
  remoteFetchThread,
  remoteInitializeThread,
  remoteListThreads,
  remoteLoadThreadMessages,
  remoteRenameThread,
  remoteUnarchiveThread,
  remoteUpdateThreadMessage,
} from "./thread-remote-actions";

class SupabaseThreadHistoryBridge implements ThreadHistoryAdapter {
  constructor(private readonly aui: ReturnType<typeof useAui>) {}

  async load() {
    return { messages: [] };
  }

  async append(): Promise<void> {
    return;
  }

  withFormat<TMessage, TStorageFormat extends Record<string, unknown>>(
    formatAdapter: MessageFormatAdapter<TMessage, TStorageFormat>,
  ): GenericThreadHistoryAdapter<TMessage> {
    const aui = this.aui;
    return {
      async load() {
        const remoteId = aui.threadListItem().getState().remoteId;
        if (!remoteId) return { messages: [] };
        return remoteLoadThreadMessages(remoteId) as Promise<{
          headId?: string | null;
          messages: MessageFormatItem<TMessage>[];
        }>;
      },

      async append(item: MessageFormatItem<TMessage>) {
        await aui.threadListItem().initialize();
        const remoteId = aui.threadListItem().getState().remoteId;
        if (!remoteId) return;
        const ui = item.message as unknown as UIMessage;
        const role = ui.role as MessageRole;
        const entry = encodeForStorage(formatAdapter, item);
        await remoteAppendThreadMessage({ sessionId: remoteId, entry, role });
      },

      async update(item: MessageFormatItem<TMessage>, localMessageId: string) {
        const remoteId = aui.threadListItem().getState().remoteId;
        if (!remoteId) return;
        const ui = item.message as unknown as UIMessage;
        const role = ui.role as MessageRole;
        const entry = encodeForStorage(formatAdapter, item);
        await remoteUpdateThreadMessage({
          sessionId: remoteId,
          messageId: localMessageId,
          entry,
          role,
        });
      },
    };
  }
}

function encodeForStorage<TMessage, TStorageFormat extends Record<string, unknown>>(
  formatAdapter: MessageFormatAdapter<TMessage, TStorageFormat>,
  item: MessageFormatItem<TMessage>,
): AiSdkMessageStorageEntry {
  const encoded = formatAdapter.encode(item);
  return {
    id: formatAdapter.getId(item.message),
    parent_id: item.parentId,
    format: formatAdapter.format as AiSdkMessageStorageEntry["format"],
    content: encoded as Record<string, unknown>,
  };
}

const SupabaseThreadHistoryProvider: FC<PropsWithChildren> = ({ children }) => {
  const aui = useAui();
  const history = useMemo(() => new SupabaseThreadHistoryBridge(aui), [aui]);
  const adapters = useMemo(() => ({ history }), [history]);
  return <RuntimeAdapterProvider adapters={adapters}>{children}</RuntimeAdapterProvider>;
};

export const supabaseRemoteThreadListAdapter: RemoteThreadListAdapter = {
  list: remoteListThreads,
  rename: remoteRenameThread,
  archive: remoteArchiveThread,
  unarchive: remoteUnarchiveThread,
  delete: remoteDeleteThread,
  initialize: remoteInitializeThread,
  fetch: remoteFetchThread,
  generateTitle: async () => createAssistantStream(() => {}),
  unstable_Provider: SupabaseThreadHistoryProvider,
};
