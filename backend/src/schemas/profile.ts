import { z } from "zod";

export const ACCOUNT_TYPES = ["CREATOR", "BRAND", "BUSINESS"] as const;

export const accountTypeSchema = z.enum(ACCOUNT_TYPES, {
  errorMap: () => ({
    message: `Account type must be one of: ${ACCOUNT_TYPES.join(", ")}`,
  }),
});

/** A trimmed, non-empty string. Whitespace-only values are rejected. */
const requiredText = (field: string, maxLength = 500) =>
  z
    .string({ required_error: `${field} is required` })
    .trim()
    .min(1, `${field} is required`)
    .max(maxLength, `${field} must be at most ${maxLength} characters`);

/** Optional http/https URL. Empty strings are normalised to undefined. */
const optionalHttpUrl = (field: string) =>
  z
    .string()
    .trim()
    .max(2048, `${field} must be at most 2048 characters`)
    .transform((value) => (value === "" ? undefined : value))
    .optional()
    .refine(
      (value) => {
        if (value === undefined) return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: `${field} must be a valid http or https URL` },
    );

export const createProfileSchema = z.object({
  displayName: requiredText("Display name", 120),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Email must be a valid email address")
    .max(255, "Email must be at most 255 characters")
    .transform((value) => value.toLowerCase()),
  accountType: accountTypeSchema,
  industry: requiredText("Industry", 120),
  bio: requiredText("Bio", 2000),
  skills: requiredText("Skills", 500),
  portfolioUrl: optionalHttpUrl("Portfolio URL"),
  twitterUrl: optionalHttpUrl("Twitter URL"),
  instagramUrl: optionalHttpUrl("Instagram URL"),
  linkedinUrl: optionalHttpUrl("LinkedIn URL"),
});

export const updateProfileSchema = z
  .object({
    displayName: requiredText("Display name", 120).optional(),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Email must be a valid email address")
      .max(255, "Email must be at most 255 characters")
      .transform((value) => value.toLowerCase())
      .optional(),
    accountType: accountTypeSchema.optional(),
    industry: requiredText("Industry", 120).optional(),
    bio: requiredText("Bio", 2000).optional(),
    skills: requiredText("Skills", 500).optional(),
    portfolioUrl: optionalHttpUrl("Portfolio URL"),
    twitterUrl: optionalHttpUrl("Twitter URL"),
    instagramUrl: optionalHttpUrl("Instagram URL"),
    linkedinUrl: optionalHttpUrl("LinkedIn URL"),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const listProfilesQuerySchema = z.object({
  q: z.string().trim().max(200, "Search term must be at most 200 characters").optional(),
  accountType: accountTypeSchema.optional(),
  industry: z.string().trim().max(120).optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListProfilesQuery = z.infer<typeof listProfilesQuerySchema>;
