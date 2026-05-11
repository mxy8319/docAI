// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ✅ 服务端用（有管理员权限），用于向量写入等高权限操作
// ⚠️ 这个文件只能在 Server Component / API Route / Server Action 中引入
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
