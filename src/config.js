// config.js

// TEST: Kelly-dev
const DEV_URL = "https://hvxqoasamovfkccesmqd.supabase.co";
const DEV_KEY = "sb_publishable_c8d9YhyQptjOP0_yDFmH1g_XvBmo3W2";

// PROD: You'll manually swap these or use environment variables in CI/CD later
const PROD_URL = "https://opwzyuswtztpulzpyomp.supabase.co";
const PROD_KEY = "sb_publishable_XiohYAtcQys8dqMAn0hH5w_aJSIJuDs";

// 2. Check where we are running
const isDev = true;

// 3. Initialize
const supabaseUrl = isDev ? DEV_URL : PROD_URL;
const supabaseKey = isDev ? DEV_KEY : PROD_KEY;

// Global client usage
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient; // Make it globally accessible if needed

console.log(`Supabase running in ${isDev ? "DEV" : "PROD"} mode.`);
