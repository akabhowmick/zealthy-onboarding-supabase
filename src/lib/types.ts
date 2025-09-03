export type ComponentKey = "ABOUT_ME" | "ADDRESS" | "BIRTHDATE";
export type ConfigPayload = { step2: ComponentKey[]; step3: ComponentKey[] };

export type UserRow = {
  id: string; email: string;
  aboutMe?: string | null; street?: string | null; city?: string | null; state?: string | null; zip?: string | null;
  birthdate?: string | null; stepCompleted: number;
  createdAt: string; updatedAt: string;
};
