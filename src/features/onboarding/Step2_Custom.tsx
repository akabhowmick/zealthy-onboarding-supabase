import { useMemo, useState } from "react";
import { aboutMeSchema, addressSchema, birthdateSchema } from "../../lib/zodSchemas";
import { pickDefined } from "../../lib/patch";
import { saveDraft } from "../../services/supabaseApi";
import AboutMeField from "./components/AboutMeField";
import AddressFields from "./components/AddressFields";
import BirthdateField from "./components/BirthdateField";
import type { ComponentKind } from "../../types";

type Props = {
  draftId: string;
  components: ComponentKind[]; // which components to render on step 2
  onNext: () => void;
};

export default function Step2_Custom({ draftId, components, onNext }: Props) {
  // local form state for the three possible components
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

    // Validate only visible components
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

    // Build a *partial* patch only from fields that belong to this step.
    // DO NOT send nulls for hidden components.
    const rawPatch = {
      about_me: showAbout ? about_me : undefined,
      street: showAddress ? street : undefined,
      city: showAddress ? city : undefined,
      state: showAddress ? state : undefined,
      zip: showAddress ? zip : undefined,
      birthdate: showBirth ? birthdate : undefined,
      step: 3 as 2 | 3, // advance
    };

    const patch = pickDefined(rawPatch);

    setLoading(true);
    try {
      await saveDraft(draftId, patch);
      onNext();
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
      <div className="flex gap-2">
        <button
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving…" : "Next"}
        </button>
      </div>
    </form>
  );
}
