import { Prisma } from "@prisma/client";
import type { Profile } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/api-error.js";
import type {
  CreateProfileInput,
  ListProfilesQuery,
  UpdateProfileInput,
} from "../schemas/profile.js";

/**
 * Resolves the ids of profiles matching the supplied filters.
 *
 * The keyword is matched against the display name, the bio and the skills of a
 * profile. Matching is case-insensitive: the stored column and the search term
 * are both lower-cased before the comparison.
 */
async function findProfileIdsByFilters(query: ListProfilesQuery): Promise<string[]> {
  const keyword = query.q?.trim();

  const conditions: Prisma.Sql[] = [];

  if (keyword) {
    conditions.push(Prisma.sql`
      (
        instr(lower(displayName), lower(${keyword})) > 0
        OR instr(lower(bio), lower(${keyword})) > 0
        OR instr(lower(skills), lower(${keyword})) > 0
      )
    `);
  }

  if (query.accountType) {
    conditions.push(Prisma.sql`accountType = ${query.accountType}`);
  }

  if (query.industry) {
    conditions.push(Prisma.sql`lower(industry) = lower(${query.industry})`);
  }

  const whereClause =
    conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.sql``;

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id FROM "Profile" ${whereClause}
  `);

  return rows.map((row) => row.id);
}

/** Lists profiles, optionally narrowed by a keyword, account type and industry. */
export async function listProfiles(query: ListProfilesQuery): Promise<Profile[]> {
  const ids = await findProfileIdsByFilters(query);
  if (ids.length === 0) return [];

  return prisma.profile.findMany({
    where: { id: { in: ids } },
    orderBy: [{ createdAt: "desc" }, { displayName: "asc" }],
  });
}

/** Returns a single profile by id, or throws a 404 ApiError. */
export async function getProfileById(id: string): Promise<Profile> {
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) {
    throw ApiError.notFound(`No profile found with id "${id}"`);
  }
  return profile;
}

/** Creates a new profile. Duplicate emails surface as a 409 ApiError. */
export async function createProfile(data: CreateProfileInput): Promise<Profile> {
  const existing = await prisma.profile.findUnique({ where: { email: data.email } });
  if (existing) {
    throw ApiError.conflict("A profile with this email already exists");
  }

  return prisma.profile.create({ data });
}

/** Updates an existing profile. */
export async function updateProfile(
  id: string,
  data: UpdateProfileInput,
): Promise<Profile> {
  await getProfileById(id);

  if (data.email) {
    const existing = await prisma.profile.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      throw ApiError.conflict("A profile with this email already exists");
    }
  }

  return prisma.profile.update({ where: { id }, data });
}

/** Deletes a profile and returns the deleted record. */
export async function deleteProfile(id: string): Promise<Profile> {
  await getProfileById(id);
  return prisma.profile.delete({ where: { id } });
}

/** Returns the distinct industries present in the database, alphabetically. */
export async function listIndustries(): Promise<string[]> {
  const rows = await prisma.profile.findMany({
    select: { industry: true },
    distinct: ["industry"],
    orderBy: { industry: "asc" },
  });
  return rows.map((row) => row.industry);
}
