import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { type UserRow } from "../lib/types";

export const DataPage = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  useEffect(() => {
    (async () => setRows(await apiGet<UserRow[]>("/users")))();
  }, []);
  return (
    <main>
      <h1 className="text-2xl font-bold">User Data</h1>
      <div className="overflow-auto mt-4 border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">About</th>
              <th className="text-left p-2">Address</th>
              <th className="text-left p-2">Birthdate</th>
              <th className="text-left p-2">Step</th>
              <th className="text-left p-2">Created</th>
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
}
