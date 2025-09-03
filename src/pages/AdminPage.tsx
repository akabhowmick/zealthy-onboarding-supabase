import { useEffect, useMemo, useState } from "react";
import { getConfig, saveConfig } from "../services/supabaseApi";
import type { ComponentKind } from "../types";

type Placement = 2 | 3;

const ALL: ComponentKind[] = ["about_me", "address", "birthdate"];

type PlacementMap = Record<ComponentKind, Placement>;

function arraysToPlacement(p2: ComponentKind[], p3: ComponentKind[]): PlacementMap {
  const base: Partial<PlacementMap> = {};
  p2.forEach((k) => (base[k] = 2));
  p3.forEach((k) => (base[k] = 3));
  // Fallback: any missing component defaults to step 2 so UI is always selectable
  ALL.forEach((k) => {
    if (!base[k]) base[k] = 2;
  });
  return base as PlacementMap;
}

function placementToArrays(pm: PlacementMap): { p2: ComponentKind[]; p3: ComponentKind[] } {
  const p2: ComponentKind[] = [];
  const p3: ComponentKind[] = [];
  for (const k of ALL) {
    (pm[k] === 2 ? p2 : p3).push(k);
  }
  return { p2, p3 };
}

export default function AdminConfigForm() {
  const [placement, setPlacement] = useState<PlacementMap>({
    about_me: 2,
    address: 3,
    birthdate: 2,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Load current config
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await getConfig(); 
        if (!mounted) return;
        setPlacement(arraysToPlacement(cfg.page2_components, cfg.page3_components));
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

  // Derive counts for validation & display
  const counts = useMemo(() => {
    let c2 = 0,
      c3 = 0;
    for (const k of ALL) {
      if (placement[k] === 2) c2++;
      else c3++;
    }
    return { c2, c3 };
  }, [placement]);

  const canSave = counts.c2 >= 1 && counts.c3 >= 1;

  function onChoose(comp: ComponentKind, p: Placement) {
    setPlacement((prev) => ({ ...prev, [comp]: p }));
  }

  async function handleSave() {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const { p2, p3 } = placementToArrays(placement);
      if (p2.length === 0 || p3.length === 0) {
        throw new Error("Each page must have at least one component.");
      }
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
        <h2 className="font-semibold mb-1">Admin: Configure Onboarding</h2>
        <p className="text-sm text-gray-700 mb-3">
          Choose which page each component appears on. Each page (Step 2 & Step 3) must have at least one component.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="py-2">Component</th>
                <th className="py-2">Step 2</th>
                <th className="py-2">Step 3</th>
              </tr>
            </thead>
            <tbody>
              {ALL.map((c) => (
                <tr key={c} className="border-t">
                  <td className="py-2">
                    {c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}
                  </td>
                  <td className="py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`place-${c}`}
                        value={2}
                        checked={placement[c] === 2}
                        onChange={() => onChoose(c, 2)}
                      />
                      <span className="text-sm">Step 2</span>
                    </label>
                  </td>
                  <td className="py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`place-${c}`}
                        value={3}
                        checked={placement[c] === 3}
                        onChange={() => onChoose(c, 3)}
                      />
                      <span className="text-sm">Step 3</span>
                    </label>
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-white/60">
                <td className="py-2 font-medium">Summary</td>
                <td className="py-2 text-sm">{counts.c2} selected</td>
                <td className="py-2 text-sm">{counts.c3} selected</td>
              </tr>
            </tbody>
          </table>
        </div>

        {counts.c2 === 0 && (
          <p className="text-sm text-red-600 mt-2">Step 2 must have at least one component.</p>
        )}
        {counts.c3 === 0 && (
          <p className="text-sm text-red-600 mt-1">Step 3 must have at least one component.</p>
        )}
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
