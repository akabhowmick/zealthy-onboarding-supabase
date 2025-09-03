import { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";

type Body = { step2?: string[]; step3?: string[] };

const DEFAULT_CONFIG = {
  step2: ["ABOUT_ME"],
  step3: ["ADDRESS", "BIRTHDATE"],
};

function isValidPartition(step2: string[], step3: string[]) {
  const s2 = new Set(step2);
  for (const c of step3) if (s2.has(c)) return false;
  return s2.size + step3.length === 3 && step2.length >= 1 && step3.length >= 1;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const { data, error } = await supabase
        .from("config")
        .select("step2, step3")
        .eq("id", 1)
        .maybeSingle();

      if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };

      if (!data) {
        const { data: created, error: insErr } = await supabase
          .from("config")
          .insert({ id: 1, ...DEFAULT_CONFIG })
          .select("step2, step3")
          .single();
        if (insErr) return { statusCode: 500, body: JSON.stringify({ error: insErr.message }) };
        return { statusCode: 200, body: JSON.stringify(created) };
      }

      return { statusCode: 200, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const body: Body = event.body ? JSON.parse(event.body) : {};
      const step2 = body.step2 ?? [];
      const step3 = body.step3 ?? [];
      if (!isValidPartition(step2, step3)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error:
              "Each component must be on exactly one of steps 2 or 3, and both steps need at least one.",
          }),
        };
      }

      const { data, error } = await supabase
        .from("config")
        .upsert({ id: 1, step2, step3 })
        .select("step2, step3")
        .single();

      if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
