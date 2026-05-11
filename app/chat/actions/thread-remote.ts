"use server";

import type { UIMessage } from "ai";
import type { MessageRole } from "@/lib/database.types";
import {
  createSession,
  deleteSession,
  getSession,
  getSessionMessages,
  getSessions,
  saveMessage,
  setSessionArchived,
  touchSession,
  updateChatMessage,
  updateSessionTitle,
} from "@/lib/db";
import { createClient } from "@/lib/supabase-server";

const AI_SDK_FORMAT = "ai-sdk/v6" as const;

export type AiSdkMessageStorageEntry = {
  id: string;
  parent_id: string | null;
  format: typeof AI_SDK_FORMAT;
  content: Record<string, unknown>;
};

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function requireUserId(): Promise<string> {
  const id = await getUserId();
  if (!id) throw new Error("Unauthorized");
  return id;
}

async function requireOwnSession(userId: string, sessionId: string) {
  const s = await getSession(sessionId);
  if (!s || s.user_id !== userId) throw new Error("Forbidden");
  return s;
}

function textFromUiMessage(msg: UIMessage): string {
  const parts = msg.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof (p as { text?: string }).text === "string")
    .map((p) => p.text)
    .join("\n");
}

function decodeStoredEntry(entry: AiSdkMessageStorageEntry): { parentId: string | null; message: UIMessage } {
  return {
    parentId: entry.parent_id,
    message: {
      id: entry.id,
      ...entry.content,
    } as UIMessage,
  };
}

export async function remoteListThreads(): Promise<{
  threads: Array<{
    remoteId: string;
    externalId: string | undefined;
    status: "regular" | "archived";
    title?: string;
    custom?: Record<string, unknown> | undefined;
  }>;
}> {
  const userId = await getUserId();
  if (!userId) return { threads: [] };
  const sessions = await getSessions(userId);
  return {
    threads: sessions.map((s) => ({
      remoteId: s.id,
      externalId: undefined,
      status: s.is_archived ? "archived" : "regular",
      title: s.title ?? undefined,
    })),
  };
}

export async function remoteInitializeThread(
  _localThreadId: string,
): Promise<{ remoteId: string; externalId: string | undefined }> {
  const userId = await requireUserId();
  const session = await createSession(userId, "新对话");
  await touchSession(session.id);
  return { remoteId: session.id, externalId: undefined };
}

export async function remoteFetchThread(remoteId: string): Promise<{
  remoteId: string;
  externalId: string | undefined;
  status: "regular" | "archived";
  title?: string;
  custom?: Record<string, unknown> | undefined;
}> {
  const userId = await requireUserId();
  const s = await requireOwnSession(userId, remoteId);
  return {
    remoteId: s.id,
    externalId: undefined,
    status: s.is_archived ? "archived" : "regular",
    title: s.title ?? undefined,
  };
}

export async function remoteRenameThread(remoteId: string, newTitle: string): Promise<void> {
  const userId = await requireUserId();
  await requireOwnSession(userId, remoteId);
  await updateSessionTitle(remoteId, newTitle);
  await touchSession(remoteId);
}

export async function remoteArchiveThread(remoteId: string): Promise<void> {
  const userId = await requireUserId();
  await requireOwnSession(userId, remoteId);
  await setSessionArchived(remoteId, true);
}

export async function remoteUnarchiveThread(remoteId: string): Promise<void> {
  const userId = await requireUserId();
  await requireOwnSession(userId, remoteId);
  await setSessionArchived(remoteId, false);
}

export async function remoteDeleteThread(remoteId: string): Promise<void> {
  const userId = await requireUserId();
  await requireOwnSession(userId, remoteId);
  await deleteSession(remoteId);
}

export async function remoteLoadThreadMessages(sessionId: string): Promise<{
  headId: string | null;
  messages: Array<{ parentId: string | null; message: UIMessage }>;
}> {
  const userId = await requireUserId();
  await requireOwnSession(userId, sessionId);
  const rows = await getSessionMessages(sessionId);
  const messages: Array<{ parentId: string | null; message: UIMessage }> = [];
  let prevId: string | null = null;
  for (const row of rows) {
    const raw = row.metadata as { aui?: AiSdkMessageStorageEntry } | null;
    const aui = raw?.aui;
    if (aui && aui.format === AI_SDK_FORMAT) {
      messages.push(decodeStoredEntry(aui));
      prevId = aui.id;
    } else {
      const message: UIMessage = {
        id: row.id,
        role: row.role as UIMessage["role"],
        parts: [{ type: "text", text: row.content }],
      };
      messages.push({ parentId: prevId, message });
      prevId = row.id;
    }
  }
  const headId = messages.length > 0 ? messages[messages.length - 1]!.message.id : null;
  return { headId, messages };
}

export async function remoteAppendThreadMessage(params: {
  sessionId: string;
  entry: AiSdkMessageStorageEntry;
  role: MessageRole;
}): Promise<void> {
  const userId = await requireUserId();
  await requireOwnSession(userId, params.sessionId);
  const { message } = decodeStoredEntry(params.entry);
  const contentText = textFromUiMessage(message);
  await saveMessage({
    id: params.entry.id,
    session_id: params.sessionId,
    role: params.role,
    content: contentText || " ",
    metadata: { aui: params.entry },
  });
  await touchSession(params.sessionId);
}

export async function remoteUpdateThreadMessage(params: {
  sessionId: string;
  messageId: string;
  entry: AiSdkMessageStorageEntry;
  role: MessageRole;
}): Promise<void> {
  const userId = await requireUserId();
  await requireOwnSession(userId, params.sessionId);
  const { message } = decodeStoredEntry(params.entry);
  const contentText = textFromUiMessage(message);
  await updateChatMessage(params.sessionId, params.messageId, {
    content: contentText || " ",
    metadata: { aui: params.entry },
  });
  await touchSession(params.sessionId);
}
