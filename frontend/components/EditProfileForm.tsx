"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { ProfileForm } from "@/components/ProfileForm";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { setCachedProfile } from "@/lib/profile-cache";
import { type ProfileFormValues } from "@/lib/validation";
import type { Profile } from "@/lib/types";

function toFormValues(profile: Profile): ProfileFormValues {
  return {
    displayName: profile.displayName,
    email: profile.email,
    accountType: profile.accountType,
    industry: profile.industry,
    bio: profile.bio,
    skills: profile.skills,
    portfolioUrl: profile.portfolioUrl ?? "",
    twitterUrl: profile.twitterUrl ?? "",
    instagramUrl: profile.instagramUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
  };
}

export function EditProfileForm({ id }: { id: string }) {
  const router = useRouter();

  const [loaded, setLoaded] = useState<{
    key: string;
    profile: Profile | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getProfile(id)
      .then((result) => {
        if (cancelled) return;
        setLoaded({ key: id, profile: result, error: null });
      })
      .catch((caught) => {
        if (cancelled) return;
        setLoaded({
          key: id,
          profile: null,
          error:
            caught instanceof ApiRequestError
              ? caught.message
              : "The profile could not be loaded.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (values: ProfileFormValues) => {
    const updated = await api.updateProfile(id, {
      displayName: values.displayName,
      email: values.email,
      accountType: values.accountType,
      industry: values.industry,
      bio: values.bio,
      skills: values.skills,
      portfolioUrl: values.portfolioUrl,
      twitterUrl: values.twitterUrl,
      instagramUrl: values.instagramUrl,
      linkedinUrl: values.linkedinUrl,
    });

    // Update the cached copy so the profile view shows the new details
    // straight away instead of the previous version.
    setCachedProfile(updated);
    setLoaded({ key: id, profile: updated, error: null });
    router.push(`/profiles/${updated.id}`);
  };

  const isLoaded = loaded?.key === id;
  const profile = isLoaded ? loaded.profile : null;
  const error = isLoaded ? loaded.error : null;

  if (!isLoaded) {
    return <LoadingState label="Loading profile…" />;
  }

  if (error || !profile) {
    return (
      <div>
        <ErrorState message={error ?? "The profile could not be loaded."} />
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

  return (
    <div>
      <Link
        href={`/profiles/${profile.id}`}
        className="text-sm font-medium text-indigo-700 hover:underline"
      >
        ← Back to profile
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        Edit {profile.displayName}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Update the details of this profile. Changes are saved to the
        CreatorConnect database immediately.
      </p>

      <div className="mt-6">
        <ProfileForm
          key={profile.id}
          initialValues={toFormValues(profile)}
          submitLabel="Save changes"
          busyLabel="Saving…"
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/profiles/${profile.id}`)}
        />
      </div>
    </div>
  );
}
