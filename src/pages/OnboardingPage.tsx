import { useEffect, useMemo, useState } from "react";
import { AboutMeField, AddressFields, BirthdateField } from "../components/fields";
import { apiGet, apiPost } from "../lib/api";
import { type ConfigPayload } from "../lib/types";
import { Stepper } from "../components/Stepper";

type Me = {
  id: string;
  email: string;
  aboutMe?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  birthdate?: string | null;
  stepCompleted: number;
};
export const OnboardingPage = () => {
  const [config, setConfig] = useState<ConfigPayload | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [current, setCurrent] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cfg = await apiGet<ConfigPayload>("/config");
      setConfig(cfg);
      const meRes = await apiGet<{ user: Me | null }>("/users/me");
      if (meRes.user) {
        setMe(meRes.user);
        setCurrent((meRes.user.stepCompleted ?? 1) as 1 | 2 | 3);
      }
    })();
  }, []);

  const step2 = useMemo(() => config?.step2 ?? [], [config]);
  const step3 = useMemo(() => config?.step3 ?? [], [config]);

  async function submitStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      await apiPost("/users", { step: 1, email, password });
      setCurrent(2);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitDynamic(step: 2 | 3, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      await apiPost("/users", { step, data: payload });
      setCurrent(step === 2 ? 3 : 3);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function render(list: string[]) {
    return (
      <div className="space-y-4">
        {list.includes("ABOUT_ME") && <AboutMeField defaultValue={me?.aboutMe ?? undefined} />}
        {list.includes("ADDRESS") && (
          <AddressFields
            street={me?.street ?? undefined}
            city={me?.city ?? undefined}
            state={me?.state ?? undefined}
            zip={me?.zip ?? undefined}
          />
        )}
        {list.includes("BIRTHDATE") && <BirthdateField defaultValue={me?.birthdate ?? undefined} />}
      </div>
    );
  }

  return (
    <main>
      <h1 className="text-2xl font-bold">Welcome</h1>
      <Stepper current={current} />
      {err && <p className="text-red-600 mb-4">{err}</p>}

      {current === 1 && (
        <form onSubmit={submitStep1} className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">Email</label>
            <input name="email" type="email" required className="w-full border rounded p-2" />
          </div>
          <div className="space-y-2">
            <label className="font-medium">Password</label>
            <input name="password" type="password" required className="w-full border rounded p-2" />
          </div>
          <button disabled={busy} className="bg-black text-white px-4 py-2 rounded">
            {busy ? "Saving..." : "Continue"}
          </button>
        </form>
      )}

      {current === 2 && config && (
        <form onSubmit={(e) => submitDynamic(2, e)} className="space-y-4">
          {render(step2)}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrent(1)}
              className="px-3 py-2 border rounded"
            >
              Back
            </button>
            <button disabled={busy} className="bg-black text-white px-4 py-2 rounded">
              {busy ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      )}

      {current === 3 && config && (
        <form onSubmit={(e) => submitDynamic(3, e)} className="space-y-4">
          {render(step3)}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrent(2)}
              className="px-3 py-2 border rounded"
            >
              Back
            </button>
            <button disabled={busy} className="bg-black text-white px-4 py-2 rounded">
              {busy ? "Saving..." : "Finish"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
