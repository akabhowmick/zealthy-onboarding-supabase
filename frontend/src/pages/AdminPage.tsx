import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { type ConfigPayload } from "../lib/types";

const ALL: Array<"ABOUT_ME" | "ADDRESS" | "BIRTHDATE"> = ["ABOUT_ME", "ADDRESS", "BIRTHDATE"];

export const AdminPage = () => {
  const [cfg, setCfg] = useState<ConfigPayload | null>(null);
  const [map, setMap] = useState<Record<string, "step2" | "step3">>({
    ABOUT_ME: "step2",
    ADDRESS: "step3",
    BIRTHDATE: "step3",
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const c = await apiGet<ConfigPayload>("/config");
      setCfg(c);
      setMap({
        ABOUT_ME: c.step2.includes("ABOUT_ME") ? "step2" : "step3",
        ADDRESS: c.step2.includes("ADDRESS") ? "step2" : "step3",
        BIRTHDATE: c.step2.includes("BIRTHDATE") ? "step2" : "step3",
      });
    })();
  }, []);

  async function save() {
    const step2 = ALL.filter((c) => map[c] === "step2");
    const step3 = ALL.filter((c) => map[c] === "step3");
    try {
      const updated = await apiPost<ConfigPayload>("/config", { step2, step3 });
      setCfg(updated);
      setMsg("Saved!");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  if (!cfg) return <p>Loading…</p>;

  return (
    <main>
      <h1 className="text-2xl font-bold mb-2">Admin — Configure Steps</h1>
      <p className="text-sm text-gray-600 mb-4">
        Each component must be on exactly one page; both steps must have at least one.
      </p>
      {msg && <p className="mb-3">{msg}</p>}
      <div className="space-y-4">
        {ALL.map((c) => (
          <div key={c} className="flex items-center justify-between border rounded p-3">
            <span className="font-medium">{c.replace("_", " ")}</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={c}
                  checked={map[c] === "step2"}
                  onChange={() => setMap({ ...map, [c]: "step2" })}
                />
                <span>Step 2</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={c}
                  checked={map[c] === "step3"}
                  onChange={() => setMap({ ...map, [c]: "step3" })}
                />
                <span>Step 3</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} className="mt-6 bg-black text-white px-4 py-2 rounded">
        Save
      </button>
    </main>
  );
}
