"use client";

import { use } from "react";
import { ProfileDetail } from "@/components/ProfileDetail";

/**
 * Resolves the route parameter and renders the profile detail view.
 *
 * The `params` promise is unwrapped with `use` so the route can be prerendered
 * as a static shell and streamed once the parameter is known.
 */
export function ProfileDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProfileDetail id={id} />;
}
