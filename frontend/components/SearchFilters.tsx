"use client";

import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from "@/lib/types";

export interface SearchFiltersState {
  q: string;
  accountType: string;
  industry: string;
}

export const EMPTY_FILTERS: SearchFiltersState = {
  q: "",
  accountType: "",
  industry: "",
};

interface SearchFiltersProps {
  value: SearchFiltersState;
  industries: string[];
  onChange: (next: SearchFiltersState) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function SearchFilters({
  value,
  industries,
  onChange,
  onReset,
  disabled = false,
}: SearchFiltersProps) {
  const hasActiveFilters =
    value.q.trim() !== "" || value.accountType !== "" || value.industry !== "";

  return (
    <section
      aria-label="Search and filters"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label
            htmlFor="filter-search"
            className="block text-sm font-medium text-slate-700"
          >
            Search
          </label>
          <input
            id="filter-search"
            type="search"
            value={value.q}
            disabled={disabled}
            placeholder="Search by name, bio or skills…"
            onChange={(event) => onChange({ ...value, q: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label
            htmlFor="filter-account-type"
            className="block text-sm font-medium text-slate-700"
          >
            Account type
          </label>
          <select
            id="filter-account-type"
            value={value.accountType}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...value, accountType: event.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          >
            <option value="">All account types</option>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACCOUNT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-industry"
            className="block text-sm font-medium text-slate-700"
          >
            Industry
          </label>
          <select
            id="filter-industry"
            value={value.industry}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...value, industry: event.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          >
            <option value="">All industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Search and filters run against the CreatorConnect database.
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled || !hasActiveFilters}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}
