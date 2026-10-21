import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiscoveryBrowser } from "@/components/DiscoveryBrowser";
import { clearProfileCache } from "@/lib/profile-cache";
import { api, ApiRequestError } from "@/lib/api";
import type { Profile } from "@/lib/types";

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: "p1",
  displayName: "Creator Studio",
  email: "studio@example.com",
  accountType: "CREATOR",
  industry: "Digital Media",
  bio: "A production studio for short form video.",
  skills: "Video Production, Photography",
  portfolioUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  linkedinUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("DiscoveryBrowser", () => {
  beforeEach(() => {
    clearProfileCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a card for every profile returned by the API", async () => {
    vi.spyOn(api, "listIndustries").mockResolvedValue(["Digital Media"]);
    vi.spyOn(api, "listProfiles").mockResolvedValue([
      profile(),
      profile({ id: "p2", displayName: "Bright Labs", accountType: "BRAND" }),
    ]);

    render(<DiscoveryBrowser />);

    expect(await screen.findByText("Creator Studio")).toBeTruthy();
    expect(await screen.findByText("Bright Labs")).toBeTruthy();
  });

  it("shows the empty state when no profile matches", async () => {
    vi.spyOn(api, "listIndustries").mockResolvedValue([]);
    vi.spyOn(api, "listProfiles").mockResolvedValue([]);

    render(<DiscoveryBrowser />);

    expect(
      await screen.findByText("No profiles match your search"),
    ).toBeTruthy();
  });

  it("shows an error state when the API request fails", async () => {
    vi.spyOn(api, "listIndustries").mockResolvedValue([]);
    vi.spyOn(api, "listProfiles").mockRejectedValue(
      new ApiRequestError(
        "Could not reach the CreatorConnect API.",
        0,
        "NETWORK_ERROR",
      ),
    );

    render(<DiscoveryBrowser />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("Could not reach the CreatorConnect API."),
    ).toBeTruthy();
  });

  it("passes the search term and the filters to the API", async () => {
    const user = userEvent.setup();
    const listProfiles = vi
      .spyOn(api, "listProfiles")
      .mockResolvedValue([profile()]);
    vi.spyOn(api, "listIndustries").mockResolvedValue(["Digital Media"]);

    render(<DiscoveryBrowser />);
    await screen.findByText("Creator Studio");

    await user.type(screen.getByLabelText("Search"), "studio");
    await user.selectOptions(screen.getByLabelText("Industry"), "Digital Media");

    await waitFor(() => {
      expect(listProfiles).toHaveBeenCalledWith(
        expect.objectContaining({ q: "studio", industry: "Digital Media" }),
      );
    });
  });

  it("resets the industry filter and restores the unfiltered listing", async () => {
    const user = userEvent.setup();
    const listProfiles = vi
      .spyOn(api, "listProfiles")
      .mockResolvedValue([profile()]);
    vi.spyOn(api, "listIndustries").mockResolvedValue(["Digital Media"]);

    render(<DiscoveryBrowser />);
    await screen.findByText("Creator Studio");

    const industrySelect = screen.getByLabelText(
      "Industry",
    ) as HTMLSelectElement;
    await user.selectOptions(industrySelect, "Digital Media");

    await waitFor(() => {
      expect(industrySelect.value).toBe("Digital Media");
    });

    await user.click(screen.getByRole("button", { name: "Reset filters" }));

    await waitFor(() => {
      expect(industrySelect.value).toBe("");
    });

    await waitFor(() => {
      expect(listProfiles).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: "", industry: "", accountType: "" }),
      );
    });
  });
});
