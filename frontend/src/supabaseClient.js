import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bvyzrapsjiwgzxkundlk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eXpyYXBzaml3Z3p4a3VuZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTAyMTcsImV4cCI6MjA2NjE4NjIxN30.8okjpvhdc-OSV5L-eNzSZE53AdDkYwY8DZNX0Ks1PnU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
