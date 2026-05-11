import AssistantChat from "./components/AssistantChat"
import DocPreview from "./components/DocPreview"
import { CitationPreviewProvider } from "./components/CitationPreviewContext"
import { Header } from "./components/Header"
import { createClient } from "@/lib/supabase-server"

export default async function ChatPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const metadata = user?.user_metadata ?? {}

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        user={{
          name: metadata.name || metadata.user_name || user?.email,
          email: user?.email,
          image: metadata.avatar_url,
        }}
      />
      <div className="flex min-h-0 flex-1">
        <CitationPreviewProvider>
          <div className="flex min-h-0 flex-[3]">
            <AssistantChat />
          </div>
          <div className="flex min-h-0 flex-[1] border-l border-outline/20 bg-surface-container-lowest">
            <DocPreview />
          </div>
        </CitationPreviewProvider>
      </div>
    </div>
  )
}
