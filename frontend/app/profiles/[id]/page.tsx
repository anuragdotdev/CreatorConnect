import { Suspense } from "react";
import { ProfileDetailRoute } from "@/components/ProfileDetailRoute";
import { LoadingState } from "@/components/StateViews";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Suspense fallback={<LoadingState label="Loading profile…" />}>
        <ProfileDetailRoute params={params} />
      </Suspense>
    </div>
  );
}
