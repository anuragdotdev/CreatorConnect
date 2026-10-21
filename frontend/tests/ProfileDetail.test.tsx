import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileDetail } from "@/components/ProfileDetail";
import { clearProfileCache, setCachedProfile } from "@/lib/profile-cache";
import { api, ApiRequestError } from "@/lib/api";
import type { Profile } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({ id: "p1" }),
}));

const profile: Profile = {
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
};

describe("ProfileDetail", () => {
  beforeEach(() => {
    clearProfileCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the profile details returned by the API", async () => {
    vi.spyOn(api, "getProfile").mockResolvedValue(profile);

    render(<ProfileDetail id="p1" />);

    expect(await screen.findByText("Creator Studio")).toBeTruthy();
    expect(screen.getByText("studio@example.com")).toBeTruthy();
    // The industry is shown in the header and in the details section.
    expect(screen.getAllByText("Digital Media").length).toBeGreaterThan(0);
  });

  it("shows a not found state for an unknown profile", async () => {
    vi.spyOn(api, "getProfile").mockRejectedValue(
      new ApiRequestError("No profile found", 404, "NOT_FOUND"),
    );

    render(<ProfileDetail id="p1" />);

    expect(await screen.findByText("Profile not found")).toBeTruthy();
  });

  it("shows an error state when the request fails", async () => {
    vi.spyOn(api, "getProfile").mockRejectedValue(
      new ApiRequestError("Could not reach the CreatorConnect API.", 0, "NETWORK_ERROR"),
    );

    render(<ProfileDetail id="p1" />);

    expect(await screen.findByRole("alert")).toBeTruthy();
  });

  it("asks for confirmation before deleting a profile", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getProfile").mockResolvedValue(profile);
    const deleteProfile = vi.spyOn(api, "deleteProfile").mockResolvedValue({
      id: "p1",
      deleted: true,
    });

    render(<ProfileDetail id="p1" />);
    await screen.findByText("Creator Studio");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog.textContent).toContain("Creator Studio");
    expect(deleteProfile).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete profile" }));

    expect(deleteProfile).toHaveBeenCalledWith("p1");
  });

  it("does not delete the profile when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getProfile").mockResolvedValue(profile);
    const deleteProfile = vi.spyOn(api, "deleteProfile").mockResolvedValue({
      id: "p1",
      deleted: true,
    });

    render(<ProfileDetail id="p1" />);
    await screen.findByText("Creator Studio");

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(deleteProfile).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the updated details immediately after a profile has been edited", async () => {
    // The profile was edited, so the cached copy already holds the new details.
    setCachedProfile({ ...profile, displayName: "Creator Studio Renamed" });
    const getProfile = vi.spyOn(api, "getProfile").mockResolvedValue(profile);

    render(<ProfileDetail id="p1" />);

    // The updated name is displayed without waiting for a refetch.
    expect(screen.getByText("Creator Studio Renamed")).toBeTruthy();
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("reloads the profile from the API when Refresh is clicked", async () => {
    const user = userEvent.setup();
    setCachedProfile({ ...profile, displayName: "Stale Name" });
    const getProfile = vi.spyOn(api, "getProfile").mockResolvedValue({
      ...profile,
      displayName: "Fresh Name",
    });

    render(<ProfileDetail id="p1" />);
    expect(screen.getByText("Stale Name")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(await screen.findByText("Fresh Name")).toBeTruthy();
    expect(getProfile).toHaveBeenCalledWith("p1");
  });
});
