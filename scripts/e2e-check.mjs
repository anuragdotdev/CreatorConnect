/**
 * A short browser walkthrough of the two modules, used to verify that the
 * running application works end to end. Run it with:
 *
 *   node scripts/e2e-check.mjs
 *
 * It expects the backend on :4000 and the frontend on :3000.
 */
import { chromium } from "playwright";

const FRONTEND = process.env.FRONTEND_URL ?? "http://localhost:3000";

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({
  channel: "chromium",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(FRONTEND, { waitUntil: "networkidle" });

  // --- Discovery page renders the seeded profiles as cards.
  await page.waitForSelector("article", { timeout: 15000 });
  const cardCount = await page.locator("article").count();
  check("Discovery page renders profile cards", cardCount >= 10, `${cardCount} cards`);

  const hasStudio = await page.getByText("Creator Studio", { exact: true }).count();
  check("Seeded profile 'Creator Studio' is listed", hasStudio > 0);

  // --- Search by keyword, case-insensitively.
  const searchBox = page.getByRole("searchbox", { name: "Search" });
  const typeFilter = page.getByLabel("Account type", { exact: true });
  const industryFilter = page.getByLabel("Industry", { exact: true });

  await searchBox.fill("creator");
  await page.waitForTimeout(1200);
  const afterSearch = await page.locator("article").count();
  const studioFound = await page.getByText("Creator Studio", { exact: true }).count();
  check(
    "Search for 'creator' (lower case) finds 'Creator Studio'",
    studioFound > 0,
    `${afterSearch} results`,
  );

  // --- Filter by account type.
  await searchBox.fill("");
  await typeFilter.selectOption("BRAND");
  await page.waitForTimeout(1200);
  const brandBadges = await page.getByText("Brand", { exact: true }).count();
  check("Account-type filter narrows the results", brandBadges > 0, `${brandBadges} brand results`);

  // --- Filter by industry.
  await typeFilter.selectOption("");
  await industryFilter.selectOption("Technology");
  await page.waitForTimeout(1200);
  const techResults = await page.locator("article").count();
  check("Industry filter narrows the results", techResults > 0 && techResults < cardCount, `${techResults} results`);

  // --- Reset restores the unfiltered listing.
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.waitForTimeout(1200);
  const afterReset = await page.locator("article").count();
  const industryValue = await industryFilter.inputValue();
  check(
    "Reset clears the industry filter and restores the full list",
    industryValue === "" && afterReset === cardCount,
    `industry="${industryValue}", ${afterReset} results`,
  );

  // --- Empty state.
  await searchBox.fill("zzzz-no-such-profile");
  await page.waitForTimeout(1200);
  const emptyVisible = await page.getByText("No profiles match your search").count();
  check("Empty state is shown when nothing matches", emptyVisible > 0);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.waitForTimeout(1000);

  // --- Open a profile detail view. The profile is located through the API so
  // that the check does not depend on the search and filter behaviour.
  const studioId = await fetch(
    "http://localhost:4000/api/profiles?q=Creator%20Studio",
  ).then((response) => response.json());
  const studioProfile = studioId.data.find(
    (profile) => profile.displayName === "Creator Studio",
  );

  await page.goto(`${FRONTEND}/profiles/${studioProfile.id}`, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector("h1", { timeout: 15000 });
  const heading = await page.locator("h1").first().textContent();
  check("Profile detail view opens", heading?.trim() === "Creator Studio", `h1="${heading?.trim()}"`);

  const emailShown = await page.getByText("hello@creatorstudio.io").count();
  check("Detail view shows the profile email", emailShown > 0);

  // --- Edit the profile and confirm the new details appear immediately.
  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/edit/, { timeout: 15000 });
  await page.waitForSelector("#displayName", { timeout: 15000 });
  const newName = `Creator Studio ${Date.now().toString().slice(-5)}`;
  await page.fill("#displayName", newName);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/\/profiles\/[^/]+$/, { timeout: 15000 });
  await page.waitForTimeout(1500);
  const updatedShown = await page.getByRole("heading", { name: newName }).count();
  check("Edited profile shows the new details immediately", updatedShown > 0, newName);

  // --- Restore the original name.
  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForSelector("#displayName", { timeout: 15000 });
  await page.fill("#displayName", "Creator Studio");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(/\/profiles\/[^/]+$/, { timeout: 15000 });
  await page.waitForTimeout(1200);

  // --- Delete confirmation dialog.
  await page.getByRole("button", { name: "Delete" }).click();
  await page.waitForSelector("[role=dialog]", { timeout: 5000 });
  const dialogText = await page.locator("[role=dialog]").textContent();
  check(
    "Delete confirmation dialog names the profile",
    dialogText?.includes("Creator Studio") ?? false,
  );
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.waitForTimeout(500);
  const stillThere = await page.getByRole("heading", { name: "Creator Studio" }).count();
  check("Cancelling the dialog keeps the profile", stillThere > 0);

  // --- Create a profile through the form.
  await page.goto(`${FRONTEND}/profiles/new`, { waitUntil: "networkidle" });
  const unique = `Browser Test ${Date.now()}`;
  const uniqueEmail = `browser-${Date.now()}@example.com`;
  await page.fill("#displayName", unique);
  await page.fill("#email", uniqueEmail);
  await page.fill("#industry", "Testing");
  await page.fill("#bio", "Created by the browser walkthrough.");
  await page.fill("#skills", "Testing, QA");
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.waitForURL(/\/profiles\/[^/]+$/, { timeout: 15000 });
  await page.waitForTimeout(1000);
  const created = await page.getByRole("heading", { name: unique }).count();
  check("A new profile can be created through the form", created > 0, unique);

  // --- The new profile is removed again so the demo data stays clean.
  await page.getByRole("button", { name: "Delete" }).click();
  await page.waitForSelector("[role=dialog]", { timeout: 5000 });
  await page.getByRole("button", { name: "Delete profile" }).click();
  await page.waitForTimeout(1500);

  // --- Field level validation.
  await page.goto(`${FRONTEND}/profiles/new`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.waitForTimeout(500);
  const nameError = await page.getByText("Display name is required").count();
  const emailError = await page.getByText("Email is required").count();
  check(
    "Field-level validation messages are shown",
    nameError > 0 && emailError > 0,
  );

  // --- Mobile layout.
  await page.setViewportSize({ width: 375, height: 780 });
  await page.goto(FRONTEND, { waitUntil: "networkidle" });
  await page.waitForSelector("article", { timeout: 15000 });
  const cards = page.locator("article");
  const firstBox = await cards.first().boundingBox();
  const secondBox = await cards.nth(1).boundingBox();
  const stacked = secondBox === null || secondBox.y > firstBox.y;
  check("Cards stack in a single column on mobile", stacked);

  // --- Screenshots for the documentation.
  const screenshotDir = process.env.SCREENSHOT_DIR;
  if (screenshotDir) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(FRONTEND, { waitUntil: "networkidle" });
    await page.waitForSelector("article", { timeout: 15000 });
    await page.screenshot({ path: `${screenshotDir}/discovery.png`, fullPage: false });

    await page.goto(`${FRONTEND}/profiles/${studioProfile.id}`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("h1", { timeout: 15000 });
    await page.screenshot({ path: `${screenshotDir}/profile-detail.png`, fullPage: false });

    await page.goto(`${FRONTEND}/profiles/new`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Create profile" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/validation.png`, fullPage: false });
    console.log(`Screenshots written to ${screenshotDir}`);
  }
} catch (error) {
  check("Browser walkthrough completed without errors", false, String(error));
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length === 0 ? 0 : 1);
