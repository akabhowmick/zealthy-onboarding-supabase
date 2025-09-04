import { useState } from "react";
import { type AccountForm, accountSchema } from "../../lib/zodSchemas";
import { createUser } from "../../services/supabaseApi";

type Props = {
  onCreated: (draftId: string) => void;
};

export default function Step1_Account({ onCreated }: Props) {
  const [form, setForm] = useState<AccountForm>({ email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const parsed = accountSchema.safeParse(form);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      const { draft } = await createUser(form.email, form.password);
      onCreated(draft.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-md font-medium">Email</label>
        <input
          className="mt-1 w-full text-xl rounded border p-2"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-md font-medium">Password</label>
        <input
          className="mt-1 w-full text-xl rounded border p-2"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating…" : "Continue"}
      </button>
    </form>
  );
}
