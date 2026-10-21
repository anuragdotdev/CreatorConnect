import { Suspense } from "react";
import { EditProfileRoute } from "@/components/EditProfileRoute";
import { LoadingState } from "@/components/StateViews";

export default function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Suspense fallback={<LoadingState label="Loading profile…" />}>
        <EditProfileRoute params={params} />
      </Suspense>
    </div>
  );
}
