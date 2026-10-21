"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { ProfileForm } from "@/components/ProfileForm";
import { EMPTY_PROFILE_FORM } from "@/lib/validation";

export default function NewProfilePage() {
  const router = useRouter();
  const [created, setCreated] = useState<string | null>(null);

  const handleSubmit = async (values: typeof EMPTY_PROFILE_FORM) => {
    const profile = await api.createProfile({
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

    setCreated(profile.displayName);
    router.push(`/profiles/${profile.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Create a profile
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Add a creator, brand or business profile so others can find you in the
        directory.
      </p>

      {created ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {created} was created successfully.
        </p>
      ) : null}

      <div className="mt-6">
        <ProfileForm
          initialValues={EMPTY_PROFILE_FORM}
          submitLabel="Create profile"
          busyLabel="Creating…"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/")}
        />
      </div>
    </div>
  );
}
