import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell"

export default async function DocumentsLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const metadata = user.user_metadata ?? {}

  return (
    <WorkspacePageShell
      active="documents"
      user={{
        email: user.email,
        name: (metadata.name || metadata.user_name) as string | undefined,
        image: metadata.avatar_url as string | undefined,
      }}
    >
      {children}
    </WorkspacePageShell>
  )
}
