import type {
  ApiFailure,
  ApiFieldIssue,
  ApiResponse,
  Profile,
  ProfileInput,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** A failed request, carrying the field level issues reported by the API. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldIssues: ApiFieldIssue[];

  constructor(
    message: string,
    status: number,
    code: string,
    fieldIssues: ApiFieldIssue[] = [],
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.fieldIssues = fieldIssues;
  }
}

function isApiFailure(payload: unknown): payload is ApiFailure {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { success?: unknown }).success === false
  );
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiRequestError(
      "Could not reach the CreatorConnect API. Is the backend running?",
      0,
      "NETWORK_ERROR",
    );
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (payload && isApiFailure(payload)) {
      throw new ApiRequestError(
        payload.error.message,
        response.status,
        payload.error.code,
        payload.error.details?.fields ?? [],
      );
    }
    throw new ApiRequestError(
      `The API responded with status ${response.status}.`,
      response.status,
      "UNKNOWN_ERROR",
    );
  }

  if (!payload || payload.success !== true) {
    throw new ApiRequestError(
      "The API returned an unexpected response.",
      response.status,
      "UNKNOWN_ERROR",
    );
  }

  return payload.data;
}

export interface ProfileQuery {
  q?: string;
  accountType?: string;
  industry?: string;
}

export function buildQueryString(query: ProfileQuery): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.accountType) params.set("accountType", query.accountType);
  if (query.industry) params.set("industry", query.industry);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export const api = {
  listProfiles(query: ProfileQuery = {}): Promise<Profile[]> {
    return request<Profile[]>(`/api/profiles${buildQueryString(query)}`);
  },

  listIndustries(): Promise<string[]> {
    return request<string[]>("/api/profiles/industries");
  },

  getProfile(id: string): Promise<Profile> {
    return request<Profile>(`/api/profiles/${encodeURIComponent(id)}`);
  },

  createProfile(input: ProfileInput): Promise<Profile> {
    return request<Profile>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateProfile(id: string, input: Partial<ProfileInput>): Promise<Profile> {
    return request<Profile>(`/api/profiles/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  deleteProfile(id: string): Promise<{ id: string; deleted: boolean }> {
    return request<{ id: string; deleted: boolean }>(
      `/api/profiles/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
};
