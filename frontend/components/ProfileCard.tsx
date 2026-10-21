import Link from "next/link";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_STYLES, type Profile } from "@/lib/types";
import { initialsOf, parseSkills } from "@/lib/format";

export function ProfileCard({ profile }: { profile: Profile }) {
  const skills = parseSkills(profile.skills);

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700"
        >
          {initialsOf(profile.displayName)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">
            <Link
              href={`/profiles/${profile.id}`}
              className="hover:text-indigo-700 hover:underline"
            >
              {profile.displayName}
            </Link>
          </h3>
          <p className="truncate text-sm text-slate-500">{profile.industry}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ACCOUNT_TYPE_STYLES[profile.accountType]}`}
        >
          {ACCOUNT_TYPE_LABELS[profile.accountType]}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {profile.bio}
      </p>

      {skills.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <li
              key={skill}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {skill}
            </li>
          ))}
          {skills.length > 4 ? (
            <li className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              +{skills.length - 4}
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-auto pt-4">
        <Link
          href={`/profiles/${profile.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
