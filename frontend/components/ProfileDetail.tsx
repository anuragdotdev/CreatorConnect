"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_STYLES,
  type Profile,
} from "@/lib/types";
import { formatDate, initialsOf, parseSkills } from "@/lib/format";
import {
  getCachedProfile,
  invalidateCachedProfile,
  setCachedProfile,
} from "@/lib/profile-cache";
import { DeleteProfileDialog } from "@/components/DeleteProfileDialog";
import { ErrorState, LoadingState } from "@/components/StateViews";

interface LoadedProfile {
  key: string;
  profile: Profile | null;
  error: string | null;
  notFound: boolean;
}

export function ProfileDetail({ id }: { id: string }) {
  const router = useRouter();

  const [reloadToken, setReloadToken] = useState(0);
  const [loaded, setLoaded] = useState<LoadedProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // The key identifies the request that produced the loaded profile.
  const requestKey = `${id}:${reloadToken}`;

  useEffect(() => {
    // The cache is the source of truth for an already visited profile, so the
    // view always shows the current details. An explicit refresh clears the
    // cached copy and reloads it from the API.
    if (reloadToken === 0 && getCachedProfile(id)) return;

    let cancelled = false;

    api
      .getProfile(id)
      .then((result) => {
        if (cancelled) return;
        setCachedProfile(result);
        setLoaded({
          key: requestKey,
          profile: result,
          error: null,
          notFound: false,
        });
      })
      .catch((caught) => {
        if (cancelled) return;
        setLoaded({
          key: requestKey,
          profile: null,
          error:
            caught instanceof ApiRequestError
              ? caught.message
              : "An unexpected error occurred while loading this profile.",
          notFound:
            caught instanceof ApiRequestError && caught.status === 404,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken, requestKey]);

  const handleRefresh = useCallback(() => {
    invalidateCachedProfile(id);
    setReloadToken((token) => token + 1);
  }, [id]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteProfile(id);
      invalidateCachedProfile(id);
      setDeleteOpen(false);
      router.push("/");
      router.refresh();
    } catch (caught) {
      setDeleteError(
        caught instanceof ApiRequestError
          ? caught.message
          : "The profile could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }, [id, router]);

  const cached = reloadToken === 0 ? getCachedProfile(id) : undefined;
  const isLoaded = loaded?.key === requestKey;
  const profile = cached ?? (isLoaded ? loaded.profile : null);
  const error = !cached && isLoaded ? loaded.error : null;
  const notFound = !cached && isLoaded && loaded.notFound;
  const loading = !cached && !isLoaded;

  if (loading) {
    return <LoadingState label="Loading profile…" />;
  }

  if (notFound) {
    return (
      <div>
        <ErrorState
          title="Profile not found"
          message="This profile does not exist, or it has been deleted."
        />
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-700 hover:underline"
          >
            ← Back to discovery
          </Link>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <ErrorState
        message={error ?? "The profile could not be loaded."}
        onRetry={handleRefresh}
      />
    );
  }

  const skills = parseSkills(profile.skills);
  const socialLinks = [
    { label: "Portfolio", href: profile.portfolioUrl },
    { label: "Twitter", href: profile.twitterUrl },
    { label: "Instagram", href: profile.instagramUrl },
    { label: "LinkedIn", href: profile.linkedinUrl },
  ].filter((link) => Boolean(link.href));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-700 hover:underline"
        >
          ← Back to discovery
        </Link>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <article className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-700"
            >
              {initialsOf(profile.displayName)}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{profile.industry}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ACCOUNT_TYPE_STYLES[profile.accountType]}`}
                >
                  {ACCOUNT_TYPE_LABELS[profile.accountType]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href={`/profiles/${profile.id}/edit`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {deleteError ? (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {deleteError}
          </div>
        ) : null}

        <dl className="mt-8 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-1 break-words text-sm text-slate-900">
              {profile.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Industry
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{profile.industry}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bio
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
            {profile.bio}
          </p>
        </div>

        {skills.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Skills and niche
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {socialLinks.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Links
            </h2>
            <ul className="mt-2 flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-700 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <dl className="mt-8 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(profile.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Last updated
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(profile.updatedAt)}
            </dd>
          </div>
        </dl>
      </article>

      <DeleteProfileDialog
        open={deleteOpen}
        profileName={profile.displayName}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
