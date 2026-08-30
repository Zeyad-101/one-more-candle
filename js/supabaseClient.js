// Shared Supabase client — initialized once, reused by all modules.
// Requires the Supabase UMD script to be loaded first:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>

const SUPABASE_URL = "https://uekwsphbrqqxweosmngc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVla3dzcGhicnFxeHdlb3NtbmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNDAyMTAsImV4cCI6MjEwMzYxNjIxMH0.a_JEUBH7T7d4fkGmbyBZMTqrRlU59DpLG13OMYB7wn0";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error(
    "Supabase UMD not loaded. Add <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js\"></script> before any module that imports this file."
  );
}

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);