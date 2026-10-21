import { z } from "zod";
import { ACCOUNT_TYPES } from "./types";

/**
 * Client side mirror of the API validation rules. It keeps the form responsive
 * and produces field level messages without a round trip to the server.
 */
export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(120, "Display name must be at most 120 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Email must be a valid email address"),
  accountType: z.enum(ACCOUNT_TYPES, {
    errorMap: () => ({
      message: `Account type must be one of: ${ACCOUNT_TYPES.join(", ")}`,
    }),
  }),
  industry: z
    .string()
    .trim()
    .min(1, "Industry is required")
    .max(120, "Industry must be at most 120 characters"),
  bio: z
    .string()
    .trim()
    .min(1, "Bio is required")
    .max(2000, "Bio must be at most 2000 characters"),
  skills: z
    .string()
    .trim()
    .min(1, "Skills are required")
    .max(500, "Skills must be at most 500 characters"),
  portfolioUrl: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Portfolio URL must be a valid http or https URL" },
    ),
  twitterUrl: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Twitter URL must be a valid http or https URL" },
    ),
  instagramUrl: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Instagram URL must be a valid http or https URL" },
    ),
  linkedinUrl: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "LinkedIn URL must be a valid http or https URL" },
    ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const EMPTY_PROFILE_FORM: ProfileFormValues = {
  displayName: "",
  email: "",
  accountType: "CREATOR",
  industry: "",
  bio: "",
  skills: "",
  portfolioUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};

/** Flattens a Zod error into a `field -> message` map for rendering. */
export function collectFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".") || "_root";
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}
