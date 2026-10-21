import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SearchFilters, EMPTY_FILTERS } from "@/components/SearchFilters";

function Harness({ onReset }: { onReset?: () => void }) {
  const [value, setValue] = useState(EMPTY_FILTERS);
  return (
    <SearchFilters
      value={value}
      industries={["Technology", "Fashion"]}
      onChange={setValue}
      onReset={() => {
        setValue(EMPTY_FILTERS);
        onReset?.();
      }}
    />
  );
}

describe("SearchFilters", () => {
  it("renders the search field and both filters", () => {
    render(<Harness />);

    expect(screen.getByLabelText("Search")).toBeTruthy();
    expect(screen.getByLabelText("Account type")).toBeTruthy();
    expect(screen.getByLabelText("Industry")).toBeTruthy();
  });

  it("clears the industry filter when Reset is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<Harness onReset={onReset} />);

    const industrySelect = screen.getByLabelText(
      "Industry",
    ) as HTMLSelectElement;

    await user.selectOptions(industrySelect, "Technology");
    expect(industrySelect.value).toBe("Technology");

    await user.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(industrySelect.value).toBe("");
  });

  it("clears the account type and keyword when Reset is clicked", async () => {
    const user = userEvent.setup();

    render(<Harness />);

    const searchInput = screen.getByLabelText("Search") as HTMLInputElement;
    const accountTypeSelect = screen.getByLabelText(
      "Account type",
    ) as HTMLSelectElement;

    await user.type(searchInput, "studio");
    await user.selectOptions(accountTypeSelect, "BRAND");
    expect(searchInput.value).toBe("studio");
    expect(accountTypeSelect.value).toBe("BRAND");

    await user.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(searchInput.value).toBe("");
    expect(accountTypeSelect.value).toBe("");
  });

  it("disables the Reset button when no filter is active", () => {
    render(<Harness />);

    const resetButton = screen.getByRole("button", { name: "Reset filters" });
    expect((resetButton as HTMLButtonElement).disabled).toBe(true);
  });
});
