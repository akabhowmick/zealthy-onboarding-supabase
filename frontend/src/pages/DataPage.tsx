import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { type UserRow } from "../lib/types";

export const DataPage = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  useEffect(() => {
    (async () => setRows(await apiGet<UserRow[]>("/users")))();
  }, []);

  const dataFields = ["Email", "About", "Address", "Birthdate", "Step", "Created"];

  return (
    <main>
      <h1 className="text-2xl font-bold">User Data</h1>
      <div className="overflow-auto mt-4 border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {dataFields.map((field) => (
                <th
                  key={field}
                  className="text-left p-2 font-semibold whitespace-nowrap"
                  style={{ borderColor: `rgb(var(--z-border))` }}
                >
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.email}</td>
                <td className="p-2 max-w-[280px] truncate">{r.aboutMe || ""}</td>
                <td className="p-2">
                  {[r.street, r.city, r.state, r.zip].filter(Boolean).join(", ")}
                </td>
                <td className="p-2">{r.birthdate ? r.birthdate.slice(0, 10) : ""}</td>
                <td className="p-2">{r.stepCompleted}</td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-2" colSpan={6}>
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};
