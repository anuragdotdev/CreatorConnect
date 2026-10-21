export const ACCOUNT_TYPES = ["CREATOR", "BRAND", "BUSINESS"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Profile {
  id: string;
  displayName: string;
  email: string;
  accountType: AccountType;
  industry: string;
  bio: string;
  skills: string;
  portfolioUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  displayName: string;
  email: string;
  accountType: AccountType;
  industry: string;
  bio: string;
  skills: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFieldIssue {
  field: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { fields?: ApiFieldIssue[] };
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CREATOR: "Creator",
  BRAND: "Brand",
  BUSINESS: "Business",
};

export const ACCOUNT_TYPE_STYLES: Record<AccountType, string> = {
  CREATOR: "bg-violet-100 text-violet-700 ring-violet-200",
  BRAND: "bg-sky-100 text-sky-700 ring-sky-200",
  BUSINESS: "bg-amber-100 text-amber-700 ring-amber-200",
};
