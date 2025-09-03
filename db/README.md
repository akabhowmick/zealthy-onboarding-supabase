# DB setup (Supabase)

This folder contains everything you need to spin up the database for the Zealthy onboarding exercise.

## What it contains

- **Tables**
  - `users` — stores email + password_hash (page 1)
  - `onboarding_drafts` — stores progress + fields from pages 2 & 3
  - `onboarding_config` — admin-chosen components for page 2 and 3
- **View**
  - `user_data` — safe, denormalized read for the `/data` page
- **RLS Policies**
  - Permissive policies for the **anon** role so the app can:
    - insert/select `users`
    - read/write `onboarding_drafts`
    - read/update `onboarding_config`
- **Defaults**
  - A seed row in `onboarding_config` so pages 2 & 3 are never empty on first run (`page2: ['birthdate']`, `page3: ['address']`)

> ⚠️ **Security note (for the exercise only):** Admin and Data pages are public per prompt. Policies are intentionally permissive. In production, you would restrict reads/writes to authenticated roles and avoid exposing sensitive columns (like `password_hash`) by using restricted views and tighter policies.

---

## One-time setup

1. **Open Supabase → SQL Editor**
2. Paste the contents of `init.sql`
3. Click **Run**

Your tables, policies, and defaults are live.
