import { useEffect, useState } from "react";
import { getConfig, saveConfig } from "../../services/supabaseApi";
import type { ComponentKind } from "../../types";

const ALL: ComponentKind[] = ["about_me", "address", "birthdate"];

export default function AdminConfigForm() {
  const [p2, setP2] = useState<ComponentKind[]>([]);
  const [p3, setP3] = useState<ComponentKind[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await getConfig();
        if (!mounted) return;
        setP2(cfg.page2_components);
        setP3(cfg.page3_components);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load config");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function toggle(setter: (f: ComponentKind[]) => void, list: ComponentKind[], val: ComponentKind) {
    const next = list.includes(val) ? list.filter((x) => x !== val) : [...list, val];
    setter(next);
  }

  const canSave = p2.length >= 1 && p3.length >= 1;

  async function handleSave() {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await saveConfig(p2, p3);
      setOk("Configuration saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-2">Page 2 Components</h2>
        <div className="flex flex-wrap gap-3">
          {ALL.map((c) => (
            <label key={`p2-${c}`} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={p2.includes(c)}
                onChange={() => toggle(setP2, p2, c)}
              />
              <span className="capitalize">{c.replace("_", " ")}</span>
            </label>
          ))}
        </div>
        {p2.length === 0 && <p className="text-sm text-red-600 mt-1">Page 2 must have at least one component.</p>}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Page 3 Components</h2>
        <div className="flex flex-wrap gap-3">
          {ALL.map((c) => (
            <label key={`p3-${c}`} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={p3.includes(c)}
                onChange={() => toggle(setP3, p3, c)}
              />
              <span className="capitalize">{c.replace("_", " ")}</span>
            </label>
          ))}
        </div>
        {p3.length === 0 && <p className="text-sm text-red-600 mt-1">Page 3 must have at least one component.</p>}
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-green-700">{ok}</p>}

      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={!canSave || saving}
        onClick={handleSave}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
