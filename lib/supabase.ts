import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

if (supabaseUrl.includes("placeholder")) {
    console.warn("⚠️ SUPABASE CONFIGURATION MISSING: CHECK ENVIRONMENT VARIABLES");
} else {
    console.log("✅ Supabase initialized with URL:", supabaseUrl.substring(0, 12) + "...");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
