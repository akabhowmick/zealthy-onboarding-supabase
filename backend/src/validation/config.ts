import { z } from "zod";

export const configSchema = z.object({
  step2: z.array(z.enum(["ABOUT_ME", "ADDRESS", "BIRTHDATE"])).nonempty(),
  step3: z.array(z.enum(["ABOUT_ME", "ADDRESS", "BIRTHDATE"])).nonempty()
});

export function isValidPartition(step2: string[], step3: string[]) {
  const s2 = new Set(step2);
  for (const c of step3) if (s2.has(c)) return false;
  return s2.size + step3.length === 3;
}

export const DEFAULT_CONFIG = {
  step2: ["ABOUT_ME"],
  step3: ["ADDRESS", "BIRTHDATE"]
};
