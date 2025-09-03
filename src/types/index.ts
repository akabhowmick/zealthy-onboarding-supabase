// Components admins can place on pages 2 & 3
export type ComponentKind = "about_me" | "address" | "birthdate";

//Admin config row 
export interface OnboardingConfig {
  id: number; // always 1 in this simple setup
  page2_components: ComponentKind[];
  page3_components: ComponentKind[];
  updated_at: string;
}

// Minimal user row for creation 
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

// Draft row (progress + collected fields) 
export interface OnboardingDraft {
  id: string;
  user_id: string;
  step: 2 | 3;
  about_me: string | null;
  birthdate: string | null; // ISO date (YYYY-MM-DD)
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  updated_at: string;
}

// Read-only denormalized view row for /data 
export interface UserDataView {
  email: string | null;
  about_me: string | null;
  birthdate: string | null; // ISO date
  address: string | null;   // "street, city, state, zip" or null
  step: number | null;
  created_at: string | null;
}

