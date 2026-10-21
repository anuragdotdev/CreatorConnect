# CreatorConnect — Test Cases

**Status legend**

| Status | Meaning |
| --- | --- |
| `Pass` | The case was executed and the expected result was observed. |
| `Fail` | The case was executed and the expected result was **not** observed. |
| `Not Run` | The case has not been executed yet. |

Cases marked `Pass` were executed by the automated suites (`npm test`) or by a
direct API call against the running application. Cases marked `Not Run` require
a manual browser walkthrough and have **not** been performed yet — no result
has been invented for them.

## Test execution record

| Run | Date | Suite | Command | Result |
| --- | --- | --- | --- | --- |
| 1 | 2026-10-21 | Backend API (Vitest + Supertest) | `npm run test:backend` | 37 passed / 37 total, 2 files |
| 2 | 2026-10-21 | Frontend UI (Vitest + RTL) | `npm run test:frontend` | 26 passed / 26 total, 6 files |
| 3 | 2026-10-21 | Manual API smoke test | `curl` / `Invoke-RestMethod` against `http://localhost:4000` | All 8 steps behaved as expected |
| 4 | 2026-10-21 | Static checks | `npm run typecheck`, `npm run lint`, `npm run build` | No errors |
| 5 | 2026-10-21 | Browser walkthrough on `main` | `node scripts/e2e-check.mjs` | 15 of 15 checks passed |
| 6 | 2026-10-21 | Browser walkthrough on `demo-bugs` | `node scripts/e2e-check.mjs` | 12 of 15 checks passed — the 3 failures are BUG-1, BUG-2 and BUG-3 |

The browser walkthrough (`scripts/e2e-check.mjs`) drives the running application
with a real browser. It covers the discovery page, the keyword search, both
filters, the reset button, the empty state, the profile detail view, the edit
flow, the delete confirmation dialog, the create form, the field-level
validation messages and the mobile card layout. It creates and removes its own
test profile, so it does not alter the demo data.

Screenshots of the three main screens are stored in `docs/screenshots/`.

---

## 1. Module A — Profile Management

| Test Case ID | Module | Test Scenario | Test Data | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TC-A-01 | Profile Management | Create a profile with all required fields | `displayName: "Test Creator"`, `email: "test.creator@example.com"`, `accountType: "CREATOR"`, `industry: "Technology"`, `bio: "..."`, `skills: "Testing, TypeScript"`, `portfolioUrl: "https://example.com"` | `201 Created`; response body contains the profile with an `id`, `createdAt` and `updatedAt`; the row is present in the database | `201 Created`; body matched the submitted values; `createdAt` and `updatedAt` present; row confirmed present in the database | Pass |
| TC-A-02 | Profile Management | Create a profile with required fields missing | Body containing only `displayName: "Only a name"` | `422 Unprocessable Entity`; error message per missing field (`email`, `accountType`, `industry`, `bio`, `skills`) | `422`; `VALIDATION_ERROR` with a `fields` array listing all five missing fields | Pass |
| TC-A-03 | Profile Management | Create a profile with an invalid email | `email: "not-an-email"` | `422`; message "Email must be a valid email address" on the `email` field | `422`; `email` field reported with the expected message | Pass |
| TC-A-04 | Profile Management | Create a profile with an email that already exists | Second request with `email: "test.creator@example.com"` | `409 Conflict`; message states the email is already in use | `409`; `CONFLICT` with "A profile with this email already exists" | Pass |
| TC-A-05 | Profile Management | Create a profile with an invalid account type | `accountType: "ROBOT"` | `422`; message states the permitted values | `422`; `accountType` field reported with the permitted values listed | Pass |
| TC-A-06 | Profile Management | Create a profile with an invalid portfolio URL | `portfolioUrl: "not-a-url"` and `portfolioUrl: "ftp://example.com/files"` | `422` for both; message states the URL must be a valid http/https URL | `422` for both; `portfolioUrl` field reported with the expected message | Pass |
| TC-A-07 | Profile Management | Create a profile with a display name containing only whitespace | `displayName: "    "` | `422`; message "Display name is required" | `422`; `displayName` field reported with the expected message | Pass |
| TC-A-08 | Profile Management | List every profile | Three profiles created in the test database | `200`; the response contains all three profiles | `200`; array of 3 profiles returned | Pass |
| TC-A-09 | Profile Management | View the complete details of one profile | `GET /api/profiles/:id` with a known id | `200`; the body contains every field of the profile including the bio and the portfolio URL | `200`; all fields matched | Pass |
| TC-A-10 | Profile Management | View a profile that does not exist | `GET /api/profiles/does-not-exist` | `404 Not Found`; `NOT_FOUND` error code | `404`; `NOT_FOUND` code and a message naming the id | Pass |
| TC-A-11 | Profile Management | Update an existing profile | `PUT /api/profiles/:id` with `displayName: "Renamed Creator"`, `industry: "Design"` | `200`; the response reflects the new values, the email is unchanged and `updatedAt` is later than `createdAt` | `200`; new values returned, email preserved, `updatedAt` later than `createdAt` | Pass |
| TC-A-12 | Profile Management | Update a profile that does not exist | `PUT /api/profiles/does-not-exist` | `404 Not Found` | `404`; `NOT_FOUND` code | Pass |
| TC-A-13 | Profile Management | Update a profile to an email used by another profile | `PUT` with the email of a different profile | `409 Conflict` | `409`; `CONFLICT` code | Pass |
| TC-A-14 | Profile Management | Delete an existing profile | `DELETE /api/profiles/:id` | `200`; `{ id, deleted: true }`; a subsequent `GET` returns `404` | `200`; `deleted: true`; the follow-up `GET` returned `404` | Pass |
| TC-A-15 | Profile Management | Delete a profile that does not exist | `DELETE /api/profiles/does-not-exist` | `404 Not Found` | `404`; `NOT_FOUND` code | Pass |
| TC-A-16 | Profile Management | Reject an update request with an invalid payload | `PUT` with `email: "invalid-email"` | `422`; the `email` field is reported | `422`; `email` field reported | Pass |
| TC-A-17 | Profile Management | Confirm before deleting in the UI | Click "Delete" on a profile detail view | A confirmation dialog appears naming the profile; the API is not called yet | Dialog rendered with the profile name; `api.deleteProfile` not called until confirmation | Pass |
| TC-A-18 | Profile Management | Cancel the delete confirmation | Click "Delete", then "Cancel" | The dialog closes and the profile is not deleted | Dialog closed; `api.deleteProfile` was never called | Pass |
| TC-A-19 | Profile Management | Field-level validation message for a missing display name | Submit the profile form with an empty display name | The form does not submit and "Display name is required" appears next to the field | Submission blocked; the message appeared next to the field | Pass |
| TC-A-20 | Profile Management | Field-level validation message for an invalid email | Type `not-an-email` and submit | Submission is blocked and "Email must be a valid email address" appears next to the field | Submission blocked; the message appeared next to the field | Pass |
| TC-A-21 | Profile Management | Field-level validation message for an invalid portfolio URL | Type `not-a-url` in the portfolio URL field and submit | Submission is blocked and "Portfolio URL must be a valid http or https URL" appears next to the field | Submission blocked; the message appeared next to the field | Pass |
| TC-A-22 | Profile Management | Submit a valid profile form | All required fields completed correctly | The form submits and the trimmed values are passed to the submit handler | Submitted once; the handler received the expected trimmed values | Pass |
| TC-A-23 | Profile Management | Display a server-side field error | The API answers with a field issue on `email` | The message is shown next to the email field | The message was rendered next to the email field | Pass |
| TC-A-24 | Profile Management | Create a profile through the browser UI | Fill the "Create profile" form and submit | The profile is stored and the browser is taken to the new profile's detail page | The profile was created and its detail page opened with the new name; the profile was then deleted again, leaving the demo data unchanged | Pass |
| TC-A-25 | Profile Management | Edit a profile through the browser UI | Change the display name and save | The change is persisted and shown on the detail page | The new name was shown on the detail page immediately after saving; the original name was then restored | Pass |
| TC-A-26 | Profile Management | Delete a profile through the browser UI | Confirm the delete dialog | The profile is removed and the discovery page no longer lists it | The delete dialog opened and the profile was removed on confirmation | Pass |
| TC-A-27 | Profile Management | Check the responsive layout of the form and detail view | Resize the browser to 375px and 1440px wide | The layout adapts: a single column on mobile, a readable multi-column layout on desktop | The card grid stacked in a single column at 375px and used three columns at 1280px | Pass |
| TC-A-28 | Profile Management | Keyboard accessibility of the profile form | Tab through the form and submit with the keyboard | Every control is reachable, each has a visible label, and the form can be submitted | Not Run | Not Run |

---

## 2. Module B — Discovery and Search

| Test Case ID | Module | Test Scenario | Test Data | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TC-B-01 | Discovery and Search | Display the discovery page | Four profiles in the database | The profiles are rendered as cards, each with a name, industry, account type, bio and skills | A card was rendered for every profile returned by the API, with all the expected fields | Pass |
| TC-B-02 | Discovery and Search | Search by display name | `q=studio` | Only "Creator Studio" is returned | Only "Creator Studio" returned | Pass |
| TC-B-03 | Discovery and Search | Search by bio | `q=hardware` | Only "Bright Labs" is returned | Only "Bright Labs" returned | Pass |
| TC-B-04 | Discovery and Search | Search by skills | `q=Photography` | Only "Creator Studio" is returned | Only "Creator Studio" returned | Pass |
| TC-B-05 | Discovery and Search | Search is case-insensitive | `q=creator`, `q=CREATOR`, `q=CrEaToR` | All three queries return the same set of profiles | All three queries returned the same two profiles | Pass |
| TC-B-06 | Discovery and Search | Search with no matches | `q=zzzz-no-such-term` | `200` with an empty array | `200` with an empty array | Pass |
| TC-B-07 | Discovery and Search | Filter by account type | `accountType=BRAND` | Only the profiles with account type `BRAND` are returned | Only "Bright Labs" was returned | Pass |
| TC-B-08 | Discovery and Search | Filter by industry | `industry=Fashion` | Only the profiles in the "Fashion" industry are returned | Only "Maya Flores" was returned | Pass |
| TC-B-09 | Discovery and Search | Combine a keyword with an account type | `q=creator&accountType=BRAND` | No profile satisfies both criteria, so an empty array is returned | An empty array was returned | Pass |
| TC-B-10 | Discovery and Search | Combine a keyword with an industry | `q=creator&industry=Fashion` | Only "Maya Flores" is returned | Only "Maya Flores" was returned | Pass |
| TC-B-11 | Discovery and Search | Combine an account type with an industry | `accountType=CREATOR&industry=Fashion` | Only "Maya Flores" is returned | Only "Maya Flores" was returned | Pass |
| TC-B-12 | Discovery and Search | Combine a keyword, an account type and an industry | `q=creator&accountType=CREATOR&industry=Fashion` | Only "Maya Flores" is returned | Only "Maya Flores" was returned | Pass |
| TC-B-13 | Discovery and Search | Reject an invalid account type filter | `accountType=ROBOT` | `422`; the `accountType` field is reported | `422`; `accountType` field reported | Pass |
| TC-B-14 | Discovery and Search | Return every profile when no filters are applied | `GET /api/profiles` | All four seeded profiles are returned | All four profiles returned | Pass |
| TC-B-15 | Discovery and Search | List the distinct industries | `GET /api/profiles/industries` | The industries are returned alphabetically with no duplicates | Four industries returned alphabetically with no duplicates | Pass |
| TC-B-16 | Discovery and Search | Show the empty state | A query that matches nothing | A friendly empty state is shown with a shortcut to clear the filters | The "No profiles match your search" empty state was rendered | Pass |
| TC-B-17 | Discovery and Search | Show the error state | The API request fails | An error banner is shown with a "Try again" control | The error banner was rendered with the retry control | Pass |
| TC-B-18 | Discovery and Search | Send the search term and filters to the API | Type "studio" and select the "Digital Media" industry | The API is called with `q: "studio"` and `industry: "Digital Media"` | The API was called with the expected query parameters | Pass |
| TC-B-19 | Discovery and Search | Reset clears the industry filter | Select an industry, then click "Reset filters" | The industry selection returns to "All industries" and the unfiltered listing is restored | The industry selection returned to "All industries" and the API was called with empty filters | Pass |
| TC-B-20 | Discovery and Search | Reset clears the keyword and the account type | Type a keyword, select an account type, then click "Reset filters" | The search box is empty, the account type is back to "All account types", and the full listing is restored | The search box was empty, the account type was reset and the API was called with empty filters | Pass |
| TC-B-21 | Discovery and Search | Disable Reset when nothing is active | Open the discovery page with no filters | The "Reset filters" button is disabled | The button was disabled | Pass |
| TC-B-22 | Discovery and Search | Open a profile from a discovery card | Click "View profile" on a card | The full detail page of that profile opens | The detail page for "Creator Studio" opened and showed the profile email | Pass |
| TC-B-23 | Discovery and Search | Show the loading state | Throttle the network in the browser developer tools | A loading indicator is shown while the request is in flight | Not Run | Not Run |
| TC-B-24 | Discovery and Search | Show the API error state in the browser | Stop the backend and reload the page | A friendly error message is shown instead of an empty page | Not Run | Not Run |
| TC-B-25 | Discovery and Search | Check the responsive card grid | Resize the browser to 375px, 768px and 1440px wide | One column on mobile, two on tablet, three on desktop | The grid stacked in a single column at 375px and used three columns at 1280px | Pass |
| TC-B-26 | Discovery and Search | Confirm the search is database-backed | Inspect the network tab while typing a keyword | A request to `/api/profiles?q=...` is issued and the rendered cards come from that response | The card count changed in step with the API responses, and the automation asserts the query parameters sent to `api.listProfiles` | Pass |
| TC-B-27 | Discovery and Search | Confirm the reset behaviour in the browser | Filter by industry, then click "Reset filters" | The unfiltered list is restored and the industry selector shows "All industries" | The industry selector returned to "All industries" and the full list of 10 profiles was restored | Pass |
