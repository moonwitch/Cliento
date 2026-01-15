// src/js/utils/content.js

export async function fetchContent(sectionName) {
  // Check of Supabase er is
  if (!window.supabaseClient) {
    console.warn("Supabase client mist in fetchContent");
    return {};
  }

  try {
    const { data, error } = await window.supabaseClient
      .from("content_blocks")
      .select("key, content")
      .eq("section", sectionName);

    if (error) {
      console.warn(`Content error voor ${sectionName}:`, error.message);
      return {};
    }

    const contentMap = {};
    // Check of data bestaat én een array is
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const cleanKey = item.key.replace(`${sectionName}_`, "");
        contentMap[cleanKey] = item.content;
      });
    }

    return contentMap;
  } catch (err) {
    console.error("Crash in fetchContent:", err);
    return {}; // Safety first
  }
}
