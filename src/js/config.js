// config.js

// TEST: Kelly-dev
const DEV_URL = "https://xpldxyfyqwwbmfhbcqyv.supabase.co";
const DEV_KEY = "sb_publishable_-_Or-7aWsRslbRl4Vi-RTA_Ngi6D0Xu";

// PROD: You'll manually swap these or use environment variables in CI/CD later
const PROD_URL = "https://oprjavcfnfnyvqoxwnyv.supabase.co";
const PROD_KEY = "sb_publishable_CP5Cl1z7DL8C_jP_tCkBCg_qCIDox40";

// 2. Check where we are running
const isDev = false;

// 3. Initialize
const supabaseUrl = isDev ? DEV_URL : PROD_URL;
const supabaseKey = isDev ? DEV_KEY : PROD_KEY;

// Global client usage
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient; // Make it globally accessible if needed

console.log(`Supabase running in ${isDev ? "DEV" : "PROD"} mode.`);
