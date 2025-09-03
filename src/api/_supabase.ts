import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY= import.meta.env.VITE_SUPABASE_ANON_KEY;


console.log("SB URL", import.meta.env.VITE_SUPABASE_URL);
console.log("SB KEY prefix", import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 8) + "…");

// Hard fail early if either is missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase env vars missing", { SUPABASE_URL, keyPresent: !!SUPABASE_ANON_KEY });
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

// Quick shape checks
if (!/^https:\/\/[^.]+\.supabase\.co/.test(SUPABASE_URL)) {
  console.warn("VITE_SUPABASE_URL should look like https://xxxx.supabase.co — got:", SUPABASE_URL);
}
if (!/^eyJ/.test(SUPABASE_ANON_KEY)) {
  console.warn("VITE_SUPABASE_ANON_KEY doesn’t look like a JWT (should start with eyJ…)");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function pingSupabase() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }).catch((e) => ({ ok: false, status: 0, error: e }));

  console.log("Supabase ping:", {
    ok: (res).ok,
    status: (res).status,
  });
}