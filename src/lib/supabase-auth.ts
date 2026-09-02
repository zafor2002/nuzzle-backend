import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://knykelyweiuslgfljiir.supabase.co';

const supabaseAnonKey = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueWtlbHl3ZWl1c2xnZmxqaWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzQwMjIsImV4cCI6MjEwMzg1MDAyMn0.QSfOVwU8eZ6C6GmzuyHL0TITogokSxl29pZqICHUxhc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
