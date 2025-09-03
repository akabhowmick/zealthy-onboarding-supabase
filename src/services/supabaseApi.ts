import bcrypt from "bcryptjs";
import { supabase } from "../api/_supabase";
import type { User } from "@supabase/supabase-js";
import type { ComponentKind, OnboardingDraft, OnboardingConfig, UserDataView } from "../types";

// Simple app error type for consistent toasts/logging
export class ApiError extends Error {
  public cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.cause = cause;
  }
}

/* ---------------------------
   Helpers / Guards
---------------------------- */

function requireNonEmpty<T extends unknown[]>(arr: T, label: string) {
  if (!arr || arr.length < 1) {
    throw new ApiError(`${label} must include at least one component`);
  }
}

export function isComponentKind(x: string): x is ComponentKind {
  return x === "about_me" || x === "address" || x === "birthdate";
}

/* ---------------------------
   Public API
---------------------------- */

/**
 * Create a user (page 1) and an empty draft linked to that user.
 * Returns both rows. Keep the returned draft.id for subsequent saves.
 */

export async function createUser(
  email: string,
  password: string
): Promise<{
  user: User;
  draft: OnboardingDraft;
}> {
  try {
    const password_hash = await bcrypt.hash(password, 10);
    console.log(password_hash);
    const { data: user, error: uErr } = await supabase
      .from("users")
      .insert([{ email, password_hash }])
      .select()
      .single();

    if (uErr || !user) {
      throw new ApiError("Could not create user", uErr);
    }

    const { data: draft, error: dErr } = await supabase
      .from("onboarding_drafts")
      .insert([{ user_id: user.id, step: 2 }])
      .select()
      .single();

    if (dErr || !draft) {
      throw new ApiError("Could not initialize onboarding draft", dErr);
    }

    return { user: user as User, draft: draft as OnboardingDraft };
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Unexpected error creating user", e);
  }
}

// Load the single admin configuration row (id=1).
export async function getConfig(): Promise<OnboardingConfig> {
  try {
    const { data, error } = await supabase
      .from("onboarding_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) {
      throw new ApiError("Could not load admin configuration", error);
    }

    // Defensive: coerce unknown strings to ComponentKind, filter out garbage
    const page2 = (data.page2_components ?? []).filter(isComponentKind);
    const page3 = (data.page3_components ?? []).filter(isComponentKind);

    return {
      id: 1,
      page2_components: page2,
      page3_components: page3,
      updated_at: data.updated_at,
    };
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Unexpected error loading configuration", e);
  }
}

// Update admin configuration. Enforces the rule that both pages must have ≥ 1 component.
export async function saveConfig(
  page2_components: ComponentKind[],
  page3_components: ComponentKind[]
): Promise<void> {
  try {
    requireNonEmpty(page2_components, "Page 2");
    requireNonEmpty(page3_components, "Page 3");

    const { error } = await supabase
      .from("onboarding_config")
      .update({ page2_components, page3_components, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      throw new ApiError("Could not save admin configuration", error);
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Unexpected error saving configuration", e);
  }
}

// Patch a draft (step 2/3 fields and/or step advance). Pass only fields you want to update.
export async function saveDraft(
  draftId: string,
  patch: Partial<
    Pick<OnboardingDraft, "about_me" | "birthdate" | "street" | "city" | "state" | "zip" | "step">
  >
): Promise<void> {
  try {
    const payload = { ...patch, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("onboarding_drafts").update(payload).eq("id", draftId);

    if (error) {
      throw new ApiError("Could not save draft", error);
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Unexpected error saving draft", e);
  }
}

// Load a draft by id
export async function loadDraft(draftId: string): Promise<OnboardingDraft | null> {
  try {
    const { data, error } = await supabase
      .from("onboarding_drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (error) return null;
    return data as OnboardingDraft;
  } catch {
    return null;
  }
}

//Fetch rows for the `/data` page (from the `user_data` view)
export async function listUserData(): Promise<UserDataView[]> {
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      throw new ApiError("Could not load user data", error);
    }
    return data as UserDataView[];
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Unexpected error loading user data", e);
  }
}
