// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ 客户端用（浏览器端），只有只读权限
// RLS 策略保护用户数据
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
