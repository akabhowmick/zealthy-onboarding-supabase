# Zealthy Onboarding Exercise

A custom onboarding flow built with **Vite + React + TypeScript + Tailwind + Supabase**.  
This project implements the requirements from the [Zealthy Full Stack Engineering Exercise](./Zealthy%20-%20Full%20Stack%20Engineering%20Exercise-2.pdf):

- **User Onboarding Wizard** (3 steps)
- **Admin UI** to configure which components appear on pages 2 & 3
- **Data Table** to view saved user data

---

## ✨ Features

- **Step-by-step onboarding wizard**  
  Page 1: Email + Password  
  Page 2: Admin-configured fields  
  Page 3: Admin-configured fields  
  Progress indicator via a simple Stepper.

- **Configurable via Admin page (`/admin`)**  
  Toggle which of the components (About Me, Address, Birthdate) appear on page 2 vs page 3.  
  Guardrails: each page must have at least one component.

- **Live Data view (`/data`)**  
  Simple HTML table showing all users and their draft data. Updates as onboarding progresses.

- **Resume where you left off**  
  Draft ID stored in a cookie → users who signed up with email/password can continue onboarding later.

- **Tech choices**
  - **Frontend:** Vite, React, TypeScript, TailwindCSS, React Router, Zod
  - **Backend/DB:** Supabase (Postgres + RLS)
  - **Hosting:** Netlify (static deploy + env vars)

---

## 🗂 Project Structure

## ⚡️ Quick Start (Local)

1. Clone repo:
   '''
   git clone https://github.com/your-username/zealthy-onboarding.git
   cd zealthy-onboarding
   '''

2. Install deps:
   '''
   npm install
   '''

3. Create .env:
   '''
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   '''

4. Init DB (Supabase SQL Editor → paste from /db/init.sql).

5. Run dev server:
   '''
   npm run dev
   '''
