"use client";

import { useState, type FormEvent } from "react";
import { ApiRequestError } from "@/lib/api";
import {
  collectFieldErrors,
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validation";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS, type AccountType } from "@/lib/types";

interface ProfileFormProps {
  initialValues: ProfileFormValues;
  submitLabel: string;
  busyLabel?: string;
  /** Server side field errors, keyed by field name. */
  serverFieldErrors?: Record<string, string>;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function ProfileForm({
  initialValues,
  submitLabel,
  busyLabel = "Saving…",
  serverFieldErrors = {},
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof ProfileFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const parsed = profileFormSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error));
      setFormError("Please correct the highlighted fields and try again.");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.fieldIssues.length > 0) {
          const mapped: Record<string, string> = {};
          for (const issue of error.fieldIssues) {
            if (!mapped[issue.field]) mapped[issue.field] = issue.message;
          }
          setFieldErrors(mapped);
        }
        setFormError(error.message);
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errorFor = (field: keyof ProfileFormValues) =>
    fieldErrors[field] ?? serverFieldErrors[field];

  const inputClass = (field: keyof ProfileFormValues) =>
    [
      "mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2",
      errorFor(field)
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {formError}
        </div>
      ) : null}

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-slate-900">
          Profile details
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-slate-700"
            >
              Display name <span className="text-red-600">*</span>
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={values.displayName}
              onChange={(event) => update("displayName", event.target.value)}
              aria-invalid={Boolean(errorFor("displayName"))}
              aria-describedby={
                errorFor("displayName") ? "displayName-error" : undefined
              }
              className={inputClass("displayName")}
            />
            {errorFor("displayName") ? (
              <p id="displayName-error" className="mt-1 text-xs text-red-600">
                {errorFor("displayName")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              aria-invalid={Boolean(errorFor("email"))}
              aria-describedby={
                errorFor("email") ? "email-error" : undefined
              }
              className={inputClass("email")}
            />
            {errorFor("email") ? (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errorFor("email")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-medium text-slate-700"
            >
              Account type <span className="text-red-600">*</span>
            </label>
            <select
              id="accountType"
              name="accountType"
              value={values.accountType}
              onChange={(event) =>
                update("accountType", event.target.value as AccountType)
              }
              aria-invalid={Boolean(errorFor("accountType"))}
              aria-describedby={
                errorFor("accountType") ? "accountType-error" : undefined
              }
              className={inputClass("accountType")}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errorFor("accountType") ? (
              <p id="accountType-error" className="mt-1 text-xs text-red-600">
                {errorFor("accountType")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-slate-700"
            >
              Industry <span className="text-red-600">*</span>
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              value={values.industry}
              onChange={(event) => update("industry", event.target.value)}
              aria-invalid={Boolean(errorFor("industry"))}
              aria-describedby={
                errorFor("industry") ? "industry-error" : undefined
              }
              className={inputClass("industry")}
            />
            {errorFor("industry") ? (
              <p id="industry-error" className="mt-1 text-xs text-red-600">
                {errorFor("industry")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
            Bio <span className="text-red-600">*</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={values.bio}
            onChange={(event) => update("bio", event.target.value)}
            aria-invalid={Boolean(errorFor("bio"))}
            aria-describedby={errorFor("bio") ? "bio-error" : undefined}
            className={inputClass("bio")}
          />
          {errorFor("bio") ? (
            <p id="bio-error" className="mt-1 text-xs text-red-600">
              {errorFor("bio")}
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-slate-700"
          >
            Skills or creator niche <span className="text-red-600">*</span>
          </label>
          <input
            id="skills"
            name="skills"
            type="text"
            value={values.skills}
            placeholder="Video Production, Photography"
            onChange={(event) => update("skills", event.target.value)}
            aria-invalid={Boolean(errorFor("skills"))}
            aria-describedby={
              errorFor("skills") ? "skills-error" : undefined
            }
            className={inputClass("skills")}
          />
          {errorFor("skills") ? (
            <p id="skills-error" className="mt-1 text-xs text-red-600">
              {errorFor("skills")}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            Separate multiple skills with commas.
          </p>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-slate-900">
          Links <span className="font-normal text-slate-500">(optional)</span>
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["portfolioUrl", "Portfolio URL"],
              ["twitterUrl", "Twitter URL"],
              ["instagramUrl", "Instagram URL"],
              ["linkedinUrl", "LinkedIn URL"],
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-slate-700"
              >
                {label}
              </label>
              <input
                id={field}
                name={field}
                type="url"
                value={values[field]}
                placeholder="https://"
                onChange={(event) => update(field, event.target.value)}
                aria-invalid={Boolean(errorFor(field))}
                aria-describedby={
                  errorFor(field) ? `${field}-error` : undefined
                }
                className={inputClass(field)}
              />
              {errorFor(field) ? (
                <p id={`${field}-error`} className="mt-1 text-xs text-red-600">
                  {errorFor(field)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? busyLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
