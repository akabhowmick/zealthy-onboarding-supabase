// src/features/onboarding/hooks/useDraft.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadDraft, saveDraft } from "../../../services/supabaseApi";
import type { OnboardingDraft } from "../../../types";

/** Cookie helpers (string-only; expires in ~7 days) */
function setCookie(name: string, value: string, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}
function getCookie(name: string): string | null {
  const needle = name + "=";
  const parts = document.cookie.split(";").map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(needle)) return decodeURIComponent(p.substring(needle.length));
  }
  return null;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

/** Patch shape the hook accepts for saving (column-per-field model) */
export type DraftPatch = Partial<
  Pick<
    OnboardingDraft,
    "about_me" | "birthdate" | "street" | "city" | "state" | "zip" | "step"
  >
>;

export type UseDraftOptions = {
  /** Cookie key name for persisting the draft id (default: "draftId") */
  cookieKey?: string;
  /** If true, auto-load the draft when the id becomes known (default: false) */
  autoLoad?: boolean;
};

export type UseDraft = {
  /** Current draft id (if any) */
  draftId: string | null;
  /** Loaded draft row (if loaded) */
  draft: OnboardingDraft | null;
  /** Loading state for load/save */
  loading: boolean;
  /** Last error (string), if any */
  error: string | null;

  /** Set and persist a new draft id into cookie (pass null to clear) */
  setDraftId: (id: string | null) => void;

  /** Remove draft cookie and local state */
  clearDraft: () => void;

  /**
   * Load the draft from Supabase (by id).
   * If id is omitted, uses cookie value if present.
   * Returns the loaded draft or null.
   */
  load: (id?: string) => Promise<OnboardingDraft | null>;

  /**
   * Save a partial patch to the draft.
   * Throws on failure. Also refreshes `draft` in state if save succeeds.
   */
  save: (patch: DraftPatch) => Promise<void>;
};

function pruneUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj) as [keyof T, T[keyof T]][]) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}


/**
 * useDraft — manages draft id via cookie and provides load/save helpers.
 */
export function useDraft(options: UseDraftOptions = {}): UseDraft {
  const cookieKey = options.cookieKey ?? "draftId";

  const [draftId, setDraftIdState] = useState<string | null>(null);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from cookie once
  useEffect(() => {
    const fromCookie = getCookie(cookieKey);
    if (fromCookie) setDraftIdState(fromCookie);
  }, [cookieKey]);

  // Auto-load the draft row when we know the id
  useEffect(() => {
    if (!options.autoLoad) return;
    if (!draftId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await loadDraft(draftId);
        if (!mounted) return;
        setDraft(row);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load draft");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [draftId, options.autoLoad]);

  const setDraftId = useCallback(
    (id: string | null) => {
      setDraftIdState(id);
      if (id) setCookie(cookieKey, id);
      else deleteCookie(cookieKey);
    },
    [cookieKey]
  );

  const clearDraft = useCallback(() => {
    setDraftId(null);
    setDraft(null);
    setError(null);
    setLoading(false);
  }, [setDraftId]);

  const load = useCallback(
    async (id?: string) => {
      const targetId = id ?? draftId ?? getCookie(cookieKey);
      if (!targetId) return null;

      setLoading(true);
      setError(null);
      try {
        const row = await loadDraft(targetId);
        setDraft(row);
        // If backend returns a different (canonical) id, sync cookie/state
        if (row?.id && row.id !== draftId) {
          setDraftId(row.id);
        }
        return row;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load draft";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cookieKey, draftId, setDraftId]
  );

  const save = useCallback(
    async (patch: DraftPatch) => {
      if (!draftId) throw new Error("No draft id available");

      // Critical: only send provided keys to avoid wiping other columns
      const cleaned = pruneUndefined(patch);
      if (Object.keys(cleaned).length === 0) return;

      setLoading(true);
      setError(null);
      try {
        await saveDraft(draftId, cleaned);
        const row = await loadDraft(draftId);
        setDraft(row);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save draft";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [draftId]
  );

  return useMemo(
    () => ({ draftId, draft, loading, error, setDraftId, clearDraft, load, save }),
    [draftId, draft, loading, error, setDraftId, clearDraft, load, save]
  );
}

export default useDraft;
