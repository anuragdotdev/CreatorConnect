"use client";

import { useEffect, useRef } from "react";

interface DeleteProfileDialogProps {
  open: boolean;
  profileName: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation dialog shown before a profile is deleted. */
export function DeleteProfileDialog({
  open,
  profileName,
  busy = false,
  onConfirm,
  onCancel,
}: DeleteProfileDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="delete-dialog-title"
          className="text-lg font-semibold text-slate-900"
        >
          Delete this profile?
        </h2>
        <p
          id="delete-dialog-description"
          className="mt-2 text-sm text-slate-600"
        >
          <span className="font-medium text-slate-900">{profileName}</span> will
          be permanently removed from CreatorConnect. This action cannot be
          undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
