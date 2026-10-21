import type { Profile } from "./types";

/**
 * An in-memory cache of the profiles the user has already loaded.
 *
 * The profile detail view renders from this cache so that navigating back to a
 * profile that has already been visited is instant, instead of showing a
 * loading spinner while the request is in flight.
 *
 * The cache is kept up to date by the profile write helpers, so a profile that
 * was just created, updated or deleted always shows its current data.
 */
const cache = new Map<string, Profile>();

export function getCachedProfile(id: string): Profile | undefined {
  return cache.get(id);
}

export function setCachedProfile(profile: Profile): void {
  cache.set(profile.id, profile);
}

export function invalidateCachedProfile(id: string): void {
  cache.delete(id);
}

export function clearProfileCache(): void {
  cache.clear();
}
