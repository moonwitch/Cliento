// config.js

// LOCAL: These are the standard Supabase CLI defaults. They rarely change for local dev.
const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' 

// PROD: You'll manually swap these or use environment variables in CI/CD later
const PROD_URL = 'https://opwzyuswtztpulzpyomp.supabase.co'
const PROD_KEY = 'sb_publishable_XiohYAtcQys8dqMAn0hH5w_aJSIJuDs'

// 2. Check where we are running
const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// 3. Initialize
const supabaseUrl = isLocal ? LOCAL_URL : PROD_URL;
const supabaseKey = isLocal ? LOCAL_KEY : PROD_KEY;

// Global client usage
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient; // Make it globally accessible if needed

console.log(`Supabase running in ${isLocal ? 'LOCAL' : 'PROD'} mode.`);