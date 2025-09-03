// src/routes/OnboardingRouter.tsx
import { useEffect, useMemo, useState } from "react";
import Stepper from "../components/Stepper";
import useDraft from "../features/onboarding/hooks/useDrafts";
import Step1_Account from "../features/onboarding/Step1_Account";
import Step2_Custom from "../features/onboarding/Step2_Custom";
import Step3_Custom from "../features/onboarding/Step3_Custom";
import { getConfig } from "../services/supabaseApi";
import type { OnboardingConfig, ComponentKind } from "../types";

export default function OnboardingPage() {
  // admin config
  const [config, setConfig] = useState<OnboardingConfig | null>(null);
  const [cfgLoading, setCfgLoading] = useState(true);
  const [cfgErr, setCfgErr] = useState<string | null>(null);

  // draft management (cookie-backed)
  const { draftId, draft, setDraftId, load, loading: draftLoading } = useDraft({ autoLoad: true });

  // ui step (defaults to 1; if a draft exists we’ll sync below)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // load admin config once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await getConfig();
        if (!mounted) return;
        setConfig(cfg);
      } catch (e) {
        setCfgErr(e instanceof Error ? e.message : "Failed to load config");
      } finally {
        if (mounted) setCfgLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // if we already have a draft, jump the UI to the draft's next step
  useEffect(() => {
    if (!draftLoading && draft) {
      // draft.step is the NEXT step the user should see (2 or 3)
      const next = draft.step as 2 | 3;
      // only bump forward; never go backward from 3 to 2
      setStep(next === 3 ? 3 : 2);
    }
  }, [draftLoading, draft]);

  const page2 = useMemo<ComponentKind[]>(
    () => config?.page2_components ?? [],
    [config]
  );
  const page3 = useMemo<ComponentKind[]>(
    () => config?.page3_components ?? [],
    [config]
  );

  // unified loading/error states
  if (cfgLoading || draftLoading) return <p>Loading…</p>;
  if (cfgErr) return <p className="text-red-600">Error: {cfgErr}</p>;
  if (!config) return <p>No configuration found.</p>;

  return (
    <section className="space-y-6">
      <Stepper total={3} current={step} />

      {/* STEP 1: create account -> sets draftId and moves to step 2 */}
      {step === 1 && (
        <Step1_Account
          onCreated={(newDraftId) => {
            setDraftId(newDraftId); // persists to cookie
            setStep(2);
          }}
        />
      )}

      {/* STEP 2: requires a draftId */}
      {step === 2 && (
        draftId ? (
          <Step2_Custom
            draftId={draftId}
            components={page2}
            onNext={() => {
              setStep(3);
              // optional: ensure the latest server state is in memory
              void load(draftId);
            }}
          />
        ) : (
          <MissingDraftGuard onBackToStart={() => setStep(1)} />
        )
      )}

      {/* STEP 3: requires a draftId */}
      {step === 3 && (
        draftId ? (
          <Step3_Custom
            draftId={draftId}
            components={page3}
            onFinish={() => {
              alert("Thanks! Your onboarding is complete.");
              // You could clear the draft cookie here if desired:
              // clearDraft();
            }}
          />
        ) : (
          <MissingDraftGuard onBackToStart={() => setStep(1)} />
        )
      )}
    </section>
  );
}

/** Small helper UI if someone lands on step 2/3 without a draftId */
function MissingDraftGuard({ onBackToStart }: { onBackToStart: () => void }) {
  return (
    <div className="rounded border p-4 bg-yellow-50">
      <p className="mb-3">
        We couldn’t find your onboarding session. Please start with your email and password.
      </p>
      <button className="rounded bg-black px-3 py-2 text-white" onClick={onBackToStart}>
        Go to Step 1
      </button>
    </div>
  );
}
