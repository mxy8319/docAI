"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000"

  return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`
}

export async function signInWithGithub() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/chat`,
      scopes: "read:user user:email",
    },
  })

  if (error || !data.url) {
    redirect("/login?error=oauth_failed")
  }

  redirect(data.url)
}
