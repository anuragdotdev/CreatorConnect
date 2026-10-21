import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditProfileForm } from "@/components/EditProfileForm";
import {
  clearProfileCache,
  getCachedProfile,
  setCachedProfile,
} from "@/lib/profile-cache";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
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

describe("EditProfileForm", () => {
  beforeEach(() => {
    clearProfileCache();
    push.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pre-fills the form with the current profile values", async () => {
    vi.spyOn(api, "getProfile").mockResolvedValue(profile);

    render(<EditProfileForm id="p1" />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Display name/) as HTMLInputElement).value).toBe(
        "Creator Studio",
      );
    });
    expect((screen.getByLabelText(/Email/) as HTMLInputElement).value).toBe(
      "studio@example.com",
    );
  });

  it("refreshes the cached profile after a successful edit", async () => {
    const user = userEvent.setup();

    // The profile was visited before, so the cache holds the previous version.
    setCachedProfile(profile);

    vi.spyOn(api, "getProfile").mockResolvedValue(profile);
    vi.spyOn(api, "updateProfile").mockResolvedValue({
      ...profile,
      displayName: "Creator Studio Renamed",
    });

    render(<EditProfileForm id="p1" />);

    const nameInput = await screen.findByLabelText(/Display name/);
    await user.clear(nameInput);
    await user.type(nameInput, "Creator Studio Renamed");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/profiles/p1");
    });

    // The cached copy must hold the updated details, otherwise the profile
    // view keeps showing the stale information until the page is reloaded.
    expect(getCachedProfile("p1")?.displayName).toBe("Creator Studio Renamed");
  });
});
