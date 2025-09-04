import { useMemo, useState } from "react";
import { aboutMeSchema, addressSchema, birthdateSchema } from "../../lib/zodSchemas";
import { saveDraft } from "../../services/supabaseApi";
import AboutMeField from "./components/AboutMeField";
import AddressFields from "./components/AddressFields";
import BirthdateField from "./components/BirthdateField";
import type { ComponentKind, OnboardingDraft } from "../../types";

type Props = {
  draftId: string;
  draft: OnboardingDraft | null;
  components: ComponentKind[]; // which components to render on step 3
  onFinish: () => void;
};

export default function Step3_Custom({ draftId, draft, components, onFinish }: Props) {
  const [about_me, setAboutMe] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showAbout = useMemo(() => components.includes("about_me"), [components]);
  const showAddress = useMemo(() => components.includes("address"), [components]);
  const showBirth = useMemo(() => components.includes("birthdate"), [components]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (showAbout) {
      const check = aboutMeSchema.safeParse({ about_me });
      if (!check.success) return setErr(check.error.issues[0]?.message ?? "Invalid About Me");
    }
    if (showAddress) {
      const check = addressSchema.safeParse({ street, city, state, zip });
      if (!check.success) return setErr(check.error.issues[0]?.message ?? "Invalid Address");
    }
    if (showBirth) {
      const check = birthdateSchema.safeParse({ birthdate });
      if (!check.success) return setErr(check.error.issues[0]?.message ?? "Invalid Birthdate");
    }

    setLoading(true);
    try {
      const data = {
        about_me: showAbout ? about_me : draft?.about_me,
        street: showAddress ? street : draft?.street,
        city: showAddress ? city : draft?.city,
        state: showAddress ? state : draft?.state,
        zip: showAddress ? zip : draft?.zip,
        birthdate: showBirth ? birthdate : draft?.birthdate,
      };
      await saveDraft(draftId, data);
      onFinish();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showAbout && <AboutMeField value={about_me} onChange={setAboutMe} />}
      {showAddress && (
        <AddressFields
          street={street}
          city={city}
          state={state}
          zip={zip}
          onChange={(p) => {
            if (p.street !== undefined) setStreet(p.street);
            if (p.city !== undefined) setCity(p.city);
            if (p.state !== undefined) setState(p.state);
            if (p.zip !== undefined) setZip(p.zip);
          }}
        />
      )}
      {showBirth && <BirthdateField value={birthdate} onChange={setBirthdate} />}

      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving…" : "Finish"}
      </button>
    </form>
  );
}
