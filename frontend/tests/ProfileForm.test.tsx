import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "@/components/ProfileForm";
import { EMPTY_PROFILE_FORM } from "@/lib/validation";

describe("ProfileForm validation", () => {
  it("shows a field level error when the display name is missing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ProfileForm
        initialValues={EMPTY_PROFILE_FORM}
        submitLabel="Create profile"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText("Display name is required")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a field level error when the email is invalid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ProfileForm
        initialValues={{ ...EMPTY_PROFILE_FORM, displayName: "A Creator" }}
        submitLabel="Create profile"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/Email/), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(
      await screen.findByText("Email must be a valid email address"),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a field level error when the portfolio URL is not a valid URL", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ProfileForm
        initialValues={{ ...EMPTY_PROFILE_FORM, displayName: "A Creator" }}
        submitLabel="Create profile"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/Portfolio URL/), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(
      await screen.findByText("Portfolio URL must be a valid http or https URL"),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a display name containing only whitespace", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ProfileForm
        initialValues={{ ...EMPTY_PROFILE_FORM, displayName: "   " }}
        submitLabel="Create profile"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText("Display name is required")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the trimmed values when the form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ProfileForm
        initialValues={EMPTY_PROFILE_FORM}
        submitLabel="Create profile"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/Display name/), "Creator Studio");
    await user.type(screen.getByLabelText(/Email/), "studio@example.com");
    await user.type(screen.getByLabelText(/Industry/), "Digital Media");
    await user.type(screen.getByLabelText(/Bio/), "A production studio.");
    await user.type(screen.getByLabelText(/Skills/), "Video, Photography");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      displayName: "Creator Studio",
      email: "studio@example.com",
      industry: "Digital Media",
      skills: "Video, Photography",
    });
  });

  it("shows server side field errors returned by the API", () => {
    render(
      <ProfileForm
        initialValues={EMPTY_PROFILE_FORM}
        submitLabel="Create profile"
        serverFieldErrors={{ email: "A profile with this email already exists" }}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByText("A profile with this email already exists"),
    ).toBeTruthy();
  });
});
