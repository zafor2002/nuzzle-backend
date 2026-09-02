import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://knykelyweiuslgfljiir.supabase.co';

const supabaseKey = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueWtlbHl3ZWl1c2xnZmxqaWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzQwMjIsImV4cCI6MjEwMzg1MDAyMn0.QSfOVwU8eZ6C6GmzuyHL0TITogokSxl29pZqICHUxhc';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Handled in server components
        }
      },
    },
  });
};
