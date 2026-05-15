import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { CitationPreviewProvider } from "./components/CitationPreviewContext"
import { ChatPageClient } from "./ChatPageClient"

export default async function ChatPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const metadata = user.user_metadata ?? {}

  return (
    <CitationPreviewProvider>
      <ChatPageClient
        user={{
          email: user.email,
          name: (metadata.name || metadata.user_name) as string | undefined,
          image: metadata.avatar_url as string | undefined,
        }}
      />
    </CitationPreviewProvider>
  )
}
