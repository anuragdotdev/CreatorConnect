"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { setCachedProfile } from "@/lib/profile-cache";
import { ProfileCard } from "@/components/ProfileCard";
import {
  EMPTY_FILTERS,
  SearchFilters,
  type SearchFiltersState,
} from "@/components/SearchFilters";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";

const DEBOUNCE_MS = 300;

interface QueryResult {
  key: string;
  profiles: Profile[] | null;
  error: string | null;
}

export function DiscoveryBrowser() {
  const [filters, setFilters] = useState<SearchFiltersState>(EMPTY_FILTERS);
  const [industries, setIndustries] = useState<string[]>([]);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Debounce the keyword so typing does not fire a request per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState(filters.q);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(filters.q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    let cancelled = false;
    api
      .listIndustries()
      .then((result) => {
        if (!cancelled) setIndustries(result);
      })
      .catch(() => {
        if (!cancelled) setIndustries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  // The key identifies the active query, so a response is only used when it
  // still matches the filters that are currently applied.
  const queryKey = JSON.stringify({
    q: debouncedQuery,
    accountType: filters.accountType,
    industry: filters.industry,
  });

  useEffect(() => {
    let cancelled = false;

    api
      .listProfiles({
        q: debouncedQuery,
        accountType: filters.accountType,
        industry: filters.industry,
      })
      .then((profiles) => {
        if (cancelled) return;
        for (const profile of profiles) {
          setCachedProfile(profile);
        }
        setResult({ key: queryKey, profiles, error: null });
      })
      .catch((caught) => {
        if (cancelled) return;
        setResult({
          key: queryKey,
          profiles: null,
          error:
            caught instanceof ApiRequestError
              ? caught.message
              : "An unexpected error occurred while loading profiles.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey, debouncedQuery, filters.accountType, filters.industry, reloadToken]);

  const current = result?.key === queryKey ? result : null;
  const profiles = current?.profiles ?? [];
  const error = current?.error ?? null;
  const loading = current === null;

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setDebouncedQuery("");
  };

  const hasActiveFilters =
    filters.q.trim() !== "" ||
    filters.accountType !== "" ||
    filters.industry !== "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Discover creators, brands and businesses
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Search the CreatorConnect directory by name, bio or skills, then
          narrow the results by account type and industry.
        </p>
      </section>

      <SearchFilters
        value={filters}
        industries={industries}
        onChange={setFilters}
        onReset={handleReset}
        disabled={loading && profiles.length === 0}
      />

      <div className="mt-6">
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadToken((token) => token + 1)}
          />
        ) : loading ? (
          <LoadingState />
        ) : profiles.length === 0 ? (
          <EmptyState
            title="No profiles match your search"
            description={
              hasActiveFilters
                ? "No creators, brands or businesses match the current search and filters. Try widening your criteria."
                : "There are no profiles in CreatorConnect yet. Create the first one to get started."
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Clear search and filters
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600" role="status">
              Showing {profiles.length}{" "}
              {profiles.length === 1 ? "profile" : "profiles"}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <li key={profile.id}>
                  <ProfileCard profile={profile} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
