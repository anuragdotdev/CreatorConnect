import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

export const app = createApp();

export const api = () => request(app);

/** Removes every profile so each test starts from a known state. */
export async function clearProfiles(): Promise<void> {
  await prisma.profile.deleteMany();
}

export const validProfile = {
  displayName: "Test Creator",
  email: "test.creator@example.com",
  accountType: "CREATOR" as const,
  industry: "Technology",
  bio: "A test creator used by the automated test suite.",
  skills: "Testing, TypeScript",
  portfolioUrl: "https://example.com",
};

export async function createProfile(overrides: Record<string, unknown> = {}) {
  const response = await api()
    .post("/api/profiles")
    .send({ ...validProfile, ...overrides });
  return response;
}
