"use server"

import { createClient } from "@/lib/supabase-server"
import { getDocuments } from "@/lib/db"
import type { Document } from "@/lib/database.types"

export async function getChatSidebarLists(): Promise<{
  documents: Document[]
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { documents: [] }
  }
  const documents = await getDocuments(user.id)
  return { documents }
}
