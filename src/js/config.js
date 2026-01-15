// config.js

const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;

// Global client usage
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient;
