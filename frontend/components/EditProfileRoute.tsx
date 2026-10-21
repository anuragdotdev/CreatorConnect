"use client";

import { use } from "react";
import { EditProfileForm } from "@/components/EditProfileForm";

/** Resolves the route parameter and renders the edit form. */
export function EditProfileRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditProfileForm id={id} />;
}
