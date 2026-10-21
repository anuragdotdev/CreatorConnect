/** Loading placeholder shown while a request is in flight. */
export function LoadingState({ label = "Loading profiles…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

/** Friendly empty state shown when a query returns no profiles. */
export function EmptyState({
  title = "No profiles found",
  description = "Try a different search term or clear your filters to see more results.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 ring-1 ring-slate-200"
      >
        🔍
      </span>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="max-w-md text-sm text-slate-600">{description}</p>
      {action}
    </div>
  );
}

/** Error banner shown when a request could not be completed. */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 className="text-sm font-semibold text-red-900">{title}</h2>
        <p className="mt-1 text-sm text-red-700">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** Inline success banner used after a create, update or delete. */
export function SuccessState({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
    >
      {message}
    </div>
  );
}
