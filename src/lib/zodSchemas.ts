import { z } from "zod";

//Email + password (step 1)
export const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});
export type AccountForm = z.infer<typeof accountSchema>;

// About Me (step 2/3)
export const aboutMeSchema = z.object({
  about_me: z.string().min(5, "Please write at least 5 characters").max(1000),
});
export type AboutMeForm = z.infer<typeof aboutMeSchema>;

//Address (step 2/3)
export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code")
    .optional()
    .or(z.literal("")),
});
export type AddressForm = z.infer<typeof addressSchema>;

/**
 * Birthdate (step 2/3 component)
 * Ensures date is not in the future.
 */
export const birthdateSchema = z.object({
  birthdate: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      { message: "Birthdate cannot be in the future" }
    ),
});
export type BirthdateForm = z.infer<typeof birthdateSchema>;

//Combine for final onboarding payload if needed.
 
export const draftSchema = aboutMeSchema
  .merge(addressSchema)
  .merge(birthdateSchema)
  .extend({
    step: z.number().int().min(2).max(3),
  });
export type DraftForm = z.infer<typeof draftSchema>;
