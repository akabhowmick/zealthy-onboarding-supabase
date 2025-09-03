import { useEffect, useState } from "react";
import type { UserDataView } from "../types";
import { listUserData } from "../services/supabaseApi";

export default function DataPage() {
  const [rows, setRows] = useState<UserDataView[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listUserData();
        if (!mounted) return;
        setRows(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (err) return <p className="text-red-600">Error: {err}</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Data</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Email", "About", "Address", "Birthdate", "Step", "Created"].map((h) => (
                <th key={h} className="text-left p-2 font-semibold text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  No data yet. Complete the onboarding flow to see rows here.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2">{r.email ?? ""}</td>
                  <td className="p-2 max-w-[280px] truncate">{r.about_me ?? ""}</td>
                  <td className="p-2">{r.address ?? ""}</td>
                  <td className="p-2">{r.birthdate ?? ""}</td>
                  <td className="p-2">{r.step ?? ""}</td>
                  <td className="p-2">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
