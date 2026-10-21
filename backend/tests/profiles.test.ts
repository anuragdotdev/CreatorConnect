import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { api, clearProfiles, createProfile, validProfile } from "./helpers.js";
import { prisma } from "../src/lib/prisma.js";

describe("Profile Management API", () => {
  beforeEach(async () => {
    await clearProfiles();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/profiles", () => {
    it("creates a profile successfully and returns 201", async () => {
      const response = await createProfile();

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        displayName: validProfile.displayName,
        email: validProfile.email,
        accountType: validProfile.accountType,
        industry: validProfile.industry,
        skills: validProfile.skills,
      });
      expect(response.body.data.id).toBeTruthy();
      expect(response.body.data.createdAt).toBeTruthy();
      expect(response.body.data.updatedAt).toBeTruthy();
    });

    it("persists the profile in the database", async () => {
      await createProfile();

      const stored = await prisma.profile.findUnique({
        where: { email: validProfile.email },
      });

      expect(stored).not.toBeNull();
      expect(stored?.displayName).toBe(validProfile.displayName);
    });

    it("rejects a request with missing required fields", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ displayName: "Only a name" });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");

      const fields = response.body.error.details.fields.map(
        (issue: { field: string }) => issue.field,
      );
      expect(fields).toContain("email");
      expect(fields).toContain("accountType");
      expect(fields).toContain("industry");
      expect(fields).toContain("bio");
      expect(fields).toContain("skills");
    });

    it("rejects a missing display name", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, displayName: undefined });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("displayName");
    });

    it("rejects a display name containing only whitespace", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, displayName: "    " });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].message).toContain(
        "Display name is required",
      );
    });

    it("rejects an invalid email format", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, email: "not-an-email" });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("email");
      expect(response.body.error.details.fields[0].message).toContain(
        "valid email address",
      );
    });

    it("rejects a duplicate email with 409", async () => {
      await createProfile();

      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, displayName: "Another Person" });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("CONFLICT");
      expect(response.body.error.message).toContain("already exists");
    });

    it("rejects an invalid account type", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, accountType: "ROBOT" });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("accountType");
    });

    it("rejects an invalid portfolio URL", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, portfolioUrl: "not-a-url" });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("portfolioUrl");
    });

    it("rejects a non http/https portfolio URL", async () => {
      const response = await api()
        .post("/api/profiles")
        .send({ ...validProfile, portfolioUrl: "ftp://example.com/files" });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("portfolioUrl");
    });

    it("accepts a profile without any optional social links", async () => {
      const response = await api().post("/api/profiles").send({
        displayName: "Minimal Profile",
        email: "minimal@example.com",
        accountType: "BRAND",
        industry: "Retail",
        bio: "A minimal but complete profile.",
        skills: "Retail",
      });

      expect(response.status).toBe(201);
      expect(response.body.data.portfolioUrl).toBeNull();
    });
  });

  describe("GET /api/profiles", () => {
    beforeEach(async () => {
      await createProfile({ email: "one@example.com", displayName: "One" });
      await createProfile({
        email: "two@example.com",
        displayName: "Two",
        accountType: "BRAND",
        industry: "Fashion",
      });
      await createProfile({
        email: "three@example.com",
        displayName: "Three",
        accountType: "BUSINESS",
        industry: "Fashion",
      });
    });

    it("returns every profile", async () => {
      const response = await api().get("/api/profiles");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it("returns an empty list when there are no profiles", async () => {
      await clearProfiles();

      const response = await api().get("/api/profiles");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /api/profiles/:id", () => {
    it("returns the full details of a profile", async () => {
      const created = await createProfile();
      const id = created.body.data.id;

      const response = await api().get(`/api/profiles/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.displayName).toBe(validProfile.displayName);
      expect(response.body.data.bio).toBe(validProfile.bio);
      expect(response.body.data.portfolioUrl).toBe(validProfile.portfolioUrl);
    });

    it("returns 404 for a nonexistent profile", async () => {
      const response = await api().get("/api/profiles/does-not-exist");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PUT /api/profiles/:id", () => {
    it("updates an existing profile", async () => {
      const created = await createProfile();
      const id = created.body.data.id;

      const response = await api()
        .put(`/api/profiles/${id}`)
        .send({ displayName: "Renamed Creator", industry: "Design" });

      expect(response.status).toBe(200);
      expect(response.body.data.displayName).toBe("Renamed Creator");
      expect(response.body.data.industry).toBe("Design");
      expect(response.body.data.email).toBe(validProfile.email);
    });

    it("updates the updatedAt timestamp", async () => {
      const created = await createProfile();
      const id = created.body.data.id;
      const before = created.body.data.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const response = await api()
        .put(`/api/profiles/${id}`)
        .send({ bio: "A brand new bio." });

      expect(new Date(response.body.data.updatedAt).getTime()).toBeGreaterThan(
        new Date(before).getTime(),
      );
    });

    it("rejects an invalid update payload", async () => {
      const created = await createProfile();
      const id = created.body.data.id;

      const response = await api()
        .put(`/api/profiles/${id}`)
        .send({ email: "invalid-email" });

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("email");
    });

    it("returns 404 when updating a nonexistent profile", async () => {
      const response = await api()
        .put("/api/profiles/does-not-exist")
        .send({ displayName: "Nobody" });

      expect(response.status).toBe(404);
    });

    it("rejects an update that duplicates another profile's email", async () => {
      const first = await createProfile({ email: "first@example.com" });
      await createProfile({ email: "second@example.com" });

      const response = await api()
        .put(`/api/profiles/${first.body.data.id}`)
        .send({ email: "second@example.com" });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("CONFLICT");
    });
  });

  describe("DELETE /api/profiles/:id", () => {
    it("deletes an existing profile", async () => {
      const created = await createProfile();
      const id = created.body.data.id;

      const response = await api().delete(`/api/profiles/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({ id, deleted: true });

      const afterDelete = await api().get(`/api/profiles/${id}`);
      expect(afterDelete.status).toBe(404);
    });

    it("returns 404 when deleting a nonexistent profile", async () => {
      const response = await api().delete("/api/profiles/does-not-exist");

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /api/health", () => {
    it("reports a healthy service", async () => {
      const response = await api().get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("ok");
    });
  });
});
