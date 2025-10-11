
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const SUPABASE_URL = "https://umdtomlwyltolotkqaqt.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZHRvbWx3eWx0b2xvdGtxYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjU3MTksImV4cCI6MjA3NTcwMTcxOX0.r5dv-J3Rrgib8DjiXl1oYm1rVzdfpfN5hgJu4IPr39A";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
