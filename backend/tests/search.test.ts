import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { api, clearProfiles, createProfile } from "./helpers.js";
import { prisma } from "../src/lib/prisma.js";

const seed = async () => {
  await createProfile({
    displayName: "Creator Studio",
    email: "creator.studio@example.com",
    accountType: "CREATOR",
    industry: "Digital Media",
    bio: "A production studio for short form video.",
    skills: "Video Production, Photography",
  });
  await createProfile({
    displayName: "Maya Flores",
    email: "maya.flores@example.com",
    accountType: "CREATOR",
    industry: "Fashion",
    bio: "Lifestyle and slow fashion creator.",
    skills: "Fashion, Styling",
  });
  await createProfile({
    displayName: "Bright Labs",
    email: "bright.labs@example.com",
    accountType: "BRAND",
    industry: "Technology",
    bio: "Consumer hardware brand building smart home devices.",
    skills: "Product Marketing, Partnerships",
  });
  await createProfile({
    displayName: "The Verdant Table",
    email: "verdant.table@example.com",
    accountType: "BUSINESS",
    industry: "Food & Beverage",
    bio: "Plant forward restaurant group.",
    skills: "Hospitality, Local Sourcing",
  });
};

const names = (response: { body: { data: Array<{ displayName: string }> } }) =>
  response.body.data.map((profile) => profile.displayName).sort();

describe("Discovery and Search API", () => {
  beforeEach(async () => {
    await clearProfiles();
    await seed();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("keyword search", () => {
    it("searches by display name", async () => {
      const response = await api().get("/api/profiles?q=studio");

      expect(response.status).toBe(200);
      expect(names(response)).toEqual(["Creator Studio"]);
    });

    it("searches by bio", async () => {
      const response = await api().get("/api/profiles?q=hardware");

      expect(names(response)).toEqual(["Bright Labs"]);
    });

    it("searches by skills", async () => {
      const response = await api().get("/api/profiles?q=Photography");

      expect(names(response)).toEqual(["Creator Studio"]);
    });

    it("matches regardless of the case of the search term", async () => {
      const lower = await api().get("/api/profiles?q=creator");
      const upper = await api().get("/api/profiles?q=CREATOR");
      const mixed = await api().get("/api/profiles?q=CrEaToR");

      expect(names(lower)).toEqual(["Creator Studio", "Maya Flores"]);
      expect(names(upper)).toEqual(["Creator Studio", "Maya Flores"]);
      expect(names(mixed)).toEqual(["Creator Studio", "Maya Flores"]);
    });

    it("returns an empty array when nothing matches", async () => {
      const response = await api().get("/api/profiles?q=zzzz-no-such-term");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("filters", () => {
    it("filters by account type", async () => {
      const response = await api().get("/api/profiles?accountType=BRAND");

      expect(names(response)).toEqual(["Bright Labs"]);
    });

    it("filters by industry", async () => {
      const response = await api().get("/api/profiles?industry=Fashion");

      expect(names(response)).toEqual(["Maya Flores"]);
    });

    it("combines a keyword search with an account type filter", async () => {
      const response = await api().get("/api/profiles?q=creator&accountType=BRAND");

      expect(response.body.data).toEqual([]);
    });

    it("combines a keyword search with an industry filter", async () => {
      const response = await api().get("/api/profiles?q=creator&industry=Fashion");

      expect(names(response)).toEqual(["Maya Flores"]);
    });

    it("combines an account type filter with an industry filter", async () => {
      const response = await api().get(
        "/api/profiles?accountType=CREATOR&industry=Fashion",
      );

      expect(names(response)).toEqual(["Maya Flores"]);
    });

    it("combines a keyword, an account type and an industry filter", async () => {
      const response = await api().get(
        "/api/profiles?q=creator&accountType=CREATOR&industry=Fashion",
      );

      expect(names(response)).toEqual(["Maya Flores"]);
    });

    it("returns everything when no filters are supplied", async () => {
      const response = await api().get("/api/profiles");

      expect(response.body.data).toHaveLength(4);
    });

    it("rejects an invalid account type filter", async () => {
      const response = await api().get("/api/profiles?accountType=ROBOT");

      expect(response.status).toBe(422);
      expect(response.body.error.details.fields[0].field).toBe("accountType");
    });
  });

  describe("GET /api/profiles/industries", () => {
    it("returns the distinct industries used by the profiles", async () => {
      const response = await api().get("/api/profiles/industries");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        "Digital Media",
        "Fashion",
        "Food & Beverage",
        "Technology",
      ]);
    });
  });
});
