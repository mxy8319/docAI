"use server";

import { createClient } from "@/lib/supabase-server";
import { getDocumentChunkByIdForUser, getDocuments } from "@/lib/db";
import type { Document } from "@/lib/database.types";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getChatSidebarLists(): Promise<{
  documents: Document[];
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { documents: [] };
  }
  const documents = await getDocuments(user.id);
  return { documents };
}

export async function fetchChunkPreview(chunkId: string): Promise<{
  content: string;
  file_name: string;
  page_number: number | null;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const row = await getDocumentChunkByIdForUser(chunkId, user.id);
  if (!row) return null;
  return {
    content: row.content,
    file_name: row.file_name,
    page_number: row.page_number,
  };
}
