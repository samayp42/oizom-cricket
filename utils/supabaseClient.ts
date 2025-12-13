import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are set and NOT equal to placeholders
const isConfigured = supabaseUrl && supabaseKey &&
    supabaseUrl !== 'your_project_url_here' &&
    supabaseKey !== 'your_anon_key_here';

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export const isSupabaseEnabled = !!supabase;
