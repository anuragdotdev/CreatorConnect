import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileDetail } from "@/components/ProfileDetail";
import { EditProfileForm } from "@/components/EditProfileForm";
import { clearProfileCache, getCachedProfile } from "@/lib/profile-cache";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useParams: () => ({ id: "p1" }),
}));

const original: Profile = {
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

const updated: Profile = {
  ...original,
  displayName: "Creator Studio Renamed",
  updatedAt: "2026-02-02T00:00:00.000Z",
};

describe("Profile update refreshes the displayed profile", () => {
  beforeEach(() => {
    clearProfileCache();
    push.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the new details on the profile view straight after an edit", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "getProfile").mockResolvedValue(original);
    const updateProfile = vi
      .spyOn(api, "updateProfile")
      .mockResolvedValue(updated);

    // 1. The user opens the profile and edits it.
    const editView = render(<EditProfileForm id="p1" />);
    const nameInput = await screen.findByLabelText(/Display name/);
    await user.clear(nameInput);
    await user.type(nameInput, "Creator Studio Renamed");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });

    // 2. The user is taken back to the profile view.
    editView.unmount();
    render(<ProfileDetail id="p1" />);

    // 3. The new details are displayed immediately, without a page reload.
    expect(await screen.findByText("Creator Studio Renamed")).toBeTruthy();
    expect(screen.queryByText("Creator Studio")).toBeNull();
  });

  it("keeps the cached profile in step with the saved changes", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "getProfile").mockResolvedValue(original);
    vi.spyOn(api, "updateProfile").mockResolvedValue(updated);

    render(<EditProfileForm id="p1" />);
    const nameInput = await screen.findByLabelText(/Display name/);
    await user.clear(nameInput);
    await user.type(nameInput, "Creator Studio Renamed");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/profiles/p1");
    });

    expect(getCachedProfile("p1")?.displayName).toBe("Creator Studio Renamed");
  });
});
