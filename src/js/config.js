window.supabaseUrl = "https://oprjavcfnfnyvqoxwnyv.supabase.co";
window.supabaseKey = "sb_publishable_CP5Cl1z7DL8C_jP_tCkBCg_qCIDox40";

// Check of Supabase bibliotheek geladen is
if (typeof supabase !== "undefined") {
  window.supabaseClient = supabase.createClient(
    window.supabaseUrl,
    window.supabaseKey,
  );
} else {
  console.error("Supabase script is niet geladen in index.html!");
}
